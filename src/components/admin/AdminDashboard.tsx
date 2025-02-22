import React, { lazy, Suspense } from "react";

const Sidebar = lazy(() => import("../../components/common/admin/AdminSidebar"));

export const AdminDashboard: React.FC = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading Sidebar...</div>}>
        <Sidebar />
      </Suspense>

    </div>
  );
};

export default AdminDashboard;
