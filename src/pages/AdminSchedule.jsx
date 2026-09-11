import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { supabase } from "../lib/supabase";
import "../styles/AdminSchedule.css";

function getToday() {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;

    return new Date(now.getTime() - timezoneOffset)
        .toISOString()
        .split("T")[0];
}

function formatDate(date) {
    if (!date) return "Not specified";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
}

function formatTime(time) {
    if (!time) return "Not specified";

    return new Date(`2000-01-01T${time}`).toLocaleTimeString(
        undefined,
        {
            hour: "numeric",
            minute: "2-digit",
        }
    );
}

function formatValue(value) {
    if (!value) return "Not specified";

    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function AdminSchedule() {
    const [selectedStartTime, setSelectedStartTime] = useState("");
    const [selectedEndTime, setSelectedEndTime] = useState("");
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const today = getToday();

    const loadBookedRooms = useCallback(async () => {
        setError("");

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
        spaces (
          id,
          name,
          category,
          location,
          capacity
        ),
        profiles!bookings_student_id_fkey (
          id,
          full_name,
          roll,
          email
        )
      `)
            .in("status", ["approved", "checked_in"])
            .order("booking_date", { ascending: true })
            .order("start_time", { ascending: true });

        if (bookingError) {
            setError(bookingError.message);
        } else {
            setBookings(data || []);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        loadBookedRooms();

        const channel = supabase
            .channel("admin-booked-rooms-schedule")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookings",
                },
                () => {
                    loadBookedRooms();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadBookedRooms]);

    const filteredBookings = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return bookings.filter((booking) => {
            const searchableText = [
                booking.spaces?.name,
                booking.spaces?.location,
                booking.spaces?.category,
                booking.profiles?.full_name,
                booking.profiles?.roll,
                booking.purpose,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !search || searchableText.includes(search);

            const matchesDate =
                !selectedDate ||
                booking.booking_date === selectedDate;

            const matchesStatus =
                selectedStatus === "all" ||
                booking.status === selectedStatus;

            const bookingStart = booking.start_time?.slice(0, 5);
            const bookingEnd = booking.end_time?.slice(0, 5);

            let matchesTime = true;

            if (selectedStartTime && selectedEndTime) {
                matchesTime =
                    bookingStart < selectedEndTime &&
                    bookingEnd > selectedStartTime;
            } else if (selectedStartTime) {
                matchesTime = bookingEnd > selectedStartTime;
            } else if (selectedEndTime) {
                matchesTime = bookingStart < selectedEndTime;
            }

            return (
                matchesSearch &&
                matchesDate &&
                matchesStatus &&
                matchesTime
            );
        });
    }, [
        bookings,
        searchTerm,
        selectedDate,
        selectedStatus,
        selectedStartTime,
        selectedEndTime,
    ]);

    const todayCount = bookings.filter(
        (booking) => booking.booking_date === today
    ).length;

    const upcomingCount = bookings.filter(
        (booking) =>
            booking.booking_date > today &&
            booking.status === "approved"
    ).length;

    const checkedInCount = bookings.filter(
        (booking) => booking.status === "checked_in"
    ).length;

    return (
        <main className="admin-schedule">
            <section className="schedule-heading">
                <div>
                    <p className="schedule-label">BOOKING MANAGEMENT</p>
                    <h1>Booked Rooms Schedule</h1>
                    <p>
                        View all approved and currently checked-in space
                        bookings.
                    </p>
                </div>

                <div className="schedule-live-indicator">
                    <span />
                    Live updates
                </div>
            </section>

            {error && (
                <div className="schedule-error">
                    <strong>Could not load the schedule.</strong>
                    <p>{error}</p>
                </div>
            )}

            <section className="schedule-summary">
                <article>
                    <div className="summary-icon blue">▦</div>

                    <div>
                        <span>Active bookings</span>
                        <strong>{bookings.length}</strong>
                    </div>
                </article>

                <article>
                    <div className="summary-icon purple">◷</div>

                    <div>
                        <span>Booked today</span>
                        <strong>{todayCount}</strong>
                    </div>
                </article>

                <article>
                    <div className="summary-icon green">✓</div>

                    <div>
                        <span>Checked in</span>
                        <strong>{checkedInCount}</strong>
                    </div>
                </article>

                <article>
                    <div className="summary-icon orange">→</div>

                    <div>
                        <span>Upcoming</span>
                        <strong>{upcomingCount}</strong>
                    </div>
                </article>
            </section>

            <section className="schedule-panel">
                <div className="schedule-panel-heading">
                    <div>
                        <h2>Room schedule</h2>
                        <p>
                            {filteredBookings.length} booking
                            {filteredBookings.length !== 1 ? "s" : ""} shown
                        </p>
                    </div>

                    <button
                        type="button"
                        className="refresh-schedule-button"
                        onClick={loadBookedRooms}
                    >
                        Refresh
                    </button>
                </div>

                <div className="schedule-filters">
                    <div className="schedule-search">
                        <span aria-hidden="true">⌕</span>

                        <input
                            type="search"
                            placeholder="Search room, student, roll or location..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />
                    </div>

                    <input
                        className="schedule-date-filter"
                        type="date"
                        value={selectedDate}
                        onChange={(event) =>
                            setSelectedDate(event.target.value)
                        }
                    />

                    <label className="schedule-time-filter">
                        <span>From</span>

                        <input
                            type="time"
                            value={selectedStartTime}
                            onChange={(event) =>
                                setSelectedStartTime(event.target.value)
                            }
                        />
                    </label>

                    <label className="schedule-time-filter">
                        <span>To</span>

                        <input
                            type="time"
                            min={selectedStartTime}
                            value={selectedEndTime}
                            onChange={(event) =>
                                setSelectedEndTime(event.target.value)
                            }
                        />
                    </label>

                    <select
                        className="schedule-status-filter"
                        value={selectedStatus}
                        onChange={(event) =>
                            setSelectedStatus(event.target.value)
                        }
                    >
                        <option value="all">All statuses</option>
                        <option value="approved">Approved</option>
                        <option value="checked_in">Checked In</option>
                    </select>

                    {(searchTerm ||
                        selectedDate ||
                        selectedStartTime ||
                        selectedEndTime ||
                        selectedStatus !== "all") && (
                            <button
                                type="button"
                                className="clear-schedule-filters"
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedDate("");
                                    setSelectedStatus("all");
                                    setSelectedStartTime("");
                                    setSelectedEndTime("");
                                }}
                            >
                                Clear
                            </button>
                        )}
                </div>

                {loading ? (
                    <div className="schedule-message">
                        <span className="schedule-loader" />
                        <p>Loading booked rooms...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="schedule-message">
                        <div className="schedule-empty-icon">▦</div>
                        <h3>No booked rooms found</h3>
                        <p>
                            There are no bookings matching the selected
                            filters.
                        </p>
                    </div>
                ) : (
                    <div className="schedule-list">
                        {filteredBookings.map((booking) => (
                            <article
                                className="schedule-booking-card"
                                key={booking.id}
                            >
                                <div className="schedule-date-box">
                                    <strong>
                                        {new Date(
                                            `${booking.booking_date}T00:00:00`
                                        ).getDate()}
                                    </strong>

                                    <span>
                                        {new Date(
                                            `${booking.booking_date}T00:00:00`
                                        ).toLocaleDateString(undefined, {
                                            month: "short",
                                        })}
                                    </span>
                                </div>

                                <div className="schedule-room-information">
                                    <div className="schedule-room-heading">
                                        <div>
                                            <span className="schedule-category">
                                                {formatValue(
                                                    booking.spaces?.category
                                                )}
                                            </span>

                                            <h3>
                                                {booking.spaces?.name ||
                                                    "Campus Space"}
                                            </h3>
                                        </div>

                                        <span
                                            className={`schedule-status schedule-status-${booking.status}`}
                                        >
                                            {formatValue(booking.status)}
                                        </span>
                                    </div>

                                    <p className="schedule-location">
                                        📍{" "}
                                        {booking.spaces?.location ||
                                            "Location not specified"}
                                    </p>

                                    <div className="schedule-booking-details">
                                        <div>
                                            <span>Date</span>
                                            <strong>
                                                {formatDate(booking.booking_date)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Time</span>
                                            <strong>
                                                {formatTime(booking.start_time)} –{" "}
                                                {formatTime(booking.end_time)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Student</span>
                                            <strong>
                                                {booking.profiles?.full_name ||
                                                    "Unknown student"}
                                            </strong>
                                            <small>
                                                {booking.profiles?.roll}
                                            </small>
                                        </div>

                                        <div>
                                            <span>Participants</span>
                                            <strong>
                                                {booking.participants} /{" "}
                                                {booking.spaces?.capacity}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Purpose</span>
                                            <strong>
                                                {formatValue(booking.purpose)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default AdminSchedule;