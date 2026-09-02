import { calculateGroupStandings } from "../utils/tournamentLogic";
import { useState } from "react";

export function GroupStageView({
  tournament,
  onUpdateTournament,
  onProceedToPlayoffs,
}) {
  // tournament.groups contiene un array de grupos: { id, name, teams, matches }
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const currentGroup = tournament.groups[activeGroupIndex];
  const standings = calculateGroupStandings(
    currentGroup.teams,
    currentGroup.matches
  );

  const handleScoreChange = (matchId, field, value) => {
    const numValue = value === "" ? null : Number(value);

    const updatedGroups = tournament.groups.map((group, gIdx) => {
      if (gIdx !== activeGroupIndex) return group;

      const updatedMatches = group.matches.map((match) => {
        if (match.id !== matchId) return match;
        return { ...match, [field]: numValue };
      });

      return { ...group, matches: updatedMatches };
    });

    onUpdateTournament({ ...tournament, groups: updatedGroups });
  };

  // Verifica si todos los partidos de todos los grupos tienen resultado cargado
  const allGroupsFinished = tournament.groups.every((group) =>
    group.matches.every((m) => m.score1 !== null && m.score2 !== null)
  );

  return (
    <div className="cr-card" style={{ maxWidth: "600px" }}>
      <div className="cr-card-glow"></div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "10px",
              color: "#ffd700",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {tournament.game}
          </span>
          <h2
            className="cr-title"
            style={{ fontSize: "1.2rem", textAlign: "left" }}
          >
            {tournament.title}
          </h2>
        </div>
        <span
          style={{
            fontSize: "11px",
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            color: "#4ade80",
            border: "1px solid #22c55e",
            padding: "4px 8px",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          Fase de Grupos
        </span>
      </div>

      {/* Selector de Grupos */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.2rem",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {tournament.groups.map((group, idx) => (
          <button
            key={group.id}
            onClick={() => setActiveGroupIndex(idx)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: idx === activeGroupIndex ? "#1b5fa8" : "#121019",
              border: `2px solid ${
                idx === activeGroupIndex ? "#ffd700" : "#2d2b3b"
              }`,
              color: "#fff",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "0.8rem",
              whiteSpace: "nowrap",
            }}
          >
            {group.name}
          </button>
        ))}
      </div>

      {/* Tabla de Posiciones */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3
          style={{
            fontSize: "0.85rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            color: "#9ca3af",
            marginBottom: "0.5rem",
          }}
        >
          Tabla de Posiciones - {currentGroup.name}
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.75rem",
              textAlign: "center",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#121019",
                  color: "#ffd700",
                  borderBottom: "2px solid #2d2b3b",
                }}
              >
                <th style={{ padding: "6px", textAlign: "left" }}>
                  Pos / Equipo
                </th>
                <th style={{ padding: "6px" }}>PJ</th>
                <th style={{ padding: "6px" }}>G</th>
                <th style={{ padding: "6px" }}>E</th>
                <th style={{ padding: "6px" }}>P</th>
                <th style={{ padding: "6px" }}>DG</th>
                <th style={{ padding: "6px" }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, idx) => {
                const isQualified = idx < tournament.qualifiersPerGroup;
                return (
                  <tr
                    key={team.name}
                    style={{
                      borderBottom: "1px solid #2d2b3b",
                      backgroundColor: isQualified
                        ? "rgba(34, 197, 94, 0.05)"
                        : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        fontWeight: "bold",
                        color: isQualified ? "#4ade80" : "#fff",
                      }}
                    >
                      {idx + 1}. {team.name} {isQualified && "⭐"}
                    </td>
                    <td>{team.played}</td>
                    <td>{team.won}</td>
                    <td>{team.drawn}</td>
                    <td>{team.lost}</td>
                    <td>
                      {team.goalDifference > 0
                        ? `+${team.goalDifference}`
                        : team.goalDifference}
                    </td>
                    <td style={{ fontWeight: "900", color: "#ffd700" }}>
                      {team.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partidos del Grupo */}
      <div>
        <h3
          style={{
            fontSize: "0.85rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            color: "#9ca3af",
            marginBottom: "0.5rem",
          }}
        >
          Partidos y Resultados
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {currentGroup.matches.map((match) => (
            <div
              key={match.id}
              style={{
                padding: "0.5rem 0.75rem",
                backgroundColor: "#121019",
                border: "2px solid #2d2b3b",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  width: "35%",
                  textAlign: "right",
                }}
              >
                {match.team1}
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <input
                  type="number"
                  min="0"
                  value={match.score1 !== null ? match.score1 : ""}
                  onChange={(e) =>
                    handleScoreChange(match.id, "score1", e.target.value)
                  }
                  style={{
                    width: "32px",
                    textAlign: "center",
                    backgroundColor: "#1e1b2e",
                    border: "1px solid #1b5fa8",
                    color: "#fff",
                    borderRadius: "4px",
                    padding: "2px",
                  }}
                />
                <span>-</span>
                <input
                  type="number"
                  min="0"
                  value={match.score2 !== null ? match.score2 : ""}
                  onChange={(e) =>
                    handleScoreChange(match.id, "score2", e.target.value)
                  }
                  style={{
                    width: "32px",
                    textAlign: "center",
                    backgroundColor: "#1e1b2e",
                    border: "1px solid #1b5fa8",
                    color: "#fff",
                    borderRadius: "4px",
                    padding: "2px",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  width: "35%",
                  textAlign: "left",
                }}
              >
                {match.team2}
              </span>
            </div>
          ))}
        </div>
      </div>

      {allGroupsFinished && (
        <button
          onClick={onProceedToPlayoffs}
          className="cr-btn-gold"
          style={{ marginTop: "1.2rem" }}
        >
          Avanzar a Playoff (Eliminación Directa) 🏆
        </button>
      )}
    </div>
  );
}
