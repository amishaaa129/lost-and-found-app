import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import banner from '../wheres-my-stuff-logo.jpeg'; // Adjust path as needed

function Home() {
  return (
    <>
      <div className="header">
        <img src={banner} alt="Where's My Stuff?" className="banner-img" />
      </div>
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
