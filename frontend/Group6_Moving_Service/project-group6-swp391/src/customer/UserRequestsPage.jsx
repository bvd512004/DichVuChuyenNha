import React, { useEffect, useMemo, useState } from "react";
import { Layout, Menu, Table, Tag, Modal, Pagination, Typography, Space, Button, Spin, Empty, Form, Input, InputNumber, message, DatePicker, Select } from "antd";
import { OrderedListOutlined, ProfileOutlined, ClockCircleOutlined, CarOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../service/axiosInstance";
import dayjs from "dayjs"; // Sử dụng dayjs cho Antd DatePicker

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const PAGE_SIZE = 5;

// Hàm chuyển đổi trạng thái sang Tag màu
const statusToTag = (status) => {
    const normalized = String(status || "").toUpperCase();
    if (["PENDING", "CREATED"].includes(normalized)) return { color: "gold", text: status || "CHỜ XỬ LÝ" };
    if (["APPROVED", "DONE", "COMPLETED"].includes(normalized)) return { color: "green", text: status || "HOÀN TẤT" };
    if (["REJECTED", "CANCELLED", "CANCELED"].includes(normalized)) return { color: "red", text: status || "ĐÃ HỦY" };
    return { color: "blue", text: status || "KHÔNG RÕ" };
};

const MOVING_TYPES = [
    { value: "HOUSE", label: "Chuyển nhà riêng", icon: <HomeOutlined /> },
    { value: "OFFICE", label: "Chuyển văn phòng", icon: <ProfileOutlined /> },
    { value: "WAREHOUSE", label: "Chuyển kho bãi", icon: <CarOutlined /> },
    { value: "OTHER", label: "Khác", icon: <OrderedListOutlined /> },
];

// **Thêm prop isEmbedded để kiểm soát việc hiển thị Layout bên ngoài**
const UserRequestsPage = ({ isEmbedded = false }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [form] = Form.useForm();
    const [dateRange, setDateRange] = useState(null); // [start, end]

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/requests/my", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const items = res?.data?.result || [];
            // Sắp xếp theo ID giảm dần (yêu cầu mới nhất lên đầu)
            items.sort((a, b) => Number(b.requestId ?? 0) - Number(a.requestId ?? 0));
            setRequests(items);
        } catch (e) {
            message.error("Không thể tải danh sách yêu cầu.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    // Filter Requests
    const filteredRequests = useMemo(() => {
        if (!dateRange || dateRange.length !== 2 || !dateRange[0] || !dateRange[1]) {
            return requests;
        }
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');

        return requests.filter((r) => {
            if (!r?.requestTime) return false;
            const t = dayjs(r.requestTime);
            return t.isAfter(startDate) && t.isBefore(endDate);
        });
    }, [requests, dateRange]);

    const total = filteredRequests.length;
    const currentItems = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredRequests.slice(start, start + PAGE_SIZE);
    }, [page, filteredRequests]);

    // Handler tạo yêu cầu mới
    const handleCreateRequest = async (values) => {
        if (!token) {
            message.warning("Vui lòng đăng nhập để tạo yêu cầu");
            return;
        }
        setCreateLoading(true);
        try {
            const response = await api.post(
                "/requests/create",
                {
                    description: values.description,
                    businessId: values.businessId || null,
                    pickupAddress: values.pickupAddress,
                    destinationAddress: values.destinationAddress,
                    movingType: values.movingType, // Đã thêm movingType
                    estimatedDistance: values.estimatedDistance || null, // Đã thêm estimatedDistance
                    // Chuyển đổi dayjs object sang ISO string hoặc null
                    movingDay: values.movingDay ? values.movingDay.toISOString() : null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            message.success("Tạo yêu cầu thành công!");
            setCreateOpen(false);
            form.resetFields();
            
            // Cập nhật UI ngay lập tức với yêu cầu mới tạo
            const newRequest = response.data.result; // Giả sử API trả về Request mới
            if (newRequest) {
                 // Thêm yêu cầu mới vào đầu danh sách
                setRequests(prev => {
                    const updatedList = [newRequest, ...prev];
                    // Cập nhật requestId nếu cần thiết (phụ thuộc vào API)
                    return updatedList;
                });
                setPage(1); // Quay về trang đầu tiên để thấy yêu cầu mới
            } else {
                await fetchData(); // Fallback: tải lại toàn bộ
            }
        } catch (e) {
            message.error("Tạo yêu cầu thất bại. Vui lòng thử lại.");
            console.error(e);
        } finally {
            setCreateLoading(false);
        }
    };

    const columns = [
        {
            title: "#ID",
            dataIndex: "requestId",
            width: 80,
            render: (id) => <Text strong>#R{id}</Text>
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (val) => {
                const t = statusToTag(val);
                return <Tag color={t.color}>{t.text}</Tag>;
            },
            width: 140,
        },
        {
            title: "Ngày yêu cầu",
            dataIndex: "requestTime",
            render: (val) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : "-",
            width: 150,
        },
        {
            title: "Ngày chuyển",
            dataIndex: "movingDay",
            render: (val) => val ? dayjs(val).format('DD/MM/YYYY') : "-",
            width: 120,
        },
        {
            title: "Địa điểm chuyển",
            dataIndex: "pickupAddress",
            ellipsis: true,
            render: (_v, record) => `${record.pickupAddress || '-'} → ${record.destinationAddress || '-'}`,
        },
        {
            title: "",
            key: "action",
            width: 100,
            render: (_v, record) => (
                <Button type="link" onClick={() => setSelected(record)} style={{ padding: 0 }}>
                    Chi tiết
                </Button>
            ),
        },
    ];

    // --- Content JSX: Phần nội dung chính của trang ---
    const ContentJSX = (
        <div style={isEmbedded ? {} : { padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: 'wrap', gap: '10px' }}>
                <Title level={3} style={{ margin: 0 }}>Danh sách yêu cầu</Title>
                <Space>
                    <DatePicker.RangePicker
                        allowClear
                        onChange={(vals) => {
                            setDateRange(vals ? [dayjs(vals[0]), dayjs(vals[1])] : null);
                            setPage(1);
                        }}
                        placeholder={["Từ ngày", "Đến ngày"]}
                        format="DD/MM/YYYY"
                        style={{ width: '220px' }}
                    />
                    <Text type="secondary">Tổng: {total}</Text>
                    <Button type="primary" icon={<ProfileOutlined />} onClick={() => setCreateOpen(true)}>Tạo yêu cầu mới</Button>
                </Space>
            </div>

            {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 240 }}>
                    <Spin size="large" tip="Đang tải yêu cầu..." />
                </div>
            ) : total === 0 ? (
                <Empty description="Chưa có yêu cầu nào được tạo." />
            ) : (
                <>
                    <Table
                        rowKey={(r) => r.requestId}
                        columns={columns}
                        dataSource={currentItems}
                        pagination={false}
                        loading={loading}
                        bordered
                        style={{ marginBottom: 16 }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Pagination
                            current={page}
                            pageSize={PAGE_SIZE}
                            total={total}
                            onChange={(p) => setPage(p)}
                            showSizeChanger={false}
                        />
                    </div>
                </>
            )}

            {/* Modal Chi tiết Yêu cầu */}
            <Modal
                title={
                    <Space>
                        <span>Chi tiết yêu cầu</span>
                        <Text type="secondary">#ID: {selected?.requestId}</Text>
                    </Space>
                }
                open={!!selected}
                onCancel={() => setSelected(null)}
                footer={[
                    <Button key="close" onClick={() => setSelected(null)}>Đóng</Button>,
                ]}
            >
                {selected ? (
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <Text><strong>Trạng thái: </strong><Tag color={statusToTag(selected.status).color}>{statusToTag(selected.status).text}</Tag></Text>
                        <Text><strong>Loại hình: </strong>{selected?.movingType || "-"}</Text>
                        <Text><strong>Thời gian yêu cầu: </strong>{selected.requestTime ? dayjs(selected.requestTime).format('HH:mm:ss DD/MM/YYYY') : "-"}</Text>
                        <Text><strong>Ngày dự định chuyển: </strong>{selected.movingDay ? dayjs(selected.movingDay).format('DD/MM/YYYY') : "-"}</Text>
                        <Text><strong>Địa chỉ lấy hàng: </strong>{selected.pickupAddress || "-"}</Text>
                        <Text><strong>Địa chỉ tới: </strong>{selected.destinationAddress || "-"}</Text>
                        <Text><strong>Mô tả chi tiết: </strong>{selected.description || "-"}</Text>
                    </Space>
                ) : null}
            </Modal>

            {/* Modal Tạo Yêu cầu Mới */}
            <Modal
                title={<Title level={4} style={{ margin: 0 }}>Tạo yêu cầu chuyển nhà mới</Title>}
                open={createOpen}
                onCancel={() => {
                    if (!createLoading) setCreateOpen(false);
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateRequest}
                    style={{ marginTop: 20 }}
                >
                    {/* Trường Loại hình chuyển nhà */}
                    <Form.Item
                        label={<Space><CarOutlined /> Loại hình chuyển dọn</Space>}
                        name="movingType"
                        rules={[{ required: true, message: "Vui lòng chọn loại hình chuyển dọn" }]}
                    >
                        <Select
                            placeholder="Chọn loại hình chuyển dọn chính"
                            options={MOVING_TYPES.map(t => ({
                                value: t.value,
                                label: <Space>{t.icon} {t.label}</Space>
                            }))}
                        />
                    </Form.Item>

                    {/* Trường Ngày chuyển nhà */}
                    <Form.Item 
                        label={<Space><ClockCircleOutlined /> Ngày dự định chuyển nhà</Space>} 
                        name="movingDay"
                        rules={[{ required: true, message: "Vui lòng chọn ngày chuyển nhà" }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn một ngày cụ thể"
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>

                    {/* Trường Địa chỉ lấy hàng */}
                    <Form.Item
                        label="Địa chỉ lấy hàng (Tỉnh/Thành, Quận/Huyện, Chi tiết)"
                        name="pickupAddress"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ lấy hàng" }]}
                    >
                        <Input placeholder="VD: 123 Lê Lợi, P. Bến Thành, Q.1, TP. HCM" />
                    </Form.Item>

                    {/* Trường Địa chỉ tới */}
                    <Form.Item
                        label="Địa chỉ tới (Tỉnh/Thành, Quận/Huyện, Chi tiết)"
                        name="destinationAddress"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ tới" }]}
                    >
                        <Input placeholder="VD: 456 Trần Phú, P.8, Q.5, TP. HCM" />
                    </Form.Item>

                    {/* Trường Khoảng cách (Nếu cần) */}
                 

                    {/* Trường Mô tả */}
                    <Form.Item
                        label="Mô tả chung về nhu cầu"
                        name="description"
                        rules={[{ required: true, message: "Vui lòng nhập mô tả yêu cầu" }]}
                    >
                        <Input.TextArea 
                            rows={4} 
                            placeholder="Mô tả chung về nhu cầu của bạn, ví dụ: 
- Quy mô: Căn hộ 2 phòng ngủ.
- Đồ đạc đặc biệt: Có một tủ lạnh lớn side-by-side.
- Hạn chế: Chỉ có thể chuyển vào buổi sáng." 
                        />
                    </Form.Item>
                    
                    <Form.Item label="Mã doanh nghiệp đối tác (tùy chọn)" name="businessId">
                        <InputNumber style={{ width: '100%' }} placeholder="Nhập Business ID nếu yêu cầu từ đối tác" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 10 }}>
                            <Button onClick={() => setCreateOpen(false)} disabled={createLoading}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={createLoading}>
                                Gửi yêu cầu
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
    // --- Kết thúc Content JSX ---


    // Logic quyết định hiển thị Layout bên ngoài hay chỉ nội dung
    if (isEmbedded) {
        return ContentJSX;
    }

    return (
        <Layout style={{ background: "#fff", minHeight: 520 }}>
            <Sider width={260} style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}>
                <div style={{ padding: 16 }}>
                    <Title level={4} style={{ margin: 0, color: "#8B0000" }}>Giao dịch khách hàng</Title>
                </div>
                <Menu
                    mode="inline"
                    defaultSelectedKeys={["my-requests"]}
                    items={[
                        { key: "my-requests", icon: <OrderedListOutlined />, label: "Danh sách yêu cầu", onClick: () => navigate("/my-requests") },
                        { type: 'divider' },
                        { key: "logout", label: "Đăng xuất", danger: true, onClick: () => { /* Logic đăng xuất */ } },
                    ]}
                />
            </Sider>
            <Content>
                {/* Nhúng nội dung chính */}
                {ContentJSX}
            </Content>
        </Layout>
    );
};

export default UserRequestsPage;