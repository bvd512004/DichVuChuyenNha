import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const PaymentSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="success"
      title="Thanh toán thành công 🎉"
      subTitle="Cảm ơn bạn đã hoàn tất thanh toán đặt cọc. Hợp đồng của bạn đã được kích hoạt."
      extra={[
        <Button type="primary" key="home" onClick={() => navigate("/customer-page")}>
          Quay lại trang hợp đồng
        </Button>,
      ]}
    />
  );
};

export default PaymentSuccessPage;
