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

function WorkProgressCustomerPage() {
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDamage, setSelectedDamage] = useState(null);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [visibleFeedback, setVisibleFeedback] = useState({});

  // 📡 Gọi API lấy tiến độ khách hàng
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

  // 🎨 Màu trạng thái hiển thị tiến độ công việc
  const getStatusConfig = (status) => {
    const statusMap = {
      pending: { color: "warning", icon: <ClockCircleOutlined />, text: "Đang chờ" },
      in_progress: { color: "processing", icon: <SyncOutlined spin />, text: "Đang thực hiện" },
      completed: { color: "success", icon: <CheckCircleOutlined />, text: "Hoàn thành" },
    };
    return statusMap[status] || { color: "default", icon: <ClockCircleOutlined />, text: status };
  };

  // 🧾 Gửi phản hồi cho Damage (Khách hàng duyệt / từ chối)
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
            : "Khách hàng đã đồng ý thiệt hại (chờ quản lý duyệt)",
      };

      await damageApi.sendCustomerFeedback(damageId, payload);

      message.success(
        action === "approve"
          ? "✅ Đã đồng ý thiệt hại, chờ quản lý duyệt"
          : "❌ Đã gửi phản hồi từ chối"
      );

      // Cập nhật lại UI local
      setProgressList((prev) =>
        prev.map((p) => ({
          ...p,
          damages: p.damages?.map((d) =>
            d.damageId === damageId
              ? {
                  ...d,
                  status: action === "approve" ? "pending_manager" : "rejected",
                  customerFeedback:
                    action === "reject"
                      ? rejectReason
                      : "Đã đồng ý thiệt hại (chờ quản lý duyệt)",
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

  // 🧱 Hiển thị modal khi khách hàng từ chối
  const showRejectModal = (damage) => {
    setSelectedDamage(damage);
    setIsRejectModalVisible(true);
  };

  // 👁️ Toggle hiển thị phản hồi
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
      {/* Header */}
      <div className="work-progress-header">
        <h1 className="work-progress-header-title">📦 Tiến độ công việc của bạn</h1>
        <p className="work-progress-header-subtitle">
          Theo dõi tiến độ và xử lý các vấn đề phát sinh trong hợp đồng của bạn.
        </p>
      </div>

      {/* Content */}
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
                {/* Header */}
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

                {/* Info */}
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

                {/* Task description */}
                <div className="work-progress-description">
                  <div className="work-progress-description-title">
                    <FileTextOutlined /> Mô tả công việc
                  </div>
                  <p>{item.taskDescription || "Chưa có mô tả"}</p>
                </div>

                {/* Danh sách thiệt hại */}
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
                            <a href={dmg.imageUrl} target="_blank">
                              Xem ảnh
                            </a>
                          ) : (
                            "Không có"
                          )}
                        </p>
                        <p>
                          🏷️ <b>Trạng thái:</b>{" "}
                          <Tag
                            color={
                              dmg.status === "pending_customer"
                                ? "gold"
                                : dmg.status === "pending_manager"
                                ? "blue"
                                : dmg.status === "approved"
                                ? "green"
                                : dmg.status === "rejected"
                                ? "red"
                                : "default"
                            }
                          >
                            {dmg.status === "pending_customer"
                              ? "Chờ khách hàng"
                              : dmg.status === "pending_manager"
                              ? "Chờ quản lý"
                              : dmg.status === "approved"
                              ? "Đã duyệt"
                              : dmg.status === "rejected"
                              ? "Đã từ chối"
                              : "Không xác định"}
                          </Tag>
                        </p>

                        {/* Nếu đang chờ phản hồi từ khách hàng */}
                        {dmg.status === "pending_customer" && (
                          <div style={{ display: "flex", gap: "10px" }}>
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
                        {dmg.status !== "pending_customer" && (
                          <Button
                            type="default"
                            icon={<MessageOutlined />}
                            onClick={() => toggleFeedbackView(dmg.damageId)}
                          >
                            {visibleFeedback[dmg.damageId]
                              ? "Ẩn phản hồi"
                              : "Hiển thị phản hồi"}
                          </Button>
                        )}

                        {/* Hiển thị phản hồi cả 2 bên */}
                        {visibleFeedback[dmg.damageId] && (
                          <div
                            style={{
                              marginTop: "8px",
                              background: "#fafafa",
                              padding: "10px",
                              borderRadius: "6px",
                            }}
                          >
                            {dmg.customerFeedback && (
                              <p>
                                💬 <b>Phản hồi của bạn:</b>{" "}
                                {dmg.customerFeedback}
                              </p>
                            )}
                            {dmg.managerFeedback && (
                              <p>
                                🧑‍💼 <b>Phản hồi quản lý:</b>{" "}
                                {dmg.managerFeedback}
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
//fix end