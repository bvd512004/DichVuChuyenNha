import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Spin,
  List,
  Modal,
  Typography,
  Space,
  Empty,
  Checkbox,
  message,
} from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
// Giả định bạn có axiosInstance trong file api.js hoặc service/axiosInstance
import api from "../service/axiosInstance"; 
import dayjs from "dayjs";

const { Title, Text } = Typography;

const QuotationApproval = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [agree, setAgree] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  // Hàm tải dữ liệu báo giá
  const fetchQuotations = async () => {
    setLoading(true);
    try {
      // Sử dụng api.get() thay vì axios.get()
      const res = await api.get("/quotations/pending/me");
      // Dữ liệu trả về có thể được xử lý thêm nếu cần
      setQuotations(res.data.result || res.data || []); 
    } catch (err) {
      // Sử dụng message của antd thay vì alert()
      message.error("Không thể tải danh sách báo giá. Vui lòng thử lại!");
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // Hàm chấp thuận báo giá
  const handleApprove = async (quotationId) => {
    if (!agree) {
      message.warning("Vui lòng đồng ý với báo giá trước khi xác nhận!");
      return;
    }

    setApproving(true);
    try {
      await api.put(`/quotations/approve/${quotationId}`);
      message.success("Bạn đã chấp thuận báo giá thành công! Hợp đồng sẽ được tạo.");
      fetchQuotations(); // load lại danh sách mới

      // Cập nhật state bằng cách lọc bỏ báo giá vừa duyệt
      setQuotations((prev) => prev.filter((q) => q.id !== quotationId));
      setSelectedQuotation(null);
      setAgree(false);
    } catch (err) {
      // Xử lý lỗi từ backend/API
      message.error("Xác nhận thất bại, vui lòng thử lại!");
    } finally {
      setApproving(false);
    }
  };

  // Hàm từ chối báo giá
  const handleReject = async (quotationId) => {
    setRejecting(true);
    try {
      await api.put(`/quotations/reject/${quotationId}`);
      message.info("Bạn đã từ chối báo giá này.");
      // Cập nhật state bằng cách lọc bỏ báo giá vừa từ chối
      setQuotations((prev) => prev.filter((q) => q.id !== quotationId));
      setSelectedQuotation(null);
      setShowRejectConfirm(false);
    } catch (err) {
      message.error("Không thể từ chối báo giá, vui lòng thử lại!");
    } finally {
      setRejecting(false);
    }
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          minHeight: "300px",
        }}
      >
        <Spin size="large" tip="Đang tải báo giá chờ duyệt..." />
      </div>
    );
  }

  // --- JSX cho nội dung chính ---

  return (
    <div style={{ padding: "0px 10px" }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        💰 Báo giá chờ duyệt
      </Title>

      {quotations.length === 0 ? (
        <Empty
          description={
            <Text type="secondary">
              Không có báo giá nào đang chờ bạn chấp thuận.
            </Text>
          }
          style={{ padding: "50px 0" }}
        />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
          dataSource={quotations}
          renderItem={(quotation) => (
            <List.Item>
              <Card
                title={quotation.companyName || "Công ty chuyển nhà"}
                hoverable
                extra={
                  <Text strong type="danger">
                    {quotation.totalPrice
                      ? quotation.totalPrice.toLocaleString("vi-VN") + " ₫"
                      : "Chưa có giá"}
                  </Text>
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text>
                    Ngày khảo sát:{" "}
                    {quotation.surveyDate
                      ? dayjs(quotation.surveyDate).format("DD/MM/YYYY")
                      : "Không rõ"}
                  </Text>
                  <Text ellipsis>
                    Địa chỉ: {quotation.addressFrom || "?"} →{" "}
                    {quotation.addressTo || "?"}
                  </Text>
                  <Button
                    type="primary"
                    block
                    danger
                    onClick={() => {
                      setSelectedQuotation(quotation);
                      setAgree(false);
                      setShowRejectConfirm(false);
                    }}
                  >
                    Xem chi tiết & Phê duyệt
                  </Button>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      )}

      {/* Modal chi tiết & phê duyệt */}
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết báo giá từ {selectedQuotation?.companyName}
          </Title>
        }
        open={!!selectedQuotation}
        onCancel={() => {
          setSelectedQuotation(null);
          setShowRejectConfirm(false); // Đóng xác nhận từ chối khi đóng modal
        }}
        footer={[
          // Nút Chấp thuận
          <Button
            key="approve"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={approving}
            disabled={!agree || approving || rejecting}
            onClick={() => handleApprove(selectedQuotation.quotationId)}
            style={{ backgroundColor: "darkred", borderColor: "darkred" }}
          >
            {approving ? "Đang xử lý..." : "Chấp thuận"}
          </Button>,

          // Nút Từ chối
          !showRejectConfirm ? (
            <Button
              key="reject-confirm-btn"
              icon={<CloseCircleOutlined />}
              onClick={() => setShowRejectConfirm(true)}
              disabled={approving || rejecting}
            >
              Từ chối báo giá
            </Button>
          ) : (
            <Space key="reject-group">
              <Text type="danger">Xác nhận từ chối?</Text>
              <Button
                key="reject-no"
                onClick={() => setShowRejectConfirm(false)}
                disabled={rejecting}
              >
                Hủy
              </Button>
              <Button
                key="reject-yes"
                danger
                loading={rejecting}
                onClick={() => handleReject(selectedQuotation.quotationId)}
              >
                {rejecting ? "Đang xử lý..." : "Từ chối"}
              </Button>
            </Space>
          ),
        ]}
        width={800}
      >
        {selectedQuotation && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card type="inner" title="Thông tin chung">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                <Text style={{ flexBasis: "45%" }}>
                  <strong>Khách hàng:</strong> {selectedQuotation.username}
                </Text>
                <Text style={{ flexBasis: "45%" }}>
                  <strong>Công ty:</strong> {selectedQuotation.companyName}
                </Text>
                <Text style={{ flexBasis: "45%" }}>
                  <strong>Ngày khảo sát:</strong>{" "}
                  {selectedQuotation.surveyDate
                    ? dayjs(selectedQuotation.surveyDate).format("DD/MM/YYYY")
                    : "-"}
                </Text>
                <Text style={{ flexBasis: "45%" }}>
                  <strong>Tổng giá trị:</strong>{" "}
                  <Text strong type="danger">
                    {selectedQuotation.totalPrice?.toLocaleString("vi-VN") + " ₫"}
                  </Text>
                </Text>
                <Text style={{ flexBasis: "100%" }}>
                  <strong>Địa chỉ:</strong> {selectedQuotation.addressFrom} →{" "}
                  {selectedQuotation.addressTo}
                </Text>
                <Text style={{ flexBasis: "100%" }}>
                  <strong>Dịch vụ kèm theo:</strong>{" "}
                  {selectedQuotation.listService || "Không có"}
                </Text>
              </div>
            </Card>

            <Card title="Chi tiết dịch vụ">
              <List
                itemLayout="horizontal"
                dataSource={selectedQuotation.services || []}
                renderItem={(item, index) => (
                  <List.Item
                    actions={[
                      <Text strong key="subtotal">
                        {item.subtotal?.toLocaleString("vi-VN")} ₫
                      </Text>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.serviceName}
                      description={`Đơn vị: ${item.priceType} | Số lượng: ${item.quantity}`}
                    />
                  </List.Item>
                )}
              />
            </Card>

            <div style={{ padding: "10px 0" }}>
              <Checkbox
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              >
                Tôi **đồng ý** với toàn bộ nội dung và chi phí trong báo giá này.
              </Checkbox>
              <Text type="secondary" style={{ display: "block", marginTop: 5 }}>
                *Việc chấp thuận sẽ chuyển báo giá thành Hợp đồng chờ ký kết.
              </Text>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default QuotationApproval;