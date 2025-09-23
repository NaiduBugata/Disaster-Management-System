import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#333', color: 'white' }}>
    <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px' }}>Disaster Management</Link>
    <div>
      <Link to="/courses" style={{ color: 'white', textDecoration: 'none', marginRight: '10px' }}>Courses</Link>
    </div>
  </nav>
);

export default Navbar;