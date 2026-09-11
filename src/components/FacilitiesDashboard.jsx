import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/FacilitiesDashboard.css";

const categoryDetails = {
  classroom: {
    label: "Classroom",
    icon: "🏫",
  },
  study_space: {
    label: "Study Space",
    icon: "📚",
  },
  meeting_room: {
    label: "Meeting Room",
    icon: "👥",
  },
  laboratory: {
    label: "Laboratory",
    icon: "🧪",
  },
  sports_facility: {
    label: "Sports Facility",
    icon: "🏟️",
  },
};

function formatTime(time) {
  if (!time) return "Not specified";

  return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function FacilitiesDashboard() {
  const [spaces, setSpaces] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componentActive = true;

    async function loadSpaces() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("spaces")
        .select(`
          id,
          name,
          category,
          location,
          capacity,
          description,
          projector,
          equipment,
          usage_rules,
          permission_information,
          access_instructions,
          opening_time,
          closing_time,
          operational_status
        `)
        .eq("is_active", true)
        .order("category")
        .order("name");

      if (!componentActive) return;

      if (fetchError) {
        console.error("Could not load spaces:", fetchError);
        setError("Facilities information could not be loaded.");
      } else {
        setSpaces(data || []);
      }

      setLoading(false);
    }

    loadSpaces();

    return () => {
      componentActive = false;
    };
  }, []);

  const filteredSpaces = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return spaces.filter((space) => {
      const matchesCategory =
        selectedCategory === "all" ||
        space.category === selectedCategory;

      const searchableText = [
        space.name,
        space.location,
        space.description,
        ...(space.equipment || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        (!normalizedSearch || searchableText.includes(normalizedSearch))
      );
    });
  }, [spaces, selectedCategory, searchTerm]);

  const categories = [
    { value: "all", label: "All Spaces" },
    ...Object.entries(categoryDetails).map(([value, details]) => ({
      value,
      label: details.label,
    })),
  ];

  if (loading) {
    return (
      <section className="facilities-dashboard">
        <div className="facilities-state">
          <span className="facilities-loader" />
          <p>Loading campus facilities...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="facilities-dashboard">
        <div className="facilities-state facilities-error">
          <span>!</span>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="facilities-dashboard">
      <div className="facilities-header">
        <div>
          <p className="facilities-eyebrow">SPACE INFORMATION</p>
          <h2>Campus Facilities Directory</h2>
          <p>
            Compare room capacity, equipment, access requirements and
            operating hours.
          </p>
        </div>

        <div className="facilities-total">
          <strong>{spaces.length}</strong>
          <span>Listed spaces</span>
        </div>
      </div>

      <div className="facilities-controls">
        <div className="facilities-search">
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            placeholder="Search by room, location or facility..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search facilities"
          />
        </div>

        <div className="facilities-filters">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              className={
                selectedCategory === category.value ? "active" : ""
              }
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {filteredSpaces.length === 0 ? (
        <div className="facilities-empty">
          <span>🔍</span>
          <h3>No matching spaces</h3>
          <p>Try another room name, location or category.</p>
        </div>
      ) : (
        <div className="facilities-grid">
          {filteredSpaces.map((space) => {
            const category =
              categoryDetails[space.category] || {
                label: "Campus Space",
                icon: "📍",
              };

            const facilities = [
              ...(space.projector ? ["Projector"] : []),
              ...(space.equipment || []),
            ];

            return (
              <article className="facility-card" key={space.id}>
                <div className="facility-card-top">
                  <div className="facility-category-icon">
                    {category.icon}
                  </div>

                  <div className="facility-title">
                    <span>{category.label}</span>
                    <h3>{space.name}</h3>
                    <p>📍 {space.location}</p>
                  </div>

                  <span
                    className={`facility-status status-${space.operational_status}`}
                  >
                    {space.operational_status?.replace("_", " ")}
                  </span>
                </div>

                {space.description && (
                  <p className="facility-description">
                    {space.description}
                  </p>
                )}

                <div className="facility-details">
                  <div>
                    <span>Capacity</span>
                    <strong>{space.capacity} people</strong>
                  </div>

                  <div>
                    <span>Opening hours</span>
                    <strong>
                      {formatTime(space.opening_time)} –{" "}
                      {formatTime(space.closing_time)}
                    </strong>
                  </div>
                </div>

                <div className="facility-section">
                  <h4>Available facilities</h4>

                  <div className="facility-tags">
                    {facilities.length > 0 ? (
                      facilities.map((facility) => (
                        <span key={facility}>✓ {facility}</span>
                      ))
                    ) : (
                      <p className="facility-missing">
                        No equipment information listed
                      </p>
                    )}
                  </div>
                </div>

                <div className="facility-information">
                  {space.usage_rules && (
                    <div>
                      <span>Rules</span>
                      <p>{space.usage_rules}</p>
                    </div>
                  )}

                  {space.permission_information && (
                    <div>
                      <span>Permission</span>
                      <p>{space.permission_information}</p>
                    </div>
                  )}

                  {space.access_instructions && (
                    <div>
                      <span>Access</span>
                      <p>{space.access_instructions}</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default FacilitiesDashboard;