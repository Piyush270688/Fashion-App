const { Router } = require('express');
const { getDb, allRows, getRow } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const db = getDb();
  const items = allRows(db.exec("SELECT w.id, w.created_at, p.id as product_id, p.name, p.price, p.image_url, p.rating, c.name as category_name FROM wishlist w JOIN products p ON w.product_id = p.id JOIN categories c ON p.category_id = c.id WHERE w.user_id = ? ORDER BY w.created_at DESC", [req.userId]));
  res.json(items);
});

router.post('/', (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });
  const db = getDb();
  const existing = getRow(db.exec("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?", [req.userId, product_id]));
  if (existing) return res.status(409).json({ error: 'Already in wishlist' });
  db.run('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [req.userId, product_id]);
  res.status(201).json({ message: 'Added to wishlist' });
});

router.delete('/:productId', (req, res) => {
  const db = getDb();
  db.run('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [req.userId, Number(req.params.productId)]);
  res.json({ message: 'Removed from wishlist' });
});

module.exports = router;
