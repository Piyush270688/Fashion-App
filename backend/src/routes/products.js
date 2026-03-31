const { Router } = require('express');
const { getDb, allRows, getRow } = require('../db');

const router = Router();

router.get('/', (req, res) => {
  const { category, search, sort = 'newest', page = '1', limit = '20' } = req.query;
  const db = getDb();
  let where = 'WHERE 1=1';
  const params = [];
  if (category) { where += ' AND p.category_id = ?'; params.push(Number(category)); }
  if (search) { where += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  let orderBy = 'ORDER BY p.created_at DESC';
  if (sort === 'price_asc') orderBy = 'ORDER BY p.price ASC';
  else if (sort === 'price_desc') orderBy = 'ORDER BY p.price DESC';
  else if (sort === 'rating') orderBy = 'ORDER BY p.rating DESC';
  const offset = (Number(page) - 1) * Number(limit);
  const countResult = getRow(db.exec(`SELECT COUNT(*) as total FROM products p ${where}`, params));
  const total = countResult ? countResult.total : 0;
  const products = allRows(db.exec(`SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id ${where} ${orderBy} LIMIT ? OFFSET ?`, [...params, Number(limit), offset]));
  res.json({ products, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

router.get('/featured', (req, res) => {
  const db = getDb();
  const products = allRows(db.exec("SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.rating >= 4.5 ORDER BY p.rating DESC LIMIT 10"));
  res.json(products);
});

router.get('/recommendations', (req, res) => {
  const { category_id, exclude_id } = req.query;
  const db = getDb();
  const params = [Number(category_id) || 1];
  let query = "SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.category_id = ?";
  if (exclude_id) { query += ' AND p.id != ?'; params.push(Number(exclude_id)); }
  query += ' ORDER BY p.rating DESC LIMIT 6';
  const products = allRows(db.exec(query, params));
  res.json(products);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const product = getRow(db.exec("SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?", [Number(req.params.id)]));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

module.exports = router;
