// import { Navigate, Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { RootState } from "../redux/store";

// interface ProtectedRouteProps {
//   allowedRoles: string[];
//   redirectPath?: string;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
//     const user = useSelector((state: RootState) => state.user.userData||state.admin.userData);
//     console.log("User Data from Redux:", user);

//     if (!user || !allowedRoles.includes(user.role || "")) {
//       const redirectPath = user?.role === "Admin" ? "/admin/login" : "/login";
//       return <Navigate to={redirectPath} replace />;
//     }

//     return <Outlet />;
//   };

// export default ProtectedRoute;

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface ProtectedRouteProps {
  allowedRoles: string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith("/admin") || allowedRoles.includes("Admin");

  const userData = useSelector((state: RootState) => state.user.userData);
  const adminData = useSelector((state: RootState) => state.admin.userData);
  const userIsAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const adminIsAuthenticated = useSelector(
    (state: RootState) => state.admin.isAuthenticated
  );

  if (isAdminRoute) {
    if (!adminIsAuthenticated || !adminData) {
      console.log("Redirecting to admin login - not authenticated");
      return <Navigate to="/admin/login" replace />;
    }

    if (!allowedRoles.includes(adminData.role || "")) {
      console.log("Admin doesn't have required role");
      return <Navigate to="/admin/login" replace />;
    }
  } else {
    if (!userIsAuthenticated || !userData) {
      console.log("Redirecting to user login - not authenticated");
      return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(userData.role || "")) {
      console.log("User doesn't have required role");
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
