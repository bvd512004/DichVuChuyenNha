import React from "react";
import { Table } from "react-bootstrap";

export default function RoleTable({ roles }) {
    return (
        <Table striped hover responsive>
            <thead className="table-secondary">
                <tr>
                    <th>ID</th>
                    <th>Tên Role</th>
                </tr>
            </thead>
            <tbody>
                {roles.map((role) => (
                    <tr key={role.roleId}>
                        <td>{role.roleId}</td>
                        <td>
                            <strong>{role.roleName}</strong>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}