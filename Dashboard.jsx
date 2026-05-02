import { useEffect, useState } from "react";
import "../css/Dashboard.css";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
);

const API_URL      = "http://localhost:5000/api/production/data";
const CLAUDE_URL = "http://localhost:5000/api/production/claude";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const SHIFT_TIMES = {
  1: "08:00 – 14:00", 2: "14:00 – 20:00",
  3: "20:00 – 02:00", 4: "02:00 – 08:00",
};

const STATE_META = {
  running:     { color: "#6ee7b7", label: "Running" },
  blocked:     { color: "#f87171", label: "Blocked" },
  maintenance: { color: "#fbbf24", label: "Maintenance" },
};

const KPI_META = [
  { key: "AI",    label: "AI",    desc: "Asset Intensity",           color: "#a78bfa", thresholds: [60, 80]  },
  { key: "CU_t",  label: "CU_t",  desc: "Capacity Utilization",      color: "#34d399", thresholds: [60, 75]  },
  { key: "API_t", label: "API_t", desc: "Asset Productivity (time)", color: "#f87171", thresholds: [60, 75]  },
  { key: "ZLMV",  label: "ZLMV",  desc: "Zero Lost Mat. Variance",   color: "#fbbf24", thresholds: [95, 100] },
  { key: "API_q", label: "API_q", desc: "Asset Productivity (qty)",  color: "#38bdf8", thresholds: [85, 95]  },
];

function getToday() { return new Date().toISOString().split("T")[0]; }

function getStatus(val, [warn, good]) {
  if (val >= good) return "optimal";
  if (val >= warn) return "acceptable";
  return "low";
}

function aggregateKPIs(entries) {
  if (!entries.length) return {};
  const keys = ["AI", "CU_t", "API_t", "ZLMV", "API_q", "CU_q"];
  const result = {};
  for (const key of keys) {
    const vals = entries.map((d) => d[key] || 0);
    result[key] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  return result;
}

function shiftLabel(d) { return `S${d.shift}`; }

const baseChartOpts = (max = 110) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: "rgba(200,185,255,0.55)", font: { size: 10 }, boxWidth: 8, padding: 12 } },
  },
  scales: {
    x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "rgba(200,185,255,0.4)", font: { size: 10 } } },
    y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "rgba(200,185,255,0.4)", font: { size: 10 }, callback: (v) => v + "%" }, min: 0, max },
  },
});

function lineDS(label, data, color) {
  return { label, data, borderColor: color, backgroundColor: color + "18", fill: true,
    tension: 0.4, pointRadius: 3, pointBackgroundColor: color, borderWidth: 1.5 };
}
function barDS(label, data, color) {
  return { label, data, backgroundColor: color + "33", borderColor: color, borderWidth: 1, borderRadius: 4 };
}

// ── Claude call ──────────────────────────────────────────────────────────────
async function askClaude(prompt) {
  const res = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 120,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const json = await res.json();
  return json?.content?.[0]?.text?.trim() || "";
}

// ── Hook — always called at component top level ──────────────────────────────
function useAutoInsight(prompt) {
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!prompt) { setText(""); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setText("");
    askClaude(prompt)
      .then((t) => { if (!cancelled) { setText(t); setLoading(false); } })
      .catch(() => { if (!cancelled) { setLoading(false); } });
    return () => { cancelled = true; };
  }, [prompt]);

  return { text, loading };
}

// ── Green insight bar — exactly like the pic ─────────────────────────────────
function AIInsightBar({ text, loading }) {
  if (!text && !loading) return null;
  return (
    <div className="ai-insight-bar">
      <span className="ai-insight-bar-icon">✦</span>
      {loading
        ? <span className="ai-insight-bar-dots">AI Insight: <span className="ai-dots-anim">analysing data…</span></span>
        : <span className="ai-insight-bar-text">AI Insight: {text}</span>
      }
    </div>
  );
}

