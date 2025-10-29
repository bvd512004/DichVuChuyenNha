import React, { useEffect, useState } from "react";
import { Table, Button, Tag, message, Space, Card, Row, Col, Statistic, Popconfirm, Divider } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, DollarOutlined, FileTextOutlined, CalendarOutlined, UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, ShopOutlined } from '@ant-design/icons';
import axiosInstance from "../service/axiosInstance";
import dayjs from "dayjs";

// Hàm hỗ trợ format tiền tệ
const formatCurrency = (amount) => {
    return (amount?.toLocaleString() || 0) + ' ₫';
};

// --- Component hiển thị chi tiết hàng mở rộng với design mới ---
const ExpandedRowRender = (record) => (
  <div style={{ 
    padding: '24px', 
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    borderRadius: '12px',
    margin: '10px 0'
  }}>
    <Row gutter={[16, 16]}>
      {/* Thông tin địa chỉ */}
      <Col xs={24} md={12}>
        <Card 
          size="small" 
          style={{ 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            height: '100%'
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <EnvironmentOutlined style={{ color: '#52c41a', fontSize: '16px', marginRight: '8px' }} />
            <span style={{ fontWeight: 600, color: '#262626' }}>Địa chỉ đi</span>
          </div>
          <p style={{ color: '#595959', marginBottom: 0 }}>{record.addressFrom}</p>
        </Card>
      </Col>
      
      <Col xs={24} md={12}>
        <Card 
          size="small" 
          style={{ 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            height: '100%'
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <EnvironmentOutlined style={{ color: '#f5222d', fontSize: '16px', marginRight: '8px' }} />
            <span style={{ fontWeight: 600, color: '#262626' }}>Địa chỉ đến</span>
          </div>
          <p style={{ color: '#595959', marginBottom: 0 }}>{record.addressTo}</p>
        </Card>
      </Col>

      {/* Thông tin khách hàng */}
      <Col xs={24} md={12}>
        <Card 
          size="small" 
          style={{ 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            height: '100%'
          }}
        >
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <UserOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
              <span style={{ fontWeight: 600 }}>{record.username}</span>
            </div>
            <div>
              <PhoneOutlined style={{ color: '#722ed1', marginRight: '8px' }} />
              <span>{record.phone}</span>
            </div>
            <div>
              <ShopOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
              <span>{record.companyName || "Cá nhân"}</span>
            </div>
          </Space>
        </Card>
      </Col>

      {/* Thông tin nhân viên khảo sát */}
      <Col xs={24} md={12}>
        <Card 
          size="small" 
          style={{ 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            height: '100%'
          }}
        >
          <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
            👤 Nhân viên khảo sát
          </div>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div><strong>{record.employeeName || "Chưa có"}</strong></div>
            <div>📞 {record.employeePhone || "N/A"}</div>
            <div>✉️ {record.employeeEmail || "N/A"}</div>
          </Space>
        </Card>
      </Col>

      {/* Danh sách dịch vụ */}
      <Col xs={24}>
        <Card 
          size="small" 
          title={
            <span>
              <FileTextOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
              Các dịch vụ đã chọn
            </span>
          }
          style={{ 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <Space wrap size="small" style={{ width: '100%' }}>
            {record.services?.map((service, index) => (
              <Tag 
                color="green" 
                key={index} 
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '13px',
                  borderRadius: '6px',
                  border: '1px solid #95de64'
                }}
              >
                <span style={{ fontWeight: 600 }}>
                    {service.serviceName}
                </span>
                &nbsp;({service.quantity} x {service.priceType}) 
                <br />
                <span style={{ color: '#fa8c16', fontWeight: 600 }}>
                  💰 {formatCurrency(service.amount)}
                </span>
              </Tag>
            ))}
          </Space>
        </Card>
      </Col>
    </Row>
  </div>
);

const ReviewQuotationManagement = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
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
      fetchQuotations();
    } catch (err) {
      console.error(err);
      message.error("Không thể đồng ý quotation. Vui lòng thử lại.");
    }
  };

  const rejectQuotation = async (quotationId) => {
    try {
      await axiosInstance.put(`/manager/quotations/${quotationId}/reject`);
      message.success(`Quotation #${quotationId} đã bị từ chối!`);
      fetchQuotations();
    } catch (err) {
      console.error(err);
      message.error("Không thể từ chối quotation. Vui lòng thử lại.");
    }
  };

  // Tính toán thống kê
  const totalQuotations = quotations.length;
  const totalAmount = quotations.reduce((sum, q) => sum + (q.totalPrice || 0), 0);

  const columns = [
    {
      title: "Mã báo giá",
      dataIndex: "quotationId",
      key: "id",
      width: 120,
      render: (text) => (
        <Tag color="blue" style={{ 
          fontSize: '14px', 
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '6px'
        }}>
          #{text}
        </Tag>
      ),
    },
    {
      title: "Tổng giá",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 150,
      render: (price) => (
        <div style={{ 
          fontWeight: 'bold', 
          color: '#fa8c16',
          fontSize: '15px'
        }}> 
          💰 {formatCurrency(price)}
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (date) => (
        <Tag color="cyan" icon={<CalendarOutlined />} style={{ borderRadius: '6px' }}>
          {dayjs(date).format("DD/MM/YYYY")}
        </Tag>
      ),
    },
    {
      title: "Ngày khảo sát",
      dataIndex: "surveyDate",
      key: "surveyDate",
      width: 140,
      render: (date) => (
        <Tag color="purple" icon={<CalendarOutlined />} style={{ borderRadius: '6px' }}>
          {dayjs(date).format("DD/MM/YYYY")}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag 
          color={status === 'REVIEW' ? 'volcano' : 'geekblue'}
          style={{ 
            fontSize: '13px',
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: '6px'
          }}
        >
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
          >
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(102, 126, 234, 0.4)'
              }}
            >
              Duyệt
            </Button>
          </Popconfirm>
          
          <Popconfirm
            title="Xác nhận từ chối báo giá?"
            description={`Bạn có chắc muốn từ chối báo giá #${record.quotationId} không?`}
            onConfirm={() => rejectQuotation(record.quotationId)}
            okText="Từ chối"
            cancelText="Hủy"
        
          >
            <Button
              danger 
              icon={<CloseCircleOutlined />}
              style={{ borderRadius: '6px' }}
            >
              Từ chối
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: '24px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header với gradient */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '32px',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: '#fff',
          fontSize: '28px',
          fontWeight: 700
        }}>
          📋 Quản lý Báo giá Cần Duyệt
        </h2>
        <p style={{ 
          margin: '8px 0 0 0', 
          color: 'rgba(255,255,255,0.9)',
          fontSize: '15px'
        }}>
          Xem xét và phê duyệt các báo giá đang chờ xử lý
        </p>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #fa8c16 0%, #fa541c 100%)',
              border: 'none'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng số báo giá</span>}
              value={totalQuotations}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fff', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              border: 'none'
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng giá trị</span>}
              value={totalAmount}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: '#fff', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              border: 'none'
            }}
          >
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Button 
                onClick={fetchQuotations} 
                loading={loading} 
                type="primary"
                size="large"
                icon={<ReloadOutlined />}
                style={{
                  background: '#fff',
                  color: '#1890ff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  width: '100%'
                }}
              >
                Làm mới dữ liệu
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bảng dữ liệu */}
      <Card 
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={quotations}
          rowKey="quotationId"
          loading={loading}
          expandedRowRender={ExpandedRowRender} 
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} báo giá`
          }}
          style={{
            background: '#fff'
          }}
        />
      </Card>
    </div>
  );
};

export default ReviewQuotationManagement;