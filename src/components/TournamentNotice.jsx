import { useState } from "react";

export function useTournamentNotice() {
  const [notice, setNotice] = useState(null);

  const showNotice = (message) => {
    setNotice(String(message ?? ""));
  };

  const clearNotice = () => setNotice(null);

  return { notice, showNotice, clearNotice };
}

export function TournamentNotice({ notice, onClose }) {
  if (!notice) return null;

  const message = String(notice);
  const isSuccess = /✅|🏆|correctamente|se agregaron|te inscribiste|torneo en marcha/i.test(message);
  const isWarning = /⚠️|🔒|🚫|solo el creador|seleccioná|necesitás|necesitas/i.test(message);
  const accent = isSuccess ? "#86efac" : isWarning ? "#fbbf24" : "#a5b4fc";
  const symbol = isSuccess ? "⚔️" : isWarning ? "🛡️" : "💬";

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(3,3,10,0.62)",
        backdropFilter: "blur(4px)",
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-label="Aviso de TournamentClash"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "420px",
          boxSizing: "border-box",
          padding: "1.2rem",
          position: "relative",
          borderRadius: "16px",
          border: `1px solid ${accent}`,
          background: "radial-gradient(circle at 50% 0%, rgba(250,204,21,0.12), transparent 55%), linear-gradient(145deg, #171426, #080711 85%)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.07)",
          color: "#f9fafb",
          textAlign: "center",
        }}
      >
        <div style={{ color: "#facc15", fontSize: "0.62rem", fontWeight: 900, letterSpacing: "0.16em" }}>
          TOURNAMENTCLASH
        </div>
        <div
          aria-hidden="true"
          style={{
            width: "48px",
            height: "48px",
            margin: "0.7rem auto",
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            border: `1px solid ${accent}`,
            background: "rgba(255,255,255,0.055)",
            fontSize: "1.55rem",
          }}
        >
          {symbol}
        </div>
        <p style={{ margin: "0 0 1rem", color: "#e5e7eb", fontSize: "0.9rem", lineHeight: 1.55, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
          {message.replace(/^[❌✅⚠️🔒🚫🏆]\s*/, "")}
        </p>
        <button
          type="button"
          className="cr-btn-gold"
          onClick={onClose}
          autoFocus
          style={{ maxWidth: "180px", padding: "0.6rem 1rem", fontSize: "0.78rem" }}
        >
          Entendido
        </button>
      </section>
    </div>
  );
}
