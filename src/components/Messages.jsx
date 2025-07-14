import React from "react";

export default function Messages({ messages, onSendMessage, endRef }) {
  const handleButtonClick = (btn) => {
    onSendMessage({
      action: btn.action,
      value: btn.value,
    });
  };

  return (
    <div className="chatbox__messages">
      {messages.map((msg, i) => {
        const isUser = msg.sender === "user";
        const hasButtons = msg.sender === "bot" && Array.isArray(msg.buttons);
        const hasTable = msg.sender === "bot" && msg.table;
        const isTyping = msg.typing;

        // Si aucun contenu à afficher → on saute ce message
        const shouldSkip =
          !isTyping &&
          !hasButtons &&
          !hasTable &&
          (typeof msg.text !== "string" || msg.text.trim() === "");

        if (shouldSkip) return null;

        // Formatage sécurisé du texte
        let safeHtml = "";
        if (typeof msg.text === "string" && msg.text.trim() !== "") {
          safeHtml = msg.text.replace(/\n/g, "<br />");
        }

        return (
          <div
            key={i}
            className={`message-container ${isUser ? "user" : "bot"}`}
          >
            <div className={`message-bubble ${isUser ? "user" : "bot"}`}>
              <div className="message-content">
                {/* Texte ou saisie en cours */}
                {isTyping ? (
                  <div className="typing-indicator animated-typing">...</div>
                ) : (
                  safeHtml && (
                    <div
                      className="message-text"
                      dangerouslySetInnerHTML={{ __html: safeHtml }}
                    />
                  )
                )}

                {/* Tableau dynamique */}
                {hasTable && (
                  <table className="chatbot-table">
                    <tbody>
                      {Object.entries(msg.table).map(([key, value], index) => (
                        <tr key={index}>
                          <th>{key}</th>
                          <td>
                            {Array.isArray(value)
                              ? value.join(", ")
                              : value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Boutons dynamiques */}
                {hasButtons && (
                  <div className="chatbot-buttons-vertical">
                    {msg.buttons.map((btn, index) => (
                      <button
                        key={index}
                        className="chatbot-button"
                        onClick={() => handleButtonClick(btn)}
                      >
                        {btn.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Heure */}
              <div className="message-time">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={endRef} />
    </div>
  );
}
