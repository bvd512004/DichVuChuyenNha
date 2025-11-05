// src/admin/components/CreateUserForm.jsx
import React, { useState } from "react";
import { Form, Input, Select, Button, message } from "antd";
import { adminApi } from "../../service/adminApi";

const { Item } = Form;
const EMPLOYEE_POSITIONS = ["Worker", "Driver", "Surveyer"];

export default function CreateUserForm({ roles, onSuccess }) {
    const [form] = Form.useForm();
    const [isEmployee, setIsEmployee] = useState(false);

    // Khi chọn role → quyết định hiển thị Position
    const onRoleChange = (roleId) => {
        const role = roles.find(r => r.roleId === roleId);
        const employee = role?.roleName?.toLowerCase() === "employee";
        setIsEmployee(employee);
        if (!employee) form.setFieldsValue({ position: undefined });
    };

    const onFinish = async (values) => {
        try {
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
        } catch (err) {
            message.error(err.response?.data?.message || "Tạo tài khoản thất bại");
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* Username */}
            <Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Username không được để trống" }]}
            >
                <Input />
            </Item>

            {/* Password */}
            <Item
                name="password"
                label="Password"
                rules={[
                    { required: true, message: "Password không được để trống" },
                    { min: 6, message: "Password ít nhất 6 ký tự" },
                ]}
            >
                <Input.Password />
            </Item>

            {/* Email */}
            <Item
                name="email"
                label="Email"
                rules={[{ type: "email", message: "Email không hợp lệ" }]}
            >
                <Input />
            </Item>

            {/* Phone */}
            <Item name="phone" label="Số điện thoại">
                <Input />
            </Item>

            {/* Role */}
            <Item
                name="roleId"
                label="Role"
                rules={[{ required: true, message: "Vui lòng chọn Role" }]}
            >
                <Select
                    placeholder={roles.length === 0 ? "Đang tải roles..." : "Chọn role"}
                    onChange={onRoleChange}
                    disabled={roles.length === 0}
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}  // ✅ Fix: Render dropdown inside modal
                >
                    {roles.map(r => (
                        <Select.Option key={r.roleId} value={r.roleId}>
                            {r.roleName}
                        </Select.Option>
                    ))}
                </Select>
            </Item>

            {/* Position – chỉ hiện khi role = EMPLOYEE */}
            {isEmployee && (
                <Item
                    name="position"
                    label="Vị trí công việc"
                    rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
                >
                    <Select
                        placeholder="Chọn vị trí"
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}  // ✅ Fix: Same for this Select
                    >
                        {EMPLOYEE_POSITIONS.map(p => (
                            <Select.Option key={p} value={p}>{p}</Select.Option>
                        ))}
                    </Select>
                </Item>
            )}

            {/* Submit */}
            <Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    style={{ height: 40, fontWeight: 600 }}
                >
                    Tạo tài khoản
                </Button>
            </Item>
        </Form>
    );
}