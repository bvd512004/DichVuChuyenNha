import React, { useEffect, useState } from "react";
import axios from "axios";

const UserContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const token = localStorage.getItem("token");

  // Lấy danh sách hợp đồng chưa ký của user
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/contracts/unsigned/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContracts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        alert("Không thể tải danh sách hợp đồng.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchContracts();
  }, [token]);

  // Ký hợp đồng
  const handleSign = async (contractId) => {
    if (!agreeTerms) {
      alert("Bạn cần đồng ý với điều khoản trước khi ký!");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/contracts/sign/${contractId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Ký hợp đồng thành công!");
      setContracts((prev) => prev.filter((c) => c.contractId !== contractId));
      setSelectedContract(null);
      setAgreeTerms(false);
    } catch (err) {
      console.error(err);
      alert("❌ Ký hợp đồng thất bại!");
    }
  };

  if (loading)
    return <div style={{ textAlign: "center", marginTop: "30px" }}>Đang tải hợp đồng...</div>;

  if (!contracts.length)
    return <div style={{ textAlign: "center", marginTop: "30px" }}>Bạn không có hợp đồng nào cần ký.</div>;

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", color: "#8B0000" }}>Danh sách hợp đồng chưa ký</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead style={{ backgroundColor: "#8B0000", color: "#fff" }}>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Mã hợp đồng</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Ngày bắt đầu</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Ngày kết thúc</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Tổng tiền</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => (
            <tr key={c.contractId}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{c.contractId}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{c.startDate}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{c.endDate}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {c.totalAmount?.toLocaleString("vi-VN")} ₫
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                <button
                  onClick={() => setSelectedContract(c)}
                  style={{
                    backgroundColor: "#8B0000",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal hiển thị chi tiết hợp đồng */}
      {selectedContract && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              padding: "25px",
              width: "700px",
              maxHeight: "85%",
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ color: "#8B0000" }}>Chi tiết hợp đồng #{selectedContract.contractId}</h3>

            <p><strong>Ngày bắt đầu:</strong> {selectedContract.startDate}</p>
            <p><strong>Ngày kết thúc:</strong> {selectedContract.endDate}</p>
            <p><strong>Tiền cọc:</strong> {selectedContract.depositAmount?.toLocaleString("vi-VN")} ₫</p>
            <p><strong>Tổng tiền hợp đồng:</strong> {selectedContract.totalAmount?.toLocaleString("vi-VN")} ₫</p>
            <p><strong>Tổng tiền báo giá:</strong> {selectedContract.totalPrice?.toLocaleString("vi-VN")} ₫</p>
            <p><strong>Trạng thái:</strong> {selectedContract.status}</p>
            <p><strong>Địa điểm bắt đầu:</strong> {selectedContract.startLocation}</p>
            <p><strong>Địa điểm kết thúc:</strong> {selectedContract.endLocation}</p>
            <hr />

            {/* Danh sách dịch vụ trong báo giá */}
            {selectedContract.services?.length > 0 ? (
              <>
                <h4 style={{ color: "#8B0000", marginTop: "15px" }}>Chi tiết dịch vụ</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                  <thead style={{ backgroundColor: "#f4f4f4" }}>
                    <tr>
                      <th style={{ border: "1px solid #ccc", padding: "6px" }}>Dịch vụ</th>
                      <th style={{ border: "1px solid #ccc", padding: "6px" }}>Loại giá</th>
                      <th style={{ border: "1px solid #ccc", padding: "6px" }}>Số lượng</th>
                      <th style={{ border: "1px solid #ccc", padding: "6px" }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedContract.services.map((s, idx) => (
                      <tr key={idx}>
                        <td style={{ border: "1px solid #ccc", padding: "6px" }}>{s.serviceName}</td>
                        <td style={{ border: "1px solid #ccc", padding: "6px" }}>{s.priceType}</td>
                        <td style={{ border: "1px solid #ccc", padding: "6px" }}>{s.quantity}</td>
                        <td style={{ border: "1px solid #ccc", padding: "6px" }}>
                          {s.subtotal?.toLocaleString("vi-VN")} ₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p style={{ marginTop: "15px" }}>Không có dịch vụ nào trong báo giá.</p>
            )}

            {/* Checkbox đồng ý */}
            <div style={{ marginTop: "15px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ marginRight: "6px" }}
                />
                Tôi đồng ý với các điều khoản của hợp đồng.
              </label>
            </div>

            {/* Nút hành động */}
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                onClick={() => handleSign(selectedContract.contractId)}
                disabled={!agreeTerms}
                style={{
                  padding: "8px 15px",
                  backgroundColor: agreeTerms ? "#8B0000" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: agreeTerms ? "pointer" : "not-allowed",
                  marginRight: "10px",
                }}
              >
                Ký hợp đồng
              </button>
              <button
                onClick={() => {
                  setSelectedContract(null);
                  setAgreeTerms(false);
                }}
                style={{
                  padding: "8px 15px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserContractsPage;
