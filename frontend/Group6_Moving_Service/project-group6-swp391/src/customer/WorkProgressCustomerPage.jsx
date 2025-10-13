import { useEffect, useState } from "react";
import workProgressApi from "../service/workprogress";

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

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>⏳ Đang tải tiến độ công việc...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        📦 Tiến độ công việc của bạn
      </h1>

      {progressList.length === 0 ? (
        <p>Hiện tại chưa có tiến độ công việc nào.</p>
      ) : (
        progressList.map((item) => (
          <div
            key={item.progressId}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ marginBottom: "8px" }}>Hợp đồng #{item.contractId}</h2>
            <p><strong>Mô tả:</strong> {item.taskDescription}</p>
            <p><strong>Trạng thái:</strong> {item.progressStatus}</p>
            <p><strong>Ngày cập nhật:</strong> {new Date(item.updatedAt).toLocaleString()}</p>
            <p><strong>Dịch vụ:</strong> {item.serviceName}</p>
            <p><strong>Khách hàng:</strong> {item.customerName}</p>
            <p><strong>Tổng tiền:</strong> {item.totalAmount} VND</p>
          </div>
        ))
      )}
    </div>
  );
}

export default WorkProgressCustomerPage;
