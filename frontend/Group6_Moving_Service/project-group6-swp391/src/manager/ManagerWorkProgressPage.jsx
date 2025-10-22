import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { workProgressApi } from "../service/workprogress";
import { assignmentApi } from "../service/assignment";
import "./style/ManagerWorkProgressPage.css";

// ===================== Modal Component =====================
const Modal = ({ show, onClose, children }) => {
  if (!show) return null;

  return ReactDOM.createPortal(
    <div
      className="modal-overlay-portal"
      onClick={(e) => {
        if (e.target.className === "modal-overlay-portal") {
          onClose();
        }
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
        zIndex: 999999,
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

  // ========== Lấy danh sách hợp đồng ==========
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await workProgressApi.getEligibleContracts();
        console.log("✅ Eligible contracts:", res.data);
        setContracts(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách hợp đồng:", err);
      }
    };
    fetchContracts();
  }, []);

  // ========== Lấy danh sách nhân viên cho từng hợp đồng ==========
  const fetchEmployeesForContract = async (contractId) => {
    try {
      const res = await assignmentApi.getAssignmentsByContract(contractId);
      console.log("✅ Assigned employees for contract", contractId, res.data);
      setEmployees(res.data || []);
      return res.data || [];
    } catch (err) {
      console.error("❌ Lỗi lấy nhân viên:", err);
      setEmployees([]);
      return [];
    }
  };

  // ========== Mở modal tạo Work Progress ==========
  const handleOpenCreateModal = async (contractId) => {
    setMessage("");
    setSelectedContract(contractId);
    setEmployees([]);
    setSelectedEmployee(null);
    setTaskDescription("");
    setProgressStatus("pending");

    const loadedEmployees = await fetchEmployeesForContract(contractId);
    if (!loadedEmployees || loadedEmployees.length === 0) {
      alert("⚠️ Hợp đồng này chưa có nhân viên được gán!");
      return;
    }

    setShowModal(true);
  };

  // ========== Đóng modal ==========
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
      employeeId: selectedEmployee, // ✅ chỉ gửi employeeId
      taskDescription: taskDescription.trim(),
      progressStatus,
    };

    console.log("📤 Payload gửi đi:", payload);

    setLoading(true);
    setMessage("");

    try {
      const response = await workProgressApi.createForEmployee(payload);
      console.log("✅ Success:", response);
      setMessage("✅ Tạo Work Progress thành công!");
      alert("✅ Tạo Work Progress thành công!");
      setTimeout(() => handleCloseModal(), 1000);
    } catch (err) {
      console.error("❌ Lỗi tạo Work Progress:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Lỗi không xác định";
      setMessage("❌ Tạo Work Progress thất bại: " + errorMsg);
      alert("❌ Tạo Work Progress thất bại: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ===================== Render =====================
  return (
    <div className="manager-work-progress-container">
      <h2>📋 Quản lý tạo Work Progress</h2>

      {/* Debug */}
      <div
        style={{
          background: showModal ? "#ffeb3b" : "#e0e0e0",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        <strong>Debug:</strong> showModal = {showModal ? "TRUE ✅" : "FALSE ❌"} |{" "}
        employees = {employees.length} | selectedContract ={" "}
        {selectedContract || "none"}
      </div>

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
                    ? `$${Number(c.totalAmount).toLocaleString()}`
                    : "—"}
                </td>
                <td>
                  {c.startLocation || "—"} → {c.endLocation || "—"}
                </td>
                <td>{c.status || "—"}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => {
                      setSelectedContract(c.contractId);
                      fetchEmployeesForContract(c.contractId);
                    }}
                  >
                    Xem nhân viên
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

      {/* Danh sách nhân viên */}
      {selectedContract && !showModal && employees.length > 0 && (
        <div className="employee-list">
          <h3>👷 Nhân viên được gán cho hợp đồng #{selectedContract}</h3>
          <ul>
            {employees.map((e, i) => (
              <li key={i}>
                <strong>{e.username}</strong> — <i>{e.position}</i>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
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

          {/* Chọn nhân viên */}
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

          {/* Mô tả công việc */}
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

          {/* Trạng thái */}
          <div style={{ marginBottom: "20px" }}>
            <label>Trạng thái</label>
            <select
              value={progressStatus}
              onChange={(e) => setProgressStatus(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            >
              <option value="pending">Đang chờ</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>

          {/* Thông báo */}
          {message && (
            <div
              style={{
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "15px",
                backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
                color: message.includes("✅") ? "#155724" : "#721c24",
                border: `1px solid ${
                  message.includes("✅") ? "#c3e6cb" : "#f5c6cb"
                }`,
              }}
            >
              {message}
            </div>
          )}

          {/* Buttons */}
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
