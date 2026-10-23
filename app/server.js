const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());
const pool = mysql.createPool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  waitForConnections: true, connectionLimit: 10
});

app.get('/health', (_, res) => res.send('ok'));

app.get('/api/products', async (_, res) => {
  const [rows] = await pool.query('SELECT * FROM products');
  res.json(rows);
});
app.post('/api/products', async (req, res) => {
  const { name, price, stock } = req.body;
  await pool.query('INSERT INTO products(name,price,stock) VALUES (?,?,?)', [name, price, stock]);
  console.log(`[PRODUCT] created ${name}`);
  res.status(201).json({ ok: true });
});
app.get('/api/stock', async (_, res) => {
  const [rows] = await pool.query('SELECT id,name,stock FROM products ORDER BY stock ASC');
  res.json(rows);
});
app.post('/api/invoices', async (req, res) => {
  const { product_id, qty } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[p]] = await conn.query('SELECT price,stock FROM products WHERE id=? FOR UPDATE', [product_id]);
    if (!p || p.stock < qty) { await conn.rollback(); console.log(`[INVOICE] failed product=${product_id}`); return res.status(400).json({ error: 'Khong du hang' }); }
    await conn.query('INSERT INTO invoices(product_id,qty,total) VALUES (?,?,?)', [product_id, qty, p.price * qty]);
    await conn.query('UPDATE products SET stock=stock-? WHERE id=?', [qty, product_id]);
    await conn.commit();
    console.log(`[INVOICE] created product=${product_id} qty=${qty}`);
    res.status(201).json({ ok: true, total: p.price * qty });
  } catch (e) { await conn.rollback(); console.error('[INVOICE] error', e.message); res.status(500).json({ error: 'loi' }); }
  finally { conn.release(); }
});

app.get('/', (_, res) => res.send(`<h1>POS - Quan ly cua hang</h1>
<p><a href="/api/products">San pham</a> | <a href="/api/stock">Ton kho</a></p>`));
app.listen(3000, () => console.log('POS app listening on 3000'));
