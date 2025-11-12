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
  Descriptions,
  List,
  Card,
} from "antd";
import { PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, RobotOutlined } from "@ant-design/icons";
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
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

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

  // Phân tích hình ảnh với AI
  const handleAnalyzeImage = async () => {
    try {
      const files = uploadForm.getFieldValue("file") || [];
      if (files.length === 0) {
        message.error("Vui lòng chọn ít nhất 1 ảnh để phân tích!");
        return;
      }

      // Lấy ảnh đầu tiên để phân tích
      const firstFile = files[0].originFileObj;
      const formData = new FormData();
      formData.append("file", firstFile);

      setAnalyzing(true);
      const response = await axiosInstance.post("/survey-images/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAnalysisResult(response.data);
      setIsAnalysisModalOpen(true);
      message.success("✅ Phân tích hình ảnh thành công!");
    } catch (error) {
      console.error(error);
      message.error("❌ Lỗi khi phân tích hình ảnh!");
    } finally {
      setAnalyzing(false);
    }
  };

  const addPackingServiceToQuotation = async ({ showSuccess = true } = {}) => {
    if (!analysisResult?.detectedFurniture || analysisResult.detectedFurniture.length === 0) {
      message.warning("Không có đồ đạc nào để thêm dịch vụ!");
      return { success: false };
    }

    if (!selectedFloor?.floorId) {
      message.warning("Vui lòng chọn tầng trước khi thêm dịch vụ!");
      return { success: false };
    }

    try {
      const response = await axiosInstance.post(
        `/survey-images/${selectedFloor.floorId}/add-packing-service`,
        analysisResult
      );
      const successMsg = response.data || "✅ Đã thêm dịch vụ đóng gói vào báo giá!";
      
      if (showSuccess) {
        message.success({
          content: <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{successMsg}</pre>,
          duration: 5,
        });
      }
      return { success: true, message: successMsg };
    } catch (error) {
      console.error("Lỗi khi thêm dịch vụ:", error);
      console.error("Response data:", error.response?.data);
      console.error("Request data:", analysisResult);
      
      // Lấy thông báo lỗi từ server
      let errorMsg = "Lỗi không xác định";
      if (error.response?.data) {
        // Nếu response.data là string, dùng trực tiếp
        errorMsg = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMsg = error.message;
      }
      message.error(`❌ Không thể thêm dịch vụ: ${errorMsg}`);
      return { success: false };
    }
  };

  const applyAreaFromAnalysis = async ({ showSuccess = true } = {}) => {
    if (!analysisResult?.estimatedArea) {
      message.warning("Không có diện tích để áp dụng!");
      return { success: false };
    }

    const area = Math.round(analysisResult.estimatedArea * 10) / 10; // Làm tròn 1 chữ số thập phân
    const areaMessage = selectedFloor?.floorId
      ? `✅ Đã cập nhật diện tích tầng ${selectedFloor.floorNumber}: ${area} m²`
      : `✅ Đã áp dụng diện tích vào form: ${area} m²`;

    try {
      if (selectedFloor?.floorId) {
        await axiosInstance.put(`/survey-floors/${selectedFloor.floorId}/area`, null, {
          params: { area: area }
        });
        if (showSuccess) {
          message.success(areaMessage);
        }
        await fetchMySurveys(); // Refresh lại data
      } else {
        form.setFieldValue("area", area);
        if (showSuccess) {
          message.success(areaMessage);
        }
      }
      return { success: true, area, message: areaMessage };
    } catch (error) {
      console.error(error);
      message.error("❌ Lỗi khi cập nhật diện tích!");
      return { success: false };
    }
  };

  const handleAddPackingServiceAndArea = async () => {
    const { success: areaSuccess, area, message: areaMsg } = await applyAreaFromAnalysis({ showSuccess: false });
    if (!areaSuccess) {
      return;
    }

    const { success: serviceSuccess, message: serviceMessage } = await addPackingServiceToQuotation({ showSuccess: false });
    if (!serviceSuccess) {
      return;
    }

    message.success({
      content: (
        <div>
          <div>{areaMsg || (area ? `✅ Đã cập nhật diện tích: ${area} m²` : "✅ Đã cập nhật diện tích.")}</div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {serviceMessage || "✅ Đã thêm dịch vụ đóng gói vào báo giá."}
          </pre>
        </div>
      ),
      duration: 6,
    });
    setIsAnalysisModalOpen(false);
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
          setAnalysisResult(null);
        }}
        onOk={() => uploadForm.submit()}
        okText="Tải lên"
        cancelText="Hủy"
        width={700}
        footer={[
          <Button key="analyze"onClick={handleAnalyzeImage} loading={analyzing}>
             Phân tích
          </Button>,
          <Button key="cancel" onClick={() => {
            setIsUploadModalOpen(false);
            setSelectedFloor(null);
            uploadForm.resetFields();
            setAnalysisResult(null);
          }}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={() => uploadForm.submit()}>
            Tải lên
          </Button>,
        ]}
      >
        <Form form={uploadForm} layout="vertical" onFinish={handleUploadImage}>
          <Form.Item
            name="file"
            label="Chọn ảnh (có thể chọn nhiều)"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList || []}
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 ảnh!" }]}
            extra="💡 Chọn ảnh và nhấn 'Phân tích AI' để tự động tính diện tích và nhận diện đồ đạc"
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

      {/* Modal hiển thị kết quả phân tích AI */}
      <Modal
        title=" Kết quả phân tích "
        open={isAnalysisModalOpen}
        onCancel={() => setIsAnalysisModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsAnalysisModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="add-service-area"
            type="primary"
            onClick={handleAddPackingServiceAndArea}
            disabled={
              !selectedFloor?.floorId ||
              !analysisResult?.estimatedArea ||
              !analysisResult?.detectedFurniture ||
              analysisResult.detectedFurniture.length === 0
            }
          >
            Thêm dịch vụ đóng gói và báo giá
          </Button>,
        ]}
        width={800}
      >
        {analysisResult && (
          <div>
            <Descriptions bordered column={1} size="middle" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="📐 Diện tích ước tính">
                <strong style={{ fontSize: 18, color: "#1890ff" }}>
                  {analysisResult.estimatedArea ? `${Math.round(analysisResult.estimatedArea * 10) / 10} m²` : "Không xác định"}
                </strong>
              </Descriptions.Item>
              {analysisResult.analysisNote && (
                <Descriptions.Item label="📝 Ghi chú">
                  {analysisResult.analysisNote}
                </Descriptions.Item>
              )}
            </Descriptions>

            {analysisResult.detectedFurniture && analysisResult.detectedFurniture.length > 0 && (
              <div>
                <div style={{ marginBottom: 16, padding: 12, backgroundColor: "#f0f2f5", borderRadius: 4 }}>
                  <strong>Tổng số đồ đạc: </strong>
                  <span style={{ fontSize: 16, color: "#1890ff", fontWeight: "bold" }}>
                    {analysisResult.detectedFurniture.reduce((sum, item) => sum + (item.quantity || 1), 0)} bộ
                  </span>
                  <span style={{ marginLeft: 8, color: "#666", fontSize: 12 }}>
                    (Sẽ thêm dịch vụ "Đóng gói chuyên nghiệp - Theo bộ" vào báo giá)
                  </span>
                </div>
                <h3 style={{ marginBottom: 16 }}>🪑 Đồ đạc được phát hiện:</h3>
                <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={analysisResult.detectedFurniture}
                  renderItem={(item, index) => (
                    <List.Item key={`${item.name}-${index}`}>
                      <Card size="small">
                        <div>
                          <strong>{item.name}</strong>
                          {item.quantity && <Tag color="blue" style={{ marginLeft: 8 }}>x{item.quantity}</Tag>}
                        </div>
                        {item.description && (
                          <div style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
                            {item.description}
                          </div>
                        )}
                        {item.suggestedServiceName && (
                          <div style={{ marginTop: 8 }}>
                            <Tag color="green">Dịch vụ: {item.suggestedServiceName}</Tag>
                          </div>
                        )}
                        {item.priceType && (
                          <div style={{ marginTop: 4 }}>
                            <Tag color="purple">{item.priceType}</Tag>
                          </div>
                        )}
                      </Card>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {analysisResult.vehiclePlan && analysisResult.vehiclePlan.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ marginBottom: 16 }}>🚚 Kế hoạch phương tiện đề xuất:</h3>
                <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={analysisResult.vehiclePlan}
                  renderItem={(plan, index) => (
                    <List.Item key={`vehicle-plan-${index}`}>
                      <Card size="small">
                        <div>
                          <strong>{plan.vehicleType || "Loại xe chưa xác định"}</strong>
                          {plan.priceType && (
                            <Tag color="geekblue" style={{ marginLeft: 8 }}>
                              {plan.priceType}
                            </Tag>
                          )}
                        </div>
                        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {plan.vehicleCount && <Tag color="blue">{plan.vehicleCount} xe</Tag>}
                          {plan.estimatedTrips && <Tag color="volcano">{plan.estimatedTrips} chuyến/xe</Tag>}
                          {plan.estimatedDistanceKm && (
                            <Tag color="gold">
                              {Math.round(plan.estimatedDistanceKm * 10) / 10} km/chuyến
                            </Tag>
                          )}
                        </div>
                        {plan.reason && (
                          <div style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
                            {plan.reason}
                          </div>
                        )}
                      </Card>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {(!analysisResult.detectedFurniture || analysisResult.detectedFurniture.length === 0) && (
              <Alert
                message="Không phát hiện đồ đạc"
                description="AI không phát hiện được đồ đạc trong hình ảnh này."
                type="info"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SurveyFloorList;
