import React from "react";
import { Select, Button, Spin, Card, Row, Col, InputNumber, message, Descriptions } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

export const QuotationDetail = ({
  record,
  serviceList,
  loadingServices,
  quotationServiceForm,
  quotationServicesList,
  onServiceChange,
  onCreateService,
  onQuantityChange,
}) => {
  const qid = record.quotationId;
  const data = quotationServiceForm[qid] || {};
  const selectedService = serviceList.find((s) => s.serviceId === Number(data.serviceId));
  const prices = selectedService?.prices || [];
  const added = quotationServicesList[qid] || [];
  const quantity = data.quantity || 1;

  const handleAddService = async () => {
    if (!data.serviceId || !data.priceId || quantity < 1) {
      message.warning("Vui lòng chọn dịch vụ, giá và số lượng hợp lệ!");
      return;
    }

    try {
      await onCreateService(qid);
      onServiceChange(qid, "serviceId", undefined);
      onServiceChange(qid, "priceId", undefined);
      onServiceChange(qid, "quantity", 1);
      message.success("Thêm hoặc cập nhật dịch vụ thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm dịch vụ:", error);
      message.error("Thêm dịch vụ thất bại!");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Thông tin Khách hàng và Báo giá */}
      <Descriptions title="Thông tin chung" bordered column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label="Khách hàng"><strong>{record.username || "N/A"}</strong></Descriptions.Item>
        <Descriptions.Item label="SĐT">{record.phoneNumber || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Email">{record.email || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Ngày chuyển">{record.moveDate ? dayjs(record.moveDate).format("DD/MM/YYYY") : "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ đi">{record.addressFrom || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ đến">{record.addressTo || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Loại nhà">{record.houseType || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Hiệu lực đến">{record.validUntil ? dayjs(record.validUntil).format("DD/MM/YYYY") : "N/A"}</Descriptions.Item>
      </Descriptions>

      {/* Chi tiết Dịch vụ đã thêm */}
      <h3 style={{ marginTop: 24, borderBottom: '1px solid #eee', paddingBottom: 8 }}>Chi tiết Dịch vụ</h3>
      {added.length > 0 ? (
        <div style={{ marginBottom: 20 }}>
          {added.map((s, idx) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                background: "white",
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={s.service?.imageUrl}
                  alt={s.service?.serviceName || "N/A"}
                  style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
                />
                <div>
                  <strong>{s.service?.serviceName || "N/A"}</strong>
                  <span style={{ color: "#666", marginLeft: 8 }}>
                    ({s.price?.priceType}) - {s.price?.amount?.toLocaleString()} VNĐ × {s.quantity}
                  </span>
                </div>
              </div>
              <div>
                <Button
                  size="small"
                  onClick={() => onQuantityChange(qid, idx, -1)}
                  disabled={s.quantity <= 1}
                >
                  −
                </Button>
                <span style={{ margin: "0 8px" }}>{s.quantity}</span>
                <Button size="small" onClick={() => onQuantityChange(qid, idx, 1)}>
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#999", fontStyle: "italic" }}>Chưa có dịch vụ nào được thêm.</p>
      )}

      {/* Tổng cộng */}
      <div style={{ 
          marginTop: 20, 
          padding: '10px 15px', 
          backgroundColor: '#e6f7ff', 
          border: '1px solid #91d5ff',
          borderRadius: 6,
          textAlign: 'right'
      }}>
        <strong>Tổng cộng:</strong> <span style={{ fontSize: 20, color: '#1890ff', marginLeft: 10 }}>{record.totalPrice?.toLocaleString() || "0"} VNĐ</span>
      </div>

      {/* Khu vực Thêm dịch vụ mới */}
      <h3 style={{ marginTop: 24, borderBottom: '1px solid #eee', paddingBottom: 8 }}>Thêm Dịch vụ mới</h3>
      {loadingServices ? (
        <Spin tip="Đang tải dịch vụ..." />
      ) : (
        <Row gutter={[16, 16]}>
          {(serviceList || [])
            .filter((s) => s && s.serviceName)
            .map((service, index, arr) => {
              const isComingSoon = service.prices?.length === 0; // Giả định không có giá là Coming Soon
              return (
                <Col span={8} key={service.serviceId}>
                  <Card
                    hoverable={!isComingSoon}
                    cover={
                      <div style={{ position: "relative" }}>
                        <img
                          alt={service.serviceName}
                          src={isComingSoon ? "https://i.pinimg.com/736x/b4/17/db/b417db405339afa64154b829e49824cb.jpg" : service.imageUrl || `https://source.unsplash.com/150x150/?${encodeURIComponent(service.serviceName)}`}
                          style={{
                            height: 150,
                            width: "100%",
                            objectFit: "cover",
                            filter: isComingSoon ? "grayscale(40%) brightness(0.8)" : "none",
                          }}
                        />
                        {isComingSoon && (
                          <div
                            style={{
                              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                              backgroundColor: "rgba(0,0,0,0.4)", color: "white",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: "bold", fontSize: 18, borderRadius: 4,
                            }}
                          >
                            🚧 Coming Soon
                          </div>
                        )}
                      </div>
                    }
                    onClick={() => {
                      if (isComingSoon) return;
                      onServiceChange(qid, "serviceId", service.serviceId);
                      onServiceChange(qid, "priceId", service.prices?.[0]?.priceId || null);
                    }}
                    style={{
                      border:
                        data.serviceId === service.serviceId
                          ? "2px solid #1890ff"
                          : "1px solid #d9d9d9",
                      opacity: isComingSoon ? 0.6 : 1,
                      pointerEvents: isComingSoon ? "none" : "auto",
                    }}
                  >
                    <Card.Meta
                      title={service.serviceName}
                      description={isComingSoon ? "Sắp ra mắt..." : `Giá từ: ${service.prices?.[0]?.amount?.toLocaleString() || "N/A"} VNĐ`}
                    />
                  </Card>
                </Col>
              );
            })}
        </Row>
      )}

      {/* Lựa chọn Giá và Số lượng */}
      {data.serviceId && (
        <div style={{ marginTop: 16, padding: '16px', border: '1px dashed #ccc', borderRadius: 6 }}>
          <Row gutter={16} align="bottom">
            <Col span={10}>
              <h5>Chọn giá:</h5>
              <Select
                value={data.priceId}
                onChange={(val) => onServiceChange(qid, "priceId", val)}
                style={{ width: '100%' }}
                placeholder="Chọn loại giá"
                allowClear
              >
                {prices.map((p) => (
                  <Option key={p.priceId} value={p.priceId}>
                    {p.priceType} - {p.amount?.toLocaleString()} VNĐ
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={5}>
              <h5>Số lượng:</h5>
              <InputNumber
                min={1}
                value={quantity}
                onChange={(val) => onServiceChange(qid, "quantity", val)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={9} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                onClick={handleAddService}
                disabled={!data.serviceId || !data.priceId || quantity < 1}
                block
              >
                Thêm Dịch vụ
              </Button>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};