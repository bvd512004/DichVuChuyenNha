import React from "react";
import { Table, Button, Tag, Popconfirm, Space } from "antd";
import { EditOutlined, DeleteOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export const SurveyList = ({ surveys, loading, onEdit, onDelete, onCreateQuotation }) => {
  const columns = [
    { title: "ID", dataIndex: "surveyId", key: "surveyId" },
    { title: "Khách hàng", dataIndex: "username" },
    { title: "Công ty", dataIndex: "companyName" },
    { title: "Địa chỉ từ", dataIndex: "addressFrom", key: "addressFrom" },
    { title: "Địa chỉ đến", dataIndex: "addressTo", key: "addressTo" },
    {
      title: "Số CN ước tính",
      dataIndex: "estimatedWorkers",
      key: "estimatedWorkers",
    },
       {
      title: "Các dịch vụ bổ sung ",
      dataIndex: "listService",
      key:"listService",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "DONE" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Ngày khảo sát",
      dataIndex: "surveyDate",
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<DollarOutlined />}
            onClick={() => onCreateQuotation(record)}
          >
            Tạo báo giá
          </Button>
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => onDelete(record.surveyId)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={surveys}
      columns={columns}
      rowKey="surveyId"
      bordered
      loading={loading}
    />
  );
};
