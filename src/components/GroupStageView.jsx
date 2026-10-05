import { calculateGroupStandings } from "../utils/tournamentLogic";
import { useState } from "react";

export function GroupStageView({
  tournament,
  onUpdateTournament,
  onProceedToPlayoffs,
  currentUser,
}) {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const currentGroup = tournament.groups[activeGroupIndex];

  const standings = calculateGroupStandings(
    currentGroup.teams,
    currentGroup.matches
  );

  // Solo el creador del torneo puede cargar/modificar resultados
  const isCreator = currentUser?.id === tournament.created_by_user_id;

  const handleScoreChange = (matchId, field, value) => {
    // Seguridad adicional en la interfaz
    if (!isCreator) return;

    const numValue = value === "" ? null : Number(value);

    const updatedGroups = tournament.groups.map((group, gIdx) => {
      if (gIdx !== activeGroupIndex) return group;

      const updatedMatches = group.matches.map((match) => {
        if (match.id !== matchId) return match;

        return {
          ...match,
          [field]: numValue,
        };
      });

      return {
        ...group,
        matches: updatedMatches,
      };
    });

    onUpdateTournament({
      ...tournament,
      groups: updatedGroups,
    });
  };

  const allGroupsFinished = tournament.groups.every((group) =>
    group.matches.every((m) => m.score1 !== null && m.score2 !== null)
  );

  return (
    <div
      className="cr-card"
      style={{
        maxWidth: "700px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div className="cr-card-glow"></div>

      {/* ENCABEZADO */}
      <div
        className="tournament-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "10px",
              color: "#ffd700",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "0.3rem",
            }}
          >
            {tournament.game}
          </span>

          <h2
            className="cr-title"
            style={{
              fontSize: "1.3rem",
              textAlign: "left",
              margin: 0,
              lineHeight: 1.2,
              overflowWrap: "break-word",
            }}
          >
            {tournament.title}
          </h2>
        </div>

        <span
          className="tournament-phase-badge"
          style={{
            flexShrink: 0,
            fontSize: "10px",
            background:
              "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.05))",
            color: "#4ade80",
            border: "1px solid rgba(34,197,94,0.45)",
            padding: "6px 10px",
            borderRadius: "999px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          FASE DE GRUPOS
        </span>
      </div>

      {/* AVISO DE PERMISOS */}
      <div
        style={{
          marginBottom: "1.2rem",
          padding: "0.75rem 0.9rem",
          borderRadius: "10px",
          background: isCreator
            ? "rgba(255,215,0,0.07)"
            : "rgba(96,165,250,0.07)",
          border: isCreator
            ? "1px solid rgba(255,215,0,0.2)"
            : "1px solid rgba(96,165,250,0.2)",
          color: isCreator ? "#facc15" : "#93c5fd",
          fontSize: "0.75rem",
          lineHeight: 1.4,
        }}
      >
        {isCreator ? (
          <>
            🛡️ <strong>Organizador:</strong> sos el responsable de cargar y
            validar los resultados.
          </>
        ) : (
          <>
            👁️ Los resultados son cargados exclusivamente por el organizador del
            torneo.
          </>
        )}
      </div>

      {/* SELECTOR DE GRUPOS */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.65rem",
            gap: "1rem",
          }}
        >
          <h3
            style={{
              fontSize: "0.8rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              color: "#9ca3af",
              margin: 0,
              letterSpacing: "0.5px",
            }}
          >
            Seleccionar grupo
          </h3>

          <span
            style={{
              fontSize: "0.7rem",
              color: "#6b7280",
            }}
          >
            {tournament.groups.length} grupos
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.6rem",
            overflowX: "auto",
            padding: "0.2rem 0.1rem 0.5rem",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {tournament.groups.map((group, idx) => (
            <button
              key={group.id}
              onClick={() => setActiveGroupIndex(idx)}
              style={{
                flex: "0 0 auto",
                minWidth: "76px",
                padding: "0.65rem 1rem",
                background:
                  idx === activeGroupIndex
                    ? "linear-gradient(135deg, #1b5fa8, #123d70)"
                    : "rgba(18,16,25,0.9)",
                border:
                  idx === activeGroupIndex
                    ? "1px solid #ffd700"
                    : "1px solid #2d2b3b",
                color: idx === activeGroupIndex ? "#fff" : "#9ca3af",
                borderRadius: "9px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.78rem",
                whiteSpace: "nowrap",
                boxShadow:
                  idx === activeGroupIndex
                    ? "0 4px 14px rgba(27,95,168,0.25)"
                    : "none",
              }}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE POSICIONES */}
      <div
        style={{
          marginBottom: "1.5rem",
          padding: "0.9rem",
          background: "rgba(8,10,18,0.55)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <h3
            style={{
              fontSize: "0.85rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              color: "#d1d5db",
              margin: 0,
            }}
          >
            Tabla de posiciones
          </h3>

          <span
            style={{
              fontSize: "0.7rem",
              color: "#ffd700",
              fontWeight: "bold",
            }}
          >
            {currentGroup.name}
          </span>
        </div>

        <div
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "430px",
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
                <th
                  style={{
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Pos / Equipo
                </th>
                <th style={{ padding: "8px" }}>PJ</th>
                <th style={{ padding: "8px" }}>G</th>
                <th style={{ padding: "8px" }}>E</th>
                <th style={{ padding: "8px" }}>P</th>
                <th style={{ padding: "8px" }}>DG</th>
                <th style={{ padding: "8px" }}>Pts</th>
              </tr>
            </thead>

            <tbody>
              {standings.map((team, idx) => {
                const isQualified = idx < tournament.qualifiersPerGroup;

                return (
                  <tr
                    key={team.name}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      backgroundColor: isQualified
                        ? "rgba(34,197,94,0.05)"
                        : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "9px 8px",
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

                    <td
                      style={{
                        fontWeight: "900",
                        color: "#ffd700",
                      }}
                    >
                      {team.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PARTIDOS */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "0.65rem",
          }}
        >
          <h3
            style={{
              fontSize: "0.85rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              color: "#d1d5db",
              margin: 0,
            }}
          >
            Partidos
          </h3>

          <span
            style={{
              fontSize: "0.68rem",
              color: "#6b7280",
            }}
          >
            {currentGroup.matches.length} encuentros
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.65rem",
            maxHeight: "300px",
            overflowY: "auto",
            paddingRight: "2px",
          }}
        >
          {currentGroup.matches.map((match) => (
            <div
              key={match.id}
              style={{
                padding: "0.75rem",
                background: "linear-gradient(135deg, #121019, #0d0c13)",
                border: "1px solid #2d2b3b",
                borderRadius: "10px",
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              {/* EQUIPO 1 */}
              <span
                style={{
                  fontSize: "0.76rem",
                  fontWeight: "bold",
                  textAlign: "right",
                  overflowWrap: "anywhere",
                }}
              >
                {match.team1}
              </span>

              {/* RESULTADO */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 6px",
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: "8px",
                }}
              >
                <input
                  type="number"
                  min="0"
                  value={match.score1 !== null ? match.score1 : ""}
                  disabled={!isCreator}
                  onChange={(e) =>
                    handleScoreChange(match.id, "score1", e.target.value)
                  }
                  style={{
                    width: "34px",
                    height: "30px",
                    textAlign: "center",
                    backgroundColor: isCreator ? "#1e1b2e" : "#15141c",
                    border: isCreator
                      ? "1px solid #1b5fa8"
                      : "1px solid #272532",
                    color: "#fff",
                    borderRadius: "5px",
                    padding: "2px",
                    fontWeight: "bold",
                    boxSizing: "border-box",
                    cursor: isCreator ? "text" : "not-allowed",
                    opacity: isCreator ? 1 : 0.8,
                  }}
                />

                <span
                  style={{
                    color: "#6b7280",
                    fontWeight: "bold",
                  }}
                >
                  -
                </span>

                <input
                  type="number"
                  min="0"
                  value={match.score2 !== null ? match.score2 : ""}
                  disabled={!isCreator}
                  onChange={(e) =>
                    handleScoreChange(match.id, "score2", e.target.value)
                  }
                  style={{
                    width: "34px",
                    height: "30px",
                    textAlign: "center",
                    backgroundColor: isCreator ? "#1e1b2e" : "#15141c",
                    border: isCreator
                      ? "1px solid #1b5fa8"
                      : "1px solid #272532",
                    color: "#fff",
                    borderRadius: "5px",
                    padding: "2px",
                    fontWeight: "bold",
                    boxSizing: "border-box",
                    cursor: isCreator ? "text" : "not-allowed",
                    opacity: isCreator ? 1 : 0.8,
                  }}
                />
              </div>

              {/* EQUIPO 2 */}
              <span
                style={{
                  fontSize: "0.76rem",
                  fontWeight: "bold",
                  textAlign: "left",
                  overflowWrap: "anywhere",
                }}
              >
                {match.team2}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AVANZAR */}
      {allGroupsFinished && isCreator && (
        <button
          onClick={onProceedToPlayoffs}
          className="cr-btn-gold"
          style={{
            marginTop: "1.5rem",
            width: "100%",
          }}
        >
          Avanzar a Playoff · Eliminación Directa 🏆
        </button>
      )}
    </div>
  );
}
