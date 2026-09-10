import { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";
import { supabase } from "../lib/supabase";

function ProtectedRoute({ allowedRole, children }) {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setAllowed(!error && profile?.role === allowedRole);
      setLoading(false);
    }

    checkAccess();
  }, [allowedRole]);

  if (loading) {
    return <div className="route-loading">Checking access...</div>;
  }

  if (!allowed) {
    const loginPath =
      allowedRole === "admin"
        ? "/admin/login"
        : "/student/login";

    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;