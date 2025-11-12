import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Spin,
  Empty,
  Typography,
  Space,
  Checkbox,
  message,
  Card,
  List,
  Alert,
} from "antd";
import { FileProtectOutlined, SignatureOutlined, QrcodeOutlined } from "@ant-design/icons";
import axiosInstance from "../service/axiosInstance";
import PaymentAPI from "../service/payment";
import dayjs from "dayjs";
import QRCode from "react-qr-code";

const { Title, Text } = Typography;

const UserContractsPage = () => {
  const [contracts, setContracts] = useState([]); // Danh sách hợp đồng
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [selectedContract, setSelectedContract] = useState(null); // Hợp đồng được chọn
  const [agreeTerms, setAgreeTerms] = useState(false); // Đồng ý điều khoản
  const [signing, setSigning] = useState(false); // Trạng thái ký hợp đồng
  const [paymentData, setPaymentData] = useState(null); // Dữ liệu thanh toán (mã QR, checkoutUrl...)
  const [showTerms, setShowTerms] = useState(false);

  // Tải danh sách hợp đồng chưa ký
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/contracts/unsigned/me");
      const data = res.data?.result || res.data;
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch contracts error:", err);
      message.error("Không thể tải danh sách hợp đồng.");
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Xử lý ký hợp đồng và tạo thanh toán
  const handleSign = async (contractId) => {
    if (!agreeTerms) {
      message.warning("Bạn cần đồng ý với điều khoản trước khi ký!");
      return;
    }

    setSigning(true);
    try {
      // Gửi yêu cầu ký hợp đồng
      const res = await axiosInstance.put(`/contracts/sign/${contractId}`);
      if (res.status !== 200) {
        throw new Error("Không thể ký hợp đồng. Vui lòng thử lại.");
      }
      message.success("✅ Ký hợp đồng thành công!");

      // Sau khi ký, tạo thanh toán đặt cọc PayOS
      const loadingMsg = message.loading("Đang tạo mã QR thanh toán...", 0);

      const paymentRes = await PaymentAPI.createDepositPayment(contractId);
      loadingMsg(); // Đóng loading message

      // Kiểm tra nếu response hợp lệ
      if (!paymentRes?.checkoutUrl) {
        message.error("❌ Không nhận được URL thanh toán từ server!");
        return;
      }

      setPaymentData({
        contractId,
        checkoutUrl: paymentRes.checkoutUrl,
        qrCode: paymentRes.qrCode || paymentRes.checkoutUrl,
        amount: paymentRes.amount,
        orderCode: paymentRes.orderCode,
        dueDate: paymentRes.dueDate
      });



      // Cập nhật hợp đồng đã ký vào danh sách
      setSelectedContract((prev) => ({
        ...prev,
        signed: true,
payment: {
          checkoutUrl: paymentRes.checkoutUrl,
          qrCode: paymentRes.qrCode || paymentRes.checkoutUrl,
          amount: paymentRes.amount,
          orderCode: paymentRes.orderCode,
        }
      }));

      message.success("✅ Tạo mã QR thành công! Vui lòng quét mã để thanh toán.", 3);

      // Xóa hợp đồng đã ký khỏi danh sách hợp đồng chưa ký
      setContracts((prev) => prev.filter((c) => c.contractId !== contractId));

      setAgreeTerms(false); // Reset checkbox điều khoản

    } catch (err) {
      console.error("❌ Sign error:", err);
      const errorMsg = err?.response?.data?.message || err.message || "Lỗi không xác định";
      message.error("❌ Lỗi: " + errorMsg);
    } finally {
      setSigning(false);
    }
  };

  // Đóng modal và refresh danh sách hợp đồng
  const handleCloseModal = () => {
    setSelectedContract(null);
    setPaymentData(null);
    setAgreeTerms(false);
  };

  // Cấu hình bảng hiển thị danh sách hợp đồng
  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "contractId",
      key: "contractId",
      width: 100,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY") : "-"),
      width: 120,
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY") : "-"),
      width: 120,
    },
    {
      title: "Địa điểm chuyển",
      dataIndex: "startLocation",
      key: "location",
      ellipsis: true,
      render: (_v, record) => `${record.startLocation} → ${record.endLocation}`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      width: 120,
      render: (amount) => (
        <Text strong type="danger">
          {amount?.toLocaleString("vi-VN") + " ₫"}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          danger
          onClick={() => {
            setSelectedContract(record);
            setAgreeTerms(false);
          }}
          icon={<FileProtectOutlined />}
        >
          Xem & Ký
        </Button>
      ),
    },
  ];

  // Loading UI khi đang tải
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          minHeight: "300px",
        }}
      >
        <Spin size="large" tip="Đang tải hợp đồng chờ ký..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "0px 10px" }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        ✍️ Hợp đồng chờ ký
      </Title>

      {!contracts.length ? (
        <Empty
          description={
            <Text type="secondary">
Bạn không có hợp đồng nào đang chờ ký kết.
            </Text>
          }
          style={{ padding: "50px 0" }}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="contractId"
          pagination={{ pageSize: 5, showSizeChanger: false }}
          bordered
        />
      )}

      {/* Modal chi tiết hợp đồng */}
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết hợp đồng #{selectedContract?.contractId}
          </Title>
        }
        open={!!selectedContract}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>,
          <Button
            key="sign"
            type="primary"
            danger
            icon={<SignatureOutlined />}
            loading={signing}
            disabled={!agreeTerms}
            onClick={() => handleSign(selectedContract?.contractId)}
          >
            {signing ? "Đang ký..." : "Ký hợp đồng điện tử"}
          </Button>,
        ]}
        width={900}
      >
        {selectedContract && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Thông báo ký thành công và tạo mã QR */}
            {paymentData && (
              <Alert
                message="✅ Hợp đồng đã được ký thành công!"
                description="Vui lòng quét mã QR bên dưới để hoàn tất thanh toán đặt cọc. Bạn có thể lưu lại link hoặc chụp màn hình QR code."
                type="success"
                showIcon
              />
            )}

            {/* Thông tin chung */}
            <Card type="inner" title="📋 Thông tin chung">
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <Text>
                  <strong>Ngày bắt đầu:</strong>{" "}
                  {dayjs(selectedContract.startDate).format("DD/MM/YYYY")}
                </Text>
                <Text>
                  <strong>Ngày kết thúc:</strong>{" "}
                  {dayjs(selectedContract.endDate).format("DD/MM/YYYY")}
                </Text>
                <Text>
                  <strong>Tiền cọc:</strong>{" "}
                  <Text strong type="warning">
                    {selectedContract.depositAmount?.toLocaleString("vi-VN")} ₫
                  </Text>
                </Text>
                <Text>
                  <strong>Tổng tiền hợp đồng:</strong>{" "}
                  <Text strong type="danger">
                    {selectedContract.totalAmount?.toLocaleString("vi-VN")} ₫
                  </Text>
                </Text>
                <Text>
                  <strong>Địa điểm:</strong> {selectedContract.startLocation} →{" "}
                  {selectedContract.endLocation}
                </Text>
                <Text>
