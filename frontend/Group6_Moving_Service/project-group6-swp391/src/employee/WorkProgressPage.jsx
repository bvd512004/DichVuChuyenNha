// src/employee/WorkProgressPage.jsx
import React, { useEffect, useState } from "react";
import workProgressApi from "../service/workprogress";
// import "./WorkProgressPage.css";

const WorkProgressPage = () => {
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Gọi API lấy danh sách tiến độ của nhân viên
  const fetchProgressList = async () => {
    try {
      setLoading(true);
      const res = await workProgressApi.getMyList();
      setProgressList(res.data);
    } catch (err) {
      console.error(err);
      setError("❌ Không thể tải danh sách tiến độ. Vui lòng đăng nhập lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressList();
  }, []);

  // ✅ Cập nhật toàn bộ (mô tả + trạng thái)
  const updateWorkProgress = async (progressId, newStatus, newDesc) => {
    try {
      await workProgressApi.update(progressId, {
        progressStatus: newStatus,
        taskDescription: newDesc,
      });
      fetchProgressList();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật tiến độ:", err);
      alert("Không thể cập nhật tiến độ. Vui lòng thử lại.");
    }
  };

  // ✅ Thay đổi trạng thái
  const handleStatusChange = (progressId, newStatus) => {
    const current = progressList.find((p) => p.progressId === progressId);
    updateWorkProgress(progressId, newStatus, current.taskDescription);
  };

  // ✅ Thay đổi mô tả
  const handleDescriptionChange = (progressId, newDesc) => {
    const current = progressList.find((p) => p.progressId === progressId);
    updateWorkProgress(progressId, current.progressStatus, newDesc);
  };

  if (loading) return <p className="loading">⏳ Đang tải tiến độ...</p>;
  if (error) return <p className="error">{error}</p>;

  // 📊 Thống kê nhanh
  const total = progressList.length;
  const completed = progressList.filter((p) => p.progressStatus === "completed").length;
  const inProgress = progressList.filter((p) => p.progressStatus === "in_progress").length;
  const pending = progressList.filter((p) => p.progressStatus === "pending").length;
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="page-container">
      <h1 className="page-title">📦 Tiến độ công việc</h1>

      {/* 📊 Thống kê */}
      <div className="stats-container">
        <div className="stat-card total">Tổng: {total}</div>
        <div className="stat-card completed">Hoàn thành: {completed}</div>
        <div className="stat-card inprogress">Đang làm: {inProgress}</div>
        <div className="stat-card pending">Chờ xử lý: {pending}</div>
      </div>

      {/* 📈 Thanh tiến độ */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${completionPercent}%` }}>
          {completionPercent}%
        </div>
      </div>

      <button onClick={fetchProgressList} className="refresh-btn">
        🔄 Làm mới
      </button>

      {/* 📋 Danh sách công việc */}
      <div className="task-list">
        <h2>📋 Danh sách công việc chi tiết</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Khách hàng</th>
              <th>Dịch vụ</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Tổng tiền</th>
              <th>Nhân viên</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {progressList.map((wp, index) => (
              <tr key={wp.progressId}>
                <td>{index + 1}</td>
                <td>{wp.customerName || "—"}</td>
                <td>{wp.serviceName || "—"}</td>
                <td>{wp.startDate || "—"}</td>
                <td>{wp.endDate || "—"}</td>
                <td>
                  {wp.totalAmount
                    ? wp.totalAmount.toLocaleString("vi-VN") + " ₫"
                    : "—"}
                </td>
                <td>{wp.employeeName || "—"}</td>
                <td>
                  <input
                    defaultValue={wp.taskDescription}
                    onBlur={(e) =>
                      handleDescriptionChange(wp.progressId, e.target.value)
                    }
                  />
                </td>
                <td>
                  <span className={`status ${wp.progressStatus}`}>
                    {wp.progressStatus}
                  </span>
                </td>
                <td>
                  {wp.updatedAt
                    ? new Date(wp.updatedAt).toLocaleString("vi-VN")
                    : "—"}
                </td>
                <td>
                  <select
                    defaultValue={wp.progressStatus}
                    onChange={(e) =>
                      handleStatusChange(wp.progressId, e.target.value)
                    }
                  >
                    <option value="pending">⏸ Pending</option>
                    <option value="in_progress">⚙ In progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkProgressPage;
