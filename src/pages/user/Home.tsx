import React, { Suspense, lazy } from "react";

const Header = lazy(() => import("@/components/common/users/Header"));

const Home: React.FC = () => {
  return (
    <>
      <Header />
    </>
  );
};

export default Home;
