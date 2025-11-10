import React, { useState, useEffect } from "react";
import { Layout, Menu, Typography, Table, Tag, message, Card, Descriptions, List } from "antd";
import {
    FileTextOutlined,
    OrderedListOutlined,
    ScheduleOutlined,
    HistoryOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    QrcodeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import axiosInstance from "../service/axiosInstance";

// Import existing components
import QuotationApproval from "./QuotationApproval";
import UserRequestsPage from "./UserRequestsPage";
import UserContractsPage from "./UserContractPage";
import CustpmerWorkProgressPage from "./WorkProgressCustomerPage";
import UserFinalPaymentPage from "./UserFinalPaymentPage";
import { Badge } from "antd";
import PaymentAPI from "../service/payment";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;


// Hàm định dạng tiền tệ
const formatCurrency = (amount) => amount?.toLocaleString("vi-VN") + " đ";

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [selectedKey, setSelectedKey] = useState("my-requests");
    const [pendingPayments, setPendingPayments] = useState(0);
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
    // ✅ Lấy số lượng thanh toán đang chờ
    const fetchPendingPayments = async () => {
        try {
            const res = await PaymentAPI.getFinalPaymentsForUser();
            const data = typeof res === "string" ? JSON.parse(res) : res;
            const pending = (data.payments || []).filter(p => p.status === "pending").length;
            setPendingPayments(pending);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách thanh toán:", err);
        }
    };


    useEffect(() => {
        if (selectedKey === "signed-contracts") {
            fetchSignedContracts();
        }
    }, [selectedKey]);
    useEffect(() => {
        fetchPendingPayments(); // Gọi khi load trang
        const interval = setInterval(fetchPendingPayments, 30000); // Gọi lại mỗi 30 giây
        return () => clearInterval(interval);
    }, []);


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
        // hạn thanh toán
        {
            title: "Hạn thanh toán",
            key: "depositDueDate",
            width: 150,
            render: (record) => (
                <Text type="secondary">
                    {record.depositDueDate
                        ? new Date(record.depositDueDate).toLocaleDateString("vi-VN")
                        : "Chưa có thông tin"}
                </Text>
            ),


        },

        //thêm cột mã QR code
        {
            title: "Thanh toán",
            key: "payment",
            width: 180,
            render: (record) => {
                const payment = record.payment || {}; // lấy thông tin thanh toán từ contract

                if (payment.status === "pending") {
                    return (
                        <Tooltip title={`Hạn: ${payment.dueDate
                            ? new Date(payment.dueDate).toLocaleDateString("vi-VN")
                            : "Không rõ"
                            }`}>
                            <a
                                href={payment.checkoutUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    backgroundColor: "#1677ff",
                                    color: "#fff",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    display: "inline-block",
                                }}
                            >
                                💳 Thanh toán
                            </a>
                        </Tooltip>
                    );
                } else if (payment.status === "paid") {
                    return (
                        <Tag color="success" style={{ padding: "4px 8px" }}>
                            ✅ Đã thanh toán
                        </Tag>
                    );
                } else if (payment.status === "expired") {
                    return (
                        <Tag color="error" style={{ padding: "4px 8px" }}>
                            ❌ Quá hạn
                        </Tag>
                    );
                } else {
                    return <Tag color="default">Không có</Tag>;
                }
            },
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
            case "/customer/final-payments":
                return <UserFinalPaymentPage />
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
                        {
                            key: "/customer/final-payments",
                            icon: (
                                <Badge
                                    count={pendingPayments}
                                    size="small"
                                    color="red"
                                    offset={[10, 0]}
                                >
                                    <QrcodeOutlined />
                                </Badge>
                            ),
                            label: (
                                <span
                                    style={{
                                        fontWeight: pendingPayments > 0 ? "bold" : "normal",
                                        color: pendingPayments > 0 ? "red" : "inherit",
                                    }}
                                >
                                    💳 Thanh toán
                                </span>
                            ),
                        },

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