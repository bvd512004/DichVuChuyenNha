import React from "react";
import { Modal } from "react-bootstrap";
import CreateUserForm from "./CreateUserForm";

export default function CreateUserModal({ show, onHide, roles, onSuccess }) {
    return (
        <Modal centered show={show} onHide={onHide} dialogClassName="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Tạo Người Dùng Mới</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <CreateUserForm roles={roles} onSuccess={onSuccess} />
            </Modal.Body>
        </Modal>
    );
}