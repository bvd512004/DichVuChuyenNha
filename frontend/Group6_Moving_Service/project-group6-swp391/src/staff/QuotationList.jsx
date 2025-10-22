import React, { useState } from "react";
import {
    Card,
    Row,
    Col,
    Button,
    Select,
    InputNumber,
    message, // Sử dụng message của Antd
    Tag,
    Typography,
    Divider,
    Space,
} from "antd";
import { DeleteOutlined, MinusOutlined, PlusOutlined, InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
// Giả định axios ở đây là axiosInstance đã được cấu hình
import axiosInstance from "../service/axiosInstance"; 
import dayjs from "dayjs";

const { Text, Title } = Typography;

export const QuotationList = ({
    quotations,
    fetchQuotations,
    selectedQuotation,
    setSelectedQuotation,
}) => {

    // Thay thế notification tự tạo bằng message Antd
    const showMessage = (type, content) => {
        message[type](content);
    };

    const statusColors = {
        APPROVED: "success", // green
        SENT: "processing", // blue
        DRAFT: "warning", // orange
        REJECTED: "error",
    };

    const statusText = {
        APPROVED: "Đã chấp nhận",
        PENDING: "Đang chờ", // Sửa từ 'Đã gửi' thành 'Đang chờ' cho trạng thái PENDING
        SENT: "Đã gửi",
        DRAFT: "Bản nháp",
        REJECTED: "Đã từ chối",
        CREATED :"Đã được quản lí duyệt và tạo hợp đồng"
    };

    // 🧩 Hiển thị chi tiết báo giá
    const renderQuotationDetails = (record) => {
        if (!record) {
            return (
                <div
                    style={{
                        height: "75vh",
                        display: "flex",
                        flexDirection: 'column',
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#888",
                        fontStyle: "italic",
                        background: "#fafafa",
                        borderRadius: 12, // Tăng bo tròn
                        border: "2px dashed #e0e0e0", // Viền dash hiện đại
                        padding: 24,
                    }}
                >
                    <InfoCircleOutlined style={{ fontSize: 40, marginBottom: 16, color: '#999' }} />
                    <Title level={4} style={{ color: '#999' }}>Chưa có báo giá được chọn</Title>
                    <Text type="secondary">Vui lòng chọn một báo giá từ danh sách bên trái để xem chi tiết.</Text>
                </div>
            );
        }

        const added = record.services || [];

        const handleUpdateQuantity = async (serviceId, newQuantity) => {
            if (newQuantity < 1) return;
            try {
                // Sửa lại API call để sử dụng axiosInstance
                await axiosInstance.put(
                    `/quotation-services/${serviceId}`,
                    null, // Body rỗng hoặc null cho PUT/DELETE nếu API chỉ dùng query/path
                    { params: { quantity: newQuantity } } // Truyền số lượng qua params
                );
                showMessage("success", "Cập nhật số lượng thành công!");
                fetchQuotations?.();
            } catch (error) {
                console.error("Lỗi cập nhật số lượng:", error);
                showMessage("error", "Cập nhật thất bại!");
            }
        };

        const handleDeleteService = async (serviceId) => {
            try {
                // Sửa lại API call để sử dụng axiosInstance
                await axiosInstance.delete(
                    `/quotation-services/${serviceId}`
                );
                showMessage("success", "Xóa dịch vụ thành công!");
                fetchQuotations?.();
            } catch (error) {
                console.error("Lỗi xóa dịch vụ:", error);
                showMessage("error", "Xóa thất bại!");
            }
        };

        return (
            <Card
                style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', minHeight: '75vh' }}
                title={
                    <Space>
                        <Text strong>Báo giá #{record.quotationId}</Text>
                        <Tag color={statusColors[record.status]} style={{ fontWeight: 'bold' }}>
                            {statusText[record.status] || record.status}
                        </Tag>
                    </Space>
                }
                extra={
                     // Thêm nút hành động (ví dụ: Chỉnh sửa/Duyệt)
                    <Button type="primary" size="small" style={{ borderRadius: 6 }}>
                        Duyệt báo giá
                    </Button>
                }
            >
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Title level={5} style={{ color: '#1890ff' }}>Thông tin khách hàng</Title>
                        <Text><strong>Tên:</strong> {record.username}</Text><br />
                        <Text><strong>Điện thoại:</strong> {record.phone || "N/A"}</Text><br />
                        <Text><strong>Ngày tạo:</strong> {dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
                    </Col>
                    <Col span={12}>
                        <Title level={5} style={{ color: '#1890ff' }}>Địa điểm & Thời gian</Title>
                        <Text><strong>Từ:</strong> {record.addressFrom || "N/A"}</Text><br />
                        <Text><strong>Đến:</strong> {record.addressTo || "N/A"}</Text><br />
                        <Text><strong>Ngày chuyển:</strong> {dayjs(record.surveyDate).format("DD/MM/YYYY")}</Text>
                    </Col>
                </Row>
                
                <Divider orientation="left" style={{ margin: '20px 0' }}>
                    <Title level={5} style={{ margin: 0 }}>Chi tiết Dịch vụ</Title>
                </Divider>

                {/* Dịch vụ đã thêm */}
                <div style={{ maxHeight: '40vh', overflowY: 'auto', paddingRight: 8 }}>
                    {added.length > 0 ? (
                        added.map((s) => (
                            <Card
                                key={s?.id}
                                size="small"
                                style={{
                                    marginBottom: 10,
                                    borderRadius: 8,
                                    // Tạo hiệu ứng đổ bóng cho từng dịch vụ
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s',
                                    backgroundColor: '#f9f9f9'
                                }}
                            >
                                <Row justify="space-between" align="middle">
                                    <Col span={12}>
                                        <Text strong style={{ color: '#333' }}>{s?.serviceName}</Text><br />
                                        <Text type="secondary" style={{ fontSize: 12 }}>({s?.priceType})</Text>
                                    </Col>
                                    <Col span={6} style={{ textAlign: 'center' }}>
                                        <Text>
                                            {s?.amount?.toLocaleString()} × {s.quantity}
                                        </Text>
                                    </Col>
                                    <Col span={6} style={{ textAlign: 'right' }}>
                                        <Space>
                                            <Button
                                                icon={<MinusOutlined />}
                                                size="small"
                                                onClick={() => handleUpdateQuantity(s.id, s.quantity - 1)}
                                                disabled={s.quantity <= 1}
                                            />
                                            <InputNumber
                                                min={1}
                                                size="small"
                                                value={s.quantity}
                                                onChange={(value) => handleUpdateQuantity(s.id, value || 1)}
                                                style={{ width: 50, textAlign: 'center' }}
                                            />
                                            <Button
                                                icon={<PlusOutlined />}
                                                size="small"
                                                onClick={() => handleUpdateQuantity(s.id, s.quantity + 1)}
                                            />
                                            <Button
                                                danger
                                                type="text" // Dùng type="text" để nút xóa gọn gàng hơn
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeleteService(s.id)}
                                                title="Xóa dịch vụ"
                                            />
                                        </Space>
                                    </Col>
                                </Row>
                                <div style={{ textAlign: 'right', marginTop: 8, borderTop: '1px dashed #eee', paddingTop: 4 }}>
                                    <Text strong type="success">
                                        Thành tiền: {s.subtotal?.toLocaleString()} đ
                                    </Text>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p style={{ color: "#999", fontStyle: "italic", textAlign: 'center' }}>
                            Chưa có dịch vụ nào được thêm vào báo giá này.
                        </p>
                    )}
                </div>

                {/* Tổng cộng */}
                <div
                    style={{
                        background: "#e6f7ff", // Màu nền nhẹ nhàng
                        padding: "16px",
                        marginTop: 20,
                        borderRadius: 8,
                        textAlign: "right",
                        border: '1px solid #91d5ff'
                    }}
                >
                    <Title level={4} style={{ margin: 0 }}>
                        <Text strong>TỔNG CỘNG: </Text>
                        <Text strong style={{ color: "#1890ff" }}>
                            {record.totalPrice?.toLocaleString() || 0} đ
                        </Text>
                    </Title>
                </div>
            </Card>
        );
    };

    // 🧱 Giao diện chính — 2 cột
    return (
        <Row gutter={24}>
            {/* Cột trái: danh sách báo giá */}
            <Col span={10}>
                <Title level={4} style={{ marginBottom: 16, borderLeft: '4px solid #1890ff', paddingLeft: 12 }}>
                    Danh Sách Báo Giá ({quotations.length})
                </Title>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        maxHeight: "75vh",
                        overflowY: "auto",
                        paddingRight: 8 // Thêm padding để không che scrollbar
                    }}
                >
                    {quotations.map((q) => (
                        <Card
                            key={q.quotationId}
                            hoverable
                            onClick={() => setSelectedQuotation(q)}
                            style={{
                                borderRadius: 10,
                                // Đổ bóng nhẹ khi chưa chọn, đổ bóng mạnh hơn khi chọn
                                boxShadow: selectedQuotation?.quotationId === q.quotationId
                                    ? "0 4px 10px rgba(24, 144, 255, 0.2)"
                                    : "0 2px 5px rgba(0, 0, 0, 0.05)",
                                border:
                                    selectedQuotation?.quotationId === q.quotationId
                                        ? "2px solid #1890ff"
                                        : "1px solid #ddd",
                                background:
                                    selectedQuotation?.quotationId === q.quotationId
                                        ? "#e6f7ff" // Nền xanh nhạt khi được chọn
                                        : "white",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                                    <Text strong style={{ color: '#1890ff' }}>#{q.quotationId}</Text>
                                    <Tag color={statusColors[q.status]} style={{ fontWeight: 'bold' }}>
                                        {statusText[q.status] || q.status}
                                    </Tag>
                                </Row>
                                <Text>{q.username} ({q.phone})</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    <CheckCircleOutlined style={{ marginRight: 4 }} />
                                    Ngày tạo: {dayjs(q.createdAt).format("DD/MM/YYYY")}
                                </Text>
                                <Divider style={{ margin: '8px 0' }} />
                                <div style={{ textAlign: "right" }}>
                                    <Text type="success" style={{ fontSize: 16, fontWeight: 'bold' }}>
                                        Tổng: {q.totalPrice?.toLocaleString() || 0} đ
                                    </Text>
                                </div>
                            </Space>
                        </Card>
                    ))}
                    {quotations.length === 0 && (
                        <Card style={{ textAlign: 'center', color: '#999', border: '1px dashed #ccc' }}>
                            Không có báo giá nào.
                        </Card>
                    )}
                </div>
            </Col>

            {/* Cột phải: chi tiết báo giá */}
            <Col span={14}>
                {renderQuotationDetails(selectedQuotation)}
            </Col>
        </Row>
    );
};