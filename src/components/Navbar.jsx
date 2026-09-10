import { Link, NavLink } from "react-router-dom";

function Navbar({ type = "public", onLogout }) {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="navbar-logo-icon">ER</span>

        <span>
          The Empty Room
          <small>KUET SPACE MANAGEMENT</small>
        </span>
      </Link>

      {type === "student" ? (
        <nav className="navbar-links student-navigation">
          <NavLink to="/student/dashboard">
            Dashboard
          </NavLink>

          <NavLink to="/student/book-space">
            Book a Space
          </NavLink>

          <button
            type="button"
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </nav>
      ) : (
        <nav className="navbar-links">
          <Link to="/student/login">Student Login</Link>
          <Link to="/student/signup">Sign Up</Link>

          <Link to="/admin/login" className="admin-nav-link">
            Admin Login
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Navbar;