import { db } from "../database/connection.js";

export async function findCustomerByEmail(email) {
  const result = await db.query(
    `SELECT id, email, password_hash, created_at
     FROM customer_users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function createCustomerAccount({
  email,
  passwordHash,
  sessionTokenHash,
}) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      "DELETE FROM customer_sessions WHERE expires_at <= CURRENT_TIMESTAMP",
    );

    const result = await client.query(
      `INSERT INTO customer_users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, passwordHash],
    );
    const customer = result.rows[0];

    await client.query(
      `INSERT INTO customer_sessions (token_hash, customer_id, expires_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '30 days')`,
      [sessionTokenHash, customer.id],
    );
    await client.query("COMMIT");

    return customer;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function createCustomerSession(customerId, sessionTokenHash) {
  await db.query(
    "DELETE FROM customer_sessions WHERE expires_at <= CURRENT_TIMESTAMP",
  );
  await db.query(
    `INSERT INTO customer_sessions (token_hash, customer_id, expires_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '30 days')`,
    [sessionTokenHash, customerId],
  );
}

export async function findCustomerBySessionHash(sessionTokenHash) {
  const result = await db.query(
    `SELECT customer_users.id, customer_users.email, customer_users.created_at
     FROM customer_sessions
     INNER JOIN customer_users ON customer_users.id = customer_sessions.customer_id
     WHERE customer_sessions.token_hash = $1
       AND customer_sessions.expires_at > CURRENT_TIMESTAMP`,
    [sessionTokenHash],
  );

  return result.rows[0] ?? null;
}

export async function deleteCustomerSession(sessionTokenHash) {
  await db.query("DELETE FROM customer_sessions WHERE token_hash = $1", [
    sessionTokenHash,
  ]);
}
