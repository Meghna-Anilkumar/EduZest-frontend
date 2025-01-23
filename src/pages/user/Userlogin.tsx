import React, { lazy, Suspense } from "react";
// import Header from '../../components/common/users/Header';

const UserLogin= lazy(() => import("@/components/user/UserLogin"));

const Login: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* <Header/> */}
      <UserLogin />
    </Suspense>
  );
};

export default Login;