// ── KPI Card — self-contained with own hook ──────────────────────────────────
function KPICard({ meta, value, date, shift }) {
  const status = getStatus(value, meta.thresholds);
  const prompt = `Factory floor analyst. One sentence only about: ${meta.label} (${meta.desc}) = ${value.toFixed(1)}% on ${date} shift ${shift}. Optimal ≥${meta.thresholds[1]}%, acceptable ≥${meta.thresholds[0]}%. Status: ${status}. Sharp, actionable. Plain text, no markdown.`;
  const { text, loading } = useAutoInsight(prompt);

  return (
    <div className="kpi-card" style={{ "--accent": meta.color }}>
      <div className="kpi-card-top">
        <span className="kpi-label">{meta.label}</span>
        <span className={`kpi-badge kpi-badge--${status}`}>{status}</span>
      </div>
      <div className="kpi-value" style={{ color: meta.color }}>{value.toFixed(1)}%</div>
      <div className="kpi-desc">{meta.desc}</div>
      <div className="kpi-bar-track">
        <div className="kpi-bar-fill" style={{ width: `${Math.min(value, 100)}%`, background: meta.color }} />
      </div>
      <AIInsightBar text={text} loading={loading} />
    </div>
  );
}

function SectionTitle({ children }) {
  return <div className="section-title"><span>{children}</span></div>;
}

function StatPill({ label, value, color }) {
  return (
    <div className="stat-pill">
      <span className="stat-pill-label">{label}</span>
      <span className="stat-pill-value" style={{ color }}>{value}</span>
    </div>
  );
}

function LineStateBadge({ state }) {
  const meta = STATE_META[state] || { color: "#888", label: state };
  return (
    <span className="line-state-badge" style={{ "--sc": meta.color }}>
      <span className="lsb-dot" />{meta.label}
    </span>
  );
}

