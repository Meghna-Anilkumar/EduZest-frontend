import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "../components/Loader";
import UserOTPVerification from "../pages/user/UserOTPVerification";
import UserLogin from "../pages/user/Userlogin";
import EmailForgotPassword from "../components/user/EmailForgotPassword"
import ResetPassword from "../components/user/ResetPassword";


const Home = lazy(() => import("../pages/user/Home"));
const SignUp = lazy(() => import("../pages/user/SignUp"));

const UserRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp-verification" element={<UserOTPVerification />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/email-forgot-pass" element={<EmailForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Suspense>
  );
};

export default UserRoutes;
