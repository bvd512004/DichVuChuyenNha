import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Popconfirm, Space, Typography, Row, Col, Select, Badge, Tooltip, Progress } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { Option } = Select;

export const SurveyList = ({ surveys, loading, onEdit, onDelete, onCreateQuotation, onViewSurvey, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto-refresh mỗi 30s nếu được bật
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (onRefresh) {
        onRefresh();
      }
    }, 30000); // 30 giây

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  // 🎯 Hàm đổi màu và nhãn trạng thái
  const renderStatusTag = (status) => {
    let color;
    let text;
    let icon;
    switch (status) {
      case "DONE":
        color = "success";
        text = "Hoàn thành";
        icon = <CheckCircleOutlined />;
        break;
      case "QUOTED":
        color = "blue";
        text = "Đã Báo Giá";
        icon = <CheckCircleOutlined />;
        break;
      default:
        color = "processing";
        text = "Đang xử lý";
        icon = <InfoCircleOutlined spin />;
        break;
    }
    return (
      <Tag color={color} icon={icon}>
        {text}
      </Tag>
    );
  };

  // Render tiến độ tầng
  const renderFloorProgress = (record) => {
    const current = record.surveyFloors?.length || 0;
    const required = record.numFloors || 0;
    const percent = required > 0 ? Math.round((current / required) * 100) : 0;
    const isComplete = current >= required;

    return (
      <Tooltip title={`${current}/${required} tầng đã hoàn thành`}>
        <div style={{ marginBottom: 8 }}>
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: '0.85em' }}>
              Tiến độ tầng:
            </Text>
            <Badge
              count={`${current}/${required}`}
              style={{
                backgroundColor: isComplete ? '#52c41a' : '#faad14',
                fontSize: '0.75em',
              }}
            />
          </Space>
          <Progress
            percent={percent}
            size="small"
            status={isComplete ? "success" : "active"}
            showInfo={false}
          />
        </div>
      </Tooltip>
    );
  };

  // 🎯 Lọc khảo sát theo trạng thái được chọn
  const filteredSurveys =
    statusFilter === "ALL"
      ? surveys
      : surveys.filter((s) => s.status === statusFilter);

  // Đếm số lượng theo trạng thái
  const statusCounts = {
    ALL: surveys.length,
    DONE: surveys.filter(s => s.status === "DONE").length,
    QUOTED: surveys.filter(s => s.status === "QUOTED").length,
    PROCESSING: surveys.filter(s => s.status === "PROCESSING").length,
  };

  return (
    <>
      {/* Bộ lọc và controls */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Space>
          <Text strong>Lọc theo trạng thái:</Text>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
          >
            <Option value="ALL">
              <Space>
                <span>Tất cả</span>
                <Badge count={statusCounts.ALL} showZero style={{ backgroundColor: '#999' }} />
              </Space>
            </Option>
            <Option value="DONE">
              <Space>
                <span>Hoàn thành</span>
                <Badge count={statusCounts.DONE} showZero style={{ backgroundColor: '#52c41a' }} />
              </Space>
            </Option>
            <Option value="QUOTED">
              <Space>
                <span>Đã Báo Giá</span>
                <Badge count={statusCounts.QUOTED} showZero style={{ backgroundColor: '#1890ff' }} />
              </Space>
            </Option>
            <Option value="PROCESSING">
              <Space>
                <span>Đang xử lý</span>
                <Badge count={statusCounts.PROCESSING} showZero style={{ backgroundColor: '#faad14' }} />
              </Space>
            </Option>
          </Select>
        </Space>

        <Space>
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={onRefresh}
            disabled={loading}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Danh sách khảo sát */}
      <Row gutter={[16, 16]}>
        {filteredSurveys.map((record) => {
          const cardActions = [];
          const current = record.surveyFloors?.length || 0;
          const required = record.numFloors || 0;
          const isFloorComplete = current >= required;

          // Chỉ hiện nút báo giá nếu DONE
          if (record.status === "DONE") {
            cardActions.push(
              <Tooltip key="quotation-tooltip" title="Tạo báo giá cho khảo sát này">
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
              </Tooltip>
            );
          }

          cardActions.push(
            <Tooltip key="edit-tooltip" title="Chỉnh sửa thông tin khảo sát">
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
            </Tooltip>
          );

          cardActions.push(
            <Popconfirm
              key="delete"
              title="Xác nhận xóa"
              description="Bạn có chắc muốn xóa khảo sát này không? Hành động này không thể hoàn tác."
              onConfirm={(e) => {
                e.stopPropagation();
                onDelete(record.surveyId);
              }}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa khảo sát">
                <Button danger icon={<DeleteOutlined />} />
              </Tooltip>
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
                style={{ 
                  minHeight: 320, 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: isFloorComplete && record.status === "DONE" ? '2px solid #52c41a' : undefined,
                }}
                hoverable
                onClick={() => onViewSurvey(record)}
                actions={cardActions}
              >
                <div style={{ marginBottom: 10 }}>
                  <Text type="secondary" style={{ fontSize: '0.9em' }}>Khách hàng:</Text>
                  <br />
                  <Text strong style={{ fontSize: '1.1em', display: 'block' }}>{record.username}</Text>
                  <Text type="secondary" style={{ fontSize: '0.9em' }}>{record.companyName}</Text>

                </div>

                {/* Hiển thị tiến độ tầng */}
                {renderFloorProgress(record)}

                <div style={{ marginBottom: 10, paddingBottom: 8, borderBottom: '1px dashed #f0f0f0' }}>
                  <Text type="secondary" style={{ display: "block", fontSize: "0.9em", marginBottom: 4 }}>
                    <EnvironmentOutlined style={{ marginRight: 4, color: "#52c41a" }} />
                    <strong>Từ:</strong> {record.addressFrom}
                  </Text>
                  <Text type="secondary" style={{ display: "block", fontSize: "0.9em" }}>
                    <EnvironmentOutlined style={{ marginRight: 4, color: "#faad14" }} />
                    <strong>Đến:</strong> {record.addressTo}
                  </Text>
                </div>

                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text type="secondary" style={{ display: 'block', fontSize: '0.9em' }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    <strong>Ngày KS:</strong>{" "}
                    {record.surveyDate ? dayjs(record.surveyDate).format("DD/MM/YYYY") : "Chưa có"}
                  </Text>

                  {record.note && (
                    <Text type="secondary" style={{ display: 'block', fontSize: '0.85em', fontStyle: 'italic' }}>
                      💬 {record.note}
                    </Text>
                  )}
                </Space>

                {/* Thông báo nếu thiếu tầng */}
                {!isFloorComplete && (
                  <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff7e6', borderRadius: 4, border: '1px solid #ffd591' }}>
                    <Text type="warning" style={{ fontSize: '0.85em' }}>
                      ⚠️ Còn thiếu {required - current} tầng
                    </Text>
                  </div>
                )}

                {/* Thông báo sẵn sàng báo giá */}
                {isFloorComplete && record.status === "DONE" && (
                  <div style={{ marginTop: 12, padding: '8px 12px', background: '#f6ffed', borderRadius: 4, border: '1px solid #b7eb8f' }}>
                    <Text type="success" style={{ fontSize: '0.85em' }}>
                      ✅ Sẵn sàng báo giá!
                    </Text>
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
        
        {!loading && filteredSurveys.length === 0 && (
          <Col span={24}>
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fafafa', borderRadius: 8 }}>
              <Text type="secondary" style={{ fontSize: '1.1em' }}>
                📭 Không có khảo sát nào phù hợp với bộ lọc.
              </Text>
            </div>
          </Col>
        )}
      </Row>
    </>
  );
};
