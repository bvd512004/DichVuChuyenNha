import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles, requiredPosition }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    const role = payload.scope || ""; // ← "admin", "manager",...
    const position = payload.position || "";

    // So sánh role (viết thường)
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