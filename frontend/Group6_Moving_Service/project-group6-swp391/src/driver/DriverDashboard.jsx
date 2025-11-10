import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Card,
  Empty,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  CarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { driverApi } from "../service/driver";
import "./style/DriverDashboard.css";

const { Title, Text } = Typography;

const statusColorMap = {
  pending: "gold",
  awaiting_signature: "gold",
  signed: "blue",
  in_progress: "processing",
  completed: "green",
  cancelled: "red",
};

const statusLabelMap = {
  pending: "Chờ xử lý",
  awaiting_signature: "Chờ ký",
  signed: "Đã ký",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const formatStatus = (status) => {
  if (!status) return "Không rõ";
  const normalized = status.toLowerCase();
  return statusLabelMap[normalized] || status;
};

const formatDate = (value) => {
  if (!value) return "Chưa xác định";
  return moment(value).format("DD/MM/YYYY");
};

const DriverDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    moment.locale("vi");
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await driverApi.getSchedules();
        setSchedules(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load driver schedules", err);
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải dữ liệu lịch trình.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const upcomingTrips = useMemo(() => {
    const today = moment().startOf("day");
    return schedules.filter((item) => {
      if (!item.movingDay) return false;
      return moment(item.movingDay).isSameOrAfter(today, "day");
    }).length;
  }, [schedules]);

  const columns = useMemo(
    () => [
      {
        title: "Ngày vận chuyển",
        dataIndex: "movingDay",
        key: "movingDay",
        render: (value) => (
          <Space>
            <CalendarOutlined />
            <span>{formatDate(value)}</span>
          </Space>
        ),
      },
      {
        title: "Mã hợp đồng",
        dataIndex: "contractId",
        key: "contractId",
        render: (id) => <Text strong>#{id}</Text>,
      },
      {
        title: "Xe được phân công",
        key: "vehicle",
        render: (_, record) => (
          <div className="driver-dashboard__vehicle">
            <Text strong>{record.vehicleType || "Chưa phân công"}</Text>
            <Text type="secondary">
              <CarOutlined />{" "}
              {record.licensePlate ? record.licensePlate : "Đang cập nhật"}
              {record.capacity ? ` • ${record.capacity} tấn` : ""}
            </Text>
          </div>
        ),
      },
      {
        title: "Tuyến đường",
        key: "route",
        render: (_, record) => (
          <div className="driver-dashboard__route">
            <div className="route-point">
              <EnvironmentOutlined className="route-icon pickup" />
              <Text>{record.pickupAddress || "Chưa cập nhật"}</Text>
            </div>
            <div className="route-divider" />
            <div className="route-point">
              <EnvironmentOutlined className="route-icon dropoff" />
              <Text>{record.destinationAddress || "Chưa cập nhật"}</Text>
            </div>
          </div>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "contractStatus",
        key: "contractStatus",
        render: (status) => {
          const normalized = status ? status.toLowerCase() : undefined;
          return (
            <Tag color={statusColorMap[normalized] || "default"}>
              {formatStatus(status)}
            </Tag>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="driver-dashboard">
      <div className="driver-dashboard__header">
        <Title level={3}>Driver Dashboard</Title>
        <Text>
          Theo dõi các chuyến vận chuyển đã được phân công và thông tin xe của
          bạn.
        </Text>
      </div>

      <div className="driver-dashboard__stats">
        <Card className="stats-card upcoming">
          <Space direction="vertical" size={4}>
            <Text className="stats-card__title">Chuyến sắp tới</Text>
            <Space size={12}>
              <CalendarOutlined className="stats-card__icon" />
              <Title level={2}>
                {loading ? <Spin size="small" /> : upcomingTrips}
              </Title>
            </Space>
          </Space>
        </Card>
        <Card className="stats-card total">
          <Space direction="vertical" size={4}>
            <Text className="stats-card__title">Tổng chuyến đã nhận</Text>
            <Space size={12}>
              <CarOutlined className="stats-card__icon" />
              <Title level={2}>
                {loading ? <Spin size="small" /> : schedules.length}
              </Title>
            </Space>
          </Space>
        </Card>
      </div>

      {error && (
        <Alert
          type="error"
          message="Không thể tải lịch trình"
          description={error}
          showIcon
          className="driver-dashboard__alert"
        />
      )}

      <Card className="driver-dashboard__table-card">
        {loading ? (
          <div className="driver-dashboard__loading">
            <Spin tip="Đang tải lịch trình..." />
          </div>
        ) : schedules.length === 0 ? (
          <Empty
            description="Bạn chưa được phân công chuyến vận chuyển nào."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            rowKey={(record) =>
              `${record.contractId}-${record.vehicleId ?? "vehicle"}`
            }
            columns={columns}
            dataSource={schedules}
            pagination={false}
            className="driver-dashboard__table"
          />
        )}
      </Card>
    </div>
  );
};

export default DriverDashboard;


