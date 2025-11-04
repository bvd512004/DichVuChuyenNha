import React from "react";
import { Table, Badge } from "react-bootstrap";

export default function VehicleTable({ vehicles }) {
    return (
        <Table striped bordered hover responsive>
            <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Loại xe</th>
                    <th>Biển số</th>
                    <th>Sức chứa</th>
                    <th>Trạng thái</th>
                    <th>Tài xế</th>
                </tr>
            </thead>
            <tbody>
                {vehicles.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="text-center text-muted">
                            Không có xe
                        </td>
                    </tr>
                ) : (
                    vehicles.map((v) => (
                        <tr key={v.vehicleId}>
                            <td>{v.vehicleId}</td>
                            <td>{v.vehicleType}</td>
                            <td>{v.licensePlate}</td>
                            <td>{v.capacity}</td>
                            <td>
                                <Badge bg={v.status === "AVAILABLE" ? "success" : "secondary"}>
                                    {v.status}
                                </Badge>
                            </td>
                            <td>{v.driverId || "—"}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </Table>
    );
}