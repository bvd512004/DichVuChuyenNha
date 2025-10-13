import React from "react";
import { Table, Select, Button, Spin, Card, Row, Col, InputNumber, message } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

export const QuotationList = ({
  quotations,
  serviceList,
  loadingServices,
  quotationServiceForm,
  quotationServicesList,
  onServiceChange,
  onCreateService,
  onQuantityChange,
}) => {
  const columns = [
    { title: "Mã báo giá", dataIndex: "quotationId", width: 120 },
    { title: "Mã khảo sát", dataIndex: "surveyId", width: 120 },
    { title: "Khách hàng", dataIndex: "username", width: 150 },
    { title: "Công ty", dataIndex: "companyName", width: 200 },
    { title: "Địa chỉ từ", dataIndex: "addressFrom", width: 200 },
    { title: "Địa chỉ đến", dataIndex: "addressTo", width: 200 },
    {
      title: "Tổng giá (VNĐ)",
      dataIndex: "totalPrice",
      render: (value) => value?.toLocaleString() || "0",
      width: 150,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY HH:mm") : "-"),
      width: 150,
    },
  ];

  const expandedRowRender = (record) => {
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
        // Call onCreateService, which handles create or update in parent
        await onCreateService(qid);

        // Reset form selections after add
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
      <div style={{ padding: 16, background: "#fafafa" }}>
        <h4 style={{ marginBottom: 16, color: "#1890ff" }}>Chi tiết báo giá</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          
          <div><strong>Địa chỉ từ:</strong> {record.addressFrom || "N/A"}</div>
          <div><strong>Địa chỉ đến:</strong> {record.addressTo || "N/A"}</div>
          <div><strong>Tổng giá:</strong> {record.totalPrice?.toLocaleString() || "0"} VNĐ</div>
        </div>

       
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
                    src={s.service?.imageUrl }
                    alt={s.service?.serviceName || "N/A"}
                    style={{ width: 40, height: 40, borderRadius: 4 }}
                  />
                  <div>
                    <strong>{s.service?.serviceName || "N/A"}</strong>
                    <span style={{ color: "#666", marginLeft: 8 }}>
                      ({s.price?.priceType}) - {s.price?.amount?.toLocaleString()} × {s.quantity}
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
          <p style={{ color: "#999", fontStyle: "italic" }}></p>
        )}

        <h5 style={{ marginBottom: 12 }}>Thêm dịch vụ mới:</h5>
        {loadingServices ? (
          <Spin tip="Đang tải dịch vụ..." />
        ) : (
          <Row gutter={[16, 16]}>
            {(serviceList || [])
              .filter((s) => s && s.serviceName)
              .map((service, index, arr) => {
                const isComingSoon = index === arr.length - 1; // ✅ dịch vụ cuối cùng
                return (
                  <Col span={8} key={service.serviceId}>
                    <Card
                      hoverable={!isComingSoon}
                      cover={
                        <div style={{ position: "relative" }}>
                          <img
                            alt={service.serviceName}
                            src={
                              isComingSoon
                                ? "https://i.pinimg.com/736x/b4/17/db/b417db405339afa64154b829e49824cb.jpg"
                                : service.imageUrl ||
                                  `https://source.unsplash.com/150x150/?${encodeURIComponent(
                                    service.serviceName
                                  )}`
                            }
                            style={{
                              height: 150,
                              width: "100%",
                              objectFit: "cover",
                              filter: isComingSoon
                                ? "grayscale(40%) brightness(0.8)"
                                : "none",
                            }}
                          />
                          {isComingSoon && (
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: "rgba(0,0,0,0.4)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: 18,
                                borderRadius: 4,
                              }}
                            >
                              🚧 Coming Soon
                            </div>
                          )}
                        </div>
                      }
                      onClick={() => {
                        if (isComingSoon) return; // ❌ không cho click
                        onServiceChange(qid, "serviceId", service.serviceId);
                        onServiceChange(
                          qid,
                          "priceId",
                          service.prices?.[0]?.priceId || null
                        );
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
                        description={
                          isComingSoon
                            ? "Sắp ra mắt..."
                            : `Giá từ: ${
                                service.prices?.[0]?.amount?.toLocaleString() ||
                                "N/A"
                              } VNĐ`
                        }
                      />
                    </Card>
                  </Col>
                );
              })}
          </Row>
        )}

        {/* Chọn giá + số lượng */}
        {data.serviceId && (
          <div style={{ marginTop: 16 }}>
            <h5>Chọn giá:</h5>
            <Select
              value={data.priceId}
              onChange={(val) => onServiceChange(qid, "priceId", val)}
              style={{ width: 300, marginBottom: 16 }}
              placeholder="Chọn loại giá"
            >
              {prices.map((p) => (
                <Option key={p.priceId} value={p.priceId}>
                  {p.priceType} - {p.amount?.toLocaleString()} VNĐ
                </Option>
              ))}
            </Select>

            <h5>Số lượng:</h5>
            <InputNumber
              min={1}
              value={quantity}
              onChange={(val) => onServiceChange(qid, "quantity", val)}
              style={{ width: 100, marginBottom: 16 }}
            />

            <Button
              type="primary"
              onClick={handleAddService}
              disabled={!data.serviceId || !data.priceId || quantity < 1}
            >
              Thêm dịch vụ
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Table
      dataSource={quotations}
      columns={columns}
      rowKey="quotationId"
      bordered
      expandable={{ expandedRowRender }}
      pagination={{ pageSize: 10 }}
    />
  );
};