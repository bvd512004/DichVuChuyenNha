import React, { useState } from "react";
import { Layout, Row, Col, Typography, Card, Form, Input, Button, message, Space } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SendOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./style/ContactPage.css";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const ContactPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // TODO: Gửi dữ liệu đến API khi backend sẵn sàng
      console.log("Form values:", values);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      message.success("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
      form.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <PhoneOutlined />,
      title: "Điện Thoại",
      content: "0123456789",
      description: "Hotline hỗ trợ 24/7",
    },
    {
      icon: <MailOutlined />,
      title: "Email",
      content: "info@promove.com",
      description: "Gửi email cho chúng tôi",
    },
    {
      icon: <EnvironmentOutlined />,
      title: "Địa Chỉ",
      content: "Km29 Đại lộ Thăng Long,Hà Nội",
      description: "Văn phòng trụ sở chính",
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Giờ Làm Việc",
      content: "Thứ 2 - Chủ Nhật: 8:00 - 20:00",
      description: "Hỗ trợ khách hàng",
    },
  ];

  const workingHours = [
    { day: "Thứ 2 - Thứ 6", time: "8:00 - 18:00" },
    { day: "Thứ 7", time: "8:00 - 17:00" },
    { day: "Chủ Nhật", time: "8:00 - 12:00" },
  ];

  return (
    <Layout className="contact-page">
      <Content>
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="container">
            <Row justify="center" align="middle">
              <Col xs={24} md={20} lg={16}>
                <div className="hero-content">
                  <Title level={1} className="hero-title">
                    Liên Hệ Với Chúng Tôi
                  </Title>
                  <Paragraph className="hero-subtitle">
                    Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="contact-info-section">
          <div className="container">
            <Row gutter={[24, 24]}>
              {contactInfo.map((info, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card className="contact-info-card" hoverable>
                    <div className="contact-info-icon">{info.icon}</div>
                    <Title level={4} className="contact-info-title">
                      {info.title}
                    </Title>
                    <Paragraph className="contact-info-content">
                      {info.content}
                    </Paragraph>
                    <Text className="contact-info-description">
                      {info.description}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="contact-main-section">
          <div className="container">
            <Row gutter={[48, 48]} align="top">
              {/* Contact Form */}
              <Col xs={24} lg={14}>
                <Card className="contact-form-card">
                  <div className="form-header">
                    <MessageOutlined className="form-icon" />
                    <Title level={2} className="form-title">
                      Gửi Tin Nhắn
                    </Title>
                    <Paragraph className="form-description">
                      Điền thông tin vào form bên dưới, chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.
                    </Paragraph>
                  </div>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="contact-form"
                    size="large"
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="name"
                          label="Họ và Tên"
                          rules={[
                            { required: true, message: "Vui lòng nhập họ và tên!" },
                            { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
                          ]}
                        >
                          <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập họ và tên"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="phone"
                          label="Số Điện Thoại"
                          rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại!" },
                            {
                              pattern: /^[0-9]{10,11}$/,
                              message: "Số điện thoại không hợp lệ!",
                            },
                          ]}
                        >
                          <Input
                            prefix={<PhoneOutlined />}
                            placeholder="Nhập số điện thoại"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="Nhập email của bạn"
                      />
                    </Form.Item>
                    <Form.Item
                      name="subject"
                      label="Chủ Đề"
                      rules={[{ required: true, message: "Vui lòng nhập chủ đề!" }]}
                    >
                      <Input placeholder="Nhập chủ đề tin nhắn" />
                    </Form.Item>
                    <Form.Item
                      name="message"
                      label="Nội Dung Tin Nhắn"
                      rules={[
                        { required: true, message: "Vui lòng nhập nội dung tin nhắn!" },
                        { min: 10, message: "Nội dung phải có ít nhất 10 ký tự!" },
                      ]}
                    >
                      <TextArea
                        rows={6}
                        placeholder="Nhập nội dung tin nhắn của bạn..."
                        showCount
                        maxLength={500}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={loading}
                        icon={<SendOutlined />}
                        className="submit-button"
                      >
                        Gửi Tin Nhắn
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              {/* Contact Details & Map */}
              <Col xs={24} lg={10}>
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                  {/* Office Hours */}
                  <Card className="contact-detail-card" title="Giờ Làm Việc">
                    <div className="working-hours">
                      {workingHours.map((schedule, index) => (
                        <div key={index} className="working-hour-item">
                          <Text strong className="working-hour-day">
                            {schedule.day}
                          </Text>
                          <Text className="working-hour-time">{schedule.time}</Text>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Location */}
                  <Card className="contact-detail-card" title="Vị Trí">
                    <div className="location-info">
                      <EnvironmentOutlined className="location-icon" />
                      <Paragraph className="location-address">
                        Km29, Đại lộ Thăng Long,Khu công nghệ cao Hòa Lạc, Hà Nội
                      </Paragraph>
                    </div>
                    <div className="map-container">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3370.4842543150567!2d105.52528919999999!3d21.012416699999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abc60e7d3f19%3A0x2be9d7d0b5abcbf4!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgSMOgIE7hu5lp!5e1!3m2!1svi!2s!4v1762952219108!5m2!1svi!2s"
                        width="100%"
                        height="250"
                        style={{ border: 0, borderRadius: "8px" }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Vị trí văn phòng"
                      />
                    </div>
                  </Card>

                  {/* Social Media */}
                  <Card className="contact-detail-card" title="Mạng Xã Hội">
                    <div className="social-media">
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link facebook"
                      >
                        <FacebookOutlined />
                        <span>Facebook</span>
                      </a>
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link instagram"
                      >
                        <InstagramOutlined />
                        <span>Instagram</span>
                      </a>
                      <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link youtube"
                      >
                        <YoutubeOutlined />
                        <span>YouTube</span>
                      </a>
                    </div>
                  </Card>
                </Space>
              </Col>
            </Row>
          </div>
        </section>

        {/* CTA Section */}
        <section className="contact-cta">
          <div className="container">
            <Row justify="center">
              <Col xs={24} md={20} lg={16}>
                <div className="cta-content">
                  <Title level={2} className="cta-title">
                    Cần Hỗ Trợ Ngay?
                  </Title>
                  <Paragraph className="cta-description">
                    Gọi ngay cho chúng tôi để được tư vấn miễn phí và nhận báo giá nhanh chóng
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    href="tel:0123456789"
                    className="cta-button"
                  >
                    <PhoneOutlined /> Gọi Ngay: 0123456789
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default ContactPage;

