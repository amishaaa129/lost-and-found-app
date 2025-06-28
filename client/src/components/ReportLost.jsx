import React, { useState } from 'react';
import axios from 'axios';
import './ReportLost.css'; // ✅ using your CSS

function ReportLost() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    title: '',
    description: ''
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    for (const key in formData) {
      payload.append(key, formData[key]);
    }
    if (image) {
      payload.append('image', image);
    }

    try {
      const res = await axios.post('http://localhost:3000/api/items', payload);
      alert('Lost item reported successfully!');
    } catch (err) {
      alert('Error submitting form');
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h1>POST REQUEST FOR A LOST ITEM.</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="NAME" value={formData.name} onChange={handleChange} required />
        <input type="text" name="phone" placeholder="PHONE" value={formData.phone} onChange={handleChange} required />
        <input type="email" name="email" placeholder="EMAIL" value={formData.email} onChange={handleChange} required />
        <input type="text" name="title" placeholder="TITLE" value={formData.title} onChange={handleChange} required />
        <input type="text" name="description" placeholder="DESCRIPTION" value={formData.description} onChange={handleChange} required />
        <input type="file" name="image" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit">POST</button>
      </form>
    </div>
  );
}

export default ReportLost;
