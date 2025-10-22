import React from "react";
import { Modal, Form, Input, InputNumber, DatePicker } from "antd";

export const EditSurveyModal = ({
  visible,
  form,
  onCancel,
  onUpdate,
}) => {
  return (
    <Modal
      title="Chỉnh sửa khảo sát"
      open={visible}
      onOk={onUpdate}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="surveyDate"
          label="Ngày khảo sát"
          rules={[{ required: true }]}
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
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="addressTo"
          label="Địa chỉ đến"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      
        <Form.Item name="status" label="Trạng thái">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};