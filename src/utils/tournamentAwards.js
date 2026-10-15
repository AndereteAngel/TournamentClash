export function getTournamentPodium(tournament) {
  if (!tournament || tournament.status !== "Finalizado") return null;

  const rounds = Array.isArray(tournament.playoffs) ? tournament.playoffs : [];
  const finalMatch = rounds[rounds.length - 1]?.[0];
  if (!finalMatch?.winner || finalMatch.winner === "Empate (Definir)") return null;

  const champion = finalMatch.winner;
  const runnerUp = [finalMatch.team1, finalMatch.team2].find(
    (name) => name && name !== champion && name !== "Pasaje Directo"
  );

  const semifinalRound = rounds.length >= 2 ? rounds[rounds.length - 2] : [];
  const bronze = [];
  if (Array.isArray(semifinalRound) && semifinalRound.length === 2) {
    semifinalRound.forEach((match) => {
      if (!match?.winner || match.winner === "Empate (Definir)") return;
      const loser = [match.team1, match.team2].find(
        (name) => name && name !== match.winner && name !== "Pasaje Directo"
      );
      if (loser && loser !== champion && loser !== runnerUp) bronze.push(loser);
    });
  }

  return { champion, runnerUp: runnerUp || null, bronze: [...new Set(bronze)] };
}

export function getPlayerTournamentStats(tournament, playerName) {
  const normalize = (value) => String(value || "").trim().toLocaleLowerCase("es");
  const target = normalize(playerName);
  const matches = [];

  (tournament?.groups || []).forEach((group) => {
    (group.matches || []).forEach((match) => matches.push(match));
  });
  (tournament?.playoffs || []).forEach((round) => {
    (round || []).forEach((match) => matches.push(match));
  });

  const played = matches.filter((match) => {
    const involved = normalize(match.team1) === target || normalize(match.team2) === target;
    return involved && match.score1 !== null && match.score1 !== undefined &&
      match.score2 !== null && match.score2 !== undefined;
  });

  const wins = played.filter((match) => {
    if (match.winner) return normalize(match.winner) === target;
    const playerIsTeam1 = normalize(match.team1) === target;
    return playerIsTeam1 ? Number(match.score1) > Number(match.score2) : Number(match.score2) > Number(match.score1);
  }).length;
  const draws = played.filter((match) => Number(match.score1) === Number(match.score2)).length;
  const losses = Math.max(0, played.length - wins - draws);

  return {
    played: played.length,
    wins,
    draws,
    losses,
    winRate: played.length ? Math.round((wins / played.length) * 100) : 0,
  };
}

export function getPlayerMedals(tournaments, playerName) {
  const normalize = (value) => String(value || "").trim().toLocaleLowerCase("es");
  const target = normalize(playerName);
  const medals = { gold: 0, silver: 0, bronze: 0, history: [] };

  (tournaments || []).forEach((tournament) => {
    const podium = getTournamentPodium(tournament);
    if (!podium) return;

    let medal = null;
    if (normalize(podium.champion) === target) {
      medals.gold += 1;
      medal = "gold";
    } else if (normalize(podium.runnerUp) === target) {
      medals.silver += 1;
      medal = "silver";
    } else if (podium.bronze.some((name) => normalize(name) === target)) {
      medals.bronze += 1;
      medal = "bronze";
    }

    if (medal) medals.history.push({
      id: tournament.id || tournament.code || tournament.title,
      title: tournament.title || "Torneo",
      code: tournament.code || "",
      medal,
      createdAt: tournament.created_at || null,
    });
  });

  return medals;
}
