import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from "antd";
import {
  FileTextOutlined,
  UserAddOutlined,
  DollarOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  CarOutlined,
  FolderOpenOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import "./style/ManagerDashboard.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ManagerDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Menu items
  const menuItems = [
    {
      key: "contract-assignment",
      icon: <FileTextOutlined />,
      label: <Link to="contract-assignment">Phân Công Hợp Đồng</Link>,
    },
    {
      key: "vehicle-assignment",
      icon: <CarOutlined />,
      label: <Link to="vehicle-assignment">Phân Công Phương Tiện</Link>,
    },
    {
      key: "manager/work-progress",
      icon: <FolderOpenOutlined />,
      label: <Link to="manager/work-progress">Tạo Tiến Độ Công Việc</Link>,
    },
    {
      key: "manager/work-progress-list",
      icon: <BarsOutlined />,
      label: <Link to="manager/work-progress-list">Danh Sách Tiến Độ</Link>,
    },
  ];

  // Get active key from current path
  const getActiveKey = () => {
    const path = location.pathname.split("/").pop();
    return path || "contract-assignment";
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
    <Layout className="manager-dashboard">
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
            {collapsed ? "M" : "Manager"}
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
              Dashboard Quản Lý
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
                <span className="username">Admin User</span>
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

export default ManagerDashboard;