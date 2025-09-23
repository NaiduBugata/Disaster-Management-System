import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing";
import StudentLogin from "./pages/studentlogin";
import AdminRegister from "./pages/adminregister";
import AdminLogin from "./pages/adminlogin";
import LoginDashboard from "./pages/logindashboard";
import AdminDashboard from "./pages/admindashboard";
import SchoolLogin from "./pages/schoollogin";
import SchoolDashboard from "./pages/schooldashboard";
import StudentDashboard from "./pages/studentdashboard";
import ALERTS from "./pages/alerts";
import AdminCourseForm from "./pages/modules/AdminCourseForm";
import Courses from "./pages/modules/Courses";
import CourseDetails from "./pages/modules/CourseDetail";
import Module from "./pages/modules/Module";
import ModuleView from "./pages/modules/ModuleView";
import Quiz from "../src/components/Quiz";
import Exam from "../src/components/Exam";
import CoursePlayer from "./pages/modules/CoursePlayer";
import ExamPlayer from "./components/activities/ExamPlayer";
import FlashcardPlayer from "./components/activities/FlashcardPlayer";
import FeynmanPractice from "./components/activities/FeynmanPractice";
import CourseCard from "./components/CourseCard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        {/* Login Dashboard */}
        <Route path="/logindashboard" element={<LoginDashboard />} />
        <Route path="/alerts" element={<ALERTS />} />

        {/* Student Routes */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/dashboard/:id" element={<StudentDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-course" element={<AdminCourseForm />} />

        {/*School Routes */}
        <Route path="/schoollogin" element={<SchoolLogin />} />
        <Route path="/schools/dashboard/:id" element={<SchoolDashboard />} />

        {/*Courses Route */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/courses/module/:moduleId" element={<ModuleView />} />
        <Route path="/courses/:courseId/module/:moduleId" element={<Module />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/courses/:courseId/player" element={<CoursePlayer />} />
        <Route path="/exam-player" element={<ExamPlayer />} />
        <Route path="/flashcard-player" element={<FlashcardPlayer />} />
        <Route path="/feynman-practice" element={<FeynmanPractice />} />
        <Route path="/course-card" element={<CourseCard />} />
        <Route path="/pages/modules/Modules" element={<Module />} />
        <Route path="/pages/modules/Moduleview" element={<ModuleView />} />

      </Routes>
    </Router>
  );
}

export default App;
