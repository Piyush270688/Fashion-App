import { Router } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', (req: AuthRequest, res) => {
  const items = db.prepare(`
    SELECT ci.*, p.name, p.price, p.image_url, p.sizes, c.name as category_name
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE ci.user_id = ?
  `).all(req.userId);

  const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  res.json({ items, total });
});

router.post('/', (req: AuthRequest, res) => {
  const { product_id, quantity = 1, size = 'M' } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });

  const existing = db.prepare(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?'
  ).get(req.userId, product_id, size) as any;

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?')
      .run(quantity, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)')
      .run(req.userId, product_id, quantity, size);
  }

  res.status(201).json({ message: 'Added to cart' });
});

router.put('/:id', (req: AuthRequest, res) => {
  const { quantity } = req.body;
  if (quantity < 1) {
    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  } else {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?')
      .run(quantity, req.params.id, req.userId);
  }
  res.json({ message: 'Cart updated' });
});

router.delete('/:id', (req: AuthRequest, res) => {
  db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ message: 'Removed from cart' });
});

router.delete('/', (req: AuthRequest, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.userId);
  res.json({ message: 'Cart cleared' });
});

export default router;
