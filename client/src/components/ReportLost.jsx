import React, { useState } from 'react';
import './ReportLost.css';

function ReportLost() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    title: '',
    description: ''
  });

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMatches([]);

  const formDataToSend = new FormData();
  Object.entries(formData).forEach(([key, value]) =>
    formDataToSend.append(key, value)
  );
  if (image) formDataToSend.append("image", image);

  try {
    // Save to DB (with image)
    await fetch("http://localhost:5000/api/lost", {
      method: "POST",
      body: formDataToSend
    });

    // Fetch matches using only the description
    const res = await fetch("http://localhost:5000/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: formData.description })
    });

    const data = await res.json();
    setMatches(data.matches || []);
  } catch (err) {
    console.error("Submit failed:", err);
  } finally {
    setLoading(false);
  }
};

const handleImageChange = (e) => setImage(e.target.files[0]);

  return (
    <div className="form-container">
      <h1>POST REQUEST FOR A LOST ITEM.</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="NAME" value={formData.name} onChange={handleChange} required />
        <input type="text" name="phone" placeholder="PHONE" value={formData.phone} onChange={handleChange} required />
        <input type="email" name="email" placeholder="EMAIL" value={formData.email} onChange={handleChange} required />
        <input type="text" name="title" placeholder="TITLE" value={formData.title} onChange={handleChange} required />
        <input type="text" name="description" placeholder="DESCRIPTION" value={formData.description} onChange={handleChange} required />
        <input type="file" onChange={handleImageChange} accept="image/*" />
        <button type="submit">POST</button>
      </form>

      {loading && <p style={{ color: 'yellow', marginTop: '20px' }}>Finding matches...</p>}

      {matches.length > 0 && (
        <div className="matches">
          <h2>Top Matches</h2>
          <ul>
            {matches.map((match, index) => (
              <li key={index}>
                <strong>{match.description}</strong><br />
                Location: {match.location}<br />
                Similarity Score: {match.score}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ReportLost;
