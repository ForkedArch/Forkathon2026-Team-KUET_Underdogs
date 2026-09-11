import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="home-page">
      <Navbar />

      <main className="home-main">
        <section className="hero-content">
          <p className="hero-label">KUET CAMPUS SPACE BOOKING</p>

          <h1>
            Find the right space
            <br />
            when you <span>need it.</span>
          </h1>

          <p className="hero-description">
            Discover and request classrooms, study spaces, meeting rooms,
            laboratories and sports facilities across KUET.
          </p>

          <div className="hero-buttons">
            <Link to="/student/login" className="primary-link">
              Login as Student <span>→</span>
            </Link>

            <Link to="/student/signup" className="secondary-link">
              Create Account
            </Link>
          </div>

          <p className="signup-message">
            Don&apos;t have a student account?{" "}
            <Link to="/student/signup">Sign up here</Link>
          </p>
        </section>

        <section className="space-card-section">
          <div className="space-card">
            <div className="card-heading">
              <span className="availability-dot"></span>
              Campus spaces
            </div>

            <h2>One place for every space.</h2>

            <div className="space-list">
              <div className="space-item">
                <span className="space-icon">01</span>

                <div>
                  <h3>Classrooms</h3>
                  <p>Capacity, projectors and available times</p>
                </div>
              </div>

              <div className="space-item">
                <span className="space-icon">02</span>

                <div>
                  <h3>Study Room</h3>
                  <p>Quiet room for individual study and research</p>
                </div>
              </div>

              <div className="space-item">
                <span className="space-icon">03</span>

                <div>
                  <h3>Laboratories</h3>
                  <p>
                    Equipment, eligibility and supervision requirements
                  </p>
                </div>
              </div>

              <div className="space-item">
                <span className="space-icon">04</span>

                <div>
                  <h3>Sports facilities</h3>
                  <p>
                    Supported sports, capacity and included equipment
                  </p>
                </div>
              </div>

              <div className="space-item">
                <span className="space-icon">05</span>

                <div>
                  <h3>Meeting Room</h3>
                  <p>Spaces for meetings and discussions</p>
                </div>
              </div>
            </div>

            <p className="card-note">
              View availability, understand permissions and request bookings
              from one system.
            </p>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <span>The Empty Room · KUET</span>
        <span>Campus Space Management System</span>
      </footer>
    </div>
  );
}

export default Home;