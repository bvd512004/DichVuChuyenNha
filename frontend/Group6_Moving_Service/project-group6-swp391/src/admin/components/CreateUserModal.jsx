import React, { useState } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { adminApi } from "../../service/adminApi";

const { Item } = Form;
const EMPLOYEE_POSITIONS = ["Worker", "Driver", "Surveyer"];

export default function CreateUserModal({ open, onCancel, roles, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isEmployee, setIsEmployee] = useState(false);

    const onRoleChange = (roleId) => {
        const role = roles.find(r => r.roleId === roleId);
        const employee = role?.roleName?.toLowerCase() === "employee";
        setIsEmployee(employee);
        if (!employee) form.setFieldsValue({ position: undefined });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const payload = { ...values };
            if (!isEmployee) delete payload.position;

            if (isEmployee) {
                await adminApi.createEmployee(payload);
            } else {
                await adminApi.createAdmin(payload);
            }

            message.success("Tạo tài khoản thành công!");
            form.resetFields();
            onSuccess?.();
            onCancel();
        } catch (err) {
            if (err.errorFields) {
                return; // Validation errors
            }
            message.error(err.response?.data?.message || "Tạo tài khoản thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setIsEmployee(false);
        onCancel();
    };

    return (
        <Modal
            title="Tạo Người Dùng Mới"
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Tạo"
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
                    rules={[{ required: true, message: "Username không được để trống" }]}
                >
                    <Input placeholder="Nhập username" />
                </Item>

                <Item
                    name="password"
                    label="Password"
                    rules={[
                        { required: true, message: "Password không được để trống" },
                        { min: 6, message: "Password ít nhất 6 ký tự" },
                    ]}
                >
                    <Input.Password placeholder="Nhập password" />
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
                    <Select
                        placeholder={roles.length === 0 ? "Đang tải roles..." : "Chọn vai trò"}
                        onChange={onRoleChange}
                        disabled={roles.length === 0}
                    >
                        {roles.map(r => (
                            <Select.Option key={r.roleId} value={r.roleId}>
                                {r.roleName}
                            </Select.Option>
                        ))}
                    </Select>
                </Item>

                {isEmployee && (
                    <Item
                        name="position"
                        label="Vị trí công việc"
                        rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
                    >
                        <Select placeholder="Chọn vị trí">
                            {EMPLOYEE_POSITIONS.map(p => (
                                <Select.Option key={p} value={p}>{p}</Select.Option>
                            ))}
                        </Select>
                    </Item>
                )}
            </Form>
        </Modal>
    );
}
