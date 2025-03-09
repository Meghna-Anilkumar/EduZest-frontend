import React from "react";
import notFoundImage from "@/assets/404_page_cover.jpg";

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
      <img
        src={notFoundImage}
        alt="404 Not Found"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default NotFound;