import { useState, useEffect } from "react";
import "../css/Rapport.css";
import { useNavigate } from "react-router-dom";

function Rapport() {
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [toast, setToast] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return { id: null, name: "" };
      const parsed = JSON.parse(raw);
      return { id: parsed?.id ?? null, name: parsed?.name || parsed?.username || "" };
    } catch {
      return { id: null, name: "" };
    }
  };

  const currentUser = getUser();

  const [formData, setFormData] = useState({
    title: "",
    author: currentUser.name,
    author_id: currentUser.id,
    status: "draft",
    content: "",
  });

  const [rapports, setRapports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedRapport, setSelectedRapport] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/rapports/")
      .then((res) => res.json())
      .then((data) => { setRapports(data); setLoading(false); })
      .catch((err) => { console.error("Failed to load reports:", err); setLoading(false); });
  }, []);

  const visibleRapports = rapports.filter((r) => {
    if (r.status === "published") return true;
    if (r.author_id && currentUser.id) return String(r.author_id) === String(currentUser.id);
    return r.author === currentUser.name;
  });

  const filtered = visibleRapports.filter((r) =>
    filter === "all" ? true : r.status === filter
  );

  const isOwner = (r) => {
    if (r.author_id && currentUser.id) return String(r.author_id) === String(currentUser.id);
    return r.author && currentUser.name && r.author === currentUser.name;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEditing = !!formData.id;
      const url = isEditing
        ? `http://localhost:5000/api/rapports/${formData.id}`
        : "http://localhost:5000/api/rapports/";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        showToast("❌ Failed to save: " + (err.error || "Unknown error"), "error");
        return;
      }

      const saved = await response.json();

      if (isEditing) {
        setRapports(rapports.map((r) => (r.id === saved.id ? saved : r)));
      } else {
        setRapports([saved, ...rapports]);
      }

      showToast(isEditing ? "✅ Report updated successfully!" : "✅ Report saved successfully!");
      setFormData({ title: "", author: currentUser.name, author_id: currentUser.id, status: "draft", content: "" });
      setView("list");
    } catch (err) {
      console.error("Network error:", err);
      showToast("⚠️ Could not reach server.", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/rapports/${id}`, { method: "DELETE" });
      setRapports(rapports.filter((r) => r.id !== id));
      setConfirmId(null);
      showToast("🗑️ Report deleted.", "error");
    } catch {
      showToast("⚠️ Could not delete.", "error");
    }
  };

  // ── Toast UI ──
  const Toast = () => toast ? (
    <div className={`kpi-toast ${toast.type}`}>{toast.message}</div>
  ) : null;

  // ── Inline confirm UI ──
  const DeleteConfirm = ({ id }) => (
    <div className="rapport-confirm">
      <span>Delete this report?</span>
      <button className="btn-confirm-yes" onClick={() => handleDelete(id)}>Yes</button>
      <button className="btn-confirm-no" onClick={() => setConfirmId(null)}>No</button>
    </div>
  );

  // ─── READ VIEW ───
  if (view === "read" && selectedRapport) {
    const r = selectedRapport;
    return (
      <div className="dashboard">
        <Toast />
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">
              <h1>{r.title}</h1>
              <p>{r.author} · {r.created_at}</p>
            </div>
            <button className="btn-cancel" onClick={() => { setView("list"); setSelectedRapport(null); }}>
              ← Back
            </button>
          </div>
          <div className="rapport-read-card">
            <div className="rapport-read-meta">
              <span className={`status-badge ${r.status}`}>
                {r.status === "published" ? "✅ Published" : "✏️ Draft"}
              </span>
            </div>
            <div className="rapport-read-content">{r.content}</div>
          </div>
        </div>
      </div>
    );
  }

  // ─── LIST VIEW ───
  if (view === "list") {
    return (
      <div className="dashboard">
        <Toast />
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">
              <h1>Reports</h1>
              <p>Browse all internal reports</p>
            </div>
            <button className="btn-submit" onClick={() => setView("form")}>
              + New Report
            </button>
          </div>

          <div className="filter-tabs">
            <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>📋 All</button>
            <button className={`filter-btn ${filter === "draft" ? "active" : ""}`} onClick={() => setFilter("draft")}>✏️ Drafts</button>
            <button className={`filter-btn ${filter === "published" ? "active" : ""}`} onClick={() => setFilter("published")}>✅ Published</button>
          </div>

          {loading ? (
            <p className="empty-msg">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="empty-msg">No {filter !== "all" ? filter : ""} reports found.</p>
          ) : (
            <div className="rapport-list">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className={`rapport-card ${r.status}`}
                  onClick={() => { setSelectedRapport(r); setView("read"); }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="rapport-card-left">
                    <span className={`rapport-icon ${r.status}`}>
                      {r.status === "published" ? "✅" : "✏️"}
                    </span>
                    <div>
                      <h3 className="rapport-title">{r.title}</h3>
                      <p className="rapport-meta">{r.author} · {r.created_at}</p>
                    </div>
                  </div>

                  <div className="rapport-card-right" onClick={(e) => e.stopPropagation()}>
                    <span className={`status-badge ${r.status}`}>
                      {r.status === "published" ? "✅ Published" : "✏️ Draft"}
                    </span>
                    {isOwner(r) && (
                      <>
                        <button className="btn-edit" onClick={() => {
                          setFormData({ id: r.id, title: r.title, author: r.author, author_id: r.author_id, status: r.status, content: r.content });
                          setView("form");
                        }}>✏️ Edit</button>

                        {confirmId === r.id ? (
                          <DeleteConfirm id={r.id} />
                        ) : (
                          <button className="btn-delete" onClick={() => setConfirmId(r.id)}>
                            🗑️ Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── FORM VIEW ───
  return (
    <div className="dashboard">
      <Toast />
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">
            <h1>{formData.id ? "Edit Report" : "New Report"}</h1>
            <p>{formData.id ? "Update your report" : "Write and submit an internal report"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            <div className="form-grid">
              <div className="form-group full">
                <label>Report Title</label>
                <input type="text" name="title" placeholder="e.g. Operational Summary — March 2026" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group full">
                <label>Author <span className="author-badge">auto-filled</span></label>
                <input type="text" name="author" value={formData.author} readOnly className="input-readonly" />
              </div>
              <div className="form-group full">
                <label>Status</label>
                <div className="status-group">
                  <input type="radio" id="draft" name="status" value="draft" checked={formData.status === "draft"} onChange={handleChange} className="status-option" />
                  <label htmlFor="draft" className="status-label">✏️ Draft</label>
                  <input type="radio" id="published" name="status" value="published" checked={formData.status === "published"} onChange={handleChange} className="status-option" />
                  <label htmlFor="published" className="status-label">✅ Publish</label>
                </div>
              </div>
              <div className="form-group full">
                <label>Report Content</label>
                <div className="textarea-wrap">
                  <textarea name="content" placeholder="Write your report here..." value={formData.content} onChange={handleChange} required />
                  <span className="char-count">{formData.content.length} chars</span>
                </div>
              </div>
            </div>
            <hr className="form-divider" />
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => {
                setFormData({ title: "", author: currentUser.name, author_id: currentUser.id, status: "draft", content: "" });
                setView("list");
              }}>Cancel</button>
              <button type="submit" className="btn-submit">
                {formData.id ? "Update Report →" : "Save Report →"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Rapport;