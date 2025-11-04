import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, message, Button, Alert, Space } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import QRCode from "react-qr-code"; // ✅ ✅ ✅ THÊM DÒNG NÀY
import PaymentAPI from "../service/payment";

const { Title, Text } = Typography;

const UserFinalPaymentPage = () => {
  const [loading, setLoading] = useState(true);
  const [finalPayments, setFinalPayments] = useState([]);

  // ✅ Lấy danh sách thanh toán cuối của người dùng
  const fetchFinalPayments = async () => {
    setLoading(true);
    try {
      const res = await PaymentAPI.getFinalPaymentsForUser();
      console.log("📦 Final payments response:", res); // Debug
      
      // ✅ Parse JSON string nếu cần
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
        <Alert
          message="Bạn chưa có thanh toán nào cần hoàn tất."
          type="info"
          showIcon
        />
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
              <Text>
                <strong>Số tiền:</strong>{" "}
                <Text strong type="danger">
                  {p.amount?.toLocaleString("vi-VN")} ₫
                </Text>
              </Text>
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
                <Alert
                  message="✅ Thanh toán hoàn tất! Hóa đơn giấy sẽ được gửi cho bạn sớm."
                  type="success"
                  showIcon
                />
              )}
            </Space>
          </Card>
        ))
      )}
    </div>
  );
};

export default UserFinalPaymentPage;