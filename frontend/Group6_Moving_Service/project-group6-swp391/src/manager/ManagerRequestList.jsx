import { useEffect, useState } from "react";
import { Table, Button, Tag, Space, Typography, Card, Statistic, Row, Col, Modal, Descriptions, message, Select, Tooltip } from "antd";
import { 
    ContainerOutlined, 
    SyncOutlined, 
    EyeOutlined, 
    CheckCircleOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    UserOutlined,
    EnvironmentOutlined,
    PlusOutlined,
    EditOutlined
} from "@ant-design/icons";
import axiosInstance from "../service/axiosInstance";

const { Option } = Select;

const { Title, Text } = Typography;

export default function ManagerRequestList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    
    // State cho modal gán nhân viên
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [surveys, setSurveys] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [assigningRequestId, setAssigningRequestId] = useState(null);

    // Fetch all requests
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/requests");
            // Backend trả về trực tiếp List<RequestDto> (không có ApiResponse wrapper)
            const data = Array.isArray(res.data) ? res.data : [];
            
            console.log("Fetched requests:", data);
            
            // Filter: lấy all hoặc chỉ PENDING
            let filtered = filterStatus === "pending" 
                ? data.filter(r => r.status === "PENDING")
                : data;
            
            // Sort: mới nhất lên đầu
            filtered.sort((a, b) => {
                const dateA = new Date(a.requestTime);
                const dateB = new Date(b.requestTime);
                return dateB - dateA;
            });
            
            setRequests(filtered);
        } catch (err) {
            message.error("Không thể tải danh sách yêu cầu.");
            console.error("Error fetching requests:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch danh sách surveyers free
    const fetchFreeSurveyers = async () => {
        try {
            const res = await axiosInstance.get("/request-assignment/free-surveyers");
            setSurveys(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching surveyers:", err);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchFreeSurveyers();
    }, [filterStatus]);

    // Update status của request
    const handleStatusChange = async (requestId, newStatus) => {
        try {
            await axiosInstance.put(`/requests/${requestId}/status?status=${newStatus}`);
            message.success("Cập nhật trạng thái thành công!");
            fetchRequests();
        } catch (err) {
            message.error("Không thể cập nhật trạng thái!");
            console.error("Error updating status:", err);
        }
    };

    // Mở modal gán nhân viên
    const handleOpenAssignModal = (requestId) => {
        setAssigningRequestId(requestId);
        setSelectedEmployeeId(null);
        setShowAssignModal(true);
    };

    // Gán nhân viên vào request
    const handleAssignEmployee = async () => {
        if (!selectedEmployeeId) {
            message.warning("Vui lòng chọn nhân viên!");
            return;
        }

        try {
            await axiosInstance.post(
                `/request-assignment/assign?requestId=${assigningRequestId}&employeeId=${selectedEmployeeId}`
            );
            message.success("Gán nhân viên thành công!");
            setShowAssignModal(false);
            setSelectedEmployeeId(null);
            fetchRequests();
        } catch (err) {
            message.error("Không thể gán nhân viên!");
            console.error("Error assigning employee:", err);
        }
    };

    // Render status tag
    const renderStatusTag = (status) => {
        const statusMap = {
            PENDING: { color: "processing", text: "Đang chờ", icon: <ClockCircleOutlined /> },
            assigned: { color: "geekblue", text: "Đã gán NV", icon: <UserOutlined /> },
            DONE: { color: "success", text: "Hoàn thành", icon: <CheckCircleOutlined /> },
            CANCELLED: { color: "error", text: "Đã hủy", icon: <SyncOutlined /> },
        };
        
        const statusInfo = statusMap[status] || { color: "default", text: status, icon: null };
        
        return (
            <Tag color={statusInfo.color} icon={statusInfo.icon}>
                {statusInfo.text}
            </Tag>
        );
    };

    // View request details
    const handleViewDetails = (record) => {
        setSelectedRequest(record);
        setShowDetailModal(true);
    };

    // Calculate statistics
    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === "PENDING").length,
        assigned: requests.filter(r => r.assignmentStatus === "assigned").length,
        done: requests.filter(r => r.status === "DONE").length,
    };

    // Table columns
    const columns = [
        {
            title: "ID",
            dataIndex: "requestId",
            key: "requestId",
            width: 80,
            align: "center",
            render: (text) => <Text strong type="secondary">#{text}</Text>,
        },
        {
            title: "Khách hàng",
            dataIndex: "username",
            key: "username",
            render: (text) => <Text strong>{text || "N/A"}</Text>,
        },
        {
            title: "Công ty",
            dataIndex: "companyName",
            key: "companyName",
            render: (text) => text || <Text type="secondary">Cá nhân</Text>,
        },
        {
            title: "Thời gian yêu cầu",
            dataIndex: "requestTime",
            key: "requestTime",
            width: 180,
            render: (text) => text ? new Date(text).toLocaleString("vi-VN") : "N/A",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (status, record) => (
                <Select
                    value={status}
                    onChange={(newStatus) => handleStatusChange(record.requestId, newStatus)}
                    style={{ width: '100%' }}
                >
                    <Option value="PENDING">PENDING</Option>
                    <Option value="ASSIGNED">ASSIGNED</Option>
                    <Option value="IN_PROGRESS">IN_PROGRESS</Option>
                    <Option value="DONE">DONE</Option>
                    <Option value="CANCELLED">CANCELLED</Option>
                </Select>
            ),
        },
        {
            title: "Trạng thái phân công",
            dataIndex: "assignmentStatus",
            key: "assignmentStatus",
            width: 150,
            render: (text) => {
                if (text === "assigned") {
                    return <Tag color="geekblue">Đã phân công</Tag>;
                }
                return <Tag color="default">Chưa phân công</Tag>;
            },
        },
        {
            title: "Hành động",
            key: "action",
            width: 220,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        >
                            Chi tiết
                        </Button>
                    </Tooltip>
                    {record.assignmentStatus !== "assigned" && (
                        <Tooltip title="Gán nhân viên khảo sát">
                            <Button
                                icon={<UserOutlined />}
                                onClick={() => handleOpenAssignModal(record.requestId)}
                            >
                                Gán NV
                            </Button>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            {/* Header */}
            <Title level={3} style={{ marginBottom: 24, borderLeft: '4px solid #1890ff', paddingLeft: 12 }}>
                <ContainerOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                Quản Lý Yêu Cầu Chuyển Nhà
            </Title>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng yêu cầu"
                            value={stats.total}
                            prefix={<ContainerOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đang chờ duyệt"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã phân công"
                            value={stats.assigned}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Hoàn thành"
                            value={stats.done}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filter Buttons */}
            <Space style={{ marginBottom: 16 }}>
                <Button
                    type={filterStatus === "all" ? "primary" : "default"}
                    onClick={() => setFilterStatus("all")}
                >
                    Tất cả ({stats.total})
                </Button>
                <Button
                    type={filterStatus === "pending" ? "primary" : "default"}
                    onClick={() => setFilterStatus("pending")}
                    icon={<ClockCircleOutlined />}
                >
                    Đang chờ ({stats.pending})
                </Button>
            </Space>

            {/* Requests Table */}
            <Card
                title={
                    <Space size="large">
                        <Title level={4} style={{ margin: 0 }}>
                            Danh sách yêu cầu
                        </Title>
                        {filterStatus === "pending" && (
                            <Tag color="warning" style={{ fontSize: 14 }}>
                                Chỉ hiển thị yêu cầu đang chờ
                            </Tag>
                        )}
                    </Space>
                }
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            >
                <Table
                    rowKey="requestId"
                    dataSource={requests}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} yêu cầu`,
                    }}
                    style={{ borderRadius: 8, overflow: 'hidden' }}
                    locale={{ emptyText: 'Không có yêu cầu nào' }}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết yêu cầu"
                open={showDetailModal}
                onCancel={() => setShowDetailModal(false)}
                footer={[
                    <Button key="close" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>,
                ]}
                width={700}
            >
                {selectedRequest && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="ID yêu cầu">
                            <Text strong>#{selectedRequest.requestId}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">
                            {selectedRequest.username || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Công ty">
                            {selectedRequest.companyName || "Cá nhân"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian yêu cầu">
                            {selectedRequest.requestTime 
                                ? new Date(selectedRequest.requestTime).toLocaleString("vi-VN")
                                : "N/A"
                            }
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            {renderStatusTag(selectedRequest.status)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái phân công">
                            {selectedRequest.assignmentStatus === "assigned" ? (
                                <Tag color="geekblue">Đã phân công</Tag>
                            ) : (
                                <Tag color="default">Chưa phân công</Tag>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ xuất phát">
                            <EnvironmentOutlined /> {selectedRequest.pickupAddress || "N/A"}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            {/* Modal Gán Nhân Viên */}
            <Modal
                title="Gán nhân viên khảo sát"
                open={showAssignModal}
                onCancel={() => {
                    setShowAssignModal(false);
                    setSelectedEmployeeId(null);
                }}
                onOk={handleAssignEmployee}
                okText="Gán nhân viên"
                cancelText="Hủy"
                width={500}
            >
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Chọn nhân viên khảo sát:</Text>
                </div>
                <Select
                    placeholder="Chọn nhân viên khảo sát"
                    style={{ width: '100%' }}
                    showSearch
                    optionFilterProp="children"
                    value={selectedEmployeeId}
                    onChange={setSelectedEmployeeId}
                >
                    {surveys.map(emp => (
                        <Option key={emp.employeeId} value={emp.employeeId}>
                            <Space>
                                <UserOutlined />
                                <Text strong>{emp.username}</Text>
                                <Text type="secondary">- {emp.position}</Text>
                            </Space>
                        </Option>
                    ))}
                </Select>
                {surveys.length === 0 && (
                    <div style={{ marginTop: 16, color: '#faad14' }}>
                        Không có nhân viên khảo sát nào rảnh
                    </div>
                )}
            </Modal>
        </div>
    );
}
