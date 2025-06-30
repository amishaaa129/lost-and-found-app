import React, { useState } from 'react';
import './MatchItems.css';

function MatchItems() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    title: '',
    description: '',
    location: ''
  });

  const [image, setImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (image) {
      data.append('image', image);
    }

    try {
      const res = await fetch('http://localhost:8000/api/found', {
        method: 'POST',
        body: data
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          phone: '',
          email: '',
          title: '',
          description: '',
          location: ''
        });
        setImage(null);
      } else {
        console.error('Submission failed');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="form-container">
      <h1>FOUND A LOST ITEM? POST.</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="NAME" value={formData.name} onChange={handleChange} required />
        <input type="text" name="phone" placeholder="PHONE" value={formData.phone} onChange={handleChange} required />
        <input type="email" name="email" placeholder="EMAIL" value={formData.email} onChange={handleChange} required />
        <input type="text" name="title" placeholder="TITLE" value={formData.title} onChange={handleChange} required />
        <input type="text" name="description" placeholder="DESCRIPTION" value={formData.description} onChange={handleChange} required />
        <input type="text" name="location" placeholder="LOCATION" value={formData.location} onChange={handleChange} required />
        <input type="file" onChange={handleImageChange} accept="image/*" />
        <button type="submit">POST</button>
      </form>

      {submitted && <p style={{ color: 'yellow', marginTop: '20px' }}>Found item submitted successfully!</p>}
    </div>
  );
}

export default MatchItems;
