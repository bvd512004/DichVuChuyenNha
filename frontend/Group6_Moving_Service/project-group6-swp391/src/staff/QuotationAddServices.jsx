import React, { useEffect, useState } from "react";
import { Table, Button, message, Tag, Space } from "antd";
import axiosInstance from "../service/axiosInstance";
import AddServiceModal from "./AddServiceModal";
import dayjs from "dayjs";

import { 
    FileTextOutlined,     // DRAFT
    ClockCircleOutlined,  // REVIEWED
    SendOutlined,         // PENDING
    CheckCircleOutlined,  // APPROVED
    CloseCircleOutlined,  // REJECTED
    FileDoneOutlined,     // CREATED
    StopOutlined          // CANCEL
} from "@ant-design/icons";
const QuotationAddServices = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [open, setOpen] = useState(false);

    const fetchQuotations = async () => {
        try {
            const res = await axiosInstance.get("/quotations/me");
            setQuotations(Array.isArray(res.data.result) ? res.data.result : res.data || []);
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi tải danh sách báo giá!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    // ✨ HÀM ÁNH XẠ TRẠNG THÁI (Đã sửa lỗi)
    const getStatusTag = (status) => {
    const config = {
        DRAFT: {
            color: "purple",
            icon: <FileTextOutlined />,
            text: "Bản nháp",
            description: "Chưa gửi duyệt"
        },
        REVIEWED: {
            color: "orange",
            icon: <ClockCircleOutlined />,
            text: "Chờ duyệt",
            description: "Quản lý đang xem xét"
        },
        PENDING: {
            color: "blue",
            icon: <SendOutlined />,
            text: "Đã gửi khách",
            description: "Chờ khách chấp thuận"
        },
        APPROVED: {
            color: "green",
            icon: <CheckCircleOutlined />,
            text: "Khách đã duyệt",
            description: "Thành công"
        },
        REJECTED: {
            color: "red",
            icon: <CloseCircleOutlined />,
            text: "Bị từ chối",
            description: "Cần chỉnh sửa lại"
        },
        CREATED: {
            color: "cyan",
            icon: <FileDoneOutlined />,
            text: "Đã tạo HĐ",
            description: "Hoàn tất"
        },
        CANCEL: {
            color: "default",
            icon: <StopOutlined />,
            text: "Đã hủy",
            description: "Đã bị hủy"
        }
    };

    const item = config[status] || { 
        color: "default", 
        icon: null, 
        text: status,
        description: ""
    };

    return (
        <Tag
            color={item.color}
            style={{
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                padding: "6px 12px",
                minWidth: 110,
                textAlign: "center",
                border: "none",
                boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
            }}
        >
            <Space size={4}>
                {item.icon && <span style={{ fontSize: 15 }}>{item.icon}</span>}
                <span>{item.text}</span>
            </Space>
        </Tag>
    );
};
    // ------------------------------------

    const columns = [
        { 
            title: "Mã báo giá", 
            dataIndex: "quotationId", 
            key: "id",
            render: (text) => <span style={{ fontWeight: 600, color: '#1890ff' }}>#{text}</span>
        },
        { 
            title: "Tổng giá", 
            dataIndex: "totalPrice", 
            key: "totalPrice",
            sorter: (a, b) => a.totalPrice - b.totalPrice,
            render: (price) => (
                <span style={{ fontWeight: 'bold', color: price > 0 ? '#52c41a' : '#999' }}>
                    {price ? price.toLocaleString() : 0} ₫
                </span>
            )
        },
        { 
            title: "Ngày tạo", 
            dataIndex: "createdDate",
            key: "createdDate",
            render: (date) => (
                <Tag color="blue" style={{ borderRadius: 12 }}>
                    {dayjs(date).format("DD/MM/YYYY")}
                </Tag>
            )
        },
        { 
            title: "Trạng thái", 
            dataIndex: "status", 
            key: "status",
            // ✨ THAY THẾ LOGIC RENDER CŨ BẰNG HÀM getStatusTag
            render: getStatusTag
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => {
                // ✨ CHỈ CHO PHÉP THÊM/SỬA DỊCH VỤ KHI Ở DRAFT, REVIEW, hoặc PENDING
                const isEditable =  record.status === "REVIEW" || record.status === "REJECTED";
                
                return (
                    <Button
                        type="primary"
                        disabled={!isEditable} // Vô hiệu hóa nếu không thể chỉnh sửa
                        style={{
                            borderRadius: 6,
                            transition: "all 0.3s",
                            opacity: isEditable ? 1 : 0.5, 
                            cursor: isEditable ? "pointer" : "not-allowed",
                        }}
                        onClick={() => {
                            if (isEditable) {
                                setSelectedQuotation(record);
                                setOpen(true);
                            } else {
                                message.warning(`Không thể thêm dịch vụ khi báo giá ở trạng thái: ${getStatusTag(record.status).props.children}`);
                            }
                        }}
                    >
                        Thêm dịch vụ
                    </Button>
                );
            },
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={quotations}
                rowKey="quotationId"
                loading={loading}
                style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
                rowClassName={() => 'quotation-row-hover'} 
                
            />
            
            <AddServiceModal
                open={open}
                quotation={selectedQuotation}
                onClose={() => setOpen(false)}
                onSuccess={fetchQuotations}
            />
        </>
    );
};

export default QuotationAddServices;
