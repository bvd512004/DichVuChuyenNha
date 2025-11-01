import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Spin,
  Card,
  Tag,
  Space,
  Input,
  Row,
  Col,
  Tooltip,
  Badge,
  Statistic,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  SearchOutlined,
  DollarOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { workProgressApi } from "../service/workprogress";
import "./style/WorkProgressList.css";

const WorkProgressList = () => {
  const [workProgressList, setWorkProgressList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedContract, setSelectedContract] = useState(null); // Store the selected contract

  // Fetch danh sách work progress từ API
  const fetchWorkProgressList = async () => {
    setLoading(true);
    try {
      const response = await workProgressApi.getAllWorkProgress();
      setWorkProgressList(response.data);
      setFilteredData(response.data);
      message.success("Loaded work progress successfully!");
    } catch (error) {
      message.error("Failed to load work progress.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkProgressList();
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = workProgressList.filter(
      (item) =>
        item.employeeName?.toLowerCase().includes(value.toLowerCase()) ||
        item.customerName?.toLowerCase().includes(value.toLowerCase()) ||
        item.serviceName?.toLowerCase().includes(value.toLowerCase()) ||
        item.taskDescription?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // Xử lý khi nhấn "View" để xem work progress của hợp đồng
  const handleViewDetails = async (record) => {
    setSelectedContract(record.contractId); // Set selected contract
    try {
      const response = await workProgressApi.getWorkProgressByContract(record.contractId); // Fetch work progress by contract
      setWorkProgressList(response.data); // Update work progress list based on selected contract
      message.info(`Viewing details for Contract #${record.contractId}`);
    } catch (err) {
      message.error("Failed to load work progress details.");
    }
  };

  // Render status tag với màu sắc
  const renderStatusTag = (status) => {
    const statusConfig = {
      pending: { color: "orange", text: "Pending" },
      in_progress: { color: "blue", text: "In Progress" },
      completed: { color: "green", text: "Completed" },
      cancelled: { color: "red", text: "Cancelled" },
    };

    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Tính toán thống kê
  const statistics = {
    total: workProgressList.length,
    pending: workProgressList.filter((item) => item.progressStatus === "pending").length,
    inProgress: workProgressList.filter((item) => item.progressStatus === "in_progress").length,
    completed: workProgressList.filter((item) => item.progressStatus === "completed").length,
    totalAmount: workProgressList.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0),
  };

  // Cột dữ liệu cho bảng
  const columns = [
    {
      title: "Contract ID",
      dataIndex: "contractId",
      key: "contractId",
      width: 120,
      fixed: "left",
      render: (text) => (
        <Tag color="purple" style={{ fontWeight: 600 }}>
          #{text}
        </Tag>
      ),
    },
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 150,
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: "Task Description",
      dataIndex: "taskDescription",
      key: "taskDescription",
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <Space>
            <FileTextOutlined style={{ color: "#52c41a" }} />
            {text}
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "progressStatus",
      key: "progressStatus",
      width: 140,
      align: "center",
      render: (status) => renderStatusTag(status),
      filters: [
        { text: "Pending", value: "pending" },
        { text: "In Progress", value: "in_progress" },
        { text: "Completed", value: "completed" },
      ],
      onFilter: (value, record) => record.progressStatus === value,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
      render: (text) => (
        <span style={{ color: "#595959", fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: "Service",
      dataIndex: "serviceName",
      key: "serviceName",
      width: 180,
      render: (text) => (
        <Badge status="processing" text={text} />
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      align: "right",
      sorter: (a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount),
      render: (text) => (
        <Space>
          <DollarOutlined style={{ color: "#faad14" }} />
          <span style={{ fontWeight: 600, color: "#fa8c16" }}>
            {Number(text).toLocaleString()} VND 
          </span>
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
          >
            View
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="work-progress-container">
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <CalendarOutlined className="header-icon" />
            <h2>Work Progress Management</h2>
          </div>
          <p className="header-subtitle">Monitor and manage all work progress across contracts</p>
        </div>
      </div>

      <Row gutter={[16, 16]} className="statistics-section">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-total">
            <Statistic
              title="Total Tasks"
              value={statistics.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-pending">
            <Statistic
              title="Pending"
              value={statistics.pending}
              prefix={<Badge status="warning" />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-progress">
            <Statistic
              title="In Progress"
              value={statistics.inProgress}
              prefix={<Badge status="processing" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-completed">
            <Statistic
              title="Completed"
              value={statistics.completed}
              prefix={<Badge status="success" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="table-card">
        <div className="action-bar">
          <Input
            placeholder="Search by employee, customer, service..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{ width: 320 }}
            size="large"
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchWorkProgressList}
            loading={loading}
            size="large"
          >
            Refresh
          </Button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" tip="Loading work progress data..." />
            </div>
          ) : (
            <Table
              dataSource={filteredData}
              columns={columns}
              rowKey="progressId"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
                pageSizeOptions: ["10", "20", "50"],
              }}
              scroll={{ x: 1400 }}
              className="custom-table"
              rowClassName={(record, index) =>
                index % 2 === 0 ? "table-row-light" : "table-row-dark"
              }
            />
          )}
        </div>

        <div className="table-footer">
          <Space size="large">
            <span className="footer-text">
              <strong>Total Amount:</strong>
              <span className="footer-amount">
                ${statistics.totalAmount.toLocaleString()}
              </span>
            </span>
            <span className="footer-text">
              <strong>Total Records:</strong> {filteredData.length}
            </span>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default WorkProgressList;
