const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

router.post("/lost", upload.single("image"), async (req, res) => {
  const { name, phone, email, title, description } = req.body;
  const image_path = req.file ? req.file.filename : null;

  try {
    const result = await pool.query(
      `INSERT INTO lost_items (name, phone, email, title, description, image_path)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, phone, email, title, description, image_path]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Insert Failed:", err);
    res.status(500).send("Server error");
  }
});

router.get("/lost", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lost_items ORDER BY submitted_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching lost items:", err);
    res.status(500).send("Error retrieving data");
  }
});


module.exports = router;