<strong>Trạng thái:</strong>{" "}
                  <Text type={paymentData ? "success" : "warning"}>
                    {paymentData ? "Đã ký - Chờ thanh toán" : selectedContract.status || "Chưa ký"}
                  </Text>
                </Text>
              </Space>
            </Card>

            {/* Chi tiết dịch vụ */}
            <Card title="🛠️ Chi tiết dịch vụ">
              {selectedContract.services?.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={selectedContract.services}
                  renderItem={(s, idx) => (
                    <List.Item
                      key={idx}
                      actions={[
                        <Text strong key="subtotal" type="danger">
                          {s.subtotal?.toLocaleString("vi-VN")} ₫
                        </Text>,
                      ]}
                    >
                      <List.Item.Meta
                        title={s.serviceName}
                        description={`Loại giá: ${s.priceType} | Số lượng: ${s.quantity}`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">Không có dịch vụ nào được liệt kê.</Text>
              )}
            </Card>

            {/* Hiển thị QR Code nếu đã ký và có payment data */}
            {paymentData && paymentData.checkoutUrl ? (
              <Card
                title={
                  <Space>
                    <QrcodeOutlined style={{ fontSize: 20 }} />
                    <Text strong>💳 Thanh toán đặt cọc</Text>
                  </Space>
                }
                style={{
                  marginTop: 16,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
                headStyle={{
                  background: "transparent",
                  color: "white",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                }}
                bodyStyle={{ background: "white" }}
              >
                <Space direction="vertical" align="center" style={{ width: "100%" }}>
                  <Alert
                    message="📱 Quét mã QR bên dưới để thanh toán"
                    description={
                      <Space direction="vertical" size={4}>
                        <Text>Mã đơn hàng: <strong>{paymentData.orderCode}</strong></Text>
                        <Text>Hợp đồng: <strong>#{paymentData.contractId}</strong></Text>
                      </Space>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 16, width: "100%" }}
                  />

                  <div
                    style={{
                      padding: 20,
background: "white",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    <QRCode
                      value={paymentData.checkoutUrl}
                      size={280}
                      level="H"
                      style={{ border: "8px solid white" }}
                    />
                  </div>

                  <Text strong style={{ fontSize: 20, color: "#ff4d4f", marginTop: 16 }}>
                    Số tiền: {paymentData.amount?.toLocaleString("vi-VN")} ₫
                  </Text>

                  {/* 🕒 Hạn thanh toán */}
                  <Text strong style={{ marginTop: 8 }}>
                    🕒 Hạn thanh toán:{" "}
                    <Text type="danger">
                      {paymentData.dueDate
                        ? new Date(paymentData.dueDate).toLocaleDateString("vi-VN")
                        : "Chưa có thông tin"}
                    </Text>
                  </Text>

                  <Button
                    type="primary"
                    size="large"
                    href={paymentData.checkoutUrl}
                    target="_blank"
                    icon={<QrcodeOutlined />}
                    style={{
                      marginTop: 16,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      height: 48,
                      fontSize: 16,
                    }}
                  >
                    Mở link thanh toán
                  </Button>

                  <Text
                    type="secondary"
                    style={{ fontSize: 12, marginTop: 12, textAlign: "center" }}
                  >
                    💡 Bạn có thể quét mã QR hoặc click vào nút "Mở link thanh toán"
                  </Text>

                  <Alert
                    message="📌 Lưu ý quan trọng"
                    description="Hãy chụp màn hình hoặc lưu lại link thanh toán trước khi đóng cửa sổ này!"
                    type="warning"
                    showIcon
                    style={{ marginTop: 16, width: "100%" }}
                  />
                </Space>
              </Card>
            ) : (

              <div style={{ padding: "10px 0" }}>
                <Card
                  title="🧾 Điều khoản và điều kiện hợp đồng dịch vụ chuyển nhà"
                  size="small"
                  style={{
                    background: "#fafafa",
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                  extra={
                    <a onClick={() => setShowTerms((prev) => !prev)}>
                      {showTerms ? "Ẩn bớt" : "Xem chi tiết"}
                    </a>
                  }
                >
                  {showTerms && (
                    <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                      <p><strong>1. Thông tin các bên</strong></p>
                      <p>
                        <strong>Bên Khách hàng:</strong> Là người đặt dịch vụ chuyển nhà thông qua hệ thống.<br />
                        <strong>Bên Công ty cung cấp dịch vụ:</strong> Đơn vị sở hữu nền tảng và thực hiện dịch vụ vận chuyển, tháo lắp, sắp xếp, v.v.
                      </p>

                      <p><strong>2. Phạm vi dịch vụ</strong></p>
                      <p>
                        Dịch vụ bao gồm: tư vấn, khảo sát, đóng gói, vận chuyển, bốc dỡ, sắp xếp lại đồ đạc theo yêu cầu của khách hàng.<br />
                        Các dịch vụ phát sinh (nếu có) như nâng tầng, chờ thang máy, hoặc chuyển ngoài giờ sẽ được tính riêng theo báo giá đã được duyệt.
                      </p>

                      <p><strong>3. Nghĩa vụ và trách nhiệm</strong></p>
                      <ul>
                        <li><strong>Bên Khách hàng:</strong> Cung cấp thông tin địa chỉ, thời gian, và tài sản cần vận chuyển chính xác.</li>
                        <li>Thanh toán đầy đủ chi phí dịch vụ theo hợp đồng.</li>
                        <li>Hợp tác trong quá trình vận chuyển để đảm bảo tiến độ.</li>
                      </ul>
                      <ul>
                        <li><strong>Bên Công ty:</strong> Cung cấp dịch vụ đúng phạm vi, thời gian, và chi phí đã thỏa thuận.</li>
                        <li>Đảm bảo an toàn tài sản trong quá trình vận chuyển.</li>
                        <li>Thông báo ngay cho khách hàng nếu phát sinh sự cố hoặc thay đổi lịch trình.</li>
                      </ul>

                      <p><strong>4. Thanh toán</strong></p>
                      <ul>
                        <li>Khách hàng thanh toán 50% giá trị hợp đồng (đặt cọc) sau khi ký điện tử.</li>
                        <li>Phần còn lại thanh toán sau khi hoàn tất công việc.</li>
                        <li>Hình thức thanh toán: quét mã QR (PayOS) hoặc các phương thức được hỗ trợ.</li>
                      </ul>

                      <p><strong>5. Hủy và hoàn tiền</strong></p>
                      <ul>
                        <li>Hủy trước 24h: hoàn 80% tiền đặt cọc.</li>
                        <li>Hủy sau 24h: không hoàn tiền.</li>
                        <li>Nếu công ty không thể cung cấp dịch vụ: hoàn 100% tiền đặt cọc.</li>
                      </ul>

                      <p><strong>6. Xử lý thiệt hại</strong></p>
                      <ul>
                        <li>Bồi thường nếu lỗi do nhân viên công ty.</li>
                        <li>Không vượt quá giá trị thực tế của tài sản.</li>
                        <li>Trường hợp bất khả kháng: hai bên thương lượng.</li>
                      </ul>

                      <p><strong>7. Bảo mật thông tin</strong></p>
                      <p>Mọi thông tin của khách hàng được bảo mật tuyệt đối.</p>

                      <p><strong>8. Điều khoản chung</strong></p>
                      <ul>
                        <li>Hợp đồng điện tử có giá trị pháp lý tương đương hợp đồng giấy.</li>
                        <li>Việc tick chọn “Tôi đồng ý...” là xác nhận chấp thuận toàn bộ điều khoản.</li>
                        <li>Tranh chấp (nếu có) sẽ do tòa án nơi công ty đặt trụ sở xử lý.</li>
                      </ul>
                    </div>

                  )}
                </Card>

                <Checkbox
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                >
                  Tôi <strong>đã đọc và đồng ý</strong> với tất cả các điều khoản và điều kiện của hợp đồng này.
                </Checkbox>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default UserContractsPage;