// ── Dashboard — ALL hooks at the top, zero inline hook calls ─────────────────
function Dashboard() {
  const [data, setData]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [shiftFilter, setShiftFilter]   = useState("all");
  const [selectedDate, setSelectedDate] = useState(getToday());

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((d) => {
        setData([...d].sort((a, b) =>
          a.date !== b.date ? a.date.localeCompare(b.date) : Number(a.shift) - Number(b.shift)
        ));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const dateFiltered   = data.filter((d) => d.date === selectedDate);
  const filtered       = shiftFilter === "all"
    ? dateFiltered
    : dateFiltered.filter((d) => String(d.shift) === shiftFilter);

  const availableDates = [...new Set(data.map((d) => d.date))].sort();
  const minDate        = availableDates[0] || getToday();
  const isAllShifts    = shiftFilter === "all";
  const isToday        = selectedDate === getToday();
  const latest         = filtered[filtered.length - 1] || {};
  const displayKPIs    = isAllShifts ? aggregateKPIs(filtered) : latest;
  const labels         = filtered.map(shiftLabel);

  // ── ALL insight prompts built here at top level ──────────────────────────
  const shiftSummary = filtered.map(d =>
    `S${d.shift}: AI=${d.AI?.toFixed(1)}% CU_t=${d.CU_t?.toFixed(1)}% API_t=${d.API_t?.toFixed(1)}% ZLMV=${d.ZLMV?.toFixed(1)}%`
  ).join(" | ");

  const timelinePrompt = filtered.length > 0
    ? `Factory analyst, one sentence: KPI trend across shifts on ${selectedDate}: ${shiftSummary}. Identify direction and most notable shift. Plain text only.`
    : "";

  const apiqPrompt = filtered.length > 0
    ? `Factory analyst, one sentence on API_q (target ≥95%) on ${selectedDate}: ${filtered.map(d => `S${d.shift}=${d.API_q?.toFixed(1)}%`).join(", ")}. Note best/worst shift. Plain text only.`
    : "";

  const cuqPrompt = filtered.length > 0
    ? `Factory analyst, one sentence on CU_q (quantity utilization) on ${selectedDate}: ${filtered.map(d => `S${d.shift}=${d.CU_q?.toFixed(1)}%`).join(", ")}. Note any consistency or drop. Plain text only.`
    : "";

  const zlmvPrompt = filtered.length > 0
    ? `Factory analyst, one sentence: ZLMV (material efficiency) avg ${(displayKPIs.ZLMV || 0).toFixed(1)}% on ${selectedDate}, target ≥100%. Plain text only.`
    : "";

  const tablePrompt = filtered.length > 0
    ? `Factory analyst, one sentence: which KPI is furthest from target and which is closest for ${isAllShifts ? filtered.length + " shifts avg" : "S" + shiftFilter} on ${selectedDate}? AI=${displayKPIs.AI?.toFixed(1)}%(t:80%), CU_t=${displayKPIs.CU_t?.toFixed(1)}%(t:75%), API_t=${displayKPIs.API_t?.toFixed(1)}%(t:75%), ZLMV=${displayKPIs.ZLMV?.toFixed(1)}%(t:100%), API_q=${displayKPIs.API_q?.toFixed(1)}%(t:95%). Plain text only.`
    : "";

  // ── ALL hooks called unconditionally at top level ────────────────────────
  const timelineInsight = useAutoInsight(timelinePrompt);
  const apiqInsight     = useAutoInsight(apiqPrompt);
  const cuqInsight      = useAutoInsight(cuqPrompt);
  const zlmvInsight     = useAutoInsight(zlmvPrompt);
  const tableInsight    = useAutoInsight(tablePrompt);

  // ── Charts ───────────────────────────────────────────────────────────────
  const lineData = {
    labels,
    datasets: [
      lineDS("AI",    filtered.map((d) => d.AI),    "#a78bfa"),
      lineDS("CU_t",  filtered.map((d) => d.CU_t),  "#34d399"),
      lineDS("API_t", filtered.map((d) => d.API_t), "#f87171"),
      lineDS("ZLMV",  filtered.map((d) => d.ZLMV),  "#fbbf24"),
    ],
  };
  const apiqData = { labels, datasets: [barDS("API_q (%)", filtered.map((d) => d.API_q), "#f87171")] };
  const cuqData  = { labels, datasets: [barDS("CU_q (%)",  filtered.map((d) => d.CU_q),  "#38bdf8")] };

  const zlmv      = displayKPIs.ZLMV || 0;
  const zlmvColor = getStatus(zlmv, [95, 100]) === "optimal" ? "#6ee7b7"
                  : getStatus(zlmv, [95, 100]) === "acceptable" ? "#fbbf24" : "#f87171";

  const doughnutData = {
    datasets: [{
      data: [zlmv, Math.max(0, 100 - zlmv)],
      backgroundColor: [zlmvColor, "rgba(255,255,255,0.05)"],
      borderWidth: 0, cutout: "76%",
    }],
  };

  if (loading) return <div className="dash-loading">Loading data…</div>;

  return (
    <div className="dashboard-container">

      {/* ── Header ── */}
      <div className="dash-header">
        <h1 className="dashboard-title">Production Dashboard</h1>
        <div className="dash-header-controls">
          <div className="date-picker-wrap">
            <label className="date-picker-label">DATE</label>
            <input
              type="date" className="date-picker-input"
              value={selectedDate} min={minDate} max={getToday()}
              onChange={(e) => { setSelectedDate(e.target.value); setShiftFilter("all"); }}
            />
            {!isToday && (
              <button className="date-today-btn" onClick={() => { setSelectedDate(getToday()); setShiftFilter("all"); }}>
                Today
              </button>
            )}
          </div>
          <div className="shift-filter">
            {["all", "1", "2", "3", "4"].map((s) => (
              <button key={s} className={`sf-btn ${shiftFilter === s ? "sf-btn--active" : ""}`} onClick={() => setShiftFilter(s)}>
                {s === "all" ? "All shifts" : `S${s} · ${SHIFT_TIMES[Number(s)]}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── No data ── */}
      {filtered.length === 0 ? (
        <div className="no-data-state">
          <span className="no-data-icon">📭</span>
          <p className="no-data-title">No data for {selectedDate}</p>
          <p className="no-data-sub">
            {shiftFilter !== "all"
              ? `Shift S${shiftFilter} has no entries on this date.`
              : "No shifts were recorded on this date."}
          </p>
          <button className="date-today-btn" onClick={() => { setSelectedDate(getToday()); setShiftFilter("all"); }}>
            Go to today
          </button>
        </div>
      ) : (
        <>
          {/* Info bar */}
          {latest.supervisor_name && !isAllShifts && latest.line_state && (
            <div className="info-bar">
              <StatPill label="Supervisor" value={latest.supervisor_name} color="#c4b5fd" />
              <StatPill label="Line state" value={<LineStateBadge state={latest.line_state} />} color="transparent" />
            </div>
          )}

          {/* ── KPI Cards ── */}
          <SectionTitle>
            Key performance indicators{isAllShifts ? ` — avg across ${filtered.length} shifts` : ""}
          </SectionTitle>
          <div className="kpi-grid">
            {KPI_META.map((meta) => (
              <KPICard
                key={`${meta.key}-${selectedDate}-${shiftFilter}`}
                meta={meta}
                value={displayKPIs[meta.key] || 0}
                date={selectedDate}
                shift={shiftFilter}
              />
            ))}
          </div>

          {/* ── Time-based performance ── */}
          {isAllShifts && (
            <>
              <SectionTitle>Time-based performance</SectionTitle>
              <div className="chart-full">
                <div className="chart-header">
                  <span className="chart-title">AI · CU_t · API_t · ZLMV — {selectedDate}</span>
                </div>
                <div style={{ height: 240 }}>
                  <Line data={lineData} options={baseChartOpts(110)} />
                </div>
                <AIInsightBar {...timelineInsight} />
              </div>
            </>
          )}

          {/* ── Quantity KPIs ── */}
          {isAllShifts && (
            <>
              <SectionTitle>Quantity-based KPIs</SectionTitle>
              <div className="chart-trio">
                <div className="chart-panel">
                  <div className="chart-header"><span className="chart-title">API_q — asset productivity (qty)</span></div>
                  <div style={{ height: 200 }}><Bar data={apiqData} options={baseChartOpts(110)} /></div>
                  <AIInsightBar {...apiqInsight} />
                </div>
                <div className="chart-panel">
                  <div className="chart-header"><span className="chart-title">CU_q — quantity utilization</span></div>
                  <div style={{ height: 200 }}><Bar data={cuqData} options={baseChartOpts(110)} /></div>
                  <AIInsightBar {...cuqInsight} />
                </div>
                <div className="chart-panel donut-panel">
                  <div className="chart-header"><span className="chart-title">ZLMV — consumption efficiency</span></div>
                  <div className="donut-wrap">
                    <Doughnut
                      data={doughnutData}
                      options={{ plugins: { legend: { display: false } }, animation: { duration: 900 } }}
                    />
                    <div className="donut-center">
                      <span className="donut-val" style={{ color: zlmvColor }}>{zlmv.toFixed(1)}%</span>
                      <span className="donut-lbl">avg ZLMV</span>
                    </div>
                  </div>
                  <AIInsightBar {...zlmvInsight} />
                </div>
              </div>
            </>
          )}

          {/* ── Summary Table ── */}
          <SectionTitle>
            Summary —{" "}
            {isAllShifts
              ? `avg across ${filtered.length} shifts · ${selectedDate}`
              : `S${latest.shift} · ${selectedDate}`}
          </SectionTitle>
          <div className="summary-table-wrap">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>KPI</th><th>Description</th>
                  <th>Value{isAllShifts ? " (avg)" : ""}</th>
                  <th>Threshold</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {KPI_META.map((meta) => {
                  const val    = displayKPIs[meta.key] || 0;
                  const status = getStatus(val, meta.thresholds);
                  return (
                    <tr key={meta.key}>
                      <td><span className="tbl-kpi-name" style={{ color: meta.color }}>{meta.label}</span></td>
                      <td className="tbl-muted">{meta.desc}</td>
                      <td className="tbl-mono">{val.toFixed(1)}%</td>
                      <td className="tbl-muted">≥ {meta.thresholds[1]}% optimal</td>
                      <td><span className={`kpi-badge kpi-badge--${status}`}>{status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <AIInsightBar {...tableInsight} />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;