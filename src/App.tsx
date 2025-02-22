import { Routes, Route } from "react-router-dom";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./redux/store";
import { useEffect } from "react";
import { fetchUserData } from "./redux/actions/auth/fetchUserdataAction";
import { logoutUser } from "./redux/actions/auth/logoutUserAction";

function App() {
  const { userData, isAuthenticated } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  // useEffect(() => {
  //   if (isAuthenticated && !userData) {
  //     dispatch(fetchUserData());
  //   }
  // }, [dispatch, isAuthenticated, userData]);


  useEffect(() => {
    if (userData?.isBlocked) {
      dispatch(logoutUser());
    }
  }, [userData?.isBlocked, dispatch]);

  return (
    <Routes>
      <Route path="/*" element={<UserRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}

export default App;