import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Input, Button, Select, message } from "antd";
import { useFormik } from "formik"; // 👈 Import Formik
import * as Yup from "yup"; // 👈 Import Yup cho validation

const { Option } = Select;

// Định nghĩa validation schema với Yup
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
  
  // Các trường Company sẽ được thêm vào trong logic handleSubmit,
  // hoặc thêm validation có điều kiện nếu cần hiển thị lỗi ngay.
  // Tuy nhiên, ta sẽ để logic required của các trường này trong JSX và handleSubmit
});


export default function CustomerRegisterForm() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // 1. Load roles từ API (Giữ nguyên)
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/users/roles")
      .then((res) => {
        setRoles(res.data.result || []);
      })
      .catch((err) => {
        console.error(err);
        message.error("Không load được roles!");
      });
  }, []);

  // Hàm tìm tên role từ ID
  const getRoleNameById = (roleId) => 
    roles.find((r) => r.roleId === roleId)?.roleName;

  // 2. Cấu hình Formik
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
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      // Logic onFinish cũ được chuyển vào đây
      let url = "";
      let payload = { ...values };
      const selectedRoleName = getRoleNameById(values.roleId);

      // Cập nhật URL và Payload dựa trên Role
      if (selectedRoleName === "customer_company") {
        url = "http://localhost:8080/api/users/customer-company";
        // Giữ lại companyName, taxCode, address
        delete payload.roleId; // Xóa vì backend /customer-company không cần roleId
        
        // Validation bổ sung cho Company fields
        if (!values.companyName || !values.taxCode || !values.address) {
            message.error("Vui lòng nhập đầy đủ thông tin công ty.");
            return;
        }

      } else {
        url = "http://localhost:8080/api/users/create";
        // Xóa các trường của công ty nếu không phải customer_company
        delete payload.companyName;
        delete payload.taxCode;
        delete payload.address;
      }

      console.log("Payload gửi đi:", payload);

      try {
        const res = await axios.post(url, payload);
        message.success("Đăng ký thành công!");
        console.log("Kết quả:", res.data);
        formik.resetForm(); // Reset formik state
        setSelectedRole(null);
      } catch (err) {
        console.error("Lỗi:", err.response?.data || err);
        message.error(err.response?.data?.message || "Đăng ký thất bại!");
      }
    },
  });

  // 3. Xử lý thay đổi Role riêng
  const handleRoleChange = (value) => {
    setSelectedRole(value);
    formik.setFieldValue('roleId', value); // Cập nhật roleId cho Formik
  };
  
  // Xác định xem có phải role công ty không để hiển thị thêm field
  const isCompanyRole = getRoleNameById(selectedRole) === "customer_company";
  
  // Dùng formik.isSubmitting để disable button
  const isSubmitting = formik.isSubmitting;

  return (
    // 4. Liên kết Form Ant Design với Formik
    <Form
      onFinish={formik.handleSubmit} // Dùng formik.handleSubmit thay vì form.onFinish
      layout="vertical"
      style={{ maxWidth: 500, margin: "0 auto" }}
    >
      {/* 4.1. Username */}
      <Form.Item 
        label="Username"
        validateStatus={formik.errors.username && formik.touched.username ? "error" : ""}
        help={formik.errors.username && formik.touched.username ? formik.errors.username : null}
      >
        <Input 
          name="username"
          placeholder="Nhập username" 
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Form.Item>

      {/* 4.2. Password */}
      <Form.Item 
        label="Password"
        validateStatus={formik.errors.password && formik.touched.password ? "error" : ""}
        help={formik.errors.password && formik.touched.password ? formik.errors.password : null}
      >
        <Input.Password 
          name="password"
          placeholder="Nhập password" 
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Form.Item>

      {/* 4.3. Email */}
      <Form.Item 
        label="Email"
        validateStatus={formik.errors.email && formik.touched.email ? "error" : ""}
        help={formik.errors.email && formik.touched.email ? formik.errors.email : null}
      >
        <Input 
          name="email"
          placeholder="Nhập email" 
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Form.Item>

      {/* 4.4. Phone */}
      <Form.Item 
        label="Phone"
        validateStatus={formik.errors.phone && formik.touched.phone ? "error" : ""}
        help={formik.errors.phone && formik.touched.phone ? formik.errors.phone : null}
      >
        <Input 
          name="phone"
          placeholder="Nhập số điện thoại" 
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Form.Item>

      {/* 4.5. Chọn Role */}
      <Form.Item 
        label="Chọn Role"
        validateStatus={formik.errors.roleId && formik.touched.roleId ? "error" : ""}
        help={formik.errors.roleId && formik.touched.roleId ? formik.errors.roleId : null}
      >
        <Select
          name="roleId"
          placeholder="Chọn role"
          value={formik.values.roleId}
          onChange={handleRoleChange} // Dùng hàm riêng để cập nhật selectedRole và Formik
          onBlur={() => formik.setFieldTouched('roleId', true)}
        >
          {roles.map((r) => (
            <Option key={r.roleId} value={r.roleId}>
              {r.roleName}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* 4.6. Fields cho Customer Company */}
      {isCompanyRole && (
        <>
          <Form.Item
            label="Company Name"
            validateStatus={formik.errors.companyName && formik.touched.companyName ? "error" : ""}
            // Ant Design Form.Item sẽ cần rules, nhưng ta dùng Formik để kiểm soát state, 
            // nên ta dùng help để hiển thị lỗi.
            help={formik.errors.companyName && formik.touched.companyName ? formik.errors.companyName : null}
            required
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
            label="Tax Code"
            validateStatus={formik.errors.taxCode && formik.touched.taxCode ? "error" : ""}
            help={formik.errors.taxCode && formik.touched.taxCode ? formik.errors.taxCode : null}
            required
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
            label="Address"
            validateStatus={formik.errors.address && formik.touched.address ? "error" : ""}
            help={formik.errors.address && formik.touched.address ? formik.errors.address : null}
            required
          >
            <Input 
              name="address"
              placeholder="Nhập địa chỉ" 
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Form.Item>
        </>
      )}

      {/* 4.7. Submit Button */}
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          block
          loading={isSubmitting} // Hiển thị loading khi Formik đang submit
          disabled={!formik.isValid && formik.submitCount > 0} // Disable nếu form không hợp lệ
        >
          Đăng ký
        </Button>
      </Form.Item>
    </Form>
  );
}