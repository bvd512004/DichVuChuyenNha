import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="warning"
      title="Thanh toán bị hủy 😕"
      subTitle="Bạn đã hủy hoặc không hoàn tất thanh toán. Hãy thử lại trước khi hợp đồng bị hủy."
      extra={[
        <Button type="primary" key="back" onClick={() => navigate("/customer/contracts")}>
          Quay lại hợp đồng
        </Button>,
      ]}
    />
  );
};

export default PaymentCancelPage;
