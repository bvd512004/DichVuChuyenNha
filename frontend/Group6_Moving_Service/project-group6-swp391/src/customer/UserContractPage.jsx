import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Spin,
  Empty,
  Typography,
  Space,
  Checkbox,
  message,
  Card,
  List,
} from "antd";
import { FileProtectOutlined, SignatureOutlined } from "@ant-design/icons";
import axiosInstance from "../service/axiosInstance";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const UserContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signing, setSigning] = useState(false);

  // Hàm tải danh sách hợp đồng
  const fetchContracts = async () => {
    setLoading(true);
    try {
      // axiosInstance tự động thêm token
      const res = await axiosInstance.get("/contracts/unsigned/me");
      // Cẩn thận với cấu trúc data trả về từ API
      const data = res.data?.result || res.data;
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách hợp đồng.");
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Hàm ký hợp đồng
  const handleSign = async (contractId) => {
    if (!agreeTerms) {
      message.warning("Bạn cần đồng ý với điều khoản trước khi ký!");
      return;
    }

    setSigning(true);
    try {
      // Đảm bảo endpoint PUT là chính xác
      await axiosInstance.put(`/contracts/sign/${contractId}`);

      message.success("✅ Ký hợp đồng thành công!");
      // Cập nhật state bằng cách lọc bỏ hợp đồng vừa ký
      setContracts((prev) => prev.filter((c) => c.contractId !== contractId));
      setSelectedContract(null);
      setAgreeTerms(false);
    } catch (err) {
      console.error(err);
      message.error("❌ Ký hợp đồng thất bại!");
    } finally {
      setSigning(false);
    }
  };

  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "contractId",
      key: "contractId",
      width: 100,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY") : "-"),
      width: 120,
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (text) => (text ? dayjs(text).format("DD/MM/YYYY") : "-"),
      width: 120,
    },
    {
      title: "Địa điểm chuyển",
      dataIndex: "startLocation",
      key: "location",
      ellipsis: true,
      render: (_v, record) => `${record.startLocation} → ${record.endLocation}`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      width: 120,
      render: (amount) => (
        <Text strong type="danger">
          {amount?.toLocaleString("vi-VN") + " ₫"}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          danger
          onClick={() => {
            setSelectedContract(record);
            setAgreeTerms(false);
          }}
          icon={<FileProtectOutlined />}
        >
          Xem & Ký
        </Button>
      ),
    },
  ];

  // --- JSX cho phần nội dung chính ---

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          minHeight: "300px",
        }}
      >
        <Spin size="large" tip="Đang tải hợp đồng chờ ký..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "0px 10px" }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        ✍️ Hợp đồng chờ ký
      </Title>

      {!contracts.length ? (
        <Empty
          description={
            <Text type="secondary">
              Bạn không có hợp đồng nào đang chờ ký kết.
            </Text>
          }
          style={{ padding: "50px 0" }}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="contractId"
          pagination={{ pageSize: 5, showSizeChanger: false }}
          bordered
        />
      )}

      {/* Modal chi tiết hợp đồng */}
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết hợp đồng #{selectedContract?.contractId}
          </Title>
        }
        open={!!selectedContract}
        onCancel={() => setSelectedContract(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedContract(null)}>
            Đóng
          </Button>,
          <Button
            key="sign"
            type="primary"
            danger
            icon={<SignatureOutlined />}
            loading={signing}
            disabled={!agreeTerms}
            onClick={() => handleSign(selectedContract?.contractId)}
          >
            {signing ? "Đang ký..." : "Ký hợp đồng điện tử"}
          </Button>,
        ]}
        width={900}
      >
        {selectedContract && (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card type="inner" title="Thông tin chung">
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <Text>
                  <strong>Ngày bắt đầu:</strong>{" "}
                  {dayjs(selectedContract.startDate).format("DD/MM/YYYY")}
                </Text>
                <Text>
                  <strong>Ngày kết thúc:</strong>{" "}
                  {dayjs(selectedContract.endDate).format("DD/MM/YYYY")}
                </Text>
                <Text>
                  <strong>Tiền cọc:</strong>{" "}
                  <Text strong>
                    {selectedContract.depositAmount?.toLocaleString("vi-VN")} ₫
                  </Text>
                </Text>
                <Text>
                  <strong>Tổng tiền hợp đồng:</strong>{" "}
                  <Text strong type="danger">
                    {selectedContract.totalAmount?.toLocaleString("vi-VN")} ₫
                  </Text>
                </Text>
                <Text>
                  <strong>Địa điểm:</strong> {selectedContract.startLocation} →{" "}
                  {selectedContract.endLocation}
                </Text>
                <Text>
                  <strong>Trạng thái:</strong>{" "}
                  <Text type="warning">
                    {selectedContract.status || "Chưa ký"}
                  </Text>
                </Text>
              </Space>
            </Card>

            <Card title="Chi tiết dịch vụ">
              {selectedContract.services?.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={selectedContract.services}
                  renderItem={(s, idx) => (
                    <List.Item
                      key={idx}
                      actions={[
                        <Text strong key="subtotal">
                          {s.subtotal?.toLocaleString("vi-VN")} ₫
                        </Text>,
                      ]}
                    >
                      <List.Item.Meta
                        title={s.serviceName}
                        description={`Loại giá: ${s.priceType} | Số lượng: ${s.quantity}`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">Không có dịch vụ nào được liệt kê.</Text>
              )}
            </Card>

            <div style={{ padding: "10px 0" }}>
              <Checkbox
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              >
                Tôi **đã đọc và đồng ý** với tất cả các điều khoản và điều kiện của hợp đồng này.
              </Checkbox>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default UserContractsPage;