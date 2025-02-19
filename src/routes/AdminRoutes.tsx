import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "../components/Loader";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminStudents from "../components/admin/AdminStudents";

const AdminRoutes: React.FC = () => {
    return (
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminDashboard/>}/>
          <Route path="/students" element={<AdminStudents/>} />
        </Routes>
      </Suspense>
    );
  };
  
  export default AdminRoutes;