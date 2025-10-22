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
         <p><strong>Địa chỉ đi:</strong> {selectedRequest.pickupAddress}</p>
    <p><strong>Địa chỉ đến:</strong> {selectedRequest.destinationAddress}</p>
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
          name="numFloors"
          label="Số tầng của căn nhà"
          rules={[{ required: true, message: "Vui lòng nhập số tầng!" }]}
        >
          <InputNumber min={1} max={50} style={{ width: "100%" }} />
        </Form.Item>

           <Form.Item
          name="distanceKm"
          label="Số cây số vận chuyển"
          rules={[{ required: true, message: "Vui lòng nhập số cây!" }]}
        >
          <InputNumber min={1}  style={{ width: "100%" }} />
        </Form.Item>
             <Form.Item
          name="estimateWorkers"
          label="Số công nhân dự tính"
          rules={[{ required: true, message: "Vui lòng nhập số công nhân dự tính!" }]}
        >
          <InputNumber min={1}  style={{ width: "100%" }} />
        </Form.Item>
          <Form.Item
          name="note"
          label="Ghi chú"
          rules={[{ required: true, message: "Vui lòng nhập số cây!" }]}
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