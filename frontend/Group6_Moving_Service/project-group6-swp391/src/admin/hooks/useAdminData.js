import { useState, useEffect } from "react";
import { adminApi } from "../../service/adminApi";
import { message } from "antd";

export const useAdminData = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, rolesData, vehiclesData, logsData] = await Promise.all([
                adminApi.getUsers(),
                adminApi.getRoles(),
                adminApi.getVehicles(),
                adminApi.getAuditLogs(),
            ]);

            setUsers(usersData);
            setRoles(rolesData);
            setVehicles(vehiclesData);
            setAuditLogs(logsData);
        } catch (err) {
            message.error("Không thể tải dữ liệu");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line
    }, []);

    const refetchUsers = () => adminApi.getUsers().then(setUsers);

    return {
        users,
        roles,
        vehicles,
        auditLogs,
        loading,
        refetchUsers,
    };
};