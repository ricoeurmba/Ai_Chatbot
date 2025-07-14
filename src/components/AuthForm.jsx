import React, { useState } from "react";
import { loginRequest, registerRequest } from "../api";
import { FaUser, FaLock } from "react-icons/fa";
import { MdMarkEmailUnread } from "react-icons/md";
import GoogleLogin from "./GoogleLogin";
import { Link } from "react-router-dom";

export default function Auth({ onAuthSuccess }) {
  const [view, setView] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [filiere, setFiliere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState({
    length: false,
    upper: false,
    lower: false,
    special: false,
  });

  const login = async () => {
    setErrorMessage("");
    try {
      const res = await loginRequest(username, password);
      onAuthSuccess(res.data.token, username, res.data.role); // ← Ajoute le role ici
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Identifiants incorrects.");
    }
  };

  const register = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!username || !password || !email) {
      setErrorMessage("Tous les champs obligatoires doivent être remplis.");
      setShowErrors(true);
      return;
    }

    if (!isPasswordStrong(password)) {
      setErrorMessage(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un caractère spécial."
      );
      return;
    }

    try {
      await registerRequest({
        username,
        password,
        email,
        birthDate,
        gender,
        phone,
        filiere,
        niveau,
      });
      setSuccessMessage("Inscription réussie ! Vérifiez votre mail.");
      setView("login");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Erreur lors de l'inscription.");
    }
  };

  const isPasswordStrong = (pwd) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[\W_]/.test(pwd)
    );
  };

  const updatePasswordFeedback = (pwd) => {
    setPasswordFeedback({
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      special: /[\W_]/.test(pwd),
    });
  };

  return (
    <div className="authentification">
      <h2>{view === "login" ? "Connexion" : "Inscription"}</h2>

      {errorMessage && <div className="alert-message error">{errorMessage}</div>}
      {successMessage && <div className="alert-message success">{successMessage}</div>}

      {view === "login" && <GoogleLogin onLogin={login} />}

      <div className="input-icon-wrapper">
        <FaUser className="input-icon" />
        <input
          className={`input-field ${showErrors && !username ? "input-error" : ""}`}
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="input-icon-wrapper">
        <FaLock className="input-icon" />
        <input
          className={`input-field ${showErrors && !password ? "input-error" : ""}`}
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            updatePasswordFeedback(e.target.value);
          }}
          required
        />
      </div>

      {/* Feedback mot de passe visible uniquement lors de l’inscription */}
      {view === "register" && password && (
        <ul style={{ fontSize: "0.85rem", margin: "0 0 1rem 10px", padding: 0, listStyle: "none" }}>
          <li style={{ color: passwordFeedback.length ? "green" : "crimson" }}>
            {passwordFeedback.length ? "✅" : "❌"} Au moins 8 caractères
          </li>
          <li style={{ color: passwordFeedback.upper ? "green" : "crimson" }}>
            {passwordFeedback.upper ? "✅" : "❌"} Une majuscule
          </li>
          <li style={{ color: passwordFeedback.lower ? "green" : "crimson" }}>
            {passwordFeedback.lower ? "✅" : "❌"} Une minuscule
          </li>
          <li style={{ color: passwordFeedback.special ? "green" : "crimson" }}>
            {passwordFeedback.special ? "✅" : "❌"} Un caractère spécial
          </li>
        </ul>
      )}

      {view === "register" && (
        <>
          <div className="input-icon-wrapper">
            <MdMarkEmailUnread className="input-icon" />
            <input
              className={`input-field ${showErrors && !email ? "input-error" : ""}`}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <input
            className="input-field"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          <select
            className="input-field"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Sexe</option>
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
          </select>

          <input
            className="input-field"
            type="tel"
            placeholder="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="niveau-selection">
            <label>
              <input
                type="radio"
                name="niveau"
                value="licence"
                checked={niveau === "licence"}
                onChange={(e) => {
                  setNiveau(e.target.value);
                  setFiliere("genie logiciel");
                }}
              />{" "}
              Licence
            </label>
            <label>
              <input
                type="radio"
                name="niveau"
                value="master"
                checked={niveau === "master"}
                onChange={(e) => {
                  setNiveau(e.target.value);
                  setFiliere("");
                }}
              />{" "}
              Master
            </label>
          </div>

          {niveau === "licence" && (
            <select
              className="input-field"
              value={filiere}
              onChange={(e) => setFiliere(e.target.value)}
            >
              <option value="genie logiciel">Génie Logiciel</option>
            </select>
          )}

          {niveau === "master" && (
            <select
              className="input-field"
              value={filiere}
              onChange={(e) => setFiliere(e.target.value)}
            >
              <option value="">-- Sélectionner une filière --</option>
              <option value="cybersecurite">Cybersécurité</option>
              <option value="datascience">Data Science</option>
              <option value="developpement logiciel">Développement Logiciel</option>
              <option value="systeme embarqué et iot">Systèmes Embarqués & IoT</option>
            </select>
          )}
        </>
      )}

      <button onClick={view === "login" ? login : register} className="submit-btn">
        {view === "login" ? "Se connecter" : "S'inscrire"}
      </button>

      {view === "login" && (
        <p className="forgot-password">
          <Link to="/reset-password">Mot de passe oublié ?</Link>
        </p>
      )}

      <p
        className="toggle-link"
        onClick={() => setView(view === "login" ? "register" : "login")}
      >
        {view === "login" ? "Pas encore inscrit ?" : "Déjà un compte ?"}
      </p>
    </div>
  );
}
