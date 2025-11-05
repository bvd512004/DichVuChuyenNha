import React from "react";
import { Table, Button, Badge } from "react-bootstrap";
import { Popconfirm, message } from "antd";
import { FiEdit, FiTrash2, FiClock } from "react-icons/fi";
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

    return (
        <Table striped bordered hover responsive>
            <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user.userId}>
                        <td>{user.userId}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                            <Badge bg="info">
                                {roles.find((r) => r.roleId === user.roleId)?.roleName || "Unknown"}
                            </Badge>
                        </td>
                        <td>
                            <Button size="sm" variant="outline-primary" onClick={() => onEdit(user)}>
                                <FiEdit />
                            </Button>{" "}
                            <Popconfirm
                                title="Xóa user này?"
                                onConfirm={() => handleDelete(user.userId)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button size="sm" variant="outline-danger">
                                    <FiTrash2 />
                                </Button>
                            </Popconfirm>{" "}
                            <Button size="sm" variant="outline-secondary" onClick={() => onViewHistory(user)}>
                                <FiClock />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}