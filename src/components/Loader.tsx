import React from "react";
import { InfinitySpin } from "react-loader-spinner";

export const Loader: React.FC = (): JSX.Element => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-white flex justify-center items-center z-40">
      <InfinitySpin width="200" color="#04afc9" />
    </div>
  );
};
