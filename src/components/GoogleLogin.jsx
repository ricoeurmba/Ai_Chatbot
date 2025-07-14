// src/components/GoogleLogin.jsx
import React from "react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleLogin() {
  const onLogin = () => {
    // Rediriger l'utilisateur vers le flux d'authentification Google
    window.location.href = "http://localhost:5001/auth/google-login";  // Assure-toi d'utiliser l'URL correcte du backend Flask
  };

  return (
    <>
      <button onClick={onLogin} className="google-login-btn">
        <FcGoogle className="google-icon" />
        Se connecter avec Google
      </button>
      <div className="separator">
        <span className="separator-text">ou</span>
      </div>
    </>
  );
}
