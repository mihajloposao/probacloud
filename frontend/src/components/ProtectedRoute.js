import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token"); // proveravamo da li postoji token

  if (!token) {
    return <Navigate to="/login" />; // nije prijavljen
  }

  let user;
  try {
    user = jwtDecode(token); // dekodujemo token da dobijemo rolu
  } catch {
    return <Navigate to="/login" />; // token je nevažeći
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />; // nema prava pristupa
  }

  return children; // sve OK, ruta je dostupna
}

export default ProtectedRoute;
