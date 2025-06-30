import React, { useState } from 'react';
import './ReportLost.css';

function ReportLost() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    title: '',
    description: '',
    location: ''
  });

  const [textMatches, setTextMatches] = useState([]);
  const [imageMatches, setImageMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => setImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTextMatches([]);
    setImageMatches([]);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      formDataToSend.append(key, value)
    );
    if (image) formDataToSend.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/api/match", {
        method: "POST",
        body: formDataToSend
      });

      const data = await res.json();
      setTextMatches(data.text_matches || []);
      setImageMatches(data.image_matches || []);
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-lost-container">
      <h1 className="title">Report a Lost Item</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="lost-form">
        <div className="form-grid">
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="text" name="title" placeholder="Item Title" value={formData.title} onChange={handleChange} required />
          <input type="text" name="description" placeholder="Describe your lost item..." value={formData.description} onChange={handleChange} required />
          <input type="text" name="location" placeholder="Location where it was lost" value={formData.location} onChange={handleChange} required />
          <input type="file" onChange={handleImageChange} accept="image/*" />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "🔍 Searching..." : "Submit"}
        </button>
      </form>

      {loading && <p className="loading-text">🌀 Finding matches, please wait...</p>}

      {textMatches.length > 0 && (
        <div className="match-section">
          <h2 className="section-title">📄 Top 3 Text-Based Matches</h2>
          <ul className="text-match-list">
            {textMatches.map((match, index) => (
              <li key={index} className="text-match-item">
                <p><strong>ID:</strong> {match.id}</p>
                <p><strong>Description:</strong> {match.description}</p>
                <p><strong>Location:</strong> {match.location}</p>
                <p><strong>Text Score:</strong> {match.text_score}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {imageMatches.length > 0 && (
        <div className="match-section">
          <h2 className="section-title">🖼️ Top 3 Image-Based Matches</h2>
          <div className="match-grid">
            {imageMatches.map((match, index) => (
              <div key={index} className="match-card">
                <img
                  src={`http://localhost:5000/uploads/${match.imgpath}`}
                  alt="matched"
                  className="match-image"
                />
                <div className="match-info">
                  <h3>ID: {match.id}</h3>
                  <h3>{match.description}</h3>
                  <p><strong>Location:</strong> {match.location}</p>
                  <p><strong>Image Score:</strong> {match.image_score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportLost;
