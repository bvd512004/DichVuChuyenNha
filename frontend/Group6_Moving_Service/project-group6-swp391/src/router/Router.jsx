// router/Router.js
import React from "react";
import Layout from "../components/Layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "../HomePage/LoginPage";
import HomePage from "../HomePage/HomePage";

import CustomerRegisterForm from "../customer/CustomerRegisterForm";
import UserContractsPage from "../customer/UserContractPage";
import UserRequestsPage from "../customer/UserRequestsPage";
import CustomerPage from "../customer/CustomerPage";
import AnimatedPage from "../components/AnimatedPage";

import LandingPage from "../HomePage/LandingPage";
import ProtectedRoute from "../auth/ProtectRoute";
import AccessDeniedPage from "../auth/AccessDeniedPage";
import AdminDashboard from "../admin/AdminDashBoard";
import ContractAssignment from "../manager/ContractAssigment";
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
import ReviewQuotationManagement from "../manager/ReviewQuotationManagement";
import VehicleAssignment from "../manager/VehicleAssignment";
import PaymentSuccessPage from "../customer/PaymentSuccessPage";
import PaymentCancelPage from "../customer/PaymentCancelPage";
import UserFinalPaymentPage from "../customer/UserFinalPaymentPage";
import ServicePrice from "../admin/ServicePrice";
import ServiceDetail from "../admin/ServiceDetail";
import PaymentSuccessFinalPage from "../customer/PaymentSuccessFinalPage";
const Router = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <LandingPage /> },

        {
          path: "",
          element: <HomePage />
        },
        //         {
        //   path: "contract-assignment",
        //   element: (

        //       <ContractAssignment />

        //   ),

        // },
        {
          path: "user-profile",
          element: <ProfilePage />
        },
        {
          path: "assign-surveyer",
          element: <AssignSurveyer />
        },
        {
          path: "survey-dashboard",
          element: (
            <ProtectedRoute allowedRoles={["employee"]} requiredPosition="Surveyer">
              <SurveyDashboard />
            </ProtectedRoute>
          ),
        },

        {
          path: "price-service",
          element: <PriceTable />
        },
        {
          path: "add-services",
          element: <QuotationAddServices />
        },
        {
          path: "quotations-services",
          element: <QuotationServiceManager />
        },
        {
          path: "quotations-services-list",
          element: <QuotationServiceList />
        },
        {
          path: "review-quotations",
          element: <ReviewQuotationManagement />
        },
        

        // },
        {
          path: "user-profile",
          element: <ProfilePage />
        },
        {
          path: "assign-surveyer",
          element: <AssignSurveyer />
        },
        {
          path: "survey-dashboard",
          element: (
            <ProtectedRoute allowedRoles={["employee"]} requiredPosition="Surveyer">
              <SurveyDashboard />
            </ProtectedRoute>
          ),
        },

        {
          path: "price-service",
          element: <PriceTable />
        },
        {
          path: "add-services",
          element: <QuotationAddServices />
        },
        {
          path: "quotations-services",
          element: <QuotationServiceManager />
        },
        {
          path: "quotations-services-list",
          element: <QuotationServiceList />
        },
        //  {
        //   path:"review-quotations",
        //   element: <ReviewQuotationManagement/>
        // },
        {

          path: "quotation-for-customer",
          element: <QuotationApproval />
        },
        {
          path: "contracts-list-manager",
          element: <QuotationContractList />

        },
        //payment deposit routes
        {
          path: "/payment/success",
          element: <PaymentSuccessPage />,


        },
        {
          path: "/payment/cancel",
          element: <PaymentCancelPage />,
        },
        {
          path: "/payment/final/success",
          element: <PaymentSuccessFinalPage/>,
        },
        
         {
          path: "/customer/final-payments",
          element: <UserFinalPaymentPage />,
        },
          {
          path: "service-admin",
          element: <ServicePrice/>,
        },
        {
          path:"services/:id",
          element:<ServiceDetail/>
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
        { path: "my-requests", element: <UserRequestsPage /> },
        { path: "access-denied", element: <AccessDeniedPage /> },
        { path: "price-service", element: <PriceTable /> },
        { path: "user-profile", element: <ProfilePage /> },
        { path: "add-services", element: <QuotationAddServices /> },
        { path: "quotations-services", element: <QuotationServiceManager /> },
        { path: "quotations-services-list", element: <QuotationServiceList /> },
        { path: "quotation-for-customer", element: <QuotationApproval /> },
        { path: "contracts-list-manager", element: <QuotationContractList /> },
        { path: "/payment/success", element: <PaymentSuccessPage /> },
        { path: "/payment/cancel", element: <PaymentCancelPage /> },
        { path: "/customer/final-payments", element: <UserFinalPaymentPage /> },
        { path: "service-admin", element: <ServicePrice /> },
        { path: "services/:id", element: <ServiceDetail /> },
        { path: "assign-surveyer", element: <AssignSurveyer /> },
        { path: "review-quotations", element: <ReviewQuotationManagement /> },

        // Protected routes
        {
          path: "admin-dashboard",
          element: (
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "survey-dashboard",
          element: (
            <ProtectedRoute allowedRoles={["employee"]} requiredPosition="Surveyer">
              <SurveyDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "contract-assignment",
          element: (
            <ProtectedRoute allowedRoles={["manager"]}>
              <ContractAssignment />
            </ProtectedRoute>
          ),
        },
        { path: "employee/work-progress", element: <WorkProgressPage /> },
        { path: "customer/work-progress", element: <WorkProgressCustomerPage /> },
        { path: "manager/work-progress", element: <ManagerWorkProgressPage /> },
        { path: "manager/work-progress-list", element: <WorkProgressList /> },

        {
          path: "employee/dashboard",
          element: <EmployeeDashboard />,
          children: [
            { path: "work-progress", element: <WorkProgressPage /> },
          ],
        },
        {
          path: "driver/dashboard",
          element: (
            <ProtectedRoute allowedRoles={["employee"]} requiredPosition="Driver">
              <DriverDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "manager/dashboard",
          element: <ManagerDashboard />,
          children: [
            { index: true, element: <ContractAssignment /> },
            { path: "contract-assignment", element: <ContractAssignment /> },
            { path: "assign-surveyer", element: <AssignSurveyer /> },
            { path: "review-quotations", element: <ReviewQuotationManagement /> },
            { path: "contracts-list-manager", element: <QuotationContractList /> },
            { path: "vehicle-assignment", element: <VehicleAssignment /> },
            { path: "manager/work-progress", element: <ManagerWorkProgressPage /> },
            { path: "manager/work-progress-list", element: <WorkProgressList /> },
            { path: "reports", element: <div>Reports Page - Coming Soon</div> },
          ],
        },

        // Fallback 404
        { path: "*", element: <div>404 Not Found - Page does not exist</div> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Router;