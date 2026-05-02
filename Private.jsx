import { Navigate } from "react-router-dom";

function Private({ children, allowed }) {

  const role = localStorage.getItem("userRole");

  if (!role) {
    return <Navigate to="/login" />;
  }

  if (!allowed.includes(role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default Private;
// Private route component used to protect pages based on user role.
// It checks the role stored in localStorage after login.
// If the user is not logged in → redirect to /login.
// If the user's role is not in the allowed roles → redirect to /dashboard.
// Otherwise, the requested page (children) is displayed.