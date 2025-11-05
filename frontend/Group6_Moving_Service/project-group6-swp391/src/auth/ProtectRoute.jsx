import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles, requiredPosition }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    let role = payload.roles || "";
    if (Array.isArray(role)) role = role[0] || ""; // Fix nếu scope là array
    const position = payload.position || "";

    console.log("ProtectedRoute: role=", role, "position=", position); // Debug

    const hasRole = allowedRoles.some(r => r.toLowerCase() === role.toLowerCase());
    const hasPosition = !requiredPosition || position === requiredPosition;

    if (!hasRole || !hasPosition) {
      return <Navigate to="/access-denied" replace />;
    }

    return children;
  } catch (err) {
    console.error("Invalid token", err);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;