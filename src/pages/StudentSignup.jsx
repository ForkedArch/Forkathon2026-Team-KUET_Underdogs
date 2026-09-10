import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormInput from "../components/FormInput";
import { signUpStudent } from "../services/authService";

function StudentSignup() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const { error: signupError } = await signUpStudent({
      fullName: formData.get("name"),
      roll: formData.get("roll"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    setSubmitting(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    navigate("/student/login", {
      replace: true,
      state: {
        message:
          "Account created successfully. You can now log in.",
      },
    });
  }

  return (
    <div className="page-container">
      <Navbar />

      <main className="authentication-main">
        <section className="authentication-info">
          <p className="page-label">
            STUDENT REGISTRATION
          </p>

          <h1>
            Find your
            <br />
            <span>space.</span>
          </h1>

          <p>
            Create an account to explore campus spaces and
            submit booking requests.
          </p>
        </section>

        <section className="authentication-card">
          <p className="card-label">CREATE ACCOUNT</p>
          <h2>Student signup</h2>

          <p className="card-description">
            Enter your student information.
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
              label="Full name"
              id="student-name"
              name="name"
              placeholder="Enter your full name"
              autoComplete="name"
            />

            <FormInput
              label="Student roll"
              id="student-roll"
              name="roll"
              placeholder="Enter your student roll"
              inputMode="numeric"
              pattern="[0-9]+"
            />

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
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
            />

            <button
              className="form-submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Creating account..."
                : "Create student account →"}
            </button>
          </form>

          <p className="form-switch">
            Already have an account?{" "}
            <Link to="/student/login">Log in</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default StudentSignup;