import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message } from "antd";
import axios from "axios";

const VehiclesCRUD = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);

    const token = localStorage.getItem("token");

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8080/api/vehicles", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVehicles(res.data);
        } catch (err) {
            console.error(err);
            message.error("Failed to fetch vehicles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleSubmit = async (values) => {
        try {
            if (editingId) {
                await axios.put(
                    `http://localhost:8080/api/vehicles/${editingId}`,
                    values,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                message.success("Updated successfully");
            } else {
                await axios.post("http://localhost:8080/api/vehicles", values, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                message.success("Created successfully");
            }
            setModalVisible(false);
            form.resetFields();
            setEditingId(null);
            fetchVehicles();
        } catch (err) {
            console.error(err);
            message.error("Operation failed");
        }
    };

    const handleEdit = (record) => {
        form.setFieldsValue(record);
        setEditingId(record.vehicleId);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/vehicles/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success("Deleted successfully");
            fetchVehicles();
        } catch (err) {
            console.error(err);
            message.error("Delete failed");
        }
    };

    const columns = [
        { title: "ID", dataIndex: "vehicleId" },
        { title: "Type", dataIndex: "vehicleType" },
        { title: "Plate", dataIndex: "licensePlate" },
        { title: "Capacity", dataIndex: "capacity" },
        { title: "Status", dataIndex: "status" },
        {
            title: "Action",
            render: (_, record) => (
                <>
                    <Button onClick={() => handleEdit(record)}>Edit</Button>
                    <Button danger onClick={() => handleDelete(record.vehicleId)}>
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" onClick={() => setModalVisible(true)}>
                Add Vehicle
            </Button>
            <Table
                columns={columns}
                dataSource={vehicles}
                loading={loading}
                rowKey="vehicleId"
            />

            <Modal
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="vehicleType"
                        label="Type"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="licensePlate"
                        label="Plate"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="capacity"
                        label="Capacity"
                        rules={[{ required: true }]}
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="quotationId" label="Quotation ID">
                        <InputNumber />
                    </Form.Item>
                    <Form.Item name="driverId" label="Driver ID">
                        <InputNumber />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default VehiclesCRUD;
