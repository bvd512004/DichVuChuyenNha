import React from "react";
import { Modal, Form, DatePicker, Button, Input } from "antd";
import dayjs from "dayjs";

export const CreateQuotationModal = ({
  visible,
  form,
  selectedSurvey,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Tạo báo giá mới"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      {selectedSurvey && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#f0f0f0",
            borderRadius: 4,
          }}
        >
          <p>
            <strong>Mã khảo sát:</strong> {selectedSurvey.surveyId}
          </p>
          <p>
            <strong>Ngày khảo sát:</strong>{" "}
            {dayjs(selectedSurvey.surveyDate).format("DD/MM/YYYY HH:mm")}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {selectedSurvey.addressFrom} →{" "}
            {selectedSurvey.addressTo}
          </p>
        </div>
      )}
      <Form form={form} onFinish={onSubmit} layout="vertical">
        <Form.Item
          label="Ngày tạo"
          name="createdAt"
          rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            showTime
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>
        <Form.Item label="Ghi chú" name="description">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Tạo báo giá
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};