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
import EmployeeManagement from "../admin/EmployeeManagement";
import VehicleManagement from "../vehicles/VehiclesPage";
import AnimatedPage from "../components/AnimatedPage";


import LandingPage from "../HomePage/LandingPage";
import ProtectedRoute from "../auth/ProtectRoute";
import AccessDeniedPage from "../auth/AccessDeniedPage";
import AdminDashboard from "../admin/AdminDashBoard";
import ContractAssignment from "../manager/ContractAssigment";
import CustomerProfile from "../auth/ProfilePage";
import ProfilePage from "../auth/ProfilePage";
import SurveyDashboard from "../staff/SurveyDashboard";
import PriceTable from "../HomePage/PriceTable";
import QuotationServiceManager from "../staff/QuotationServiceManager";
import QuotationServiceList from "../staff/QuotationServiceList";

import WorkProgressPage from "../employee/WorkProgressPage";
import WorkProgressCustomerPage from "../customer/WorkProgressCustomerPage";
import EmployeeDashboard from "../employee/EmployeeDashboard";
import QuotationApproval from "../customer/QuotationApproval";
import ManagerDashboard from "../manager/ManagerDashboard";
import AssignSurveyer from "../manager/AssignSurveyer";
import QuotationAddServices from "../staff/QuotationAddServices";
import QuotationContractList from "../manager/QuotationContractList";
import ManagerWorkProgressPage from "../manager/ManagerWorkProgressPage";
import WorkProgressList from "../manager/WorkProgressList";

const Router = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <LandingPage /> },

        {
          path: "",
          element: <HomePage/>
        },
//         {
//   path: "contract-assignment",
//   element: (
   
//       <ContractAssignment />
   
//   ),
// },
        {
          path:"user-profile",
          element: <ProfilePage/>
        },
           {
          path:"assign-surveyer",
          element: <AssignSurveyer/>
        },
       {
  path:"survey-dashboard",
  element: (
    <ProtectedRoute allowedRoles={["employee"]} requiredPosition="Surveyer">
      <SurveyDashboard />
    </ProtectedRoute>
  ),
},
      
      {
          path:"price-service",
          element: <PriceTable/>
        },
           {
          path:"add-services",
          element: <QuotationAddServices/>
        },
        {
          path:"quotations-services",
          element: <QuotationServiceManager/>
        },
        {
          path:"quotations-services-list",
          element: <QuotationServiceList/>
        },
         {
          path:"review-quotations",
          element: <ReviewQuotationManagement/>
        },
          {
          path: "quotation-for-customer",
          element: <QuotationApproval/>
        },
                {
          path: "contracts-list-manager",
          element: <QuotationContractList/>
        },

  

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

        // Admin routes
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

        {
          path: "employee-management",
          element: (
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <EmployeeManagement />
            </ProtectedRoute>
          ),
        },

        {
          path: "vehicle-management",
          element: (
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <VehicleManagement />
            </ProtectedRoute>
          ),
        },
        {
          path:"my-requests",
          element:<UserRequestsPage/>

        },
        {
          path:"manager/work-progress",
          element:<ManagerWorkProgressPage/>

        },
        {
          path:"manager/work-progress-list",
          element:< WorkProgressList/>

        },

        // user requests (customer)
        { path: "my-requests", element: <UserRequestsPage /> },

        { path: "access-denied", element: <AccessDeniedPage /> },
        { path: "employee/work-progress", element: <WorkProgressPage />},
         { path: "customer/work-progress", element: <WorkProgressCustomerPage />},
         {
          path: "employee/dashboard",
          element: <EmployeeDashboard />,
          children: [
            // { index: true, element: <WorkProgressPage /> }, // mặc định khi vào /employee/dashboard
            { path: "work-progress", element: <WorkProgressPage /> },
            
          ],
        },
         {
          path: "contract-assignment",
          element: (
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <ContractAssignment />
            </ProtectedRoute>
          ),
        },
        {
          path: "manager/dashboard",
          element: <ManagerDashboard />,
          children: [
            // { index: true, element: <ContractAssignment /> }, // mặc định khi vào /manager/dashboard
            { path: "contract-assignment", element: <ContractAssignment /> },
            { path: "manager/work-progress", element: <ManagerWorkProgressPage /> },
             { path: "manager/work-progress-list", element: <WorkProgressList /> },
          ],
        },
         
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;


