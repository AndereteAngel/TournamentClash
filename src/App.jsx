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

const ADMIN_UID = "c2089fce-5fb1-430a-8abc-89f5b762b69a";

function AdminStats({ onBack }) {
  const [visitas, setVisitas] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState("");

  const cargarEstadisticas = async () => {
    setLoadingStats(true);
    setErrorStats("");

    const { data, error } = await supabase
      .from("visitas")
      .select(
        "id, created_at, user_id, username, email, device, started_at, last_seen_at, duration_seconds"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener estadísticas:", error);
      setErrorStats("No se pudieron cargar las estadísticas.");
      setLoadingStats(false);
      return;
    }

    setVisitas(data || []);
    setLoadingStats(false);
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const formatearDuracion = (segundos) => {
    const total = Number(segundos || 0);

    if (total < 60) {
      return `${total}s`;
    }

    const minutos = Math.floor(total / 60);
    const segundosRestantes = total % 60;

    if (minutos < 60) {
      return `${minutos}m ${segundosRestantes}s`;
    }

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    return `${horas}h ${minutosRestantes}m`;
  };

  const visitasHoy = visitas.filter((visita) => {
    const fecha = new Date(visita.created_at);
    const ahora = new Date();

    return (
      fecha.getDate() === ahora.getDate() &&
      fecha.getMonth() === ahora.getMonth() &&
      fecha.getFullYear() === ahora.getFullYear()
    );
  }).length;

  const usuariosRegistrados = new Set(
    visitas.filter((visita) => visita.user_id).map((visita) => visita.user_id)
  ).size;

  const visitasAnonimas = visitas.filter((visita) => !visita.user_id).length;

  const visitasMobile = visitas.filter(
    (visita) => visita.device === "mobile"
  ).length;

  const visitasDesktop = visitas.filter(
    (visita) => visita.device === "desktop"
  ).length;

  const tiempoTotal = visitas.reduce(
    (total, visita) => total + Number(visita.duration_seconds || 0),
    0
  );

  const tiempoPromedio =
    visitas.length > 0 ? Math.round(tiempoTotal / visitas.length) : 0;

  const usuariosActivos = visitas.filter((visita) => {
    if (!visita.last_seen_at) return false;

    const diferencia = Date.now() - new Date(visita.last_seen_at).getTime();

    return diferencia <= 5 * 60 * 1000;
  }).length;

  // =========================================================
  // VISITAS POR DÍA
  // =========================================================

  const visitasPorDia = {};

  visitas.forEach((visita) => {
    const fecha = new Date(visita.created_at);

    const dia = fecha.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    });

    visitasPorDia[dia] = (visitasPorDia[dia] || 0) + 1;
  });

  const diasOrdenados = Object.entries(visitasPorDia).slice(0, 14);

  // =========================================================
  // VISITAS POR HORA
  // =========================================================

  const visitasPorHora = Array.from({ length: 24 }, () => 0);

  visitas.forEach((visita) => {
    const hora = new Date(visita.created_at).getHours();

    visitasPorHora[hora]++;
  });

  // =========================================================
  // JUGADORES
  // =========================================================

  const jugadoresMap = {};

  visitas
    .filter((visita) => visita.user_id)
    .forEach((visita) => {
      if (!jugadoresMap[visita.user_id]) {
        jugadoresMap[visita.user_id] = {
          id: visita.user_id,
          username: visita.username || "Jugador",
          email: visita.email || "",
          visitas: 0,
          tiempo: 0,
          ultimaVisita: visita.created_at,
        };
      }

      jugadoresMap[visita.user_id].visitas++;

      jugadoresMap[visita.user_id].tiempo += Number(
        visita.duration_seconds || 0
      );

      if (
        new Date(visita.created_at) >
        new Date(jugadoresMap[visita.user_id].ultimaVisita)
      ) {
        jugadoresMap[visita.user_id].ultimaVisita = visita.created_at;
      }

      if (visita.email) {
        jugadoresMap[visita.user_id].email = visita.email;
      }
    });

  const jugadores = Object.values(jugadoresMap).sort(
    (a, b) => b.visitas - a.visitas
  );

  if (loadingStats) {
    return (
      <div
        className="cr-card"
        style={{
          maxWidth: "1000px",
          margin: "auto",
          textAlign: "center",
        }}
      >
        <h2 className="cr-title">📊 Estadísticas</h2>

        <p style={{ color: "#9ca3af" }}>Cargando estadísticas...</p>
      </div>
    );
  }

  if (errorStats) {
    return (
      <div
        className="cr-card"
        style={{
          maxWidth: "1000px",
          margin: "auto",
          textAlign: "center",
        }}
      >
        <h2 className="cr-title">📊 Estadísticas</h2>

        <p style={{ color: "#f87171" }}>{errorStats}</p>

        <button
          onClick={onBack}
          className="cr-btn-gold"
          style={{ marginTop: "1rem" }}
        >
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        paddingBottom: "2rem",
      }}
    >
      {/* HEADER */}

      <div
        className="cr-card"
        style={{
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 className="cr-title" style={{ marginBottom: "4px" }}>
              📊 Estadísticas
            </h2>

            <p
              style={{
                color: "#9ca3af",
                margin: 0,
                fontSize: "0.8rem",
              }}
            >
              Panel privado de TournamentClash
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <button
              onClick={cargarEstadisticas}
              style={{
                padding: "0.5rem 0.8rem",
                background: "#1b5fa8",
                border: "1px solid #3b82f6",
                color: "#fff",
                borderRadius: "7px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              🔄 Actualizar
            </button>

            <button
              onClick={onBack}
              style={{
                padding: "0.5rem 0.8rem",
                background: "transparent",
                border: "1px solid #4b5563",
                color: "#d1d5db",
                borderRadius: "7px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>

      {/* RESUMEN */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        {[
          ["👁️", "Visitas totales", visitas.length],
          ["📅", "Visitas hoy", visitasHoy],
          ["👥", "Jugadores", usuariosRegistrados],
          ["🕵️", "Anónimas", visitasAnonimas],
          ["🟢", "Activos", usuariosActivos],
          ["⏱️", "Tiempo promedio", formatearDuracion(tiempoPromedio)],
        ].map(([icono, titulo, valor]) => (
          <div
            key={titulo}
            className="cr-card"
            style={{
              padding: "1rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.4rem" }}>{icono}</div>

            <div
              style={{
                color: "#9ca3af",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                fontWeight: "bold",
                marginTop: "4px",
              }}
            >
              {titulo}
            </div>

            <div
              style={{
                color: "#ffd700",
                fontSize: "1.4rem",
                fontWeight: 900,
                marginTop: "4px",
              }}
            >
              {valor}
            </div>
          </div>
        ))}
      </div>

      {/* DISPOSITIVOS */}

      <div
        className="cr-card"
        style={{
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            color: "#fff",
            marginTop: 0,
            marginBottom: "1rem",
          }}
        >
          📱 Dispositivos
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              background: "#121019",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>📱</div>

            <strong
              style={{
                color: "#fff",
                display: "block",
                marginTop: "5px",
              }}
            >
              Mobile
            </strong>

            <span style={{ color: "#9ca3af" }}>{visitasMobile} visitas</span>
          </div>

          <div
            style={{
              padding: "1rem",
              background: "#121019",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>💻</div>

            <strong
              style={{
                color: "#fff",
                display: "block",
                marginTop: "5px",
              }}
            >
              Desktop
            </strong>

            <span style={{ color: "#9ca3af" }}>{visitasDesktop} visitas</span>
          </div>
        </div>
      </div>

      {/* VISITAS POR DÍA */}

      <div
        className="cr-card"
        style={{
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            color: "#fff",
            marginTop: 0,
            marginBottom: "1rem",
          }}
        >
          📅 Visitas por día
        </h3>

        {diasOrdenados.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>Todavía no hay datos.</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
            }}
          >
            {diasOrdenados.map(([dia, cantidad]) => (
              <div
                key={dia}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span
                  style={{
                    width: "55px",
                    color: "#d1d5db",
                    fontSize: "0.8rem",
                  }}
                >
                  {dia}
                </span>

                <div
                  style={{
                    flex: 1,
                    height: "22px",
                    background: "#121019",
                    borderRadius: "5px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        (cantidad /
                          Math.max(
                            1,
                            Math.max(...Object.values(visitasPorDia))
                          )) *
                          100
                      )}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #1b5fa8, #60a5fa)",
                    }}
                  />
                </div>

                <strong
                  style={{
                    width: "30px",
                    textAlign: "right",
                    color: "#ffd700",
                  }}
                >
                  {cantidad}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VISITAS POR HORA */}

      <div
        className="cr-card"
        style={{
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            color: "#fff",
            marginTop: 0,
            marginBottom: "1rem",
          }}
        >
          🕐 Visitas por horario
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(55px, 1fr))",
            gap: "0.4rem",
          }}
        >
          {visitasPorHora.map((cantidad, hora) => (
            <div
              key={hora}
              style={{
                background: "#121019",
                borderRadius: "6px",
                padding: "0.5rem 0.2rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "0.65rem",
                }}
              >
                {String(hora).padStart(2, "0")}h
              </div>

              <strong
                style={{
                  color: cantidad > 0 ? "#ffd700" : "#4b5563",
                  fontSize: "0.9rem",
                }}
              >
                {cantidad}
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* JUGADORES */}

      <div className="cr-card">
        <h3
          style={{
            color: "#fff",
            marginTop: 0,
            marginBottom: "1rem",
          }}
        >
          👑 Jugadores
        </h3>

        {jugadores.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>
            Todavía no ingresaron jugadores registrados.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {jugadores.map((jugador, index) => (
              <div
                key={jugador.id}
                style={{
                  background: "#121019",
                  border: "1px solid #2d2b3b",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  display: "grid",
                  gridTemplateColumns:
                    "30px minmax(120px, 1fr) repeat(3, auto)",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <strong
                  style={{
                    color: "#ffd700",
                  }}
                >
                  #{index + 1}
                </strong>

                <div>
                  <strong
                    style={{
                      color: "#fff",
                      display: "block",
                    }}
                  >
                    {jugador.username}
                  </strong>

                  <span
                    style={{
                      color: "#60a5fa",
                      fontSize: "0.7rem",
                      display: "block",
                      marginTop: "2px",
                      wordBreak: "break-word",
                    }}
                  >
                    📧 {jugador.email || "Email no registrado"}
                  </span>

                  <span
                    style={{
                      color: "#6b7280",
                      fontSize: "0.65rem",
                      display: "block",
                      marginTop: "2px",
                    }}
                  >
                    Última visita: {formatearFecha(jugador.ultimaVisita)}
                  </span>
                </div>

                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.65rem",
                      display: "block",
                    }}
                  >
                    Visitas
                  </span>

                  <strong style={{ color: "#60a5fa" }}>
                    {jugador.visitas}
                  </strong>
                </div>

                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.65rem",
                      display: "block",
                    }}
                  >
                    Tiempo
                  </span>

                  <strong style={{ color: "#34d399" }}>
                    {formatearDuracion(jugador.tiempo)}
                  </strong>
                </div>

                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.65rem",
                      display: "block",
                    }}
                  >
                    Dispositivo
                  </span>

                  <span>
                    {visitas.find((v) => v.user_id === jugador.id)?.device ===
                    "mobile"
                      ? "📱"
                      : "💻"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TournamentClashApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authInput, setAuthInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [activeView, setActiveView] = useState("home");
  const [activeTournament, setActiveTournament] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTournament, setEditingTournament] = useState(false);
  const [deletingTournamentId, setDeletingTournamentId] = useState(null);

  // =========================================================
  // RECUPERAR SESIÓN
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error al recuperar sesión:", error);
        return;
      }

      if (!session?.user) {
        if (mounted) setCurrentUser(null);
        return;
      }

      const user = await buildCurrentUser(session.user);

      if (mounted) setCurrentUser(user);
    };

    loadCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        if (mounted) setCurrentUser(null);
        return;
      }

      const user = await buildCurrentUser(session.user);

      if (mounted) setCurrentUser(user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const buildCurrentUser = async (authUser) => {
    if (!authUser) return null;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, username, email")
      .eq("id", authUser.id)
      .maybeSingle();

    if (error) console.error("Error al obtener perfil:", error);

    return {
      id: authUser.id,
      username:
        profile?.username || authUser.user_metadata?.username || "Jugador",
      email: authUser.email || profile?.email || "",
    };
  };

  // =========================================================
  // REGISTRAR VISITA Y MEDIR INTERACCIÓN
  // =========================================================

  useEffect(() => {
    if (!currentUser) return;

    const registrarOAsociarVisita = async () => {
      const device = window.innerWidth <= 768 ? "mobile" : "desktop";

      let visitaId = sessionStorage.getItem("tournamentclash_visita_id");

      if (!visitaId) {
        visitaId = crypto.randomUUID();

        sessionStorage.setItem("tournamentclash_visita_id", visitaId);
      }

      const ahora = new Date().toISOString();

      // Primero buscamos si ya existe esta visita.
      const { data: visitaExistente, error: errorBusqueda } = await supabase
        .from("visitas")
        .select("id, user_id, username, email, started_at")
        .eq("id", visitaId)
        .maybeSingle();

      if (errorBusqueda) {
        console.error("Error al buscar la visita actual:", errorBusqueda);
        return;
      }

      // Si no existe, la creamos directamente asociada al usuario.
      if (!visitaExistente) {
        const visita = {
          id: visitaId,
          user_id: currentUser.id,
          username: currentUser.username,
          email: currentUser.email || null,
          device,
          started_at: ahora,
          last_seen_at: ahora,
          duration_seconds: 0,
        };

        const { error } = await supabase.from("visitas").insert(visita);

        if (error) {
          console.error("Error al registrar visita:", error);
        }

        return;
      }

      // Si ya existía como anónima o tenía datos antiguos,
      // la asociamos al usuario actual.
      const { error: errorActualizacion } = await supabase
        .from("visitas")
        .update({
          user_id: currentUser.id,
          username: currentUser.username,
          email: currentUser.email || null,
        })
        .eq("id", visitaId);

      if (errorActualizacion) {
        console.error(
          "Error al asociar visita al usuario:",
          errorActualizacion
        );
      }
    };

    const actualizarTiempo = async () => {
      const visitaId = sessionStorage.getItem("tournamentclash_visita_id");

      if (!visitaId) return;

      const { data, error } = await supabase
        .from("visitas")
        .select("started_at")
        .eq("id", visitaId)
        .maybeSingle();

      if (error || !data?.started_at) return;

      const inicio = new Date(data.started_at);
      const ahora = new Date();

      const segundos = Math.max(0, Math.floor((ahora - inicio) / 1000));

      await supabase
        .from("visitas")
        .update({
          last_seen_at: ahora.toISOString(),
          duration_seconds: segundos,
        })
        .eq("id", visitaId);
    };

    registrarOAsociarVisita();

    const intervalo = setInterval(() => {
      actualizarTiempo();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        actualizarTiempo();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalo);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) fetchTournaments();
    else setTournaments([]);
  }, [currentUser]);

  const fetchTournaments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) console.error("Error al obtener torneos:", error);
    else setTournaments(data || []);

    setLoading(false);
  };

  // =========================================================
  // ELIMINAR TORNEO - SOLO ADMIN
  // =========================================================

  const handleDeleteTournament = async (tournament) => {
    if (!currentUser || currentUser.id !== ADMIN_UID) {
      alert("❌ No tenés permisos para eliminar torneos.");
      return;
    }

    if (!tournament?.id) {
      alert("❌ No se pudo identificar el torneo.");
      return;
    }

    const confirmar = window.confirm(
      `⚠️ ELIMINAR TORNEO\n\n` +
        `"${tournament.title}"\n\n` +
        `Esta acción eliminará el torneo de TournamentClash.\n\n` +
        `¿Estás seguro de que querés continuar?`
    );

    if (!confirmar) return;

    setDeletingTournamentId(tournament.id);

    try {
      const { error } = await supabase
        .from("tournaments")
        .delete()
        .eq("id", tournament.id);

      if (error) {
        console.error("Error al eliminar torneo:", error);

        alert(
          `❌ No se pudo eliminar el torneo.\n\n${
            error.message || "Error desconocido."
          }`
        );

        return;
      }

      setTournaments((prev) => prev.filter((t) => t.id !== tournament.id));

      if (activeTournament?.id === tournament.id) {
        setActiveTournament(null);
        setActiveView("home");
        setEditingTournament(false);
      }

      alert("✅ Torneo eliminado correctamente.");
    } catch (error) {
      console.error("Error inesperado al eliminar torneo:", error);

      alert("❌ Ocurrió un error al intentar eliminar el torneo.");
    } finally {
      setDeletingTournamentId(null);
    }
  };

  // =========================================================
  // AUTENTICACIÓN
  // =========================================================

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    const username = authInput.username.trim();
    const email = authInput.email.trim().toLowerCase();
    const password = authInput.password.trim();

    if (authMode === "register") {
      if (!username || !email || !password) {
        alert("❌ Completá todos los campos.");
        return;
      }

      if (username.length < 3) {
        alert("❌ El alias debe tener al menos 3 caracteres.");
        return;
      }

      if (password.length < 6) {
        alert("❌ La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", username)
        .maybeSingle();

      if (profileError)
        console.error("Error al verificar alias:", profileError);

      if (existingProfile) {
        alert("❌ Este alias ya está registrado.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) {
        console.error("Error al registrar usuario:", error);

        if (error.message?.toLowerCase().includes("already registered")) {
          alert("❌ Este email ya está registrado.");
        } else {
          alert(`❌ No se pudo registrar el usuario: ${error.message}`);
        }

        return;
      }

      if (!data.session) {
        alert(
          "✅ Registro realizado.\n\nRevisá tu correo electrónico para confirmar la cuenta y luego iniciá sesión."
        );

        setAuthInput({
          username: "",
          email: "",
          password: "",
        });

        setAuthMode("login");
        return;
      }

      const user = await buildCurrentUser(data.user);

      setCurrentUser(user);

      setAuthInput({
        username: "",
        email: "",
        password: "",
      });

      return;
    }

    if (!email || !password) {
      alert("❌ Ingresá tu email y contraseña.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error al iniciar sesión:", error);

      alert("❌ Email o contraseña incorrectos.");

      return;
    }

    const user = await buildCurrentUser(data.user);

    setCurrentUser(user);

    setAuthInput({
      username: "",
      email: "",
      password: "",
    });
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error al cerrar sesión:", error);
      return;
    }

    // La próxima persona que inicie sesión tendrá
    // una visita completamente nueva.
    sessionStorage.removeItem("tournamentclash_visita_id");

    setCurrentUser(null);
    setActiveView("home");
    setActiveTournament(null);
    setEditingTournament(false);
    setJoinCodeInput("");
  };

  const handleGoHome = () => {
    setActiveTournament(null);
    setActiveView("home");
    setEditingTournament(false);
  };

  // =========================================================
  // CREAR TORNEO
  // =========================================================

  const handleCreateTournamentSubmit = async (config) => {
    if (!currentUser) {
      alert("❌ Tenés que iniciar sesión para crear un torneo.");
      return;
    }

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
      created_by_user_id: currentUser.id,
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
      setTournaments((prev) => [data[0], ...prev]);
      setActiveView("groups");
    }
  };

  // =========================================================
  // EDITAR TORNEO
  // =========================================================

  const tournamentHasResults = (tournament) => {
    if (!tournament?.groups) return false;

    return tournament.groups.some((group) =>
      (group.matches || []).some(
        (match) =>
          match.score1 !== null &&
          match.score1 !== undefined &&
          match.score2 !== null &&
          match.score2 !== undefined
      )
    );
  };

  const isTournamentAdmin =
    currentUser &&
    activeTournament &&
    (activeTournament.created_by_user_id === currentUser.id ||
      (!activeTournament.created_by_user_id &&
        currentUser.username === activeTournament.created_by));

  const handleEditTournamentSubmit = async (config) => {
    if (!activeTournament) return;

    if (!isTournamentAdmin) {
      alert("❌ Solo el administrador puede modificar este torneo.");
      return;
    }

    if (tournamentHasResults(activeTournament)) {
      alert(
        "🔒 Este torneo ya tiene resultados cargados. No se puede modificar su organización para proteger los partidos existentes."
      );
      return;
    }

    const shuffled = [...config.teams].sort(() => 0.5 - Math.random());

    const numGroups = config.format === "groups_playoff" ? config.numGroups : 1;

    const groups = [];

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

    const updatedTournament = {
      ...activeTournament,
      title: config.title,
      game: config.game,
      format: config.format,
      qualifiers_per_group: config.qualifiersPerGroup,
      is_public: config.isPublic,
      groups,
    };

    const { data, error } = await supabase
      .from("tournaments")
      .update({
        title: updatedTournament.title,
        game: updatedTournament.game,
        format: updatedTournament.format,
        qualifiers_per_group: updatedTournament.qualifiers_per_group,
        is_public: updatedTournament.is_public,
        groups: updatedTournament.groups,
      })
      .eq("id", updatedTournament.id)
      .select();

    if (error) {
      console.error("Error al modificar torneo:", error);

      alert("❌ No se pudieron guardar los cambios.");

      return;
    }

    if (data && data.length > 0) {
      setActiveTournament(data[0]);

      setTournaments((prev) =>
        prev.map((t) => (t.id === data[0].id ? data[0] : t))
      );

      setEditingTournament(false);

      alert("✅ Torneo modificado correctamente.");
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
      setTournaments((prev) =>
        prev.map((t) => (t.id === updatedTournament.id ? updatedTournament : t))
      );
    }
  };

  // =========================================================
  // UNIRSE A TORNEO
  // =========================================================

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

  // =========================================================
  // PLAYOFFS
  // =========================================================

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

    const finishedObj = {
      ...activeTournament,
      status: "Finalizado",
    };

    handleUpdateTournamentInSupabase(finishedObj);

    setActiveView("home");
    setActiveTournament(null);
  };

  const isAdmin = currentUser?.id === ADMIN_UID;

  return (
    <div className="cr-container">
      {currentUser && (
        <Navbar
          onGoHome={handleGoHome}
          currentTitle={activeTournament?.title}
          tournamentCode={activeTournament?.code}
          currentUser={currentUser}
        />
      )}

      {!currentUser ? (
        <div className="cr-card" style={{ margin: "auto" }}>
          <div className="cr-card-glow"></div>

          <div
            style={{
              textAlign: "center",
              marginBottom: "1.5rem",
            }}
          >
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
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {authMode === "register" && (
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
                  Alias
                </label>

                <input
                  type="text"
                  placeholder="Ej: ReyAzul99"
                  value={authInput.username}
                  onChange={(e) =>
                    setAuthInput({
                      ...authInput,
                      username: e.target.value,
                    })
                  }
                  required
                  className="cr-input"
                />
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
                Email
              </label>

              <input
                type="email"
                placeholder="Ej: jugador@gmail.com"
                value={authInput.email}
                onChange={(e) =>
                  setAuthInput({
                    ...authInput,
                    email: e.target.value,
                  })
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
                  setAuthInput({
                    ...authInput,
                    password: e.target.value,
                  })
                }
                required
                className="cr-input"
              />
            </div>

            <button
              type="submit"
              className="cr-btn-gold"
              style={{
                marginTop: "0.5rem",
              }}
            >
              {authMode === "login" ? "Entrar a la Arena ⚔️" : "Registrarse 🛡️"}
            </button>

            <div
              style={{
                textAlign: "center",
                marginTop: "0.5rem",
              }}
            >
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
      ) : activeView === "stats" && isAdmin ? (
        <AdminStats onBack={() => setActiveView("home")} />
      ) : activeView === "home" ? (
        <div
          className="cr-card"
          style={{
            maxWidth: "480px",
            margin: "auto",
          }}
        >
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
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

          {/* BOTÓN ADMIN */}

          {isAdmin && (
            <button
              onClick={() => setActiveView("stats")}
              style={{
                width: "100%",
                marginBottom: "1rem",
                padding: "0.75rem",
                background: "linear-gradient(to right, #111827, #1e3a5f)",
                border: "1px solid #60a5fa",
                color: "#fff",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              📊 Ver estadísticas
            </button>
          )}

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
              <div
                style={{
                  fontSize: "20px",
                  marginBottom: "4px",
                }}
              >
                ⚔️
              </div>

              <h3
                style={{
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  margin: "0 0 2px 0",
                }}
              >
                Armar Torneo
              </h3>

              <p
                style={{
                  fontSize: "10px",
                  color: "#bfdbfe",
                  margin: 0,
                }}
              >
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
              <div
                style={{
                  fontSize: "20px",
                  marginBottom: "4px",
                }}
              >
                🔍
              </div>

              <h3
                style={{
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  margin: "0 0 2px 0",
                }}
              >
                Unirme
              </h3>

              <p
                style={{
                  fontSize: "10px",
                  color: "#e9d5ff",
                  margin: 0,
                }}
              >
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
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
                      gap: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "2px",
                          flexWrap: "wrap",
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
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.title}
                      </h4>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          textAlign: "right",
                        }}
                      >
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

                      {/* BOTÓN ELIMINAR - SOLO ADMIN */}

                      {isAdmin && (
                        <button
                          type="button"
                          title="Eliminar torneo"
                          disabled={deletingTournamentId === t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTournament(t);
                          }}
                          style={{
                            width: "34px",
                            height: "34px",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                              deletingTournamentId === t.id
                                ? "#374151"
                                : "rgba(127, 29, 29, 0.35)",
                            border:
                              deletingTournamentId === t.id
                                ? "1px solid #4b5563"
                                : "1px solid rgba(239, 68, 68, 0.45)",
                            borderRadius: "6px",
                            color:
                              deletingTournamentId === t.id
                                ? "#9ca3af"
                                : "#f87171",
                            cursor:
                              deletingTournamentId === t.id
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "15px",
                          }}
                        >
                          {deletingTournamentId === t.id ? "…" : "🗑️"}
                        </button>
                      )}
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
      ) : activeView === "edit" ? (
        <CreateTournament
          isEditing={true}
          initialData={activeTournament}
          onSave={handleEditTournamentSubmit}
          onCancel={() => {
            setEditingTournament(false);
            setActiveView("groups");
          }}
        />
      ) : activeView === "join" ? (
        <div
          className="cr-card"
          style={{
            maxWidth: "420px",
            margin: "auto",
          }}
        >
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
              style={{
                fontSize: "1.1rem",
              }}
            >
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
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
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
                  fontWeight: 900,
                }}
              />
            </div>

            <button
              type="submit"
              className="cr-btn-gold"
              style={{
                marginTop: "0.5rem",
              }}
            >
              Ingresar a la Batalla ⚔️
            </button>
          </form>
        </div>
      ) : activeView === "groups" ? (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {isTournamentAdmin && (
            <div
              style={{
                width: "100%",
                maxWidth: "900px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  if (tournamentHasResults(activeTournament)) {
                    alert(
                      "🔒 Este torneo ya tiene resultados cargados. No se puede modificar su organización."
                    );
                    return;
                  }

                  setEditingTournament(true);

                  setActiveView("edit");
                }}
                className="cr-btn-gold"
                style={{
                  maxWidth: "240px",
                  fontSize: "0.8rem",
                }}
              >
                ⚙️ Modificar torneo
              </button>
            </div>
          )}

          <GroupStageView
            tournament={activeTournament}
            onUpdateTournament={handleUpdateTournamentInSupabase}
            onProceedToPlayoffs={handleProceedToPlayoffs}
            currentUser={currentUser}
          />
        </div>
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

export default TournamentClashApp;
