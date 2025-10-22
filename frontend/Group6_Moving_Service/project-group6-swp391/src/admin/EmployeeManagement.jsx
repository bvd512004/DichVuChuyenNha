import React, { useState, useEffect } from 'react';
import { employeeService } from '../service/employee';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPosition, setFilterPosition] = useState('');

  // Form state for editing
  const [editForm, setEditForm] = useState({
    position: '',
    phone: '',
    status: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAllEmployees();
      if (response.code === 1000) {
        setEmployees(response.result || []);
      } else {
        setError(response.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setError('Error fetching employees: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDetail = async (employeeId) => {
    try {
      const response = await employeeService.getEmployeeDetail(employeeId);
      if (response.code === 1000) {
        setSelectedEmployee(response.result);
        setShowDetailModal(true);
      }
    } catch (err) {
      setError('Error fetching employee detail: ' + err.message);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setEditForm({
      position: employee.position || '',
      phone: employee.phone || '',
      status: employee.status || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await employeeService.updateEmployee(editingEmployee.employeeId, editForm);
      if (response.code === 1000) {
        setShowEditModal(false);
        fetchEmployees();
        setEditingEmployee(null);
      } else {
        setError(response.message || 'Failed to update employee');
      }
    } catch (err) {
      setError('Error updating employee: ' + err.message);
    }
  };

  const handleDelete = async (employeeId, employeeName) => {
    if (window.confirm(`Are you sure you want to delete employee ${employeeName}?`)) {
      try {
        const response = await employeeService.deleteEmployee(employeeId);
        if (response.code === 1000) {
          fetchEmployees();
        } else {
          setError(response.message || 'Failed to delete employee');
        }
      } catch (err) {
        setError('Error deleting employee: ' + err.message);
      }
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const statusMatch = !filterStatus || emp.status === filterStatus;
    const positionMatch = !filterPosition || emp.position === filterPosition;
    return statusMatch && positionMatch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-danger';
      case 'on leave': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  if (loading) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div className="employee-management">
      <div className="page-header">
        <h1>Employee Management</h1>
        <p>Manage employee information, positions, and status</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="positionFilter">Filter by Position:</label>
          <select
            id="positionFilter"
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
          >
            <option value="">All Positions</option>
            <option value="Driver">Driver</option>
            <option value="Surveyor">Surveyor</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Position</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.employeeId}>
                <td>{employee.employeeId}</td>
                <td>{employee.username}</td>
                <td>{employee.email}</td>
                <td>{employee.phone}</td>
                <td>{employee.position}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(employee.status)}`}>
                    {employee.status}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => fetchEmployeeDetail(employee.employeeId)}
                    title="View Details"
                  >
                    📋
                  </button>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleEdit(employee)}
                    title="Edit Employee"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(employee.employeeId, employee.username)}
                    title="Delete Employee"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="no-data">No employees found</div>
        )}
      </div>

      {/* Employee Detail Modal */}
      {showDetailModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Employee Details - {selectedEmployee.username}</h2>
              <button
                className="btn-close"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Employee ID:</label>
                  <span>{selectedEmployee.employeeId}</span>
                </div>
                <div className="detail-item">
                  <label>Username:</label>
                  <span>{selectedEmployee.username}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedEmployee.email}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{selectedEmployee.phone}</span>
                </div>
                <div className="detail-item">
                  <label>Position:</label>
                  <span>{selectedEmployee.position}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`badge ${getStatusBadgeClass(selectedEmployee.status)}`}>
                    {selectedEmployee.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Role:</label>
                  <span>{selectedEmployee.roleName}</span>
                </div>
              </div>

              {/* Contract History */}
              {selectedEmployee.contractHistory && selectedEmployee.contractHistory.length > 0 && (
                <div className="contract-history">
                  <h3>Contract History</h3>
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Contract ID</th>
                        <th>Status</th>
                        <th>Assigned Date</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEmployee.contractHistory.map((contract, index) => (
                        <tr key={index}>
                          <td>{contract.contractId}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(contract.contractStatus)}`}>
                              {contract.contractStatus}
                            </span>
                          </td>
                          <td>{contract.assignedTime}</td>
                          <td>{contract.startDate}</td>
                          <td>{contract.endDate}</td>
                          <td>${contract.totalAmount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Employee - {editingEmployee.username}</h2>
              <button
                className="btn-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                <div className="form-group">
                  <label htmlFor="position">Position:</label>
                  <input
                    type="text"
                    id="position"
                    value={editForm.position}
                    onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone:</label>
                  <input
                    type="tel"
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status:</label>
                  <select
                    id="status"
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
