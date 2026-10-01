import { useEffect, useState } from "react";

export function CreateTournament({
  onSave,
  onCancel,
  isEditing = false,
  initialData = null,
}) {
  // =========================================================
  // OBTENER PARTICIPANTES ACTUALES
  // =========================================================

  const getParticipantsFromTournament = () => {
    if (!initialData?.groups) return [];

    const participants = [];

    initialData.groups.forEach((group) => {
      (group.teams || []).forEach((team) => {
        if (!participants.includes(team)) {
          participants.push(team);
        }
      });
    });

    return participants;
  };

  // =========================================================
  // DATOS INICIALES
  // =========================================================

  const getInitialFormData = () => {
    if (!isEditing || !initialData) {
      return {
        title: "",
        game: "Clash Royale 1v1",
        format: "groups_playoff",
        numGroups: 2,
        qualifiersPerGroup: 2,
        isPublic: true,
        participantsInput: "",
      };
    }

    const participants = getParticipantsFromTournament();

    return {
      title: initialData.title || "",
      game: initialData.game || "Clash Royale 1v1",
      format: initialData.format || "groups_playoff",
      numGroups:
        initialData.format === "league" ? 1 : initialData.groups?.length || 2,
      qualifiersPerGroup: initialData.qualifiers_per_group || 2,
      isPublic: initialData.is_public !== false,
      participantsInput: participants.join("\n"),
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // =========================================================
  // ACTUALIZAR FORMULARIO AL ENTRAR EN EDICIÓN
  // =========================================================

  useEffect(() => {
    setFormData(getInitialFormData());
  }, [initialData, isEditing]);

  // =========================================================
  // GUARDAR
  // =========================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    const teams = formData.participantsInput
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (teams.length < 4) {
      alert("Necesitas al menos 4 participantes para armar el torneo.");
      return;
    }

    onSave({
      ...formData,
      teams,
    });
  };

  return (
    <div className="cr-card" style={{ maxWidth: "520px" }}>
      <div className="cr-card-glow"></div>

      {/* =====================================================
          CABECERA
          ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2
          className="cr-title"
          style={{
            fontSize: "1.2rem",
            textAlign: "left",
          }}
        >
          {isEditing ? "⚙️ Modificar Torneo" : "⚔️ Configurar Torneo"}
        </h2>

        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: "none",
            color: "#9ca3af",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.85rem",
          }}
        >
          ✕ Volver
        </button>
      </div>

      {/* =====================================================
          AVISO DE EDICIÓN
          ===================================================== */}

      {isEditing && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem",
            borderRadius: "8px",
            background: "rgba(27, 95, 168, 0.25)",
            border: "1px solid rgba(96, 165, 250, 0.4)",
            color: "#bfdbfe",
            fontSize: "0.75rem",
            lineHeight: "1.4",
          }}
        >
          ℹ️ Modificá solamente los datos que necesites. Los partidos y
          resultados existentes se conservarán siempre que no hagas un cambio
          estructural.
        </div>
      )}

      {/* =====================================================
          FORMULARIO
          ===================================================== */}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* ===================================================
            NOMBRE
            =================================================== */}

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              color: "#d1d5db",
              marginBottom: "4px",
            }}
          >
            Nombre del Torneo
          </label>

          <input
            type="text"
            placeholder="Ej: Copa Suprema de Clanes"
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
            required
            className="cr-input"
          />
        </div>

        {/* ===================================================
            JUEGO + FORMATO
            =================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
          }}
        >
          {/* JUEGO */}

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                color: "#d1d5db",
                marginBottom: "4px",
              }}
            >
              Videojuego
            </label>

            <select
              value={formData.game}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  game: e.target.value,
                })
              }
              className="cr-input"
              style={{
                cursor: "pointer",
              }}
            >
              <option value="Clash Royale 1v1">Clash Royale 1v1</option>

              <option value="Brawl Stars">Brawl Stars</option>

              <option value="EA Sports FC 26">EA Sports FC 26</option>

              <option value="Valorant">Valorant</option>
            </select>
          </div>

          {/* FORMATO */}

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                color: "#d1d5db",
                marginBottom: "4px",
              }}
            >
              Formato
            </label>

            <select
              value={formData.format}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  format: e.target.value,
                })
              }
              className="cr-input"
              style={{
                cursor: "pointer",
              }}
            >
              <option value="groups_playoff">Grupos + Playoffs</option>

              <option value="league">Todos contra Todos</option>
            </select>
          </div>
        </div>

        {/* ===================================================
            VISIBILIDAD
            =================================================== */}

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              color: "#d1d5db",
              marginBottom: "4px",
            }}
          >
            Visibilidad del Torneo
          </label>

          <select
            value={formData.isPublic ? "public" : "private"}
            onChange={(e) =>
              setFormData({
                ...formData,
                isPublic: e.target.value === "public",
              })
            }
            className="cr-input"
            style={{
              cursor: "pointer",
            }}
          >
            <option value="public">Público (Muestra código en la lista)</option>

            <option value="private">Privado (Oculta código)</option>
          </select>
        </div>

        {/* ===================================================
            GRUPOS
            =================================================== */}

        {formData.format === "groups_playoff" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {/* CANTIDAD DE GRUPOS */}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "#d1d5db",
                  marginBottom: "4px",
                }}
              >
                Cantidad de Grupos
              </label>

              <select
                value={formData.numGroups}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numGroups: Number(e.target.value),
                  })
                }
                className="cr-input"
                style={{
                  cursor: "pointer",
                }}
              >
                <option value={2}>2 Grupos</option>

                <option value={4}>4 Grupos</option>
              </select>
            </div>

            {/* CLASIFICADOS */}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "#d1d5db",
                  marginBottom: "4px",
                }}
              >
                Clasificados por Grupo
              </label>

              <select
                value={formData.qualifiersPerGroup}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    qualifiersPerGroup: Number(e.target.value),
                  })
                }
                className="cr-input"
                style={{
                  cursor: "pointer",
                }}
              >
                <option value={1}>1 clasificado</option>

                <option value={2}>2 clasificados</option>
              </select>
            </div>
          </div>
        )}

        {/* ===================================================
            PARTICIPANTES
            =================================================== */}

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              color: "#d1d5db",
              marginBottom: "4px",
            }}
          >
            Participantes (Uno por línea)
          </label>

          <textarea
            placeholder={"ReyAzul99\nPrincesaPoder\nPekkaMaster\nMontapuercosX"}
            rows={5}
            value={formData.participantsInput}
            onChange={(e) =>
              setFormData({
                ...formData,
                participantsInput: e.target.value,
              })
            }
            required
            className="cr-input"
            style={{
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />

          <span
            style={{
              fontSize: "10px",
              color: "#9ca3af",
              marginTop: "4px",
              display: "block",
            }}
          >
            Escribe o pega los nombres de los jugadores separados por saltos de
            línea.
          </span>
        </div>

        {/* ===================================================
            BOTÓN
            =================================================== */}

        <button
          type="submit"
          className="cr-btn-gold"
          style={{
            marginTop: "0.5rem",
          }}
        >
          {isEditing
            ? "💾 Guardar modificaciones"
            : "Generar Torneo y Calendario 🏆"}
        </button>
      </form>
    </div>
  );
}
