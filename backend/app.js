const express = require('express');
const cors = require('cors');
const app = express();
const path = require("path");

app.use(cors());
app.use(express.json());

// Mount route
const matchRoutes = require('./routes/matchRoutes');
const foundRoutes = require("./routes/found");
const lostRoutes = require("./routes/lost");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", lostRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/found', foundRoutes);

// Start server
app.listen(5000, () => {
  console.log('Node.js server running on http://localhost:5000');
});
