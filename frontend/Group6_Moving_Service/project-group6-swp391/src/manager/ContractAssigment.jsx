import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Modal,
  Select,
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
  const [employeeToRemove, setEmployeeToRemove] = useState(null);
  const [assignError, setAssignError] = useState(null);

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
      setAssignError(null);
    } catch {
      message.error("Failed to load employees");
    }
  };

  const handleAssign = async () => {
    if (!selectedEmployee) {
      setAssignError("Please select an employee");
      return;
    }

    const isAlreadyAssigned = assignedEmployees.some(
      (emp) => emp.employeeId === selectedEmployee
    );

    if (isAlreadyAssigned) {
      setAssignError("This employee has already been assigned to this contract!");
      return;
    }

    setLoading(true);
    setAssignError(null);
    try {
      const assignedDate = dayjs(contractDetail.movingDay).format("YYYY-MM-DD");

      await assignmentApi.assignEmployee({
        contractId: selectedContract,
        employeeId: selectedEmployee,
        assignedDate: assignedDate,
      });

      message.success("Employee assigned successfully!");
      setAssignModalVisible(false);
      setSelectedEmployee(null);
      setAssignError(null);

      const assignedRes = await assignmentApi.getAssignmentsByContract(selectedContract);
      setAssignedEmployees(assignedRes.data);
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data || 
        err.message || 
        "Error assigning employee. The employee might be busy on this date.";
      
      setAssignError(errorMessage);
      message.error(errorMessage);
      console.error("Assignment error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = (employeeId) => {
    setEmployeeToRemove(employeeId);
  };

  const confirmUnassign = async () => {
    if (!employeeToRemove) return;

    try {
      await assignmentApi.removeAssignment(selectedContract, employeeToRemove);
      message.success("Employee unassigned successfully!");

      const [detailRes, assignedRes] = await Promise.all([
        ContractAPI.getById(selectedContract),
        assignmentApi.getAssignmentsByContract(selectedContract),
      ]);

      setContractDetail(detailRes);
      setAssignedEmployees(assignedRes.data);
      setEmployeeToRemove(null);
    } catch (err) {
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
        const color =
          status === "PENDING"
            ? "orange"
            : status === "APPROVED"
            ? "green"
            : status === "COMPLETED"
            ? "blue"
            : "default";
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
            <Card title="Thông Tin Hợp Đồng" size="small">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Hợp Đồng Bắt Đầu" span={1}>
                  {dayjs(contractDetail.startDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Hợp Đồng Kết thúc" span={1}>
                  {dayjs(contractDetail.endDate).format("DD/MM/YYYY")}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày Chuyển" span={2}>
                  {contractDetail.movingDay
                    ? dayjs(contractDetail.movingDay).format("DD/MM/YYYY")
                    : "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Tiền Đặt Cọc" span={1}>
                  {contractDetail.depositAmount} VND
                </Descriptions.Item>
                <Descriptions.Item label="Tổng Số Tiền" span={1}>
                  {contractDetail.totalAmount} VND
                </Descriptions.Item>

                <Descriptions.Item label="Địa Điểm Bắt Đầu" span={2}>
                  {contractDetail.startLocation}
                </Descriptions.Item>
                <Descriptions.Item label="Điểm Kết Thúc" span={2}>
                  {contractDetail.endLocation}
                </Descriptions.Item>

                <Descriptions.Item label="Tên Khách Hàng" span={1}>
                  {contractDetail.username || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Tên Công Ty" span={1}>
                  {contractDetail.companyName || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày Kí" span={2}>
                  {contractDetail.signedDate
                    ? dayjs(contractDetail.signedDate).format("DD/MM/YYYY HH:mm")
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Divider />

            <Card
              // title="Assigned Employees"
              size="small"
              extra={
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={handleOpenAssignModal}
                  size="small"
                >
                  Gán Nhân Viên Vào hợp Đồng
                </Button>
              }
            >
              {assignedEmployees.length === 0 ? (
                <div className="empty-state">
                  <UserAddOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                  <p style={{ color: "#999", marginTop: 16 }}>No employees assigned yet</p>
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
          setAssignError(null);
        }}
        onOk={handleAssign}
        confirmLoading={loading}
        okText="Assign"
        cancelText="Cancel"
        okButtonProps={{ disabled: loading || !!assignError }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {assignError && (
            <div style={{ 
              padding: '12px 16px', 
              background: '#fff2e8', 
              border: '1px solid #ffbb96',
              borderRadius: '6px',
              color: '#d4380d',
              marginBottom: '8px',
              fontSize: '14px',
              lineHeight: '1.5',
              animation: 'shake 0.3s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
                <span style={{ flex: 1 }}>{assignError}</span>
              </div>
            </div>
          )}
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              Select Employee
            </label>
            <Select
              placeholder="Choose an employee"
              size="large"
              onChange={(value) => {
                setSelectedEmployee(value);
                setAssignError(null);
              }}
              style={{ width: "100%" }}
              value={selectedEmployee}
              showSearch
              optionFilterProp="children"
              disabled={loading}
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
          
          {contractDetail && (
            <div style={{ 
              padding: '10px', 
              background: '#f0f5ff', 
              borderRadius: '4px',
              fontSize: '13px',
              color: '#666'
            }}>
              <strong>📅 Assignment Date:</strong> {dayjs(contractDetail.movingDay).format("DD/MM/YYYY")}
            </div>
          )}
        </Space>
      </Modal>

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