import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Navbar from "../components/Navbar";
import FormInput from "../components/FormInput";
import { signInStudent } from "../services/authService";

function StudentLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const { error: loginError } = await signInStudent({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    setSubmitting(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    navigate("/student/dashboard", {
      replace: true,
    });
  }

  return (
    <div className="page-container">
      <Navbar />

      <main className="authentication-main">
        <section className="authentication-info">
          <p className="page-label">STUDENT ACCESS</p>

          <h1>
            Welcome
            <br />
            <span>back.</span>
          </h1>

          <p>
            Log in to find spaces and track your booking
            requests.
          </p>
        </section>

        <section className="authentication-card">
          <p className="card-label">STUDENT LOGIN</p>
          <h2>Log in to your account</h2>

          <p className="card-description">
            Enter your email and password.
          </p>

          {location.state?.message && (
            <div className="authentication-success">
              {location.state.message}
            </div>
          )}

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
              label="Email address"
              id="student-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
            />

            <FormInput
              label="Password"
              id="student-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <button
              className="form-submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Logging in..."
                : "Log in as student →"}
            </button>
          </form>

          <p className="form-switch">
            Don&apos;t have an account?{" "}
            <Link to="/student/signup">Sign up</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default StudentLogin;