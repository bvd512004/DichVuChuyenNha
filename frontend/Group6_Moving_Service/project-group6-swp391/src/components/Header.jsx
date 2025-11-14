import React, { useState, useRef, useEffect } from "react";
import { Button, message } from "antd";
import { UserOutlined, PhoneOutlined, DownOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import api from "../service/axiosInstance"; // Thống nhất dùng api
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { Link } from 'react-router-dom';
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const roleName = localStorage.getItem("roleName"); // Lấy từ localStorage (sẽ là 'admin' lowercase sau fix)

  const getPositionFromToken = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.position || null;
    } catch (error) {
      console.error("Failed to parse token for position", error);
      return null;
    }
  };

  const position = getPositionFromToken();

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await api.post("/auth/logout"); // Sử dụng api instance (đã có Authorization header)
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
      localStorage.removeItem("roleName"); // Thêm để clear role
      message.success("Đăng xuất thành công!");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      message.error("Lỗi đăng xuất");
    }
  };

  const handleUserMenuClick = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const userMenuItems = [
    // {
    // key: "my-requests",
    // label: "Danh sách yêu cầu",
    // onClick: () => {
    // navigate("/my-requests");
    // setIsDropdownVisible(false);
    // },
    // },
    ...(roleName?.toLowerCase() === "admin"  // ✅ Sửa: Check lowercase để match
      ? [
        {
          key: "admin-dashboard",
          label: "Admin Dashboard",
          onClick: () => {
            navigate("/admin-dashboard");
            setIsDropdownVisible(false);
          },
        },
      ]
      : []),
    ...(roleName?.toLowerCase() === "manager"  // ✅ Thêm Manager Dashboard cho manager
      ? [
        {
          key: "manager-dashboard",
          label: "Manager Dashboard",
          onClick: () => {
            navigate("/manager/dashboard/contract-assignment");
            setIsDropdownVisible(false);
          },
        },
      ]
      : []),
    ...(roleName?.toLowerCase() === "customer_individual"||
      roleName?.toLowerCase() === "customer_enterprise"
      ? [
        {
          key: "customer-page",
          label: "Quản lý yêu cầu",
          onClick: () => {
            navigate("/customer-page");
            setIsDropdownVisible(false);
          },
        },
      ]
      : []),
    ...(roleName?.toLowerCase() === "employee" &&
      position &&
      (position.toLowerCase() === "driver" || position.toLowerCase() === "tài xế")
      ? [
        {
          key: "driver-dashboard",
          label: "Driver Dashboard",
          onClick: () => {
            navigate("/driver/dashboard");
            setIsDropdownVisible(false);
          },
        },
      ]
      : []),
    ...(roleName?.toLowerCase() === "employee" &&
      position &&
      (position.toLowerCase() === "surveyer" || position.toLowerCase() === "khảo sát")
      ? [
        {
          key: "survey-dashboard",
          label: "Survey Dashboard",
          onClick: () => {
            navigate("/survey-dashboard");
            setIsDropdownVisible(false);
          },
        },
      ]
      : []),
    {
      key: "profile",
      label: "Thông tin cá nhân",
      onClick: () => {
        navigate("/user-profile");
        setIsDropdownVisible(false);
      },
    },
    {
      key: "logout",
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <header className={`navbar ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}>
      <div className="navbar-container">
        {/* Logo and Company Name */}
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <div className="logo">
            <div 
              className="logo-icon"
              style={{
                color: '#000000',
                background: '#ffffff',
                border: '2px solid #000000',
                WebkitTextFillColor: '#000000',
              }}
            >
              P
            </div>
          </div>
          <div className="brand-text">
            <div className="company-name">ProMove Commercial</div>
            <div className="company-tagline">Dịch Vụ Chuyển Nhà Chuyên Nghiệp</div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-nav">
          <a 
            onClick={() => handleNavClick("/price-service")} 
            className={`nav-link ${isActive("/price-service") ? "active" : ""}`}
          >
            Dịch Vụ
          </a>
          <a 
            onClick={() => handleNavClick("/about")} 
            className={`nav-link ${isActive("/about") ? "active" : ""}`}
          >
            Giới Thiệu
          </a>
          <a 
            onClick={() => handleNavClick("/contact")} 
            className={`nav-link ${isActive("/contact") ? "active" : ""}`}
          >
            Liên Hệ
          </a>
          <Link 
            to="/feedback-page" 
            className={`nav-link ${isActive("/feedback-page") ? "active" : ""}`}
          >
            Đánh giá
          </Link>
        </nav>

        {/* Right Section */}
        <div className="navbar-actions">
          {/* Phone Number - Desktop Only */}
          <div className="phone-info desktop-only">
            <PhoneOutlined className="phone-icon" />
            <a href="tel:0123456789" className="phone-number">0123456789</a>
          </div>
          
          {/* User Actions */}
          {isLoggedIn ? (
            <div className="user-menu" ref={dropdownRef}>
              <button className="user-button" onClick={handleUserMenuClick}>
                <UserOutlined className="user-icon" />
                <span className="user-text">Tài khoản</span>
                <DownOutlined className={`dropdown-icon ${isDropdownVisible ? "open" : ""}`} />
              </button>
              {isDropdownVisible && (
                <div className="user-dropdown">
                  {userMenuItems.map((item) => (
                    <button key={item.key} className="dropdown-item" onClick={item.onClick}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Button type="text" className="login-btn" onClick={() => navigate("/login")}>
                Đăng Nhập
              </Button>
              <Button type="primary" className="register-btn" onClick={() => navigate("/customer-register")}>
                Đăng Ký
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <nav className="mobile-nav">
          <a 
            onClick={() => handleNavClick("/price-service")} 
            className={`mobile-nav-link ${isActive("/price-service") ? "active" : ""}`}
          >
            Dịch Vụ
          </a>
          <a 
            onClick={() => handleNavClick("/about")} 
            className={`mobile-nav-link ${isActive("/about") ? "active" : ""}`}
          >
            Giới Thiệu
          </a>
          <a 
            onClick={() => handleNavClick("/contact")} 
            className={`mobile-nav-link ${isActive("/contact") ? "active" : ""}`}
          >
            Liên Hệ
          </a>
          <Link 
            to="/feedback-admin" 
            className={`mobile-nav-link ${isActive("/feedback-admin") ? "active" : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Đánh giá
          </Link>
          
          {/* Mobile Phone Info */}
          <div className="mobile-phone-info">
            <PhoneOutlined className="phone-icon" />
            <a href="tel:0123456789" className="phone-number">0123456789</a>
          </div>

          {/* Mobile Auth Buttons */}
          {!isLoggedIn && (
            <div className="mobile-auth-buttons">
              <Button 
                type="default" 
                className="mobile-login-btn" 
                block
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
              >
                Đăng Nhập
              </Button>
              <Button 
                type="primary" 
                className="mobile-register-btn" 
                block
                onClick={() => {
                  navigate("/customer-register");
                  setIsMobileMenuOpen(false);
                }}
              >
                Đăng Ký
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;