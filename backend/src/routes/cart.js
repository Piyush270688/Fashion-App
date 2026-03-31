const { Router } = require('express');
const { getDb, allRows, getRow } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const db = getDb();
  const items = allRows(db.exec("SELECT ci.*, p.name, p.price, p.image_url, p.sizes, c.name as category_name FROM cart_items ci JOIN products p ON ci.product_id = p.id JOIN categories c ON p.category_id = c.id WHERE ci.user_id = ?", [req.userId]));
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ items, total });
});

router.post('/', (req, res) => {
  const { product_id, quantity = 1, size = 'M' } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });
  const db = getDb();
  const existing = getRow(db.exec("SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?", [req.userId, product_id, size]));
  if (existing) {
    db.run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id]);
  } else {
    db.run('INSERT INTO cart_items (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)', [req.userId, product_id, quantity, size]);
  }
  res.status(201).json({ message: 'Added to cart' });
});

router.put('/:id', (req, res) => {
  const { quantity } = req.body;
  const db = getDb();
  if (quantity < 1) {
    db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  } else {
    db.run('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.userId]);
  }
  res.json({ message: 'Cart updated' });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  res.json({ message: 'Removed from cart' });
});

router.delete('/', (req, res) => {
  const db = getDb();
  db.run('DELETE FROM cart_items WHERE user_id = ?', [req.userId]);
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
