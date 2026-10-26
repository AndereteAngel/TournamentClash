const SUPABASE_URL = "https://pmhqiiklewbugsrizdmk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaHFpaWtsZXdidWdzcml6ZG1rIiwiaWF0IjoxNzgyMjg5MDg3LCJleHAiOjIwOTc4NjUwODd9.ehlYNLiMt_1fY0eCBkDC-X9edISKH7Ua9Cn0qQE8c1c";
const SITE_URL = "https://tournamentclash.netlify.app";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

function calculateStandings(groups = []) {
  const rows = [];
  for (const group of groups) {
    const teams = Array.isArray(group?.teams) ? group.teams : [];
    const matches = Array.isArray(group?.matches) ? group.matches : [];
    if (group?.name === "__INSCRIPCIONES__") {
      teams.forEach((name) => rows.push({ name, played: 0, points: 0, goalDifference: 0, goalsFor: 0 }));
      continue;
    }
    const standings = teams.map((name) => ({ name, played: 0, points: 0, goalDifference: 0, goalsFor: 0 }));
    for (const match of matches) {
      if (match.score1 == null || match.score2 == null) continue;
      const a = standings.find((item) => item.name === match.team1);
      const b = standings.find((item) => item.name === match.team2);
      if (!a || !b) continue;
      a.played++; b.played++;
      a.goalsFor += Number(match.score1); b.goalsFor += Number(match.score2);
      a.goalDifference += Number(match.score1) - Number(match.score2);
      b.goalDifference += Number(match.score2) - Number(match.score1);
      if (match.score1 > match.score2) { a.points += 3; b.points += 1; }
      else if (match.score1 < match.score2) { b.points += 3; a.points += 1; }
      else { a.points += 2; b.points += 2; }
    }
    rows.push(...standings);
  }
  return rows.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor).slice(0, 6);
}

function renderImage(tournament) {
  const title = escapeHtml(tournament?.title || "Tabla de posiciones");
  const rows = calculateStandings(tournament?.groups || []);
  const tableRows = rows.length
    ? rows.map((row, index) => {
        const y = 292 + index * 48;
        return `<g><rect x="72" y="${y - 30}" width="1056" height="40" rx="8" fill="${index % 2 ? "#101b33" : "#142542"}" stroke="#2d4265"/><text x="98" y="${y - 4}" fill="${index === 0 ? "#ffd54a" : "#e8eefb"}" font-size="20" font-weight="800">${index + 1}.</text><text x="160" y="${y - 4}" fill="#ffffff" font-size="20" font-weight="700">${escapeHtml(row.name)}</text><text x="790" y="${y - 4}" fill="#cbd5e1" font-size="18" text-anchor="middle">${row.played}</text><text x="930" y="${y - 4}" fill="#cbd5e1" font-size="18" text-anchor="middle">${row.goalDifference > 0 ? "+" : ""}${row.goalDifference}</text><text x="1060" y="${y - 4}" fill="#ffd54a" font-size="22" font-weight="900" text-anchor="middle">${row.points}</text></g>`;
      }).join("")
    : '<text x="600" y="330" text-anchor="middle" fill="#dbeafe" font-size="23">La tabla estará disponible cuando haya participantes.</text>';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#07152d"/><stop offset="1" stop-color="#17102b"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#ffe88b"/><stop offset="1" stop-color="#e6a900"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#bg)"/><path d="M0 0H1200V12H0Z" fill="#3187e8"/><circle cx="1080" cy="90" r="160" fill="#1d4ed8" opacity=".12"/><circle cx="100" cy="550" r="180" fill="#eab308" opacity=".06"/>
  <text x="72" y="70" fill="url(#gold)" font-size="22" font-weight="900" letter-spacing="5">TOURNAMENTCLASH</text><text x="72" y="132" fill="#ffffff" font-size="38" font-weight="900">${title.length > 34 ? title.slice(0, 34) + "…" : title}</text><text x="72" y="174" fill="#93c5fd" font-size="20">TABLA DE POSICIONES · ACTUALIZADA</text>
  <rect x="72" y="215" width="1056" height="45" rx="8" fill="#1d3557"/><text x="160" y="244" fill="#bfdbfe" font-size="15" font-weight="800">JUGADOR</text><text x="790" y="244" fill="#bfdbfe" font-size="15" font-weight="800" text-anchor="middle">PJ</text><text x="930" y="244" fill="#bfdbfe" font-size="15" font-weight="800" text-anchor="middle">DG</text><text x="1060" y="244" fill="#fcd34d" font-size="15" font-weight="900" text-anchor="middle">PTS</text>
  ${tableRows}<text x="72" y="590" fill="#93a4bf" font-size="16">Entrá al torneo para ver la clasificación completa en vivo.</text><text x="1128" y="590" fill="#fcd34d" font-size="16" font-weight="900" text-anchor="end">🏆</text></svg>`;
}

export default async (request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id || !/^[a-zA-Z0-9-]+$/.test(id)) {
    return new Response("Falta el identificador del torneo.", { status: 400 });
  }

  if (url.searchParams.get("image") === "1") {
    let tournament = null;
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/tournaments?id=eq.${encodeURIComponent(id)}&select=id,title,game,status,groups,playoffs&limit=1`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      });
      if (response.ok) tournament = (await response.json())[0] || null;
    } catch (error) {
      console.error("No se pudo cargar la tabla para la imagen:", error);
    }
    return new Response(renderImage(tournament), {
      headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=60, s-maxage=60" },
    });
  }

  let tournament = null;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tournaments?id=eq.${encodeURIComponent(id)}&select=id,title,game,status&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (response.ok) tournament = (await response.json())[0] || null;
  } catch (error) {
    console.error("No se pudo cargar el torneo compartido:", error);
  }

  const title = tournament?.title || "Tabla de posiciones";
  const pageTitle = `${title} | TournamentClash`;
  const description = "Consultá la tabla de posiciones actualizada y los resultados de este torneo en TournamentClash.";
  const imageUrl = `${SITE_URL}/.netlify/functions/share?id=${encodeURIComponent(id)}&image=1`;
  const appUrl = `${SITE_URL}/?tournament=${encodeURIComponent(id)}`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(pageTitle)}</title><meta name="description" content="${escapeHtml(description)}"><meta property="og:type" content="website"><meta property="og:site_name" content="TournamentClash"><meta property="og:title" content="${escapeHtml(pageTitle)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${SITE_URL}/share/${encodeURIComponent(id)}"><meta property="og:image" content="${imageUrl}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(pageTitle)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${imageUrl}"><meta http-equiv="refresh" content="0;url=${appUrl}"></head><body><p>Abriendo el torneo en TournamentClash… <a href="${appUrl}">Entrar al torneo</a></p><script>window.location.replace(${JSON.stringify(appUrl)});</script></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60, s-maxage=60" } });
};
