import React, { useState } from "react";
import { Container, Row, Col, Nav, Alert } from "react-bootstrap";
import { FiUserPlus, FiShield, FiTruck, FiClock } from "react-icons/fi";
import { message } from "antd";

import { useAdminData } from "./hooks/useAdminData";
import UserTable from "./components/UserTable";
import RoleTable from "./components/RoleTable";
import VehicleTable from "./components/VehiclesTable";
import AuditLogTable from "./components/AuditLogTable";
import CreateUserModal from "./components/CreateUserModal";
import EditUserModal from "./components/EditUserModal";
import LoginHistoryModal from "./components/LoginHistoryModal";

import "./style/AdminDashboard.css";

export default function AdminDashboard() {
  const { users, roles, vehicles, auditLogs, loading, refetchUsers } = useAdminData();
  const [activeTab, setActiveTab] = useState("users");
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [historyUser, setHistoryUser] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);

  const handleEdit = (user) => {
    if (roles.length === 0) return message.warning("Đang tải roles...");
    setEditUser(user);
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

  return (
    <Container fluid className="admin-dashboard py-4">
      <Row>
        <Col md={2} className="sidebar bg-light border-right p-3">
          <h4 className="mb-4">Admin Menu</h4>
          <Nav className="flex-column">
            <Nav.Link onClick={() => setActiveTab("users")} active={activeTab === "users"}>
              <FiUserPlus className="me-2" /> Users
            </Nav.Link>
            <Nav.Link onClick={() => setShowCreate(true)}>
              <FiUserPlus className="me-2" /> Create User
            </Nav.Link>
            <Nav.Link onClick={() => setActiveTab("roles")} active={activeTab === "roles"}>
              <FiShield className="me-2" /> Roles
            </Nav.Link>
            <Nav.Link onClick={() => setActiveTab("vehicles")} active={activeTab === "vehicles"}>
              <FiTruck className="me-2" /> Vehicles
            </Nav.Link>
            <Nav.Link onClick={() => setActiveTab("logs")} active={activeTab === "logs"}>
              <FiClock className="me-2" /> Logs
            </Nav.Link>
          </Nav>
        </Col>

        <Col md={9} className="p-4">
          <h2 className="mb-4 text-center fw-bold">
            <FiShield className="me-2" /> Admin Dashboard
          </h2>

          {loading ? (
            <Alert variant="info">Đang tải dữ liệu...</Alert>
          ) : (
            <>
              {activeTab === "users" && (
                <UserTable users={users} roles={roles} onEdit={handleEdit} onViewHistory={handleViewHistory} />
              )}
              {activeTab === "roles" && <RoleTable roles={roles} />}
              {activeTab === "vehicles" && <VehicleTable vehicles={vehicles} />}
              {activeTab === "logs" && <AuditLogTable logs={auditLogs} />}
            </>
          )}
        </Col>
      </Row>

      <CreateUserModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        roles={roles}
        onSuccess={() => {
          setShowCreate(false);
          refetchUsers();
        }}
      />

      {editUser && (
        <EditUserModal
          user={editUser}
          roles={roles}
          onHide={() => setEditUser(null)}
          onSuccess={refetchUsers}
        />
      )}

      {historyUser && (
        <LoginHistoryModal
          user={historyUser}
          history={loginHistory}
          onHide={() => setHistoryUser(null)}
        />
      )}
    </Container>
  );
}