import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Modal,
  Select,
  Space,
  Typography,
  Card,
  Tag,
  Row,
  Col,
  Statistic,
  Empty,
  Spin,
  Badge,
  Avatar,
  Tooltip,
} from "antd";
import {
  CarOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import vehicleApi from "../service/vehicle";
import ContractAPI from "../service/contract";
import dayjs from "dayjs";
import "./style/VehicleAssignment.css";

const { Title, Text } = Typography;
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
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setPageLoading(true);
    try {
      const res = await vehicleApi.getSignedContracts();
      setContracts(res.data || []);
    } catch (err) {
      console.error("Load contracts error:", err);
      message.error("Không thể tải danh sách hợp đồng đã ký");
    } finally {
      setPageLoading(false);
    }
  };

  const handleViewDetails = async (contractId) => {
    setSelectedContract(contractId);
    setLoading(true);
    try {
      const [detailRes, vehiclesRes] = await Promise.all([
        ContractAPI.getById(contractId),
        vehicleApi.getVehiclesByContract(contractId),
      ]);
      setContractDetail(detailRes);
      setAssignedVehicles(vehiclesRes.data || []);
      setDetailModalVisible(true);
    } catch (err) {
      console.error("Load details error:", err);
      message.error("Không thể tải chi tiết hợp đồng hoặc danh sách xe");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = async () => {
    try {
      const res = await vehicleApi.getAvailableVehicles();
      setAvailableVehicles(res.data || []);
      setAssignModalVisible(true);
      setAssignError(null);
    } catch (err) {
      console.error("Load vehicles error:", err);
      message.error("Không thể tải danh sách xe");
    }
  };

  const handleAssign = async () => {
    if (!selectedVehicle) {
      setAssignError("Vui lòng chọn một xe");
      return;
    }

    const isAlreadyAssigned = assignedVehicles.some(
      (vehicle) => vehicle.vehicleId === selectedVehicle
    );

    if (isAlreadyAssigned) {
      setAssignError("Xe này đã được gán cho hợp đồng này!");
      return;
    }

    setLoading(true);
    setAssignError(null);
    try {
      await vehicleApi.assignVehicleToContract({
        contractId: selectedContract,
        vehicleId: selectedVehicle,
      });

      message.success("Gán xe thành công!");
      setAssignModalVisible(false);
      setSelectedVehicle(null);
      setAssignError(null);

      const vehiclesRes = await vehicleApi.getVehiclesByContract(selectedContract);
      setAssignedVehicles(vehiclesRes.data || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Lỗi khi gán xe. Vui lòng thử lại.";
      
      setAssignError(errorMessage);
      message.error(errorMessage);
      console.error("Assignment error details:", err.response?.data);
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
      await vehicleApi.unassignVehicleFromContract(selectedContract, vehicleToRemove);
      message.success("Hủy gán xe thành công!");

      const [detailRes, vehiclesRes] = await Promise.all([
        ContractAPI.getById(selectedContract),
        vehicleApi.getVehiclesByContract(selectedContract),
      ]);

      setContractDetail(detailRes);
      setAssignedVehicles(vehiclesRes.data || []);
      setVehicleToRemove(null);
    } catch (err) {
      message.error(
        err.response?.data?.message || err.message || "Không thể hủy gán xe"
      );
      setVehicleToRemove(null);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setContractDetail(null);
    setAssignedVehicles([]);
    setSelectedContract(null);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      DEPOSIT_PAID: "success",
      SIGNED: "processing",
      COMPLETED: "default",
      UNSIGNED: "warning",
    };
    return statusMap[status] || "default";
  };

  const getStatusText = (status) => {
    const statusMap = {
      DEPOSIT_PAID: "Đã Thanh Toán",
      SIGNED: "Đã Ký",
      COMPLETED: "Hoàn Thành",
      UNSIGNED: "Chưa Ký",
    };
    return statusMap[status] || status;
  };

  const columns = [
    {
      title: "Mã Hợp Đồng",
      dataIndex: "contractId",
      key: "contractId",
      width: 120,
      render: (id) => (
        <Badge
          count={id}
          showZero
          style={{ backgroundColor: "#667eea" }}
          overflowCount={9999}
        />
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => (
        <Tag color={getStatusColor(status)} className="status-tag">
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record.contractId)}
          loading={loading && selectedContract === record.contractId}
          className="view-detail-btn"
        >
          Chi Tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="vehicle-assignment-container">
      <Spin spinning={pageLoading}>
        {/* Header Section */}
        <div className="page-header-section">
          <div className="header-content">
            <div className="header-left">
              <div className="icon-wrapper">
                <CarOutlined className="header-icon" />
              </div>
              <div>
                <Title level={2} className="page-title">
                  Quản Lý Gán Xe Cho Hợp Đồng
                </Title>
                <Text type="secondary" className="page-subtitle">
                  Quản lý và phân công xe cho các hợp đồng đã được ký
                </Text>
              </div>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadContracts}
              className="refresh-btn"
            >
              Làm Mới
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card">
              <Statistic
                title="Tổng Hợp Đồng"
                value={contracts.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#667eea" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card">
              <Statistic
                title="Đã Gán Xe"
                value={contracts.filter((c) => c.hasVehicles).length || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card">
              <Statistic
                title="Chờ Gán"
                value={contracts.filter((c) => !c.hasVehicles).length || 0}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Contracts Table */}
        <Card className="main-table-card">
          <Table
            dataSource={contracts}
            rowKey="contractId"
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hợp đồng`,
              showQuickJumper: true,
            }}
            className="vehicle-table"
            rowClassName="table-row"
          />
        </Card>
      </Spin>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="modal-header">
            <CarOutlined className="modal-header-icon" />
            <span>Chi Tiết Hợp Đồng #{contractDetail?.contractId}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={null}
        width={900}
        className="detail-modal"
        destroyOnClose
      >
        {contractDetail && (
          <div className="modal-content">
            {/* Contract Info Card */}
            <Card className="info-card" title="Thông Tin Hợp Đồng">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="info-item">
                    <CalendarOutlined className="info-icon" />
                    <div>
                      <Text type="secondary">Ngày Bắt Đầu</Text>
                      <div className="info-value">
                        {contractDetail.startDate
                          ? dayjs(contractDetail.startDate).format("DD/MM/YYYY")
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="info-item">
                    <CalendarOutlined className="info-icon" />
                    <div>
                      <Text type="secondary">Ngày Kết Thúc</Text>
                      <div className="info-value">
                        {contractDetail.endDate
                          ? dayjs(contractDetail.endDate).format("DD/MM/YYYY")
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24}>
                  <div className="info-item">
                    <CarOutlined className="info-icon" />
                    <div>
                      <Text type="secondary">Ngày Chuyển</Text>
                      <div className="info-value">
                        {contractDetail.movingDay
                          ? dayjs(contractDetail.movingDay).format("DD/MM/YYYY")
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="info-item">
                    <DollarOutlined className="info-icon" />
                    <div>
                      <Text type="secondary">Tiền Đặt Cọc</Text>
                      <div className="info-value">
                        {contractDetail.depositAmount?.toLocaleString("vi-VN")} VND
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="info-item">
                    <DollarOutlined className="info-icon" />
                    <div>
                      <Text type="secondary">Tổng Số Tiền</Text>
                      <div className="info-value highlight">
                        {contractDetail.totalAmount?.toLocaleString("vi-VN")} VND
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24}>
                  <div className="info-item">
                    <UserOutlined className="info-icon" />
                    <div>
                      <Text type="secondary">Khách Hàng</Text>
                      <div className="info-value">
                        {contractDetail.username || "N/A"}
                        {contractDetail.companyName && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            {contractDetail.companyName}
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Vehicles Card */}
            <Card
              className="vehicles-card"
              title={
                <div className="card-title-wrapper">
                  <span>Danh Sách Xe Đã Gán</span>
                  <Badge count={assignedVehicles.length} showZero />
                </div>
              }
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleOpenAssignModal}
                  className="assign-btn"
                >
                  Gán Xe Mới
                </Button>
              }
            >
              {assignedVehicles.length === 0 ? (
                <Empty
                  description="Chưa có xe nào được gán"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <Row gutter={[16, 16]}>
                  {assignedVehicles.map((vehicle) => (
                    <Col xs={24} sm={12} key={vehicle.vehicleId}>
                      <Card className="vehicle-card" hoverable>
                        <div className="vehicle-card-content">
                          <div className="vehicle-header">
                            <Avatar
                              size={48}
                              icon={<CarOutlined />}
                              className="vehicle-avatar"
                            />
                            <div className="vehicle-title">
                              <div className="vehicle-type">{vehicle.vehicleType}</div>
                              <div className="vehicle-plate">{vehicle.licensePlate}</div>
                            </div>
                          </div>
                          <div className="vehicle-info">
                            <Tag color="blue" className="info-tag">
                              Dung tích: {vehicle.capacity} tấn
                            </Tag>
                            <Tag
                              color={vehicle.status === "AVAILABLE" ? "green" : "orange"}
                              className="info-tag"
                            >
                              {vehicle.status}
                            </Tag>
                            {vehicle.driverUsername && (
                              <Tag color="purple" className="info-tag">
                                <UserOutlined /> {vehicle.driverUsername}
                              </Tag>
                            )}
                          </div>
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleUnassign(vehicle.vehicleId)}
                            className="remove-vehicle-btn"
                            block
                          >
                            Hủy Gán
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>
          </div>
        )}
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal
        title={
          <div className="modal-header">
            <PlusOutlined className="modal-header-icon" />
            <span>Gán Xe Cho Hợp Đồng</span>
          </div>
        }
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false);
          setSelectedVehicle(null);
          setAssignError(null);
        }}
        onOk={handleAssign}
        confirmLoading={loading}
        okText="Xác Nhận Gán"
        cancelText="Hủy"
        okButtonProps={{ disabled: loading || !!assignError }}
        className="assign-modal"
        width={600}
      >
        <div className="assign-modal-content">
          {assignError && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span>{assignError}</span>
            </div>
          )}
          <div className="select-wrapper">
            <Text strong className="select-label">
              Chọn Xe
            </Text>
            <Select
              placeholder="Chọn một xe từ danh sách"
              size="large"
              onChange={(value) => {
                setSelectedVehicle(value);
                setAssignError(null);
              }}
              style={{ width: "100%" }}
              value={selectedVehicle}
              showSearch
              optionFilterProp="children"
              disabled={loading}
              className="vehicle-select"
            >
              {availableVehicles.map((vehicle) => (
                <Option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                  <div className="vehicle-option">
                    <CarOutlined />
                    <span className="vehicle-option-text">
                      {vehicle.vehicleType} - {vehicle.licensePlate}
                    </span>
                    <Tag color="blue" style={{ marginLeft: "auto" }}>
                      {vehicle.capacity} tấn
                    </Tag>
                  </div>
                </Option>
              ))}
            </Select>
          </div>
          {contractDetail && (
            <Card className="info-banner" size="small">
              <CalendarOutlined />
              <Text>
                <strong>Ngày Chuyển:</strong>{" "}
                {contractDetail.movingDay
                  ? dayjs(contractDetail.movingDay).format("DD/MM/YYYY")
                  : "N/A"}
              </Text>
            </Card>
          )}
        </div>
      </Modal>

      {/* Confirm Unassign Modal */}
      <Modal
        title="Xác Nhận Hủy Gán"
        open={vehicleToRemove !== null}
        onCancel={() => setVehicleToRemove(null)}
        onOk={confirmUnassign}
        okText="Xác Nhận"
        okType="danger"
        cancelText="Hủy"
        className="confirm-modal"
      >
        <div className="confirm-content">
          <p>Bạn có chắc chắn muốn hủy gán xe này khỏi hợp đồng không?</p>
        </div>
      </Modal>
    </div>
  );
}
