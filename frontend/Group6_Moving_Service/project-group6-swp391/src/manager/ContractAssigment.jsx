import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Modal,
  Select,
  DatePicker,
  Space,
  Typography,
  List,
  Divider,
  Descriptions,
  Card,
  Tag,
} from "antd";
import {
  FileTextOutlined,
  UserAddOutlined,
  DeleteOutlined,
  CalendarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import assignmentApi from "../service/assignment";
import ContractAPI from "../service/contract";
import dayjs from "dayjs";
import "./style/ContractAssignment.css";

const { Title } = Typography;
const { Option } = Select;

export default function ContractAssignment() {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractDetail, setContractDetail] = useState(null);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [freeEmployees, setFreeEmployees] = useState([]);
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assignedDate, setAssignedDate] = useState(null);
  const [employeeToRemove, setEmployeeToRemove] = useState(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const res = await assignmentApi.getAssignableContracts();
      setContracts(res.data);
    } catch {
      message.error("Failed to load contracts");
    }
  };

  const handleViewDetails = async (contractId) => {
    setSelectedContract(contractId);
    setLoading(true);
    try {
      // Gọi cả API chi tiết hợp đồng và danh sách nhân viên
      const [detailRes, assignedRes] = await Promise.all([
        ContractAPI.getById(contractId),
        assignmentApi.getAssignmentsByContract(contractId),
      ]);
      setContractDetail(detailRes);
      setAssignedEmployees(assignedRes.data);
      setDetailModalVisible(true);
    } catch {
      message.error("Failed to load contract details or assigned employees");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = async () => {
    try {
      const res = await assignmentApi.getEmployees();
      setFreeEmployees(res.data);
      setAssignModalVisible(true);
    } catch {
      message.error("Failed to load employees");
    }
  };

  const handleAssign = async () => {
    if (!selectedEmployee || !assignedDate) {
      message.warning("Please select both employee and date");
      return;
    }
    setLoading(true);
    try {
      await assignmentApi.assignEmployee({
        contractId: selectedContract,
        employeeId: selectedEmployee,
        assignedDate: dayjs(assignedDate).format("YYYY-MM-DD"),
      });
      message.success("Employee assigned successfully!");
      setAssignModalVisible(false);
      setSelectedEmployee(null);
      setAssignedDate(null);
      
      // Refresh assigned employees list
      const assignedRes = await assignmentApi.getAssignmentsByContract(selectedContract);
      setAssignedEmployees(assignedRes.data);
    } catch (err) {
      message.error(err.response?.data || "Error assigning employee");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (employeeId) => {
    console.log("🔍 Attempting to remove employee:", employeeId, "from contract:", selectedContract);
    setEmployeeToRemove(employeeId);
  };

  const confirmUnassign = async () => {
    if (!employeeToRemove) return;
    
    try {
      console.log("🚀 Calling removeAssignment API...");
      const result = await assignmentApi.removeAssignment(selectedContract, employeeToRemove);
      console.log("✅ API Response:", result);
      
      message.success("Employee unassigned successfully!");
      
      // Refresh both contract details and assigned employees list
      console.log("🔄 Refreshing data...");
      const [detailRes, assignedRes] = await Promise.all([
        ContractAPI.getById(selectedContract),
        assignmentApi.getAssignmentsByContract(selectedContract),
      ]);
      console.log("📊 New assigned employees:", assignedRes.data);
      
      setContractDetail(detailRes);
      setAssignedEmployees(assignedRes.data);
      setEmployeeToRemove(null);
    } catch (err) {
      console.error("❌ Error removing employee:", err);
      console.error("❌ Error details:", err.response);
      message.error(err.response?.data?.message || err.message || "Failed to unassign employee");
      setEmployeeToRemove(null);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setContractDetail(null);
    setAssignedEmployees([]);
    setSelectedContract(null);
  };

  const columns = [
    {
      title: "Contract ID",
      dataIndex: "contractId",
      key: "contractId",
      width: 150,
      render: (id) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        const color = status === "PENDING" ? "orange" : 
                      status === "APPROVED" ? "green" : 
                      status === "COMPLETED" ? "blue" : "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record.contractId)}
          loading={loading && selectedContract === record.contractId}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="contract-assignment-container">
      <Card className="main-card">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div className="page-header">
            <FileTextOutlined className="page-icon" />
            <Title level={2} className="page-title">
              Contract Employee Management
            </Title>
          </div>

          <Divider />

          {/* Bảng hợp đồng */}
          <Table
            dataSource={contracts}
            rowKey="contractId"
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} contracts`,
            }}
            className="contract-table"
          />
        </Space>
      </Card>

      {/* Modal chi tiết hợp đồng */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Contract #{contractDetail?.contractId} Details</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={null}
        width={800}
        className="detail-modal"
      >
        {contractDetail && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Chi tiết hợp đồng */}
            <Card title="Contract Information" size="small">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Start Date" span={1}>
                  {contractDetail.startDate}
                </Descriptions.Item>
                <Descriptions.Item label="End Date" span={1}>
                  {contractDetail.endDate}
                </Descriptions.Item>
                <Descriptions.Item label="Deposit" span={1}>
                  ${contractDetail.depositAmount}
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount" span={1}>
                  ${contractDetail.totalAmount}
                </Descriptions.Item>
                <Descriptions.Item label="Start Location" span={2}>
                  {contractDetail.startLocation}
                </Descriptions.Item>
                <Descriptions.Item label="End Location" span={2}>
                  {contractDetail.endLocation}
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={1}>
                  <Tag color="green">{contractDetail.status}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Signed By" span={1}>
                  {contractDetail.signedByUsername || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Signed Date" span={2}>
                  {contractDetail.signedDate
                    ? dayjs(contractDetail.signedDate).format("YYYY-MM-DD HH:mm")
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Divider />

            {/* Danh sách nhân viên được gán */}
            <Card 
              title="Assigned Employees" 
              size="small"
              extra={
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={handleOpenAssignModal}
                  size="small"
                >
                  Assign Employee
                </Button>
              }
            >
              {assignedEmployees.length === 0 ? (
                <div className="empty-state">
                  <UserAddOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                  <p style={{ color: "#999", marginTop: 16 }}>
                    No employees assigned yet
                  </p>
                </div>
              ) : (
                <List
                  dataSource={assignedEmployees}
                  renderItem={(emp) => (
                    <List.Item
                      actions={[
                        <Button
                          key="remove"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("🔴 Remove button clicked!", emp.employeeId);
                            handleUnassign(emp.employeeId);
                          }}
                        >
                          Remove
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<UserAddOutlined style={{ fontSize: 24, color: "#1890ff" }} />}
                        title={emp.username}
                        description={emp.position}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Space>
        )}
      </Modal>

      {/* Modal gán nhân viên */}
      <Modal
        title={
          <Space>
            <UserAddOutlined />
            <span>Assign Employee to Contract</span>
          </Space>
        }
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false);
          setSelectedEmployee(null);
          setAssignedDate(null);
        }}
        onOk={handleAssign}
        confirmLoading={loading}
        okText="Assign"
        cancelText="Cancel"
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              Select Employee
            </label>
            <Select
              placeholder="Choose an employee"
              size="large"
              onChange={(value) => setSelectedEmployee(value)}
              style={{ width: "100%" }}
              value={selectedEmployee}
              showSearch
              optionFilterProp="children"
            >
              {freeEmployees.map((emp) => (
                <Option key={emp.employeeId} value={emp.employeeId}>
                  <Space>
                    <UserAddOutlined />
                    {emp.username} - {emp.position}
                  </Space>
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              Assigned Date
            </label>
            <DatePicker
              size="large"
              style={{ width: "100%" }}
              onChange={(date) => setAssignedDate(date)}
              value={assignedDate}
              suffixIcon={<CalendarOutlined />}
              format="YYYY-MM-DD"
            />
          </div>
        </Space>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        title="Confirm Unassign"
        open={employeeToRemove !== null}
        onCancel={() => setEmployeeToRemove(null)}
        onOk={confirmUnassign}
        okText="Yes, Remove"
        okType="danger"
        cancelText="Cancel"
      >
        <p>Are you sure you want to remove this employee from the contract?</p>
      </Modal>
    </div>
  );
}