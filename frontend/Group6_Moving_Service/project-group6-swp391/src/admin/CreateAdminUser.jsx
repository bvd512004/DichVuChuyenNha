import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Input, Button, Select, message } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";

const { Option } = Select;

// Mảng các vị trí cố định cho Employee
const EMPLOYEE_POSITIONS = ["Worker", "Driver", "Surveyer"];

// Hàm tìm tên role từ ID (để dùng trong logic hiển thị và validation)
const getRoleNameById = (roleId, allRoles) =>
  allRoles.find((r) => r.roleId === roleId)?.roleName;

// Định nghĩa validation schema với Yup
const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username không được để trống"),
  password: Yup.string()
    .min(6, "Password phải có ít nhất 6 ký tự")
    .required("Password không được để trống"),
  email: Yup.string().email("Email không hợp lệ").notRequired(),
  phone: Yup.string()
    .matches(/^[0-9]+$/, "Số điện thoại chỉ được chứa ký tự số")
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .notRequired(),
  roleId: Yup.number().required("Vui lòng chọn Role"),

  // Validation có điều kiện cho Employee Position
  position: Yup.string().when('roleId', (roleId, schema) => {
    return schema.test(
        'is-employee-position-required',
        'Vui lòng chọn Position cho Employee',
        function(value) {
            // Lấy giá trị isEmployee từ formik state
            const isEmployee = this.parent.isEmployee; 
            if (isEmployee) {
                // Nếu là Employee, Position phải được chọn (khác rỗng/null/undefined)
                return !!value;
            }
            return true;
        }
    );
  }),
});


export default function CreateAdminUser() {
  const [roles, setRoles] = useState([]);
  
  // 1. Load roles từ API
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:8080/api/admin/all-roles", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setRoles(res.data.result || []))
      .catch((err) => {
        console.error(err);
        message.error("Không load được roles");
      });
  }, []);

  // 2. Cấu hình Formik
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      email: "",
      phone: "",
      roleId: null,
      position: undefined, // Dùng undefined cho Select để hiển thị placeholder
      isEmployee: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const token = localStorage.getItem("token");
      const selectedRoleName = getRoleNameById(values.roleId, roles);

      const isEmployee = selectedRoleName === "employee";
      const url = isEmployee
        ? "http://localhost:8080/api/admin/create-employee"
        : "http://localhost:8080/api/admin/create-admin";

      let payload = { ...values };

      // Xóa các trường không cần thiết
      if (!isEmployee) {
        delete payload.position;
      }
      // LOẠI BỎ trường status vì backend sẽ tự set là "Free"
      delete payload.status; 
      delete payload.isEmployee; 
      
      console.log("Payload gửi đi:", payload);

      try {
        const res = await axios.post(url, payload, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        message.success("Tạo tài khoản thành công!");
        console.log(res.data);
        // Reset form và biến cờ
        formik.resetForm({ 
            values: { 
                ...formik.initialValues, 
                isEmployee: false 
            } 
        }); 
      } catch (err) {
        console.error("Lỗi:", err.response?.data || err);
        message.error(
          err.response?.data?.message || "Tạo tài khoản thất bại!"
        );
      }
    },
  });

  // 3. Xử lý thay đổi Role
  const handleRoleChange = (value) => {
    const selectedRoleName = getRoleNameById(value, roles);
    const isEmployee = selectedRoleName === "employee";
    
    // Cập nhật roleId và biến cờ isEmployee cho Formik
    formik.setFieldValue('roleId', value);
    formik.setFieldValue('isEmployee', isEmployee);
    
    // Nếu chuyển từ Employee sang Admin/Khác, xóa giá trị Position
    if (!isEmployee) {
        formik.setFieldValue('position', undefined);
    }
  };
  
  const isEmployeeRole = formik.values.isEmployee;

  return (
    <Form
      onFinish={formik.handleSubmit}
      layout="vertical"
      style={{ maxWidth: 400 }}
    >
      {/* Username */}
      <Form.Item 
        label="Username"
        validateStatus={formik.errors.username && formik.touched.username ? "error" : ""}
        help={formik.errors.username && formik.touched.username ? formik.errors.username : null}
        required
      >
        <Input 
          name="username"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Form.Item>

      {/* Password */}
      <Form.Item 
        label="Password"
        validateStatus={formik.errors.password && formik.touched.password ? "error" : ""}
        help={formik.errors.password && formik.touched.password ? formik.errors.password : null}
        required
      >
        <Input.Password 
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Form.Item>

      {/* Email */}
      <Form.Item 
        label="Email"
        validateStatus={formik.errors.email && formik.touched.email ? "error" : ""}
        help={formik.errors.email && formik.touched.email ? formik.errors.email : null}
      >
        <Input 
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Form.Item>

      {/* Phone */}
      <Form.Item 
        label="Phone"
        validateStatus={formik.errors.phone && formik.touched.phone ? "error" : ""}
        help={formik.errors.phone && formik.touched.phone ? formik.errors.phone : null}
      >
        <Input 
          name="phone"
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </Form.Item>

      {/* Chọn Role */}
      <Form.Item 
        label="Chọn Role"
        validateStatus={formik.errors.roleId && formik.touched.roleId ? "error" : ""}
        help={formik.errors.roleId && formik.touched.roleId ? formik.errors.roleId : null}
        required
      >
        <Select
          name="roleId"
          placeholder="Chọn role"
          value={formik.values.roleId}
          onChange={handleRoleChange} 
          onBlur={() => formik.setFieldTouched('roleId', true)}
        >
          {roles.map((r) => (
            <Option key={r.roleId} value={r.roleId}>
              {r.roleName}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Fields cho Employee */}
      {isEmployeeRole && (
        <>
          <Form.Item
            label="Position"
            validateStatus={formik.errors.position && formik.touched.position ? "error" : ""}
            help={formik.errors.position && formik.touched.position ? formik.errors.position : null}
            required
          >
            <Select 
              name="position"
              placeholder="Chọn vị trí công việc"
              value={formik.values.position}
              onChange={(value) => formik.setFieldValue('position', value)}
              onBlur={() => formik.setFieldTouched('position', true)}
            >
              {EMPLOYEE_POSITIONS.map(p => (
                <Option key={p} value={p}>{p}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* Trường Status đã được loại bỏ */}
        </>
      )}

      {/* Submit Button */}
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          block
          loading={formik.isSubmitting}
        >
          Tạo tài khoản
        </Button>
      </Form.Item>
    </Form>
  );
}