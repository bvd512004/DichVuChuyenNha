import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Modal, Form, Input, DatePicker, Tag, Space, Typography, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../service/axiosInstance";

const { Title, Text } = Typography;

const QuotationContractList = () => {
    const [quotations, setQuotations] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [creatingContract, setCreatingContract] = useState(null);
    const [editingContract, setEditingContract] = useState(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "0 đ";
        return amount.toLocaleString('vi-VN') + " đ";
    };

    const getContractStatusTag = (status) => {
        const color = status === 'ACTIVE' ? 'warning' : status === 'UNSIGNED' ? 'processing' : 'success';
        const text = status === 'ACTIVE' ? 'Đã kích hoạt' : status === 'UNSIGNED' ? 'Đang chờ' : 'Khách hàng đã kí';
        return <Tag color={color} style={{ fontWeight: 'bold', borderRadius: 4 }}>{text}</Tag>;
    };

    // Lấy dữ liệu
    const fetchData = async () => {
        try {
            // Giả định API trả về res.data.result hoặc res.data
            const qRes = await axiosInstance.get("/quotations");
            const cRes = await axiosInstance.get("/contracts/manager");
            
            setQuotations(Array.isArray(qRes.data.result) ? qRes.data.result : qRes.data || []);
            setContracts(Array.isArray(cRes.data.result) ? cRes.data.result : cRes.data || []);
        } catch (error) {
            message.error("Lấy dữ liệu thất bại!");
            console.error(error);
        }
    };

    useEffect(() => { fetchData(); }, []);

    /*** TẠO HỢP ĐỒNG ***/
    const openCreateModal = (quotation) => {
        setCreatingContract(quotation);
        createForm.resetFields();
        createForm.setFieldsValue({
            // Đặt tiền cọc mặc định là 10%
            depositAmount: Math.round(quotation.totalPrice * 0.1), 
            totalAmount: quotation.totalPrice,
            startDate: dayjs(), // Mặc định ngày hiện tại
            endDate: dayjs().add(1, 'month'), // Mặc định 1 tháng sau
        });
    };

    const handleCreate = async (values) => {
        try {
            await axiosInstance.post("/contracts", {
                quotationId: creatingContract.quotationId,
                depositAmount: values.depositAmount,
                totalAmount: values.totalAmount,
                startDate: values.startDate.format("YYYY-MM-DD"),
                endDate: values.endDate.format("YYYY-MM-DD"),
            });
            message.success("Tạo hợp đồng thành công!");
            setCreatingContract(null);
            fetchData();
        } catch (error) {
            message.error("Tạo hợp đồng thất bại!");
            console.error(error);
        }
    };

    /*** SỬA HỢP ĐỒNG ***/
    const openEditModal = (contract) => {
        setEditingContract(contract);
        editForm.resetFields();
        editForm.setFieldsValue({
            startDate: dayjs(contract.startDate),
            endDate: dayjs(contract.endDate),
            depositAmount: contract.depositAmount,
            totalAmount: contract.totalAmount || contract.totalPrice, 
        });
    };

    const handleUpdate = async (values) => {
        try {
            await axiosInstance.put(`/contracts/${editingContract.contractId}`, {
                startDate: values.startDate.format("YYYY-MM-DD"),
                endDate: values.endDate.format("YYYY-MM-DD"),
                depositAmount: values.depositAmount,
                totalAmount: values.totalAmount,
            });
            message.success("Cập nhật hợp đồng thành công!");
            setEditingContract(null);
            fetchData();
        } catch (error) {
            message.error("Cập nhật hợp đồng thất bại!");
            console.error(error);
        }
    };

    /*** XÓA HỢP ĐỒNG ***/
    const deleteContract = async (id) => {
        try {
            await axiosInstance.delete(`/contracts/${id}`);
            message.success("Xóa hợp đồng thành công!");
            fetchData();
        } catch (error) {
            message.error("Xóa hợp đồng thất bại!");
            console.error(error);
        }
    };

    // Cột chi tiết dịch vụ cho expandable table
    const quotationServiceColumns = [
        { title: "Dịch vụ", dataIndex: "serviceName", key: "serviceName" },
        { title: "Loại giá", dataIndex: "priceType", key: "priceType" },
        { title: "Số lượng", dataIndex: "quantity", key: "quantity", width: 90, align: 'center' },
        { 
            title: "Đơn giá", 
            dataIndex: "amount", 
            key: "amount",
            render: formatCurrency,
            align: 'right' 
        },
        { 
            title: "Thành tiền", 
            dataIndex: "subtotal", 
            key: "subtotal",
            align: 'right',
            // Chỉ giữ lại một lần định nghĩa render
            render: (text) => <Text strong type="success">{formatCurrency(text)}</Text>
        },
    ];
    
    // Cột Báo giá APPROVED
    const quotationColumns = [
        { 
            title: "Mã Báo Giá", 
            dataIndex: "quotationId", 
            key: "quotationId", 
            render: (text) => <Text strong type="secondary">#{text}</Text>
        },
        { title: "Khách hàng", dataIndex: "username", key: "username" },
        { title: "Địa chỉ đi", dataIndex: "addressFrom", key: "addressFrom" },
        { title: "Địa chỉ đến", dataIndex: "addressTo", key: "addressTo" },
        { 
            title: "Tổng giá", 
            dataIndex: "totalPrice", 
            key: "totalPrice",
            render: (price) => <Text strong style={{ color: '#faad14' }}>{formatCurrency(price)}</Text>,
            align: 'right'
        },
        { 
            title: "Hành động", 
            key: "action",
            align: 'center',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => openCreateModal(record)}
                    style={{ borderRadius: 6 }}
                >
                    Tạo Hợp đồng
                </Button>
            ) 
        },
    ];

    // Cột Hợp đồng
    const contractColumns = [
        { 
            title: "Mã HĐ", 
            dataIndex: "contractId", 
            key: "contractId", 
            render: (text) => <Text strong type="secondary">#{text}</Text>
        },
          { 
            title: " Tên khách hàng ", 
            dataIndex: "username", 
            key: "username", 
            render: (text) => <Text strong type="secondary">#{text}</Text>
        },
           { 
            title: " Thuộc công ty (nếu có) ", 
            dataIndex: "companyName", 
            key: "companyName", 
            render: (text) => <Text strong type="secondary">#{text}</Text>
        },
        { 
            title: "Trạng thái", 
            dataIndex: "status", 
            key: "status", 
            render: getContractStatusTag 
        },
        { title: "Địa chỉ đi", dataIndex: "startLocation", key: "startLocation" },
        { title: "Địa chỉ đến", dataIndex: "endLocation", key: "endLocation" },
        { 
            title: "Tiền cọc", 
            dataIndex: "depositAmount", 
            key: "depositAmount",
            render: formatCurrency,
            align: 'right'
        },
        { 
            title: "Tổng cộng", 
            dataIndex: "totalPrice", 
            key: "totalPrice",
            render: (price) => <Text strong type="success">{formatCurrency(price)}</Text>,
            align: 'right'
        },
        { 
            title: "Hành động",
            key: "action",
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => openEditModal(record)}
                        style={{ borderRadius: 6 }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm 
                        title="Xác nhận xóa hợp đồng?" 
                        onConfirm={() => deleteContract(record.contractId)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger icon={<DeleteOutlined />} style={{ borderRadius: 6 }}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];


    return (
        <div style={{ padding: 24, backgroundColor: '#f0f2f5' }}>
            <Title level={3} style={{ marginBottom: 20 }}>
                <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                Quản lý Hợp đồng & Báo giá
            </Title>
            
            {/* Bảng Báo giá APPROVED */}
            <Card 
                title={<Title level={4}>Danh sách Báo giá đã duyệt</Title>}
                bordered={false}
                style={{ marginBottom: 40, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            >
                <Table
                    rowKey="quotationId"
                    dataSource={quotations}
                    columns={quotationColumns}
                    // Thêm style cho Table
                    style={{ borderRadius: 8, overflow: 'hidden' }}
                    expandable={{
                        expandedRowRender: record => (
                            <Table
                                rowKey="id"
                                dataSource={record.services}
                                columns={quotationServiceColumns}
                                pagination={false}
                                size="small"
                                bordered={false}
                                title={() => <Text strong>Chi tiết dịch vụ của báo giá #{record.quotationId}</Text>}
                            />
                        ),
                        // Thêm icon mở rộng hiện đại
                        expandIcon: ({ expanded, onExpand, record }) => (
                            <Button 
                                size="small" 
                                onClick={e => onExpand(record, e)} 
                                style={{ borderRadius: '50%' }}
                            >
                                {expanded ? '-' : '+'}
                            </Button>
                        )
                    }}
                />
            </Card>
            
            {/* Bảng Hợp đồng */}
            <Card 
                title={<Title level={4}>Danh sách Hợp đồng</Title>}
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            >
                <Table
                    rowKey="contractId"
                    dataSource={contracts}
                    columns={contractColumns}
                    style={{ borderRadius: 8, overflow: 'hidden' }}
                />
            </Card>

            {/* Modal tạo hợp đồng */}
            <Modal
                open={!!creatingContract}
                title={<Title level={4}>Tạo hợp đồng từ Báo giá #{creatingContract?.quotationId}</Title>}
                onCancel={() => setCreatingContract(null)}
                footer={[
                    <Button key="back" onClick={() => setCreatingContract(null)}>Hủy</Button>,
                    <Button key="submit" type="primary" onClick={async () => {
                        try {
                            const values = await createForm.validateFields();
                            await handleCreate(values);
                        } catch (error) {
                            // Bỏ qua lỗi validate của antd
                            if (error.errorFields) return;
                            console.error(error);
                        }
                    }}>Tạo Hợp đồng</Button>,
                ]}
            >
                <Form form={createForm} layout="vertical">
                    <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc!" }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="depositAmount" label="Tiền cọc (Đơn vị: đ)" rules={[{ required: true, message: "Vui lòng nhập số tiền cọc!" }]}>
                        <Input 
                            type="number" 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                        />
                    </Form.Item>
                    <Form.Item name="totalAmount" label="Tổng giá trị (Đơn vị: đ)" rules={[{ required: true, message: "Vui lòng nhập tổng giá trị!" }]}>
                        <Input 
                            type="number" 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                            readOnly
                        />
                    </Form.Item>

                    {creatingContract?.services && (
                        <Table
                            rowKey="id"
                            dataSource={creatingContract.services}
                            columns={quotationServiceColumns}
                            pagination={false}
                            size="small"
                            bordered={true} // Thêm viền cho sub-table
                            title={() => <Text strong>Chi tiết dịch vụ</Text>}
                            style={{ marginTop: 16 }}
                        />
                    )}
                </Form>
            </Modal>

            {/* Modal sửa hợp đồng */}
            <Modal
                open={!!editingContract}
                title={<Title level={4}>Sửa Hợp đồng #{editingContract?.contractId}</Title>}
                onCancel={() => setEditingContract(null)}
                footer={[
                    <Button key="back" onClick={() => setEditingContract(null)}>Hủy</Button>,
                    <Button key="submit" type="primary" onClick={async () => {
                        try {
                            const values = await editForm.validateFields();
                            await handleUpdate(values);
                        } catch (error) {
                            // Bỏ qua lỗi validate của antd
                            if (error.errorFields) return;
                            console.error(error);
                        }
                    }}>Cập nhật</Button>,
                ]}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc!" }]}>
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item name="depositAmount" label="Tiền cọc (Đơn vị: đ)" rules={[{ required: true, message: "Vui lòng nhập số tiền cọc!" }]}>
                         <Input 
                            type="number" 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                        />
                    </Form.Item>
                    <Form.Item name="totalAmount" label="Tổng giá trị (Đơn vị: đ)" rules={[{ required: true, message: "Vui lòng nhập tổng giá trị!" }]}>
                         <Input 
                            type="number" 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default QuotationContractList;