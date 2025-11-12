import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import {
  FileTextOutlined,
  UserAddOutlined,
  DollarOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
  CarOutlined,
} from "@ant-design/icons";
import "./style/ManagerDashboard.css";
import PaymentList from "./PaymentList"; // Đảm bảo đường dẫn đúng
const { Sider, Content } = Layout;

const ManagerDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Menu items - Đầy đủ các chức năng của manager
  const menuItems = [
    {
      key: "contract-assignment",
      icon: <FileTextOutlined />,
      label: <Link to="contract-assignment">Phân công hợp đồng</Link>,
    },
    {
      key: "assign-surveyer",
      icon: <TeamOutlined />,
      label: <Link to="assign-surveyer">Phân công khảo sát viên</Link>,
    },
    {
      key: "review-quotations",
      icon: <CheckCircleOutlined />,
      label: <Link to="review-quotations">Xem xét báo giá</Link>,
    },
    {
      key: "contracts-list-manager",
      icon: <UnorderedListOutlined />,
      label: <Link to="contracts-list-manager">Danh sách hợp đồng</Link>,
    },
    {
      key: "vehicle-assignment",
      icon: <CarOutlined />,
      label: <Link to="vehicle-assignment">Phân công xe cho hợp đồng</Link>,
    },
    {
      key: "manager/work-progress",
      icon: <UserAddOutlined />,
      label: <Link to="manager/work-progress">Tạo tiến độ công việc</Link>,
    },
    {
      key: "manager/work-progress-list",
      icon: <DollarOutlined />,
      label: <Link to="manager/work-progress-list">Danh sách tiến độ</Link>,
    },
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: <Link to="reports">Báo cáo</Link>,
    },
    {
  key: "payments",
  icon: <DollarOutlined />,
  label: <Link to="payments">Danh sách thanh toán - Xuất hóa đơn cho khách hàng</Link>,
},
  ];

  // Get active key from current path
  const getActiveKey = () => {
    const path = location.pathname;
    // Lấy phần sau "/manager/dashboard/"
    if (path.includes("/manager/dashboard/")) {
      const dashboardPath = path.split("/manager/dashboard/")[1];
      if (dashboardPath) {
        return dashboardPath;
      }
    }
    // Fallback: lấy phần cuối của path
    const lastPart = path.split("/").pop();
    return lastPart || "contract-assignment";
  };

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
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger-btn-sidebar"
          />
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