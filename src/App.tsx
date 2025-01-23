import React from "react";
import { Route, Routes } from "react-router-dom";
import { UserRoutes } from "./routes";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {
  return (
    <>
      <Routes>
        {/* user routes */}
        <Route path="/*" element={<UserRoutes />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
