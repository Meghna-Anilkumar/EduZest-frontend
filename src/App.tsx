import React from "react";
import { Route, Routes } from "react-router-dom";
import { UserRoutes } from "./routes";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        {/* user routes */}
        <Route path="/*" element={<UserRoutes />} />
      </Routes>
    </>
  );
}

export default App;
