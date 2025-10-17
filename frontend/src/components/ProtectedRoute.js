import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token"); 

  if (!token) {
    return <Navigate to="/login" />; 
  }

  let user;
  try {
    user = jwtDecode(token); 
  } catch {
    return <Navigate to="/login" />; 
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />; 
  }

  return children; 
}

export default ProtectedRoute;
