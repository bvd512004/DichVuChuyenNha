import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "./style/LoginPage.css";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        values
      );

      // Lấy dữ liệu từ backend (AuthenticationResponse)
      const { token, userId, username, roleId, roleName } =
        response.data.result;

      // Lưu vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);
      localStorage.setItem("roleId", roleId);
      localStorage.setItem("roleName", roleName);

      alert("Login successful!");

      // Điều hướng theo roleId
      if (roleId === 4 || roleId === 5) {
        navigate("/customer-page");
      } else {
        navigate("/"); // ví dụ: admin/manager → home
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
      setSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      await axios.post("http://localhost:8080/api/auth/forgot-password", { email: forgotEmail });
      alert("OTP sent to your email");
      setStep(2);
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
      setShowForgot(false);
      setStep(1);
    } catch (err) {
      console.error(err);
      alert("Failed to reset password");
    }
  };

  return (
    <div className="auth-form">
      {!showForgot ? (
        <>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Please login to your account</p>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="form-group">
                  <label>Email</label>
                  <Field
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Enter your email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error-text"
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <Field type="password" name="password" className="form-input" />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="error-text"
                  />
                  <div className="forgot-text" onClick={() => setShowForgot(true)}>Quên mật khẩu?</div>
                </div>

                <button type="submit" className="auth-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>

                <div style={{ marginTop: "15px", textAlign: "center" }}>
                  <span>Chưa có tài khoản? </span>
                  <button
                    type="button"
                    onClick={() => navigate("/customer-register")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#8B0000",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Đăng ký ngay
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </>
      ) : (
        <>
          <h2>Forgot Password</h2>
          {step === 1 && (
            <>
              <Input
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              <Button onClick={handleSendOtp}>Send OTP</Button>
            </>
          )}
          {step === 2 && (
            <>
              <Input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button onClick={handleVerifyOtp}>Verify OTP</Button>
            </>
          )}
          {step === 3 && (
            <>
              <Input.Password
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button onClick={handleResetPassword}>Reset Password</Button>
            </>
          )}
          <Button onClick={() => setShowForgot(false)}>Back to Login</Button>
        </>
      )}
    </div>
  );
};

export default LoginPage;
