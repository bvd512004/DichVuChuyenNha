import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Tabs,
  message,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import axios from "axios";
import moment from "moment"; // Import moment để format date
import CreateAdminUser from "./CreateAdminUser";
import VehiclesCRUD from "../vehicles/VehiclesPage"; // Import VehiclesCRUD component
const { TabPane } = Tabs;

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho modal edit
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [form] = Form.useForm();

  // State cho history
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false); // Loading riêng cho history
  const [userHistory, setUserHistory] = useState({
    requests: [],
    contracts: [],
    feedbacks: [],
  });
  const [selectedUser, setSelectedUser] = useState(null); // Để hiển thị tên user trong modal title

  const token = localStorage.getItem("token");

  // Lấy danh sách user
  const fetchUsers = () => {
    setLoading(true);
    axios
      .get("http://localhost:8080/api/users", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        setUsers(res.data.result); // ✅ vì backend trả ApiResponse
      })
      .catch((err) => {
        console.error(err);
        message.error("Không load được danh sách người dùng!");
      })
      .finally(() => setLoading(false));
  };

  // Fetch lịch sử của user
  const fetchHistory = async (userId) => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/users/${userId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserHistory({
        requests: res.data.requests,
        contracts: res.data.contracts,
        payments: res.data.payments,
        feedbacks: res.data.feedbacks,
        progress: res.data.progress
      });
    } catch (err) {
      console.error(err);
      message.error("Không tải được lịch sử!");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Mở modal sửa user
  const handleEdit = (user) => {
    setCurrentUser(user);
    form.setFieldsValue(user);
    setIsEditModalVisible(true);
  };

  // Submit sửa user
  const handleUpdateUser = () => {
    form.validateFields().then((values) => {
      axios
        .put(`http://localhost:8080/api/users/${currentUser.userId}`, values, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        .then(() => {
          message.success("Cập nhật người dùng thành công!");
          setIsEditModalVisible(false);
          fetchUsers();
        })
        .catch((err) => {
          console.error(err);
          message.error("Lỗi khi cập nhật người dùng!");
        });
    });
  };

  // Xóa user
  const handleDelete = (userId) => {
    axios
      .delete(`http://localhost:8080/api/users/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then(() => {
        message.success("Xóa người dùng thành công!");
        fetchUsers();
      })
      .catch((err) => {
        console.error(err);
        message.error("Lỗi khi xóa người dùng!");
      });
  };

  // Cấu hình bảng users
  const columns = [
    {
      title: "ID",
      dataIndex: "userId",
      key: "userId",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.userId)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
          <Button type="link" onClick={() => {
            setSelectedUser(record);
            fetchHistory(record.userId);
            setHistoryVisible(true);
          }}>
            Xem lịch sử
          </Button>
        </>
      ),
    },
  ];

  // Cấu hình columns cho requests trong history modal
  const requestColumns = [
    { title: "ID", dataIndex: "requestId", key: "requestId" },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestTime",
      key: "requestTime",
      render: (time) => moment(time).format("DD/MM/YYYY HH:mm"),
    },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
  ];

  // Cấu hình columns cho contracts trong history modal
  const contractColumns = [
    { title: "ID", dataIndex: "contractId", key: "contractId" },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    { title: "Tổng tiền", dataIndex: "totalAmount", key: "totalAmount" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
  ];

  // Cấu hình columns cho feedbacks trong history modal
  const feedbackColumns = [
    { title: "ID", dataIndex: "feedbackId", key: "feedbackId" },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (time) => moment(time).format("DD/MM/YYYY HH:mm"),
    },
    { title: "Bình luận", dataIndex: "comment", key: "comment" },
    { title: "Đánh giá", dataIndex: "rating", key: "rating" },
  ];

  return (
    <Card title="Admin Dashboard" style={{ margin: 20 }}>
      <Tabs defaultActiveKey="1">
        {/* Tab danh sách user */}
        <TabPane tab="Danh sách người dùng" key="1">
          <Table
            rowKey="userId"
            columns={columns}
            dataSource={users}
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </TabPane>

        {/* Tab tạo user */}
        <TabPane tab="Tạo người dùng" key="2">
          <CreateAdminUser onSuccess={fetchUsers} />
        </TabPane>

        {/* New Tab for Vehicles Management */}
        <TabPane tab="Quản lý phương tiện" key="3">
          <VehiclesCRUD />
        </TabPane>
      </Tabs>

      {/* Modal sửa user */}
      <Modal
        title="Sửa người dùng"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleUpdateUser}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Vui lòng nhập username" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="roleId" label="Role">
            <Select>
              <Select.Option value={1}>Admin</Select.Option>
              <Select.Option value={2}>Manager</Select.Option>
              <Select.Option value={3}>Employee</Select.Option>
              <Select.Option value={4}>Customer</Select.Option>
              <Select.Option value={5}>Customer Company</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem lịch sử */}
      <Modal
        title={`Lịch sử của user ${selectedUser?.username || ""}`}
        open={historyVisible}
        onCancel={() => {
          setHistoryVisible(false);
          setUserHistory({ requests: [], contracts: [], feedbacks: [] });
          setSelectedUser(null);
        }}
        footer={null}
        width={800}
      >
        <Tabs defaultActiveKey="requests">
          <TabPane tab="Requests" key="requests">
            <Table
              rowKey="requestId"
              columns={requestColumns}
              dataSource={userHistory.requests}
              loading={historyLoading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          <TabPane tab="Contracts" key="contracts">
            <Table
              rowKey="contractId"
              columns={contractColumns}
              dataSource={userHistory.contracts}
              loading={historyLoading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          <TabPane tab="Feedbacks" key="feedbacks">
            <Table
              rowKey="feedbackId"
              columns={feedbackColumns}
              dataSource={userHistory.feedbacks}
              loading={historyLoading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          <TabPane tab="Payments" key="payments">
            <Table
              rowKey="paymentId"
              columns={[
                { title: "ID", dataIndex: "paymentId" },
                { title: "Amount", dataIndex: "amount" },
                { title: "Date", dataIndex: "paymentDate", render: (date) => moment(date).format("DD/MM/YYYY") },
                { title: "Method", dataIndex: "method" },
                { title: "Status", dataIndex: "status" }
              ]}
              dataSource={userHistory.payments}
              loading={historyLoading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          <TabPane tab="Progress" key="progress">
            <Table
              rowKey="progressId"
              columns={[
                { title: "ID", dataIndex: "progressId" },
                { title: "Contract ID", dataIndex: "contractId" },
                { title: "Employee ID", dataIndex: "employeeId" },
                { title: "Task", dataIndex: "taskDescription" },
                { title: "Status", dataIndex: "progressStatus" },
                { title: "Updated", dataIndex: "updatedAt", render: (time) => moment(time).format("DD/MM/YYYY HH:mm") }
              ]}
              dataSource={userHistory.progress}
              loading={historyLoading}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
        </Tabs>
      </Modal>
    </Card>
  );
}