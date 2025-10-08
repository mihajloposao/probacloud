// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { DECIMAL } = require('sequelize');
const SECRET_KEY = "ovo_je_moj_tajni_kljuc"; // kasnije može iz .env
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

// Dohvatanje proizvoda za trenutno ulogovanog sellera
app.get('/seller/products', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Niste autorizovani' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Niste autorizovani' });

  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY); // isto kao u login ruti
  } catch (err) {
    return res.status(401).json({ error: 'Nevažeći token' });
  }
  const query = 'SELECT * FROM products WHERE user_id = ?';
  db.query(query, [decoded.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Greška servera' });
    res.json(results);
  });
});

// Dodavanje proizvoda sa user_id
app.post('/products', upload.single('image'), (req, res) => {
  const { name, description, price, user_id } = req.body; // dodali user_id
  const imagePath = req.file ? `uploads/${req.file.filename}` : null;

  if (!user_id) {
    return res.status(400).json({ error: "Nije prosleđen user_id" });
  }

  const query = 'INSERT INTO products (name, description, price, image_path, user_id) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, description, price, imagePath, user_id], (err, result) => {
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

// Registracija korisnika (customer ili seller)
app.post('/users/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Provera da li su obavezna polja popunjena
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Sva polja su obavezna!' });
  }

  try {
    // Proveravamo da li korisnik sa istim emailom već postoji
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Greška servera' });

      if (results.length > 0) {
        return res.status(400).json({ error: 'Korisnik već postoji' });
      }

      // Šifrujemo lozinku
      const hashedPassword = await bcrypt.hash(password, 10);

      // role može biti 'seller' ili 'customer' (ako nije poslato, default je 'customer')
      const userRole = role === 'seller' ? 'seller' : 'customer';

      // Ubacujemo korisnika u bazu
      db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, userRole],
        (err, result) => {
          if (err) return res.status(500).json({ error: 'Greška servera' });

          res.json({ message: 'Registracija uspešna!' });
        }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška servera' });
  }
});

// Prijava korisnika
app.post('/users/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Unesite email i lozinku' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Greška servera' });

    if (results.length === 0) {
      return res.status(400).json({ error: 'Neispravan email ili lozinka' });
    }

    const user = results[0];

    // Proveravamo lozinku
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Neispravan email ili lozinka' });
    }

    // nakon što proverimo lozinku
const token = jwt.sign(
  { id: user.id, role: user.role, name: user.name},
  SECRET_KEY,
  { expiresIn: '1h' } // token važi 1 sat
);

res.json({
  message: 'Uspešno prijavljen!',
  token, // dodajemo token
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
  });
  });
});
app.post('/addbalance', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Niste autorizovani' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Niste autorizovani' });

  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return res.status(401).json({ error: 'Nevažeći token' });
  }

  const { amount } = req.body;
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Nevažeći iznos' });
  }

  const query = 'UPDATE users SET balance = balance + ? WHERE id = ?';
  db.query(query, [parseFloat(amount), decoded.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Greška servera' });
    res.json({ message: 'Balance uspešno ažuriran.' });
  });
});

// Ruta za dohvatanje trenutnog balansa ulogovanog korisnika
app.get('/user/balance', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Niste autorizovani' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Niste autorizovani' });

  let decoded;
  try {
    decoded = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return res.status(401).json({ error: 'Nevažeći token' });
  }

  const query = 'SELECT balance FROM users WHERE id = ?';
  db.query(query, [decoded.id], (err, result) => {
    if (err) {
      console.error('Greška prilikom dohvatanja balansa:', err);
      return res.status(500).json({ error: 'Greška servera' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }

    res.json({ balance: result[0].balance });
  });
});

// Start servera
app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
