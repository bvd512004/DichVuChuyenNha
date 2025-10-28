

import React, { useState, useRef, useEffect } from "react";
import { Button, message, Dropdown, Menu } from "antd";
import { UserOutlined, PhoneOutlined, DownOutlined } from "@ant-design/icons";
import axios from "axios";
import api from "../service/axiosInstance";
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
      },
      {
        key: "employee-management",
        label: "Quản lý nhân viên",
        onClick: () => {
          navigate("/employee-management");
          setIsDropdownVisible(false);
        }
      },
      {
        key: "vehicle-management",
        label: "Quản lý phương tiện",
        onClick: () => {
          navigate("/vehicle-management");
          setIsDropdownVisible(false);
        }
      }
    ] : []),
    ...(roleName === "manager" ? [ // Thêm link cho manager
      {
        key: "manager-dashboard",
        label: "Manager Dashboard",
        onClick: () => {
          navigate("/manager/dashboard");
          setIsDropdownVisible(false);
        }
      },
      {
        key: "contract-assignment",
        label: "Phân công hợp đồng",
        onClick: () => {
          navigate("/contract-assignment");
          setIsDropdownVisible(false);
        }
      },
      {
        key: "vehicle-assignment",
        label: "Phân công phương tiện",
        onClick: () => {
          navigate("/vehicle-assignment");
          setIsDropdownVisible(false);
        }
      }
    ] : []),
    ...(roleName === "employee" || localStorage.getItem("position") === "Surveyer" ? [ // Thêm link cho employee
      {
        key: "employee-dashboard",
        label: "Employee Dashboard",
        onClick: () => {
          navigate("/employee/dashboard");
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
          {isLoggedIn && roleName === "admin" && (
            <>
              <a onClick={() => navigate("/admin-dashboard")} className="nav-link" style={{ cursor: 'pointer' }}>Trang Chủ Admin</a>
              <a onClick={() => navigate("/employee-management")} className="nav-link" style={{ cursor: 'pointer' }}>Quản Lý Nhân Viên</a>
              <a onClick={() => navigate("/vehicle-management")} className="nav-link" style={{ cursor: 'pointer' }}>Quản Lý Phương Tiện</a>
            </>
          )}
          {isLoggedIn && roleName === "manager" && (
            <>
              <a onClick={() => navigate("/manager/dashboard")} className="nav-link" style={{ cursor: 'pointer' }}>Trang Chủ Manager</a>
              <a onClick={() => navigate("/contract-assignment")} className="nav-link" style={{ cursor: 'pointer' }}>Phân Công Hợp Đồng</a>
              <a onClick={() => navigate("/vehicle-assignment")} className="nav-link" style={{ cursor: 'pointer' }}>Phân Công Phương Tiện</a>
            </>
          )}
          {isLoggedIn && (roleName === "employee" || localStorage.getItem("position") === "Surveyer") && (
            <>
              <a onClick={() => navigate("/employee/dashboard")} className="nav-link" style={{ cursor: 'pointer' }}>Trang Chủ Nhân Viên</a>
              <a onClick={() => navigate("/employee/work-progress")} className="nav-link" style={{ cursor: 'pointer' }}>Tiến Độ Công Việc</a>
            </>
          )}
          {isLoggedIn && (roleName === "customer_individual" || roleName === "customer_company" || roleName === "customer") && (
            <>
              <a onClick={() => navigate("/my-requests")} className="nav-link" style={{ cursor: 'pointer' }}>Yêu Cầu Của Tôi</a>
              <a onClick={() => navigate("/price-service")} className="nav-link" style={{ cursor: 'pointer' }}>Bảng Giá</a>
            </>
          )}
          {!isLoggedIn && (
            <>
              <a onClick={() => navigate("/price-service")} className="nav-link" style={{ cursor: 'pointer' }}>Dịch Vụ</a>
              <a href="#about" className="nav-link">Giới Thiệu</a>
              <a href="#contact" className="nav-link">Liên Hệ</a>
            </>
          )}
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
