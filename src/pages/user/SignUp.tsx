import React, { lazy,Suspense } from 'react';
// import Header from '../../components/common/users/Header';

const UserSignUp = lazy(() => import("@/components/user/UserSignUp"));

const SignUp: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        {/* <Header/> */}
      <UserSignUp />
    </Suspense>
  );
};

export default SignUp;
