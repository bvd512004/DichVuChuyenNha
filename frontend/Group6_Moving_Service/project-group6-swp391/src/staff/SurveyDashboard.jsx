import React, { useEffect, useState } from "react";
import { Layout, Card, Form, message, Menu, Button } from "antd";
import { DollarOutlined, FileAddOutlined, AppstoreOutlined, } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

// Import components
import { RequestList } from "./RequestList";
import { SurveyList } from "./SurveyList";
import { QuotationList } from "./QuotationList";
import { CreateSurveyModal } from "./CreateSurveyModal";
import { EditSurveyModal } from "./EditSurveyModal";
import { CreateQuotationModal } from "./CreateQuotationModal";
import { useNavigate } from "react-router-dom";


const { Content, Sider } = Layout;

const SurveyDashboard = () => {
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [quoteForm] = Form.useForm();

  const [requests, setRequests] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [activeMenu, setActiveMenu] = useState("survey");

  const [createSurveyModalVisible, setCreateSurveyModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createQuotationModalVisible, setCreateQuotationModalVisible] = useState(false);

  const [selectedRequestForSurvey, setSelectedRequestForSurvey] = useState(null);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [selectedSurveyForQuotation, setSelectedSurveyForQuotation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  const [quotationServiceForm, setQuotationServiceForm] = useState({});
  const [quotationServicesList, setQuotationServicesList] = useState({});

  useEffect(() => {
    fetchRequests();
    fetchSurveys();
    fetchQuotations();
    fetchServices();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/requests");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải yêu cầu!");
    }
  };

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/api/surveys");
      setSurveys(res.data);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải khảo sát!");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotations = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/quotations");
      setQuotations(res.data);

      const qs = {};
      for (let q of res.data) {
        qs[q.quotationId] = q.quotationServices || [];
      }
      setQuotationServicesList(qs);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải báo giá!");
    }
  };

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const res = await axios.get("http://localhost:8080/api/prices");
      if (Array.isArray(res.data)) {
        setServiceList(res.data.filter((s) => s && s.serviceName));
      } else {
        setServiceList([]);
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải dịch vụ!");
    } finally {
      setLoadingServices(false);
    }
  };

  const handleOpenCreateSurvey = (request) => {
    setSelectedRequestForSurvey(request);
    form.setFieldsValue({
      surveyDate: dayjs(),
    });
    setCreateSurveyModalVisible(true);
  };

  const handleSubmitSurvey = async (values) => {
    try {
      const payload = {
        ...values,
        requestId: selectedRequestForSurvey.requestId,
        surveyDate: values.surveyDate.toISOString(),
        status: "DONE",
      };
      await axios.post("http://localhost:8080/api/surveys", payload);
      message.success("Tạo khảo sát thành công!");
      form.resetFields();
      setSelectedRequestForSurvey(null);
      setCreateSurveyModalVisible(false);
      fetchSurveys();
    } catch {
      message.error("Tạo khảo sát thất bại!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/surveys/${id}`);
      message.success("Xóa khảo sát thành công!");
      fetchSurveys();
    } catch {
      message.error("Không thể xóa khảo sát!");
    }
  };

  const handleEdit = (record) => {
    setEditingSurvey(record);
    editForm.setFieldsValue({
      ...record,
      surveyDate: dayjs(record.surveyDate),
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      await axios.put(
        `http://localhost:8080/api/surveys/${editingSurvey.surveyId}`,
        {
          ...values,
          surveyDate: values.surveyDate.toISOString(),
        }
      );
      message.success("Cập nhật khảo sát thành công!");
      setEditModalVisible(false);
      fetchSurveys();
    } catch {
      message.error("Lỗi khi cập nhật khảo sát!");
    }
  };

  const handleOpenCreateQuotation = (survey) => {
    setSelectedSurveyForQuotation(survey);
    quoteForm.setFieldsValue({
      createdDate: dayjs(),
    });
    setCreateQuotationModalVisible(true);
  };

  const handleCreateQuotation = async (values) => {
    try {
      const payload = {
        ...values,
        surveyId: selectedSurveyForQuotation.surveyId,
        createdDate: values.createdDate
          ? dayjs(values.createdDate).format("YYYY-MM-DDTHH:mm:ss")
          : null,
      };
      await axios.post("http://localhost:8080/api/quotations", payload);
      message.success("Tạo báo giá thành công!");
      quoteForm.resetFields();
      setSelectedSurveyForQuotation(null);
      setCreateQuotationModalVisible(false);
      fetchQuotations();
    } catch {
      message.error("Tạo báo giá thất bại!");
    }
  };

  const handleQuotationServiceChange = (quotationId, field, value) => {
    setQuotationServiceForm((prev) => ({
      ...prev,
      [quotationId]: {
        ...prev[quotationId],
        [field]: value,
      },
    }));
  };

 const handleCreateQuotationService = async (quotationId) => {
  try {
    const data = quotationServiceForm[quotationId];
    if (!data?.serviceId || !data?.priceId || !data?.quantity) {
      message.warning("Vui lòng chọn dịch vụ, giá và số lượng!");
      return;
    }

    const payload = {
      quotationId: Number(quotationId),
      serviceId: Number(data.serviceId),
      priceId: Number(data.priceId),
      quantity: Number(data.quantity),
    };

    // ✅ Kiểm tra trùng service + price
    const existingService = (quotationServicesList[quotationId] || []).find(
      (item) =>
        Number(item.service?.serviceId || item.serviceId) ===
          Number(data.serviceId) &&
        Number(item.price?.priceId || item.priceId) === Number(data.priceId)
    );

    let res;
    if (existingService) {
      // ✅ Nếu tồn tại thì cập nhật quantity thay vì thêm mới
      const newQuantity =
        Number(existingService.quantity || 0) + Number(data.quantity);

      res = await axios.put(
        `http://localhost:8080/api/quotation-services/${existingService.id}`,
        {
          ...existingService,
          quantity: newQuantity,
          subtotal:
            newQuantity *
            (existingService.price?.amount || existingService.amount || 0),
        }
      );

      // Cập nhật lại danh sách trong state
      setQuotationServicesList((prev) => {
        const updated = { ...prev };
        const list = [...(prev[quotationId] || [])];
        const idx = list.findIndex((s) => s.id === existingService.id);
        if (idx !== -1) list[idx] = res.data;
        updated[quotationId] = list;
        return updated;
      });

      message.info("Cập nhật số lượng dịch vụ đã có!");
    } else {
      // ✅ Nếu chưa có thì thêm mới
      res = await axios.post(
        "http://localhost:8080/api/quotation-services",
        payload
      );

      setQuotationServicesList((prev) => ({
        ...prev,
        [quotationId]: [...(prev[quotationId] || []), res.data],
      }));

      message.success("Thêm dịch vụ mới thành công!");
    }

    // Reset form input
    setQuotationServiceForm((prev) => ({
      ...prev,
      [quotationId]: {},
    }));

    // Load lại báo giá để đồng bộ backend
    fetchQuotations();
  } catch (err) {
    console.error("❌ Lỗi khi thêm/cập nhật Quotation Service:", err);
    message.error("Thêm hoặc cập nhật dịch vụ thất bại!");
  }
};


  const handleQuantityChange = async (quotationId, serviceIndex, delta) => {
    const service = quotationServicesList[quotationId][serviceIndex];
    const newQuantity = Math.max(0, service.quantity + delta);

    try {
      const res = await axios.put(
        `http://localhost:8080/api/quotation-services/${service.id}`,
        {
          ...service,
          quantity: newQuantity,
          subtotal: newQuantity * service.price.amount,
        }
      );

      setQuotationServicesList((prev) => {
        const updated = [...prev[quotationId]];
        updated[serviceIndex] = res.data;
        return { ...prev, [quotationId]: updated };
      });

      message.success("Cập nhật quantity thành công!");
      fetchQuotations();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật quantity thất bại!");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} theme="light">
        <div
          style={{ padding: "20px", textAlign: "center", fontWeight: "bold" }}
        >
          Dashboard
        </div>
       
        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={(e) => setActiveMenu(e.key)}
          style={{ height: "100%", borderRight: 0 }}
        >
          <Menu.Item key="survey" icon={<FileAddOutlined />}>
            Quản lý Khảo Sát
          </Menu.Item>
          <Menu.Item key="quotation" icon={<DollarOutlined />}>
            Quản lý Báo Giá
          </Menu.Item>
            <Menu.Item
    key="quotationService"
    icon={<AppstoreOutlined />}
    onClick={() => navigate("/quotations-services-list")}
  >
    Dịch vụ Báo Giá
  </Menu.Item>

        </Menu>
      </Sider>

      <Layout style={{ padding: "20px" }}>
        <Content>
          <h2 style={{ marginBottom: 20 }}>
            {activeMenu === "survey" ? "Quản lý Khảo Sát" : "Quản lý Báo Giá"}
          </h2>

          {activeMenu === "survey" && (
            <>
              <Card title="Danh sách yêu cầu" style={{ marginBottom: 20 }}>
                <RequestList
                  requests={requests}
                  onCreateSurvey={handleOpenCreateSurvey}
                />
              </Card>

              <Card title="Danh sách khảo sát">
                <SurveyList
                  surveys={surveys}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCreateQuotation={handleOpenCreateQuotation}
                />
              </Card>
            </>
          )}

          {activeMenu === "quotation" && (
            <Card title="Danh sách báo giá">
              <QuotationList
                quotations={quotations}
                serviceList={serviceList}
                loadingServices={loadingServices}
                quotationServiceForm={quotationServiceForm}
                quotationServicesList={quotationServicesList}
                onServiceChange={handleQuotationServiceChange}
                onCreateService={handleCreateQuotationService}
                onQuantityChange={handleQuantityChange}
              />
            </Card>
          )}
        </Content>
      </Layout>

      <CreateSurveyModal
        visible={createSurveyModalVisible}
        form={form}
        selectedRequest={selectedRequestForSurvey}
        onCancel={() => {
          setCreateSurveyModalVisible(false);
          setSelectedRequestForSurvey(null);
          form.resetFields();
        }}
        onSubmit={handleSubmitSurvey}
      />

      <EditSurveyModal
        visible={editModalVisible}
        form={editForm}
        onCancel={() => setEditModalVisible(false)}
        onUpdate={handleUpdate}
      />

      <CreateQuotationModal
        visible={createQuotationModalVisible}
        form={quoteForm}
        selectedSurvey={selectedSurveyForQuotation}
        onCancel={() => {
          setCreateQuotationModalVisible(false);
          setSelectedSurveyForQuotation(null);
          quoteForm.resetFields();
        }}
        onSubmit={handleCreateQuotation}
      />
    </Layout>
  );
};

export default SurveyDashboard;