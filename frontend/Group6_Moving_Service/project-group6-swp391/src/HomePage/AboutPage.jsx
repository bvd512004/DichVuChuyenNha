import React from "react";
import { Layout, Row, Col, Typography, Card, Space, Statistic, Timeline, Tag } from "antd";
import {
  TeamOutlined,
  SafetyOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./style/AboutPage.css";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const AboutPage = () => {
  const navigate = useNavigate();
  
  const values = [
    {
      icon: <SafetyOutlined />,
      title: "An Toàn",
      description: "Đảm bảo tài sản của khách hàng được bảo vệ tuyệt đối trong suốt quá trình vận chuyển",
    },
    {
      icon: <ClockCircleOutlined />,
      title: "Nhanh Chóng",
      description: "Quy trình chuyên nghiệp, tiết kiệm thời gian và đáp ứng đúng hẹn",
    },
    {
      icon: <HeartOutlined />,
      title: "Tận Tâm",
      description: "Phục vụ khách hàng với tinh thần trách nhiệm cao và sự chu đáo",
    },
    {
      icon: <TrophyOutlined />,
      title: "Chuyên Nghiệp",
      description: "Đội ngũ được đào tạo bài bản, phương tiện hiện đại, quy trình khoa học",
    },
  ];

  const achievements = [
    { year: "2025", title: "Thành Lập", description: "ProMove Commercial được thành lập với sứ mệnh mang đến dịch vụ chuyển nhà chuyên nghiệp" },
    { year: "2025", title: "1000+ Khách Hàng", description: "Đạt mốc phục vụ hơn 1000 khách hàng hài lòng" },
    { year: "2025", title: "Mở Rộng Dịch Vụ", description: "Mở rộng dịch vụ sang chuyển văn phòng và kho xưởng" },
    { year: "2025", title: "5000+ Dự Án", description: "Hoàn thành hơn 5000 dự án thành công" },
    { year: "2025", title: "Công Nghệ Số", description: "Ứng dụng công nghệ số để nâng cao trải nghiệm khách hàng" },
  ];

  const stats = [
    { title: "Khách Hàng", value: "10,000+", suffix: "+" },
    { title: "Dự Án", value: "15,000+", suffix: "+" },
    { title: "Nhân Viên", value: "200+", suffix: "+" },
    { title: "Xe Tải", value: "50+", suffix: "+" },
  ];

  return (
    <Layout className="about-page">
      <Content>
        {/* Hero Section */}
        <section className="about-hero">
          <div className="container">
            <Row justify="center" align="middle">
              <Col xs={24} md={20} lg={16}>
                <div className="hero-content">
                  <Title level={1} className="hero-title">
                    Về ProMove Commercial
                  </Title>
                  <Paragraph className="hero-subtitle">
                    Đồng hành cùng bạn trong mọi bước chuyển nhà
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="about-intro">
          <div className="container">
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={12}>
                <div className="intro-content">
                  <Title level={2} className="section-title">
                    Chúng Tôi Là Ai?
                  </Title>
                  <Paragraph className="intro-text">
                    <strong>ProMove Commercial</strong> là đơn vị cung cấp dịch vụ chuyển nhà, 
                    chuyển văn phòng và vận chuyển hàng hóa uy tín hàng đầu tại Việt Nam. 
                    Với nhiều năm kinh nghiệm trong ngành, chúng tôi tự hào mang đến cho 
                    khách hàng những trải nghiệm dịch vụ tốt nhất.
                  </Paragraph>
                  <Paragraph className="intro-text">
                    Đội ngũ nhân viên chuyên nghiệp, giàu kinh nghiệm cùng với hệ thống 
                    phương tiện vận chuyển hiện đại, được bảo trì thường xuyên, đảm bảo 
                    an toàn và hiệu quả cao trong mọi dự án.
                  </Paragraph>
                  <Paragraph className="intro-text">
                    Chúng tôi cam kết mang đến sự hài lòng tuyệt đối cho khách hàng thông 
                    qua chất lượng dịch vụ vượt trội, giá cả hợp lý và thái độ phục vụ tận tâm.
                  </Paragraph>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="intro-image">
                  <img
                    src="https://i.pinimg.com/1200x/4e/b2/16/4eb2160fa9cc7423dc2ffd61c1645a23.jpg"
                    alt="Về chúng tôi"
                    className="intro-img"
                  />
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="about-stats">
          <div className="container">
            <Row gutter={[32, 32]}>
              {stats.map((stat, index) => (
                <Col xs={12} sm={6} key={index}>
                  <Card className="stat-card" bordered={false}>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      suffix={stat.suffix}
                      valueStyle={{ color: "#fff", fontSize: "2.5rem", fontWeight: "bold" }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-values">
          <div className="container">
            <Row justify="center">
              <Col xs={24} md={20} lg={16}>
                <div className="section-header">
                  <Title level={2} className="section-title text-center">
                    Giá Trị Cốt Lõi
                  </Title>
                  <Paragraph className="section-description text-center">
                    Những giá trị định hướng hoạt động và phát triển của chúng tôi
                  </Paragraph>
                </div>
              </Col>
            </Row>
            <Row gutter={[24, 24]} style={{ marginTop: "48px" }}>
              {values.map((value, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card className="value-card" hoverable>
                    <div className="value-icon">{value.icon}</div>
                    <Title level={4} className="value-title">
                      {value.title}
                    </Title>
                    <Paragraph className="value-description">
                      {value.description}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="about-timeline">
          <div className="container">
            <Row justify="center">
              <Col xs={24} md={20} lg={16}>
                <div className="section-header">
                  <Title level={2} className="section-title text-center">
                    Hành Trình Phát Triển
                  </Title>
                  <Paragraph className="section-description text-center">
                    Những cột mốc quan trọng trong quá trình phát triển của chúng tôi
                  </Paragraph>
                </div>
              </Col>
            </Row>
            <Row justify="center" style={{ marginTop: "48px" }}>
              <Col xs={24} md={20} lg={16}>
                <Timeline
                  mode="alternate"
                  items={achievements.map((item, index) => ({
                    color: index % 2 === 0 ? "#1890ff" : "#52c41a",
                    children: (
                      <div className="timeline-item">
                        <Tag color={index % 2 === 0 ? "blue" : "green"} className="timeline-year">
                          {item.year}
                        </Tag>
                        <Title level={4} className="timeline-title">
                          {item.title}
                        </Title>
                        <Paragraph className="timeline-description">
                          {item.description}
                        </Paragraph>
                      </div>
                    ),
                  }))}
                />
              </Col>
            </Row>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-team">
          <div className="container">
            <Row justify="center">
              <Col xs={24} md={20} lg={16}>
                <div className="section-header">
                  <Title level={2} className="section-title text-center">
                    Đội Ngũ Chuyên Nghiệp
                  </Title>
                  <Paragraph className="section-description text-center">
                    Đội ngũ nhân viên giàu kinh nghiệm, được đào tạo bài bản và tận tâm với công việc
                  </Paragraph>
                </div>
              </Col>
            </Row>
            <Row gutter={[24, 24]} style={{ marginTop: "48px" }}>
              <Col xs={24} md={8}>
                <Card className="team-card" bordered={false}>
                  <TeamOutlined className="team-icon" />
                  <Title level={4}>Nhân Viên Vận Chuyển</Title>
                  <Paragraph>
                    Đội ngũ nhân viên vận chuyển được đào tạo chuyên nghiệp, có kỹ năng 
                    xử lý tình huống và đảm bảo an toàn cho tài sản khách hàng.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="team-card" bordered={false}>
                  <CustomerServiceOutlined className="team-icon" />
                  <Title level={4}>Tư Vấn Viên</Title>
                  <Paragraph>
                    Đội ngũ tư vấn viên chuyên nghiệp, nhiệt tình, luôn sẵn sàng hỗ trợ 
                    khách hàng 24/7 với thái độ phục vụ tận tâm.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="team-card" bordered={false}>
                  <CheckCircleOutlined className="team-icon" />
                  <Title level={4}>Quản Lý Chất Lượng</Title>
                  <Paragraph>
                    Đội ngũ quản lý chất lượng đảm bảo mọi dịch vụ được thực hiện đúng 
                    tiêu chuẩn và đáp ứng yêu cầu của khách hàng.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="about-commitment">
          <div className="container">
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={12}>
                <div className="commitment-image">
                  <img
                    src="https://i.pinimg.com/1200x/e1/96/05/e196055c4a1a6fe04ec438d57e747d30.jpg"
                    alt="Cam kết dịch vụ"
                    className="commitment-img"
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="commitment-content">
                  <Title level={2} className="section-title">
                    Cam Kết Dịch Vụ
                  </Title>
                  <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    <div className="commitment-item">
                      <CheckCircleOutlined className="commitment-icon" />
                      <div>
                        <Title level={5}>Bảo Hiểm Đầy Đủ</Title>
                        <Paragraph>
                          Tất cả tài sản được bảo hiểm đầy đủ trong suốt quá trình vận chuyển
                        </Paragraph>
                      </div>
                    </div>
                    <div className="commitment-item">
                      <CheckCircleOutlined className="commitment-icon" />
                      <div>
                        <Title level={5}>Giá Cả Minh Bạch</Title>
                        <Paragraph>
                          Báo giá rõ ràng, không phát sinh chi phí ẩn, cam kết đúng giá đã thỏa thuận
                        </Paragraph>
                      </div>
                    </div>
                    <div className="commitment-item">
                      <CheckCircleOutlined className="commitment-icon" />
                      <div>
                        <Title level={5}>Đúng Tiến Độ</Title>
                        <Paragraph>
                          Cam kết hoàn thành đúng thời gian đã hẹn, không làm chậm trễ dự án
                        </Paragraph>
                      </div>
                    </div>
                    <div className="commitment-item">
                      <CheckCircleOutlined className="commitment-icon" />
                      <div>
                        <Title level={5}>Hỗ Trợ 24/7</Title>
                        <Paragraph>
                          Đội ngũ hỗ trợ khách hàng hoạt động 24/7, sẵn sàng giải đáp mọi thắc mắc
                        </Paragraph>
                      </div>
                    </div>
                  </Space>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta">
          <div className="container">
            <Row justify="center">
              <Col xs={24} md={20} lg={16}>
                <div className="cta-content">
                  <StarOutlined className="cta-icon" />
                  <Title level={2} className="cta-title">
                    Sẵn Sàng Bắt Đầu Hành Trình Mới?
                  </Title>
                  <Paragraph className="cta-description">
                    Liên hệ ngay với chúng tôi để được tư vấn miễn phí và nhận báo giá 
                    cạnh tranh nhất cho dịch vụ chuyển nhà của bạn.
                  </Paragraph>
                  <Space size="large">
                    <a onClick={() => navigate("/contact")} className="cta-button primary" style={{ cursor: "pointer" }}>
                      Liên Hệ Ngay
                    </a>
                    <a onClick={() => navigate("/price-service")} className="cta-button secondary" style={{ cursor: "pointer" }}>
                      Xem Bảng Giá
                    </a>
                  </Space>
                </div>
              </Col>
            </Row>
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default AboutPage;

