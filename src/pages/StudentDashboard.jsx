import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

function StudentDashboard() {
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must log in to view your bookings.");
      setLoading(false);
      return;
    }

    const { data, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        start_time,
        end_time,
        participants,
        purpose,
        status,
        created_at,
        spaces (
          name,
          category,
          location
        )
      `)
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (bookingError) {
      setError(bookingError.message);
    } else {
      setBookings(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let channel;

    async function startRealtimeUpdates() {
      await loadBookings();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      channel = supabase
        .channel(`student-bookings-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `student_id=eq.${user.id}`,
          },
          () => {
            loadBookings();
          }
        )
        .subscribe();
    }

    startRealtimeUpdates();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadBookings]);

  function isUpcoming(booking) {
    const today = new Date().toISOString().split("T")[0];

    return (
      booking.status === "approved" &&
      booking.booking_date >= today
    );
  }

  function isHistory(booking) {
    return ["completed", "rejected", "no_show"].includes(
      booking.status
    );
  }

  const filteredBookings = bookings.filter((booking) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "pending") {
      return booking.status === "pending";
    }
    if (selectedFilter === "upcoming") return isUpcoming(booking);
    if (selectedFilter === "cancelled") {
      return booking.status === "cancelled";
    }
    if (selectedFilter === "history") return isHistory(booking);

    return true;
  });

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const upcomingCount = bookings.filter(isUpcoming).length;

  const cancelledCount = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;

  async function cancelBooking(bookingId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    const { error: cancellationError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (cancellationError) {
      setError(cancellationError.message);
    }
  }

  function formatStatus(status) {
    return status
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return (
    <main className="student-dashboard">
      <section className="dashboard-heading">
        <div>
          <p className="dashboard-label">STUDENT DASHBOARD</p>
          <h1>My bookings</h1>
          <p>
            View and manage all your campus space requests.
          </p>
        </div>

        <Link
          to="/student/book-space"
          className="booking-page-button"
        >
          Book a Space <span>→</span>
        </Link>
      </section>

      {location.state?.bookingSubmitted && (
        <div className="success-message">
          Your booking request was submitted successfully. Its
          current status is pending.
        </div>
      )}

      {error && <div className="dashboard-error">{error}</div>}

      <section className="booking-summary">
        <article className="summary-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
          <p>Waiting for admin approval</p>
        </article>

        <article className="summary-card">
          <span>Upcoming</span>
          <strong>{upcomingCount}</strong>
          <p>Approved future bookings</p>
        </article>

        <article className="summary-card">
          <span>Cancelled</span>
          <strong>{cancelledCount}</strong>
          <p>Your cancelled requests</p>
        </article>

        <article className="summary-card">
          <span>Total</span>
          <strong>{bookings.length}</strong>
          <p>All booking records</p>
        </article>
      </section>

      <section className="booking-section">
        <div className="booking-section-header">
          <h2>Booking activity</h2>

          <div className="booking-filters">
            {[
              "all",
              "pending",
              "upcoming",
              "cancelled",
              "history",
            ].map((filter) => (
              <button
                key={filter}
                type="button"
                className={
                  selectedFilter === filter ? "active-filter" : ""
                }
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="booking-message">Loading your bookings...</p>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-bookings">
            <h3>No bookings found</h3>
            <p>
              You do not have any bookings in this category.
            </p>

            <Link to="/student/book-space">
              Request your first booking
            </Link>
          </div>
        ) : (
          <div className="booking-list">
            {filteredBookings.map((booking) => (
              <article className="booking-card" key={booking.id}>
                <div className="booking-information">
                  <div className="booking-card-heading">
                    <h3>
                      {booking.spaces?.name || "Campus space"}
                    </h3>

                    <span
                      className={`booking-status status-${booking.status}`}
                    >
                      {formatStatus(booking.status)}
                    </span>
                  </div>

                  <p>
                    {booking.spaces?.category} ·{" "}
                    {booking.spaces?.location}
                  </p>

                  <div className="booking-details">
                    <span>
                      <strong>Date:</strong> {booking.booking_date}
                    </span>

                    <span>
                      <strong>Time:</strong> {booking.start_time} –{" "}
                      {booking.end_time}
                    </span>

                    <span>
                      <strong>Purpose:</strong>{" "}
                      {formatStatus(booking.purpose)}
                    </span>

                    <span>
                      <strong>Participants:</strong>{" "}
                      {booking.participants}
                    </span>
                  </div>
                </div>

                {["pending", "approved"].includes(booking.status) && (
                  <button
                    type="button"
                    className="cancel-booking-button"
                    onClick={() => cancelBooking(booking.id)}
                  >
                    Cancel
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default StudentDashboard;