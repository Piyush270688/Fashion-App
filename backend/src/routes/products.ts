import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', (req, res) => {
  const {
    category,
    search,
    sort = 'newest',
    page = '1',
    limit = '20',
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (category) {
    where += ' AND p.category_id = ?';
    params.push(Number(category));
  }
  if (search) {
    where += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  let orderBy = 'ORDER BY p.created_at DESC';
  if (sort === 'price_asc') orderBy = 'ORDER BY p.price ASC';
  else if (sort === 'price_desc') orderBy = 'ORDER BY p.price DESC';
  else if (sort === 'rating') orderBy = 'ORDER BY p.rating DESC';

  const countResult = db.prepare(
    `SELECT COUNT(*) as total FROM products p ${where}`
  ).get(...params) as { total: number };

  const products = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ${where}
    ${orderBy}
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), offset);

  res.json({
    products,
    total: countResult.total,
    page: Number(page),
    totalPages: Math.ceil(countResult.total / Number(limit)),
  });
});

router.get('/featured', (_req, res) => {
  const products = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.rating >= 4.5
    ORDER BY p.rating DESC
    LIMIT 10
  `).all();
  res.json(products);
});

router.get('/recommendations', (req, res) => {
  const { category_id, exclude_id } = req.query;
  let query = `
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.category_id = ?
  `;
  const params: any[] = [Number(category_id) || 1];

  if (exclude_id) {
    query += ' AND p.id != ?';
    params.push(Number(exclude_id));
  }

  query += ' ORDER BY p.rating DESC LIMIT 6';
  const products = db.prepare(query).all(...params);
  res.json(products);
});

router.get('/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(Number(req.params.id));

  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

export default router;
