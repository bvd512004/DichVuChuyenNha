import React, { useEffect, useState } from "react";
// Đã thêm Spin vào import
import { Modal, Select, InputNumber, Button, Row, Col, Card, message, Spin, Typography, Space } from "antd"; 
import { CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'; 
import axiosInstance from "../service/axiosInstance";

const { Text } = Typography;

const AddServiceModal = ({ open, quotation, onClose, onSuccess }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [quantity, setQuantity] = useState(1);
    
    // Reset state khi đóng/mở
    useEffect(() => {
        if (open) {
            fetchServices();
            setSelectedService(null);
            setSelectedPrice(null);
            setQuantity(1);
        }
    }, [open]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/prices");
            setServices(res.data); 
        } catch (err) {
            console.error(err);
            message.error("Lỗi tải danh sách dịch vụ!");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!selectedService || !selectedPrice || !quantity) {
            message.warning("Vui lòng chọn đầy đủ Dịch vụ, Loại giá và Số lượng!");
            return;
        }

        try {
            await axiosInstance.post("/quotation-services", {
                quotationId: quotation.quotationId,
                serviceId: selectedService.serviceId,
                priceId: selectedPrice.priceId,
                quantity,
            });

            message.success("Thêm dịch vụ thành công! Báo giá sẽ được cập nhật.");
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            message.error("Không thể thêm dịch vụ! Vui lòng thử lại.");
        }
    };

    // Style cho Card Dịch vụ tương tác
    const getCardStyle = (s) => ({
        borderRadius: 12,
        boxShadow: selectedService?.serviceId === s.serviceId 
            ? "0 0 15px rgba(139, 0, 0, 0.4)" 
            : "0 4px 10px rgba(0, 0, 0, 0.05)",
        border: selectedService?.serviceId === s.serviceId 
            ? "2px solid #8B0000" 
            : "1px solid #f0f0f0",
        transition: "all 0.3s ease-in-out", 
        cursor: 'pointer',
        transform: selectedService?.serviceId === s.serviceId ? 'scale(1.02)' : 'scale(1)',
    });
    
    // Tính toán tổng tiền tạm thời
    const tempTotal = selectedPrice ? selectedPrice.amount * quantity : 0;

    return (
        <Modal
            open={open}
            title={
                <Space>
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Thêm Dịch vụ cho Báo giá #{quotation?.quotationId}</Text>
                </Space>
            }
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>
                    Hủy
                </Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    onClick={handleAdd}
                    disabled={!selectedService || !selectedPrice || quantity < 1}
                    style={{ borderRadius: 6, transition: 'all 0.3s' }}
                >
                    Thêm Dịch vụ ({tempTotal.toLocaleString()} ₫)
                </Button>,
            ]}
            width={850} 
        >
            <Spin spinning={loading}>
                <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 10 }}>
                    <Row gutter={[24, 24]}> 
                        {/* Sửa lỗi cú pháp hiển thị message.info */}
                        {!loading && services.length === 0 ? (
                             <Col span={24} style={{ textAlign: 'center', padding: '20px' }}>
                                <Text type="secondary">Không có dịch vụ nào để hiển thị.</Text>
                            </Col>
                        ) : (
                            services.map((s) => (
                                <Col span={12} key={s.serviceId}>
                                    <Card
                                        hoverable
                                        cover={
                                            <img
                                                alt={s.serviceName}
                                                src={s.imageUrl || "placeholder-url"} 
                                                style={{
                                                    height: 180, 
                                                    objectFit: "cover",
                                                    borderRadius: "12px 12px 0 0", 
                                                }}
                                            />
                                        }
                                        onClick={() => {
                                            if(selectedService?.serviceId !== s.serviceId) {
                                                setSelectedPrice(null);
                                                setQuantity(1);
                                            }
                                            setSelectedService(s);
                                        }}
                                        style={getCardStyle(s)}
                                        bodyStyle={{ padding: 16 }}
                                    >
                                        <Text strong style={{ fontSize: '1.1em' }}>{s.serviceName}</Text>
                                        <p style={{ color: '#999', margin: '4px 0 12px' }}>{s.description || "Chưa có mô tả."}</p>

                                        {selectedService?.serviceId === s.serviceId && (
                                            <Card size="small" style={{ border: '1px dashed #ccc', backgroundColor: '#fafafa' }}>
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    {/* Select Loại giá */}
                                                    <Select
                                                        style={{ width: "100%" }}
                                                        placeholder="Chọn loại giá"
                                                        value={selectedPrice?.priceId}
                                                        onChange={(value) => {
                                                            const price = s.prices.find((p) => p.priceId === value);
                                                            setSelectedPrice(price);
                                                        }}
                                                    >
                                                        {/* Kiểm tra s.prices trước khi map */}
                                                        {s.prices && s.prices.map((p) => (
                                                            <Select.Option key={p.priceId} value={p.priceId}>
                                                                {p.priceType} - {p.amount.toLocaleString()}₫
                                                            </Select.Option>
                                                        ))}
                                                    </Select>

                                                    {/* Input Số lượng */}
                                                    <InputNumber
                                                        min={1}
                                                        value={quantity}
                                                        onChange={(value) => setQuantity(value || 1)}
                                                        style={{ width: "100%" }}
                                                        addonBefore="Số lượng"
                                                    />

                                                    {/* Hiển thị Tổng tạm thời */}
                                                    {selectedPrice && (
                                                        <Text type="success" style={{ fontWeight: 'bold' }}>
                                                            <CheckCircleOutlined /> Tổng tạm: {(selectedPrice.amount * quantity).toLocaleString()} ₫
                                                        </Text>
                                                    )}
                                                </Space>
                                            </Card>
                                        )}
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </div>
            </Spin>
        </Modal>
    );
};

export default AddServiceModal;