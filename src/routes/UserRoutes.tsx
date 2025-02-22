import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "../components/Loader";
import ProtectedRoute from "./ProtectedRoute";
import UserOTPVerification from "../pages/user/UserOTPVerification";
import UserLogin from "../pages/user/Userlogin";
import EmailForgotPassword from "../components/user/EmailForgotPassword";
import ResetPassword from "../components/user/ResetPassword";
import ChangePasswordPage from "../pages/user/ChangePassword";
import InstructorApplicationForm from "../components/instructor/InstructorApply";

const Home = lazy(() => import("../pages/user/Home"));
const SignUp = lazy(() => import("../pages/user/SignUp"));
const StudentProfile = lazy(
  () => import("../components/student/StudentProfile")
);

const UserRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp-verification" element={<UserOTPVerification />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/email-forgot-pass" element={<EmailForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/teach" element={<InstructorApplicationForm />} />


        {/* Protected Routes for Students */}
        <Route element={<ProtectedRoute allowedRoles={["Student"]} />}>
          <Route path="/profile" element={<StudentProfile />} />
        </Route>


        {/* Protected Routes for Instructors */}
        <Route element={<ProtectedRoute allowedRoles={["Instructor"]} />}>
            
        </Route>

      </Routes>
    </Suspense>
  );
};

export default UserRoutes;
