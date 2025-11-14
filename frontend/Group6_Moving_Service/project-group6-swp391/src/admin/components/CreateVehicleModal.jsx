import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Select, message } from "antd";
import { adminApi } from "../../service/adminApi";

const { Item } = Form;

export default function CreateVehicleModal({ open, onCancel, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await adminApi.createVehicle(values);
            message.success("Tạo xe thành công!");
            form.resetFields();
            onSuccess?.();
            onCancel();
        } catch (err) {
            if (err.errorFields) {
                return; // Validation errors
            }
            message.error(err.response?.data?.message || "Tạo xe thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Thêm Xe Mới"
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Thêm"
            cancelText="Hủy"
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    status: "AVAILABLE",
                }}
            >
                <Item
                    name="vehicleType"
                    label="Loại Xe"
                    rules={[{ required: true, message: "Vui lòng nhập loại xe" }]}
                >
                    <Input placeholder="Ví dụ: Xe tải 1.5 tấn, Xe tải 3.5 tấn..." />
                </Item>

                <Item
                    name="licensePlate"
                    label="Biển Số Xe"
                    rules={[
                        { required: true, message: "Vui lòng nhập biển số xe" },
                        { pattern: /^[0-9]{2}[A-Z]{1,2}[0-9]{4,5}$/, message: "Biển số không hợp lệ (VD: 30A12345)" }
                    ]}
                >
                    <Input placeholder="Ví dụ: 30A12345" style={{ textTransform: "uppercase" }} />
                </Item>

                <Item
                    name="capacity"
                    label="Sức Chứa (Tấn)"
                    rules={[
                        { required: true, message: "Vui lòng nhập sức chứa" },
                        { type: "number", min: 0.1, message: "Sức chứa phải lớn hơn 0" }
                    ]}
                >
                    <InputNumber
                        placeholder="Ví dụ: 1.5, 3.5, 5.0"
                        style={{ width: "100%" }}
                        min={0.1}
                        step={0.1}
                        precision={1}
                    />
                </Item>

                <Item
                    name="status"
                    label="Trạng Thái"
                    rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                >
                    <Select placeholder="Chọn trạng thái">
                        <Select.Option value="AVAILABLE">Khả Dụng</Select.Option>
                        <Select.Option value="BUSY">Đang Sử Dụng</Select.Option>
                        <Select.Option value="MAINTENANCE">Bảo Trì</Select.Option>
                    </Select>
                </Item>
            </Form>
        </Modal>
    );
}
