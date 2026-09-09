import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import StudentLogin from "./pages/StudentLogin";
import StudentSignup from "./pages/StudentSignup";
import AdminLogin from "./pages/AdminLogin";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/signup" element={<StudentSignup />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/student/dashboard"
        element={<StudentDashboard />}
      />

      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}
      />
    </Routes>
  );
}

export default App;