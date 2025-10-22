import React from "react";
import { Card, Button, Tag, Popconfirm, Space, Typography, Row, Col } from "antd";
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

// Đổi tên component để tránh nhầm lẫn với tên file SurveyList.jsx cũ
export const SurveyList = ({ surveys, loading, onEdit, onDelete, onCreateQuotation, onViewSurvey }) => {
  // Hàm renderStatusTag được cập nhật để xử lý trạng thái 'QUOTED' nếu cần
  const renderStatusTag = (status) => {
    let color;
    let text;

    switch (status) {
      case "DONE":
        color = "success";
        text = "Hoàn thành";
        break;
      case "QUOTED":
        color = "blue"; // Ví dụ: màu xanh cho đã báo giá
        text = "Đã Báo Giá";
        break;
      default:
        color = "processing";
        text = "Đang xử lý";
        break;
    }
    return <Tag color={color} icon={<CheckCircleOutlined />}>{text}</Tag>;
  };

  return (
    <Row gutter={[16, 16]}>
      {surveys.map((record) => {
        // MẢNG CHỨA CÁC ACTIONS (NÚT) TRÊN CARD
        const cardActions = [];

        // 1. NÚT TẠO BÁO GIÁ (CHỈ HIỆN KHI STATUS LÀ 'DONE' và ẨN KHI LÀ 'QUOTED' HOẶC KHÁC)
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
        } else if (record.status === "QUOTED") {
           // Bạn có thể thêm một nút 'Xem Báo Giá' tại đây nếu cần
           // Ví dụ: cardActions.push(<Button key="view-quote" icon={<DollarOutlined />}>Xem Báo Giá</Button>);
        }


        // 2. NÚT SỬA
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

        // 3. NÚT XÓA
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
              actions={cardActions} // SỬ DỤNG MẢNG ACTIONS ĐÃ ĐƯỢC LỌC
            >
              {/* Thông tin Khách hàng */}
              <div style={{ marginBottom: 10 }}>
                <Text type="secondary" style={{ fontSize: '0.9em' }}>Khách hàng:</Text>
                <br />
                <Text strong style={{ fontSize: '1.1em', display: 'block' }}>{record.username}</Text>
                <Text type="secondary" style={{ fontSize: '0.9em' }}>{record.companyName}</Text>
              </div>

              {/* Địa chỉ */}
              <div style={{ marginBottom: 10, paddingBottom: 5, borderBottom: '1px dashed #f0f0f0' }}>
                <Text type="secondary" style={{ display: "block", fontSize: "0.9em" }}>
                  <EnvironmentOutlined style={{ marginRight: 4, color: "#52c41a" }} />
                  **Từ**: {record.addressFrom}
                </Text>
                <Text type="secondary" style={{ display: "block", fontSize: "0.9em" }}>
                  <EnvironmentOutlined style={{ marginRight: 4, color: "#faad14" }} />
                  **Đến**: {record.addressTo}
                </Text>
              </div>

              {/* Ngày Khảo sát */}
              <Text type="secondary" style={{ display: 'block', fontSize: '0.9em' }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                **Ngày KS**: {record.surveyDate ? dayjs(record.surveyDate).format("DD/MM/YYYY") : "Chưa có"}
              </Text>

            </Card>

          </Col>
        );
      })}
      {!loading && surveys.length === 0 && (
        <Col span={24}>
          <Text type="secondary">Không có khảo sát nào để hiển thị.</Text>
        </Col>
      )}
    </Row>
  );
};