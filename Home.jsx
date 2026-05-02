import '../css/Home.css'
import { MdHome, MdPrivacyTip } from "react-icons/md"
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="body">

      {/* BACKGROUND BLOBS */}
      <div className="bg-blobs">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
        <div className="bg-blob bg-blob-4"></div>
        <div className="bg-blob bg-blob-5"></div>
      </div>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">Nestlé</div>
        <ul className="nav-links">
          <li className="nav-item" onClick={() => navigate('/')}>
            <MdHome className="nav-icon" />
            <span>Home</span>
          </li>
          <li className="nav-item" onClick={() => navigate('/privacy')}>
            <MdPrivacyTip className="nav-icon" />
            <span>Privacy</span>
          </li>
        </ul>
      </nav>

      {/* CONTENT — two columns */}
      <div className="content">

        {/* LEFT: INTRO */}
        <div className="intro-side">

          <span className="intro-badge">Industrial KPI Monitoring</span>

          <h2 className="intro-title">
            Track production.<br />
            <span>Measure efficiency.</span>
          </h2>

          <p className="intro-desc">
            A real-time operations platform for Nestlé production teams —
            log shift data, monitor daily output, analyze consumption efficiency,
            and generate automated performance reports from one place.
          </p>

          <div className="intro-features">
            <div className="intro-feature">✦ Daily production quantity tracking</div>
            <div className="intro-feature">✦ Consumption & efficiency analysis</div>
            <div className="intro-feature">✦ KPI charts & historical reports</div>
            <div className="intro-feature">✦ AI-powered insights & anomaly alerts</div>
          </div>

          <div className="intro-stat-row">
            <div className="intro-stat">
              <span className="intro-stat-num">Real-time</span>
              <span className="intro-stat-lbl">Data updates</span>
            </div>
            <div className="intro-stat-divider" />
            <div className="intro-stat">
              <span className="intro-stat-num">2 roles</span>
              <span className="intro-stat-lbl">Admin & operator</span>
            </div>
            <div className="intro-stat-divider" />
            <div className="intro-stat">
              <span className="intro-stat-num">AI-ready</span>
              <span className="intro-stat-lbl">Predictive features</span>
            </div>
          </div>

          <div className="intro-buttons">
            <button className="intro-signin-btn" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>

        </div>

        {/* RIGHT: KPI PREVIEW PANEL */}
        <div className="preview-side">

          <div className="preview-card preview-card--main">
            <div className="preview-card-header">
              <span className="preview-card-title">Today's production</span>
              <span className="preview-badge--live">● Live</span>
            </div>
            <div className="preview-big-num">
              4 825 <small>units</small>
            </div>
            <div className="preview-target">
              Target: 5 000 — <span className="preview-pct">96.5% efficiency</span>
            </div>

            <div className="preview-bars">
              {[72, 85, 60, 91, 78, 95, 88, 74, 96, 83, 70, 89].map((h, i) => (
                <div key={i} className="preview-bar-wrap">
                  <div
                    className={`preview-bar${i === 11 ? ' preview-bar--active' : ''}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="preview-bar-labels">
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>Now</span>
            </div>
          </div>

          <div className="preview-mini-row">
            <div className="preview-card preview-card--mini">
              <span className="preview-mini-label">Consumption</span>
              <span className="preview-mini-val">12 340 <small>kWh</small></span>
              <span className="preview-mini-trend preview-mini-trend--good">↓ 3.2% vs yesterday</span>
            </div>
            <div className="preview-card preview-card--mini">
              <span className="preview-mini-label">Efficiency rate</span>
              <span className="preview-mini-val">94.8<small>%</small></span>
              <span className="preview-mini-trend preview-mini-trend--good">↑ 1.4% vs target</span>
            </div>
          </div>

          <div className="preview-ai-strip">
            <span className="preview-ai-icon">✦</span>
            <span className="preview-ai-text">
              AI insight: Output above average for this shift. Consumption down 3% — efficiency improving.
            </span>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Home