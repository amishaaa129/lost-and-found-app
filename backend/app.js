const express = require('express');
require('dotenv').config();
const cors = require('cors');
const itemRoutes = require('./routes/items');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/items', itemRoutes);

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
