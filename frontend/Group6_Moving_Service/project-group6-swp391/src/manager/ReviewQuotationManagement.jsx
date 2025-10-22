import React, { useEffect, useState } from "react";
import { Table, Button, Tag, message, Space, Descriptions, Popconfirm } from "antd";
import axiosInstance from "../service/axiosInstance";
import dayjs from "dayjs";

// Hàm hỗ trợ format tiền tệ
const formatCurrency = (amount) => {
    return (amount?.toLocaleString() || 0) + ' ₫';
};

// --- Component hiển thị chi tiết hàng mở rộng ---
const ExpandedRowRender = (record) => (
  <Descriptions bordered size="small" column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }} style={{ margin: '10px 0' }}>
    <Descriptions.Item label="Địa chỉ đi">
      {record.addressFrom}
    </Descriptions.Item>
    <Descriptions.Item label="Địa chỉ đến">
      {record.addressTo}
    </Descriptions.Item>
    <Descriptions.Item label="Tên người dùng">
      <span style={{ fontWeight: 600 }}>{record.username}</span>
    </Descriptions.Item>
    <Descriptions.Item label="Công ty">
      {record.companyName || "Cá nhân"}
    </Descriptions.Item>
    <Descriptions.Item label="Số điện thoại">
      {record.phone}
    </Descriptions.Item>
    
    {/* PHẦN ĐÃ SỬA: Hiển thị chi tiết Dịch vụ theo DTO mới */}
    <Descriptions.Item label="Các Dịch vụ" span={3}>
      <Space wrap direction="vertical" style={{ width: '100%' }}>
        {record.services?.map((service, index) => (
          <Tag color="green" key={index} style={{ padding: '4px 8px', fontSize: '13px' }}>
            <span style={{ fontWeight: 600 }}>
                {service.serviceName}
            </span>
            &nbsp;({service.quantity} x {service.priceType}) 
            &nbsp;—&nbsp; **Thành tiền:** {formatCurrency(service.amount)}
          </Tag>
        ))}
      </Space>
    </Descriptions.Item>
    {/* KẾT THÚC PHẦN SỬA */}

  </Descriptions>
);

const ReviewQuotationManagement = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      // Chỉ fetch các báo giá có status là 'REVIEW'
      const res = await axiosInstance.get("/manager/quotations/review"); 
      setQuotations(res.data || []);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách báo giá REVIEW!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const approveQuotation = async (quotationId) => {
    try {
      await axiosInstance.put(`/manager/quotations/${quotationId}/approve`);
      message.success(`Quotation #${quotationId} đã được chuyển sang PENDING!`);
      fetchQuotations(); // Tải lại danh sách
    } catch (err) {
      console.error(err);
      message.error("Không thể đồng ý quotation. Vui lòng thử lại.");
    }
  };

  const rejectQuotation = async (quotationId) => {
    try {
      await axiosInstance.put(`/manager/quotations/${quotationId}/reject`);
      message.success(`Quotation #${quotationId} đã bị từ chối!`);
      fetchQuotations(); // Tải 
      message.info(`Logic Từ chối cho #${quotationId} cần được implement.`);
    } catch (err) {
      console.error(err);
      message.error("Không thể từ chối quotation. Vui lòng thử lại.");
    }
  };

  const columns = [
    {
      title: "Mã báo giá",
      dataIndex: "quotationId",
      key: "id",
      width: 120,
      render: (text) => <span style={{ fontWeight: 600, color: '#1890ff' }}>#{text}</span>,
    },
    {
      title: "Tổng giá",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 150,
      render: (price) => (
        <span style={{ fontWeight: 'bold', color: '#fa8c16' }}> 
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (date) => <Tag color="blue">{dayjs(date).format("DD/MM/YYYY")}</Tag>,
    },
    {
      title: "Ngày khảo sát",
      dataIndex: "surveyDate",
      key: "surveyDate",
      width: 140,
      render: (date) => <Tag color="purple">{dayjs(date).format("DD/MM/YYYY")}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === 'REVIEW' ? 'volcano' : 'geekblue'}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 250,
      fixed: 'right', 
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="Xác nhận duyệt báo giá?"
            description={`Bạn có chắc muốn chuyển báo giá #${record.quotationId} sang PENDING không?`}
            onConfirm={() => approveQuotation(record.quotationId)}
            okText="Đồng ý"
            cancelText="Hủy"
            disabled={record.status !== 'REVIEW'}
          >
            <Button
              type="primary"
              disabled={record.status !== 'REVIEW'} 
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Đồng ý → PENDING
            </Button>
          </Popconfirm>
          
          <Popconfirm
            title="Xác nhận từ chối báo giá?"
            description={`Bạn có chắc muốn từ chối báo giá #${record.quotationId} không?`}
            onConfirm={() => rejectQuotation(record.quotationId)}
            okText="Từ chối"
            cancelText="Hủy"
            disabled={record.status !== 'REVIEW'}
          >
            <Button
              danger 
              disabled={record.status !== 'REVIEW'} 
            >
              Từ chối
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <h2 style={{ marginBottom: 16, color: '#001529' }}>Quản lý Báo giá Cần Duyệt</h2>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={fetchQuotations} loading={loading} type="default">
              Làm mới dữ liệu
          </Button>
      </div>
      <Table
        columns={columns}
        dataSource={quotations}
        rowKey="quotationId"
        loading={loading}
        expandedRowRender={ExpandedRowRender} 
        scroll={{ x: 800 }}
      />
    </>
  );
};

export default ReviewQuotationManagement;