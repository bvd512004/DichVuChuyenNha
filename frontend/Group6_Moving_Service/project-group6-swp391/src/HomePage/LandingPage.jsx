import React from "react";
import { Layout, Row, Col, Button, Card, Typography, Space } from "antd";
import { RightCircleOutlined, PhoneOutlined, MenuOutlined, RobotOutlined } from "@ant-design/icons";
// Thêm useNavigate để điều hướng
import { useNavigate } from "react-router-dom";

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const LandingPage = () => {
    const navigate = useNavigate(); // Khởi tạo hook điều hướng

    // Styles for Ant Design layout
    const heroStyle = {
        background: "linear-gradient(135deg, #000 60%, #333 100%)",
        color: "#fff",
        padding: "100px 0",
    };

    const sectionStyle = {
        padding: "80px 0",
    };

    const serviceCardStyle = {
        textAlign: "center",
        overflow: "hidden",
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    };
    
    // Hàm giả định cho Chatbot
    const handleChatbotClick = () => {
        // Thay thế bằng logic mở modal/component chatbot thực tế của bạn
        alert("Chatbot đang được phát triển. Vui lòng liên hệ Hotline!"); 
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Hero Section */}
            <Content>
                <div style={heroStyle}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <Row align="middle" gutter={[32, 32]}>
                            <Col xs={24} md={12}>
                                <Title
                                    level={1}
                                    style={{
                                        color: "#fff",
                                        fontSize: "3.5rem",
                                        fontWeight: "bold",
                                        lineHeight: "1.2",
                                        marginBottom: 20,
                                    }}
                                >
                                    Chào mừng đến với <br /> Moving Service
                                </Title>
                                <Paragraph style={{ fontSize: "1.25rem", color: '#ddd' }}>
                                    Giải pháp chuyển nhà toàn diện – An toàn, Nhanh chóng, Tiện lợi
                                </Paragraph>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => navigate("/customer-register")}
                                    style={{ 
                                        marginTop: "30px", 
                                        fontWeight: "600",
                                        height: 'auto',
                                        padding: '10px 20px',
                                        backgroundColor: '#fff',
                                        borderColor: '#fff',
                                        color: '#000',
                                    }}
                                    icon={<RightCircleOutlined />}
                                >
                                    Đăng kí ngay
                                </Button>
                            </Col>
                            <Col xs={24} md={12} style={{ textAlign: "center" }}>
                                <img
                                    src="https://i.pinimg.com/1200x/ae/38/9e/ae389eb16d8f0ed1d52775033a34a4c6.jpg"
                                    alt="Hero Moving Service"
                                    style={{ 
                                        maxHeight: "400px", 
                                        objectFit: "cover",
                                        width: '100%',
                                        borderRadius: '8px',
                                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* About Us Section */}
                <div id="about" style={{ ...sectionStyle, backgroundColor: "#fff" }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <Row align="middle" gutter={[32, 32]}>
                            <Col xs={24} md={12}>
                                <img
                                    src="https://i.pinimg.com/1200x/4e/b2/16/4eb2160fa9cc7423dc2ffd61c1645a23.jpg"
                                    alt="About us"
                                    style={{ 
                                        maxHeight: "400px", 
                                        objectFit: "cover",
                                        width: '100%',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <Title level={2} style={{ fontWeight: "bold" }}>
                                    Về Chúng Tôi
                                </Title>
                                <Paragraph style={{ fontSize: "1.1rem", marginTop: "20px" }}>
                                    Moving Service là đơn vị cung cấp dịch vụ chuyển nhà uy tín với
                                    nhiều năm kinh nghiệm. Chúng tôi cam kết mang đến trải nghiệm
                                    chuyển nhà **an toàn, nhanh chóng và tiết kiệm** cho khách hàng.
                                </Paragraph>
                                <Paragraph>
                                    Với đội ngũ nhân viên chuyên nghiệp, phương tiện vận chuyển hiện
                                    đại và quy trình làm việc khoa học, chúng tôi luôn sẵn sàng đáp
                                    ứng mọi nhu cầu chuyển nhà, văn phòng, kho xưởng của bạn.
                                </Paragraph>
                                <Button type="primary" size="large" onClick={() => navigate("/customer-register")}>
                                    <PhoneOutlined /> Liên hệ ngay
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* Services Section */}
                <div id="services" style={{ ...sectionStyle, backgroundColor: "#f8f9fa" }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <Title
                            level={2}
                            className="text-center"
                            style={{ fontWeight: "bold", marginBottom: 20 }}
                        >
                            Dịch Vụ Của Chúng Tôi
                        </Title>
                        
                        {/* START: NÚT ĐIỀU HƯỚNG MỚI */}
                        <div style={{ textAlign: "center", marginBottom: 50 }}>
                            <Space size="large">
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    icon={<MenuOutlined />} 
                                    onClick={() => navigate("/price-service")} // Điều hướng đến component PriceTable
                                >
                                    Xem ngay Bảng giá
                                </Button>
                                <Button 
                                    size="large" 
                                    icon={<RobotOutlined />}
                                    onClick={handleChatbotClick}
                                    style={{ 
                                        backgroundColor: '#000', 
                                        borderColor: '#000', 
                                        color: '#fff' 
                                    }}
                                >
                                    Tham khảo Chatbot
                                </Button>
                            </Space>
                        </div>
                        {/* END: NÚT ĐIỀU HƯỚNG MỚI */}

                        <Row gutter={[24, 24]}>
                            {[
                                {
                                    title: "Chuyển Nhà Trọn Gói",
                                    text: "Giúp bạn tiết kiệm thời gian và công sức với dịch vụ trọn gói từ A → Z.",
                                    img: "https://i.pinimg.com/1200x/e1/96/05/e196055c4a1a6fe04ec438d57e747d30.jpg",
                                },
                                {
                                    title: "Chuyển Văn Phòng",
                                    text: "Di dời văn phòng chuyên nghiệp, đảm bảo tiến độ và an toàn tài sản.",
                                    img: "https://i.pinimg.com/1200x/6b/8d/f0/6b8df0de92c4333d34a2463d2014fd7b.jpg",
                                },
                                {
                                    title: "Vận Chuyển Kho Xưởng",
                                    text: "Giải pháp vận chuyển hàng hóa, thiết bị kho xưởng quy mô lớn hiệu quả.",
                                    img: "https://i.pinimg.com/1200x/34/70/27/347027715d106014a35b6072340bb218.jpg",
                                },
                            ].map((service, idx) => (
                                <Col xs={24} md={8} key={idx}>
                                    <Card
                                        hoverable
                                        style={serviceCardStyle}
                                        cover={
                                            <div style={{ height: "200px", overflow: "hidden" }}>
                                                <img
                                                    alt={service.title}
                                                    src={service.img}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                        }
                                    >
                                        <Card.Meta 
                                            title={<Title level={4}>{service.title}</Title>}
                                            description={<Paragraph>{service.text}</Paragraph>}
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>
            </Content>

            {/* Footer */}
            <Footer
                style={{
                    backgroundColor: "#000",
                    color: "#fff",
                    textAlign: "center",
                    padding: "30px 0",
                }}
            >
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Paragraph style={{ color: '#fff', margin: 0 }}>
                        © {new Date().getFullYear()} Moving Service. All rights reserved.
                    </Paragraph>
                </div>
            </Footer>
        </Layout>
    );
};

export default LandingPage;