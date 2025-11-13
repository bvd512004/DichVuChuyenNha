import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { adminApi } from "../../service/adminApi";

const { Item } = Form;

export default function EditUserModal({ open, onCancel, user, roles, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && open) {
            form.setFieldsValue({
                username: user.username,
                email: user.email,
                phone: user.phone,
                roleId: user.roleId,
            });
        }
    }, [user, open, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            // Xóa password nếu không nhập
            if (!values.password?.trim()) {
                delete values.password;
            }
            await adminApi.updateUser(user.userId, values);
            message.success("Cập nhật thành công!");
            form.resetFields();
            onSuccess?.();
            onCancel();
        } catch (err) {
            if (err.errorFields) {
                return; // Validation errors
            }
            message.error(err.response?.data?.message || "Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    if (!user) return null;

    return (
        <Modal
            title="Sửa Người Dùng"
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu"
            cancelText="Hủy"
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: "Vui lòng nhập username" }]}
                >
                    <Input placeholder="Nhập username" />
                </Item>

                <Item
                    name="email"
                    label="Email"
                    rules={[{ type: "email", message: "Email không hợp lệ" }]}
                >
                    <Input placeholder="Nhập email" />
                </Item>

                <Item name="phone" label="Số điện thoại">
                    <Input placeholder="Nhập số điện thoại" />
                </Item>

                <Item
                    name="roleId"
                    label="Vai trò"
                    rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                >
                    <Select placeholder="Chọn vai trò">
                        {roles.map((r) => (
                            <Select.Option key={r.roleId} value={r.roleId}>
                                {r.roleName}
                            </Select.Option>
                        ))}
                    </Select>
                </Item>

                <Item name="password" label="Mật khẩu mới (để trống nếu không đổi)">
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                </Item>
            </Form>
        </Modal>
    );
}
