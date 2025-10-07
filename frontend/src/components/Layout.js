import React from "react";
import { Link } from "react-router-dom";
import '../styles/Layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <nav className="nav">
        <Link to="/" className="nav-title">MSHOP</Link>
        <Link to="/add" className="nav-link">Dodaj proizvod</Link>
      </nav>
      <div className="content">
        {children}
      </div>
    </div>
  );
}

export default Layout;
