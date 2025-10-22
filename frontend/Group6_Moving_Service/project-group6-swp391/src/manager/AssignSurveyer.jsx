import { useEffect, useState, useCallback } from "react";
import { Table, Button, Select, message, Tag, Space, Typography, Card } from "antd";
import { UserAddOutlined, SolutionOutlined, CheckCircleOutlined, SyncOutlined } from "@ant-design/icons";
// Sử dụng axiosInstance đã được cấu hình từ file bạn cung cấp
import axiosInstance from "../service/axiosInstance"; 
import { Tooltip } from "antd";
const { Option } = Select;
const { Text, Title } = Typography;

export default function AssignSurveyer() {
    const [requests, setRequests] = useState([]);
    const [surveyers, setSurveyers] = useState([]);
    // Lưu employeeId được chọn cho mỗi requestId
    const [selectedEmployee, setSelectedEmployee] = useState({}); 
    const [loading, setLoading] = useState(false);

    // --- LOGIC GỌI API ---

    // Function Fetch Requests
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            // Sửa URL để sử dụng baseURL đã được cấu hình trong axiosInstance
            const res = await axiosInstance.get("/requests"); 
            // Xử lý cả trường hợp API trả ApiResponse { result: [...] } hoặc List
            const data = Array.isArray(res.data) ? res.data : res.data.result || [];
            setRequests(data);
        } catch (err) {
            message.error("Lấy danh sách Request thất bại.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Function Fetch Surveyers
    const fetchSurveyers = useCallback(async () => {
        try {
            // Sửa URL để sử dụng baseURL đã được cấu hình trong axiosInstance
            const res = await axiosInstance.get("/request-assignment/free-surveyers");
            const data = Array.isArray(res.data) ? res.data : res.data.result || [];
            setSurveyers(data);
        } catch (err) {
            message.error("Lấy danh sách nhân viên khảo sát thất bại.");
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
        fetchSurveyers();
    }, [fetchRequests, fetchSurveyers]);

    // --- LOGIC XỬ LÝ GÁN NHÂN VIÊN ---
    const handleAssign = async (requestId) => {
        const employeeId = selectedEmployee[requestId];
        if (!employeeId) {
            message.warning("Vui lòng chọn nhân viên khảo sát trước khi gán!");
            return;
        }

        try {
            setLoading(true);
            // Sử dụng axiosInstance với URL đã được sửa
            await axiosInstance.post(
                `/request-assignment/assign?requestId=${requestId}&employeeId=${employeeId}`
            );
            
            message.success(`Request #${requestId} đã được gán thành công.`);
            
            // Cập nhật lại cả 2 danh sách sau khi gán
            await Promise.all([fetchRequests(), fetchSurveyers()]);
            
            // Xóa nhân viên đã chọn khỏi state
            setSelectedEmployee(prev => {
                const newState = { ...prev };
                delete newState[requestId];
                return newState;
            });
            
        } catch (err) {
            message.error("Gán nhân viên thất bại.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    // --- CẤU HÌNH CỘT TABLE ---

    const getStatusTag = (status) => {
        const statusColors = {
            PENDING: 'processing', // Đang chờ
            assigned: 'geekblue', // Đã gán
            DONE: 'success', // Hoàn thành
            CANCELLED: 'error', // Đã hủy
        };
        const statusText = {
            PENDING: 'Đang chờ xử lý',
            assigned: 'Đã gán NV',
            DONE: 'Hoàn thành',
            CANCELLED: 'Đã hủy',
        };
        return (
            <Tag 
                icon={status === 'PENDING' ? <SyncOutlined spin /> : <CheckCircleOutlined />} 
                color={statusColors[status] || 'default'}
                style={{ borderRadius: 4, fontWeight: 'bold' }}
            >
                {statusText[status] || status}
            </Tag>
        );
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "requestId",
            key: "requestId",
            render: (text) => <Text strong type="secondary">#{text}</Text>,
            width: 80,
            align: 'center',
        },
        {
            title: "Khách hàng",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Công ty",
            dataIndex: "companyName",
            key: "companyName",
        },
        {
            title: "Thời gian yêu cầu",
            dataIndex: "requestTime",
            key: "requestTime",
            render: (text) => text ? new Date(text).toLocaleString() : 'N/A',
        },
        {
            title: "Trạng thái khảo sát",
            dataIndex: "status",
            key: "status",
            render: getStatusTag,
            width: 150,
        },
         {
            title: "Hợp đồng đã được gán",
            dataIndex: "assignmentStatus",
            key: "assignmentStatus",
            render: getStatusTag,
            width: 150,
        },
    {
    title: "Gán Surveyer",
    key: "assign",
    width: 350,
    render: (_, record) => {
        const isAssigned = record.assignmentStatus?.toLowerCase() === "assigned"; // check trạng thái
        return (
            <Space>
                <Select
                    showSearch
                    placeholder="Chọn nhân viên khảo sát"
                    optionFilterProp="children"
                    style={{ width: 200 }}
                    value={selectedEmployee[record.requestId]}
                    onChange={value => setSelectedEmployee(prev => ({ ...prev, [record.requestId]: value }))}
                    suffixIcon={<SolutionOutlined />}
                    disabled={isAssigned} // disable Select luôn nếu đã gán
                >
                    {surveyers.map(s => (
                        <Option key={s.employeeId} value={s.employeeId}>
                            <Text strong>{s.username}</Text> - <Text type="secondary">{s.position}</Text>
                        </Option>
                    ))}
                </Select>

                <Tooltip title={isAssigned ? "Request đã có người phụ trách" : ""}>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => handleAssign(record.requestId)}
                        disabled={!selectedEmployee[record.requestId] || isAssigned} // disable nếu chưa chọn NV hoặc đã gán
                        style={{ borderRadius: 6 }}
                    >
                        Gán
                    </Button>
                </Tooltip>
            </Space>
        );
    }
}
    ];

    // --- RENDER GIAO DIỆN ---
    return (
        <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Title level={3} style={{ marginBottom: 20, borderLeft: '4px solid #1890ff', paddingLeft: 12 }}>
                <UserAddOutlined style={{ marginRight: 8, color: '#1899ff' }} />
                Gán Nhân Viên Khảo Sát cho Yêu Cầu
            </Title>
            
            <Card 
                title={
                    <Space size="large">
                        <Title level={4} style={{ margin: 0 }}>Danh sách Request</Title>
                        <Tag color="green" style={{ fontSize: 14 }}>
                            NV Khảo sát rảnh: {surveyers.length}
                        </Tag>
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
                    pagination={{ pageSize: 10 }}
                    // Thêm style cho Table
                    style={{ borderRadius: 8, overflow: 'hidden' }}
                    locale={{ emptyText: 'Không có yêu cầu nào cần xử lý' }}
                />
            </Card>
        </div>
    );
}