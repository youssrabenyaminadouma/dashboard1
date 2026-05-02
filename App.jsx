
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./routes/Login";
import Privacy from "./routes/Privacy";
import Home from "./routes/Home";
import Dashboard from "./routes/Dashboard";
import KPIform from "./routes/KPIform";
import Rapport from "./routes/Rapport";
import Members from "./routes/Members";
import Sidebar from "./Sidebar";
import CreateAccount from "./routes/CreateAccount";
import Private from "./routes/Private";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Pages WITHOUT sidebar */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Pages WITH sidebar */}
        <Route element={<Sidebar />}>

          {/* Dashboard (all roles) */}
          <Route
            path="/dashboard"
            element={
              <Private allowed={["admin","viewer","supervisor","controller"]}>
                <Dashboard />
              </Private>
            }
          />

          {/* KPI Form (supervisor only) */}
          <Route
            path="/kpiform"
            element={
              <Private allowed={["supervisor"]}>
                <KPIform />
              </Private>
            }
          />

          {/* Rapport */}
          <Route
            path="/rapport"
            element={
              <Private allowed={["admin","supervisor","controller"]}>
                <Rapport />
              </Private>
            }
          />

          {/* Members (admin only) */}
          <Route
            path="/members"
            element={
              <Private  allowed={["admin","supervisor","controller"]}>
                <Members />
              </Private>
            }
          />

          {/* Create Account (admin only) */}
          <Route
            path="/create-account"
            element={
              <Private allowed={["admin","vierwer"]}>
                <CreateAccount />
              </Private>
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;


