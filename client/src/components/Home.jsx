import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <>
      <div className="header">LOST & FOUND</div>
      <div className="container">
        <div className="title">What would you like to do?</div>
        <div className="buttons">
          <Link to="/match">
            <button className="clickFind">I Found an Item</button>
          </Link>
          <Link to="/report">
            <button className="clickFound">I Lost an Item</button>
          </Link>
          <Link to="/browse">
            <button className="clickBrowse">Browse All Posts</button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;
