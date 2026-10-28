import { getTournamentPodium } from "../utils/tournamentAwards";
import { TCIcon } from "./TCIcon";

const POINTS = { gold: 10, silver: 8, bronze: 6, diploma: 2 };

export function GrandesGanadores({ tournaments = [], onBack }) {
  const rankingByPlayer = new Map();

  (tournaments || []).forEach((tournament) => {
    const podium = getTournamentPodium(tournament);
    if (!podium) return;

    const awards = [
      { name: podium.champion, type: "gold" },
      { name: podium.runnerUp, type: "silver" },
      ...(podium.bronze || []).map((name) => ({ name, type: "bronze" })),
      { name: podium.diploma, type: "diploma" },
    ];

    awards.forEach(({ name, type }) => {
      const playerName = String(name || "").trim();
      if (!playerName || playerName === "Pasaje Directo") return;

      const key = playerName.toLocaleLowerCase("es");
      if (!rankingByPlayer.has(key)) {
        rankingByPlayer.set(key, {
          name: playerName,
          points: 0,
          gold: 0,
          silver: 0,
          bronze: 0,
          diploma: 0,
          tournaments: 0,
        });
      }

      const player = rankingByPlayer.get(key);
      player[type] += 1;
      player.points += POINTS[type];
      player.tournaments += 1;
    });
  });

  const ranking = [...rankingByPlayer.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.gold - a.gold ||
      b.silver - a.silver ||
      b.bronze - a.bronze ||
      a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );

  return (
    <div className="tc-form-screen" style={{ width: "100%", padding: "0 0 2rem" }}>
      <div className="cr-card" style={{ width: "100%", maxWidth: "980px", margin: "auto", boxSizing: "border-box" }}>
        <div className="cr-card-glow"></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <div>
            <h2 className="cr-title" style={{ margin: 0 }}>
              <TCIcon name="trophy" size={23} /> Grandes Ganadores
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "0.8rem", marginBottom: 0 }}>
              Medallero histórico de todos los torneos finalizados
            </p>
          </div>
          <button type="button" onClick={onBack} style={{ padding: "0.55rem 0.8rem", background: "#121019", border: "1px solid #3b82f6", borderRadius: "8px", color: "#bfdbfe", cursor: "pointer", fontWeight: 700 }}>
            <TCIcon name="home" size={15} /> Volver al inicio
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1rem" }}>
          {[
            ["🥇 Oro", "10 pts"],
            ["🥈 Plata", "8 pts"],
            ["🥉 Bronce", "6 pts"],
            ["📜 Diploma", "2 pts"],
          ].map(([label, value]) => (
            <div key={label} style={{ flex: "1 1 120px", padding: "0.65rem", borderRadius: "8px", background: "#121019", border: "1px solid #2d2b3b" }}>
              <span style={{ display: "block", color: "#d1d5db", fontSize: "0.72rem" }}>{label}</span>
              <strong style={{ color: "#ffd700", fontSize: "0.9rem" }}>{value}</strong>
            </div>
          ))}
        </div>

        {ranking.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#9ca3af" }}>
            <TCIcon name="medal" size={32} />
            <p style={{ marginBottom: 0 }}>Todavía no hay premios registrados. El ranking se actualizará cuando haya torneos finalizados con podio.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "500px", borderCollapse: "collapse", textAlign: "center", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ background: "#121019", color: "#ffd700" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left" }}># / Jugador</th>
                  <th style={{ padding: "0.75rem" }}>🥇</th>
                  <th style={{ padding: "0.75rem" }}>🥈</th>
                  <th style={{ padding: "0.75rem" }}>🥉</th>
                  <th style={{ padding: "0.75rem" }}>📜</th>
                  <th style={{ padding: "0.75rem" }}>Puntos</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((player, index) => (
                  <tr key={player.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: index === 0 ? "rgba(255,215,0,0.07)" : "transparent" }}>
                    <td style={{ padding: "0.8rem", textAlign: "left", color: "#fff", fontWeight: 800 }}>
                      <span style={{ color: index === 0 ? "#ffd700" : "#9ca3af", marginRight: "0.5rem" }}>{index === 0 ? "👑" : index + 1}</span>
                      {player.name}
                    </td>
                    <td style={{ padding: "0.8rem", color: "#facc15" }}>{player.gold}</td>
                    <td style={{ padding: "0.8rem", color: "#d1d5db" }}>{player.silver}</td>
                    <td style={{ padding: "0.8rem", color: "#d97706" }}>{player.bronze}</td>
                    <td style={{ padding: "0.8rem", color: "#93c5fd" }}>{player.diploma}</td>
                    <td style={{ padding: "0.8rem", color: "#ffd700", fontWeight: 900 }}>{player.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
