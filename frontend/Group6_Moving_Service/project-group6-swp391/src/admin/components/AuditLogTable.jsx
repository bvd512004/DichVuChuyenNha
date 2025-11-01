import React from "react";
import { Table, Badge, Alert } from "react-bootstrap";
import moment from "moment";

export default function AuditLogTable({ logs }) {
    if (logs.length === 0) {
        return <Alert variant="info">Chưa có log hệ thống.</Alert>;
    }

    return (
        <Table striped bordered hover responsive>
            <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Hành động</th>
                    <th>Đối tượng</th>
                    <th>ID</th>
                    <th>Thời gian</th>
                </tr>
            </thead>
            <tbody>
                {logs.map((log) => (
                    <tr key={log.logId}>
                        <td>{log.logId}</td>
                        <td>
                            <Badge bg="secondary">{log.username}</Badge>
                        </td>
                        <td>
                            <code>{log.action}</code>
                        </td>
                        <td>{log.entity}</td>
                        <td>{log.entityId}</td>
                        <td>{moment(log.createdAt).format("DD/MM/YYYY HH:mm:ss")}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}