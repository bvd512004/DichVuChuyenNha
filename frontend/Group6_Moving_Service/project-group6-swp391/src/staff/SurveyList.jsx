import React, { useState } from "react";
import { Card, Button, Tag, Popconfirm, Space, Typography, Row, Col, Select } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { Option } = Select;

export const SurveyList = ({ surveys, loading, onEdit, onDelete, onCreateQuotation, onViewSurvey }) => {
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 🎯 Hàm đổi màu và nhãn trạng thái
  const renderStatusTag = (status) => {
    let color;
    let text;
    switch (status) {
      case "DONE":
        color = "success";
        text = "Hoàn thành";
        break;
      case "QUOTED":
        color = "blue";
        text = "Đã Báo Giá";
        break;
      default:
        color = "processing";
        text = "Đang xử lý";
        break;
    }
    return <Tag color={color} icon={<CheckCircleOutlined />}>{text}</Tag>;
  };

  // 🎯 Lọc khảo sát theo trạng thái được chọn
  const filteredSurveys =
    statusFilter === "ALL"
      ? surveys
      : surveys.filter((s) => s.status === statusFilter);

  return (
    <>
      {/* Bộ lọc ở trên cùng */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Text strong>Lọc theo trạng thái:</Text>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
          >
            <Option value="ALL">Tất cả</Option>
            <Option value="DONE">Hoàn thành</Option>
            <Option value="QUOTED">Đã Báo Giá</Option>
            <Option value="PROCESSING">Đang xử lý</Option>
          </Select>
        </Space>
      </div>

      {/* Danh sách khảo sát */}
      <Row gutter={[16, 16]}>
        {filteredSurveys.map((record) => {
          const cardActions = [];

          if (record.status === "DONE") {
            cardActions.push(
              <Button
                key="quotation"
                type="primary"
                icon={<DollarOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateQuotation(record);
                }}
              >
                Báo Giá
              </Button>
            );
          }

          cardActions.push(
            <Button
              key="edit"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
            >
              Sửa
            </Button>
          );

          cardActions.push(
            <Popconfirm
              key="delete"
              title="Xác nhận xóa"
              description="Bạn có chắc muốn xóa khảo sát này không?"
              onConfirm={(e) => {
                e.stopPropagation();
                onDelete(record.surveyId);
              }}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          );

          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={record.surveyId}>
              <Card
                title={
                  <Space>
                    <Text type="secondary" style={{ fontSize: '0.9em' }}>ID KS:</Text>
                    <Text strong>{record.surveyId}</Text>
                  </Space>
                }
                extra={renderStatusTag(record.status)}
                loading={loading}
                style={{ minHeight: 250, cursor: 'pointer' }}
                onClick={() => onViewSurvey(record)}
                actions={cardActions}
              >
                <div style={{ marginBottom: 10 }}>
                  <Text type="secondary" style={{ fontSize: '0.9em' }}>Khách hàng:</Text>
                  <br />
                  <Text strong style={{ fontSize: '1.1em', display: 'block' }}>{record.username}</Text>
                  <Text type="secondary" style={{ fontSize: '0.9em' }}>{record.companyName}</Text>
                </div>

                <div style={{ marginBottom: 10, paddingBottom: 5, borderBottom: '1px dashed #f0f0f0' }}>
                  <Text type="secondary" style={{ display: "block", fontSize: "0.9em" }}>
                    <EnvironmentOutlined style={{ marginRight: 4, color: "#52c41a" }} />
                    <strong>Từ:</strong> {record.addressFrom}
                  </Text>
                  <Text type="secondary" style={{ display: "block", fontSize: "0.9em" }}>
                    <EnvironmentOutlined style={{ marginRight: 4, color: "#faad14" }} />
                    <strong>Đến:</strong> {record.addressTo}
                  </Text>
                </div>

                <Text type="secondary" style={{ display: 'block', fontSize: '0.9em' }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  <strong>Ngày KS:</strong>{" "}
                  {record.surveyDate ? dayjs(record.surveyDate).format("DD/MM/YYYY") : "Chưa có"}
                </Text>
              </Card>
            </Col>
          );
        })}
        {!loading && filteredSurveys.length === 0 && (
          <Col span={24}>
            <Text type="secondary">Không có khảo sát nào phù hợp với bộ lọc.</Text>
          </Col>
        )}
      </Row>
    </>
  );
};
