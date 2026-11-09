import { db } from "../database/index.js";

const zarinpalProvider = "zarinpal";
const orphanedAttemptAgeMs = 2 * 60 * 1000;

export async function prepareZarinpalPaymentAttempt(orderId) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `
        SELECT id, payment_method, payment_status, status, total, mobile
        FROM orders
        WHERE id = $1
        FOR UPDATE
      `,
      [orderId],
    );
    const order = orderResult.rows[0];

    if (!order) {
      await client.query("COMMIT");
      return { kind: "missing" };
    }

    if (order.payment_status === "paid") {
      await client.query("COMMIT");
      return { kind: "already_paid" };
    }

    if (order.status === "cancelled") {
      await client.query("COMMIT");
      return { kind: "cancelled" };
    }

    if (order.payment_method !== zarinpalProvider) {
      await client.query("COMMIT");
      return { kind: "wrong_method" };
    }

    const amountToman = toSafeInteger(order.total, "Order total");
    if (amountToman < 100) {
      await client.query("COMMIT");
      return { kind: "amount_too_small" };
    }
    if (!Number.isSafeInteger(amountToman * 10)) {
      await client.query("COMMIT");
      return { kind: "amount_out_of_range" };
    }

    const latestAttemptResult = await client.query(
      `
        SELECT id, authority, status, amount_toman, created_at
        FROM payment_attempts
        WHERE order_id = $1 AND provider = $2
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        FOR UPDATE
      `,
      [orderId, zarinpalProvider],
    );
    const latestAttempt = latestAttemptResult.rows[0];

    if (latestAttempt?.status === "pending") {
      if (latestAttempt.authority) {
        await client.query("COMMIT");
        return {
          kind: "existing",
          attemptId: latestAttempt.id,
          authority: latestAttempt.authority,
          amountToman: toSafeInteger(
            latestAttempt.amount_toman,
            "Payment amount",
          ),
        };
      }

      const ageMs = Date.now() - new Date(latestAttempt.created_at).getTime();
      if (ageMs < orphanedAttemptAgeMs) {
        await client.query("COMMIT");
        return { kind: "initializing" };
      }

      await client.query(
        `
          UPDATE payment_attempts
          SET status = 'failed'
          WHERE id = $1 AND status = 'pending'
        `,
        [latestAttempt.id],
      );
    }

    const attemptResult = await client.query(
      `
        INSERT INTO payment_attempts (order_id, provider, amount_toman)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [orderId, zarinpalProvider, amountToman],
    );

    await client.query("COMMIT");
    return {
      kind: "created",
      attemptId: attemptResult.rows[0].id,
      orderId,
      amountToman,
      customerMobile: order.mobile,
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function saveZarinpalAuthority(attemptId, authority) {
  const result = await db.query(
    `
      UPDATE payment_attempts
      SET authority = $1
      WHERE id = $2 AND provider = $3 AND status = 'pending'
    `,
    [authority, attemptId, zarinpalProvider],
  );

  return result.rowCount === 1;
}

export async function findZarinpalAttemptById(attemptId) {
  const result = await db.query(
    `
      SELECT
        attempt.id,
        attempt.order_id,
        attempt.authority,
        attempt.amount_toman,
        attempt.status,
        orders.payment_status
      FROM payment_attempts AS attempt
      INNER JOIN orders ON orders.id = attempt.order_id
      WHERE attempt.id = $1 AND attempt.provider = $2
    `,
    [attemptId, zarinpalProvider],
  );
  const attempt = result.rows[0];

  return attempt ? mapAttempt(attempt) : null;
}

export async function findZarinpalAttemptByAuthority(authority) {
  const result = await db.query(
    `
      SELECT
        attempt.id,
        attempt.order_id,
        attempt.authority,
        attempt.amount_toman,
        attempt.status,
        orders.payment_status
      FROM payment_attempts AS attempt
      INNER JOIN orders ON orders.id = attempt.order_id
      WHERE attempt.authority = $1 AND attempt.provider = $2
    `,
    [authority, zarinpalProvider],
  );
  const attempt = result.rows[0];

  return attempt ? mapAttempt(attempt) : null;
}

export async function findLatestPendingZarinpalAttempt(orderId) {
  const result = await db.query(
    `
      SELECT id, order_id, authority, amount_toman, status
      FROM payment_attempts
      WHERE order_id = $1
        AND provider = $2
        AND status = 'pending'
        AND authority IS NOT NULL
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `,
    [orderId, zarinpalProvider],
  );
  const attempt = result.rows[0];

  return attempt ? mapAttempt(attempt) : null;
}

export async function markZarinpalAttemptFailed(attemptId) {
  const result = await db.query(
    `
      UPDATE payment_attempts
      SET status = 'failed'
      WHERE id = $1 AND provider = $2 AND status = 'pending'
    `,
    [attemptId, zarinpalProvider],
  );

  return result.rowCount === 1;
}

export async function markZarinpalAttemptCancelled(attemptId) {
  const result = await db.query(
    `
      UPDATE payment_attempts
      SET status = 'cancelled'
      WHERE id = $1 AND provider = $2 AND status = 'failed'
    `,
    [attemptId, zarinpalProvider],
  );

  return result.rowCount === 1;
}

export async function completeZarinpalPayment(attemptId, referenceId) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const attemptResult = await client.query(
      `
        SELECT attempt.order_id, attempt.status, orders.payment_status
        FROM payment_attempts AS attempt
        INNER JOIN orders ON orders.id = attempt.order_id
        WHERE attempt.id = $1 AND attempt.provider = $2
        FOR UPDATE OF attempt, orders
      `,
      [attemptId, zarinpalProvider],
    );
    const attempt = attemptResult.rows[0];

    if (!attempt) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        UPDATE payment_attempts
        SET
          status = 'paid',
          reference_id = COALESCE($1, reference_id),
          verified_at = COALESCE(verified_at, CURRENT_TIMESTAMP)
        WHERE id = $2 AND provider = $3
      `,
      [referenceId, attemptId, zarinpalProvider],
    );
    await client.query(
      `
        UPDATE orders
        SET payment_status = 'paid'
        WHERE id = $1 AND payment_status <> 'paid'
      `,
      [attempt.order_id],
    );
    await client.query("COMMIT");

    return { orderId: attempt.order_id, paymentStatus: "paid" };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function getOrderPaymentStatus(orderId) {
  const result = await db.query(
    `
      SELECT
        orders.id,
        orders.payment_method,
        orders.payment_status,
        orders.status AS order_status,
        orders.total,
        latest_attempt.status AS attempt_status,
        latest_attempt.reference_id,
        latest_attempt.authority
      FROM orders
      LEFT JOIN LATERAL (
        SELECT status, reference_id, authority
        FROM payment_attempts
        WHERE order_id = orders.id AND provider = $2
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      ) AS latest_attempt ON TRUE
      WHERE orders.id = $1
    `,
    [orderId, zarinpalProvider],
  );
  const order = result.rows[0];

  if (!order) {
    return null;
  }

  return {
    orderId: order.id,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    orderStatus: order.order_status,
    total: toSafeInteger(order.total, "Order total"),
    attemptStatus: order.attempt_status ?? null,
    referenceId: order.reference_id ?? null,
    canVerify: order.attempt_status === "pending" && Boolean(order.authority),
  };
}

function mapAttempt(attempt) {
  return {
    id: attempt.id,
    orderId: attempt.order_id,
    authority: attempt.authority,
    amountToman: toSafeInteger(attempt.amount_toman, "Payment amount"),
    status: attempt.status,
    paymentStatus: attempt.payment_status ?? null,
  };
}

function toSafeInteger(value, label) {
  const number = Number(value);

  if (!Number.isSafeInteger(number)) {
    throw new Error(`${label} is outside the safe integer range.`);
  }

  return number;
}
