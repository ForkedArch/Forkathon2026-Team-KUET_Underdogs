import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/AdminBookings.css";

const historyStatuses = [
  "completed",
  "rejected",
  "cancelled",
  "no_show",
  "expired",
];

const rejectionMessages = {
  space_not_suitable: "Space is not suitable for this activity.",
  requirements_not_met:
    "Permission or eligibility requirements were not met.",
  invalid_group_size: "Participant count exceeds the room capacity.",
  time_conflict: "The requested time is unavailable.",
  incomplete_information: "The booking information is incomplete.",
};

function formatValue(value) {
  return value
    ? value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Not specified";
}

function formatDate(value) {
  if (!value) return "Not specified";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "Not specified";

  const [hours, minutes] = value.split(":");
  const hour = Number(hours);

  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch one page at a time instead of silently limiting the history.
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    let active = true;
    let latestRequest = 0;

    async function loadHistory() {
      const requestNumber = ++latestRequest;
      setLoading(true);
      setError("");

      try {
        let query = supabase
          .from("bookings")
          .select(
            `
              id,
              booking_date,
              start_time,
              end_time,
              participants,
              purpose,
              status,
              rejection_reason,
              spaces (
                name,
                location
              ),
              profiles!bookings_student_id_fkey (
                full_name,
                roll
              )
            `,
            { count: "exact" }
          )
          .in("status", historyStatuses);

        if (status !== "all") {
          query = query.eq("status", status);
        }

        if (date) {
          query = query.eq("booking_date", date);
        }

        const { data, count, error: fetchError } = await query
          .order("booking_date", { ascending: false })
          .order("start_time", { ascending: false })
          .order("id")
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (!active || requestNumber !== latestRequest) return;
        if (fetchError) throw fetchError;

        // A realtime change may remove the last item on this page.
        if (page > 0 && (count || 0) <= page * pageSize) {
          setPage(0);
          return;
        }

        setBookings(data || []);
        setTotal(count || 0);
      } catch (fetchError) {
        if (!active || requestNumber !== latestRequest) return;

        setError(
          fetchError.message || "Could not load booking history."
        );
      } finally {
        if (active && requestNumber === latestRequest) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    const channel = supabase
      .channel("admin-booking-history")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => loadHistory()
      )
      .subscribe((channelStatus) => {
        if (active && channelStatus === "SUBSCRIBED") {
          loadHistory();
        }
      });

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [status, date, page, refreshKey]);

  function clearFilters() {
    setStatus("all");
    setDate("");
    setPage(0);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="booking-history-page">
      <header className="bh-heading">
        <div>
          <p className="bh-eyebrow">ADMINISTRATION</p>
          <h1>Booking History</h1>
          <p>Review past booking decisions and closed requests.</p>
        </div>

        <button
          type="button"
          className="bh-button"
          disabled={loading}
          onClick={() => setRefreshKey((current) => current + 1)}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <section className="bh-panel" aria-label="Booking history">
        <div className="bh-filters">
          <label>
            <span>Status</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(0);
              }}
            >
              <option value="all">All history</option>
              {historyStatuses.map((item) => (
                <option key={item} value={item}>
                  {formatValue(item)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Booking date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setPage(0);
              }}
            />
          </label>

          <button
            type="button"
            className="bh-button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>

        {error ? (
          <div className="bh-error" role="alert">
            <strong>Could not load booking history.</strong>
            <p>{error}</p>
            <button
              type="button"
              className="bh-button"
              onClick={() => setRefreshKey((current) => current + 1)}
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <p className="bh-empty" role="status">
            Loading booking history...
          </p>
        ) : bookings.length === 0 ? (
          <div className="bh-empty">
            <h2>No history found</h2>
            <p>
              No closed bookings match these filters. Pending and
              approved requests appear on the other admin pages.
            </p>
          </div>
        ) : (
          <>
            <p className="bh-result-count">
              {total} matching booking{total === 1 ? "" : "s"}
            </p>

            <div className="bh-list">
              {bookings.map((booking) => (
                <article className="bh-card" key={booking.id}>
                  <div className="bh-card-heading">
                    <div>
                      <h2>{booking.spaces?.name || "Campus space"}</h2>
                      <p>
                        {booking.spaces?.location ||
                          "Location not listed"}
                      </p>
                    </div>

                    <span className={`bh-status bh-${booking.status}`}>
                      {formatValue(booking.status)}
                    </span>
                  </div>

                  <dl className="bh-details">
                    <div>
                      <dt>Student</dt>
                      <dd>
                        {booking.profiles?.full_name || "Not listed"}
                        <small>{booking.profiles?.roll}</small>
                      </dd>
                    </div>

                    <div>
                      <dt>Date</dt>
                      <dd>{formatDate(booking.booking_date)}</dd>
                    </div>

                    <div>
                      <dt>Time</dt>
                      <dd>
                        {formatTime(booking.start_time)} –{" "}
                        {formatTime(booking.end_time)}
                      </dd>
                    </div>

                    <div>
                      <dt>Participants</dt>
                      <dd>{booking.participants}</dd>
                    </div>

                    <div>
                      <dt>Purpose</dt>
                      <dd>{formatValue(booking.purpose)}</dd>
                    </div>
                  </dl>

                  {booking.status === "rejected" && (
                    <div className="bh-rejection">
                      <strong>Reason for rejection</strong>
                      <p>
                        {rejectionMessages[booking.rejection_reason] ||
                          booking.rejection_reason ||
                          "No reason recorded."}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <nav className="bh-pagination" aria-label="History pages">
              <button
                type="button"
                className="bh-button"
                disabled={page === 0}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>

              <span>
                Page {page + 1} of {totalPages}
              </span>

              <button
                type="button"
                className="bh-button"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </nav>
          </>
        )}
      </section>
    </main>
  );
}