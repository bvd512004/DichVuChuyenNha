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
  Divider,
  Descriptions,
  Popconfirm,
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
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
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
      setSelectedVehicle(null);
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

  const handleUnassign = async (vehicleId) => {
    try {
      await vehicleApi.unassignVehicleFromContract(selectedContract, vehicleId);
      message.success("Hủy gán xe thành công!");

      const [detailRes, vehiclesRes] = await Promise.all([
        ContractAPI.getById(selectedContract),
        vehicleApi.getVehiclesByContract(selectedContract),
      ]);

      setContractDetail(detailRes);
      setAssignedVehicles(vehiclesRes.data || []);
    } catch (err) {
      message.error(
        err.response?.data?.message || err.message || "Không thể hủy gán xe"
      );
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
  };

  const columns = [
    {
      title: "Mã Hợp Đồng",
      dataIndex: "contractId",
      key: "contractId",
      width: 140,
      render: (id) => (
        <div className="contract-id-cell">
          <FileTextOutlined className="contract-id-icon" />
          <Text strong className="contract-id-text">#{id}</Text>
        </div>
      ),
    },
    {
      title: "Khách Hàng",
      dataIndex: "username",
      key: "username",
      width: 180,
      render: (username, record) => (
        <div className="customer-cell">
          <Avatar size="small" icon={<UserOutlined />} className="customer-avatar" />
          <div>
            <Text strong>{username || "N/A"}</Text>
            {record.companyName && (
              <div>
                <Tag color="cyan" size="small">{record.companyName}</Tag>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Tổng Tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: (amount) => (
        <Text strong className="amount-cell">
          {formatCurrency(amount)} ₫
        </Text>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => (
        <Tag color={getStatusColor(status)} className="status-tag">
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Xe Đã Gán",
      key: "hasVehicles",
      width: 120,
      render: (_, record) => (
        <Badge
          count={record.hasVehicles ? 1 : 0}
          showZero
          style={{
            backgroundColor: record.hasVehicles ? "#52c41a" : "#faad14",
          }}
        >
          <CarOutlined style={{ fontSize: 20, color: record.hasVehicles ? "#52c41a" : "#d9d9d9" }} />
        </Badge>
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 120,
      fixed: "right",
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

  const assignedCount = contracts.filter((c) => c.hasVehicles).length;
  const pendingCount = contracts.filter((c) => !c.hasVehicles).length;

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
              <div className="header-text">
                <Title level={2} className="page-title">
                  Quản Lý Gán Xe Cho Hợp Đồng
                </Title>
                <Text className="page-subtitle">
                  Phân công và quản lý phương tiện vận chuyển cho các hợp đồng
                </Text>
              </div>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadContracts}
              className="refresh-btn"
              size="large"
            >
              Làm Mới
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[20, 20]} className="stats-row">
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card stat-card-primary" hoverable>
              <Statistic
                title="Tổng Hợp Đồng"
                value={contracts.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#1890ff" }}
                suffix={<span className="stat-suffix">hợp đồng</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card stat-card-success" hoverable>
              <Statistic
                title="Đã Gán Xe"
                value={assignedCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
                suffix={<span className="stat-suffix">hợp đồng</span>}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card stat-card-warning" hoverable>
              <Statistic
                title="Chờ Gán Xe"
                value={pendingCount}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
                suffix={<span className="stat-suffix">hợp đồng</span>}
              />
            </Card>
          </Col>
        </Row>

        {/* Contracts Table */}
        <Card className="main-table-card">
          <div className="table-header">
            <Title level={4} className="table-title">
              <FileTextOutlined /> Danh Sách Hợp Đồng
            </Title>
            <Text type="secondary">Tổng {contracts.length} hợp đồng đã ký</Text>
          </div>
          <Table
            dataSource={contracts}
            rowKey="contractId"
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hợp đồng`,
              showQuickJumper: true,
              pageSizeOptions: ["10", "20", "50"],
            }}
            className="vehicle-table"
            rowClassName="table-row"
            scroll={{ x: 1000 }}
          />
        </Card>
      </Spin>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="modal-header-custom">
            <div className="modal-icon-wrapper">
              <CarOutlined />
            </div>
            <div>
              <Title level={4} className="modal-title">
                Chi Tiết Hợp Đồng #{contractDetail?.contractId}
              </Title>
              <Text type="secondary" className="modal-subtitle">
                Thông tin hợp đồng và danh sách xe đã gán
              </Text>
            </div>
          </div>
        }
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={null}
        width={1000}
        className="detail-modal"
        destroyOnClose
        zIndex={1000}
      >
        <Spin spinning={loading}>
          {contractDetail && (
            <div className="modal-content-wrapper">
              {/* Contract Info Section */}
              <Card className="contract-info-card" bordered={false}>
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <div className="info-block">
                      <div className="info-block-header">
                        <CalendarOutlined className="info-block-icon" />
                        <Text strong>Thông Tin Hợp Đồng</Text>
                      </div>
                      <Divider style={{ margin: "12px 0" }} />
                      <Descriptions column={1} size="small" className="info-descriptions">
                        <Descriptions.Item label="Ngày Bắt Đầu">
                          {contractDetail.startDate
                            ? dayjs(contractDetail.startDate).format("DD/MM/YYYY")
                            : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày Kết Thúc">
                          {contractDetail.endDate
                            ? dayjs(contractDetail.endDate).format("DD/MM/YYYY")
                            : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày Chuyển">
                          {contractDetail.movingDay
                            ? dayjs(contractDetail.movingDay).format("DD/MM/YYYY")
                            : "N/A"}
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="info-block">
                      <div className="info-block-header">
                        <DollarOutlined className="info-block-icon" />
                        <Text strong>Thông Tin Thanh Toán</Text>
                      </div>
                      <Divider style={{ margin: "12px 0" }} />
                      <Descriptions column={1} size="small" className="info-descriptions">
                        <Descriptions.Item label="Tiền Đặt Cọc">
                          <Text strong style={{ color: "#1890ff" }}>
                            {formatCurrency(contractDetail.depositAmount)} ₫
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng Số Tiền">
                          <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                            {formatCurrency(contractDetail.totalAmount)} ₫
                          </Text>
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  </Col>
                  <Col xs={24}>
                    <div className="info-block">
                      <div className="info-block-header">
                        <UserOutlined className="info-block-icon" />
                        <Text strong>Thông Tin Khách Hàng</Text>
                      </div>
                      <Divider style={{ margin: "12px 0" }} />
                      <div className="customer-info">
                        <Avatar size={48} icon={<UserOutlined />} className="customer-info-avatar" />
                        <div className="customer-info-details">
                          <Text strong style={{ fontSize: 16 }}>
                            {contractDetail.username || "N/A"}
                          </Text>
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

              {/* Vehicles Section */}
              <Card
                className="vehicles-section-card"
                bordered={false}
                title={
                  <div className="vehicles-card-title">
                    <CarOutlined className="vehicles-card-icon" />
                    <span>Danh Sách Xe Đã Gán</span>
                    <Badge count={assignedVehicles.length} showZero className="vehicles-badge" />
                  </div>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleOpenAssignModal}
                    className="assign-btn"
                    size="large"
                  >
                    Gán Xe Mới
                  </Button>
                }
              >
                {assignedVehicles.length === 0 ? (
                  <Empty
                    description="Chưa có xe nào được gán cho hợp đồng này"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="empty-state"
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleOpenAssignModal}
                    >
                      Gán Xe Ngay
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[16, 16]}>
                    {assignedVehicles.map((vehicle) => (
                      <Col xs={24} sm={12} lg={8} key={vehicle.vehicleId}>
                        <Card className="vehicle-item-card" hoverable>
                          <div className="vehicle-item-header">
                            <Avatar
                              size={56}
                              icon={<CarOutlined />}
                              className="vehicle-item-avatar"
                            />
                            <div className="vehicle-item-title">
                              <Text strong className="vehicle-type-text">
                                {vehicle.vehicleType}
                              </Text>
                              <Text className="vehicle-plate-text">
                                {vehicle.licensePlate}
                              </Text>
                            </div>
                          </div>
                          <Divider style={{ margin: "16px 0" }} />
                          <div className="vehicle-item-info">
                            <div className="vehicle-info-row">
                              <SafetyOutlined className="vehicle-info-icon" />
                              <Text>Dung tích: </Text>
                              <Text strong>{vehicle.capacity} tấn</Text>
                            </div>
                            <div className="vehicle-info-row">
                              <ThunderboltOutlined className="vehicle-info-icon" />
                              <Text>Trạng thái: </Text>
                              <Tag
                                color={vehicle.status === "AVAILABLE" ? "success" : "warning"}
                                className="vehicle-status-tag"
                              >
                                {vehicle.status}
                              </Tag>
                            </div>
                            {vehicle.driverUsername && (
                              <div className="vehicle-info-row">
                                <UserOutlined className="vehicle-info-icon" />
                                <Text>Tài xế: </Text>
                                <Text strong>{vehicle.driverUsername}</Text>
                              </div>
                            )}
                          </div>
                          <Popconfirm
                            title="Xác nhận hủy gán xe"
                            description="Bạn có chắc chắn muốn hủy gán xe này khỏi hợp đồng không?"
                            onConfirm={() => handleUnassign(vehicle.vehicleId)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okType="danger"
                          >
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              className="remove-vehicle-btn"
                              block
                              style={{ marginTop: 16 }}
                            >
                              Hủy Gán
                            </Button>
                          </Popconfirm>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            </div>
          )}
        </Spin>
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal
        title={
          <div className="modal-header-custom">
            <div className="modal-icon-wrapper modal-icon-primary">
              <PlusOutlined />
            </div>
            <div>
              <Title level={4} className="modal-title">
                Gán Xe Cho Hợp Đồng
              </Title>
              <Text type="secondary" className="modal-subtitle">
                Chọn xe từ danh sách xe có sẵn
              </Text>
            </div>
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
        okButtonProps={{
          disabled: !selectedVehicle || loading,
          className: "assign-modal-ok-btn",
        }}
        className="assign-modal"
        width={700}
        zIndex={1010}
        mask={true}
        maskClosable={false}
      >
        <div className="assign-modal-content" id="assign-modal-container">
          {assignError && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span>{assignError}</span>
            </div>
          )}
          <div className="select-wrapper">
            <Text strong className="select-label">
              Chọn Xe <span style={{ color: "#ff4d4f" }}>*</span>
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
              getPopupContainer={(triggerNode) => {
                const modalContainer = document.querySelector('.assign-modal .ant-modal-body');
                return modalContainer || triggerNode.parentElement || document.body;
              }}
              dropdownStyle={{ zIndex: 1020 }}
              notFoundContent={
                <Empty
                  description="Không có xe nào khả dụng"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: "20px 0" }}
                />
              }
            >
              {availableVehicles.map((vehicle) => (
                <Option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                  <div className="vehicle-option">
                    <CarOutlined className="vehicle-option-icon" />
                    <div className="vehicle-option-content">
                      <Text strong>{vehicle.vehicleType}</Text>
                      <Text type="secondary" className="vehicle-option-plate">
                        {vehicle.licensePlate}
                      </Text>
                    </div>
                    <Tag color="blue" className="vehicle-option-tag">
                      {vehicle.capacity} tấn
                    </Tag>
                  </div>
                </Option>
              ))}
            </Select>
          </div>
          {contractDetail && (
            <Card className="info-banner" size="small">
              <div className="info-banner-content">
                <CalendarOutlined className="info-banner-icon" />
                <div>
                  <Text strong>Ngày Chuyển: </Text>
                  <Text>
                    {contractDetail.movingDay
                      ? dayjs(contractDetail.movingDay).format("DD/MM/YYYY")
                      : "N/A"}
                  </Text>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Modal>
    </div>
  );
}
