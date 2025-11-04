import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../service/axiosInstance';
import { Card, Table, Spin, Typography, Form, Input, InputNumber, Button, message } from 'antd';

const { Title, Paragraph } = Typography;

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const fetchServiceDetail = async () => {
    try {
      const res = await axiosInstance.get(`/prices/${id}`);
      setService(res.data);
    } catch (error) {
      console.error('Error fetching service detail', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetail();
  }, [id]);

  const handleAddPrice = async (values) => {
    try {
      await axiosInstance.post('/prices/add-price', {
        ...values,
        serviceId: id,
      });
      message.success('Thêm giá mới thành công!');
      form.resetFields();
      fetchServiceDetail(); // refresh lại danh sách giá
    } catch (error) {
      console.error('Error adding price:', error);
      message.error('Lỗi khi thêm giá');
    }
  };

  if (loading) return <Spin size="large" style={{ marginTop: 100 }} />;
  if (!service) return <p>Không tìm thấy dịch vụ.</p>;

  const columns = [
    { title: 'Loại giá', dataIndex: 'priceType', key: 'priceType' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Giá (VND)', dataIndex: 'amount', key: 'amount' },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Card
        cover={
          service.imageUrl ? (
            <img
              alt={service.serviceName}
              src={service.imageUrl}
              style={{ height: 300, objectFit: 'cover' }}
            />
          ) : null
        }
      >
        <Title level={2}>{service.serviceName}</Title>
        <Paragraph>{service.description}</Paragraph>

        <Table
          dataSource={service.prices}
          columns={columns}
          pagination={false}
          rowKey="priceId"
        />

        {/* --- FORM THÊM GIÁ --- */}
        <div style={{ marginTop: 24 }}>
          <Title level={4}>Thêm giá mới cho dịch vụ</Title>
          <Form form={form} layout="inline" onFinish={handleAddPrice}>
            <Form.Item
              name="priceType"
              rules={[{ required: true, message: 'Nhập loại giá!' }]}
            >
              <Input placeholder="Loại giá (VD: Xe tải nhỏ)" />
            </Form.Item>
            <Form.Item
              name="amount"
              rules={[{ required: true, message: 'Nhập giá tiền!' }]}
            >
              <InputNumber placeholder="Giá (VND)" min={0} />
            </Form.Item>
            <Form.Item name="unit">
              <Input placeholder="Đơn vị (VD: chuyến, km...)" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Thêm giá
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>

      <Link to="/manage-price">← Quay lại danh sách dịch vụ</Link>
    </div>
  );
};

export default ServiceDetail;
