import React, { useState } from "react";

export function Navbar({
  onGoHome,
  currentTitle,
  tournamentCode,
  currentUser,
}) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopyCode = () => {
    if (!tournamentCode) return;

    navigator.clipboard.writeText(tournamentCode);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  const username = currentUser?.username || "Jugador";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
        background: "linear-gradient(135deg, #171426 0%, #100e1a 100%)",
        border: "3px solid #2d2b4e",
        borderRadius: "14px",
        padding: "0.6rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow:
          "0 8px 25px rgba(0, 0, 0, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.1)",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Brillo superior */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #1b5fa8, #ffd700, #1b5fa8)",
          borderTopLeftRadius: "11px",
          borderTopRightRadius: "11px",
        }}
      ></div>

      {/* IZQUIERDA */}
      <div
        onClick={onGoHome}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            backgroundColor: "#1b5fa8",
            border: "2px solid #ffd700",
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
          }}
        >
          👑
        </div>

        <div>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "0.8rem",
              color: "#ffd700",
              textShadow: "1px 1px 0px #000",
              display: "block",
              lineHeight: "1.1",
            }}
          >
            {currentTitle || "TournamentClash"}
          </span>

          <span
            style={{
              fontSize: "9px",
              color: "#9ca3af",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            👤 {username}
          </span>
        </div>
      </div>

      {/* DESKTOP */}
      <div
        className="desktop-nav-actions"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {tournamentCode && (
          <button
            onClick={handleCopyCode}
            title="Copiar código para compartir"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "#0c0a12",
              border: "2px solid #282442",
              borderRadius: "8px",
              padding: "0.3rem 0.6rem",
              color: "#ffd700",
              fontSize: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            <span>🔑</span>

            <span
              style={{
                fontFamily: "monospace",
                color: "#fff",
                letterSpacing: "1px",
              }}
            >
              {tournamentCode}
            </span>

            <span
              style={{
                color: "#9ca3af",
                marginLeft: "2px",
              }}
            >
              {copied ? "✅" : "📋"}
            </span>
          </button>
        )}

        {/* USUARIO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "0.35rem 0.6rem",
            background: "#0c0a12",
            border: "2px solid #282442",
            borderRadius: "8px",
            color: "#ffd700",
            fontSize: "10px",
            fontWeight: "bold",
          }}
          title="Usuario actual"
        >
          👤 {username}
        </div>

        <button
          onClick={onGoHome}
          style={{
            padding: "0.4rem 0.75rem",
            background: "linear-gradient(to bottom, #1b5fa8 0%, #0f3768 100%)",
            border: "2px solid #3b82f6",
            borderBottom: "4px solid #1e3a8a",
            borderRadius: "8px",
            color: "#fff",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            cursor: "pointer",
            textShadow: "0 1px 0 rgba(0, 0, 0, 0.6)",
            boxShadow: "0 4px 0 #0f172a, 0 6px 12px rgba(27, 95, 168, 0.4)",
          }}
        >
          🏠 Inicio
        </button>
      </div>

      {/* HAMBURGUESA */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="mobile-menu-btn"
        style={{
          display: "none",
          background: "#0c0a12",
          border: "2px solid #282442",
          borderRadius: "8px",
          padding: "0.4rem 0.6rem",
          color: "#fff",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* MENU MOVIL */}
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            right: 0,
            background: "#171426",
            border: "3px solid #2d2b4e",
            borderRadius: "12px",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
            zIndex: 100,
          }}
        >
          {/* ALIAS */}
          <div
            style={{
              padding: "0.6rem",
              textAlign: "center",
              background: "#0c0a12",
              border: "2px solid #282442",
              borderRadius: "8px",
              color: "#ffd700",
              fontSize: "0.8rem",
              fontWeight: "bold",
            }}
          >
            👤 {username}
          </div>

          {tournamentCode && (
            <button
              onClick={handleCopyCode}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "#0c0a12",
                border: "2px solid #282442",
                borderRadius: "8px",
                padding: "0.6rem",
                color: "#ffd700",
                fontSize: "0.8rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              <span>🔑 Copiar Código:</span>

              <span
                style={{
                  fontFamily: "monospace",
                  color: "#fff",
                }}
              >
                {tournamentCode}
              </span>

              <span>{copied ? "✅" : "📋"}</span>
            </button>
          )}

          <button
            onClick={() => {
              setMenuOpen(false);
              onGoHome();
            }}
            style={{
              padding: "0.7rem",
              background:
                "linear-gradient(to bottom, #1b5fa8 0%, #0f3768 100%)",
              border: "2px solid #3b82f6",
              borderBottom: "4px solid #1e3a8a",
              borderRadius: "8px",
              color: "#fff",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            🏠 Volver al Inicio
          </button>
        </div>
      )}

      {/* CSS RESPONSIVE */}
      <style>{`
        @media (max-width: 640px) {
          .desktop-nav-actions {
            display: none !important;
          }

          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
