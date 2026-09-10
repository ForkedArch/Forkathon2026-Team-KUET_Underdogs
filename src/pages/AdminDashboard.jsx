import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setError("");

    const [bookingResult, spaceResult] = await Promise.all([
      supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          start_time,
          end_time,
          status,
          purpose,
          participants,
          profiles (
            full_name,
            roll
          ),
          spaces (
            name,
            location
          )
        `)
        .order("created_at", { ascending: false }),

      supabase
        .from("spaces")
        .select("id, is_active"),
    ]);

    if (bookingResult.error) {
      setError(bookingResult.error.message);
    } else {
      setBookings(bookingResult.data || []);
    }

    if (spaceResult.error) {
      setError(spaceResult.error.message);
    } else {
      setSpaces(spaceResult.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();

    const channel = supabase
      .channel("admin-dashboard-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        loadDashboard
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "spaces",
        },
        loadDashboard
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboard]);

  const today = new Date().toISOString().split("T")[0];

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const upcomingCount = bookings.filter(
    (booking) =>
      booking.status === "approved" &&
      booking.booking_date >= today
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;

  const activeSpaces = spaces.filter(
    (space) => space.is_active
  ).length;

  const recentBookings = bookings.slice(0, 5);

  function formatValue(value) {
    return value
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return (
    <main className="admin-dashboard">
      <section className="admin-heading">
        <div>
          <p className="admin-page-label">ADMIN DASHBOARD</p>
          <h1>Space management overview</h1>

          <p>
            Monitor booking requests and campus space activity.
          </p>
        </div>

        <Link to="/admin/requests" className="admin-primary-button">
          Review Requests →
        </Link>
      </section>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-statistics">
        <article className="admin-stat-card">
          <span>Pending requests</span>
          <strong>{pendingCount}</strong>
          <Link to="/admin/requests">Review requests</Link>
        </article>

        <article className="admin-stat-card">
          <span>Upcoming bookings</span>
          <strong>{upcomingCount}</strong>
          <Link to="/admin/bookings">View bookings</Link>
        </article>

        <article className="admin-stat-card">
          <span>Active spaces</span>
          <strong>{activeSpaces}</strong>
          <Link to="/admin/spaces">Manage spaces</Link>
        </article>

        <article className="admin-stat-card">
          <span>Cancelled</span>
          <strong>{cancelledCount}</strong>
          <Link to="/admin/bookings">View history</Link>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Recent booking activity</h2>
            <p>The latest student booking requests and changes.</p>
          </div>

          <Link to="/admin/bookings">View all</Link>
        </div>

        {loading ? (
          <p className="admin-empty-message">Loading dashboard...</p>
        ) : recentBookings.length === 0 ? (
          <p className="admin-empty-message">
            No booking activity found.
          </p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Space</th>
                  <th>Date and time</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <strong>
                        {booking.profiles?.full_name || "Student"}
                      </strong>
                      <small>{booking.profiles?.roll}</small>
                    </td>

                    <td>
                      <strong>
                        {booking.spaces?.name || "Unknown space"}
                      </strong>
                      <small>{booking.spaces?.location}</small>
                    </td>

                    <td>
                      {booking.booking_date}
                      <small>
                        {booking.start_time} – {booking.end_time}
                      </small>
                    </td>

                    <td>
                      <span
                        className={`admin-status status-${booking.status}`}
                      >
                        {formatValue(booking.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;