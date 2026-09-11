import { Link, NavLink } from "react-router-dom";

function Navbar({ type = "public", onLogout }) {
  return (
    <header className="navbar">
      <Link
        to={
          type === "admin"
            ? "/admin/dashboard"
            : type === "student"
              ? "/student/dashboard"
              : "/"
        }
        className="navbar-logo"
      >
        <span className="navbar-logo-icon">ER</span>

        <span>
          The Empty Room
          <small>KUET SPACE MANAGEMENT</small>
        </span>
      </Link>

      {type === "student" && (
        <nav className="navbar-links">
          <NavLink to="/student/dashboard">Dashboard</NavLink>
          <NavLink to="/student/facilities">Facilities</NavLink>
          <NavLink to="/student/book-space">Book a Space</NavLink>

          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </nav>
      )}

      {type === "admin" && (
        <nav className="navbar-links">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/requests">Requests</NavLink>
          <NavLink to="/admin/schedule">Schedule</NavLink>
          <NavLink to="/admin/spaces">Spaces</NavLink>
          <NavLink to="/admin/bookings">History</NavLink>

          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </nav>
      )}

      {type === "public" && (
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