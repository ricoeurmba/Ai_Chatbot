import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  const handleSendCode = async () => {
    try {
      const res = await axios.post('http://localhost:5001/auth/request-reset-code', { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur");
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirm) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      const res = await axios.post('http://localhost:5001/auth/verify-reset-code', {
        email,
        code,
        password
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2>Réinitialisation du mot de passe</h2>
        {message && <p className="reset-message">{message}</p>}

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button onClick={handleSendCode}>📩 Envoyer le code</button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Code reçu par email"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
            <button onClick={handleResetPassword}>Réinitialiser</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
