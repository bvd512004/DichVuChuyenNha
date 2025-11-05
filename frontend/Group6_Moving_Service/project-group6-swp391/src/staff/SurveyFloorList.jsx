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
  Badge,
  Tag,
  Space,
} from "antd";
import { PlusOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import axiosInstance from "../service/axiosInstance";

const SurveyFloorList = ({ onSurveyUpdate }) => {
  const [surveys, setSurveys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [form] = Form.useForm();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [uploadForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMySurveys();
  }, []);

  // Gọi API danh sách khảo sát
  const fetchMySurveys = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/surveys/my");
      const data = Array.isArray(res.data.result)
        ? res.data.result
        : res.data || [];
      setSurveys(data);
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách khảo sát của bạn!");
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra và tự động cập nhật trạng thái khảo sát
  const checkAndUpdateSurveyStatus = async (surveyId) => {
    try {
      const survey = surveys.find(s => s.surveyId === surveyId);
      if (!survey) return;

      const currentFloors = survey.surveyFloors?.length || 0;
      const requiredFloors = survey.numFloors || 0;

      // Nếu đã đủ tầng và đang ở trạng thái PROCESSING, chuyển sang DONE
      if (currentFloors >= requiredFloors && survey.status === "PROCESSING") {
        await axiosInstance.put(`/surveys/${surveyId}`, {
          ...survey,
          status: "DONE"
        });
        
        message.success({
          content: `🎉 Khảo sát #${surveyId} đã hoàn thành đủ ${requiredFloors} tầng! Có thể báo giá ngay.`,
          duration: 5,
        });
        
        // Gọi callback để cập nhật trang SurveyList nếu có
        if (onSurveyUpdate) {
          onSurveyUpdate();
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
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

      message.success("✅ Thêm tầng thành công!");
      
      setIsModalOpen(false);
      form.resetFields();
      setSelectedSurvey(null);
      
      // Fetch lại data và kiểm tra trạng thái
      await fetchMySurveys();
      await checkAndUpdateSurveyStatus(values.surveyId);
      
    } catch (error) {
      console.error(error);
      message.error("❌ Không thể thêm tầng!");
    }
  };

  const handleUploadImage = async (values) => {
    try {
      const files = values.file || [];
      if (files.length === 0) {
        message.error("Vui lòng chọn ít nhất 1 ảnh!");
        return;
      }

      // Upload từng ảnh
      for (const fileItem of files) {
        const file = fileItem.originFileObj;
        const formData = new FormData();
        formData.append("floorId", selectedFloor.floorId);
        formData.append("note", values.note || "");
        formData.append("file", file);

        await axiosInstance.post("/survey-images/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      message.success(`✅ Đã tải lên ${files.length} ảnh thành công!`);
      setIsUploadModalOpen(false);
      uploadForm.resetFields();
      await fetchMySurveys();
    } catch (error) {
      console.error(error);
      message.error("❌ Lỗi khi tải ảnh!");
    }
  };

  // Lọc chỉ những khảo sát chưa đủ tầng
  const incompleteSurveys = surveys.filter(s => {
    const currentFloors = s.surveyFloors?.length || 0;
    const requiredFloors = s.numFloors || 0;
    return currentFloors < requiredFloors;
  });

  // Render badge trạng thái tầng
  const renderFloorStatus = (current, required) => {
    const isComplete = current >= required;
    return (
      <Badge
        count={`${current}/${required}`}
        style={{
          backgroundColor: isComplete ? '#52c41a' : '#faad14',
        }}
      />
    );
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
      title: "Tiến độ tầng",
      key: "floorProgress",
      render: (_, record) => {
        const current = record.surveyFloors?.length || 0;
        const required = record.numFloors || 0;
        const isComplete = current >= required;
        
        return (
          <Space>
            {renderFloorStatus(current, required)}
            {isComplete ? (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Đủ tầng
              </Tag>
            ) : (
              <Tag icon={<ClockCircleOutlined />} color="processing">
                Còn {required - current} tầng
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Tổng diện tích",
      dataIndex: "totalArea",
      key: "totalArea",
      render: (a) => (a ? `${a} m²` : "Chưa có"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const configs = {
          DONE: { color: "success", text: "Hoàn thành" },
          QUOTED: { color: "blue", text: "Đã báo giá" },
          PROCESSING: { color: "processing", text: "Đang xử lý" },
        };
        const config = configs[status] || configs.PROCESSING;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  // Khi chọn khảo sát
  const handleSurveyChange = (id) => {
    const survey = incompleteSurveys.find((s) => s.surveyId === id);
    setSelectedSurvey(survey);
    form.setFieldValue("surveyId", id);
  };

  // disable khi đã đủ tầng
  const isDisabled =
    selectedSurvey &&
    selectedSurvey.surveyFloors?.length >= selectedSurvey.numFloors;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>📋 Quản lý tầng khảo sát</h2>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>
            Thêm thông tin tầng và ảnh cho các khảo sát
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          disabled={incompleteSurveys.length === 0}
        >
          Thêm tầng
        </Button>
      </div>

      {incompleteSurveys.length === 0 && surveys.length > 0 && (
        <Alert
          message="🎉 Tất cả khảo sát đã đủ tầng!"
          description="Không còn khảo sát nào cần thêm tầng. Bạn có thể chuyển sang trang Khảo Sát để tạo báo giá."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Bảng khảo sát có thể mở rộng xem các tầng */}
      <Table
        rowKey="surveyId"
        dataSource={surveys}
        columns={columns}
        loading={loading}
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
                  render: (num) => <Tag color="blue">Tầng {num}</Tag>,
                },
                {
                  title: "Diện tích (m²)",
                  dataIndex: "area",
                  key: "area",
                  render: (area) => area ? `${area} m²` : 'Chưa có',
                },
                {
                  title: "Số ảnh",
                  key: "imageCount",
                  render: (floor) => (
                    <Badge 
                      count={floor.surveyImages?.length || 0} 
                      showZero
                      style={{ backgroundColor: '#1890ff' }}
                    />
                  ),
                },
                {
                  title: "Thao tác",
                  key: "action",
                  render: (floor) => (
                    <Button
                      size="small"
                      type="primary"
                      ghost
                      onClick={() => {
                        setSelectedFloor(floor);
                        setIsUploadModalOpen(true);
                      }}
                    >
                      📷 Thêm ảnh
                    </Button>
                  ),
                },
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
              placeholder="Chọn khảo sát chưa đủ tầng"
              onChange={handleSurveyChange}
              showSearch
              optionFilterProp="children"
            >
              {incompleteSurveys.map((s) => {
                const current = s.surveyFloors?.length || 0;
                const required = s.numFloors || 0;
                return (
                  <Select.Option key={s.surveyId} value={s.surveyId}>
                    <Space>
                      <span>#{s.surveyId}</span>
                      <Badge count={`${current}/${required}`} />
                      <span style={{ color: '#666' }}>- {s.addressTo}</span>
                    </Space>
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          {selectedSurvey && (
            <Alert
              type={isDisabled ? "warning" : "info"}
              showIcon
              message={
                isDisabled
                  ? `⚠️ Khảo sát này đã đủ ${selectedSurvey.numFloors} tầng, không thể thêm nữa!`
                  : `📊 Hiện có ${
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

          <Form.Item 
            name="area" 
            label="Diện tích tầng này (m²)"
            rules={[{ required: true, message: "Nhập diện tích!" }]}
          >
            <Input type="number" placeholder="VD: 50" min={0} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal upload ảnh */}
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
        width={600}
      >
        <Form form={uploadForm} layout="vertical" onFinish={handleUploadImage}>
          <Form.Item
            name="file"
            label="Chọn ảnh (có thể chọn nhiều)"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList || []}
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 ảnh!" }]}
          >
            <Upload
              listType="picture-card"
              multiple
              beforeUpload={() => false}
              accept="image/*"
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Chọn ảnh</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="note"
            label="Ghi chú cho ảnh"
            rules={[{ max: 200, message: "Ghi chú không quá 200 ký tự" }]}
          >
            <Input.TextArea placeholder="Nhập ghi chú chung cho các ảnh (tùy chọn)" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SurveyFloorList;
