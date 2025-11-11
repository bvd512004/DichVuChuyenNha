import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const PaymentSuccessFinalPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="success"
      title="Thanh toán thành công 🎉"
      subTitle="Cảm ơn bạn đã hoàn tất thanh toán số tiền còn lại. Hóa Đơn Của Bạn Sẽ Được Gửi Sớm."
      extra={[
        <Button type="primary" key="home" onClick={() => navigate("/customer-page")}>
          Quay lại trang hợp đồng
        </Button>,
      ]}
    />
  );
};

export default PaymentSuccessFinalPage;
