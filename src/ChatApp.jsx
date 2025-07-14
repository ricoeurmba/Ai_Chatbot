import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link
} from "react-router-dom";

import Auth from "./components/AuthForm";
import ChatInterface from "./components/Chat";
import ResetPassword from "./components/ResetPassword";
import FormationAdmin from './components/FormationAdmin';

import "./style.css";

function AppWrapper() {
  const location = useLocation();
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    const storedRole = sessionStorage.getItem("role");

    if (urlToken) {
      setToken(urlToken);
      sessionStorage.setItem("authToken", urlToken);
      if (storedRole) setRole(storedRole);
      window.history.replaceState({}, "", location.pathname);
    } else {
      const storedToken = sessionStorage.getItem("authToken");
      if (storedToken) {
        setToken(storedToken);
        if (storedRole) setRole(storedRole);
      }
    }
  }, [location]);
  const handleAuthSuccess = (tok, user, userRole) => {
    setToken(tok);
    setUsername(user);
    setRole(userRole);
    sessionStorage.setItem("authToken", tok);
    sessionStorage.setItem("role", userRole);
  };

  return (
    <>
      {role === "admin" && token && (
        <div style={{ background: "#222", padding: "1rem", color: "white", textAlign: "right" }}>
          <Link to="/admin" style={{ color: "#fff", fontWeight: "bold" }}>
            🔧 Accès admin : gérer les formations
          </Link>
        </div>
      )}
      <Routes>
        <Route
          path="/auth"
          element={
            token ? (
              role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/chat" replace />
              )
            ) : (
              <Auth onAuthSuccess={handleAuthSuccess} />
            )
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/chat"
          element={
            token ? (
              <ChatInterface username={username} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            token && role === "admin" ? (
              <FormationAdmin />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </>
  );
}

export default function ChatApp() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
