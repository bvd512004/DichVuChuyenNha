import React, { useEffect, useState } from "react";
import { message, List, Card, Typography, Spin, Rate, Tag } from "antd";
import feedbackApi from "../service/feedbackApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const AllFeedbacksPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await feedbackApi.getAllFeedbacks();
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy feedbacks:", error);
        message.error("Không thể tải danh sách feedbacks.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const getTagColor = (rating) => {
    if (rating >= 5) return "gold";
    if (rating >= 4) return "orange";
    if (rating >= 3) return "green";
    return "red";
  };

  return (
    <div
      style={{
        padding: "40px",
        background: "linear-gradient(to right, #f8fafc, #f0f5ff)",
        minHeight: "100vh",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <Title level={2} style={{ color: "#002766" }}>
          🗣️ Danh sách Feedback Khách Hàng
        </Title>
        <Text type="secondary">
          Xem toàn bộ phản hồi của khách hàng về dịch vụ của bạn
        </Text>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "100px" }}>
          <Spin size="large" tip="Đang tải danh sách feedback..." />
        </div>
      ) : (
        <List
          grid={{ gutter: 24, column: 3 }}
          dataSource={feedbacks}
          renderItem={(feedback) => (
            <List.Item key={feedback.feedbackId}>
              <Card
                hoverable
                bordered={false}
                style={{
                  borderRadius: 16,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  background: "#fff",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div style={{ textAlign: "center" }}>
                  <Tag color={getTagColor(feedback.rating)} style={{ fontSize: 14 }}>
                    {feedback.rating} ★
                  </Tag>
                  <Rate disabled defaultValue={feedback.rating} />
                </div>

                <div style={{ marginTop: 16, minHeight: 80 }}>
                  <Text strong style={{ fontSize: 15 }}>
                    “{feedback.comment || "Không có bình luận."}”
                  </Text>
                </div>

                <div style={{ marginTop: 16, textAlign: "right" }}>
                  <Text type="secondary">
                    {dayjs(feedback.createdAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default AllFeedbacksPage;
