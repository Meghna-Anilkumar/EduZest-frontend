import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface ProtectedRouteProps {
  allowedRoles: string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const user = useSelector((state: RootState) => state.user.userData||state.admin.userData);
    console.log("User Data from Redux:", user);
    
    if (!user || !allowedRoles.includes(user.role || "")) {
      const redirectPath = user?.role === "Admin" ? "/admin/login" : "/login";
      return <Navigate to={redirectPath} replace />;
    }
  
    return <Outlet />;
  };
  

export default ProtectedRoute;
