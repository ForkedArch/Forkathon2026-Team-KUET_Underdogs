import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import StudentLogin from "./pages/StudentLogin";
import StudentSignup from "./pages/StudentSignup";
import AdminLogin from "./pages/AdminLogin";

import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";
import BookingPage from "./pages/BookingPage";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRequests from "./pages/AdminRequests";
import ManageSpaces from "./pages/ManageSpaces";
import AdminBookings from "./pages/AdminBookings";
import Facilities from "./pages/Facilities";


import ProtectedRoute from "./components/ProtectedRoute";

import "./styles/Home.css";
import "./styles/Auth.css";
import "./styles/Student.css";
import "./styles/Admin.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/signup" element={<StudentSignup />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="/student/facilities" element={<Facilities />} />
        <Route path="book-space" element={<BookingPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="spaces" element={<ManageSpaces />} />
        <Route path="bookings" element={<AdminBookings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;