import { Router } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.post('/', (req: AuthRequest, res) => {
  const { shipping_address } = req.body;

  const cartItems = db.prepare(`
    SELECT ci.*, p.price FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).all(req.userId) as any[];

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = db.transaction(() => {
    const orderResult = db.prepare(
      'INSERT INTO orders (user_id, total, shipping_address) VALUES (?, ?, ?)'
    ).run(req.userId, total, shipping_address || '');

    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, quantity, size, price) VALUES (?, ?, ?, ?, ?)'
    );
    for (const item of cartItems) {
      insertItem.run(orderId, item.product_id, item.quantity, item.size, item.price);
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.userId);

    return orderId;
  });

  const orderId = placeOrder();
  res.status(201).json({ message: 'Order placed', orderId, total });
});

router.get('/', (req: AuthRequest, res) => {
  const orders = db.prepare(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.userId) as any[];

  for (const order of orders) {
    order.items = db.prepare(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);
  }

  res.json(orders);
});

router.get('/:id', (req: AuthRequest, res) => {
  const order = db.prepare(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId) as any;

  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.items = db.prepare(`
    SELECT oi.*, p.name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `).all(order.id);

  res.json(order);
});

export default router;
