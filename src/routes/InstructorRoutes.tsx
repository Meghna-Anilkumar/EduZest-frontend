// src/routes/InstructorRoutes.tsx
import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "../components/Loader";
import ProtectedRoute from "./ProtectedRoute";
import InstructorCoursesPage from "../components/instructor/InstructorCoursePage";
import AddCoursePage from "../components/instructor/courses/AddCourse";
import AddLessonsPage from "../components/instructor/courses/AddLesson";
import InstructorDashboard from "../components/instructor/InstructorDashboard";

const NotFound = lazy(() => import("../pages/NotFound"));

const InstructorRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<ProtectedRoute allowedRoles={["Instructor"]} />}>
          <Route path="/dashboard" element={<InstructorDashboard/>}/>
          <Route path="/courses" element={<InstructorCoursesPage />} />
          <Route path="/courses/create" element={<AddCoursePage />} />
          <Route path="/courses/addLesson" element={<AddLessonsPage/>}/>
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default InstructorRoutes;
