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
  CarOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import VehicleAssignmentAPI from "../service/vehicleAssignment";
import ContractAPI from "../service/contract";
import dayjs from "dayjs";
import "./style/ContractAssignment.css";

const { Title } = Typography;
const { Option } = Select;

export default function VehicleAssignment() {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractDetail, setContractDetail] = useState(null);
  const [assignedVehicles, setAssignedVehicles] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleToRemove, setVehicleToRemove] = useState(null);
  const [assignError, setAssignError] = useState(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const res = await ContractAPI.getAll();
      console.log("Contracts loaded:", res.data);
      setContracts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading contracts:", err);
      message.error("Failed to load contracts");
    }
  };

  const handleViewDetails = async (contractId) => {
    setSelectedContract(contractId);
    setLoading(true);
    try {
      const [detailRes, assignedRes] = await Promise.all([
        ContractAPI.getById(contractId),
        VehicleAssignmentAPI.getAssignedVehicles(contractId),
      ]);
      setContractDetail(detailRes);
      setAssignedVehicles(assignedRes.data);
      setDetailModalVisible(true);
    } catch {
      message.error("Failed to load contract details or assigned vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = async () => {
    try {
      const res = await VehicleAssignmentAPI.getAvailableVehicles();
      setAvailableVehicles(res.data);
      setAssignModalVisible(true);
      setAssignError(null);
    } catch {
      message.error("Failed to load available vehicles");
    }
  };

  const handleAssign = async () => {
    if (!selectedVehicle) {
      setAssignError("Please select a vehicle");
      return;
    }

    // Kiểm tra xem xe đã được gán vào hợp đồng này chưa
    const isAlreadyAssigned = assignedVehicles.some(
      (vehicle) => vehicle.vehicleId === selectedVehicle
    );

    if (isAlreadyAssigned) {
      setAssignError("This vehicle has already been assigned to this contract!");
      return;
    }

    setLoading(true);
    setAssignError(null);
    try {
      // Lấy ngày movingDay từ contractDetail
      const assignedDate = dayjs(contractDetail.movingDay).format("YYYY-MM-DD");

      // Gửi yêu cầu gán xe vào hợp đồng
      await VehicleAssignmentAPI.assignVehicle(
        selectedContract,
        selectedVehicle,
        assignedDate
      );

      message.success("Vehicle assigned successfully!");
      setAssignModalVisible(false);
      setSelectedVehicle(null);
      setAssignError(null);

      // Refresh assigned vehicles list
      const assignedRes = await VehicleAssignmentAPI.getAssignedVehicles(selectedContract);
      setAssignedVehicles(assignedRes.data);
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data || 
        err.message || 
        "Error assigning vehicle. The vehicle might be busy on this date.";
      
      setAssignError(errorMessage);
      message.error(errorMessage);
      console.error("Vehicle assignment error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = (vehicleId) => {
    setVehicleToRemove(vehicleId);
  };

  const confirmUnassign = async () => {
    if (!vehicleToRemove) return;

    try {
      await VehicleAssignmentAPI.unassignVehicle(selectedContract, vehicleToRemove);
      message.success("Vehicle unassigned successfully!");

      const [detailRes, assignedRes] = await Promise.all([
        ContractAPI.getById(selectedContract),
        VehicleAssignmentAPI.getAssignedVehicles(selectedContract),
      ]);

      setContractDetail(detailRes);
      setAssignedVehicles(assignedRes.data);
      setVehicleToRemove(null);
    } catch (err) {
      message.error(err.response?.data?.message || err.message || "Failed to unassign vehicle");
      setVehicleToRemove(null);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setContractDetail(null);
    setAssignedVehicles([]);
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
            : status === "SIGNED"
            ? "green"
            : status === "COMPLETED"
            ? "blue"
            : "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: (amount) => `$${amount?.toLocaleString() || 0}`,
    },
    {
      title: "Moving Day",
      dataIndex: "movingDay",
      key: "movingDay",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record.contractId)}
          >
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="contract-assignment-container">
      <Card>
        <Title level={2}>
          <CarOutlined /> Vehicle Assignment Management
        </Title>
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="contractId"
          pagination={{ pageSize: 10 }}
          loading={loading}
          locale={{ emptyText: "Không có hợp đồng nào. Hãy tạo hợp đồng từ báo giá đã được duyệt." }}
        />
      </Card>

      {/* Contract Details Modal */}
      <Modal
        title="Contract Details & Vehicle Assignment"
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        width={1000}
        footer={null}
      >
        {contractDetail && (
          <div>
            <Descriptions
              title="Contract Information"
              bordered
              column={2}
              size="small"
            >
              <Descriptions.Item label="Contract ID">
                #{contractDetail.contractId}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="green">{contractDetail.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                ${contractDetail.totalAmount?.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Moving Day">
                {dayjs(contractDetail.movingDay).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {dayjs(contractDetail.startDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {dayjs(contractDetail.endDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<CarOutlined />}
                  onClick={handleOpenAssignModal}
                >
                  Assign Vehicle
                </Button>
              </Space>
            </div>

            <Title level={4}>Assigned Vehicles</Title>
            <List
              dataSource={assignedVehicles}
              renderItem={(vehicle) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleUnassign(vehicle.vehicleId)}
                    >
                      Unassign
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={`${vehicle.vehicleType} - ${vehicle.licensePlate}`}
                    description={
                      <div>
                        <div>Capacity: {vehicle.capacity} tons</div>
                        <div>Driver: {vehicle.driverName} ({vehicle.driverPosition})</div>
                        <div>Status: <Tag color="blue">{vehicle.status}</Tag></div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal
        title="Assign Vehicle to Contract"
        open={assignModalVisible}
        onOk={handleAssign}
        onCancel={() => {
          setAssignModalVisible(false);
          setSelectedVehicle(null);
          setAssignError(null);
        }}
        confirmLoading={loading}
        okText="Assign Vehicle"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <label>Select Vehicle:</label>
          <Select
            style={{ width: "100%", marginTop: 8 }}
            placeholder="Choose a vehicle"
            value={selectedVehicle}
            onChange={setSelectedVehicle}
          >
            {availableVehicles.map((vehicle) => (
              <Option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                {vehicle.vehicleType} - {vehicle.licensePlate} ({vehicle.capacity} tons)
                {vehicle.driverName && ` - Driver: ${vehicle.driverName}`}
              </Option>
            ))}
          </Select>
        </div>

        {assignError && (
          <div style={{ color: "red", marginTop: 8 }}>
            {assignError}
          </div>
        )}
      </Modal>

      {/* Unassign Confirmation Modal */}
      <Modal
        title="Confirm Unassign Vehicle"
        open={!!vehicleToRemove}
        onOk={confirmUnassign}
        onCancel={() => setVehicleToRemove(null)}
        okText="Yes, Unassign"
        cancelText="Cancel"
      >
        <p>Are you sure you want to unassign this vehicle from the contract?</p>
      </Modal>
    </div>
  );
}

