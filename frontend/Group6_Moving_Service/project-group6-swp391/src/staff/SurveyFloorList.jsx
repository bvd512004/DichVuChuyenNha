import React, { useEffect, useState } from "react";
import {
  Table,
  message,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Alert,
  Upload,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axiosInstance from "../service/axiosInstance";


const SurveyFloorList = () => {
  const [surveys, setSurveys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [form] = Form.useForm();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
const [selectedFloor, setSelectedFloor] = useState(null);
const [uploadForm] = Form.useForm();


  useEffect(() => {
    fetchMySurveys();
  }, []);

  // Gọi API danh sách khảo sát
  const fetchMySurveys = async () => {
    try {
      const res = await axiosInstance.get("/surveys/my");
      const data = Array.isArray(res.data.result)
        ? res.data.result
        : res.data || [];
      setSurveys(data);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách khảo sát của bạn!");
    }
  };

  // Gọi API thêm tầng
  const handleAddFloor = async (values) => {
    try {
      await axiosInstance.post("/survey-floors", {
        surveyId: values.surveyId,
        floorNumber: values.floorNumber,
        area: values.area,
      });

      message.success("Thêm tầng thành công!");
      setIsModalOpen(false);
      form.resetFields();
      setSelectedSurvey(null);
      fetchMySurveys();
    } catch (error) {
      console.error(error);
      message.error("Không thể thêm tầng!");
    }
  };

  const columns = [
    {
      title: "Mã khảo sát",
      dataIndex: "surveyId",
      key: "surveyId",
      render: (id) => <strong>#{id}</strong>,
    },
    {
      title: "Địa chỉ đến",
      dataIndex: "addressTo",
      key: "addressTo",
    },
    {
      title: "Số tầng dự kiến",
      dataIndex: "numFloors",
      key: "numFloors",
      render: (n) => n || 0,
    },
    {
      title: "Tổng diện tích",
      dataIndex: "totalArea",
      key: "totalArea",
      render: (a) => (a ? `${a} m²` : "Chưa có"),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
  ];

  // Khi chọn khảo sát
  const handleSurveyChange = (id) => {
    const survey = surveys.find((s) => s.surveyId === id);
    setSelectedSurvey(survey);
    form.setFieldValue("surveyId", id);
  };


  const handleUploadImage = async (values) => {
  try {
    const file = values.file?.[0]?.originFileObj;
    if (!file) {
      message.error("Vui lòng chọn ảnh!");
      return;
    }

    const formData = new FormData();
    formData.append("floorId", selectedFloor.floorId);
    formData.append("note", values.note || "");
    formData.append("file", file);

    await axiosInstance.post("/survey-images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    message.success("Tải ảnh lên thành công!");
    setIsUploadModalOpen(false);
    uploadForm.resetFields();
  } catch (error) {
    console.error(error);
    message.error("Lỗi khi tải ảnh!");
  }
};


  // disable khi đã đủ tầng
  const isDisabled =
    selectedSurvey &&
    selectedSurvey.surveyFloors?.length >= selectedSurvey.numFloors;

  return (
    <div style={{ padding: 20 }}>
      <h2>📋 Danh sách khảo sát của tôi</h2>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Thêm tầng cho khảo sát
      </Button>

      {/* Bảng khảo sát có thể mở rộng xem các tầng */}
      <Table
        rowKey="surveyId"
        dataSource={surveys}
        columns={columns}
        expandable={{
          expandedRowRender: (record) => (
            <Table
              size="small"
              pagination={false}
              dataSource={record.surveyFloors || []}
              
              rowKey={(f) => `${record.surveyId}-${f.floorNumber}`}
              columns={[
                {
                  title: "Tầng số",
                  dataIndex: "floorNumber",
                  key: "floorNumber",
                },
                {
                  title: "Diện tích (m²)",
                  dataIndex: "area",
                  key: "area",
                },
                {
  title: "Thao tác",
  key: "action",
  render: (floor) => (
    <Button
      size="small"
      onClick={() => {
            console.log("Chọn tầng:", floor); // debug

        setSelectedFloor(floor);
        setIsUploadModalOpen(true);
      }}
    >
      Thêm ảnh
    </Button>
  ),
}

              ]}
              locale={{
                emptyText: "Chưa có tầng nào",
              }}
            />
          ),
          rowExpandable: (record) =>
            record.surveyFloors && record.surveyFloors.length > 0,
        }}
      />

      {/* Modal thêm tầng */}
      <Modal
        title="➕ Thêm tầng khảo sát"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setSelectedSurvey(null);
        }}
        onOk={() => form.submit()}
        okButtonProps={{ disabled: isDisabled }}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleAddFloor}>
          <Form.Item
            name="surveyId"
            label="Chọn khảo sát"
            rules={[{ required: true, message: "Vui lòng chọn khảo sát!" }]}
          >
            <Select
              placeholder="Chọn khảo sát để thêm tầng"
              onChange={handleSurveyChange}
            >
              {surveys.map((s) => (
                <Select.Option key={s.surveyId} value={s.surveyId}>
                  #{s.surveyId} - {s.addressFrom} ➜ {s.addressTo}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedSurvey && (
            <Alert
              type={isDisabled ? "warning" : "info"}
              showIcon
              message={
                isDisabled
                  ? `Khảo sát này đã đủ ${selectedSurvey.numFloors} tầng, không thể thêm nữa!`
                  : `Hiện có ${
                      selectedSurvey.surveyFloors?.length || 0
                    }/${selectedSurvey.numFloors} tầng`
              }
              style={{ marginBottom: 12 }}
            />
          )}

          <Form.Item
            name="floorNumber"
            label="Số tầng"
            rules={[{ required: true, message: "Nhập số tầng!" }]}
          >
            <Input type="number" placeholder="VD: 1, 2, 3..." min={1} />
          </Form.Item>

          <Form.Item name="area" label="Diện tích tầng này (m²)">
            <Input placeholder="VD: 50" />
          </Form.Item>
        </Form>
      </Modal>
     <Modal
  title={`🖼️ Upload ảnh cho tầng ${selectedFloor?.floorNumber}`}
  open={isUploadModalOpen}
  onCancel={() => {
    setIsUploadModalOpen(false);
    setSelectedFloor(null);
    uploadForm.resetFields();
  }}
  onOk={() => uploadForm.submit()}
  okText="Tải lên"
  cancelText="Hủy"
>
  <Form form={uploadForm} layout="vertical" onFinish={handleUploadImage}>
    <Form.Item
      name="file"
      label="Chọn ảnh"
      valuePropName="fileList"
      getValueFromEvent={(e) => e?.fileList || []} // sửa để lấy đúng fileList
      rules={[{ required: true, message: "Vui lòng chọn ảnh!" }]}
    >
      <Upload
        listType="picture-card"
              multiple // cho phép chọn nhiều ảnh

        beforeUpload={() => false} // không upload tự động, chờ submit
        accept="image/*"
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Chọn ảnh</div>
        </div>
      </Upload>
    </Form.Item>

    {/* Thêm note */}
    <Form.Item
      name="note"
      label="Ghi chú cho ảnh"
      rules={[{ max: 200, message: "Ghi chú không quá 200 ký tự" }]}
    >
      <Input.TextArea placeholder="Nhập ghi chú (tùy chọn)" rows={3} />
    </Form.Item>
  </Form>
</Modal>

    </div>
  );
};

export default SurveyFloorList;
