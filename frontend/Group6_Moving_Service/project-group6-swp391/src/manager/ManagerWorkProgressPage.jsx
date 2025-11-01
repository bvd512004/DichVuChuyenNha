import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { workProgressApi } from "../service/workprogress";
import { assignmentApi } from "../service/assignment";
import damageApi from "../service/damage";
import "./style/ManagerWorkProgressPage.css";
import { Card, Tag, Row, Col, Button, Modal, Input, message } from "antd";

// ===================== Helper function để format ngày =====================
const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// ===================== Modal Component =====================
const ModalComponent = ({ show, onClose, children }) => {
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
  const [loading, setLoading] = useState(false);
  const [msgText, setMsgText] = useState("");

  const [workProgressList, setWorkProgressList] = useState([]);
  const [showWorkProgressModal, setShowWorkProgressModal] = useState(false);

  const [damageList, setDamageList] = useState([]);
  const [selectedDamage, setSelectedDamage] = useState(null);
  const [rejectDescription, setRejectDescription] = useState("");

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

  // ========== Lấy danh sách nhân viên ==========
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

  // ✅ Xem tiến trình + thiệt hại
  const handleViewWorkProgress = async (contractId) => {
    setSelectedContract(contractId);
    try {
      const res = await workProgressApi.getWorkProgressByContract(contractId);
      setWorkProgressList(res.data || []);

      const damageRes = await damageApi.getByContract(contractId);
      setDamageList(damageRes.data || []);

      setShowWorkProgressModal(true);
    } catch (err) {
      console.error("❌ Lỗi khi lấy tiến trình công việc:", err);
      message.error("Không thể tải tiến trình công việc cho hợp đồng này!");
    }
  };

  const handleCloseWorkProgressModal = () => {
    setShowWorkProgressModal(false);
    setWorkProgressList([]);
    setDamageList([]);
  };

  // ========== Tạo Work Progress ==========
  const handleOpenCreateModal = async (contractId) => {
    setMsgText("");
    setSelectedContract(contractId);
    setEmployees([]);
    setSelectedEmployee(null);
    setTaskDescription("");

    const loadedEmployees = await fetchEmployeesForContract(contractId);
    if (!loadedEmployees || loadedEmployees.length === 0) {
      alert("⚠️ Hợp đồng này chưa có nhân viên được gán!");
      return;
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMsgText("");
    setSelectedEmployee(null);
    setTaskDescription("");
  };

  const handleCreateWorkProgress = async () => {
    if (!selectedEmployee) {
      setMsgText("⚠️ Vui lòng chọn nhân viên!");
      return;
    }
    if (!taskDescription.trim()) {
      setMsgText("⚠️ Vui lòng nhập mô tả công việc!");
      return;
    }

    try {
      const existingProgress = await workProgressApi.getWorkProgressByContract(selectedContract);
      const isDuplicate = existingProgress.data?.some(
        (wp) => wp.employeeId === selectedEmployee
      );
      if (isDuplicate) {
        setMsgText("⚠️ Nhân viên này đã có Work Progress cho hợp đồng này!");
        message.warning("⚠️ Nhân viên này đã có Work Progress cho hợp đồng này!");
        return;
      }
    } catch (err) {
      console.error("Error checking existing progress:", err);
    }

    const payload = {
      contractId: selectedContract,
      employeeId: selectedEmployee,
      taskDescription: taskDescription.trim(),
      progressStatus: "pending",
    };

    setLoading(true);
    setMsgText("");

    try {
      await workProgressApi.createForEmployee(payload);
      message.success("✅ Tạo Work Progress thành công!");
      setTimeout(() => handleCloseModal(), 1000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Lỗi không xác định";
      console.error("❌ Lỗi tạo Work Progress:", err);
      setMsgText("❌ " + errorMsg);
      message.error("❌ Tạo Work Progress thất bại: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Quản lý phản hồi thiệt hại
  const handleDamageFeedback = async (damageId, action) => {
    if (action === "reject" && !rejectDescription.trim()) {
      message.warning("⚠️ Vui lòng nhập lý do từ chối!");
      return;
    }

    try {
      const feedback = {
        action: action,
        managerFeedback:
          action === "reject" ? rejectDescription : "Đã duyệt thiệt hại",
      };

      await damageApi.sendManagerFeedback(damageId, feedback);

      message.success(
        action === "approve"
          ? "✅ Đã duyệt thiệt hại"
          : "❌ Đã từ chối thiệt hại"
      );

      setDamageList((prev) =>
        prev.map((dmg) =>
          dmg.damageId === damageId
            ? {
                ...dmg,
                status: action === "approve" ? "approved" : "rejected",
                managerFeedback:
                  action === "reject"
                    ? rejectDescription
                    : "Đã duyệt thiệt hại",
              }
            : dmg
        )
      );

      setSelectedDamage(null);
      setRejectDescription("");
    } catch (err) {
      console.error("❌ Lỗi gửi phản hồi thiệt hại:", err);
      message.error("Không thể gửi phản hồi");
    }
  };

  // ===================== Render =====================
  return (
    <div className="manager-work-progress-container">
      <h2>📋 Quản lý Work Progress</h2>

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
                <td>{formatDate(c.startDate)}</td>
                <td>{formatDate(c.endDate)}</td>
                <td>
                  {c.totalAmount
                    ? `${Number(c.totalAmount).toLocaleString()} ₫`
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

      {/* Modal: Xem tiến trình và thiệt hại */}
      <Modal
        title={`🧱 Tiến Trình & Thiệt Hại - Hợp Đồng #${selectedContract}`}
        open={showWorkProgressModal}
        onCancel={handleCloseWorkProgressModal}
        footer={[
          <Button key="close" onClick={handleCloseWorkProgressModal}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {/* Danh sách công việc */}
        <h3>📋 Công việc</h3>
        {workProgressList.length > 0 ? (
          <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
            {workProgressList.map((wp) => (
              <Col xs={24} sm={12} key={wp.progressId}>
                <Card
                  hoverable
                  bordered={false}
                  style={{
                    borderRadius: 16,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  }}
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>🧱 {wp.serviceName}</span>
                      <Tag
                        color={
                          wp.progressStatus === "completed"
                            ? "green"
                            : wp.progressStatus === "in_progress"
                            ? "blue"
                            : "orange"
                        }
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
                  <p>
                    <strong>Mô tả:</strong> {wp.taskDescription || "—"}
                  </p>
                  <p>
                    <strong>Nhân viên:</strong> {wp.employeeName || "—"}
                  </p>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p style={{ color: "#999", marginBottom: 24 }}>
            Không có công việc nào.
          </p>
        )}

        {/* Danh sách thiệt hại */}
        <h3>⚠️ Thiệt hại phát sinh</h3>
        {damageList.length > 0 ? (
          damageList.map((dmg) => {
            const normalizedStatus = (dmg.status || "").toLowerCase();
            return (
              <Card key={dmg.damageId} style={{ marginBottom: 16 }}>
                <p><strong>Nguyên nhân:</strong> {dmg.cause}</p>
                <p><strong>Chi phí:</strong> {dmg.cost ? `${dmg.cost.toLocaleString()} ₫` : "—"}</p>
                <p><strong>Nhân viên:</strong> {dmg.employeeName || "—"}</p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <Tag
                    color={
                      normalizedStatus === "pending_customer"
                        ? "gold"
                        : normalizedStatus === "pending_manager"
                        ? "blue"
                        : normalizedStatus === "approved"
                        ? "green"
                        : normalizedStatus === "rejected"
                        ? "red"
                        : "default"
                    }
                  >
                    {normalizedStatus === "pending_customer"
                      ? "Chờ khách hàng"
                      : normalizedStatus === "pending_manager"
                      ? "Chờ quản lý"
                      : normalizedStatus === "approved"
                      ? "Đã duyệt"
                      : normalizedStatus === "rejected"
                      ? "Đã từ chối"
                      : "Không xác định"}
                  </Tag>
                </p>

                {/* Feedback hiển thị cho manager */}
                {(dmg.customerFeedback || dmg.managerFeedback) && (
                  <div
                    style={{
                      background: "#fafafa",
                      padding: "10px",
                      borderRadius: "6px",
                      marginTop: "8px",
                    }}
                  >
                    {dmg.customerFeedback && (
                      <p>💬 <b>Phản hồi khách hàng:</b> {dmg.customerFeedback}</p>
                    )}
                    {dmg.managerFeedback && (
                      <p>🧑‍💼 <b>Phản hồi quản lý:</b> {dmg.managerFeedback}</p>
                    )}
                  </div>
                )}

                {dmg.imageUrl && (
                  <img
                    src={dmg.imageUrl}
                    alt="Damage"
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 8,
                      marginTop: 8,
                    }}
                  />
                )}

                {/* Chỉ hiển thị nút phản hồi nếu đang chờ quản lý */}
                {normalizedStatus === "pending_manager" && (
                  <div style={{ marginTop: 12 }}>
                    <Button
                      type="primary"
                      onClick={() => handleDamageFeedback(dmg.damageId, "approve")}
                    >
                      Đồng ý
                    </Button>
                    <Button
                      danger
                      onClick={() => setSelectedDamage(dmg.damageId)}
                      style={{ marginLeft: 8 }}
                    >
                      Từ chối
                    </Button>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <p style={{ color: "#999" }}>Không có thiệt hại nào.</p>
        )}
      </Modal>

      {/* Modal từ chối thiệt hại */}
      <Modal
        title="Nhập lý do từ chối"
        open={selectedDamage !== null}
        onCancel={() => {
          setSelectedDamage(null);
          setRejectDescription("");
        }}
        onOk={() => handleDamageFeedback(selectedDamage, "reject")}
        okText="Gửi"
        cancelText="Hủy"
      >
        <Input.TextArea
          rows={4}
          value={rejectDescription}
          onChange={(e) => setRejectDescription(e.target.value)}
          placeholder="Nhập lý do từ chối..."
        />
      </Modal>

      {/* Modal tạo Work Progress */}
      <ModalComponent show={showModal} onClose={handleCloseModal}>
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

          {msgText && (
            <div
              style={{
                padding: "10px",
                marginBottom: "15px",
                backgroundColor: "#fff2e8",
                border: "1px solid #ffbb96",
                borderRadius: "6px",
                color: "#d4380d",
              }}
            >
              {msgText}
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
                opacity: loading ? 0.6 : 1,
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
                opacity: loading ? 0.6 : 1,
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      </ModalComponent>
    </div>
  );
};

export default ManagerWorkProgressPage;
//fix end 