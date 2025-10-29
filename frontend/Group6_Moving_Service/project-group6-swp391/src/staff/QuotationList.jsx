import React, { useState } from "react";
import {
    Card,
    Row,
    Col,
    Button,
    Select,
    InputNumber,
    message,
    Tag,
    Typography,
    Divider,
    Space,
    Badge,
    Tooltip,
} from "antd";
import { 
    DeleteOutlined, 
    MinusOutlined, 
    PlusOutlined, 
    InfoCircleOutlined, 
    CheckCircleOutlined,
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    DollarOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import axiosInstance from "../service/axiosInstance"; 
import dayjs from "dayjs";

const { Text, Title } = Typography;

export const QuotationList = ({
    quotations,
    fetchQuotations,
    selectedQuotation,
    setSelectedQuotation,
}) => {

    const showMessage = (type, content) => {
        message[type](content);
    };

    const statusColors = {
        APPROVED: "#52c41a",
        SENT: "#1890ff",
        DRAFT: "#faad14",
        REVIEW: "#ff4d4f",
        PENDING: "#722ed1",
        CREATED: "#13c2c2"
    };

    const statusText = {
        APPROVED: "Đã chấp nhận",
        PENDING: "Đang chờ sự chấp thuận từ khách hàng",
        SENT: "Đã gửi",
        DRAFT: "Bản nháp",
        REVIEW: "Đang chờ sự xem xét từ quản lí bộ phận",
        CREATED: "Đã được quản lí bộ phận tạo hợp đồng"
    };

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
                        background: "#fafafa",
                        borderRadius: 12,
                        border: "2px dashed #d9d9d9",
                        padding: 48,
                    }}
                >
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 24
                    }}>
                        <InfoCircleOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
                    </div>
                    <Title level={4} style={{ color: '#595959', marginBottom: 8 }}>
                        Chưa có báo giá được chọn
                    </Title>
                    <Text type="secondary" style={{ fontSize: 15 }}>
                        Vui lòng chọn một báo giá từ danh sách để xem chi tiết
                    </Text>
                </div>
            );
        }

        const added = record.services || [];

        const handleUpdateQuantity = async (serviceId, newQuantity) => {
            if (newQuantity < 1) return;
            try {
                await axiosInstance.put(
                    `/quotation-services/${serviceId}`,
                    null,
                    { params: { quantity: newQuantity } }
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
                await axiosInstance.delete(`/quotation-services/${serviceId}`);
                showMessage("success", "Xóa dịch vụ thành công!");
                fetchQuotations?.();
            } catch (error) {
                console.error("Lỗi xóa dịch vụ:", error);
                showMessage("error", "Xóa thất bại!");
            }
        };

        return (
            <div style={{ height: '75vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header Card */}
                <Card
                    style={{ 
                        borderRadius: 12, 
                        marginBottom: 16,
                        background: '#262626',
                        border: 'none'
                    }}
                    bodyStyle={{ padding: '20px 24px' }}
                >
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space size="middle">
                                <Title level={4} style={{ margin: 0, color: '#fff' }}>
                                    Báo giá #{record.quotationId}
                                </Title>
                                <Tag 
                                    color={statusColors[record.status]}
                                    style={{ 
                                        fontWeight: 600,
                                        fontSize: 13,
                                        padding: '4px 12px',
                                        borderRadius: 6,
                                        border: 'none'
                                    }}
                                >
                                    {statusText[record.status] || record.status}
                                </Tag>
                            </Space>
                        </Col>
                        <Col>
                            <Button 
                                type="primary" 
                                style={{ 
                                    borderRadius: 6,
                                    background: '#fff',
                                    color: '#262626',
                                    border: 'none',
                                    fontWeight: 600
                                }}
                            >
                                Duyệt báo giá
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Content Card - Scrollable */}
                <Card
                    style={{ 
                        borderRadius: 12,
                        border: '1px solid #e8e8e8',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                    bodyStyle={{ 
                        padding: 24,
                        flex: 1,
                        overflow: 'auto'
                    }}
                >
                    {/* Thông tin khách hàng */}
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <div style={{ 
                                background: '#fafafa', 
                                padding: 20, 
                                borderRadius: 8,
                                border: '1px solid #f0f0f0'
                            }}>
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        marginBottom: 8
                                    }}>
                                        <UserOutlined style={{ fontSize: 18, marginRight: 8, color: '#262626' }} />
                                        <Text strong style={{ fontSize: 16 }}>Thông tin khách hàng</Text>
                                    </div>
                                    <Space direction="vertical" size="small">
                                        <Text><strong>Tên:</strong> {record.username}</Text>
                                        <Text><strong>Điện thoại:</strong> {record.phone || "N/A"}</Text>
                                        <Text><strong>Ngày tạo:</strong> {dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
                                    </Space>
                                </Space>
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div style={{ 
                                background: '#fafafa', 
                                padding: 20, 
                                borderRadius: 8,
                                border: '1px solid #f0f0f0'
                            }}>
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        marginBottom: 8
                                    }}>
                                        <EnvironmentOutlined style={{ fontSize: 18, marginRight: 8, color: '#262626' }} />
                                        <Text strong style={{ fontSize: 16 }}>Địa điểm & Thời gian</Text>
                                    </div>
                                    <Space direction="vertical" size="small">
                                        <Text><strong>Từ:</strong> {record.addressFrom || "N/A"}</Text>
                                        <Text><strong>Đến:</strong> {record.addressTo || "N/A"}</Text>
                                        <Text><strong>Ngày chuyển:</strong> {dayjs(record.surveyDate).format("DD/MM/YYYY")}</Text>
                                    </Space>
                                </Space>
                            </div>
                        </Col>
                    </Row>

                    <Divider style={{ margin: '24px 0' }}>
                        <Space>
                            <FileTextOutlined style={{ color: '#262626' }} />
                            <Text strong style={{ fontSize: 16 }}>Chi tiết Dịch vụ</Text>
                        </Space>
                    </Divider>

                    {/* Danh sách dịch vụ */}
                    <div>
                        {added.length > 0 ? (
                            added.map((s) => (
                                <Card
                                    key={s?.id}
                                    size="small"
                                    style={{
                                        marginBottom: 12,
                                        borderRadius: 8,
                                        border: '1px solid #e8e8e8',
                                        background: '#fff'
                                    }}
                                    bodyStyle={{ padding: 16 }}
                                >
                                    <Row justify="space-between" align="top" gutter={[16, 16]}>
                                        <Col xs={24} sm={12}>
                                            <Space direction="vertical" size={4}>
                                                <Text strong style={{ fontSize: 15 }}>{s?.serviceName}</Text>
                                                <Tag style={{ 
                                                    background: '#f0f0f0', 
                                                    color: '#595959',
                                                    border: 'none',
                                                    fontSize: 12
                                                }}>
                                                    {s?.priceType}
                                                </Tag>
                                            </Space>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <Text type="secondary">Đơn giá:</Text>
                                                    <Text strong>{s?.amount?.toLocaleString()} đ</Text>
                                                </div>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    gap: 8
                                                }}>
                                                    <Text type="secondary">Số lượng:</Text>
                                                    <Space size={4}>
                                                        <Button
                                                            icon={<MinusOutlined />}
                                                            size="small"
                                                            onClick={() => handleUpdateQuantity(s.id, s.quantity - 1)}
                                                            disabled={s.quantity <= 1}
                                                            style={{ borderRadius: 4 }}
                                                        />
                                                        <InputNumber
                                                            min={1}
                                                            size="small"
                                                            value={s.quantity}
                                                            onChange={(value) => handleUpdateQuantity(s.id, value || 1)}
                                                            style={{ width: 60, textAlign: 'center', borderRadius: 4 }}
                                                        />
                                                        <Button
                                                            icon={<PlusOutlined />}
                                                            size="small"
                                                            onClick={() => handleUpdateQuantity(s.id, s.quantity + 1)}
                                                            style={{ borderRadius: 4 }}
                                                        />
                                                        <Tooltip title="Xóa dịch vụ">
                                                            <Button
                                                                danger
                                                                type="text"
                                                                size="small"
                                                                icon={<DeleteOutlined />}
                                                                onClick={() => handleDeleteService(s.id)}
                                                                style={{ borderRadius: 4 }}
                                                            />
                                                        </Tooltip>
                                                    </Space>
                                                </div>
                                                <Divider style={{ margin: '8px 0' }} />
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <Text strong>Thành tiền:</Text>
                                                    <Text strong style={{ fontSize: 16, color: '#262626' }}>
                                                        {s.subtotal?.toLocaleString()} đ
                                                    </Text>
                                                </div>
                                            </Space>
                                        </Col>
                                    </Row>
                                </Card>
                            ))
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: 40,
                                background: '#fafafa',
                                borderRadius: 8,
                                border: '1px dashed #d9d9d9'
                            }}>
                                <FileTextOutlined style={{ fontSize: 40, color: '#bfbfbf', marginBottom: 16 }} />
                                <Text type="secondary" style={{ display: 'block' }}>
                                    Chưa có dịch vụ nào được thêm vào báo giá này
                                </Text>
                            </div>
                        )}
                    </div>

                    {/* Tổng cộng */}
                    <div
                        style={{
                            background: "#262626",
                            padding: "20px 24px",
                            marginTop: 24,
                            borderRadius: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Space>
                            <DollarOutlined style={{ fontSize: 24, color: '#fff' }} />
                            <Text strong style={{ fontSize: 18, color: '#fff' }}>TỔNG CỘNG</Text>
                        </Space>
                        <Text strong style={{ fontSize: 24, color: '#fff' }}>
                            {record.totalPrice?.toLocaleString() || 0} đ
                        </Text>
                    </div>
                </Card>
            </div>
        );
    };

    return (
        <Row gutter={24} style={{ height: '80vh' }}>
            {/* Cột trái: danh sách báo giá */}
            <Col xs={24} lg={10} style={{ height: '100%' }}>
                <Card
                    style={{
                        height: '100%',
                        borderRadius: 12,
                        border: '1px solid #e8e8e8',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    bodyStyle={{ 
                        padding: 0, 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header cố định */}
                    <div style={{ 
                        padding: '20px 24px',
                        borderBottom: '1px solid #e8e8e8',
                        background: '#fafafa'
                    }}>
                        <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Space>
                                <FileTextOutlined style={{ fontSize: 20, color: '#262626' }} />
                                <Title level={4} style={{ margin: 0 }}>
                                    Danh Sách Báo Giá
                                </Title>
                            </Space>
                            <Badge 
                                count={quotations.length} 
                                style={{ 
                                    background: '#262626',
                                    fontWeight: 600
                                }} 
                            />
                        </Space>
                    </div>
                    
                    {/* Danh sách scroll */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: 16
                        }}
                    >
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                            {quotations.map((q) => (
                                <Card
                                    key={q.quotationId}
                                    hoverable
                                    onClick={() => setSelectedQuotation(q)}
                                    style={{
                                        borderRadius: 8,
                                        border: selectedQuotation?.quotationId === q.quotationId
                                            ? "2px solid #262626"
                                            : "1px solid #e8e8e8",
                                        background: selectedQuotation?.quotationId === q.quotationId
                                            ? "#fafafa"
                                            : "white",
                                        transition: "all 0.2s ease",
                                    }}
                                    bodyStyle={{ padding: 16 }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                                        <Row justify="space-between" align="middle">
                                            <Text strong style={{ fontSize: 16 }}>#{q.quotationId}</Text>
                                            <Tag 
                                                color={statusColors[q.status]}
                                                style={{ 
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                    padding: '2px 10px',
                                                    borderRadius: 4,
                                                    border: 'none'
                                                }}
                                            >
                                                {statusText[q.status] || q.status}
                                            </Tag>
                                        </Row>
                                        
                                        <Space size={4}>
                                            <UserOutlined style={{ color: '#8c8c8c' }} />
                                            <Text>{q.username}</Text>
                                        </Space>
                                        
                                        <Space size={4}>
                                            <PhoneOutlined style={{ color: '#8c8c8c' }} />
                                            <Text type="secondary">{q.phone}</Text>
                                        </Space>
                                        
                                        <Space size={4}>
                                            <CalendarOutlined style={{ color: '#8c8c8c' }} />
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {dayjs(q.createdAt).format("DD/MM/YYYY")}
                                            </Text>
                                        </Space>
                                        
                                        <Divider style={{ margin: '8px 0' }} />
                                        
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <Text type="secondary">Tổng giá trị:</Text>
                                            <Text strong style={{ fontSize: 16, color: '#262626' }}>
                                                {q.totalPrice?.toLocaleString() || 0} đ
                                            </Text>
                                        </div>
                                    </Space>
                                </Card>
                            ))}
                            {quotations.length === 0 && (
                                <Card 
                                    style={{ 
                                        textAlign: 'center', 
                                        border: '1px dashed #d9d9d9',
                                        background: '#fafafa'
                                    }}
                                    bodyStyle={{ padding: 40 }}
                                >
                                    <FileTextOutlined style={{ fontSize: 40, color: '#bfbfbf', marginBottom: 16 }} />
                                    <Text type="secondary" style={{ display: 'block' }}>
                                        Không có báo giá nào
                                    </Text>
                                </Card>
                            )}
                        </Space>
                    </div>
                </Card>
            </Col>

            {/* Cột phải: chi tiết báo giá */}
            <Col xs={24} lg={14} style={{ height: '100%' }}>
                {renderQuotationDetails(selectedQuotation)}
            </Col>
        </Row>
    );
};