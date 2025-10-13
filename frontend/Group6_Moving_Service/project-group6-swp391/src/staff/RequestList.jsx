import React from "react";
import { Table, Button, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export const RequestList = ({ requests, onCreateSurvey }) => {
  const columns = [
    { title: "Mã yêu cầu", dataIndex: "requestId", key: "requestId" },
    { title: "Khách hàng", dataIndex: "username", key: "username" },
    { title: "Công ty", dataIndex: "companyName", key: "companyName" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    {
      title: "Ngày tạo",
      dataIndex: "requestTime",
      key: "requestTime",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "PENDING" ? "orange" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => onCreateSurvey(record)}
        >
          Tạo khảo sát
        </Button>
      ),
    },
  ];

  return (
    <Table
      dataSource={requests}
      columns={columns}
      rowKey="requestId"
      bordered
    />
  );
};
