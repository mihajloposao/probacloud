// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
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

    // Vraćamo podatke o korisniku (bez lozinke)
    res.json({
      message: 'Uspešno prijavljen!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
});


// Start servera
app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
