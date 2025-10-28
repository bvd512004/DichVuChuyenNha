import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles, requiredPosition }) => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const roles = payload.roles || [];
    const position = payload.position || ""; // cần backend gửi position trong token

    console.log("Token payload:", payload);
    console.log("Roles from token:", roles);
    console.log("Position from token:", position);
    console.log("Allowed roles:", allowedRoles);
    console.log("Required position:", requiredPosition);

    // Chuyển đổi roles thành lowercase để so sánh
    const normalizedRoles = roles.map(role => role.toLowerCase());
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    const hasRolePermission = normalizedRoles.some(role => normalizedAllowedRoles.includes(role));
    const hasPositionPermission = !requiredPosition || position === requiredPosition;

    console.log("Has role permission:", hasRolePermission);
    console.log("Has position permission:", hasPositionPermission);

    const hasPermission = hasRolePermission && hasPositionPermission;

    if (!hasPermission) {
      console.log("Access denied - redirecting to access-denied page");
      return <Navigate to="/access-denied" replace />;
    }

    return children;
  } catch (err) {
    console.error("Invalid token", err);
    return <Navigate to="/login" replace />;
  }
};


export default ProtectedRoute;
