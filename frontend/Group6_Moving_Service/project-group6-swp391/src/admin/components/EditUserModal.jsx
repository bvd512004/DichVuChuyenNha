import React from "react";
import { Modal } from "react-bootstrap";
import { Form as AntForm, Input, Select, Button, message } from "antd";
import { adminApi } from "../../service/adminApi";

export default function EditUserModal({ user, roles, onHide, onSuccess }) {
    const [form] = AntForm.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!values.password?.trim()) delete values.password;
            await adminApi.updateUser(user.userId, values);
            message.success("Cập nhật thành công");
            onSuccess?.();
            onHide();
        } catch (err) {
            message.error(err.response?.data?.message || "Cập nhật thất bại");
        }
    };

    const roleId = roles.find((r) => r.roleName === user.roleName)?.roleId;

    return (
        <Modal centered show onHide={onHide} dialogClassName="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Sửa User</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <AntForm form={form} layout="vertical" onFinish={handleSubmit} initialValues={{
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    roleId: roleId || undefined,
                }}>
                    <AntForm.Item name="username" label="Username" rules={[{ required: true }]}>
                        <Input />
                    </AntForm.Item>
                    <AntForm.Item name="email" label="Email" rules={[{ type: "email" }]}>
                        <Input />
                    </AntForm.Item>
                    <AntForm.Item name="phone" label="Số điện thoại">
                        <Input />
                    </AntForm.Item>
                    <AntForm.Item name="roleId" label="Role" rules={[{ required: true }]}>
                        <Select placeholder="Chọn role">
                            {roles.map((r) => (
                                <Select.Option key={r.roleId} value={r.roleId}>
                                    {r.roleName}
                                </Select.Option>
                            ))}
                        </Select>
                    </AntForm.Item>
                    <AntForm.Item name="password" label="Password (để trống nếu không đổi)">
                        <Input.Password />
                    </AntForm.Item>
                    <AntForm.Item>
                        <Button type="primary" htmlType="submit" block style={{ height: 40 }}>
                            Lưu
                        </Button>
                    </AntForm.Item>
                </AntForm>
            </Modal.Body>
        </Modal>
    );
}