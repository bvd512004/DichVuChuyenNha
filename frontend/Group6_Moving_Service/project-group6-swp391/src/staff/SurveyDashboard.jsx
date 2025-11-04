import React, { useEffect, useState } from "react";
import { Layout, Card, Form, message, Menu, Row, Col, Statistic, Badge, Modal, Descriptions, Tabs,App// ✅ Import đúng cách
 } from "antd"; 
import {
    DollarOutlined,
    FileAddOutlined,
    AppstoreOutlined,
    ContainerOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../service/axiosInstance";

// Import components
import { RequestList } from "./RequestList"; 
import { SurveyList } from "./SurveyList";
import { QuotationList } from "./QuotationList";
import { CreateSurveyModal } from "./CreateSurveyModal";
import { EditSurveyModal } from "./EditSurveyModal";
import QuotationAddServices from "./QuotationAddServices";
import SurveyFloorList from "./SurveyFloorList";
import { useAuth } from "../context/AuthContext";

const { Content, Sider } = Layout;

// Dữ liệu màu sắc hiện đại cho các Statistic Card
const STAT_COLORS = {
    requests: { color: '#1890ff', bg: '#e6f7ff' }, // Blue
    surveys: { color: '#52c41a', bg: '#f6ffed' },  // Green
    quotations: { color: '#faad14', bg: '#fffbe6' }, // Yellow/Orange
};



const SurveyDashboard = () => {
    const BACKEND_URL = "http://localhost:8080/images/survey/"; // đổi cho phù hợp môi trường

    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [quoteForm] = Form.useForm();

    const [requests, setRequests] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [quotations, setQuotations] = useState([]);
    const [selectedQuotation, setSelectedQuotation] = useState(null);

    const [activeMenu, setActiveMenu] = useState("survey");

    // Modal states
    const [createSurveyModalVisible, setCreateSurveyModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [createQuotationModalVisible, setCreateQuotationModalVisible] = useState(false);
    
    // TRẠNG THÁI CHO MODAL XEM CHI TIẾT KHẢO SÁT
    const [viewSurveyModalVisible, setViewSurveyModalVisible] = useState(false);
    const [viewingSurvey, setViewingSurvey] = useState(null); 
    
    // !!! TRẠNG THÁI MỚI CHO MODAL XEM CHI TIẾT REQUEST !!!
    const [viewRequestModalVisible, setViewRequestModalVisible] = useState(false);
    const [viewingRequest, setViewingRequest] = useState(null); 

    const [selectedRequestForSurvey, setSelectedRequestForSurvey] = useState(null);
    const [editingSurvey, setEditingSurvey] = useState(null);
    const [selectedSurveyForQuotation, setSelectedSurveyForQuotation] = useState(null);
      const { user,token } = useAuth(); // ✅ Lấy user đã decode từ JWT

        const { notification } = App.useApp();


    useEffect(() => {
        fetchRequests();
        fetchSurveys();
        fetchQuotations();
    }, []);

    // ... (Các useEffect và fetch data functions giữ nguyên) ...

    useEffect(() => {
        if (selectedQuotation) {
            const updated = quotations.find(
                (q) => q.quotationId === selectedQuotation.quotationId
            );
            if (updated) {
                setSelectedQuotation(updated);
            }
        }
    }, [quotations]);

    useEffect(() => {
        if (activeMenu === "quotation") {
            fetchQuotations();
        }
    }, [activeMenu]);

    const fetchRequests = async () => {
        try {
            const res = await axiosInstance.get("/requests/my-requests");
            setRequests(Array.isArray(res.data.result) ? res.data.result : res.data || []);
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi tải yêu cầu!");
        }
    };

    const fetchSurveys = async () => {
        try {
            const res = await axiosInstance.get("/surveys/my");
            const data =
                Array.isArray(res.data) ? res.data :
                    Array.isArray(res.data.result) ? res.data.result : [];
            setSurveys(data);
        } catch (err) {
            console.error("❌ Lỗi khi tải khảo sát:", err);
            message.error("Lỗi khi tải khảo sát!");
        }
    };

    const fetchQuotations = async () => {
        try {
            const res = await axiosInstance.get("/quotations/me");
            setQuotations(Array.isArray(res.data.result) ? res.data.result : res.data || []);
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi tải báo giá!");
        }
    };


    // ====== HANDLERS MỚI CHO REQUEST ======
    const handleViewRequest = (record) => {
        setViewingRequest(record);
        setViewRequestModalVisible(true);
    };

    const handleCloseViewRequest = () => {
        setViewRequestModalVisible(false);
        setViewingRequest(null);
    };
    // ======================================


    // ====== SURVEY & QUOTATION Handlers (Giữ nguyên) ======
    const handleOpenCreateSurvey = (request) => {
        setSelectedRequestForSurvey(request);
        form.setFieldsValue({
            surveyDate: dayjs(),
            addressFrom: request.pickupAddress || "",
            addressTo: request.destinationAddress || "",
        });        
        setCreateSurveyModalVisible(true);
    };

    const handleSubmitSurvey = async (values) => {
        try {
            const payload = {
                ...values,
                requestId: selectedRequestForSurvey.requestId,
                surveyDate: values.surveyDate.toISOString(),
                
            };
            await axiosInstance.post("/surveys", payload);
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
            await axiosInstance.delete(`/surveys/${id}`);
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
            surveyDate: record.surveyDate ? dayjs(record.surveyDate) : null,
        });
        setEditModalVisible(true);
    };

    const handleUpdate = async () => {
        try {
            const values = await editForm.validateFields();
            await axiosInstance.put(`/surveys/${editingSurvey.surveyId}`, {
                ...values,
                surveyDate: values.surveyDate.toISOString(),
            });
            message.success("Cập nhật khảo sát thành công!");
            setEditModalVisible(false);
            fetchSurveys();
        } catch {
            message.error("Lỗi khi cập nhật khảo sát!");
        }
    };
const handleCreateQuotation = async (survey) => {
  // 1️⃣ Kiểm tra điều kiện tầng
  if (
    survey.numFloors > 0 &&
    (!survey.surveyFloors || survey.surveyFloors.length < survey.numFloors)
  ) {
    notification.warning({
      message: "Không thể tạo báo giá ⚠️",
      description: `Khảo sát này có ${survey.numFloors} tầng, nhưng bạn chưa hoàn thành thông tin cho tất cả tầng. 
      Vui lòng cập nhật đầy đủ trước khi tạo báo giá.`,
      placement: "bottomRight",
      duration: 5,
    });
    return;
  }

  try {
    // 2️⃣ Chuẩn bị dữ liệu gửi API
    const payload = {
      surveyId: survey.surveyId,
      createdDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
    };

    // 3️⃣ Gọi API tạo báo giá
    await axiosInstance.post("/quotations", payload);

    // 4️⃣ Hiển thị thông báo thành công
    notification.success({
      message: "Tạo báo giá thành công 🎉",
      description: `Báo giá cho khảo sát "${survey.addressFrom}" → "${survey.addressTo}" đã được tạo.`,
      placement: "bottomRight",
      duration: 4,
    });

    // 5️⃣ Reload danh sách (nếu cần)
    fetchQuotations?.();

  } catch (error) {
    console.error(error);
    notification.error({
      message: "Tạo báo giá thất bại ❌",
      description: "Đã xảy ra lỗi khi tạo báo giá. Vui lòng thử lại sau.",
      placement: "bottomRight",
    });
  }
};


    // HÀM XEM CHI TIẾT KHẢO SÁT (Giữ nguyên)
    const handleViewSurvey = (record) => {
        setViewingSurvey(record);
        setViewSurveyModalVisible(true);
    };

    const handleCloseViewSurvey = () => {
        setViewSurveyModalVisible(false);
        setViewingSurvey(null);
    };


    // Hàm render card thống kê hiện đại (Giữ nguyên)
    const renderStatCard = (title, value, IconComponent, colors) => (
        <Card 
            variant="default" // Sửa cảnh báo 'bordered'
            style={{ 
                borderRadius: 12, 
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s',
            }}
            className="modern-stat-card"
            hoverable
        >
            <Row align="middle" gutter={16}>
                <Col>
                    <div style={{
                        backgroundColor: colors.bg,
                        padding: 12,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <IconComponent style={{ fontSize: '28px', color: colors.color }} />
                    </div>
                </Col>
                <Col flex="auto">
                    <Statistic
                        title={<span style={{ fontWeight: 500, color: '#666' }}>{title}</span>}
                        value={value}
                        valueStyle={{ 
                            color: colors.color, 
                            fontWeight: 'bold', 
                            fontSize: '24px' 
                        }}
                    />
                </Col>
            </Row>
        </Card>
    );
    
    // Component Modal để hiển thị chi tiết Request
    const RequestDetailModal = () => (
        <Modal
            title="Chi tiết Yêu Cầu Khách Hàng"
            open={viewRequestModalVisible}
            onCancel={handleCloseViewRequest}
            footer={null}
            width={800}
        >
            {viewingRequest && (
                <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="Mã Yêu Cầu">{viewingRequest.requestId}</Descriptions.Item>
                    <Descriptions.Item label="Khách Hàng">{viewingRequest.username}</Descriptions.Item>
                    <Descriptions.Item label="Công Ty">{viewingRequest.companyName}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ đi">{viewingRequest.pickupAddress}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ đến">{viewingRequest.destinationAddress}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {viewingRequest.requestTime ? dayjs(viewingRequest.requestTime).format("DD/MM/YYYY HH:mm") : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng Thái">
                        <Badge 
                            status={viewingRequest.status === 'PENDING' ? 'warning' : 'success'} 
                            text={viewingRequest.status === 'PENDING' ? 'Chờ Khảo Sát' : 'Đã Khảo Sát'} 
                        />
                    </Descriptions.Item>
                </Descriptions>
            )}
        </Modal>
    );

    // Component Modal để hiển thị chi tiết Survey
    const SurveyDetailModal = () => (
        <Modal
            title="Chi tiết Khảo Sát"
            open={viewSurveyModalVisible}
            onCancel={handleCloseViewSurvey}
            footer={null}
            width={800}
        >
            {viewingSurvey && (
                <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="middle">
                    <Descriptions.Item label="ID Khảo Sát" span={3}>{viewingSurvey.surveyId}</Descriptions.Item>
                    <Descriptions.Item label="Khách Hàng" span={3}>
                        {viewingSurvey.username} ({viewingSurvey.companyName})
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Ngày Khảo Sát" span={1}>
                        {viewingSurvey.surveyDate ? dayjs(viewingSurvey.surveyDate).format("DD/MM/YYYY") : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng Thái" span={2}>
                        <Badge status={viewingSurvey.status === 'DONE' ? 'success' : 'processing'} text={viewingSurvey.status === 'DONE' ? 'Hoàn thành' : 'Đã được tạo báo giá'} />
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Địa chỉ đi" span={3}>{viewingSurvey.addressFrom}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ đến" span={3}>{viewingSurvey.addressTo}</Descriptions.Item>
                    
                    {/* THÔNG TIN CHI TIẾT TỪ KHẢO SÁT */}
                    <Descriptions.Item label="Diện tích (m²)">{viewingSurvey.totalArea || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Số tầng ">{viewingSurvey.numFloors || 'N/A'}</Descriptions.Item>
                    
                    <Descriptions.Item label="Khoảng cách vận chuyển (km)" span={3}>
                        {viewingSurvey.distanceKm || 'N/A'}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ghi chú Khảo Sát" span={3}>
                        {viewingSurvey.note || 'Không có ghi chú.'}
                    </Descriptions.Item>
                    {viewingSurvey.surveyFloors?.map(floor => (
<Descriptions.Item
  label={`Tầng ${floor.floorNumber}`}
  span={3}
  key={floor.floorId}
>
  <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
    {floor.images?.map(img => (
      <div key={img.imageId} style={{ width: 100 }}>
        <div style={{ width: 100, height: 100, overflow: "hidden", borderRadius: 4 }}>
          <img
            src={`${BACKEND_URL}${img.imageUrl}`}
            alt={img.note}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        {img.note && (
          <div style={{ fontSize: 12, textAlign: "center", marginTop: 4 }}>
            {img.note}
          </div>
        )}
      </div>
    ))}
  </div>
</Descriptions.Item>

))}

                </Descriptions>
            )}
        </Modal>
    );


    // ====== RENDER DASHBOARD ======
    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* ========== SIDEBAR (Giữ nguyên) ========== */}
            <Sider width={220} theme="light">
                {/* ... (Sidebar Menu code giữ nguyên) ... */}
                <div
                    style={{
                        padding: "20px",
                        fontWeight: "bold",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: '1px solid #f0f0f0',
                    }}
                >
                    <span>Dashboard</span>

                    {/* BADGE QUẢN LÝ BÁO GIÁ */}
                    <Badge
                        count={quotations.length}
                        overflowCount={99}
                        style={{
                            backgroundColor: '#faad14',
                            cursor: 'pointer',
                            boxShadow: activeMenu === 'quotation' ? '0 0 5px #faad14' : 'none',
                            marginLeft: 8, 
                        }}
                        onClick={() => setActiveMenu("quotation")} 
                        title="Quản lý Báo Giá"
                    >
                        <DollarOutlined 
                            style={{ 
                                fontSize: '24px', 
                                padding: 6,
                                color: activeMenu === 'quotation' ? '#1890ff' : '#666',
                                backgroundColor: activeMenu === 'quotation' ? '#e6f7ff' : 'transparent',
                                borderRadius: 6,
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                            }} 
                            onClick={() => setActiveMenu("quotation")}
                        />
                    </Badge>
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[activeMenu]} 
                    onClick={(e) => setActiveMenu(e.key)}
                    style={{ height: "100%", borderRight: 0 }}
                    items={[
                        {
                            key: "survey",
                            icon: <FileAddOutlined />,
                            label: "Quản lý Khảo Sát",
                        },
                        {
                            key: "addService",
                            icon: <AppstoreOutlined />,
                            label: "Dịch vụ Báo Giá",
                        },
                    ]}
                />
            </Sider>

            {/* ========== MAIN CONTENT ========== */}
            <Layout style={{ padding: "20px" }}>
                <Content>
                    
                    {/* ========== STATS CARDS ========== */}
                    <Row gutter={24} style={{ marginBottom: 30 }}>
                        <Col span={8}>
                            {renderStatCard("Tổng Yêu Cầu", requests.length, ContainerOutlined, STAT_COLORS.requests)}
                        </Col>
                        <Col span={8}>
                            {renderStatCard("Tổng Khảo Sát", surveys.length, FileAddOutlined, STAT_COLORS.surveys)}
                        </Col>
                        <Col span={8}>
                            {renderStatCard("Tổng Báo Giá", quotations.length, DollarOutlined, STAT_COLORS.quotations)}
                        </Col>
                    </Row>
                    {/* ---------------------------------- */}


                    <h2 style={{ marginBottom: 20 }}>
                        {activeMenu === "survey"
                            ? "Quản lý Khảo Sát"
                            : activeMenu === "quotation"
                                ? "Quản lý Báo Giá"
                                : "Dịch vụ Báo Giá"}
                    </h2>

                    {/* ==== KHẢO SÁT ==== */}
                    {activeMenu === "survey" && (
                        <>
                            <Card title="Danh sách yêu cầu" style={{ marginBottom: 20 }}>
                                <RequestList
                                    requests={requests}
                                    onCreateSurvey={handleOpenCreateSurvey}
                                    // !!! TRUYỀN HÀM MỚI VÀO ĐÂY !!!
                                    onViewRequest={handleViewRequest} 
                                />
                            </Card>

                            <Card title="Danh sách khảo sát">
                              <Tabs defaultActiveKey="all">
        <Tabs.TabPane tab="Danh sách khảo sát" key="all">
            <SurveyList
                surveys={surveys}
                onEdit={handleEdit}
                onDelete={handleDelete}
  onCreateQuotation={handleCreateQuotation} // ✅ GIỮ DÒNG NÀY
                onViewSurvey={handleViewSurvey}
            />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Khảo sát theo tầng" key="floors">
            <SurveyFloorList />
        </Tabs.TabPane>
    </Tabs>
                            </Card>
                        </>
                    )}

                    {/* ==== BÁO GIÁ ==== */}
                    {activeMenu === "quotation" && (
                        <Card title="Danh sách báo giá">
                            <QuotationList
                                quotations={quotations}
                                fetchQuotations={fetchQuotations}
                                selectedQuotation={selectedQuotation}
                                setSelectedQuotation={setSelectedQuotation}
                            />
                        </Card>
                    )}

                    {/* ==== DỊCH VỤ BÁO GIÁ ==== */}
                    {activeMenu === "addService" && (
                        <Card title="Thêm dịch vụ vào báo giá">
                            <QuotationAddServices />
                        </Card>
                    )}
                </Content>
            </Layout>

            {/* ==== MODALS ==== */}
            <RequestDetailModal />
            <SurveyDetailModal />

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

        
        </Layout>
    );
};

export default SurveyDashboard;
