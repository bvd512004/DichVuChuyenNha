import React, { useEffect, useState } from "react";
import { Table, Button, message, Tag } from "antd";
import axiosInstance from "../service/axiosInstance";
import AddServiceModal from "./AddServiceModal";
import dayjs from "dayjs";

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
        let color = 'default';
        let text = status;

        switch (status) {
            case 'DRAFT':
                color = 'warning'; // Màu cam cho bản nháp
                text = 'Bản nháp';
                break;
            case 'REVIEW':
        
                color = 'geekblue'; // Màu xanh dương cho đang chờ/xem xét
                text = 'Đang xem xét từ quản lí bộ phận ';
                break;
            case 'PENDING':
                color = 'processing';
                text = 'Chờ sự đồng ý từ khách hàng';
                break;
            case 'APPROVED':
                color = 'green';
                text = 'Đã chấp thuận';
                break;
            case 'REJECTED':
                color = 'error';
                text = 'Đã từ chối';
                break;
            case 'CREATED':
                color = 'magenta';
                text = 'Đã tạo HĐ';
                break;
            default:
                color = 'default';
                text = status;
        }

        return <Tag color={color} style={{ borderRadius: 4, fontWeight: 'bold' }}>{text}</Tag>;
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
                const isEditable = record.status === "DRAFT" || record.status === "REVIEW" || record.status === "PENDING";
                
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