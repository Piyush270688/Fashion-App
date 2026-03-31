import { Router } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', (req: AuthRequest, res) => {
  const items = db.prepare(`
    SELECT w.id, w.created_at, p.id as product_id, p.name, p.price, p.image_url, p.rating, c.name as category_name
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `).all(req.userId);
  res.json(items);
});

router.post('/', (req: AuthRequest, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });

  try {
    db.prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)').run(req.userId, product_id);
    res.status(201).json({ message: 'Added to wishlist' });
  } catch {
    res.status(409).json({ error: 'Already in wishlist' });
  }
});

router.delete('/:productId', (req: AuthRequest, res) => {
  db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?')
    .run(req.userId, Number(req.params.productId));
  res.json({ message: 'Removed from wishlist' });
});

export default router;
