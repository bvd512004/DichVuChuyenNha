import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Input, Button, Select, message } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./style/CustomerRegisterForm.css";

const { Option } = Select;

const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username không được để trống"),
  password: Yup.string()
    .min(6, "Password phải có ít nhất 6 ký tự")
    .required("Password không được để trống"),
  email: Yup.string()
    .email("Email không hợp lệ")
    .required("Email không được để trống"),
  phone: Yup.string()
    .matches(/^[0-9]+$/, "Số điện thoại chỉ được chứa ký tự số")
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .required("Số điện thoại không được để trống"),
  roleId: Yup.number().required("Vui lòng chọn Role"),
});

export default function CustomerRegisterForm() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/users/roles")
      .then((res) => {
        setRoles(res.data.result || []);
      })
      .catch((err) => {
        console.error(err); // thêm log
        message.error("Không load được roles! " + err.message);
      });
  }, []);

  const getRoleNameById = (roleId) =>
    roles.find((r) => r.roleId === roleId)?.roleName;

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      email: "",
      phone: "",
      roleId: null,
      companyName: "",
      taxCode: "",
      address: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      let url = "";
      let payload = { ...values };
      const selectedRoleName = getRoleNameById(values.roleId);

      if (selectedRoleName === "customer_company") {
        url = "http://localhost:8080/api/users/customer-company";
        delete payload.roleId;

        if (!values.companyName || !values.taxCode || !values.address) {
          message.error("Vui lòng nhập đầy đủ thông tin công ty.");
          return;
        }
      } else {
        url = "http://localhost:8080/api/users/create";
        delete payload.companyName;
        delete payload.taxCode;
        delete payload.address;
      }

      try {
        await axios.post(url, payload);
        message.success("Đăng ký thành công!");
        formik.resetForm();
        setSelectedRole(null);
      } catch (err) {
        message.error(err.response?.data?.message || "Đăng ký thất bại!");
      }
    },
  });

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    formik.setFieldValue("roleId", value);
  };

  const isCompanyRole = getRoleNameById(selectedRole) === "customer_company";

  return (
    <div className="auth-form">
      <h2 className="auth-title">Đăng ký tài khoản</h2>
      <p className="auth-subtitle">Vui lòng điền đầy đủ thông tin</p>

      <Form onFinish={formik.handleSubmit} layout="vertical">
        {/* Username */}
        <Form.Item
          label="Username"
          validateStatus={formik.errors.username && formik.touched.username ? "error" : ""}
          help={formik.touched.username && formik.errors.username}
        >
          <Input
            name="username"
            placeholder="Nhập username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Form.Item>

        {/* Password */}
        <Form.Item
          label="Password"
          validateStatus={formik.errors.password && formik.touched.password ? "error" : ""}
          help={formik.touched.password && formik.errors.password}
          className="password-field"
        >
          <Input.Password
            name="password"
            placeholder="Nhập password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="custom-password-input"
          />
        </Form.Item>

        {/* Email */}
        <Form.Item
          label="Email"
          validateStatus={formik.errors.email && formik.touched.email ? "error" : ""}
          help={formik.touched.email && formik.errors.email}
        >
          <Input
            name="email"
            placeholder="Nhập email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Form.Item>

        {/* Phone */}
        <Form.Item
          label="Phone"
          validateStatus={formik.errors.phone && formik.touched.phone ? "error" : ""}
          help={formik.touched.phone && formik.errors.phone}
        >
          <Input
            name="phone"
            placeholder="Nhập số điện thoại"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Form.Item>

        {/* Role */}
        <Form.Item
          label="Chọn Role"
          validateStatus={formik.errors.roleId && formik.touched.roleId ? "error" : ""}
          help={formik.touched.roleId && formik.errors.roleId}
          style={{ marginBottom: isCompanyRole ? 8 : 18 }}
        >
          <Select
            placeholder="Chọn role"
            value={formik.values.roleId}
            onChange={handleRoleChange}
            onBlur={() => formik.setFieldTouched("roleId", true)}
          >
            {roles.map((r) => (
              <Option key={r.roleId} value={r.roleId}>
                {r.roleName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Company Fields - KHÔNG CÓ DẤU * */}
        {isCompanyRole && (
          <div className="company-fields">
            <Form.Item
              label="Tên công ty"
              className="mt-4"
              validateStatus={
                formik.touched.companyName && !formik.values.companyName ? "error" : ""
              }
              help={
                formik.touched.companyName && !formik.values.companyName
                  ? "Vui lòng nhập tên công ty"
                  : null
              }
            >
              <Input
                name="companyName"
                placeholder="Nhập tên công ty"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>

            <Form.Item
              label="Mã số thuế"
              validateStatus={
                formik.touched.taxCode && !formik.values.taxCode ? "error" : ""
              }
              help={
                formik.touched.taxCode && !formik.values.taxCode
                  ? "Vui lòng nhập mã số thuế"
                  : null
              }
            >
              <Input
                name="taxCode"
                placeholder="Nhập mã số thuế"
                value={formik.values.taxCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>

            <Form.Item
              label="Địa Chỉ"
              validateStatus={
                formik.touched.address && !formik.values.address ? "error" : ""
              }
              help={
                formik.touched.address && !formik.values.address
                  ? "Vui lòng nhập địa chỉ"
                  : null
              }
            >
              <Input
                name="address"
                placeholder="Nhập địa chỉ"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>
          </div>
        )}

        {/* Submit */}
        <Form.Item>
          <Button
            htmlType="submit"
            className="auth-btn mt-3"
            loading={formik.isSubmitting}
          >
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}