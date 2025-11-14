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
  const [availableDrivers, setAvailableDrivers] = useState([]);

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [driverModalVisible, setDriverModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [assignError, setAssignError] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [vehicleForDriver, setVehicleForDriver] = useState(null);
  const [selectedDriverForVehicle, setSelectedDriverForVehicle] = useState(null);
  const [driverModalError, setDriverModalError] = useState(null);
  const [driverModalLoading, setDriverModalLoading] = useState(false);

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
      const [detailRes, vehiclesRes, driversRes] = await Promise.all([
        ContractAPI.getById(contractId),
        vehicleApi.getVehiclesByContract(contractId),
        vehicleApi.getAvailableDrivers(),
      ]);
      setContractDetail(detailRes);
      setAssignedVehicles(vehiclesRes.data || []);
      setAvailableDrivers(driversRes.data || []);
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
      const [vehiclesRes, driversRes] = await Promise.all([
        vehicleApi.getAvailableVehicles(),
        vehicleApi.getAvailableDrivers(),
      ]);
      setAvailableVehicles(vehiclesRes.data || []);
      setAvailableDrivers(driversRes.data || []);
      setAssignModalVisible(true);
      setAssignError(null);
      setSelectedVehicle(null);
      setSelectedDriver(null);
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

    if (!selectedDriver) {
      setAssignError("Vui lòng chọn tài xế cho xe này");
      return;
    }

    const isAlreadyAssigned = assignedVehicles.some(
      (vehicle) => vehicle.vehicleId === selectedVehicle
    );

    if (isAlreadyAssigned) {
      setAssignError("Xe này đã được phân công cho hợp đồng này!");
      return;
    }

    setLoading(true);
    setAssignError(null);
    try {
      await vehicleApi.assignVehicleToContract({
        contractId: selectedContract,
        vehicleId: selectedVehicle,
        driverId: selectedDriver,
      });

      message.success("Phân công xe thành công!");
      setAssignModalVisible(false);
      setSelectedVehicle(null);
      setSelectedDriver(null);
      setAssignError(null);

      const [vehiclesRes, driversRes] = await Promise.all([
        vehicleApi.getVehiclesByContract(selectedContract),
        vehicleApi.getAvailableDrivers(),
      ]);
      setAssignedVehicles(vehiclesRes.data || []);
      setAvailableDrivers(driversRes.data || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Lỗi khi phân công xe. Vui lòng thử lại.";
      
      setAssignError(errorMessage);
      message.error(errorMessage);
      console.error("Assignment error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDriverModal = async (vehicle) => {
    setVehicleForDriver(vehicle);
    setDriverModalVisible(true);
    setDriverModalError(null);
    setDriverModalLoading(true);
    try {
      const res = await vehicleApi.getAvailableDrivers();
      let drivers = res.data || [];

      if (vehicle?.driverId && !drivers.some((d) => d.employeeId === vehicle.driverId)) {
        drivers = [
          ...drivers,
          {
            employeeId: vehicle.driverId,
            username: vehicle.driverUsername,
            fullName: vehicle.driverUsername,
            phone: "",
            status: "BUSY",
          },
        ];
      }

      setAvailableDrivers(drivers);
      setSelectedDriverForVehicle(vehicle?.driverId || null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Không thể tải danh sách tài xế";
      setDriverModalError(errorMessage);
      message.error(errorMessage);
    } finally {
      setDriverModalLoading(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!vehicleForDriver) {
      setDriverModalError("Không xác định được xe cần phân công");
      return;
    }

    if (!selectedDriverForVehicle) {
      setDriverModalError("Vui lòng chọn tài xế");
      return;
    }

    setDriverModalLoading(true);
    try {
      await vehicleApi.assignDriverToVehicle({
        contractId: selectedContract,
        vehicleId: vehicleForDriver.vehicleId,
        driverId: selectedDriverForVehicle,
      });

      message.success("Phân công tài xế thành công!");

      const [vehiclesRes, driversRes] = await Promise.all([
        vehicleApi.getVehiclesByContract(selectedContract),
        vehicleApi.getAvailableDrivers(),
      ]);

      setAssignedVehicles(vehiclesRes.data || []);
      setAvailableDrivers(driversRes.data || []);
      setDriverModalVisible(false);
      setVehicleForDriver(null);
      setSelectedDriverForVehicle(null);
      setDriverModalError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Không thể phân công tài xế";
      setDriverModalError(errorMessage);
      message.error(errorMessage);
    } finally {
      setDriverModalLoading(false);
    }
  };

  const handleUnassign = async (vehicleId) => {
    try {
      await vehicleApi.unassignVehicleFromContract(selectedContract, vehicleId);
      message.success("Hủy phân công xe thành công!");

      const [detailRes, vehiclesRes, driversRes] = await Promise.all([
        ContractAPI.getById(selectedContract),
        vehicleApi.getVehiclesByContract(selectedContract),
        vehicleApi.getAvailableDrivers(),
      ]);

      setContractDetail(detailRes);
      setAssignedVehicles(vehiclesRes.data || []);
      setAvailableDrivers(driversRes.data || []);
    } catch (err) {
      message.error(
        err.response?.data?.message || err.message || "Không thể hủy phân công xe"
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
                  Quản Lý Phân Công Xe Cho Hợp Đồng
                </Title>
                <Text className="page-subtitle">
                  Phân công và quản lý phương tiện vận chuyển cho các hợp đồng
                </Text>
              </div>
            </div>
            
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
                title="Đã Phân Công Xe"
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
                title="Chờ Phân Công Xe"
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
                Thông tin hợp đồng và danh sách xe đã phân công
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
                    <span>Danh Sách Xe Đã Phân Công</span>
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
                    Phân Công Xe Mới
                  </Button>
                }
              >
                {assignedVehicles.length === 0 ? (
                  <Empty
                    description="Chưa có xe nào được phân công cho hợp đồng này"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="empty-state"
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleOpenAssignModal}
                    >
                      Phân Công Xe Ngay
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
                            <div className="vehicle-info-row">
                              <UserOutlined className="vehicle-info-icon" />
                              <Text>Tài xế: </Text>
                              <Text strong>{vehicle.driverUsername || "Chưa phân công"}</Text>
                            </div>
                          </div>
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <Button
                              icon={<UserOutlined />}
                              className="assign-driver-btn"
                              block
                              onClick={() => handleOpenDriverModal(vehicle)}
                            >
                              {vehicle.driverUsername ? "Đổi tài xế" : "Phân công tài xế"}
                            </Button>
                            <Popconfirm
                              title="Xác nhận hủy phân công xe"
                              description="Bạn có chắc chắn muốn hủy phân công xe này khỏi hợp đồng không?"
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
                              >
                                Hủy Phân Công
                              </Button>
                            </Popconfirm>
                          </Space>
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
                Phân Công Xe Cho Hợp Đồng
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
          setSelectedDriver(null);
          setAssignError(null);
        }}
        onOk={handleAssign}
        confirmLoading={loading}
        okText="Xác Nhận Phân Công"
        cancelText="Hủy"
        okButtonProps={{
          disabled: !selectedVehicle || !selectedDriver || loading,
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
          <div className="select-wrapper" style={{ marginTop: 16 }}>
            <Text strong className="select-label">
              Chọn Tài Xế <span style={{ color: "#ff4d4f" }}>*</span>
            </Text>
            <Select
              placeholder="Chọn một tài xế"
              size="large"
              onChange={(value) => {
                setSelectedDriver(value);
                setAssignError(null);
              }}
              style={{ width: "100%" }}
              value={selectedDriver}
              showSearch
              optionFilterProp="children"
              disabled={loading}
              className="driver-select"
              getPopupContainer={(triggerNode) => {
                const modalContainer = document.querySelector('.assign-modal .ant-modal-body');
                return modalContainer || triggerNode.parentElement || document.body;
              }}
              dropdownStyle={{ zIndex: 1020 }}
              notFoundContent={
                <Empty
                  description="Không có tài xế khả dụng"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: "20px 0" }}
                />
              }
            >
              {availableDrivers.map((driver) => (
                <Option key={driver.employeeId} value={driver.employeeId}>
                  <div className="vehicle-option">
                    <UserOutlined className="vehicle-option-icon" />
                    <div className="vehicle-option-content">
                      <Text strong>{driver.fullName || driver.username}</Text>
                      {driver.phone && (
                        <Text type="secondary" className="vehicle-option-plate">
                          {driver.phone}
                        </Text>
                      )}
                    </div>
                    <Tag
                      color={
                        driver.status && driver.status.toLowerCase() === "free" ? "green" : "orange"
                      }
                      className="vehicle-option-tag"
                    >
                      {driver.status || "N/A"}
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

      <Modal
        title={
          <div className="modal-header-custom">
            <div className="modal-icon-wrapper modal-icon-primary">
              <UserOutlined />
            </div>
            <div>
              <Title level={4} className="modal-title">
                {vehicleForDriver?.licensePlate
                  ? `Phân công tài xế cho ${vehicleForDriver.licensePlate}`
                  : "Phân công tài xế"}
              </Title>
              <Text type="secondary" className="modal-subtitle">
                Chọn tài xế phù hợp cho xe này
              </Text>
            </div>
          </div>
        }
        open={driverModalVisible}
        onCancel={() => {
          setDriverModalVisible(false);
          setVehicleForDriver(null);
          setSelectedDriverForVehicle(null);
          setDriverModalError(null);
        }}
        onOk={handleAssignDriver}
        confirmLoading={driverModalLoading}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          disabled: !selectedDriverForVehicle || driverModalLoading,
        }}
        className="assign-driver-modal"
        width={600}
        zIndex={1015}
        maskClosable={false}
      >
        <div className="assign-modal-content">
          {driverModalError && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span>{driverModalError}</span>
            </div>
          )}
          <div className="select-wrapper">
            <Text strong className="select-label">
              Chọn tài xế <span style={{ color: "#ff4d4f" }}>*</span>
            </Text>
            <Select
              placeholder="Chọn tài xế từ danh sách"
              size="large"
              onChange={(value) => {
                setSelectedDriverForVehicle(value);
                setDriverModalError(null);
              }}
              style={{ width: "100%" }}
              value={selectedDriverForVehicle}
              showSearch
              optionFilterProp="children"
              disabled={driverModalLoading}
              className="driver-select"
              getPopupContainer={(triggerNode) => {
                const modalContainer = document.querySelector('.assign-driver-modal .ant-modal-body');
                return modalContainer || triggerNode.parentElement || document.body;
              }}
              dropdownStyle={{ zIndex: 1030 }}
              notFoundContent={
                <Empty
                  description="Không có tài xế khả dụng"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: "20px 0" }}
                />
              }
            >
              {availableDrivers.map((driver) => (
                <Option key={driver.employeeId} value={driver.employeeId}>
                  <div className="vehicle-option">
                    <UserOutlined className="vehicle-option-icon" />
                    <div className="vehicle-option-content">
                      <Text strong>{driver.fullName || driver.username}</Text>
                      {driver.phone && (
                        <Text type="secondary" className="vehicle-option-plate">
                          {driver.phone}
                        </Text>
                      )}
                    </div>
                    <Tag
                      color={
                        driver.status && driver.status.toLowerCase() === "free" ? "green" : "orange"
                      }
                      className="vehicle-option-tag"
                    >
                      {driver.status || "N/A"}
                    </Tag>
                  </div>
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
