import "../css/KPIform.css";
import { useState, useEffect } from "react";

const SHIFT_HOURS = {
  1: { label: "S1 · 08:00 – 14:00", start: "08:00", end: "14:00" },
  2: { label: "S2 · 14:00 – 20:00", start: "14:00", end: "20:00" },
  3: { label: "S3 · 20:00 – 02:00", start: "20:00", end: "02:00" },
  4: { label: "S4 · 02:00 – 08:00", start: "02:00", end: "08:00" },
};

const LINE_STATES = [
  { value: "running", label: "Running", icon: "▶", desc: "Producing normally" },
  { value: "blocked", label: "Blocked", icon: "■", desc: "Line stopped" },
  { value: "maintenance", label: "Maintenance", icon: "⚙", desc: "Under service" },
];

// ── localStorage helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = "kpi_submitted_shifts";

function getSubmittedShifts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function markShiftSubmitted(date, shift) {
  const existing = getSubmittedShifts();
  const key = `${date}-S${shift}`;
  if (!existing.includes(key)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, key]));
  }
}

function isShiftSubmitted(date, shift) {
  if (!date) return false;
  return getSubmittedShifts().includes(`${date}-S${shift}`);
}
// ─────────────────────────────────────────────────────────────────────────────

function KPIForm() {
  const [formData, setFormData] = useState({
    date: "",
    shift: "",
    supervisor_name: "",
    line_state: "",
    not_occupied: "",
    good_production: "",
    nominal_speed: "",
    planned_consumption: "",
    actual_consumption: "",
    max_output: "",
    actual_output: "",
  });

  const [submittedShifts, setSubmittedShifts] = useState([]);
  const [toast, setToast] = useState(null);

  // Refresh the locked-shifts list whenever the date changes
  useEffect(() => {
    setSubmittedShifts(getSubmittedShifts());
  }, [formData.date]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If the date changes, clear the shift selection so a locked shift isn't silently kept
    if (name === "date") {
      setFormData((prev) => ({ ...prev, date: value, shift: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const selectShift = (n) => {
    // Prevent selecting an already-submitted shift for the chosen date
    if (isShiftSubmitted(formData.date, n)) {
      showToast(`⛔ Shift S${n} has already been submitted for this date.`, "error");
      return;
    }
    setFormData((prev) => ({ ...prev, shift: String(n) }));
  };

  const selectState = (val) => {
    setFormData((prev) => ({ ...prev, line_state: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(formData.not_occupied) > 6) {
      showToast("⚠️ Not Occupied Time cannot exceed 6h (shift duration)", "error");
      return;
    }

    // Double-check the shift isn't already submitted (race condition guard)
    if (isShiftSubmitted(formData.date, formData.shift)) {
      showToast(
        `⛔ Shift S${formData.shift} was already submitted for ${formData.date}.`,
        "error"
      );
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/production/add-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          shift: Number(formData.shift),
          supervisor_name: formData.supervisor_name,
          line_state: formData.line_state,
          total_time: 6,
          not_occupied: Number(formData.not_occupied),
          good_production: Number(formData.good_production),
          nominal_speed: Number(formData.nominal_speed),
          planned_consumption: Number(formData.planned_consumption),
          actual_consumption: Number(formData.actual_consumption),
          max_output: Number(formData.max_output),
          actual_output: Number(formData.actual_output),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Lock the shift immediately after a successful submission
        markShiftSubmitted(formData.date, formData.shift);
        setSubmittedShifts(getSubmittedShifts()); // re-render buttons

        showToast("✅ Data sent successfully!");
        setFormData({
          date: formData.date, // keep date so user can see which shifts remain
          shift: "",
          supervisor_name: "",
          line_state: "",
          not_occupied: "",
          good_production: "",
          nominal_speed: "",
          planned_consumption: "",
          actual_consumption: "",
          max_output: "",
          actual_output: "",
        });
      } else {
        showToast("❌ Error: " + data.error, "error");
      }
    } catch (error) {
      console.error(error);
      showToast("⚠️ Cannot connect to server", "error");
    }
  };

  return (
    <div className="dashboard">
      <div className="main">
        {toast && (
          <div className={`kpi-toast ${toast.type}`}>{toast.message}</div>
        )}

        <div className="form-container">
          <h2>KPI Input Form</h2>
          <p className="form-subtitle">Production · Shift Report</p>

          <form onSubmit={handleSubmit}>
            {/* ── Section: Shift Info ── */}
            <div className="form-section-label">Shift information</div>

            <div className="input-row">
              <div className="input-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Supervisor name</label>
                <input
                  type="text"
                  name="supervisor_name"
                  value={formData.supervisor_name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                />
              </div>
            </div>

            {/* Shift selector */}
            <div className="input-group">
              <label>Shift</label>
              <div className="shift-selector">
                {[1, 2, 3, 4].map((n) => {
                  const locked = isShiftSubmitted(formData.date, n);
                  const active = formData.shift === String(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      className={[
                        "shift-btn",
                        active ? "active" : "",
                        locked ? "shift-btn--locked" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => selectShift(n)}
                      disabled={locked}
                      title={
                        locked
                          ? `S${n} already submitted for this date`
                          : `Select shift S${n}`
                      }
                    >
                      <span className="shift-num">S{n}</span>
                      <span className="shift-time">
                        {SHIFT_HOURS[n].start}–{SHIFT_HOURS[n].end}
                      </span>
                      {locked && <span className="shift-lock-badge">✓ Done</span>}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                name="shift"
                value={formData.shift}
                onChange={() => {}}
                required
                style={{ display: "none" }}
              />
            </div>

            {/* Total time auto note */}
            <div className="auto-field">
              <span className="auto-label">Total time</span>
              <span className="auto-value">6h — auto-set per shift</span>
            </div>

            <hr className="form-divider" />

            {/* ── Section: Line State ── */}
            <div className="form-section-label">Line state</div>

            <div className="input-group">
              <div className="state-selector">
                {LINE_STATES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`state-btn state-${s.value} ${formData.line_state === s.value ? "active" : ""}`}
                    onClick={() => selectState(s.value)}
                  >
                    <span className="state-icon">{s.icon}</span>
                    <span className="state-label">{s.label}</span>
                    <span className="state-desc">{s.desc}</span>
                  </button>
                ))}
              </div>
              <input
                type="text"
                name="line_state"
                value={formData.line_state}
                onChange={() => {}}
                required
                style={{ display: "none" }}
              />
            </div>

            <hr className="form-divider" />

            {/* ── Section: Production Data ── */}
            <div className="form-section-label">Production data</div>

            <div className="input-row">
              <div className="input-group">
                <label>Not occupied time (h)</label>
                <input
                  type="number"
                  name="not_occupied"
                  value={formData.not_occupied}
                  onChange={handleChange}
                  placeholder="0 – 6"
                  min="0"
                  max="6"
                  step="0.1"
                  required
                />
              </div>
              <div className="input-group">
                <label>Good production (units)</label>
                <input
                  type="number"
                  name="good_production"
                  value={formData.good_production}
                  onChange={handleChange}
                  placeholder="e.g. 252000"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Nominal speed (units/h)</label>
                <input
                  type="number"
                  name="nominal_speed"
                  value={formData.nominal_speed}
                  onChange={handleChange}
                  placeholder="e.g. 48000"
                  min="1"
                  required
                />
              </div>
              <div className="input-group">
                <label>Actual output (kg/h)</label>
                <input
                  type="number"
                  name="actual_output"
                  value={formData.actual_output}
                  onChange={handleChange}
                  placeholder="e.g. 15960"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Max output (kg/h)</label>
                <input
                  type="number"
                  name="max_output"
                  value={formData.max_output}
                  onChange={handleChange}
                  placeholder="e.g. 16800"
                  min="1"
                  required
                />
              </div>
              <div className="input-group">{/* spacer */}</div>
            </div>

            <hr className="form-divider" />

            {/* ── Section: Material ── */}
            <div className="form-section-label">Material consumption</div>

            <div className="input-row">
              <div className="input-group">
                <label>Planned consumption</label>
                <input
                  type="number"
                  name="planned_consumption"
                  value={formData.planned_consumption}
                  onChange={handleChange}
                  placeholder="e.g. 1000"
                  min="0"
                  required
                />
              </div>
              <div className="input-group">
                <label>Actual consumption</label>
                <input
                  type="number"
                  name="actual_consumption"
                  value={formData.actual_consumption}
                  onChange={handleChange}
                  placeholder="e.g. 980"
                  min="0"
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Submit Shift Data
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default KPIForm;