import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader } from "../components/Loader";
import ProtectedRoute from "./ProtectedRoute";
import EnrollmentSuccessPage from "../components/user/EnrollmentSuccess";
import MyCourses from "../components/student/StudentEnrollments";
import CourseDetails from "../components/student/LearnCourse";
import PaymentsHistory from "../components/student/StudentPayments";
import AssessmentPlayer from "../components/student/AssessmentConduct";
import CourseProgress from "../components/student/CourseProgress";
import CourseResults from "../components/student/CourseResults";
import SubscriptionPlans from "@/components/student/Subscription";

const NotFound = lazy(() => import("../pages/NotFound"));

const StudentRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<ProtectedRoute allowedRoles={["Student"]} />}>
          <Route
            path="/enrollment-success"
            element={<EnrollmentSuccessPage />}
          />

          <Route path="/payment-success" element={<EnrollmentSuccessPage />} />
          <Route path='/my-enrollments' element={<MyCourses/>}/>
          <Route path="/learn/:courseId" element={<CourseDetails />} />
          <Route path="/payments" element={<PaymentsHistory />} />
          <Route path="/courses/:courseId/assessments/:assessmentId" element={<AssessmentPlayer />} />
          <Route path="/courses/:courseId/results" element={<CourseResults />} />
          <Route path="/progress" element={<CourseProgress/>}/>
          <Route path="/subscription" element={<SubscriptionPlans/>}/>
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default StudentRoutes;
