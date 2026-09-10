import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormInput from "../components/FormInput";

function AdminLogin() {
  function handleSubmit(event) {
    event.preventDefault();

    // Supabase admin login will be added here.
    console.log("Admin login submitted");
  }

  return (
    <div className="page-container">
      <Navbar />

      <main className="authentication-main">
        <section className="authentication-info">
          <p className="page-label admin-label">ADMIN ACCESS</p>

          <h1>
            Manage campus
            <br />
            <span>spaces.</span>
          </h1>

          <p>
            Review requests, manage availability and monitor booking activity.
          </p>
        </section>

        <section className="authentication-card">
          <p className="card-label admin-card-label">ADMIN LOGIN</p>
          <h2>Administrator access</h2>

          <p className="card-description">
            This page is restricted to the designated administrator.
          </p>

          <form className="authentication-form" onSubmit={handleSubmit}>
            <FormInput
              label="Admin ID"
              id="admin-id"
              name="adminId"
              placeholder="Enter your admin ID"
              autoComplete="username"
            />

            <FormInput
              label="Password"
              id="admin-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <button
              className="form-submit-button admin-submit-button"
              type="submit"
            >
              Log in as admin <span>→</span>
            </button>
          </form>

          <p className="form-switch">
            Are you a student?{" "}
            <Link to="/student/login">Student login</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default AdminLogin;