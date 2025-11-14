import React from "react";
import { Modal, Table, Badge } from "react-bootstrap";
import moment from "moment";

export default function LoginHistoryModal({ user, history, onHide }) {
    return (
        <Modal centered show onHide={onHide} size="lg" dialogClassName="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Lịch sử đăng nhập - {user?.username}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table striped hover responsive>
                    <thead>
                        <tr>
                            <th>Đăng nhập</th>
                            <th>Đăng xuất</th>
                            <th>IP</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((h, i) => (
                            <tr key={i}>
                                <td>{moment(h.loginTime).format("DD/MM HH:mm")}</td>
                                <td>{h.logoutTime ? moment(h.logoutTime).format("DD/MM HH:mm") : "Đang hoạt động"}</td>
                                <td><code>{h.ipAddress}</code></td>
                                <td>
                                    <Badge bg={h.status === "SUCCESS" ? "success" : "danger"}>
                                        {h.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Modal.Body>
        </Modal>
    );
}