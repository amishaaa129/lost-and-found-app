const express = require('express');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const itemRoutes = require('./routes/items');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/items', itemRoutes);

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port 5000`)
);
