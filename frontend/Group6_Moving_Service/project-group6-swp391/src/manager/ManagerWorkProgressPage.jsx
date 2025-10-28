import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { workProgressApi } from "../service/workprogress";
import { assignmentApi } from "../service/assignment";
import "./style/ManagerWorkProgressPage.css";
import { Card, Tag, Row, Col } from "antd";

// ===================== Modal Component =====================
const Modal = ({ show, onClose, children }) => {
  if (!show) return null;

  return ReactDOM.createPortal(
    <div
      className="modal-overlay-portal"
      onClick={(e) => {
        if (e.target.className === "modal-overlay-portal") onClose();
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

// ===================== Main Component =====================
const ManagerWorkProgressPage = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [progressStatus, setProgressStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showEmployeeCards, setShowEmployeeCards] = useState(false);

  // ⚡️ Thêm state mới để hiển thị danh sách Work Progress
  const [workProgressList, setWorkProgressList] = useState([]);
  const [showWorkProgressModal, setShowWorkProgressModal] = useState(false);

  // ========== Lấy danh sách hợp đồng ==========
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await workProgressApi.getEligibleContracts();
        setContracts(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách hợp đồng:", err);
      }
    };
    fetchContracts();
  }, []);

  // ========== Lấy danh sách nhân viên cho hợp đồng ==========
  const fetchEmployeesForContract = async (contractId) => {
    try {
      const res = await assignmentApi.getAssignmentsByContract(contractId);
      setEmployees(res.data || []);
      return res.data || [];
    } catch (err) {
      console.error("❌ Lỗi lấy nhân viên:", err);
      setEmployees([]);
      return [];
    }
  };

  // ✅ Xử lý khi nhấn "Xem Tiến Trình"
  const handleViewWorkProgress = async (contractId) => {
    setSelectedContract(contractId);
    try {
      const res = await workProgressApi.getWorkProgressByContract(contractId);
      console.log("📋 Tiến trình công việc:", res.data);
      setWorkProgressList(res.data || []);
      setShowWorkProgressModal(true);
    } catch (err) {
      console.error("❌ Lỗi khi lấy tiến trình công việc:", err);
      alert("Không thể tải tiến trình công việc cho hợp đồng này!");
    }
  };

  // ✅ Đóng modal xem tiến trình
  const handleCloseWorkProgressModal = () => {
    setShowWorkProgressModal(false);
    setWorkProgressList([]);
  };

  // ========== Mở modal tạo Work Progress ==========
  const handleOpenCreateModal = async (contractId) => {
    setMessage("");
    setSelectedContract(contractId);
    setEmployees([]);
    setSelectedEmployee(null);
    setTaskDescription("");
    setProgressStatus("pending"); // Luôn đặt về pending khi mở modal
    setShowEmployeeCards(false);

    const loadedEmployees = await fetchEmployeesForContract(contractId);
    if (!loadedEmployees || loadedEmployees.length === 0) {
      alert("⚠️ Hợp đồng này chưa có nhân viên được gán!");
      return;
    }

    setShowModal(true);
  };

  // ========== Đóng modal tạo Work Progress ==========
  const handleCloseModal = () => {
    setShowModal(false);
    setMessage("");
    setSelectedEmployee(null);
    setTaskDescription("");
    setProgressStatus("pending");
  };

  // ========== Gửi request tạo Work Progress ==========
  const handleCreateWorkProgress = async () => {
    if (!selectedEmployee) {
      setMessage("⚠️ Vui lòng chọn nhân viên!");
      return;
    }
    if (!taskDescription.trim()) {
      setMessage("⚠️ Vui lòng nhập mô tả công việc!");
      return;
    }

    const payload = {
      contractId: selectedContract,
      employeeId: selectedEmployee,
      taskDescription: taskDescription.trim(),
      progressStatus: "pending", // Luôn gửi "pending" khi tạo mới
    };

    setLoading(true);
    setMessage("");

    try {
      const response = await workProgressApi.createForEmployee(payload);
      console.log("✅ Tạo Work Progress thành công:", response);
      alert("✅ Tạo Work Progress thành công!");
      setTimeout(() => handleCloseModal(), 1000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Lỗi không xác định";
      console.error("❌ Lỗi tạo Work Progress:", err);
      alert("❌ Tạo Work Progress thất bại: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ===================== Render =====================
  return (
    <div className="manager-work-progress-container">
      <h2>📋 Quản lý tạo Work Progress</h2>

      {/* Bảng hợp đồng */}
      <table className="contract-table">
        <thead>
          <tr>
            <th>Mã hợp đồng</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Tổng tiền</th>
            <th>Địa điểm (Từ → Đến)</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length > 0 ? (
            contracts.map((c) => (
              <tr key={c.contractId}>
                <td>#{c.contractId}</td>
                <td>{c.startDate || "—"}</td>
                <td>{c.endDate || "—"}</td>
                <td>
                  {c.totalAmount
                    ? `${Number(c.totalAmount).toLocaleString()} VND`
                    : "—"}
                </td>
                <td>
                  {c.startLocation || "—"} → {c.endLocation || "—"}
                </td>
                <td>{c.status || "—"}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => handleViewWorkProgress(c.contractId)}
                  >
                    Xem Tiến Trình
                  </button>{" "}
                  <button
                    className="btn-create"
                    onClick={() => handleOpenCreateModal(c.contractId)}
                  >
                    Tạo Work Progress
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                Không có hợp đồng đủ điều kiện.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ================== Modal Xem Tiến Trình ================== */}
      <Modal show={showWorkProgressModal} onClose={handleCloseWorkProgressModal}>
        <div
          className="modal-content-box"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "10px",
            minWidth: "550px",
            maxWidth: "700px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <h3>🧱 Tiến Trình Công Việc cho Hợp Đồng #{selectedContract}</h3>
          {/* Hiển thị danh sách tiến độ công việc */}
          {workProgressList.length > 0 ? (
            <Row gutter={[20, 20]}>
              {workProgressList.map((wp) => (
                <Col xs={24} sm={12} md={12} lg={12} key={wp.progressId}>
                  <Card
                    hoverable
                    bordered={false}
                    style={{
                      borderRadius: 16,
                      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                      background: "#ffffff",
                      overflow: "hidden",
                    }}
                    title={
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>🧱</span>
                          {wp.serviceName}
                        </span>
                        <Tag
                          color={
                            wp.progressStatus === "completed"
                              ? "success"
                              : wp.progressStatus === "in_progress"
                                ? "processing"
                                : "warning"
                          }
                          style={{
                            fontSize: "0.85rem",
                            padding: "4px 10px",
                            borderRadius: 8,
                            textTransform: "capitalize",
                          }}
                        >
                          {wp.progressStatus === "completed"
                            ? "Hoàn thành"
                            : wp.progressStatus === "in_progress"
                              ? "Đang thực hiện"
                              : "Đang chờ"}
                        </Tag>
                      </div>
                    }
                  >
                    <div style={{ padding: "8px 4px", lineHeight: 1.8 }}>
                      <p><strong>Mô tả công việc:</strong> {wp.taskDescription}</p>
                      <p><strong>Nhân viên thực hiện:</strong> {wp.employeeName}</p>
                      <p><strong>Khách hàng:</strong> {wp.customerName}</p>
                      <p><strong>Dịch vụ:</strong> {wp.serviceName}</p>
                      <p><strong>Ngày hợp đồng:</strong> {wp.startDate} → {wp.endDate}</p>
                      <p><strong>Tổng tiền:</strong> <span style={{ color: "#fa8c16", fontWeight: 600 }}>{wp.totalAmount.toLocaleString()} VND</span></p>
                    </div>

                    <div
                      style={{
                        borderTop: "1px solid #f0f0f0",
                        marginTop: 10,
                        paddingTop: 8,
                        fontSize: "0.85rem",
                        color: "#999",
                        textAlign: "right",
                      }}
                    >
                      Cập nhật lúc: {new Date(wp.updatedAt).toLocaleString()}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
              Không có tiến trình nào cho hợp đồng này.
            </p>
          )}
          <button
            onClick={handleCloseWorkProgressModal}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              marginTop: "10px",
            }}
          >
            Đóng
          </button>
        </div>
      </Modal>

      {/* ================== Modal Tạo Work Progress ================== */}
      <Modal show={showModal} onClose={handleCloseModal}>
        <div
          className="modal-content-box"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            minWidth: "500px",
            maxWidth: "600px",
          }}
        >
          <h3>🧱 Tạo Work Progress cho hợp đồng #{selectedContract}</h3>

          <div style={{ marginBottom: "20px" }}>
            <label>Chọn nhân viên *</label>
            <select
              value={selectedEmployee ?? ""}
              onChange={(e) => setSelectedEmployee(Number(e.target.value))}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            >
              <option value="">-- Chọn nhân viên --</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.username} - {emp.position}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label>Mô tả công việc *</label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows="4"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            />
          </div>

          {/* Hiển thị trạng thái mặc định (không cho thay đổi) */}
          <div style={{ marginBottom: "20px" }}>
            <label>Trạng thái</label>
            <div
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #e0e0e0",
                backgroundColor: "#f5f5f5",
                color: "#666",
              }}
            >
              <span style={{ 
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "4px",
                backgroundColor: "#fff7e6",
                color: "#d48806",
                fontWeight: 500
              }}>
                🕐 Đang chờ
              </span>
            </div>
            <small style={{ color: "#999", fontSize: "0.85rem" }}>
              Trạng thái mặc định khi tạo mới
            </small>
          </div>

          {message && (
            <div style={{
              padding: "10px",
              marginBottom: "15px",
              backgroundColor: "#fff2e8",
              border: "1px solid #ffbb96",
              borderRadius: "6px",
              color: "#d4380d"
            }}>
              {message}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleCreateWorkProgress}
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px 20px",
                backgroundColor: "#4a90e2",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "Đang tạo..." : "Tạo"}
            </button>
            <button
              onClick={handleCloseModal}
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManagerWorkProgressPage;
//end