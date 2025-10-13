import React, { useEffect, useState } from "react";
import { Table, Card, Spin, message, Row, Col, Image } from "antd";
import axios from "axios";

const PriceTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/prices")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        message.error("Không thể tải dữ liệu bảng giá");
        setLoading(false);
      });
  }, []);

  if (loading) return <Spin style={{ marginTop: "100px" }} />;

  return (
    <div style={{ padding: "40px", background: "#fafafa", minHeight: "100vh" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "40px",
          color: "#8B0000",
        }}
      >
        💰 BẢNG GIÁ DỊCH VỤ
      </h2>

      <Row gutter={[24, 24]}>
        {data.map((service, index) => {
          const isLast = index === data.length - 1; // ✅ kiểm tra dịch vụ cuối

          return (
            <Col key={service.serviceId} xs={24} md={12} lg={8}>
              <Card
                hoverable
                cover={
                  service.imageUrl ? (
                    <Image
                      alt={service.serviceName}
                      src={service.imageUrl}
                      style={{
                        height: 200,
                        objectFit: "cover",
                        borderBottom: "1px solid #eee",
                      }}
                      preview={false}
                      fallback="https://via.placeholder.com/400x200?text=No+Image"
                    />
                  ) : (
                    <div
                      style={{
                        height: 200,
                        background: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#aaa",
                      }}
                    >
                      Không có hình ảnh
                    </div>
                  )
                }
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <h3 style={{ color: "#8B0000" }}>{service.serviceName}</h3>
                <p style={{ color: "#555", minHeight: "50px" }}>
                  {service.description}
                </p>

                {/* ✅ Nếu là dịch vụ cuối cùng → hiển thị Coming Soon */}
                {isLast ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "#999",
                      fontStyle: "italic",
                      fontSize: "16px",
                    }}
                  >
                    🚧 Coming Soon 🚧
                  </div>
                ) : (
                  <Table
                    bordered
                    pagination={false}
                    dataSource={service.prices}
                    rowKey="priceId"
                    size="small"
                    columns={[
                      {
                        title: "Loại giá",
                        dataIndex: "priceType",
                        key: "priceType",
                        align: "center",
                      },
                      {
                        title: "Đơn giá",
                        dataIndex: "amount",
                        key: "amount",
                        align: "right",
                        render: (amount) =>
                          amount?.toLocaleString("vi-VN") + " ₫",
                      },
                    ]}
                  />
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default PriceTable;
