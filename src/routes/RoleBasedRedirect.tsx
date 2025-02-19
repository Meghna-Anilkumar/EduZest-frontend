import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Navigate } from "react-router-dom";

type RoleRoutes = {
  [key: string]: string;
};

interface RoleBasedRedirectProps {
  roles: RoleRoutes;
}

export const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({
  roles,
}) => {
  const { userData } = useSelector((state: RootState) => state.user);

  if (!userData || !userData.role || !roles[userData.role]) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={roles[userData.role]} replace />;
};
