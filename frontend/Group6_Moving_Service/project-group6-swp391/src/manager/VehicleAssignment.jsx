import React, { useState, useEffect } from "react";
import { Table, Button, message, Modal, Select, Space, Typography, List, Divider, Descriptions, Card, Tag } from "antd";
import { FileTextOutlined, CarOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
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
      setContracts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading contracts:", err);
      message.error("Không thể tải danh sách hợp đồng");
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
      setAssignedVehicles(assignedRes.data || []);
      setDetailModalVisible(true);
    } catch {
      message.error("Không thể tải chi tiết hợp đồng hoặc danh sách xe đã gán");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = async () => {
    try {
      const res = await VehicleAssignmentAPI.getAvailableVehicles();
      setAvailableVehicles(res.data || []);
      setAssignModalVisible(true);
      setAssignError(null);
    } catch {
      message.error("Không thể tải danh sách xe có sẵn");
    }
  };

  const handleAssign = async () => {
    if (!selectedVehicle) {
      setAssignError("Vui lòng chọn xe");
      return;
    }

    const isAlreadyAssigned = assignedVehicles.some((vehicle) => vehicle.vehicleId === selectedVehicle);

    if (isAlreadyAssigned) {
      setAssignError("Xe này đã được gán vào hợp đồng!");
      return;
    }

    setLoading(true);
    setAssignError(null);
    try {
      const assignedDate = dayjs(contractDetail.movingDay).format("YYYY-MM-DD");

      await VehicleAssignmentAPI.assignVehicle(selectedContract, selectedVehicle, assignedDate);

      message.success("Gán xe thành công!");
      setAssignModalVisible(false);
      setSelectedVehicle(null);
      setAssignError(null);

      const assignedRes = await VehicleAssignmentAPI.getAssignedVehicles(selectedContract);
      setAssignedVehicles(assignedRes.data || []);
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data || 
        err.message || 
        "Lỗi gán xe. Xe có thể đang bận vào ngày này.";
      
      setAssignError(errorMessage);
      message.error(errorMessage);
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
      message.success("Bỏ gán xe thành công!");

      const [detailRes, assignedRes] = await Promise.all([
        ContractAPI.getById(selectedContract),
        VehicleAssignmentAPI.getAssignedVehicles(selectedContract),
      ]);

      setContractDetail(detailRes);
      setAssignedVehicles(assignedRes.data || []);
      setVehicleToRemove(null);
    } catch (err) {
      message.error(err.response?.data?.message || err.message || "Không thể bỏ gán xe");
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
      title: "Mã Hợp Đồng",
      dataIndex: "contractId",
      key: "contractId",
      width: 150,
      render: (id) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        const color = status === "PENDING" ? "orange" : status === "SIGNED" ? "green" : status === "COMPLETED" ? "blue" : "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Tổng giá",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: (amount) => `${amount?.toLocaleString() || 0} đ`,
    },
    {
      title: "Ngày chuyển",
      dataIndex: "movingDay",
      key: "movingDay",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EyeOutlined />} onClick={() => handleViewDetails(record.contractId)}>
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="contract-assignment-container">
      <Card>
        <Title level={2}>
          <CarOutlined /> Phân Công Phương Tiện
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
        title="Chi Tiết Hợp Đồng & Phân Công Phương Tiện"
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        width={1000}
        footer={null}
      >
        {contractDetail && (
          <div>
            <Descriptions title="Thông Tin Hợp Đồng" bordered column={2} size="small">
              <Descriptions.Item label="Mã Hợp Đồng">#{contractDetail.contractId}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color="green">{contractDetail.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng giá">{contractDetail.totalAmount?.toLocaleString()} đ</Descriptions.Item>
              <Descriptions.Item label="Ngày chuyển">
                {dayjs(contractDetail.movingDay).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">
                {dayjs(contractDetail.startDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">
                {dayjs(contractDetail.endDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button type="primary" icon={<CarOutlined />} onClick={handleOpenAssignModal}>
                  Gán Xe
                </Button>
              </Space>
            </div>

            <Title level={4}>Xe Đã Được Gán</Title>
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
                      Bỏ gán
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={`${vehicle.vehicleType} - ${vehicle.licensePlate}`}
                    description={
                      <div>
                        <div>Tải trọng: {vehicle.capacity} tấn</div>
                        <div>Tài xế: {vehicle.driverName || "Chưa có"} ({vehicle.driverPosition})</div>
                        <div>Trạng thái: <Tag color="blue">{vehicle.status}</Tag></div>
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
        title="Gán Xe Vào Hợp Đồng"
        open={assignModalVisible}
        onOk={handleAssign}
        onCancel={() => {
          setAssignModalVisible(false);
          setSelectedVehicle(null);
          setAssignError(null);
        }}
        confirmLoading={loading}
        okText="Gán Xe"
        cancelText="Hủy"
      >
        <div style={{ marginBottom: 16 }}>
          <label>Chọn Xe:</label>
          <Select
            style={{ width: "100%", marginTop: 8 }}
            placeholder="Chọn xe"
            value={selectedVehicle}
            onChange={setSelectedVehicle}
          >
            {availableVehicles.map((vehicle) => (
              <Option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                {vehicle.vehicleType} - {vehicle.licensePlate} ({vehicle.capacity} tấn)
                {vehicle.driverName && ` - Tài xế: ${vehicle.driverName}`}
              </Option>
            ))}
          </Select>
        </div>

        {assignError && <div style={{ color: "red", marginTop: 8 }}>{assignError}</div>}
      </Modal>

      {/* Unassign Confirmation Modal */}
      <Modal
        title="Xác Nhận Bỏ Gán Xe"
        open={!!vehicleToRemove}
        onOk={confirmUnassign}
        onCancel={() => setVehicleToRemove(null)}
        okText="Có, Bỏ Gán"
        cancelText="Hủy"
      >
        <p>Bạn có chắc muốn bỏ gán xe này khỏi hợp đồng không?</p>
      </Modal>
    </div>
  );
}

