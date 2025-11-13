import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Space, message, Spin, Card, Button } from "antd";
import axiosInstance from "../service/axiosInstance";

const { Title } = Typography;

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/payments");
      setPayments(response.data);
    } catch (error) {
      message.error("Không thể tải danh sách thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

 const handleExportInvoice = async (record) => {
  if (!record.contractId || !record.paymentId) {
    message.error("Hợp đồng hoặc thanh toán không hợp lệ, không thể xuất hóa đơn!");
    return;
  }

  const payload = {
    contractId: Number(record.contractId),
    paymentId: Number(record.paymentId),
  };

  try {
    const response = await axiosInstance.post("/invoices/create", payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Response:", response.data);

    // ✅ Lấy message từ backend (ApiResponse)
    if (response.data?.code === 1000) {
      message.success(response.data.message || "Xuất hóa đơn thành công!");
    } else {
      message.error(response.data?.message || "Xuất hóa đơn thất bại!");
    }
  } catch (error) {
    console.error("Lỗi xuất hóa đơn:", error.response || error);
    const backendMsg = error.response?.data?.message;
    message.error(backendMsg || "Xuất hóa đơn thất bại!");
  }
};



  const columns = [
    {
      title: "Mã thanh toán",
      dataIndex: "paymentId",
      key: "paymentId",
    },
    {
      title: "Mã hợp đồng",
      dataIndex: "contractId",
      key: "contractId",
    },
    {
      title: "Khách hàng",
      key: "username",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <b>{record.username}</b>
          <div>{record.email}</div>
          <div>{record.phone}</div>
        </Space>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${amount?.toLocaleString("vi-VN")} VNĐ`,
    },
    {
      title: "Phương thức",
      dataIndex: "method",
      key: "method",
    },
    {
      title: "Loại thanh toán",
      dataIndex: "paymentType",
      key: "paymentType",
      render: (type) => (
        <Tag color={type === "DEPOSIT" ? "blue" : "purple"}>{type}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "PAID"
            ? "green"
            : status === "PENDING"
            ? "gold"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Hạn thanh toán",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "—",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleExportInvoice(record)}>
          Xuất hóa đơn
        </Button>
      ),
    },
  ];

  return (
    <Card style={{ margin: 24, borderRadius: 16, boxShadow: "0 2px 10px #ddd" }}>
      <Title level={3} style={{ marginBottom: 16 }}>
        Danh sách thanh toán
      </Title>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={payments}
          columns={columns}
          rowKey="paymentId"
          pagination={{ pageSize: 8 }}
        />
      )}
    </Card>
  );
};

export default PaymentList;
