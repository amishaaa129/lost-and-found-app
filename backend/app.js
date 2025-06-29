const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mount route
const matchRoutes = require('./routes/matchRoutes');
app.use('/api', matchRoutes);

// Start server
app.listen(5000, () => {
  console.log('Node.js server running on http://localhost:5000');
});
