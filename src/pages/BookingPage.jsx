import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const categories = [
  { value: "classroom", label: "Classroom" },
  { value: "study_space", label: "Study Space" },
  { value: "meeting_room", label: "Meeting Room" },
  { value: "laboratory", label: "Laboratory" },
  { value: "sports_facility", label: "Sports Facility" },
];

const purposes = [
  { value: "group_study", label: "Group Study" },
  { value: "project_work", label: "Project Work" },
  { value: "meeting", label: "Meeting" },
  { value: "laboratory_work", label: "Laboratory Work" },
  { value: "presentation", label: "Presentation Practice" },
  { value: "sports_practice", label: "Sports Practice" },
  { value: "club_activity", label: "Club Activity" },
];

const timeOptions = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const participantOptions = Array.from(
  { length: 50 },
  (_, index) => index + 1
);

function BookingPage() {
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    category: "",
    spaceId: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    participants: "",
    purpose: "",
  });

  useEffect(() => {
    async function loadSpaces() {
      const { data, error: spaceError } = await supabase
        .from("spaces")
        .select("id, name, category, location, capacity")
        .eq("is_active", true)
        .order("name");

      if (spaceError) {
        setError(spaceError.message);
      } else {
        setSpaces(data || []);
      }
    }

    loadSpaces();
  }, []);

  const filteredSpaces = useMemo(() => {
    if (!formData.category) return [];

    return spaces.filter(
      (space) => space.category === formData.category
    );
  }, [spaces, formData.category]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
      ...(name === "category" ? { spaceId: "" } : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (formData.endTime <= formData.startTime) {
      setError("The end time must be later than the start time.");
      return;
    }

    const selectedSpace = spaces.find(
      (space) => space.id === formData.spaceId
    );

    if (
      selectedSpace &&
      Number(formData.participants) > selectedSpace.capacity
    ) {
      setError(
        `This space can hold a maximum of ${selectedSpace.capacity} people.`
      );
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      setError("You must log in before requesting a booking.");
      return;
    }

    const { error: bookingError } = await supabase
      .from("bookings")
      .insert({
        student_id: user.id,
        space_id: formData.spaceId,
        booking_date: formData.bookingDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        participants: Number(formData.participants),
        purpose: formData.purpose,
        status: "pending",
      });

    setSubmitting(false);

    if (bookingError) {
      setError(bookingError.message);
      return;
    }

    navigate("/student/dashboard", {
      replace: true,
      state: { bookingSubmitted: true },
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="booking-page">
      <section className="booking-page-heading">
        <p className="dashboard-label">SPACE BOOKING</p>
        <h1>Request a space</h1>

        <p>
          Choose from the available options and submit your request
          for admin approval.
        </p>
      </section>

      <form className="booking-request-form" onSubmit={handleSubmit}>
        {error && <div className="dashboard-error">{error}</div>}

        <div className="booking-form-grid">
          <div className="select-group">
            <label htmlFor="category">Space category</label>

            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option
                  key={category.value}
                  value={category.value}
                >
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <label htmlFor="spaceId">Space</label>

            <select
              id="spaceId"
              name="spaceId"
              value={formData.spaceId}
              onChange={handleChange}
              disabled={!formData.category}
              required
            >
              <option value="">
                {formData.category
                  ? "Select a space"
                  : "Select a category first"}
              </option>

              {filteredSpaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name} — {space.location} — Capacity{" "}
                  {space.capacity}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <label htmlFor="bookingDate">Booking date</label>

            <input
              id="bookingDate"
              name="bookingDate"
              type="date"
              min={today}
              value={formData.bookingDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="select-group">
            <label htmlFor="purpose">Purpose</label>

            <select
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
            >
              <option value="">Select a purpose</option>

              {purposes.map((purpose) => (
                <option key={purpose.value} value={purpose.value}>
                  {purpose.label}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <label htmlFor="startTime">Start time</label>

            <select
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            >
              <option value="">Select start time</option>

              {timeOptions.slice(0, -1).map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group">
            <label htmlFor="endTime">End time</label>

            <select
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            >
              <option value="">Select end time</option>

              {timeOptions.slice(1).map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group full-width-field">
            <label htmlFor="participants">
              Number of participants
            </label>

            <select
              id="participants"
              name="participants"
              value={formData.participants}
              onChange={handleChange}
              required
            >
              <option value="">Select number of participants</option>

              {participantOptions.map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="booking-form-actions">
          <button
            type="button"
            className="back-dashboard-button"
            onClick={() => navigate("/student/dashboard")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="submit-booking-button"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Request Booking →"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default BookingPage;