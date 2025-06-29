const express = require('express');
const router = express.Router();
const { matchLostItem } = require('../controllers/matchController');

router.post('/match', matchLostItem);

module.exports = router;
