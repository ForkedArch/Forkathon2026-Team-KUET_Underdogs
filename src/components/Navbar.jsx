import { Link } from "react-router-dom";

// eta reuse hobe jodi lage 

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="navbar-logo-icon">ER</span>

        <span>
          The Empty Room
          <small>KUET SPACE MANAGEMENT</small>
        </span>
      </Link>

      <nav className="navbar-links">
        <Link to="/student/login">Student Login</Link>
        <Link to="/student/signup">Sign Up</Link>
        <Link to="/admin/login" className="admin-nav-link">
          Admin Login
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;