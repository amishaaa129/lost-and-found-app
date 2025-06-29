import React, { useEffect, useState } from 'react';
import './Browse.css';

function Browse() {
  const [items, setItems] = useState([]);
  const [selectedType, setSelectedType] = useState('lost');

  useEffect(() => {
    const endpoint = selectedType === 'found' ? 'found' : 'lost';
    fetch(`http://localhost:5000/api/${endpoint}`)
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Fetch error:', err));
  }, [selectedType]);

  return (
    <div className="browse-container">
      <h1 className="browse-heading">Browse {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Items</h1>

      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="type-select"
      >
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>

      <div className="items-grid">
        {items.length > 0 ? (
          items.map((item) => (
            <div className="item-card" key={item.id}>
              <div className="image-wrapper">
                <img
                  src={`http://localhost:5000/uploads/${item.image_path || 'default.jpg'}`}
                  alt={item.title}
                  className="item-image"
                  onError={(e) => (e.target.src = '/default.jpg')}
                />
              </div>
              <div className="item-info">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                {selectedType === 'found' && (
                  <p><strong>Location:</strong> {item.location}</p>
                )}
                <div className="user-details">
                  <p><strong>Name:</strong> {item.name}</p>
                  <p><strong>Phone:</strong> {item.phone}</p>
                  <p><strong>Email:</strong> {item.email}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-items">No {selectedType} items to display.</p>
        )}
      </div>
    </div>
  );
}

export default Browse;
