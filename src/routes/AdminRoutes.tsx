import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "../components/Loader";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminStudents from "../components/admin/AdminStudents";
import RequestsPage from "../pages/admin/RequestsPage";
import CategoryManagement from "../components/admin/CategoryPage";
import AdminInstructors from "../components/admin/AdminInstructors";

const AdminRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        
        {/* Protected Routes for Admins */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/students" element={<AdminStudents />} />
          <Route path="/instructors" element={<AdminInstructors />} />
          <Route path='/requests' element={<RequestsPage/>}/>
          <Route path='/categories' element={<CategoryManagement/>}/>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
