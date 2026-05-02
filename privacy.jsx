import "../css/Privacy.css";
import { MdHome, MdPrivacyTip } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="body">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">Nestlé</div>
        <ul className="nav-links">
          <li className="nav-item" onClick={() => navigate("/")}>
            <MdHome className="nav-icon" />
            <span>Home</span>
          </li>
          <li className="nav-item">
            <MdPrivacyTip className="nav-icon" />
            <span>Privacy</span>
          </li>
        </ul>
      </nav>

      {/* CONTENT */}
      <div className="privacy-content">
        <div className="privacy-container">
          <div className="privacy-header">
            <MdPrivacyTip className="privacy-icon" />
            <h1>Privacy Policy</h1>
            <p className="privacy-date">Last updated: April 2026</p>
          </div>

          <div className="privacy-section">
            <h2>1. What Data We Collect</h2>
            <p>
              When you create an account, we collect the following personal
              information:
            </p>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Encrypted password</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>2. Why We Collect It</h2>
            <p>Your data is collected for the following purposes:</p>
            <ul>
              <li>To authenticate your identity and secure your account</li>
              <li>To personalize your dashboard experience</li>
              <li>To send important account-related notifications</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>3. How We Store It</h2>
            <p>
              All data is stored securely on our servers. Passwords are
              encrypted and never stored in plain text. We do not sell or share
              your personal data with any third parties.
            </p>
          </div>

          <div className="privacy-section">
            <h2>5. Contact Us</h2>
            <p>For any privacy-related concerns, please contact us at:</p>
            <p className="privacy-email">privacy@nestle-dashboard.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
