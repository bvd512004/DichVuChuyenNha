import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Statistic,
  Row,
  Col,
  Progress,
  Button,
  Select,
  Input,
  Tag,
  Space,
  Typography,
  Spin,
  Alert,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import workProgressApi from "../service/workprogress";
import "./style/WorkProgressPage.css";

const { Title } = Typography;
const { Option } = Select;

const WorkProgressPage = () => {
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingKey, setEditingKey] = useState("");

  // Fetch danh sách tiến độ
  const fetchProgressList = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await workProgressApi.getMyList();
      setProgressList(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load work progress. Please login again.");
      message.error("Failed to load work progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressList();
  }, []);

  // Cập nhật tiến độ
  const updateWorkProgress = async (progressId, newStatus, newDesc) => {
    try {
      await workProgressApi.update(progressId, {
        progressStatus: newStatus,
        taskDescription: newDesc,
      });
      message.success("Progress updated successfully");
      fetchProgressList();
    } catch (err) {
      console.error("Error updating progress:", err);
      message.error("Failed to update progress. Please try again.");
    }
  };

  // Thay đổi trạng thái
  const handleStatusChange = (progressId, newStatus) => {
    const current = progressList.find((p) => p.progressId === progressId);
    updateWorkProgress(progressId, newStatus, current.taskDescription);
  };

  // Thay đổi mô tả
  const handleDescriptionChange = (progressId, newDesc) => {
    const current = progressList.find((p) => p.progressId === progressId);
    updateWorkProgress(progressId, current.progressStatus, newDesc);
    setEditingKey("");
  };

  // Thống kê
  const total = progressList.length;
  const completed = progressList.filter((p) => p.progressStatus === "completed").length;
  const inProgress = progressList.filter((p) => p.progressStatus === "in_progress").length;
  const pending = progressList.filter((p) => p.progressStatus === "pending").length;
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Render trạng thái
  const renderStatus = (status) => {
    const statusConfig = {
      pending: { color: "orange", icon: <ClockCircleOutlined />, text: "Pending" },
      in_progress: { color: "blue", icon: <SyncOutlined spin />, text: "In Progress" },
      completed: { color: "green", icon: <CheckCircleOutlined />, text: "Completed" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag icon={config.icon} color={config.color}>
        {config.text}
      </Tag>
    );
  };

  // Columns cho table
  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
      render: (text) => text || "—",
    },
    {
      title: "Service",
      dataIndex: "serviceName",
      key: "serviceName",
      width: 150,
      render: (text) => text || "—",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      render: (text) => text || "—",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      width: 120,
      render: (text) => text || "—",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 130,
      render: (amount) =>
        amount ? (
          <span style={{ fontWeight: 600, color: "#11998e" }}>
            {amount.toLocaleString("vi-VN")} ₫
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 130,
      render: (text) => text || "—",
    },
    {
      title: "Task Description",
      dataIndex: "taskDescription",
      key: "taskDescription",
      width: 200,
      render: (text, record) =>
        editingKey === record.progressId ? (
          <Input
            defaultValue={text}
            onPressEnter={(e) =>
              handleDescriptionChange(record.progressId, e.target.value)
            }
            onBlur={(e) =>
              handleDescriptionChange(record.progressId, e.target.value)
            }
            autoFocus
          />
        ) : (
          <div
            onClick={() => setEditingKey(record.progressId)}
            style={{ cursor: "pointer", minHeight: 22 }}
          >
            {text || "Click to edit"}
          </div>
        ),
    },
    {
      title: "Status",
      dataIndex: "progressStatus",
      key: "progressStatus",
      width: 150,
      render: (status) => renderStatus(status),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 170,
      render: (date) =>
        date ? new Date(date).toLocaleString("vi-VN") : "—",
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Select
          value={record.progressStatus}
          onChange={(value) => handleStatusChange(record.progressId, value)}
          style={{ width: 150 }}
        >
          <Option value="pending">
            <Space>
              <ClockCircleOutlined /> Pending
            </Space>
          </Option>
          <Option value="in_progress">
            <Space>
              <SyncOutlined /> In Progress
            </Space>
          </Option>
          <Option value="completed">
            <Space>
              <CheckCircleOutlined /> Completed
            </Space>
          </Option>
        </Select>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading work progress..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: 24 }}
      />
    );
  }

  return (
    <div className="work-progress-page">
      <div className="page-header">
        <Title level={2}>
          <TrophyOutlined /> Work Progress
        </Title>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchProgressList}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Tasks"
              value={total}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Completed"
              value={completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="In Progress"
              value={inProgress}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Pending"
              value={pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Bar */}
      <Card className="progress-card">
        <div className="progress-header">
          <span className="progress-label">Overall Completion</span>
          <span className="progress-percent">{completionPercent}%</span>
        </div>
        <Progress
          percent={completionPercent}
          strokeColor={{
            "0%": "#11998e",
            "100%": "#38ef7d",
          }}
          status="active"
        />
      </Card>

      {/* Task Table */}
      <Card className="table-card">
        <Title level={4}>Task Details</Title>
        <Table
          dataSource={progressList}
          columns={columns}
          rowKey="progressId"
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tasks`,
          }}
        />
      </Card>
    </div>
  );
};

export default WorkProgressPage;