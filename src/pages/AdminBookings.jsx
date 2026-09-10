import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const initialForm = {
  name: "",
  category: "",
  location: "",
  capacity: "",
  openingTime: "",
  closingTime: "",
};

function ManageSpaces() {
  const [spaces, setSpaces] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSpaces = useCallback(async () => {
    const { data, error: spaceError } = await supabase
      .from("spaces")
      .select("*")
      .order("name");

    if (spaceError) {
      setError(spaceError.message);
    } else {
      setSpaces(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function addSpace(event) {
    event.preventDefault();
    setError("");

    const { error: insertError } = await supabase
      .from("spaces")
      .insert({
        name: formData.name,
        category: formData.category,
        location: formData.location,
        capacity: Number(formData.capacity),
        opening_time: formData.openingTime,
        closing_time: formData.closingTime,
        is_active: true,
      });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setFormData(initialForm);
    await loadSpaces();
  }

  async function toggleSpace(space) {
    const { error: updateError } = await supabase
      .from("spaces")
      .update({
        is_active: !space.is_active,
      })
      .eq("id", space.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadSpaces();
  }

  function formatCategory(category) {
    return category
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return (
    <main className="admin-dashboard">
      <section className="admin-heading">
        <div>
          <p className="admin-page-label">SPACE MANAGEMENT</p>
          <h1>Manage spaces</h1>
          <p>Add spaces and control whether they accept bookings.</p>
        </div>
      </section>

      {error && <div className="admin-error">{error}</div>}

      <section className="space-management-layout">
        <form className="add-space-form" onSubmit={addSpace}>
          <h2>Add a new space</h2>

          <label>
            Space name
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: CSE Room 101"
              required
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              <option value="classroom">Classroom</option>
              <option value="study_space">Study Space</option>
              <option value="meeting_room">Meeting Room</option>
              <option value="laboratory">Laboratory</option>
              <option value="sports_facility">
                Sports Facility
              </option>
            </select>
          </label>

          <label>
            Location
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Example: CSE Building, Floor 2"
              required
            />
          </label>

          <label>
            Capacity
            <input
              name="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
          </label>

          <div className="time-field-row">
            <label>
              Opening time
              <input
                name="openingTime"
                type="time"
                value={formData.openingTime}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Closing time
              <input
                name="closingTime"
                type="time"
                value={formData.closingTime}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <button className="admin-primary-button" type="submit">
            Add Space
          </button>
        </form>

        <section className="admin-panel space-list-panel">
          <h2>Existing spaces</h2>

          {loading ? (
            <p>Loading spaces...</p>
          ) : (
            <div className="managed-space-list">
              {spaces.map((space) => (
                <article className="managed-space-card" key={space.id}>
                  <div>
                    <h3>{space.name}</h3>
                    <p>
                      {formatCategory(space.category)} ·{" "}
                      {space.location}
                    </p>
                    <small>Capacity: {space.capacity}</small>
                  </div>

                  <button
                    className={
                      space.is_active
                        ? "deactivate-button"
                        : "activate-button"
                    }
                    onClick={() => toggleSpace(space)}
                  >
                    {space.is_active ? "Deactivate" : "Activate"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default ManageSpaces;