import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "../components/Loader";
import ProtectedRoute from "./ProtectedRoute";
import UserOTPVerification from "../pages/user/UserOTPVerification";
import UserLogin from "../pages/user/Userlogin";
import EmailForgotPassword from "../components/user/EmailForgotPassword";
import ResetPassword from "../components/user/ResetPassword";
import ChangePasswordPage from "../pages/user/ChangePassword";
import InstructorApplicationForm from "../components/user/InstructorApply";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";


const Home = lazy(() => import("../pages/user/Home"));
const SignUp = lazy(() => import("../pages/user/SignUp"));
const StudentProfile = lazy(
  () => import("../components/student/StudentProfile")
);
const InstructorProfilePage = lazy(
  () => import("../components/instructor/InstructorProfile")
);
const NotFound=lazy(()=>import("../pages/NotFound"))

const UserRoutes: React.FC = () => {
  const userRole = useSelector((state: RootState) => state.user.userData?.role);

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp-verification" element={<UserOTPVerification />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/email-forgot-pass" element={<EmailForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/teach" element={<InstructorApplicationForm />} />
        <Route path="/teach">
          {userRole === "Instructor" ? (
            <Route element={<ProtectedRoute allowedRoles={["Instructor"]} />}>
              <Route index element={<InstructorProfilePage />} />
            </Route>
          ) : (
            <Route index element={<InstructorApplicationForm />} />
          )}
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={["Student", "Instructor"]} />}
        >
          <Route
            path="/profile"
            element={
              userRole === "Student" ? (
                <StudentProfile />
              ) : (
                <InstructorProfilePage />
              )
            }
          />
        </Route>
         

        {/*404 page*/}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default UserRoutes;
