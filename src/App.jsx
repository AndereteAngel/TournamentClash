import {
  calculateGroupStandings,
  generatePlayoffBrackets,
} from "./utils/tournamentLogic";
import { useEffect, useState } from "react";

import { CreateTournament } from "./components/CreateTournament";
import { GroupStageView } from "./components/GroupStageView";
import { Navbar } from "./components/Navbar";
import { PlayoffBracket } from "./components/PlayoffBracket";
import { supabase } from "./supabaseClient";

export function TournamentClashApp() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("cr_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState("login");
  const [authInput, setAuthInput] = useState({ username: "", password: "" });

  const [activeView, setActiveView] = useState("home"); // 'home' | 'create' | 'groups' | 'playoffs' | 'join'
  const [activeTournament, setActiveTournament] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar torneos desde Supabase al iniciar sesión
  useEffect(() => {
    if (currentUser) {
      fetchTournaments();
    }
  }, [currentUser]);

  const fetchTournaments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener torneos:", error);
    } else {
      setTournaments(data || []);
    }
    setLoading(false);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const username = authInput.username.trim();
    const password = authInput.password.trim();

    if (!username || !password) return;

    const registeredUsers = JSON.parse(
      localStorage.getItem("cr_users") || "[]"
    );

    if (authMode === "register") {
      const exists = registeredUsers.find(
        (u) => u.username.toLowerCase() === username.toLowerCase()
      );
      if (exists) {
        alert("❌ Este nombre de usuario ya está registrado.");
        return;
      }
      const newUser = { username, password };
      registeredUsers.push(newUser);
      localStorage.setItem("cr_users", JSON.stringify(registeredUsers));
      setCurrentUser(newUser);
    } else {
      const user = registeredUsers.find(
        (u) =>
          u.username.toLowerCase() === username.toLowerCase() &&
          u.password === password
      );
      if (!user) {
        alert("❌ Usuario o contraseña incorrectos.");
        return;
      }
      setCurrentUser(user);
    }

    localStorage.setItem("cr_current_user", JSON.stringify(authInput));
    setAuthInput({ username: "", password: "" });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("cr_current_user");
    setActiveView("home");
    setActiveTournament(null);
  };

  const handleGoHome = () => {
    setActiveTournament(null);
    setActiveView("home");
  };

  const handleCreateTournamentSubmit = async (config) => {
    const shuffled = [...config.teams].sort(() => 0.5 - Math.random());
    const groups = [];
    const numGroups = config.format === "groups_playoff" ? config.numGroups : 1;

    for (let i = 0; i < numGroups; i++) {
      groups.push({
        id: i + 1,
        name: `Grupo ${String.fromCharCode(65 + i)}`,
        teams: [],
        matches: [],
      });
    }

    shuffled.forEach((team, idx) => {
      groups[idx % numGroups].teams.push(team);
    });

    groups.forEach((group) => {
      const groupMatches = [];
      const t = group.teams;
      for (let i = 0; i < t.length; i++) {
        for (let j = i + 1; j < t.length; j++) {
          groupMatches.push({
            id: `${t[i]}-${t[j]}`,
            team1: t[i],
            team2: t[j],
            score1: null,
            score2: null,
          });
        }
      }
      group.matches = groupMatches;
    });

    const randomCode = "CR-" + Math.floor(1000 + Math.random() * 9000);

    const newTournamentObj = {
      code: randomCode,
      title: config.title,
      game: config.game,
      format: config.format,
      qualifiers_per_group: config.qualifiersPerGroup,
      is_public: config.isPublic,
      created_by: currentUser.username,
      groups,
      playoffs: null,
      status: "En curso",
    };

    const { data, error } = await supabase
      .from("tournaments")
      .insert([newTournamentObj])
      .select();

    if (error) {
      alert("❌ Error al guardar el torneo en Supabase.");
      console.error(error);
      return;
    }

    if (data && data.length > 0) {
      setActiveTournament(data[0]);
      setTournaments([data[0], ...tournaments]);
      setActiveView("groups");
    }
  };

  const handleUpdateTournamentInSupabase = async (updatedTournament) => {
    setActiveTournament(updatedTournament);

    const { error } = await supabase
      .from("tournaments")
      .update({
        groups: updatedTournament.groups,
        playoffs: updatedTournament.playoffs,
        status: updatedTournament.status,
      })
      .eq("id", updatedTournament.id);

    if (error) {
      console.error("Error al actualizar la tabla en Supabase:", error);
    } else {
      setTournaments(
        tournaments.map((t) =>
          t.id === updatedTournament.id ? updatedTournament : t
        )
      );
    }
  };

  const handleJoinTournamentSubmit = (e) => {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim().toUpperCase();
    const found = tournaments.find((t) => t.code === cleanCode);

    if (!found) {
      alert("❌ Código de torneo no encontrado en la base de datos.");
      return;
    }

    setActiveTournament(found);
    if (found.playoffs && found.playoffs.length > 0) {
      setActiveView("playoffs");
    } else {
      setActiveView("groups");
    }
  };

  const handleProceedToPlayoffs = () => {
    let qualifiedTeams = [];

    activeTournament.groups.forEach((group) => {
      const standings = calculateGroupStandings(group.teams, group.matches);
      const topTeams = standings
        .slice(0, activeTournament.qualifiers_per_group)
        .map((s) => s.name);
      qualifiedTeams.push(...topTeams);
    });

    const playoffs = generatePlayoffBrackets(qualifiedTeams);

    const updated = {
      ...activeTournament,
      playoffs,
    };

    handleUpdateTournamentInSupabase(updated);
    setActiveView("playoffs");
  };

  const handleFinishTournament = () => {
    alert("¡Torneo finalizado con éxito! El campeón ha sido coronado.");
    const finishedObj = { ...activeTournament, status: "Finalizado" };
    handleUpdateTournamentInSupabase(finishedObj);
    setActiveView("home");
    setActiveTournament(null);
  };

  return (
    <div className="cr-container">
      {/* 🔹 NAVBAR ARRIBA (Solo se muestra si hay un usuario logueado) */}
      {currentUser && (
        <Navbar
          onGoHome={handleGoHome}
          currentTitle={activeTournament?.title}
          tournamentCode={activeTournament?.code}
        />
      )}

      {!currentUser ? (
        <div className="cr-card" style={{ margin: "auto" }}>
          <div className="cr-card-glow"></div>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "rgba(27, 95, 168, 0.4)",
                border: "2px solid #ffd700",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem auto",
                fontSize: "32px",
              }}
            >
              🏆
            </div>
            <h1 className="cr-logo-title">TournamentClash</h1>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "0.75rem",
                marginTop: "8px",
              }}
            >
              Conectado a la Nube de Supabase ⚡
            </p>
          </div>

          <form
            onSubmit={handleAuthSubmit}
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
                Usuario
              </label>
              <input
                type="text"
                placeholder="Ej: ReyAzul99"
                value={authInput.username}
                onChange={(e) =>
                  setAuthInput({ ...authInput, username: e.target.value })
                }
                required
                className="cr-input"
              />
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
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={authInput.password}
                onChange={(e) =>
                  setAuthInput({ ...authInput, password: e.target.value })
                }
                required
                className="cr-input"
              />
            </div>

            <button
              type="submit"
              className="cr-btn-gold"
              style={{ marginTop: "0.5rem" }}
            >
              {authMode === "login" ? "Entrar a la Arena ⚔️" : "Registrarse 🛡️"}
            </button>

            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#60a5fa",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {authMode === "login"
                  ? "¿No tienes cuenta? Regístrate aquí"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>
          </form>
        </div>
      ) : activeView === "home" ? (
        <div className="cr-card" style={{ maxWidth: "480px", margin: "auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid #2d2b3b",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#1b5fa8",
                  borderRadius: "8px",
                  border: "2px solid #ffd700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                👑
              </div>
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    display: "block",
                  }}
                >
                  Competidor Online
                </span>
                <h2
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 900,
                    color: "#ffd700",
                    margin: 0,
                  }}
                >
                  {currentUser.username}
                </h2>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.35rem 0.75rem",
                backgroundColor: "rgba(127, 29, 29, 0.4)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                color: "#f87171",
                fontWeight: "bold",
                borderRadius: "6px",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              Cerrar Sesión
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <button
              onClick={() => setActiveView("create")}
              style={{
                padding: "1rem",
                background: "linear-gradient(to bottom, #1b5fa8, #0f3768)",
                border: "2px solid rgba(96, 165, 250, 0.5)",
                borderRadius: "10px",
                textAlign: "left",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>⚔️</div>
              <h3
                style={{
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  margin: "0 0 2px 0",
                }}
              >
                Armar Torneo
              </h3>
              <p style={{ fontSize: "10px", color: "#bfdbfe", margin: 0 }}>
                Sincronizado en la nube
              </p>
            </button>

            <button
              onClick={() => setActiveView("join")}
              style={{
                padding: "1rem",
                background: "linear-gradient(to bottom, #581c87, #1e142e)",
                border: "2px solid rgba(168, 85, 247, 0.5)",
                borderRadius: "10px",
                textAlign: "left",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>🔍</div>
              <h3
                style={{
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  margin: "0 0 2px 0",
                }}
              >
                Unirme
              </h3>
              <p style={{ fontSize: "10px", color: "#e9d5ff", margin: 0 }}>
                Entra con código
              </p>
            </button>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span>⚡</span>
                <h3
                  style={{
                    fontWeight: 900,
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    color: "#e5e7eb",
                    margin: 0,
                  }}
                >
                  Torneos en la Nube
                </h3>
              </div>
              <button
                onClick={fetchTournaments}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#60a5fa",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                🔄 Recargar
              </button>
            </div>

            {loading ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "0.85rem",
                }}
              >
                Cargando torneos...
              </p>
            ) : tournaments.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "0.85rem",
                }}
              >
                No hay torneos activos creados aún.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  maxHeight: "240px",
                  overflowY: "auto",
                }}
              >
                {tournaments.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveTournament(t);
                      setActiveView(
                        t.playoffs && t.playoffs.length > 0
                          ? "playoffs"
                          : "groups"
                      );
                    }}
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#121019",
                      border: "2px solid #2d2b3b",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "2px",
                        }}
                      >
                        {t.is_public ? (
                          <span
                            style={{
                              fontSize: "9px",
                              backgroundColor: "rgba(27, 95, 168, 0.4)",
                              color: "#93c5fd",
                              fontWeight: "bold",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid rgba(59, 130, 246, 0.3)",
                            }}
                          >
                            {t.code}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "9px",
                              backgroundColor: "rgba(127, 29, 29, 0.4)",
                              color: "#fca5a5",
                              fontWeight: "bold",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                            }}
                          >
                            🔒 Privado
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "bold",
                            color: "#ffd700",
                          }}
                        >
                          👑 {t.created_by}
                        </span>
                      </div>
                      <h4
                        style={{
                          fontWeight: 900,
                          fontSize: "0.85rem",
                          margin: 0,
                          color: "#fff",
                        }}
                      >
                        {t.title}
                      </h4>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 900,
                          color:
                            t.status === "En curso" ? "#34d399" : "#60a5fa",
                          display: "block",
                        }}
                      >
                        {t.status}
                      </span>
                      <span
                        style={{
                          fontSize: "9px",
                          color: "#9ca3af",
                          fontWeight: 500,
                        }}
                      >
                        Entrar ➔
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeView === "create" ? (
        <CreateTournament
          onSave={handleCreateTournamentSubmit}
          onCancel={() => setActiveView("home")}
        />
      ) : activeView === "join" ? (
        <div className="cr-card" style={{ maxWidth: "420px", margin: "auto" }}>
          <div className="cr-card-glow"></div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h2 className="cr-title" style={{ fontSize: "1.1rem" }}>
              🔑 Unirse a Torneo
            </h2>
            <button
              onClick={() => setActiveView("home")}
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
            onSubmit={handleJoinTournamentSubmit}
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
                Código de Invitación
              </label>
              <input
                type="text"
                placeholder="Ej: CR-4829"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                required
                className="cr-input"
                style={{
                  textAlign: "center",
                  fontSize: "1.1rem",
                  letterSpacing: "2px",
                  fontWeight: "900",
                }}
              />
            </div>

            <button
              type="submit"
              className="cr-btn-gold"
              style={{ marginTop: "0.5rem" }}
            >
              Ingresar a la Batalla ⚔️
            </button>
          </form>
        </div>
      ) : activeView === "groups" ? (
        <GroupStageView
          tournament={activeTournament}
          onUpdateTournament={handleUpdateTournamentInSupabase}
          onProceedToPlayoffs={handleProceedToPlayoffs}
        />
      ) : (
        <PlayoffBracket
          tournament={activeTournament}
          onUpdateTournament={handleUpdateTournamentInSupabase}
          onFinishTournament={handleFinishTournament}
        />
      )}
    </div>
  );
}

