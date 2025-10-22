import React, { useEffect, useState } from "react";

const QuotationServiceList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const pageSize = 10;

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/quotation-services");
      const jsonData = await res.json();
      setData(jsonData);
    } catch (error) {
      console.error(error);
      showNotification('error', 'Lấy danh sách dịch vụ thất bại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = searchText
    ? data.filter(item => item.username.toLowerCase().includes(searchText.toLowerCase()))
    : data;

  const calculateTotalByUser = () => {
    const totals = filteredData.reduce((acc, item) => {
      const { username, subtotal } = item;
      if (!acc[username]) {
        acc[username] = { username, total: 0 };
      }
      acc[username].total += subtotal;
      return acc;
    }, {});

    return Object.values(totals);
  };

  const totalByUserData = calculateTotalByUser();

  const updateQuantity = async (id, newQuantity) => {
    try {
      await fetch(`http://localhost:8080/api/quotation-services/${id}?quantity=${newQuantity}`, {
        method: 'PUT'
      });
      showNotification('success', 'Cập nhật số lượng thành công');
      fetchData();
    } catch (error) {
      console.error(error);
      showNotification('error', 'Cập nhật thất bại');
    }
  };

  const handleIncrease = (record) => {
    updateQuantity(record.id, record.quantity + 1);
  };

  const handleDecrease = (record) => {
    if (record.quantity > 1) {
      updateQuantity(record.id, record.quantity - 1);
    } else {
      showNotification('warning', 'Số lượng tối thiểu là 1');
    }
  };

  const showDeleteModal = (record) => {
    setRecordToDelete(record);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
      await fetch(`http://localhost:8080/api/quotation-services/${recordToDelete.id}`, {
        method: 'DELETE'
      });
      showNotification('success', 'Xóa dịch vụ thành công');
      setDeleteModalVisible(false);
      setRecordToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
      showNotification('error', 'Xóa thất bại');
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div style={styles.container}>
      {/* Notification */}
      {notification.show && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'success' ? '#28a745' :
                          notification.type === 'error' ? '#dc3545' : '#ffc107'
        }}>
          {notification.message}
        </div>
      )}

      <div style={styles.content}>
        {/* Back Button */}
        <button onClick={handleBack} style={styles.backButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span style={{ marginLeft: '8px' }}>Quay lại</span>
        </button>

        {/* Header Card */}
        <div style={styles.headerCard}>
          <h1 style={styles.title}>Quotation Services</h1>
          <p style={styles.subtitle}>Quản lý danh sách dịch vụ báo giá</p>
        </div>

        {/* Search Box */}
        <div style={styles.searchCard}>
          <div style={styles.searchContainer}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo username..."
              style={styles.searchInput}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              value={searchText}
            />
            {searchText && (
              <button onClick={() => setSearchText("")} style={styles.clearButton}>
                Xóa
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
          </div>
        ) : (
          <>
            {/* Main Table */}
            <div style={styles.tableCard}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead style={styles.thead}>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Username</th>
                      <th style={styles.th}>Company Name</th>
                      <th style={styles.th}>Service Name</th>
                      <th style={styles.th}>Price Type</th>
                      <th style={styles.th}>Quantity</th>
                      <th style={styles.th}>Subtotal</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((record) => (
                      <tr key={record.id} style={styles.tr}>
                        <td style={styles.td}>{record.id}</td>
                        <td style={{...styles.td, fontWeight: '600'}}>{record.username}</td>
                        <td style={styles.td}>{record.companyName}</td>
                        <td style={styles.td}>{record.serviceName}</td>
                        <td style={styles.td}>{record.priceType}</td>
                        <td style={styles.td}>
                          <div style={styles.quantityContainer}>
                            <button
                              onClick={() => handleDecrease(record)}
                              disabled={record.quantity <= 1}
                              style={{
                                ...styles.quantityButton,
                                opacity: record.quantity <= 1 ? 0.5 : 1,
                                cursor: record.quantity <= 1 ? 'not-allowed' : 'pointer'
                              }}
                            >
                              −
                            </button>
                            <span style={styles.quantityText}>{record.quantity}</span>
                            <button
                              onClick={() => handleIncrease(record)}
                              style={styles.quantityButton}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{...styles.td, fontWeight: '600'}}>${record.subtotal.toFixed(2)}</td>
                        <td style={styles.td}>
                          <button onClick={() => showDeleteModal(record)} style={styles.deleteButton}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            <span style={{ marginLeft: '4px' }}>Xóa</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={styles.pagination}>
                <div style={styles.paginationInfo}>Tổng {filteredData.length} dịch vụ</div>
                <div style={styles.paginationControls}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      ...styles.paginationButton,
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ‹
                  </button>
                  <span style={styles.paginationText}>
                    Trang {currentPage} / {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    style={{
                      ...styles.paginationButton,
                      opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1,
                      cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Table */}
            <div style={styles.summaryCard}>
              <div style={styles.summaryHeader}>
                <h2 style={styles.summaryTitle}>Tổng hợp theo người dùng</h2>
              </div>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead style={styles.summaryThead}>
                    <tr>
                      <th style={styles.summaryTh}>Username</th>
                      <th style={styles.summaryTh}>Tổng tiền (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalByUserData.map((item) => (
                      <tr key={item.username} style={styles.summaryTr}>
                        <td style={styles.summaryTd}>{item.username}</td>
                        <td style={{...styles.summaryTd, fontSize: '18px', fontWeight: 'bold'}}>
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModalVisible && (
        <div style={styles.modalOverlay} onClick={() => setDeleteModalVisible(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Xác nhận xóa</h3>
            <p style={styles.modalText}>Bạn có chắc chắn muốn xóa dịch vụ này?</p>
            {recordToDelete && (
              <div style={styles.modalInfo}>
                <p style={styles.modalInfoText}><strong>Service:</strong> {recordToDelete.serviceName}</p>
                <p style={styles.modalInfoText}><strong>Company:</strong> {recordToDelete.companyName}</p>
              </div>
            )}
            <div style={styles.modalButtons}>
              <button
                onClick={() => {
                  setDeleteModalVisible(false);
                  setRecordToDelete(null);
                }}
                style={styles.cancelButton}
              >
                Hủy
              </button>
              <button onClick={handleDelete} style={styles.confirmButton}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  notification: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: 9999,
    padding: '12px 24px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'slideIn 0.3s ease-out',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    backgroundColor: '#000',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '16px',
    transition: 'background-color 0.2s',
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: '8px',
    marginTop: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6c757d',
    margin: 0,
  },
  searchCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchInput: {
    flex: 1,
    padding: '10px 16px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#6c757d',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '80px 0',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #e0e0e0',
  },
  th: {
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    color: '#495057',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #e0e0e0',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px 24px',
    fontSize: '14px',
    color: '#212529',
  },
  quantityContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  quantityButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'background-color 0.2s',
  },
  quantityText: {
    minWidth: '40px',
    textAlign: 'center',
    fontWeight: '500',
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: 'transparent',
    color: '#dc3545',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderTop: '1px solid #e0e0e0',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#495057',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  paginationButton: {
    padding: '4px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '18px',
  },
  paginationText: {
    fontSize: '14px',
    color: '#495057',
  },
  summaryCard: {
    background: 'linear-gradient(135deg, #212529 0%, #000 100%)',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    border: '1px solid #343a40',
    overflow: 'hidden',
  },
  summaryHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
  },
  summaryThead: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottom: '2px solid rgba(255,255,255,0.2)',
  },
  summaryTh: {
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  summaryTr: {
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    transition: 'background-color 0.2s',
  },
  summaryTd: {
    padding: '16px 24px',
    fontSize: '14px',
    color: 'white',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    maxWidth: '500px',
    width: '90%',
    margin: '16px',
    padding: '24px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: '16px',
    marginTop: 0,
  },
  modalText: {
    fontSize: '14px',
    color: '#495057',
    marginBottom: '16px',
  },
  modalInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    padding: '12px',
    marginBottom: '16px',
  },
  modalInfoText: {
    fontSize: '13px',
    color: '#495057',
    margin: '4px 0',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelButton: {
    padding: '8px 16px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#495057',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  confirmButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
};

export default QuotationServiceList;