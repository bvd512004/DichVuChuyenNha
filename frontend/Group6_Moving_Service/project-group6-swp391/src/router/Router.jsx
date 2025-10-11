import React from "react";
import Layout from "../components/Layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "../HomePage/LoginPage";
import HomePage from "../HomePage/HomePage";

import CustomerRegisterForm from "../customer/CustomerRegisterForm";
import UserContractsPage from "../customer/UserContractPage";
import UserRequestsPage from "../customer/UserRequestsPage";
import CustomerPage from "../customer/CustomerPage";
import CreateAdminUser from "../admin/CreateAdminUser";
import AnimatedPage from "../components/AnimatedPage";

import LandingPage from "../HomePage/LandingPage";
import ProtectedRoute from "../auth/ProtectRoute";
import AccessDeniedPage from "../auth/AccessDeniedPage";
import AdminDashboard from "../admin/AdminDashBoard";
import ContractAssignment from "../manager/ContractAssigment";
import ProfilePage from "../auth/ProfilePage";
import SurveyDashboard from "../staff/SurveyDashboard";
import PriceTable from "../HomePage/PriceTable";

import WorkProgressPage from "../employee/WorkProgressPage";
import WorkProgressCustomerPage from "../customer/WorkProgressCustomerPage";
import EmployeeDashboard from "../employee/EmployeeDashboard";
import ManagerDashboard from "../manager/ManagerDashboard";
const Router = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <LandingPage /> },
        { path: "", element: <HomePage /> },

        {
          path: "contract-assignment",
          element: (
            <ProtectedRoute allowedRoles={["manager"]}>
              <ContractAssignment />
            </ProtectedRoute>
          ),
        },

        { path: "user-profile", element: <ProfilePage /> },
        { path: "survey-dashboard", element: <SurveyDashboard /> },
        { path: "price-service", element: <PriceTable /> },

        {
          path: "login",
          element: (
            <AnimatedPage>
              <LoginPage />
            </AnimatedPage>
          ),
        },

        {
          path: "customer-register",
          element: (
            <AnimatedPage>
              <CustomerRegisterForm />
            </AnimatedPage>
          ),
        },

        { path: "customer-page", element: <CustomerPage /> },
        { path: "list-contract-unsigned", element: <UserContractsPage /> },
        { path: "my-requests", element: <UserRequestsPage /> },

        // 🛠 Admin routes
        {
          path: "admin-create-user",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateAdminUser />
            </ProtectedRoute>
          ),
        },
        {
          path: "admin-dashboard",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          ),
        },

        // ❌ Access Denied
        { path: "access-denied", element: <AccessDeniedPage /> },

        // 👥 Customer Work Progress
        { path: "customer/work-progress", element: <WorkProgressCustomerPage /> },

{ path: "contract-assignment", element: <ContractAssignment /> },
        // 👷 Employee Dashboard (đúng cấu trúc cha-con)
        {
          path: "employee/dashboard",
          element: <EmployeeDashboard />,
          children: [
            // { index: true, element: <WorkProgressPage /> }, // mặc định khi vào /employee/dashboard
            { path: "work-progress", element: <WorkProgressPage /> },
          ],
        },
        {
          path: "manager/dashboard",
          element: <ManagerDashboard />,
           children: [
            // { index: true, element: <WorkProgressPage /> }, // mặc định khi vào /employee/dashboard
            { path: "contract-assignment", element: <ContractAssignment /> },
          ],
          }
              ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;
