const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

exports.matchLostItem = async (req, res) => {
  const { name, phone, email, title, description, location } = req.body;
  const image = req.file;
  console.log("[DEBUG] req.file:", req.file); // should not be undefined
  console.log("[DEBUG] req.body:", req.body);

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location || 'Unknown');

    if (image) {
      const imagePath = path.join(__dirname, '..', 'uploads', image.filename);
      console.log('[DEBUG] Attaching image:', imagePath);
      formData.append('image', fs.createReadStream(imagePath), image.originalname);
    } else {
      console.log('[WARN] No image found in req.file');
    }

    const response = await axios.post('http://localhost:8000/api/match', formData, {
      headers: formData.getHeaders()
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('❌ Error calling NLP service:', error.message);
    res.status(500).json({ error: 'Failed to match lost item' });
  }
};
