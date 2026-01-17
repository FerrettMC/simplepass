import "./index.css";
import { authenticateUser, getCurrentUser } from "./backendCalls";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import StudentHome from "./components/StudentHome";
import TeacherHome from "./components/TeacherHome";
import AdminHome from "./components/AdminHome";
import Register from "./components/Register";
import NotFound from "./components/NotFound";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function ProtectedRoute({ authenticated, children }) {
  console.log(authenticated);
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function GetHomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    }
    getUser();
  }, []);

  console.log(user);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin":
      return <Navigate to="/AdminHome" replace />;
    case "teacher":
      return <Navigate to="/TeacherHome" replace />;
    case "student":
      return <Navigate to="/StudentHome" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      const user = await authenticateUser();

      setAuthenticated(!!user);
      setLoading(false);
      if (user) {
        console.log(user);
      }
    }
    checkLogin();
  }, []);

  return (
    <Router>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              authenticated ? (
                <GetHomePage />
              ) : (
                <Login setAuthenticated={setAuthenticated} />
              )
            }
          />

          <Route
            path="/register"
            element={<Register setAuthenticated={setAuthenticated} />}
          />

          <Route
            path="/StudentHome"
            element={
              <ProtectedRoute authenticated={authenticated}>
                <StudentHome setAuthenticated={setAuthenticated} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/TeacherHome"
            element={
              <ProtectedRoute authenticated={authenticated}>
                <TeacherHome setAuthenticated={setAuthenticated} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AdminHome"
            element={
              <ProtectedRoute authenticated={authenticated}>
                <AdminHome setAuthenticated={setAuthenticated} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
