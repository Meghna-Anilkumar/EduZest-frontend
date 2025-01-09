import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "../components/Loader";

const Home = lazy(() => import("../pages/user/Home"));
const SignUp = lazy(() => import("../pages/user/SignUp"));

const UserRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Suspense>
  );
};

export default UserRoutes;
