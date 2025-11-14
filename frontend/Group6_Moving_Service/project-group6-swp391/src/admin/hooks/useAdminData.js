import { useState, useEffect } from "react";
import { adminApi } from "../../service/adminApi";
import { message } from "antd";
import { useNavigate } from "react-router-dom";  // Thêm import này

export const useAdminData = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();  // Thêm này để dùng navigate

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, rolesData, vehiclesData, logsData] = await Promise.all([
                adminApi.getUsers(),
                adminApi.getRoles(),
                adminApi.getVehicles(),
                // adminApi.getAuditLogs(),
            ]);

            setUsers(usersData);
            setRoles(rolesData);
            setVehicles(vehiclesData);
            // setAuditLogs(logsData);
        } catch (err) {
            console.error("Load data error:", err.response?.data || err.message);
            if (err.response?.status === 403) {
                message.error("Access denied: You don't have permission. Check your role.");
            } else if (err.response?.status === 401) {
                message.error("Session expired. Please login again.");
                localStorage.removeItem("token");
                navigate("/login");  // Sửa dùng navigate
            } else {
                message.error(err.response?.data?.message || "Không thể tải dữ liệu.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            loadData();
        } else {
            message.error("Please login first");
            navigate("/login");  // Sửa dùng navigate
        }
    }, [navigate]);  // Thêm dependency

    const refetchUsers = () => adminApi.getUsers().then(setUsers).catch(err => message.error("Refetch users failed"));
    const refetchVehicles = () => adminApi.getVehicles().then(setVehicles).catch(err => message.error("Refetch vehicles failed"));

    return {
        users,
        roles,
        vehicles,
        // auditLogs,
        loading,
        refetchUsers,
        refetchVehicles,
    };
};