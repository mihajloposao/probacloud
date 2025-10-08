import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/Layout.css";

function Layout({ children }) {
  const navigate = useNavigate();
  const [userBalance, setUserBalance] = useState(0);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);

        // 🔹 Pozivamo backend da dohvatimo stvarni balans iz baze
        fetch(`${process.env.REACT_APP_API_URL}/user/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && data.balance !== undefined) {
              setUserBalance(data.balance);
            }
          })
          .catch((err) => console.error("Greška pri dohvatanju balansa:", err));
      } catch (err) {
        console.error("Nevažeći token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-left">
          <Link to="/" className="nav-title">MSHOP</Link>
        </div>

        <div className="additional">
          {userRole && (
          <span className="nav-balance">{userBalance} RSD</span>
            )}
          {userRole && (
            <Link to="/addbalance" className="nav-link">Povećaj balans</Link>
          )}
          {userRole === "seller" && (
            <Link to="/addproduct" className="nav-link">Dodaj proizvod</Link>
          )}
          {userRole && (
            <button onClick={handleLogout} className="nav-link">Logout</button>
          )}
          {!userRole &&(
            <Link to="/register/customer" className="nav-link">Registracija kupca</Link>
          )}
          {!userRole &&(
            <Link to="/register/seller" className="nav-link">Registracija prodavca</Link>
          )}
        </div>
      </nav>

      <div className="content">{children}</div>
    </div>
  );
}
export default Layout;
