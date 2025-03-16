// import { Routes, Route } from "react-router-dom";
// import UserRoutes from "./routes/UserRoutes";
// import AdminRoutes from "./routes/AdminRoutes";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "./redux/store";
// import { useEffect } from "react";
// import { fetchUserData } from "./redux/actions/auth/fetchUserdataAction"; // Import fetchUserData
// import { logoutUser } from "./redux/actions/auth/logoutUserAction";

// function App() {
//   const { userData, isAuthenticated } = useSelector((state: RootState) => state.user);
//   const dispatch = useDispatch<AppDispatch>();

//   useEffect(() => {
//     if (isAuthenticated && !userData) {
//       dispatch(fetchUserData());
//     }
//   }, [dispatch, isAuthenticated, userData]);

//   useEffect(() => {
//     if (userData?.isBlocked) {
//       dispatch(logoutUser());
//     }
//   }, [userData?.isBlocked, dispatch]);

//   return (
//     <Routes>
//       <Route path="/*" element={<UserRoutes />} />
//       <Route path="/admin/*" element={<AdminRoutes />} />
//     </Routes>
//   );
// }

// export default App;



import { Routes, Route } from "react-router-dom";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./redux/store";
import { useEffect } from "react";
import { fetchUserData } from "./redux/actions/auth/fetchUserdataAction";
import { logoutUser } from "./redux/actions/auth/logoutUserAction";

function App() {
  const { userData, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isAuthenticated && !userData) {
      dispatch(fetchUserData());
    }
  }, [dispatch, isAuthenticated, userData]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      console.log("[App] fetching user data to check block status");
      dispatch(fetchUserData());
    }, 30000);

    return () => clearInterval(intervalId);
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (userData?.isBlocked) {
      console.log("[App] User is blocked, logging out");
      dispatch(logoutUser());
    }
  }, [userData?.isBlocked, userData?.role, dispatch]);

  return (
    <Routes>
      <Route path="/*" element={<UserRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}

export default App;
