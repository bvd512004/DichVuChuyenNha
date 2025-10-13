

import React, { useState, useRef, useEffect } from "react";
import { Button, message, Dropdown, Menu } from "antd";
import { UserOutlined, PhoneOutlined, DownOutlined } from "@ant-design/icons";
import axios from "axios";
import api from "../service/api";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const roleName = localStorage.getItem("roleName");
  // Inline request preview removed; we navigate to a dedicated page

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleLogout = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );



      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");

      message.success("Đăng xuất thành công!");
      navigate("/");

    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };


  const handleUserMenuClick = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };


  const userMenuItems = [
    {
      key: "my-requests",
      label: "Danh sách yêu cầu",
      onClick: () => {
        navigate("/my-requests");
        setIsDropdownVisible(false);
      }
    },
    ...(roleName === "admin" ? [ // Thêm link chỉ cho admin
      {
        key: "admin-dashboard",
        label: "Admin Dashboard",
        onClick: () => {
          navigate("/admin-dashboard");
          setIsDropdownVisible(false);
        }
      }
    ] : []),
    {
      key: "profile",
      label: "Thông tin cá nhân",
      onClick: () => {
        navigate("/user-profile");
        setIsDropdownVisible(false);
      }
    },
    {
      key: "logout",
      label: "Đăng xuất",
      onClick: handleLogout
    }
  ];

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo and Company Name */}
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <div className="logo">
            <div className="logo-icon">P</div>
          </div>
          <div className="brand-text">
            <div className="company-name">ProMove Commercial</div>
            <div className="company-tagline">Dịch Vụ Chuyển Nhà Chuyên Nghiệp</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="navbar-nav">
          <a href="#services" className="nav-link">Dịch Vụ</a>
          <a href="#about" className="nav-link">Giới Thiệu</a>
          <a href="#reviews" className="nav-link">Đánh Giá</a>
          <a href="#contact" className="nav-link">Liên Hệ</a>
        </nav>

        {/* Right Section */}
        <div className="navbar-actions">
          {/* Phone Number */}
          <div className="phone-info">
            <PhoneOutlined className="phone-icon" />
            <span className="phone-number">(555) 123-4567</span>
          </div>

          {/* User Actions */}
          {isLoggedIn ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-button"
                onClick={handleUserMenuClick}
              >
                <UserOutlined className="user-icon" />
                <DownOutlined className="dropdown-icon" />
              </button>

              {isDropdownVisible && (
                <div className="user-dropdown">
                  <button
                    key="my-requests"
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/my-requests");
                      setIsDropdownVisible(false);
                    }}
                  >
                    Danh sách yêu cầu
                  </button>
                  {userMenuItems.map((item) => (
                    <button
                      key={item.key}
                      className="dropdown-item"
                      onClick={item.onClick}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Button
                type="text"
                className="login-btn"
                onClick={() => navigate("/login")}
              >
                Đăng Nhập
              </Button>
              <Button
                type="primary"
                className="register-btn"
                onClick={() => navigate("/customer-register")}
              >
                Đăng Ký
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>

  );
};

export default Header;
