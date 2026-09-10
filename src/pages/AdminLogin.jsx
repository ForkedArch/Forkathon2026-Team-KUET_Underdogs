import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormInput from "../components/FormInput";
import { signInAdmin } from "../services/authService";

function AdminLogin() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const { error: loginError } = await signInAdmin({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    setSubmitting(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    navigate("/admin/dashboard", {
      replace: true,
    });
  }

  return (
    <div className="page-container">
      <Navbar />

      <main className="authentication-main">
        <section className="authentication-info">
          <p className="page-label admin-label">
            ADMIN ACCESS
          </p>

          <h1>
            Manage campus
            <br />
            <span>spaces.</span>
          </h1>

          <p>
            Review requests, manage spaces and monitor booking
            activity.
          </p>
        </section>

        <section className="authentication-card">
          <p className="card-label admin-card-label">
            ADMIN LOGIN
          </p>

          <h2>Administrator access</h2>

          <p className="card-description">
            Enter the designated administrator’s email and
            password.
          </p>

          {error && (
            <div className="authentication-error">
              {error}
            </div>
          )}

          <form
            className="authentication-form"
            onSubmit={handleSubmit}
          >
            <FormInput
              label="Admin email"
              id="admin-email"
              name="email"
              type="email"
              placeholder="Enter admin email"
              autoComplete="email"
            />

            <FormInput
              label="Password"
              id="admin-password"
              name="password"
              type="password"
              placeholder="Enter admin password"
              autoComplete="current-password"
            />

            <button
              className="form-submit-button admin-submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Logging in..."
                : "Log in as admin →"}
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