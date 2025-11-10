import React, { useEffect, useState } from 'react';
import axiosInstance from '../../service/axiosInstance';
import { Card, Button, Modal, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const ServicePrice = () => {
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get("/prices"); // hoặc "/api/services"
      setServices(res.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  // ✅ Hàm thêm dịch vụ mới
  const handleAddService = async (values) => {
    try {
      setLoading(true);
      await axiosInstance.post("/prices", values); // backend cần có POST /prices
      message.success("Thêm dịch vụ thành công!");
      setOpen(false);
      form.resetFields();
      fetchServices(); // load lại danh sách
    } catch (error) {
      console.error("Error adding service:", error);
      message.error("Thêm dịch vụ thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Nút thêm dịch vụ */}
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          + Thêm dịch vụ
        </Button>
      </div>

      {/* Danh sách dịch vụ */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
        }}
      >
        {services.map((service) => (
          <Card
            key={service.serviceId}
            hoverable
            style={{ width: 300 }}
            cover={
              service.imageUrl ? (
                <img
                  alt={service.serviceName}
                  src={service.imageUrl}
                  style={{ height: 180, objectFit: 'cover' }}
                />
              ) : null
            }
            actions={[
              <Button
                type="link"
                onClick={() => navigate(`/services/${service.serviceId}`)}
              >
                Xem chi tiết
              </Button>,
            ]}
          >
            <Card.Meta
              title={service.serviceName}
              description={service.description?.slice(0, 80) + '...'}
            />
          </Card>
        ))}
      </div>

      {/* Modal thêm dịch vụ */}
      <Modal
        title="Thêm dịch vụ mới"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleAddService}
        >
          <Form.Item
            label="Tên dịch vụ"
            name="serviceName"
            rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
          >
            <Input placeholder="Nhập tên dịch vụ" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Nhập mô tả (tùy chọn)" />
          </Form.Item>

          <Form.Item label="Hình ảnh (URL)" name="imageUrl">
            <Input placeholder="Nhập đường dẫn ảnh (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServicePrice;
