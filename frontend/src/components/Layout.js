import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import '../styles/Layout.css';

function Layout({ children }) {
  const navigate = useNavigate();
  let userRole = null;

  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role;
    } catch (err) {
      console.error("Nevažeći token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token"); // brišemo token
    navigate("/login"); // vraćamo korisnika na početnu
  };

  return (
    <div className="layout">
      <nav className="nav">
        <Link to="/" className="nav-title">MSHOP</Link>
        {userRole === "seller" && (
          <Link to="/addproduct" className="nav-link">Dodaj proizvod</Link>
        )}
        {token && (
          <button onClick={handleLogout} className="nav-link">Logout</button>
        )}
      </nav>
      <div className="content">
        {children}
      </div>
    </div>
  );
}

export default Layout;
