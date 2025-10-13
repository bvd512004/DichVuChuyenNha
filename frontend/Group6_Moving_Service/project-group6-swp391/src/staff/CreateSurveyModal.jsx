import React from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Button } from "antd";

export const CreateSurveyModal = ({
  visible,
  form,
  selectedRequest,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Tạo khảo sát mới"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      {selectedRequest && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#f0f0f0",
            borderRadius: 4,
          }}
        >
          <p>
            <strong>Khách hàng:</strong> {selectedRequest.username}
          </p>
          <p>
            <strong>Công ty:</strong> {selectedRequest.companyName}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {selectedRequest.address}
          </p>
        </div>
      )}
      <Form form={form} onFinish={onSubmit} layout="vertical">
        <Form.Item
          label="Ngày khảo sát"
          name="surveyDate"
          rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            showTime
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>

        <Form.Item
          name="addressFrom"
          label="Địa chỉ bắt đầu"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="addressTo"
          label="Địa chỉ đến"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="estimatedWorkers"
          label="Số công nhân ước tính"
          rules={[{ required: true, message: "Vui lòng nhập số công nhân!" }]}
        >
          <InputNumber min={1} max={50} style={{ width: "100%" }} />
        </Form.Item>
         <Form.Item
          name="listService"
          label="Các dịch vụ thêm (bổ sung)"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Tạo khảo sát
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};