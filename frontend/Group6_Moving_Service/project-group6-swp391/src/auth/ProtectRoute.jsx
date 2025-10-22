import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles, requiredPosition }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const roles = payload.roles || [];
    const position = payload.position || ""; // cần backend gửi position trong token

    const hasPermission = roles.some(role => allowedRoles.includes(role)) &&
                          (!requiredPosition || position === requiredPosition);

    if (!hasPermission) return <Navigate to="/access-denied" replace />;

    return children;
  } catch (err) {
    console.error("Invalid token", err);
    return <Navigate to="/login" replace />;
  }
};


export default ProtectedRoute;
