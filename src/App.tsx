import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { AdminRoutes, UserRoutes } from "./routes";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "./redux/store";
import { fetchUserData } from "./redux/actions/auth/fetchUserdataAction";

function App() {
  const { userData } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!userData) {
      dispatch(fetchUserData()); 
    }
  }, [dispatch, userData]);

  return (
    <>
      <Routes>
        <Route path="/*" element={<UserRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
