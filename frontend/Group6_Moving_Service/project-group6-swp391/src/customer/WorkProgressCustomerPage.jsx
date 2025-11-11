import { useEffect, useState } from "react";
import {
  Spin,
  Empty,
  Tag,
  Card,
  Modal,
  Button,
  Input,
  message,
  Typography,
  Divider,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  WarningOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import workProgressApi from "../service/workprogress";
import damageApi from "../service/damage";
import "./style/WorkProgressCustomerPage.css";

const { TextArea } = Input;
const { Title } = Typography;

// ✅ Helper: Chuyển status sang tiếng Việt
const getStatusText = (status) => {
  const statusMap = {
    pending_manager: "Chờ quản lý duyệt",
    pending_customer: "Chờ bạn duyệt",
    approved: "Đã duyệt",
    rejected: "Đã từ chối",
  };
  return statusMap[status] || status;
};

// ✅ Helper: Màu sắc cho tag status
const getStatusColor = (status) => {
  const colorMap = {
    pending_manager: "blue",
    pending_customer: "gold",
    approved: "green",
    rejected: "red",
  };
  return colorMap[status] || "default";
};

function WorkProgressCustomerPage() {
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDamage, setSelectedDamage] = useState(null);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [visibleFeedback, setVisibleFeedback] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await workProgressApi.getCustomerList();
        setProgressList(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải tiến độ:", err);
        message.error("Không thể tải tiến độ công việc");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusConfig = (status) => {
    const statusMap = {
      pending: { color: "warning", icon: <ClockCircleOutlined />, text: "Đang chờ" },
      in_progress: { color: "processing", icon: <SyncOutlined spin />, text: "Đang thực hiện" },
      completed: { color: "success", icon: <CheckCircleOutlined />, text: "Hoàn thành" },
    };
    return statusMap[status] || { color: "default", icon: <ClockCircleOutlined />, text: status };
  };

  // ✅ Khách hàng duyệt thiệt hại (sau khi quản lý duyệt)
  const handleFeedback = async (damageId, action) => {
    try {
      if (action === "reject" && !rejectReason.trim()) {
        message.warning("Vui lòng nhập lý do từ chối");
        return;
      }

      const payload = {
        action,
        customerFeedback:
          action === "reject"
            ? rejectReason
            : "Khách hàng đã đồng ý",
      };

      await damageApi.sendCustomerFeedback(damageId, payload);

      message.success(
        action === "approve"
          ? "✅ Đã đồng ý thiệt hại"
          : "❌ Đã gửi phản hồi từ chối"
      );

      setProgressList((prev) =>
        prev.map((p) => ({
          ...p,
          damages: p.damages?.map((d) =>
            d.damageId === damageId
              ? {
                  ...d,
                  status: action === "approve" ? "approved" : "rejected",
                  customerFeedback:
                    action === "reject"
                      ? rejectReason
                      : "Khách hàng đã đồng ý",
                }
              : d
          ),
        }))
      );

      setIsRejectModalVisible(false);
      setRejectReason("");
      setSelectedDamage(null);
    } catch (err) {
      console.error("Lỗi gửi phản hồi:", err);
      message.error("Không thể gửi phản hồi");
    }
  };

  const showRejectModal = (damage) => {
    setSelectedDamage(damage);
    setIsRejectModalVisible(true);
  };

  const toggleFeedbackView = (damageId) => {
    setVisibleFeedback((prev) => ({
      ...prev,
      [damageId]: !prev[damageId],
    }));
  };

  if (loading) {
    return (
      <div className="work-progress-customer-page">
        <div className="work-progress-loading">
          <Spin size="large" tip="⏳ Đang tải tiến độ công việc..." />
        </div>
      </div>
    );
  }

  return (
    <div className="work-progress-customer-page">
      <div className="work-progress-header">
        <h1 className="work-progress-header-title">📦 Tiến độ công việc của bạn</h1>
        <p className="work-progress-header-subtitle">
          Theo dõi tiến độ và xử lý các vấn đề phát sinh trong hợp đồng của bạn.
        </p>
      </div>

      {progressList.length === 0 ? (
        <div className="work-progress-empty">
          <Empty description="Hiện tại chưa có tiến độ công việc nào" />
        </div>
      ) : (
        <div>
          {progressList.map((item) => {
            const statusConfig = getStatusConfig(item.progressStatus);

            return (
              <Card key={item.progressId} className="work-progress-card" hoverable>
                <div className="work-progress-card-header">
                  <h2 className="work-progress-card-title">
                    Hợp đồng #{item.contractId}
                  </h2>
                  <Tag
                    icon={statusConfig.icon}
                    color={statusConfig.color}
                    className="work-progress-status-tag"
                  >
                    {statusConfig.text}
                  </Tag>
                </div>

                <div className="work-progress-info-grid">
                  <div className="work-progress-info-item">
                    <CalendarOutlined /> Ngày cập nhật:{" "}
                    {new Date(item.updatedAt).toLocaleString("vi-VN")}
                  </div>
                  <div className="work-progress-info-item">
                    <FileTextOutlined /> Dịch vụ: {item.serviceName}
                  </div>
                  <div className="work-progress-info-item">
                    <DollarOutlined /> Tổng tiền:{" "}
                    {item.totalAmount?.toLocaleString("vi-VN")} ₫
                  </div>
                </div>

                <div className="work-progress-description">
                  <div className="work-progress-description-title">
                    <FileTextOutlined /> Mô tả công việc
                  </div>
                  <p>{item.taskDescription || "Chưa có mô tả"}</p>
                </div>

                {item.damages && item.damages.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>
                      <WarningOutlined /> Thiệt hại phát sinh
                    </Title>
                    {item.damages.map((dmg) => (
                      <Card
                        key={dmg.damageId}
                        type="inner"
                        title={dmg.cause}
                        style={{ marginBottom: "10px" }}
                      >
                        <p>
                          💰 <b>Chi phí:</b>{" "}
                          {dmg.cost
                            ? dmg.cost.toLocaleString("vi-VN") + " ₫"
                            : "—"}
                        </p>
                        <p>
                          👷 <b>Nhân viên:</b> {dmg.employeeName || "—"}
                        </p>
                        <p>
                          📷 <b>Ảnh:</b>{" "}
                          {dmg.imageUrl ? (
                            <a href={dmg.imageUrl} target="_blank" rel="noreferrer">
                              Xem ảnh
                            </a>
                          ) : (
                            "Không có"
                          )}
                        </p>
                        <p>
                          🏷️ <b>Trạng thái:</b>{" "}
                          <Tag color={getStatusColor(dmg.status)}>
                            {getStatusText(dmg.status)}
                          </Tag>
                        </p>

                        {/* ✅ Chỉ hiển thị nút khi đang chờ khách hàng duyệt */}
                        {dmg.status === "pending_customer" && (
                          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                            <Button
                              type="primary"
                              onClick={() =>
                                handleFeedback(dmg.damageId, "approve")
                              }
                            >
                              Đồng ý
                            </Button>
                            <Button danger onClick={() => showRejectModal(dmg)}>
                              Từ chối
                            </Button>
                          </div>
                        )}

                        {/* Nút hiển thị phản hồi */}
                        {dmg.status !== "pending_customer" && dmg.status !== "pending_manager" && (
                          <Button
                            type="default"
                            icon={<MessageOutlined />}
                            onClick={() => toggleFeedbackView(dmg.damageId)}
                            style={{ marginTop: "10px" }}
                          >
                            {visibleFeedback[dmg.damageId]
                              ? "Ẩn phản hồi"
                              : "Hiển thị phản hồi"}
                          </Button>
                        )}

                        {/* Hiển thị phản hồi */}
                        {visibleFeedback[dmg.damageId] && (
                          <div
                            style={{
                              marginTop: "8px",
                              background: "#fafafa",
                              padding: "10px",
                              borderRadius: "6px",
                            }}
                          >
                            {dmg.managerFeedback && (
                              <p>
                                🧑‍💼 <b>Phản hồi quản lý:</b>{" "}
                                {dmg.managerFeedback}
                              </p>
                            )}
                            {dmg.customerFeedback && (
                              <p>
                                💬 <b>Phản hồi của bạn:</b>{" "}
                                {dmg.customerFeedback}
                              </p>
                            )}
                          </div>
                        )}
                      </Card>
                    ))}
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal từ chối */}
      <Modal
        title="Từ chối thiệt hại"
        open={isRejectModalVisible}
        onOk={() =>
          handleFeedback(selectedDamage?.damageId, "reject")
        }
        onCancel={() => setIsRejectModalVisible(false)}
        okText="Gửi phản hồi"
        cancelText="Hủy"
      >
        <p>Nhập lý do từ chối thiệt hại:</p>
        <TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Ví dụ: Chi phí quá cao, yêu cầu xem xét lại..."
        />
      </Modal>
    </div>
  );
}

export default WorkProgressCustomerPage;