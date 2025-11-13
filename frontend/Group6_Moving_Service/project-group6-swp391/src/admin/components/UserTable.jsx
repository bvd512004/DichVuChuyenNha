import React from "react";
import { Table, Button, Badge, Space, Avatar, Popconfirm, message, Tag } from "antd";
import { EditOutlined, DeleteOutlined, ClockCircleOutlined, UserOutlined } from "@ant-design/icons";
import { adminApi } from "../../service/adminApi";

export default function UserTable({ users, roles, onEdit, onViewHistory, refetchUsers }) {
    const handleDelete = async (userId) => {
        try {
            await adminApi.deleteUser(userId);
            message.success("Xóa thành công");
            refetchUsers?.();
        } catch {
            message.error("Xóa thất bại");
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "userId",
            key: "userId",
            width: 80,
            sorter: (a, b) => a.userId - b.userId,
        },
        {
            title: "Người Dùng",
            key: "user",
            width: 200,
            render: (_, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.username}</div>
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>{record.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 200,
        },
        {
            title: "Số Điện Thoại",
            dataIndex: "phone",
            key: "phone",
            width: 150,
        },
        {
            title: "Vai Trò",
            key: "role",
            width: 150,
            render: (_, record) => {
                const role = roles.find((r) => r.roleId === record.roleId);
                const roleName = role?.roleName || "Unknown";
                const colorMap = {
                    admin: "red",
                    manager: "orange",
                    employee: "blue",
                    customer: "green",
                    customer_individual: "cyan",
                    customer_enterprise: "purple",
                };
                return (
                    <Tag color={colorMap[roleName?.toLowerCase()] || "default"}>
                        {roleName}
                    </Tag>
                );
            },
        },
        {
            title: "Hành Động",
            key: "action",
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => onEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa người dùng này?"
                        description="Bạn có chắc chắn muốn xóa người dùng này không?"
                        onConfirm={() => handleDelete(record.userId)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                    <Button
                        icon={<ClockCircleOutlined />}
                        size="small"
                        onClick={() => onViewHistory(record)}
                    >
                        Lịch Sử
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={users}
            rowKey="userId"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} người dùng`,
                showQuickJumper: true,
                pageSizeOptions: ["10", "20", "50", "100"],
            }}
            scroll={{ x: 1000 }}
            bordered
        />
    );
}
