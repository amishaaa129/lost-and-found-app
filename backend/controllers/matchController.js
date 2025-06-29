const axios = require('axios');

exports.matchLostItem = async (req, res) => {
  const { description } = req.body;
  console.log("🟡 Received match request for:", description);

  try {
    const response = await axios.post('http://localhost:8000/match', {
      description
    });

    console.log("✅ NLP service responded with:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('❌ Error calling NLP service:', error.message);
    res.status(500).json({ error: 'Failed to match lost item' });
  }
};

