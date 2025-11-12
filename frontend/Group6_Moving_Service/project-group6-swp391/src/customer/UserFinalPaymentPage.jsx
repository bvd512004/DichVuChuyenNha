import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, message, Button, Alert, Space, Modal, Rate, Input, Divider } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import QRCode from "react-qr-code";
import PaymentAPI from "../service/payment";
import feedbackApi from "../service/feedbackApi";

const { Title, Text } = Typography;

const UserFinalPaymentPage = () => {
  const [loading, setLoading] = useState(true);
  const [finalPayments, setFinalPayments] = useState([]);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);

  // Lấy danh sách thanh toán cuối của người dùng
  const fetchFinalPayments = async () => {
    setLoading(true);
    try {
      const res = await PaymentAPI.getFinalPaymentsForUser();
      console.log("📦 Final payments response:", res);
      
      const data = typeof res === 'string' ? JSON.parse(res) : res;
      setFinalPayments(data.payments || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách thanh toán cuối:", err);
      message.error("Không thể tải danh sách thanh toán cuối.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinalPayments();
  }, []);

  const showFeedbackModal = (contractId) => {
    console.log("🎯 Opening feedback for contract:", contractId);
    setSelectedContractId(contractId);
    setFeedbackVisible(true);
  };

  const handleCancel = () => {
    setFeedbackVisible(false);
    setRating(0);
    setComment("");
    setSelectedContractId(null);
  };

  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      message.error("Vui lòng đánh giá sản phẩm!");
      return;
    }

    if (!selectedContractId) {
      message.error("Không tìm thấy hợp đồng để gửi feedback!");
      return;
    }

    const feedbackData = {
      contractId: selectedContractId,
      rating,
      comment,
    };

    console.log("📤 Sending feedback:", feedbackData);
    setLoadingFeedback(true);

    try {
      const response = await feedbackApi.sendFeedback(feedbackData);
      console.log("✅ Feedback response:", response);
      
      // ✅ Đóng modal trước
      handleCancel();
      
      // ✅ Hiển thị thông báo thành công
      message.success({
        content: "🎉 Cảm ơn bạn đã gửi feedback! Ý kiến của bạn rất quan trọng với chúng tôi.",
        duration: 5,
        style: {
          marginTop: '20vh',
        }
      });
      
    } catch (error) {
      console.error("❌ Lỗi khi gửi feedback:", error);
      if (error.response) {
        console.error("❌ Error response:", error.response.data);
        message.error(
          error.response.data.message || "Có lỗi xảy ra khi gửi feedback!"
        );
      } else {
        message.error("Không thể gửi feedback, vui lòng thử lại sau.");
      }
    } finally {
      setLoadingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" tip="Đang tải thanh toán cuối..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px" }}>
      <Title level={3}>💳 Thanh toán phần còn lại</Title>

      {!finalPayments.length ? (
        <Alert message="Bạn chưa có thanh toán nào cần hoàn tất." type="info" showIcon />
      ) : (
        finalPayments.map((p) => (
          <Card
            key={p.orderCode}
            title={`Hợp đồng #${p.contractId} - Order #${p.orderCode}`}
            style={{
              marginBottom: 20,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {/* ✅ Chi tiết thanh toán */}
              <div style={{ 
                background: "#f5f5f5", 
                padding: "16px", 
                borderRadius: "8px",
                marginBottom: "16px"
              }}>
                <Title level={5} style={{ marginBottom: 12 }}>📊 Chi tiết thanh toán</Title>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text>Tổng tiền hợp đồng:</Text>
                  <Text strong>{p.totalAmount?.toLocaleString("vi-VN")} ₫</Text>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text>Tiền đặt cọc:</Text>
                  <Text type="success">- {p.depositAmount?.toLocaleString("vi-VN")} ₫</Text>
                </div>
                
                {p.damageCost > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text>Tiền đền thiệt hại:</Text>
                    <Text type="danger">+ {p.damageCost?.toLocaleString("vi-VN")} ₫</Text>
                  </div>
                )}
                
                <Divider style={{ margin: "12px 0" }} />
                
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong style={{ fontSize: 16 }}>Số tiền cần thanh toán:</Text>
                  <Text strong type="danger" style={{ fontSize: 18 }}>
                    {p.amount?.toLocaleString("vi-VN")} ₫
                  </Text>
                </div>
              </div>

              <Text>
                <strong>Phương thức:</strong> {p.method || "PayOS"}
              </Text>
              <Text>
                <strong>Trạng thái:</strong>{" "}
                <Text type={p.status === "paid" ? "success" : "warning"}>
                  {p.status === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}
                </Text>
              </Text>
              <Text>
                <strong>Hạn thanh toán:</strong>{" "}
                {dayjs(p.dueDate).format("DD/MM/YYYY")}
              </Text>

              {p.status === "pending" && p.checkoutUrl && (
                <>
                  <Alert
                    message="📱 Vui lòng quét mã QR hoặc mở link PayOS bên dưới để thanh toán."
                    type="info"
                    showIcon
                  />
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: 20,
                      padding: 16,
                      background: "#fff",
                      borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <QRCode value={p.checkoutUrl} size={220} />
                    <div style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        href={p.checkoutUrl}
                        target="_blank"
                        icon={<QrcodeOutlined />}
                      >
                        Mở link thanh toán
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {p.status === "paid" && (
                <>
                  <Alert
                    message="✅ Thanh toán hoàn tất! Hóa đơn giấy sẽ được gửi cho bạn sớm."
                    type="success"
                    showIcon
                  />
                  <Button
                    type="default"
                    onClick={() => showFeedbackModal(p.contractId)}
                    style={{ marginTop: 20 }}
                  >
                    Để lại feedback
                  </Button>
                </>
              )}
            </Space>
          </Card>
        ))
      )}

      {/* Modal feedback */}
      <Modal
        title="Đánh giá dịch vụ"
        visible={feedbackVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loadingFeedback}
            onClick={handleFeedbackSubmit}
          >
            Gửi feedback
          </Button>,
        ]}
      >
        <div>
          <p>Đánh giá:</p>
          <Rate onChange={setRating} value={rating} />
          <p style={{ marginTop: 10 }}>Bình luận:</p>
          <Input.TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Nhập ý kiến của bạn..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default UserFinalPaymentPage;