const { Router } = require('express');
const { getDb, allRows, getRow } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

router.post('/', (req, res) => {
  const { shipping_address } = req.body;
  const db = getDb();
  const cartItems = allRows(db.exec("SELECT ci.*, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?", [req.userId]));
  if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  db.run('INSERT INTO orders (user_id, total, shipping_address) VALUES (?, ?, ?)', [req.userId, total, shipping_address || '']);
  const orderRow = getRow(db.exec("SELECT last_insert_rowid() as id"));
  const orderId = orderRow.id;

  for (const item of cartItems) {
    db.run('INSERT INTO order_items (order_id, product_id, quantity, size, price) VALUES (?, ?, ?, ?, ?)', [orderId, item.product_id, item.quantity, item.size, item.price]);
  }
  db.run('DELETE FROM cart_items WHERE user_id = ?', [req.userId]);
  res.status(201).json({ message: 'Order placed', orderId, total });
});

router.get('/', (req, res) => {
  const db = getDb();
  const orders = allRows(db.exec("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [req.userId]));
  for (const order of orders) {
    order.items = allRows(db.exec("SELECT oi.*, p.name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?", [order.id]));
  }
  res.json(orders);
});

module.exports = router;
