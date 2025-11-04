import React from "react";
import { Modal } from "react-bootstrap";
import { Form, Input, Select, Button, message } from "antd";
import { adminApi } from "../../service/adminApi";

const { Item } = Form;

export default function EditUserModal({ user, roles, onHide, onSuccess }) {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // Xóa password nếu không nhập
            if (!values.password?.trim()) {
                delete values.password;
            }
            await adminApi.updateUser(user.userId, values);
            message.success("Cập nhật thành công!");
            onSuccess?.();
            onHide();
        } catch (err) {
            message.error(err.response?.data?.message || "Cập nhật thất bại");
        }
    };

    // DÙNG TRỰC TIẾP user.roleId (từ API)
    const initialRoleId = user.roleId;

    return (
        <Modal centered show onHide={onHide} dialogClassName="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Sửa Người Dùng</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        username: user.username,
                        email: user.email,
                        phone: user.phone,
                        roleId: initialRoleId,
                    }}
                >
                    <Item
                        name="username"
                        label="Username"
                        rules={[{ required: true, message: "Vui lòng nhập username" }]}
                    >
                        <Input />
                    </Item>

                    <Item
                        name="email"
                        label="Email"
                        rules={[{ type: "email", message: "Email không hợp lệ" }]}
                    >
                        <Input />
                    </Item>

                    <Item name="phone" label="Số điện thoại">
                        <Input />
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

                    <Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            style={{ height: 40, fontWeight: 600 }}
                        >
                            Lưu thay đổi
                        </Button>
                    </Item>
                </Form>
            </Modal.Body>
        </Modal>
    );
}