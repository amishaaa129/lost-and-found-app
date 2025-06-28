import React from 'react';
import './Browse.css';

const dummyItems = [
  {
    id: 1,
    title: 'Black Wallet',
    description: 'Lost near library. Has important cards.',
    image: 'https://via.placeholder.com/300x200?text=Black+Wallet',
  },
  {
    id: 2,
    title: 'Blue Backpack',
    description: 'Found outside cafeteria.',
    image: 'https://via.placeholder.com/300x200?text=Blue+Backpack',
  },
  {
    id: 3,
    title: 'Smartphone',
    description: 'iPhone 13 found in parking lot.',
    image: 'https://via.placeholder.com/300x200?text=Smartphone',
  },
  {
    id: 4,
    title: 'Gold Ring',
    description: 'Lost during event in auditorium.',
    image: 'https://via.placeholder.com/300x200?text=Gold+Ring',
  }
];

function Browse() {
  return (
    <div className="browse-container">
      <h1>Browse Lost & Found Items</h1>
      <div className="item-grid">
        {dummyItems.map(item => (
          <div className="item-card" key={item.id}>
            <img src={item.image} alt={item.title} />
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Browse;
