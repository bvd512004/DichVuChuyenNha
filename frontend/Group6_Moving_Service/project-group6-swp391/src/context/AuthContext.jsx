// src/context/AuthContext.js
import { App } from "antd";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  saveToken,
  getToken,
  removeToken,
  getUserFromToken,
  isTokenExpired,
} from "../service/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { notification } = App.useApp();
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUserFromToken());
  const [hasGreeted, setHasGreeted] = useState(false); // tránh chào lặp lại

  useEffect(() => {
    if (token) {
      const decodedUser = getUserFromToken();
      setUser(decodedUser);

      if (!hasGreeted && decodedUser) {
        showRoleNotification(decodedUser);
        setHasGreeted(true);
      }
    } else {
      setUser(null);
      setHasGreeted(false);
    }
  }, [token]);

  // 🔹 Notification theo role
  const showRoleNotification = (decodedUser) => {
    let roleMessage = "";

    if (decodedUser.roles?.includes("employee")) roleMessage = "Bạn đang đăng nhập với vai trò Nhân viên.";
    else if (decodedUser.roles?.includes("Surveyer")) roleMessage = "Bạn đang đăng nhập với vai trò Surveyer.";
    else if (decodedUser.roles?.includes("manager")) roleMessage = "Bạn đang đăng nhập với vai trò Quản lý.";
    else if (decodedUser.roles?.includes("admin")) roleMessage = "Bạn đang đăng nhập với vai trò Admin.";
    else if (decodedUser.roles?.includes("customer")) roleMessage = "Bạn đang đăng nhập với vai trò Khách hàng.";

    notification.success({
      message: `👋 Xin chào ${decodedUser.username || "khách hàng"}!`,
      description: roleMessage || "Chào mừng bạn quay lại hệ thống.",
      placement: "topRight",
    });
  };

  // ✅ Khi login
  const login = (token) => {
    saveToken(token);
    setToken(token);
    const decodedUser = getUserFromToken();

    if (decodedUser) {
      setUser(decodedUser);
      showRoleNotification(decodedUser);
      setHasGreeted(true);
    }
  };

  // ✅ Khi logout
  const logout = () => {
    removeToken();
    setToken(null);
    setUser(null);
    setHasGreeted(false);
    notification.info({
      message: "👋 Đăng xuất thành công!",
      description: "Hẹn gặp lại bạn lần sau.",
      placement: "topRight",
    });
  };

  useEffect(() => {
    if (isTokenExpired()) logout();
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

