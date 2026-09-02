import { useState } from "react";

export function CreateTournament({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    game: "Clash Royale 1v1",
    format: "groups_playoff", // 'groups_playoff' o 'league'
    numGroups: 2,
    qualifiersPerGroup: 2,
    isPublic: true, // NUEVO: Por defecto público para mostrar el código
    participantsInput: "",
  });

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
          style={{ fontSize: "1.2rem", textAlign: "left" }}
        >
          ⚔️ Configurar Torneo
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

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
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
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="cr-input"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
          }}
        >
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
                setFormData({ ...formData, game: e.target.value })
              }
              className="cr-input"
              style={{ cursor: "pointer" }}
            >
              <option value="Clash Royale 1v1">Clash Royale 1v1</option>
              <option value="Brawl Stars">Brawl Stars</option>
              <option value="EA Sports FC 26">EA Sports FC 26</option>
              <option value="Valorant">Valorant</option>
            </select>
          </div>

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
                setFormData({ ...formData, format: e.target.value })
              }
              className="cr-input"
              style={{ cursor: "pointer" }}
            >
              <option value="groups_playoff">Grupos + Playoffs</option>
              <option value="league">Todos contra Todos</option>
            </select>
          </div>
        </div>

        {/* NUEVO CAMPO: Selector de Visibilidad (Público / Privado) */}
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
            style={{ cursor: "pointer" }}
          >
            <option value="public">Público (Muestra código en la lista)</option>
            <option value="private">Privado (Oculta código)</option>
          </select>
        </div>

        {formData.format === "groups_playoff" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
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
                style={{ cursor: "pointer" }}
              >
                <option value={2}>2 Grupos</option>
                <option value={4}>4 Grupos</option>
              </select>
            </div>

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
                style={{ cursor: "pointer" }}
              >
                <option value={1}>1 clasificado</option>
                <option value={2}>2 clasificados</option>
              </select>
            </div>
          </div>
        )}

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
            placeholder="ReyAzul99&#10;PrincesaPoder&#10;PekkaMaster&#10;MontapuercosX"
            rows={5}
            value={formData.participantsInput}
            onChange={(e) =>
              setFormData({ ...formData, participantsInput: e.target.value })
            }
            required
            className="cr-input"
            style={{ resize: "vertical", fontFamily: "inherit" }}
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

        <button
          type="submit"
          className="cr-btn-gold"
          style={{ marginTop: "0.5rem" }}
        >
          Generar Torneo y Calendario 🏆
        </button>
      </form>
    </div>
  );
}
