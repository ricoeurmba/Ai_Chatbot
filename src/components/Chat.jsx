// src/components/ChatInterface.jsx
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { sendMessageRequest } from "../api";
import Messages from "./Messages";
import { FiLogOut } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";

export default function ChatInterface({ username }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [animatedText, setAnimatedText] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  const recognitionRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    let i = 0;
    setAnimatedText("");
    setShowWelcome(true);
    const txt = ` Bonjour ${username}, je suis votre assistant virtuel. Comment puis-je vous aider ?`;
    const interval = setInterval(() => {
      setAnimatedText((t) => t + txt.charAt(i));
      i++;
      if (i >= txt.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [username]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.lang = "fr-FR";
      recognitionRef.current.onresult = (e) =>
        handleSendMessage(e.results[0][0].transcript);
    }
  }, []);

  useLayoutEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const handleSendMessage = async (message = inputValue) => {
    if (!message || (typeof message === "string" && !message.trim())) return;
    setInputValue("");
  
    // Gestion de l’affichage du message utilisateur
    const userText = typeof message === "string" ? message : message.value;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userText },
      { sender: "bot", text: "...", typing: true },
    ]);
  
    try {
      const { data } = await sendMessageRequest(message);
  
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "bot", ...data },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          sender: "bot",
          text: "Désolé, impossible de contacter le serveur.",
        },
      ]);
    }
  };
  

  return (
    <>
     {/* Logo de l'université en haut à gauche */}
     <img
      src="logo-icon-esgitech-white (1).svg"
      alt="Logo ESGITECH"
      className="university-logo"
      />
     {/* Message de bienvenue avec image de fond */}
      {showWelcome && (
        <div className="welcome-section">
        <div className="welcome-message">
          <h2>{animatedText}</h2>
        </div>
         </div>
        
      )}

      <button className="chatbox__button" onClick={() => setIsOpen((o) => !o)} >
        <img src="2chatbot.jpg" alt="Chatbot" />
      </button>

      <div className={`chatbox ${isOpen ? "chatbox--active" : ""}`}>
        {isOpen && (
          <div className="chatbox__support">
            <div className="chatbox__header">
              <div className="chatbox__image--header">
                <img
                  src="/person.png"
                  alt="Avatar"/>
              </div>
              <div className="chatbox__content--header">
                <h4 className="chatbox__heading--header">Assistant Esgitech</h4>
                <p className="chatbox__description--header">Besoin d'aide ?</p>
              </div>
              <button
                    className="chatbox__reset--header"
                    onClick={() => setMessages([])}
                  >
                    <FiTrash2 />
                  </button>
              <button
                    className="chatbox__logout--header"
                    onClick={() => {
                      sessionStorage.clear(); // ou localStorage.clear() si c'est utilisé
                      window.location.href = "/login";
                    }}
                  >
                    <FiLogOut />
                  </button>

            </div>

            <Messages
              messages={messages}
              onSendMessage={handleSendMessage}
              endRef={endRef}
            />

            <div className="chatbox__footer">
              <input
                type="text"
                placeholder="Écrivez un message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleSendMessage()
                }
              />
              <button
                className="chatbox__send--footer send__button"
                onClick={() => handleSendMessage()}
              >
                Envoyer
              </button>
              <button
                className="chatbox__send--footer voice__button"
                onClick={() => recognitionRef.current?.start()}
              >
                <img src="/wave-sound.png" alt="Mic" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
