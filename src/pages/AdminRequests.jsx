import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const rejectionOptions = [
  {
    value: "space_not_suitable",
    label: "Space is not suitable for this activity",
  },
  {
    value: "requirements_not_met",
    label: "Permission or eligibility requirements not met",
  },
  {
    value: "invalid_group_size",
    label: "Participant count exceeds capacity",
  },
  {
    value: "time_conflict",
    label: "Requested time is unavailable",
  },
  {
    value: "incomplete_information",
    label: "Booking information is incomplete",
  },
];

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    const { data, error: requestError } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        start_time,
        end_time,
        participants,
        purpose,
        status,
        profiles (
          full_name,
          roll
        ),
        spaces (
          name,
          category,
          location,
          capacity
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (requestError) {
      setError(requestError.message);
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadRequests();

    const channel = supabase
      .channel("admin-pending-requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        loadRequests
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadRequests]);

  async function reviewRequest(bookingId, decision) {
    const rejectionReason = rejectionReasons[bookingId];

    if (decision === "rejected" && !rejectionReason) {
      setError("Select a rejection reason before rejecting.");
      return;
    }

    setProcessingId(bookingId);
    setError("");

    const { error: reviewError } = await supabase.rpc(
      "review_booking",
      {
        p_booking_id: bookingId,
        p_decision: decision,
        p_rejection_reason:
          decision === "rejected" ? rejectionReason : null,
      }
    );

    setProcessingId(null);

    if (reviewError) {
      setError(reviewError.message);
      return;
    }

    await loadRequests();
  }

  function formatValue(value) {
    return value
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return (
    <main className="admin-dashboard">
      <section className="admin-heading">
        <div>
          <p className="admin-page-label">BOOKING REQUESTS</p>
          <h1>Pending requests</h1>
          <p>Review and decide whether requests can be approved.</p>
        </div>
      </section>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <p className="admin-empty-message">Loading requests...</p>
      ) : requests.length === 0 ? (
        <div className="admin-panel admin-empty-message">
          No pending booking requests.
        </div>
      ) : (
        <div className="request-list">
          {requests.map((request) => (
            <article className="request-card" key={request.id}>
              <div className="request-card-heading">
                <div>
                  <h2>{request.spaces?.name}</h2>
                  <p>
                    {request.spaces?.location} ·{" "}
                    {formatValue(request.spaces?.category)}
                  </p>
                </div>

                <span className="admin-status status-pending">
                  Pending
                </span>
              </div>

              <div className="request-details-grid">
                <div>
                  <span>Student</span>
                  <strong>{request.profiles?.full_name}</strong>
                  <small>{request.profiles?.roll}</small>
                </div>

                <div>
                  <span>Date</span>
                  <strong>{request.booking_date}</strong>
                </div>

                <div>
                  <span>Time</span>
                  <strong>
                    {request.start_time} – {request.end_time}
                  </strong>
                </div>

                <div>
                  <span>Participants</span>
                  <strong>
                    {request.participants} /{" "}
                    {request.spaces?.capacity}
                  </strong>
                </div>

                <div>
                  <span>Purpose</span>
                  <strong>{formatValue(request.purpose)}</strong>
                </div>
              </div>

              <div className="request-actions">
                <select
                  value={rejectionReasons[request.id] || ""}
                  onChange={(event) =>
                    setRejectionReasons((current) => ({
                      ...current,
                      [request.id]: event.target.value,
                    }))
                  }
                >
                  <option value="">Select rejection reason</option>

                  {rejectionOptions.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>

                <button
                  className="reject-request-button"
                  disabled={processingId === request.id}
                  onClick={() =>
                    reviewRequest(request.id, "rejected")
                  }
                >
                  Reject
                </button>

                <button
                  className="approve-request-button"
                  disabled={processingId === request.id}
                  onClick={() =>
                    reviewRequest(request.id, "approved")
                  }
                >
                  {processingId === request.id
                    ? "Processing..."
                    : "Approve"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default AdminRequests;