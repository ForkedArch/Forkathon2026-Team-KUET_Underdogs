import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

function StudentLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/student/login");
  }

  return (
    <div className="student-page-container">
      <Navbar type="student" onLogout={handleLogout} />
      <Outlet />
    </div>
  );
}

export default StudentLayout;