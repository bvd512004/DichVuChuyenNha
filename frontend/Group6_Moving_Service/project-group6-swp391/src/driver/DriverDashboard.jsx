import React, { useEffect, useState } from "react";
import { Layout, Card, Table, Button, Tag, Modal, Descriptions, Space, message, Row, Col, Statistic } from "antd";
import {
    PlayCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    CarOutlined,
    UserOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import axiosInstance from "../service/axiosInstance";
import dayjs from "dayjs";

const { Content, Sider } = Layout;

export default function DriverDashboard() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/driver/contracts");
            setContracts(res.data);
        } catch (err) {
            message.error("Không thể tải danh sách hợp đồng");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (contract) => {
        setSelectedContract(contract);
        setDetailModalVisible(true);
    };

    const handleStartWork = async (contractId) => {
        try {
            await axiosInstance.post(`/driver/contracts/${contractId}/start`);
            message.success("Bắt đầu công việc thành công!");
            fetchContracts();
        } catch (err) {
            message.error("Không thể bắt đầu công việc");
            console.error(err);
        }
    };

    const handleCompleteWork = async (contractId) => {
        try {
            await axiosInstance.post(`/driver/contracts/${contractId}/complete`);
            message.success("Hoàn thành công việc thành công!");
            fetchContracts();
        } catch (err) {
            message.error("Không thể hoàn thành công việc");
            console.error(err);
        }
    };

    const renderStatusTag = (status) => {
        const statusMap = {
            NOT_STARTED: { color: "default", text: "Chưa bắt đầu" },
            IN_PROGRESS: { color: "processing", text: "Đang thực hiện" },
            COMPLETED: { color: "success", text: "Hoàn thành" },
            CANCELLED: { color: "error", text: "Đã hủy" },
        };
        const config = statusMap[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: "Mã HĐ",
            dataIndex: "contractId",
            key: "contractId",
            width: 80,
        },
        {
            title: "Địa chỉ vận chuyển",
            key: "addresses",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <div>
                        <EnvironmentOutlined style={{ color: "#52c41a" }} />{" "}
                        <strong>Đi:</strong> {record.pickupAddress}
                    </div>
                    <div>
                        <EnvironmentOutlined style={{ color: "#1890ff" }} />{" "}
                        <strong>Đến:</strong> {record.destinationAddress}
                    </div>
                </Space>
            ),
        },
        {
            title: "Ngày vận chuyển",
            dataIndex: "movingDay",
            key: "movingDay",
            width: 150,
            render: (text) => (text ? dayjs(text).format("DD/MM/YYYY") : "N/A"),
        },
        {
            title: "Xe được gán",
            key: "vehicle",
            width: 150,
            render: (_, record) => (
                <Space>
                    <CarOutlined />
                    <div>
                        <div>{record.licensePlate}</div>
                        <Tag>{record.vehicleType}</Tag>
                    </div>
                </Space>
            ),
        },
        {
            title: "Trạng thái công việc",
            dataIndex: "workStatus",
            key: "workStatus",
            width: 150,
            render: renderStatusTag,
        },
        {
            title: "Hành động",
            key: "action",
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EnvironmentOutlined />}
                        onClick={() => handleViewDetails(record)}
                    >
                        Chi tiết
                    </Button>
                    {record.workStatus === "NOT_STARTED" && (
                        <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleStartWork(record.contractId)}
                        >
                            Bắt đầu
                        </Button>
                    )}
                    {record.workStatus === "IN_PROGRESS" && (
                        <Button
                            type="primary"
                            success
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleCompleteWork(record.contractId)}
                        >
                            Hoàn thành
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    // Tính toán thống kê
    const stats = {
        total: contracts.length,
        pending: contracts.filter((c) => c.workStatus === "NOT_STARTED").length,
        inProgress: contracts.filter((c) => c.workStatus === "IN_PROGRESS").length,
        completed: contracts.filter((c) => c.workStatus === "COMPLETED").length,
    };

    return (
        <Layout style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
            <Sider
                width={250}
                style={{
                    background: "#001529",
                }}
            >
                <div
                    style={{
                        padding: "24px",
                        color: "#fff",
                        textAlign: "center",
                        fontSize: "20px",
                        fontWeight: "bold",
                        borderBottom: "1px solid #1f1f1f",
                    }}
                >
                    🚚 Driver Dashboard
                </div>
                <div style={{ padding: "16px", color: "#fff", textAlign: "center" }}>
                    <CarOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
                    <div style={{ marginTop: "16px" }}>Tài xế vận chuyển</div>
                </div>
            </Sider>

            <Layout>
                <Content style={{ padding: "24px" }}>
                    {/* Header with Statistics */}
                    <Card>
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic
                                    title="Tổng hợp đồng"
                                    value={stats.total}
                                    prefix={<CarOutlined />}
                                    valueStyle={{ color: "#1890ff" }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Chờ bắt đầu"
                                    value={stats.pending}
                                    prefix={<ClockCircleOutlined />}
                                    valueStyle={{ color: "#faad14" }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Đang thực hiện"
                                    value={stats.inProgress}
                                    prefix={<PlayCircleOutlined />}
                                    valueStyle={{ color: "#52c41a" }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Hoàn thành"
                                    value={stats.completed}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: "#3f8600" }}
                                />
                            </Col>
                        </Row>
                    </Card>

                    {/* Table */}
                    <Card style={{ marginTop: "24px" }} title="Danh sách hợp đồng vận chuyển">
                        <Table
                            columns={columns}
                            dataSource={contracts}
                            loading={loading}
                            rowKey="contractId"
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>

                    {/* Detail Modal */}
                    <Modal
                        title="Chi tiết hợp đồng vận chuyển"
                        open={detailModalVisible}
                        onCancel={() => setDetailModalVisible(false)}
                        footer={null}
                        width={700}
                    >
                        {selectedContract && (
                            <Descriptions bordered column={2}>
                                <Descriptions.Item label="Mã hợp đồng" span={2}>
                                    {selectedContract.contractId}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {renderStatusTag(selectedContract.contractStatus)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái công việc">
                                    {renderStatusTag(selectedContract.workStatus)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày bắt đầu" span={1}>
                                    <CalendarOutlined />{" "}
                                    {selectedContract.startDate
                                        ? dayjs(selectedContract.startDate).format("DD/MM/YYYY")
                                        : "N/A"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày kết thúc" span={1}>
                                    <CalendarOutlined />{" "}
                                    {selectedContract.endDate
                                        ? dayjs(selectedContract.endDate).format("DD/MM/YYYY")
                                        : "N/A"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày vận chuyển" span={2}>
                                    <CalendarOutlined />{" "}
                                    {selectedContract.movingDay
                                        ? dayjs(selectedContract.movingDay).format("DD/MM/YYYY")
                                        : "N/A"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ lấy hàng" span={2}>
                                    <EnvironmentOutlined /> {selectedContract.pickupAddress}
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                                    <EnvironmentOutlined /> {selectedContract.destinationAddress}
                                </Descriptions.Item>
                                <Descriptions.Item label="Thông tin xe" span={1}>
                                    <CarOutlined /> {selectedContract.licensePlate} - {selectedContract.vehicleType}
                                </Descriptions.Item>
                                <Descriptions.Item label="Khách hàng" span={1}>
                                    <UserOutlined /> {selectedContract.customerName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Mô tả" span={2}>
                                    {selectedContract.description || "Không có mô tả"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tổng giá" span={2}>
                                    <strong>{selectedContract.totalPrice?.toLocaleString("vi-VN")} VNĐ</strong>
                                </Descriptions.Item>
                            </Descriptions>
                        )}
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}

