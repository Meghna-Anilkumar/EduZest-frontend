import React, { lazy, Suspense } from "react";
import { Route, Routes,} from "react-router-dom";
import { Loader } from "../components/Loader";
import { UserSignUp } from "../components/UserSignUp";
const Home = lazy(() => import("../pages/user/Home"));

const UserRoutes: React.FC = () => {
  // const location = useLocation();
  return (
    <div>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/signup' element={<UserSignUp/>} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default UserRoutes;
