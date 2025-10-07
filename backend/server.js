// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // za pristup slikama

// Konekcija sa MySQL bazom
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Test konekcije
db.connect((err) => {
  if (err) {
    console.error('Ne mogu da se povežem na bazu:', err);
  } else {
    console.log('Uspešno povezan na bazu!');
  }
});

// Konfiguracija Multer-a
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Test ruta
app.get('/', (req, res) => {
  res.send('Backend radi! 🎉');
});

// Dohvatanje svih proizvoda
app.get('/products', (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Greška servera' });
    res.json(results);
  });
});

// Dodavanje proizvoda
app.post('/products', upload.single('image'), (req, res) => {
  const { name, description, price } = req.body;
  const imagePath = req.file ? `uploads/${req.file.filename}` : null;

  const query = 'INSERT INTO products (name, description, price, image_path) VALUES (?, ?, ?, ?)';
  db.query(query, [name, description, price, imagePath], (err, result) => {
    if (err) return res.status(500).json({ error: 'Greška servera' });
    res.json({ message: 'Proizvod uspešno dodat!', productId: result.insertId });
  });
});

// Ažuriranje proizvoda sa opcionalnom slikom
app.put('/products/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  if (req.file) {
    const imagePath = `uploads/${req.file.filename}`;
    const query = 'UPDATE products SET name=?, description=?, price=?, image_path=? WHERE id=?';
    db.query(query, [name, description, price, imagePath, id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Greška servera' });
      res.json({ message: 'Proizvod uspešno ažuriran sa slikom!' });
    });
  } else {
    const query = 'UPDATE products SET name=?, description=?, price=? WHERE id=?';
    db.query(query, [name, description, price, id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Greška servera' });
      res.json({ message: 'Proizvod uspešno ažuriran!' });
    });
  }
});

// Brisanje proizvoda
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Greška servera' });
    res.json({ message: 'Proizvod uspešno obrisan!' });
  });
});

// Dohvatanje jednog proizvoda po ID-u
app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM products WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Greška servera' });
    if (results.length === 0) return res.status(404).json({ error: 'Proizvod nije pronađen' });
    res.json(results[0]);
  });
});

// Start servera
app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
