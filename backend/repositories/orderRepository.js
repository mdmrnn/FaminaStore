import { db } from "../database/index.js";

export function insertOrder(order) {
  const insertOrderStatement = db.prepare(`
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertItemStatement = db.prepare(`
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      total_price
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  db.exec("BEGIN");

  try {
    insertOrderStatement.run(
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
    );

    for (const item of order.items) {
      insertItemStatement.run(
        order.id,
        item.productId,
        item.name,
        item.quantity,
        item.unitPrice,
        item.totalPrice,
      );
    }

    db.exec("COMMIT");
    return order;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
