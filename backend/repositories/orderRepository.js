import { db } from "../database/index.js";

export async function findRecentOrders(limit = 100) {
  const orderResult = await db.query(
    `
      SELECT
        id,
        full_name,
        mobile,
        province,
        city,
        address,
        delivery_note,
        shipping_method,
        payment_method,
        payment_status,
        subtotal,
        shipping_cost,
        total,
        status,
        created_at
      FROM orders
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `,
    [limit],
  );
  const orderIds = orderResult.rows.map((order) => order.id);

  if (orderIds.length === 0) {
    return [];
  }

  const itemResult = await db.query(
    `
      SELECT order_id, product_id, product_name, quantity, unit_price, total_price
      FROM order_items
      WHERE order_id = ANY($1::text[])
      ORDER BY order_id, id
    `,
    [orderIds],
  );
  const itemsByOrderId = new Map();

  for (const item of itemResult.rows) {
    const orderItems = itemsByOrderId.get(item.order_id) ?? [];
    orderItems.push({
      productId: item.product_id,
      name: item.product_name,
      quantity: item.quantity,
      unitPrice: toSafeInteger(item.unit_price, "Order item unit price"),
      totalPrice: toSafeInteger(item.total_price, "Order item total price"),
    });
    itemsByOrderId.set(item.order_id, orderItems);
  }

  return orderResult.rows.map((order) => ({
    id: order.id,
    customer: {
      fullName: order.full_name,
      mobile: order.mobile,
      province: order.province,
      city: order.city,
      address: order.address,
      ...(order.delivery_note ? { deliveryNote: order.delivery_note } : {}),
    },
    items: itemsByOrderId.get(order.id) ?? [],
    shippingMethod: order.shipping_method,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    subtotal: toSafeInteger(order.subtotal, "Order subtotal"),
    shippingCost: toSafeInteger(order.shipping_cost, "Order shipping cost"),
    total: toSafeInteger(order.total, "Order total"),
    status: order.status,
    createdAt: order.created_at,
  }));
}

export async function findOrderState(orderId) {
  const result = await db.query(
    "SELECT status, payment_status FROM orders WHERE id = $1",
    [orderId],
  );
  const order = result.rows[0];

  return order
    ? { status: order.status, paymentStatus: order.payment_status }
    : null;
}

export async function compareAndSetOrderStatus(orderId, currentStatus, nextStatus) {
  const result = await db.query(
    "UPDATE orders SET status = $1 WHERE id = $2 AND status = $3",
    [nextStatus, orderId, currentStatus],
  );

  return result.rowCount === 1;
}

export async function markOrderPaid(orderId) {
  const result = await db.query(
    `
      UPDATE orders
      SET payment_status = 'paid'
      WHERE id = $1 AND payment_status = 'unpaid' AND status <> 'cancelled'
    `,
    [orderId],
  );

  return result.rowCount === 1;
}

export async function insertOrder(order) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `
        INSERT INTO orders (
          id,
          full_name,
          mobile,
          province,
          city,
          address,
          delivery_note,
          shipping_method,
          payment_method,
          subtotal,
          shipping_cost,
          total,
          status,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `,
      [
        order.id,
        order.customer.fullName,
        order.customer.mobile,
        order.customer.province,
        order.customer.city,
        order.customer.address,
        order.customer.deliveryNote ?? null,
        order.shippingMethod,
        order.paymentMethod,
        order.subtotal,
        order.shippingCost,
        order.total,
        order.status,
        order.createdAt,
      ],
    );

    for (const item of order.items) {
      await client.query(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            quantity,
            unit_price,
            total_price
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          order.id,
          item.productId,
          item.name,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
        ],
      );
    }

    await client.query("COMMIT");
    return order;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

function toSafeInteger(value, label) {
  const number = Number(value);

  if (!Number.isSafeInteger(number)) {
    throw new Error(`${label} is outside the safe integer range.`);
  }

  return number;
}
