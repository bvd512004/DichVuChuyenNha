import React from "react";
import { Form as AntForm, Input, Select, Button, message } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import { adminApi } from "../../service/adminApi";

const EMPLOYEE_POSITIONS = ["Worker", "Driver", "Surveyer"];

const schema = Yup.object({
    username: Yup.string().required("Username không được để trống"),
    password: Yup.string().min(6, "Password ít nhất 6 ký tự").required(),
    email: Yup.string().email("Email không hợp lệ").optional(),
    phone: Yup.string()
        .matches(/^[0-9]+$/, "Chỉ được số")
        .min(10, "Số điện thoại ít nhất 10 số")
        .optional(),
    roleId: Yup.number().required("Vui lòng chọn Role"),
    position: Yup.string().when("isEmployee", {
        is: true,
        then: (s) => s.required("Vui lòng chọn vị trí"),
        otherwise: (s) => s.optional(),
    }),
});

const getRoleName = (id, roles) => roles.find((r) => r.roleId === id)?.roleName;

export default function CreateUserForm({ roles, onSuccess }) {
    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
            email: "",
            phone: "",
            roleId: null,
            position: undefined,
            isEmployee: false,
        },
        validationSchema: schema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            const roleName = getRoleName(values.roleId, roles);
            const isEmployee = roleName?.toLowerCase() === "employee";

            const payload = { ...values };
            if (!isEmployee) delete payload.position;
            delete payload.isEmployee;

            try {
                if (isEmployee) {
                    await adminApi.createEmployee(payload);
                } else {
                    await adminApi.createAdmin(payload);
                }
                message.success("Tạo tài khoản thành công!");
                resetForm();
                onSuccess();
            } catch (err) {
                message.error(err.response?.data?.message || "Tạo tài khoản thất bại");
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleRoleChange = (value) => {
        const roleName = getRoleName(value, roles);
        const isEmployee = roleName?.toLowerCase() === "employee";
        formik.setFieldValue("roleId", value);
        formik.setFieldValue("isEmployee", isEmployee);
        if (!isEmployee) formik.setFieldValue("position", undefined);
    };

    const isEmployee = formik.values.isEmployee;

    return (
        <AntForm layout="vertical" onFinish={formik.handleSubmit}>
            {/* Username */}
            <AntForm.Item
                label="Username"
                validateStatus={formik.touched.username && formik.errors.username ? "error" : ""}
                help={formik.touched.username && formik.errors.username}
                required
            >
                <Input
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
            </AntForm.Item>

            {/* Password */}
            <AntForm.Item
                label="Password"
                validateStatus={formik.touched.password && formik.errors.password ? "error" : ""}
                help={formik.touched.password && formik.errors.password}
                required
            >
                <Input.Password
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
            </AntForm.Item>

            {/* Email */}
            <AntForm.Item
                label="Email"
                validateStatus={formik.touched.email && formik.errors.email ? "error" : ""}
                help={formik.touched.email && formik.errors.email}
            >
                <Input
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
            </AntForm.Item>

            {/* Phone */}
            <AntForm.Item
                label="Số điện thoại"
                validateStatus={formik.touched.phone && formik.errors.phone ? "error" : ""}
                help={formik.touched.phone && formik.errors.phone}
            >
                <Input
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
            </AntForm.Item>

            {/* Role */}
            <AntForm.Item
                label="Role"
                validateStatus={formik.touched.roleId && formik.errors.roleId ? "error" : ""}
                help={formik.touched.roleId && formik.errors.roleId}
                required
            >
                <Select
                    placeholder={roles.length === 0 ? "Đang tải roles..." : "Chọn role"}
                    value={formik.values.roleId}
                    onChange={handleRoleChange}
                    onBlur={() => formik.setFieldTouched("roleId", true)}
                    disabled={roles.length === 0}
                >
                    {roles.map((r) => (
                        <Select.Option key={r.roleId} value={r.roleId}>
                            {r.roleName}
                        </Select.Option>
                    ))}
                </Select>
            </AntForm.Item>

            {/* Position */}
            {isEmployee && (
                <AntForm.Item
                    label="Vị trí công việc"
                    validateStatus={formik.touched.position && formik.errors.position ? "error" : ""}
                    help={formik.touched.position && formik.errors.position}
                    required
                >
                    <Select
                        placeholder="Chọn vị trí"
                        value={formik.values.position}
                        onChange={(v) => formik.setFieldValue("position", v)}
                        onBlur={() => formik.setFieldTouched("position", true)}
                    >
                        {EMPLOYEE_POSITIONS.map((p) => (
                            <Select.Option key={p} value={p}>
                                {p}
                            </Select.Option>
                        ))}
                    </Select>
                </AntForm.Item>
            )}

            {/* Submit */}
            <AntForm.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={formik.isSubmitting}
                    style={{ height: 40, fontWeight: 600 }}
                >
                    Tạo tài khoản
                </Button>
            </AntForm.Item>
        </AntForm>
    );
}