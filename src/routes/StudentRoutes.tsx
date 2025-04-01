import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "../components/Loader";
import ProtectedRoute from "./ProtectedRoute";
import EnrollmentSuccessPage from "../components/user/Success";

const NotFound = lazy(() => import("../pages/NotFound"));

const StudentRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<ProtectedRoute allowedRoles={["Student"]} />}>
          <Route
            path="/enrollment-success"
            element={<EnrollmentSuccessPage />}
          />

          <Route path="/payment-success" element={<EnrollmentSuccessPage />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default StudentRoutes;
