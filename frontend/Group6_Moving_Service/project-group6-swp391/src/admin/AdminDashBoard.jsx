import React, { useState } from "react";
import {
  Layout,
  Menu,
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Badge,
  Avatar,
  Spin,
  message,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CarOutlined,
  DollarOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useAdminData } from "./hooks/useAdminData";
import UserTable from "./components/UserTable";
import RoleTable from "./components/RoleTable";
import VehicleTable from "./components/VehiclesTable";
import AuditLogTable from "./components/AuditLogTable";
import CreateUserModal from "./components/CreateUserModal";
import EditUserModal from "./components/EditUserModal";
import LoginHistoryModal from "./components/LoginHistoryModal";
import CreateVehicleModal from "./components/CreateVehicleModal";
import ServicePrice from "./components/ServicePrice";
import ServiceDetail from "./components/ServiceDetail";
import "./style/AdminDashboard.css";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

export default function AdminDashboard() {
  const { users, roles, vehicles, auditLogs, loading, refetchUsers, refetchVehicles } = useAdminData();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [historyUser, setHistoryUser] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);

  const handleEdit = (user) => {
    if (roles.length === 0) return message.warning("Đang tải roles...");
    setEditUser(user);
    setShowEditUser(true);
  };

  const handleViewHistory = async (user) => {
    setHistoryUser(user);
    try {
      const data = await import("../service/adminApi").then((m) => m.adminApi.getLoginHistory(user.userId));
      setLoginHistory(data);
    } catch {
      message.error("Lỗi tải lịch sử");
    }
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng Quan",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Quản Lý Người Dùng",
    },
   
    {
      key: "vehicles",
      icon: <CarOutlined />,
      label: "Quản Lý Xe",
    },
    {
      key: "serviceprices",
      icon: <DollarOutlined />,
      label: "Giá Dịch Vụ",
    },
    
    
  ];

  // Tính toán thống kê
  const stats = {
    totalUsers: users.length,
    totalRoles: roles.length,
    totalVehicles: vehicles.length,
    // totalLogs: auditLogs.length,
    activeUsers: users.filter((u) => u.status !== "INACTIVE").length,
    availableVehicles: vehicles.filter((v) => v.status === "AVAILABLE").length,
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <div className="dashboard-content">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <UserOutlined />
                      <span>Người Dùng Gần Đây</span>
                    </Space>
                  }
                  className="recent-card"
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setShowCreateUser(true)}
                    >
                      Tạo Mới
                    </Button>
                  }
                >
                  <div className="recent-list">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.userId} className="recent-item">
                        <Avatar icon={<UserOutlined />} className="recent-avatar" />
                        <div className="recent-info">
                          <Text strong>{user.username}</Text>
                          <Text type="secondary">{user.email}</Text>
                        </div>
                        <Badge
                          status={user.status === "ACTIVE" ? "success" : "default"}
                          text={
                            roles.find((r) => r.roleId === user.roleId)?.roleName || "Unknown"
                          }
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <CarOutlined />
                      <span>Xe Gần Đây</span>
                    </Space>
                  }
                  className="recent-card"
                >
                  <div className="recent-list">
                    {vehicles.slice(0, 5).map((vehicle) => (
                      <div key={vehicle.vehicleId} className="recent-item">
                        <Avatar icon={<CarOutlined />} className="recent-avatar" />
                        <div className="recent-info">
                          <Text strong>{vehicle.vehicleType}</Text>
                          <Text type="secondary">{vehicle.licensePlate}</Text>
                        </div>
                        <Badge
                          status={vehicle.status === "AVAILABLE" ? "success" : "warning"}
                          text={vehicle.status}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
      case "users":
        return (
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Quản Lý Người Dùng</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowCreateUser(true)}
              >
                Tạo Người Dùng Mới
              </Button>
            }
            className="content-card"
          >
            <UserTable
              users={users}
              roles={roles}
              onEdit={handleEdit}
              onViewHistory={handleViewHistory}
              refetchUsers={refetchUsers}
            />
          </Card>
        );
      case "roles":
        return (
          <Card
            title={
              <Space>
                <SafetyOutlined />
                <span>Quản Lý Vai Trò</span>
              </Space>
            }
            className="content-card"
          >
            <RoleTable roles={roles} />
          </Card>
        );
      case "vehicles":
        return (
          <Card
            title={
              <Space>
                <CarOutlined />
                <span>Quản Lý Xe</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowCreateVehicle(true)}
              >
                Thêm Xe Mới
              </Button>
            }
            className="content-card"
          >
            <VehicleTable vehicles={vehicles} />
          </Card>
        );
      case "serviceprices":
        return (
          <Card
            title={
              <Space>
                <DollarOutlined />
                <span>Quản Lý Giá Dịch Vụ</span>
              </Space>
            }
            className="content-card"
          >
            <ServicePrice />
          </Card>
        );
      case "servicedetails":
        return (
          <Card
            title={
              <Space>
                <UnorderedListOutlined />
                <span>Chi Tiết Dịch Vụ</span>
              </Space>
            }
            className="content-card"
          >
            <ServiceDetail />
          </Card>
        );
      case "logs":
        return (
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Nhật Ký Hệ Thống</span>
              </Space>
            }
            className="content-card"
          >
            <AuditLogTable logs={auditLogs} />
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Layout className="admin-dashboard-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="admin-sidebar"
        width={260}
      >
      
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeTab]}
          items={menuItems}
          onClick={({ key }) => setActiveTab(key)}
          className="admin-menu"
        />
      </Sider>
      <Layout className="admin-layout-content">
        <Content className="admin-content">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-toggle-btn"
            size="large"
          />
          {renderContent()}
        </Content>
      </Layout>

      <CreateUserModal
        open={showCreateUser}
        onCancel={() => setShowCreateUser(false)}
        roles={roles}
        onSuccess={() => {
          setShowCreateUser(false);
          refetchUsers();
        }}
      />

      <EditUserModal
        open={showEditUser}
        onCancel={() => {
          setShowEditUser(false);
          setEditUser(null);
        }}
        user={editUser}
        roles={roles}
        onSuccess={() => {
          setShowEditUser(false);
          setEditUser(null);
          refetchUsers();
        }}
      />

      {historyUser && (
        <LoginHistoryModal
          user={historyUser}
          history={loginHistory}
          onHide={() => setHistoryUser(null)}
        />
      )}

      <CreateVehicleModal
        open={showCreateVehicle}
        onCancel={() => setShowCreateVehicle(false)}
        onSuccess={() => {
          setShowCreateVehicle(false);
          refetchVehicles();
        }}
      />
    </Layout>
  );
}
