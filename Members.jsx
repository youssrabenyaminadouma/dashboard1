import "../css/Dashboard.css";
import "../css/members.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/users";

const ROLE_LABELS = {
  viewer: "Viewer",
  supervisor: "Supervisor",
  operator: "Operator",
};

const AVATAR_COLORS = ["purple", "blue", "green", "amber", "coral"];

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() || "??";
}

function getColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ✅ AUTH HEADER
function getAuthHeaders() {
  const token = localStorage.getItem("token");

  console.log("🔐 TOKEN:", token);

  if (!token || token === "undefined" || token === "null") {
    console.error("❌ Invalid or missing token");
    return {};
  }

  return {
    Authorization: `Bearer ${token.trim()}`,
  };
}

function Members() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser.role === "admin";
  // ✅ FETCH USERS
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(API_URL, {
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          console.log("❌ BACKEND ERROR:", errData);
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        setMembers(data);
      } catch (err) {
        setError(err.message || "Failed to load members.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // ✅ DELETE USER
  const handleDelete = async (id) => {
    setDeletingId(id);

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        console.log("❌ DELETE ERROR:", errData);
        throw new Error(`Delete failed: ${res.status}`);
      }

      setMembers((prev) => prev.filter((m) => (m.id || m._id) !== id));
    } catch (err) {
      alert(err.message || "Could not delete user.");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  // ✅ SEARCH FILTER
  const filtered = members.filter((m) => {
    return (
      (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="dashboard">
      <div className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-title">
            <h1>Members</h1>
            <p>Dashboard access management</p>
          </div>

          {isAdmin && (
            <button onClick={() => navigate("/create-account")}>
              + Add Member
            </button>
          )}
        </div>

        {/* SECTION */}
        <div className="activity-section">
          <div className="section-header">
            <h2>Access List</h2>
            <span>
              {loading
                ? "Loading…"
                : `${filtered.length} member${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* STATES */}
          {loading && <p className="members-empty">Loading...</p>}
          {error && <p className="members-empty members-error">⚠ {error}</p>}

          {!loading && !error && filtered.length === 0 && (
            <p className="members-empty">No members found.</p>
          )}

          {/* MEMBERS LIST */}
          {!loading && !error && filtered.length > 0 && (
            <div className="members-grid">
              {filtered.map((m, index) => {
                const id = m.id || m._id;

                return (
                  <div key={id} className="member-card">
                    {/* LEFT */}
                    <div className="member-card-left">
 

                      <div className="member-info">
                        <span className="member-name">{m.name}</span>
                        <span className="member-email">{m.email}</span>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="member-card-right">
                      {m.role && (
                        <span className={`role-badge ${m.role}`}>
                          {ROLE_LABELS[m.role]}
                        </span>
                      )}

                      {confirmId === id ? (
                        <div className="confirm-actions">
                          <button
                            className="btn-confirm-yes"
                            onClick={() => handleDelete(id)}
                            disabled={deletingId === id}
                          >
                            {deletingId === id ? "..." : "Yes"}
                          </button>

                          <button
                            className="btn-confirm-no"
                            onClick={() => setConfirmId(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        isAdmin && (
                          <button
                            className="btn-remove"
                            onClick={() => setConfirmId(id)}
                          >
                            Remove
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Members;
