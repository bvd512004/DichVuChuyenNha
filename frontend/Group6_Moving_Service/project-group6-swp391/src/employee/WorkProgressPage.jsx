import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Card,
  Button,
  Input,
  Tag,
  Space,
  Typography,
  Spin,
  Alert,
  message,
  Modal,
  Form,
  Upload,
  Image,
} from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  TrophyOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  WarningOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import workProgressApi from "../service/workprogress";
import damageApi from "../service/damage";
import "./style/WorkProgressPage.css";

const { Title } = Typography;

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const WorkProgressPage = () => {
  // ✅ Helper: Chuyển status sang tiếng Việt
  const getStatusText = (status) => {
    const statusMap = {
      pending_manager: "Chờ quản lý duyệt",
      pending_customer: "Chờ khách hàng duyệt",
      approved: "Đã duyệt",
      rejected: "Đã từ chối",
    };
    return statusMap[status] || status;
  };

  // ✅ Helper: Màu sắc cho tag status
  const getStatusColor = (status) => {
    const colorMap = {
      pending_manager: "blue",
      pending_customer: "gold",
      approved: "green",
      rejected: "red",
    };
    return colorMap[status] || "default";
  };
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDamageModalVisible, setIsDamageModalVisible] = useState(false);
  const [isViewDamageVisible, setIsViewDamageVisible] = useState(false);
  const [isEditDamageVisible, setIsEditDamageVisible] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [editingDamageId, setEditingDamageId] = useState(null);
  const [damageList, setDamageList] = useState([]);
  const [damageForm] = Form.useForm();

  const fetchProgressList = async () => {
    try {
      setLoading(true);
      const res = await workProgressApi.getMyList();
      setProgressList(res.data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách công việc.");
      message.error("Lỗi tải tiến độ, vui lòng đăng nhập lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressList();
  }, []);

  const fetchDamagesByContract = async (contractId) => {
    try {
      const res = await damageApi.getByContract(contractId);
      setDamageList(res.data || []);
    } catch (err) {
      console.error("Error fetching damages:", err);
      message.error("Không thể tải danh sách thiệt hại");
    }
  };

  const openDamageModal = (contractId) => {
    setSelectedContractId(contractId);
    setIsDamageModalVisible(true);
  };

  // ✅ Tạo thiệt hại mới → gửi cho quản lý duyệt trước
  const handleCreateDamage = async (values) => {
    try {
      const payload = {
        contractId: selectedContractId,
        cause: values.cause,
        cost: parseFloat(values.cost),
        imageUrl: values.imageUrl || null,
      };

      await damageApi.create(payload);
      message.success("✅ Tạo thiệt hại thành công, đang chờ quản lý duyệt!");
      setIsDamageModalVisible(false);
      damageForm.resetFields();
      fetchDamagesByContract(selectedContractId);
    } catch (err) {
      console.error("Error creating damage:", err);
      message.error("Không thể tạo thiệt hại");
    }
  };

  const openViewDamageModal = async (contractId) => {
    setSelectedContractId(contractId);
    await fetchDamagesByContract(contractId);
    setIsViewDamageVisible(true);
  };

  const openEditDamageModal = (damage) => {
    setEditingDamageId(damage.damageId);
    damageForm.setFieldsValue({
      cause: damage.cause,
      cost: damage.cost,
      imageUrl: damage.imageUrl,
    });
    setIsEditDamageVisible(true);
  };

  // ✅ Cập nhật lại thiệt hại → reset về pending_manager
  const handleEditDamage = async (values) => {
    try {
      await damageApi.update(editingDamageId, values);
      message.success("Đã cập nhật và gửi lại thiệt hại cho quản lý duyệt!");
      setIsEditDamageVisible(false);
      fetchDamagesByContract(selectedContractId);
    } catch (err) {
      message.error("Không thể cập nhật thiệt hại");
    }
  };

  const handleUpdateStatus = async (progressId, nextStatus) => {
    try {
      await workProgressApi.updateStatus(progressId, nextStatus);
      message.success(
        nextStatus === "in_progress"
          ? "🚀 Bắt đầu công việc!"
          : "✅ Hoàn thành công việc!"
      );
      fetchProgressList();
    } catch (err) {
      console.error("Error updating status:", err);
      message.error("Không thể cập nhật trạng thái công việc!");
    }
  };

  const renderStatus = (status) => {
    const statusMap = {
      pending: { color: "orange", icon: <ClockCircleOutlined />, text: "Đang chờ" },
      in_progress: { color: "blue", icon: <SyncOutlined spin />, text: "Đang thực hiện" },
      completed: { color: "green", icon: <CheckCircleOutlined />, text: "Hoàn thành" },
    };
    const s = statusMap[status] || statusMap.pending;
    return (
      <Tag icon={s.icon} color={s.color}>
        {s.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Khách Hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
    },
    {
      title: "Dịch Vụ",
      dataIndex: "serviceName",
      key: "serviceName",
      width: 150,
    },
    {
      title: "Ngày Bắt Đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: "Ngày Kết Thúc",
      dataIndex: "endDate",
      key: "endDate",
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: "Nhân Viên",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 130,
    },
    {
      title: "Công Việc",
      dataIndex: "taskDescription",
      key: "taskDescription",
      width: 200,
    },
    {
      title: "Trạng Thái",
      dataIndex: "progressStatus",
      key: "progressStatus",
      width: 150,
      render: (status) => renderStatus(status),
    },
    {
      title: "Hành Động",
      key: "action",
      width: 380,
      render: (_, record) => {
        const status = record.progressStatus;
        return (
          <Space>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => openDamageModal(record.contractId)}
            >
              Tạo Thiệt Hại
            </Button>

            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => openViewDamageModal(record.contractId)}
            >
              Xem Thiệt Hại
            </Button>

            {status === "pending" && (
              <Button
                type="default"
                icon={<SyncOutlined />}
                onClick={() => handleUpdateStatus(record.progressId, "in_progress")}
              >
                Bắt đầu
              </Button>
            )}

            {status === "in_progress" && (
              <Button
                type="primary"
                danger
                icon={<CheckCircleOutlined />}
                onClick={() => handleUpdateStatus(record.progressId, "completed")}
              >
                Hoàn thành
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  if (loading)
    return (
      <div className="loading-container">
        <Spin size="large" tip="⏳ Đang tải dữ liệu..." />
      </div>
    );

  if (error)
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: 24 }}
      />
    );

  return (
    <div className="work-progress-page">
      <div className="page-header">
        <Title level={2}>
          <TrophyOutlined /> Tiến Độ Công Việc
        </Title>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchProgressList}
          loading={loading}
        >
          Làm Mới
        </Button>
      </div>

      <Card className="table-card">
        <Title level={4}>Chi Tiết Công Việc</Title>
        <Table
          dataSource={progressList}
          columns={columns}
          rowKey="progressId"
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal: Tạo thiệt hại */}
      <Modal
        title="Tạo Báo Cáo Thiệt Hại"
        open={isDamageModalVisible}
        onCancel={() => setIsDamageModalVisible(false)}
        onOk={() => damageForm.submit()}
        okText="Gửi"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={damageForm} onFinish={handleCreateDamage}>
          <Form.Item name="imageUrl" hidden>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            label="Nguyên Nhân"
            name="cause"
            rules={[{ required: true, message: "Vui lòng nhập nguyên nhân!" }]}
          >
            <Input.TextArea rows={3} placeholder="Miêu tả thiệt hại..." />
          </Form.Item>

          <Form.Item
            label="Chi Phí Đền Bù (₫)"
            name="cost"
            rules={[{ required: true, message: "Vui lòng nhập chi phí!" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item label="Hình Ảnh Minh Chứng">
            <Upload
              name="file"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={async (info) => {
                const file = info.file;
                if (!file) return;

                const formData = new FormData();
                formData.append("file", file);

                try {
                  const res = await axios.post(
                    "http://localhost:8080/api/damages/upload",
                    formData,
                    {
                      headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                    }
                  );

                  damageForm.setFieldValue("imageUrl", res.data);
                  message.success("Ảnh đã được tải lên thành công!");
                } catch (err) {
                  console.error("Error uploading:", err);
                  message.error("Không thể tải ảnh lên!");
                }
              }}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải Ảnh</div>
              </div>
            </Upload>

            {damageForm.getFieldValue("imageUrl") && (
              <div style={{ marginTop: 10 }}>
                <Image
                  src={damageForm.getFieldValue("imageUrl")}
                  alt="Preview"
                  width="100%"
                  height={200}
                  style={{ objectFit: "contain", borderRadius: 8 }}
                />
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Xem Thiệt Hại */}
      <Modal
        title="Danh Sách Thiệt Hại"
        open={isViewDamageVisible}
        onCancel={() => setIsViewDamageVisible(false)}
        footer={null}
        width={700}
      >
        {damageList.length === 0 ? (
          <Alert message="Không có thiệt hại nào cho hợp đồng này" type="info" showIcon />
        ) : (
          damageList.map((dmg) => (
            <Card
              key={dmg.damageId}
              title={
                <>
                  <WarningOutlined /> {dmg.cause}
                </>
              }
              style={{ marginBottom: "12px" }}
              extra={
                dmg.status === "rejected" && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => openEditDamageModal(dmg)}
                  >
                    Chỉnh sửa
                  </Button>
                )
              }
            >
              <p>💰 <b>Chi Phí:</b> {dmg.cost?.toLocaleString("vi-VN")} ₫</p>
              <p>👷 <b>Nhân Viên:</b> {dmg.employeeName}</p>
              <p>
                🏷️ <b>Trạng Thái:</b>{" "}
                <Tag color={getStatusColor(dmg.status)}>
                  {getStatusText(dmg.status)}
                </Tag>
              </p>

              {(dmg.customerFeedback || dmg.managerFeedback) && (
                <div
                  style={{
                    marginTop: 10,
                    background: "#fafafa",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #eaeaea",
                  }}
                >
                  {dmg.managerFeedback && (
                    <p style={{ color: dmg.status === "rejected" ? "#d4380d" : "#1677ff", marginBottom: 6 }}>
                      🧑‍💼 <b>Phản hồi quản lý:</b>{" "}
                      {dmg.managerFeedback.includes("duyệt") ? "✅ " : "❌ "}
                      {dmg.managerFeedback}
                    </p>
                  )}

                  {dmg.customerFeedback && (
                    <p style={{ color: dmg.status === "rejected" ? "#cf1322" : "#52c41a", marginBottom: 0 }}>
                      💬 <b>Phản hồi khách hàng:</b>{" "}
                      {dmg.customerFeedback.includes("đồng ý") ? "✅ " : "❌ "}
                      {dmg.customerFeedback}
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </Modal>

      {/* Modal: Chỉnh sửa thiệt hại */}
      <Modal
        title="Chỉnh Sửa Thiệt Hại"
        open={isEditDamageVisible}
        onCancel={() => setIsEditDamageVisible(false)}
        onOk={() => damageForm.submit()}
      >
        <Form layout="vertical" form={damageForm} onFinish={handleEditDamage}>
          <Form.Item label="Nguyên Nhân" name="cause" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Chi Phí (₫)" name="cost" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Link Ảnh" name="imageUrl">
            <Input placeholder="URL hình ảnh (tùy chọn)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkProgressPage;