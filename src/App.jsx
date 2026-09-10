import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import StudentLogin from "./pages/StudentLogin";
import StudentSignup from "./pages/StudentSignup";
import AdminLogin from "./pages/AdminLogin";
//import StudentDashboard from "./pages/StudentDashboard";
//import AdminDashboard from "./pages/AdminDashboard";
import "./styles/Home.css";
import "./styles/Auth.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/signup" element={<StudentSignup />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ProtectedRoute will be added after Supabase authentication */}
     

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;