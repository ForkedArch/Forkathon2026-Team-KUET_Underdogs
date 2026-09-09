import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormInput from "../components/FormInput";

// Homepage to Login as student to StudentLogin.jsx

function StudentLogin() {
  function handleSubmit(event) {
    event.preventDefault();

    // Supabase student login will be added here. 
    // Adil taratari shesh koira add kor
    console.log("Student login submitted");
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
            Log in to find campus spaces, request bookings and track your
            booking status.
          </p>
        </section>

        <section className="authentication-card">
          <p className="card-label">STUDENT LOGIN</p>
          <h2>Log in to your account</h2>
          <p className="card-description">
            Enter your student roll and password.
          </p>

          <form className="authentication-form" onSubmit={handleSubmit}>
            <FormInput
              label="Student roll"
              id="student-roll"
              name="roll"
              placeholder="Enter your student roll"
              autoComplete="username"
              inputMode="numeric"
              pattern="[0-9]+"
            />

            <FormInput
              label="Password"
              id="student-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <button className="form-submit-button" type="submit">
              Log in as student <span>→</span>
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