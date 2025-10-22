import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from "antd";
import {
  CheckCircleOutlined,
  FileTextOutlined,
  CommentOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "./style/EmployeeDashboard.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const EmployeeDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Menu items
  const menuItems = [
    {
      key: "work-progress",
      icon: <CheckCircleOutlined />,
      label: <Link to="work-progress">Work Progress</Link>,
    },
    {
      key: "contracts",
      icon: <FileTextOutlined />,
      label: <Link to="contracts">My Contracts</Link>,
    },
    {
      key: "feedbacks",
      icon: <CommentOutlined />,
      label: <Link to="feedbacks">Feedbacks</Link>,
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="profile">Profile</Link>,
    },
  ];

  // Get active key from current path
  const getActiveKey = () => {
    const path = location.pathname.split("/").pop();
    return path || "work-progress";
  };

  // User dropdown menu
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  return (
    <Layout className="employee-dashboard">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="dashboard-sider"
        width={250}
      >
        <div className="logo-container">
          <div className="logo">
            {collapsed ? "E" : "Employee"}
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getActiveKey()]}
          items={menuItems}
          className="sidebar-menu"
        />
      </Sider>

      <Layout className="site-layout">
        {/* Header */}
        <Header className="dashboard-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger-btn"
            />
            <Title level={4} className="page-title">
              Employee Dashboard
            </Title>
          </div>

          <div className="header-right">
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Space className="user-info">
                <Avatar
                  size="large"
                  icon={<UserOutlined />}
                  className="user-avatar"
                />
                <span className="username">Employee User</span>
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* Main Content */}
        <Content className="dashboard-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default EmployeeDashboard;