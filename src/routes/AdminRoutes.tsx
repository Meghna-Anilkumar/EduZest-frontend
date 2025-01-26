import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "../components/Loader";
import AdminLogin from "../pages/admin/AdminLogin";

const AdminRoutes: React.FC = () => {
    return (
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          
        </Routes>
      </Suspense>
    );
  };
  
  export default AdminRoutes;