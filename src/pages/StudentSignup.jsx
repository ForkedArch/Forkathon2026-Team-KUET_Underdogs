import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormInput from "../components/FormInput";

function StudentSignup() {
  function handleSubmit(event) {
    event.preventDefault();

    // Supabase student signup will be added here.
    console.log("Student signup submitted");
  }

  return (
    <div className="page-container">
      <Navbar />

      <main className="authentication-main">
        <section className="authentication-info">
          <p className="page-label">STUDENT REGISTRATION</p>

          <h1>
            Find your
            <br />
            <span>space.</span>
          </h1>

          <p>
            Create an account to explore suitable spaces and submit booking
            requests.
          </p>
        </section>

        <section className="authentication-card">
          <p className="card-label">CREATE ACCOUNT</p>
          <h2>Student signup</h2>
          <p className="card-description">
            Enter your student information to continue.
          </p>

          <form className="authentication-form" onSubmit={handleSubmit}>
            <FormInput
              label="Full name"
              id="student-name"
              name="name"
              placeholder="Enter your full name"
              autoComplete="name"
            />

            <FormInput
              label="Student roll"
              id="signup-roll"
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
              id="signup-password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
            />

            <button className="form-submit-button" type="submit">
              Create student account <span>→</span>
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