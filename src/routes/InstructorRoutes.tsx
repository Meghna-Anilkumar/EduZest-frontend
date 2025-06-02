// src/routes/InstructorRoutes.tsx
import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "../components/Loader";
import ProtectedRoute from "./ProtectedRoute";
import InstructorCoursesPage from "../components/instructor/InstructorCoursePage";
import AddCoursePage from "../components/instructor/courses/AddCourse";
import AddLessonsPage from "../components/instructor/courses/AddLesson";
import InstructorDashboard from "../components/instructor/InstructorDashboard";
import CourseDetailsPage from "../components/instructor/courses/CourseDetails";
import TransactionsPage from "../components/instructor/InstructorTransactions";
import AssessmentsPage from "../components/instructor/courses/Assessments";
import ChatLayout from "../components/instructor/InstructorChatLayout";
import InstructorChatGroups from "../components/instructor/ChatGroups";
import ExamsPage from "@/components/instructor/courses/ExamsPage";

const NotFound = lazy(() => import("../pages/NotFound"));

const InstructorRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<ProtectedRoute allowedRoles={["Instructor"]} />}>
          <Route path="/dashboard" element={<InstructorDashboard />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/courses" element={<InstructorCoursesPage />} />
          <Route path="/courses/create" element={<AddCoursePage />} />
          <Route path="/courses/addLesson" element={<AddLessonsPage />} />
          <Route
            path="/courseDetails/:courseId"
            element={<CourseDetailsPage />}
          />
          <Route
            path="/courses/:courseId/modules/:moduleTitle/assessments"
            element={<AssessmentsPage />}
          />
          <Route
            path="/courses/:courseId/exams"
            element={<ExamsPage />}
          />
        
          <Route
            path="/chat"
            element={
              <ChatLayout>
                <InstructorChatGroups />
              </ChatLayout>
            }
          />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default InstructorRoutes;
