import { useEffect, useState } from "react";
import { Spin, Empty, Tag, Card } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import workProgressApi from "../service/workprogress";
import "./style/WorkProgressCustomerPage.css";

function WorkProgressCustomerPage() {
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📡 Gọi API lấy danh sách tiến độ của khách hàng
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await workProgressApi.getCustomerList();
        setProgressList(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải tiến độ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🎨 Hàm lấy màu sắc theo trạng thái
  const getStatusConfig = (status) => {
    const statusMap = {
      "Đang thực hiện": { color: "processing", icon: <SyncOutlined spin /> },
      "Hoàn thành": { color: "success", icon: <CheckCircleOutlined /> },
      "Chờ xử lý": { color: "warning", icon: <ClockCircleOutlined /> },
      "Đã hủy": { color: "error", icon: <CloseCircleOutlined /> },
    };
    return statusMap[status] || { color: "default", icon: <ClockCircleOutlined /> };
  };

  if (loading) {
    return (
      <div className="work-progress-customer-page">
        <div className="work-progress-loading">
          <Spin size="large" tip="⏳ Đang tải tiến độ công việc..." />
        </div>
      </div>
    );
  }

  return (
    <div className="work-progress-customer-page">
      {/* Header */}
      <div className="work-progress-header">
        <h1 className="work-progress-header-title">📦 Tiến độ công việc của bạn</h1>
        <p className="work-progress-header-subtitle">
          Theo dõi tiến độ các dịch vụ chuyển nhà của bạn
        </p>
      </div>

      {/* Content */}
      {progressList.length === 0 ? (
        <div className="work-progress-empty">
          <Empty description="Hiện tại chưa có tiến độ công việc nào" />
        </div>
      ) : (
        <div>
          {progressList.map((item) => {
            const statusConfig = getStatusConfig(item.progressStatus);
            
            return (
              <Card key={item.progressId} className="work-progress-card" hoverable>
                {/* Card Header */}
                <div className="work-progress-card-header">
                  <h2 className="work-progress-card-title">Hợp đồng #{item.contractId}</h2>
                  <Tag
                    icon={statusConfig.icon}
                    color={statusConfig.color}
                    className="work-progress-status-tag"
                  >
                    {item.progressStatus}
                  </Tag>
                </div>

                {/* Info Grid */}
                <div className="work-progress-info-grid">
                  <div className="work-progress-info-item">
                    <CalendarOutlined className="work-progress-info-icon" />
                    <div className="work-progress-info-content">
                      <div className="work-progress-info-label">Ngày cập nhật</div>
                      <div className="work-progress-info-value">
                        {new Date(item.updatedAt).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>

                  <div className="work-progress-info-item">
                    <FileTextOutlined className="work-progress-info-icon" />
                    <div className="work-progress-info-content">
                      <div className="work-progress-info-label">Dịch vụ</div>
                      <div className="work-progress-info-value">{item.serviceName}</div>
                    </div>
                  </div>

                  <div className="work-progress-info-item">
                    <UserOutlined className="work-progress-info-icon" />
                    <div className="work-progress-info-content">
                      <div className="work-progress-info-label">Khách hàng</div>
                      <div className="work-progress-info-value">{item.customerName}</div>
                    </div>
                  </div>

                  <div className="work-progress-info-item">
                    <DollarOutlined className="work-progress-info-icon" />
                    <div className="work-progress-info-content">
                      <div className="work-progress-info-label">Tổng tiền</div>
                      <div className="work-progress-info-value">
                        {item.totalAmount?.toLocaleString("vi-VN")} VND
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="work-progress-description">
                  <div className="work-progress-description-title">
                    <FileTextOutlined />
                    Mô tả công việc
                  </div>
                  <p className="work-progress-description-text">
                    {item.taskDescription || "Chưa có mô tả"}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WorkProgressCustomerPage;