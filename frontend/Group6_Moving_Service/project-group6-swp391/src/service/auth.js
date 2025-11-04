// src/utils/auth.js
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

// Lưu token
export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Lấy token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Xóa token khi logout
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Giải mã token để lấy user
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  console.log("👉 getUserFromToken() called, token =", token); // 👈 log thật ở đây

  try {
    const decoded = jwtDecode(token);
    return {
      username: decoded.sub,
      userId: decoded.userId,
      role: decoded.roles ? decoded.roles[0] : null,
      position: decoded.position,
      exp: decoded.exp,
    };
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
};

// Kiểm tra token còn hạn không
export const isTokenExpired = () => {
  const user = getUserFromToken();
  if (!user) return true;
  return Date.now() >= user.exp * 1000;
};
