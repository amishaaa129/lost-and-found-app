// routes/found.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');

// Storage for images
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  }
});

const upload = multer({ storage });

// POST /api/found
router.post('/', upload.single('image'), async (req, res) => {
  const { name, phone, email, title, description, location } = req.body;
  const image_path = req.file ? req.file.filename : null;

  try {
    const result = await pool.query(
      `INSERT INTO found_items (name, phone, email, title, description, location, image_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, phone, email, title, description, location, image_path]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting into DB:", err);
    res.status(500).send("Server error");
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM found_items ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching found items:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
