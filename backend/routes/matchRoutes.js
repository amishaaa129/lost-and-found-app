const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const {matchLostItem} = require('../controllers/matchController');

// Upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads')); // same as used in controller
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/', upload.single('image'), matchLostItem);

module.exports = router;