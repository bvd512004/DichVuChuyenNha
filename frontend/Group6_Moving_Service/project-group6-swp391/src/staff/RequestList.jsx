import React from "react";
import { Card, Button, Tag, Typography, Tooltip, Row, Col, Space } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// Component hiển thị dưới dạng Card thay vì Table
export const RequestList = ({ requests, onCreateSurvey, onViewRequest }) => {
  // Hàm render địa chỉ, tối ưu hóa hiển thị trong Card
  const renderAddress = (record) => (
    <div style={{ marginBottom: 8 }}>
      <Tooltip title={record.pickupAddress}>
        <Text style={{ display: "block", fontSize: "0.9em" }}>
          <EnvironmentOutlined style={{ marginRight: 4, color: "#52c41a" }} />
          <Text strong>Từ:</Text> {record.pickupAddress}
        </Text>
      </Tooltip>
      <Tooltip title={record.destinationAddress}>
        <Text style={{ display: "block", fontSize: "0.9em" }}>
          <EnvironmentOutlined style={{ marginRight: 4, color: "#fa541c" }} />
          <Text strong>Đến:</Text> {record.destinationAddress}
        </Text>
      </Tooltip>
    </div>
  );

  // Hàm render trạng thái dưới dạng Tag
  const renderStatusTag = (status) => {
    const isPending = status === "PENDING";
    const color = isPending ? "warning" : "success";
    const text = isPending ? "Chờ Khảo Sát" : "Đã Khảo Sát";
    return <Tag color={color}>{text}</Tag>;
  };

  return (
    // Sử dụng Row và Col để tạo layout dạng lưới cho Card
    <Row gutter={[16, 16]}>
      {requests.map((record) => {
        const isPending = record.status === "PENDING";
        
        return (
          <Col xs={24} sm={12} lg={8} xl={6} key={record.requestId}> {/* Chia layout thành 1-4 card trên 1 hàng */}
            <Card
              title={
                <Space>
                  <Text type="secondary" style={{ fontSize: '0.9em' }}>Mã:</Text>
                  <Text strong>{record.requestId}</Text>
                </Space>
              }
              extra={renderStatusTag(record.status)}
              hoverable
              style={{ minHeight: 250 }} // Đảm bảo chiều cao đồng nhất
              actions={[
                // Nút "Xem" luôn hiển thị
                <Button
                  key="view"
                  icon={<EyeOutlined />}
                  onClick={() => onViewRequest(record)} // Cần thêm prop onViewRequest
                >
                  Xem Chi Tiết
                </Button>,
                // Nút "Tạo Báo Giá/Khảo Sát" chỉ hiển thị khi PENDING
                isPending && (
                  <Button
                    key="create"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => onCreateSurvey(record)}
                  >
                    Tạo khảo sát 
                  </Button>
                ),
              ].filter(Boolean)} // Lọc bỏ giá trị false (khi isPending là false)
            >
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: '0.9em' }}>Khách hàng:</Text>
                <br />
                <Text strong>{record.username}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '0.9em' }}>{record.companyName}</Text>
              </div>

              {renderAddress(record)}

              <Text type="secondary" style={{ fontSize: "0.85em" }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                Ngày tạo: {record.requestTime ? dayjs(record.requestTime).format("DD/MM/YYYY HH:mm") : "-"}
              </Text>
            </Card>
          </Col>
        );
      })}
      {/* Hiển thị thông báo nếu không có yêu cầu */}
      {requests.length === 0 && (
        <Col span={24}>
          <Text type="secondary">Không có yêu cầu nào để hiển thị.</Text>
        </Col>
      )}
    </Row>
  );
};