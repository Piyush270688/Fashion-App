import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname, '..', 'fashion.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      address TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      image_url TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL,
      image_url TEXT DEFAULT '',
      category_id INTEGER NOT NULL,
      sizes TEXT DEFAULT '["S","M","L","XL"]',
      color TEXT DEFAULT '',
      rating REAL DEFAULT 4.0,
      in_stock INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      size TEXT DEFAULT 'M',
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      UNIQUE(user_id, product_id, size)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'confirmed',
      shipping_address TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      size TEXT DEFAULT 'M',
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      UNIQUE(user_id, product_id)
    );
  `);

  // Seed data if empty
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number };
  if (count.c === 0) {
    seedData();
  }
}

function seedData() {
  const insertCategory = db.prepare('INSERT INTO categories (name, image_url) VALUES (?, ?)');
  const categories = [
    ['Dresses & Tops', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
    ['Shoes & Sneakers', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
    ['Bags & Accessories', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'],
    ['Jeans & Bottoms', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400'],
    ['Ethnic Wear', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'],
    ['Watches & Jewelry', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
  ];

  const insertCat = db.transaction(() => {
    for (const [name, url] of categories) {
      insertCategory.run(name, url);
    }
  });
  insertCat();

  const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, image_url, category_id, sizes, color, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const products = [
    // Dresses & Tops (category 1)
    ['Floral Maxi Dress', 'Elegant floral print maxi dress perfect for summer outings', 2499, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', 1, '["XS","S","M","L","XL"]', 'Floral Pink', 4.5],
    ['Classic White Blouse', 'Crisp white cotton blouse with pearl buttons', 1299, 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400', 1, '["XS","S","M","L"]', 'White', 4.3],
    ['Silk Wrap Top', 'Luxurious silk wrap top in emerald green', 1899, 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400', 1, '["S","M","L"]', 'Emerald', 4.6],
    ['Boho Printed Tunic', 'Relaxed fit bohemian printed tunic', 999, 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400', 1, '["S","M","L","XL"]', 'Multi', 4.1],
    ['Off-Shoulder Midi Dress', 'Romantic off-shoulder midi dress in dusty rose', 2199, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400', 1, '["XS","S","M","L"]', 'Dusty Rose', 4.7],

    // Shoes & Sneakers (category 2)
    ['Classic White Sneakers', 'Minimalist white leather sneakers for everyday wear', 3499, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', 2, '["36","37","38","39","40","41","42"]', 'White', 4.8],
    ['Block Heel Sandals', 'Comfortable block heel sandals in nude', 1999, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 2, '["36","37","38","39","40"]', 'Nude', 4.2],
    ['Running Shoes Pro', 'High-performance running shoes with cushioned sole', 4999, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 2, '["37","38","39","40","41","42","43"]', 'Black/Red', 4.6],
    ['Strappy Stilettos', 'Elegant strappy stiletto heels for special occasions', 2799, 'https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?w=400', 2, '["36","37","38","39","40"]', 'Black', 4.4],
    ['Canvas Slip-Ons', 'Casual canvas slip-on shoes in navy', 1299, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400', 2, '["37","38","39","40","41","42"]', 'Navy', 4.0],

    // Bags & Accessories (category 3)
    ['Leather Tote Bag', 'Spacious genuine leather tote in tan', 3999, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', 3, '["One Size"]', 'Tan', 4.7],
    ['Crossbody Chain Bag', 'Compact crossbody bag with gold chain strap', 2499, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400', 3, '["One Size"]', 'Black', 4.5],
    ['Silk Scarf', 'Luxurious printed silk scarf', 899, 'https://images.unsplash.com/photo-1601924921557-5c3dbce42c53?w=400', 3, '["One Size"]', 'Multi', 4.3],
    ['Aviator Sunglasses', 'Classic aviator sunglasses with UV protection', 1499, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', 3, '["One Size"]', 'Gold', 4.6],
    ['Canvas Backpack', 'Durable canvas backpack for work and travel', 1799, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 3, '["One Size"]', 'Olive', 4.2],

    // Jeans & Bottoms (category 4)
    ['High-Rise Skinny Jeans', 'Classic high-rise skinny jeans in dark wash', 2299, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400', 4, '["26","28","30","32","34"]', 'Dark Blue', 4.4],
    ['Wide-Leg Palazzo Pants', 'Flowing wide-leg palazzo pants in black', 1599, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400', 4, '["S","M","L","XL"]', 'Black', 4.3],
    ['Distressed Boyfriend Jeans', 'Relaxed fit distressed boyfriend jeans', 1999, 'https://images.unsplash.com/photo-1475178626620-a4d074967571?w=400', 4, '["26","28","30","32","34"]', 'Light Blue', 4.1],
    ['Pleated Midi Skirt', 'Elegant pleated midi skirt in olive green', 1399, 'https://images.unsplash.com/photo-1583496661160-fb5886a0uj9a?w=400', 4, '["XS","S","M","L"]', 'Olive', 4.5],
    ['Cargo Joggers', 'Comfortable cargo joggers with multiple pockets', 1699, 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400', 4, '["S","M","L","XL"]', 'Khaki', 4.0],

    // Ethnic Wear (category 5)
    ['Embroidered Kurti', 'Hand-embroidered cotton kurti with mirror work', 1499, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', 5, '["S","M","L","XL","XXL"]', 'Blue', 4.6],
    ['Banarasi Silk Saree', 'Traditional Banarasi silk saree with gold zari', 5999, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', 5, '["One Size"]', 'Red/Gold', 4.9],
    ['Anarkali Suit Set', 'Floor-length anarkali suit with dupatta', 3499, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', 5, '["S","M","L","XL"]', 'Maroon', 4.7],
    ['Cotton Palazzo Kurta Set', 'Breezy cotton kurta with matching palazzo pants', 1799, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', 5, '["S","M","L","XL"]', 'Yellow', 4.3],
    ['Chikankari Kurta', 'Lucknowi chikankari embroidered kurta', 2199, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', 5, '["S","M","L","XL"]', 'White', 4.5],

    // Watches & Jewelry (category 6)
    ['Minimalist Watch', 'Sleek minimalist watch with leather strap', 2999, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 6, '["One Size"]', 'Silver', 4.6],
    ['Layered Gold Necklace', 'Delicate layered gold-plated necklace', 799, 'https://images.unsplash.com/photo-1515562141589-67f0d872ce88?w=400', 6, '["One Size"]', 'Gold', 4.4],
    ['Statement Earrings', 'Bold geometric statement earrings', 599, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 6, '["One Size"]', 'Gold', 4.2],
    ['Chronograph Watch', 'Stainless steel chronograph with date display', 4499, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400', 6, '["One Size"]', 'Black', 4.8],
    ['Pearl Bracelet Set', 'Set of 3 freshwater pearl bracelets', 1199, 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400', 6, '["One Size"]', 'Pearl', 4.3],
  ];

  const insertProd = db.transaction(() => {
    for (const p of products) {
      insertProduct.run(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7]);
    }
  });
  insertProd();

  console.log('Database seeded with categories and products');
}

export default db;
