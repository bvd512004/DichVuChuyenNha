import React, { useState, useEffect } from "react";
import { Layout, Menu, Typography, Table, Tag, message, Card, Descriptions, List } from "antd"; 
import {
    FileTextOutlined,
    OrderedListOutlined,
    ScheduleOutlined,
    HistoryOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../service/axiosInstance"; 

// Import existing components
import QuotationApproval from "./QuotationApproval";
import UserRequestsPage from "./UserRequestsPage"; 
import UserContractsPage from "./UserContractPage";
import CustpmerWorkProgressPage from "./WorkProgressCustomerPage";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => amount?.toLocaleString("vi-VN") + " đ";

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [selectedKey, setSelectedKey] = useState("my-requests"); 

    /*** STATE LỊCH SỬ HỢP ĐỒNG ***/
    const [signedContracts, setSignedContracts] = useState([]);
    const [loadingContracts, setLoadingContracts] = useState(false);

    const fetchSignedContracts = async () => {
        setLoadingContracts(true);
        try {
            const res = await axiosInstance.get("/contracts/my-signed");
            setSignedContracts(res.data || []);
        } catch (error) {
            message.error("Lấy lịch sử hợp đồng thất bại!");
            console.error(error);
        } finally {
            setLoadingContracts(false);
        }
    };

    useEffect(() => {
        if (selectedKey === "signed-contracts") {
            fetchSignedContracts();
        }
    }, [selectedKey]);

    // CẤU HÌNH CỘT CHO BẢNG LỊCH SỬ HỢP ĐỒNG
    const signedContractsColumns = [
        { 
            title: "Mã HĐ", 
            dataIndex: "contractId", 
            key: "contractId",
            width: 80,
            render: (id) => <Text strong>#KHĐ{id}</Text>
        },
        { 
            title: "Trạng thái", 
            dataIndex: "status", 
            key: "status",
            width: 130,
            render: () => (
                <Tag 
                    icon={<CheckCircleOutlined />} 
                    color="success"
                    style={{ padding: '4px 8px' }}
                >
                    ĐÃ KÝ
                </Tag>
            )
        },
        { 
            title: "Ngày ký", 
            dataIndex: "signedDate", 
            key: "signedDate",
            width: 150,
            render: (date) => (
                <Text>
                    {date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'}
                </Text>
            )
        },
        { 
            title: "Địa điểm chuyển", 
            key: "locations", 
            render: (record) => (
                <div>
                    <Text type="secondary">Từ:</Text> <Text strong>{record.startLocation}</Text>
                    <br />
                    <Text type="secondary">Đến:</Text> <Text strong>{record.endLocation}</Text>
                </div>
            )
        },
        { 
            title: "Thời gian thực hiện", 
            key: "timeframe",
            width: 200,
            render: (record) => (
                <div>
                    <ClockCircleOutlined /> <Text type="secondary">Bắt đầu:</Text> {new Date(record.startDate).toLocaleDateString('vi-VN')}
                    <br />
                    <ClockCircleOutlined /> <Text type="secondary">Kết thúc:</Text> {new Date(record.endDate).toLocaleDateString('vi-VN')}
                </div>
            )
        },
        { 
            title: "Tổng giá trị", 
            dataIndex: "totalAmount", 
            key: "totalAmount", 
            width: 150,
            render: (amount) => <Text strong style={{ color: '#fa8c16' }}>{formatCurrency(amount)}</Text>
        },
        { 
            title: "Tiền cọc", 
            dataIndex: "depositAmount", 
            key: "depositAmount", 
            width: 130,
            render: (amount) => <Text type="success">{formatCurrency(amount)}</Text>
        },
    ];

    // Hàm render nội dung theo tab
    const renderContent = () => {
        switch (selectedKey) {
            case "my-requests":
                return <UserRequestsPage isEmbedded={true} />; 
            case "quotation-approval":
                return <QuotationApproval />;
            case "unsigned-contracts":
                return <UserContractsPage />;
            case "customer/work-progress":
                return <CustpmerWorkProgressPage />;
            case "signed-contracts":
                return (
                    <Card
                        title={<Title level={4} style={{ margin: 0 }}>📜 Lịch sử Hợp đồng đã ký</Title>}
                        extra={<Text type="secondary">Chi tiết các giao dịch đã hoàn tất</Text>}
                        bordered={false}
                    >
                        <Table
                            rowKey="contractId"
                            dataSource={signedContracts}
                            columns={signedContractsColumns}
                            loading={loadingContracts}
                            pagination={{ pageSize: 5 }}
                            expandable={{
                                expandedRowRender: (record) => (
                                    <Descriptions 
                                        bordered 
                                        size="small" 
                                        column={1} 
                                        title={<Text strong>Dịch vụ chi tiết</Text>}
                                    >
                                        <Descriptions.Item label="Người Ký HĐ">
                                            {record.signedByUsername || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Tổng phí dịch vụ">
                                            <Text type="secondary">{formatCurrency(record.totalPrice)}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Danh sách Dịch vụ">
                                            <List
                                                itemLayout="horizontal"
                                                dataSource={record.services || []}
                                                renderItem={item => (
                                                    <List.Item>
                                                        <List.Item.Meta
                                                            title={<Text strong>{item.serviceName}</Text>}
                                                            description={`Loại giá: ${item.priceType || 'N/A'} | Số lượng: ${item.quantity}`}
                                                        />
                                                        <div>{formatCurrency(item?.subtotal)}</div>
                                                    </List.Item>
                                                )}
                                            />
                                        </Descriptions.Item>
                                    </Descriptions>
                                ),
                                rowExpandable: (record) => record.services && record.services.length > 0,
                            }}
                        />
                    </Card>
                );
            default:
                return <Title level={4}>Chào mừng đến với Bảng điều khiển Khách hàng!</Title>;
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={260} style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}>
                <div style={{ padding: 16 }}>
                    <Title level={4} style={{ margin: 0, color: "#8B0000" }}>Giao dịch khách hàng</Title>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={({ key }) => setSelectedKey(key)}
                    style={{ height: "100%", borderRight: 0 }}
                    items={[
                        { key: "my-requests", icon: <OrderedListOutlined />, label: "📝 Danh sách yêu cầu" },
                        { key: "quotation-approval", icon: <FileTextOutlined />, label: "💰 Báo giá chờ duyệt" },
                        { key: "unsigned-contracts", icon: <ScheduleOutlined />, label: "✍️ Hợp đồng chờ ký" },
                        { key: "customer/work-progress", icon: <ScheduleOutlined />, label: "🚚 Tiến trình chuyển đồ" },
                        { key: "signed-contracts", icon: <HistoryOutlined />, label: "📖 Lịch sử HĐ đã ký" },
                        { type: "divider" },
                        { key: "logout", label: "Đăng xuất", danger: true, onClick: () => { /* Logic đăng xuất */ } },
                    ]}
                />
            </Sider>

            <Layout style={{ padding: '0 24px 24px' }}>
                <Content
                    style={{
                        padding: 24,
                        margin: 0,
                        minHeight: 280,
                        background: "#fff",
                        borderRadius: "8px",
                        marginTop: "24px"
                    }}
                >
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
};

export default CustomerDashboard;