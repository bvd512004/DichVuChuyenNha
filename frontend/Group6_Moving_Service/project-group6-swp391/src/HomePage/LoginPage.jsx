import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "./style/LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { Input, Button, Form, Modal } from "antd";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const { login } = useAuth(); // ✅ lấy login từ context


  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      formik.setSubmitting(true);
      try {
        const response = await axios.post("http://localhost:8080/api/auth/login", values);

        // ĐÚNG: response.data.result
        const result = response.data.result;
        const token = result.token;
        const roleId = result.roleId; // Sử dụng roleId để check
        const position = result.position;

        // Lưu token
        localStorage.setItem("token", token);

        // Đọc scope từ JWT (để xác nhận) - giữ để debug nhưng không dùng cho redirect
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log("JWT payload:", payload);  // Log để debug
          const roleFromJwt = payload.roles?.[0]?.toLowerCase() || "";  // Sửa claim thành "roles"
        } catch (err) {
          console.error("Invalid JWT format:", err);  // Sửa message
        }

        // CHUYỂN HƯỚNG dựa trên roleId (an toàn hơn, vì id không đổi case)
        if (roleId === 1) { // admin
          navigate("/admin-dashboard");
        } else if (roleId === 2) { // manager
          navigate("/manager/dashboard");
        } else if (roleId === 3) { // employee
          if (position === "Surveyer") {
            navigate("/survey-dashboard");
          } else {
            navigate("/employee/dashboard");
          }
        } else if (roleId === 4 || roleId === 5) { // customer_individual hoặc customer_company
          navigate("/customer-page");
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert(error.response?.data?.message || "Login failed");
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  const handleSendOtp = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/forgot-password", { email: forgotEmail });
      alert("OTP sent to your email");
      setStep(2);
    } catch (err) {
      alert("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/auth/verify-otp", { email: forgotEmail, otp });
      if (res.data.result) {
        alert("OTP verified");
        setStep(3);
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      alert("Failed to verify OTP");
    }
  };

  const handleResetPassword = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/reset-password", {
        email: forgotEmail,
        otp,
        newPassword,
      });
      alert("Password reset successful");
      setShowForgotModal(false);
      setStep(1);
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      alert("Failed to reset password");
    }
  };

  const handleCloseModal = () => {
    setShowForgotModal(false);
    setStep(1);
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
  };

  return (
    <div className="auth-form">
      <h2 className="auth-title">Chào mừng quay trở lại</h2>
      <p className="auth-subtitle">Hãy đăng nhập tài khoản của bạn</p>

      <Form onFinish={formik.handleSubmit} layout="vertical">
        {/* Email */}
        <Form.Item
          label="Email"
          validateStatus={formik.errors.email && formik.touched.email ? "error" : ""}
          help={formik.errors.email && formik.touched.email ? formik.errors.email : null}
        >
          <Input
            name="email"
            placeholder="Enter your email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Form.Item>

        {/* Password  */}
        <Form.Item
          label="Password"
          validateStatus={formik.errors.password && formik.touched.password ? "error" : ""}
          help={formik.errors.password && formik.touched.password ? formik.errors.password : null}
          className="password-field"
        >
          <Input.Password
            name="password"
            placeholder="Enter your password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="custom-password-input"
          />

        </Form.Item>
        <div className="forgot-text" onClick={() => setShowForgotModal(true)}>
          Quên mật khẩu?
        </div>
        {/* Submit */}
        <Form.Item>
          <Button htmlType="submit" className="auth-btn mt-2" loading={formik.isSubmitting}>
            Login
          </Button>
        </Form.Item>
      </Form>

      <div className="auth-footer">
        <span>Chưa có tài khoản? </span>
        <button type="button" onClick={() => navigate("/customer-register")} className="link-btn">
          Đăng ký ngay
        </button>
      </div>

      {/* Modal Quên mật khẩu */}
      <Modal
        title={<span style={{ fontWeight: 600 }}>Forgot Password</span>}
        open={showForgotModal}
        onCancel={handleCloseModal}
        footer={null}
        closeIcon={<span style={{ fontSize: 18 }}>×</span>}
        width={420}
        centered
      >
        {step === 1 && (
          <>
            <Form.Item label="Email">
              <Input
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </Form.Item>
            <Button className="auth-btn" onClick={handleSendOtp} style={{ width: "100%" }}>
              Send OTP
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <Form.Item label="OTP">
              <Input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </Form.Item>
            <Button className="auth-btn" onClick={handleVerifyOtp} style={{ width: "100%" }}>
              Verify OTP
            </Button>
          </>
        )}
        {step === 3 && (
          <>
            <Form.Item label="New Password">
              <Input.Password
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Item>
            <Button className="auth-btn" onClick={handleResetPassword} style={{ width: "100%" }}>
              Reset Password
            </Button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default LoginPage;