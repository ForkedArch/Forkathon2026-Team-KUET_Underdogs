import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

function AdminLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  return (
    <div className="admin-page-container">
      <Navbar type="admin" onLogout={handleLogout} />
      <Outlet />
    </div>
  );
}

export default AdminLayout;