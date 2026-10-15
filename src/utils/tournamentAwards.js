import { calculateGroupStandings } from "./tournamentLogic";

export function getTournamentPodium(tournament) {
  const status = String(tournament?.status || "").trim().toLocaleLowerCase("es");
  if (!tournament || status !== "finalizado") return null;

  // Supabase guarda normalmente las llaves como una lista de rondas; también
  // toleramos una ronda plana para no perder el campeón por diferencias de formato.
  const rawPlayoffs = Array.isArray(tournament.playoffs) ? tournament.playoffs : [];
  const rounds = rawPlayoffs.length && !Array.isArray(rawPlayoffs[0])
    ? [rawPlayoffs]
    : rawPlayoffs;
  const finalRound = rounds[rounds.length - 1];
  const finalMatch = Array.isArray(finalRound) && finalRound.length
    ? finalRound[0]
    : null;
  const computedWinner = finalMatch?.winner ||
    (finalMatch && finalMatch.score1 !== null && finalMatch.score1 !== undefined &&
      finalMatch.score2 !== null && finalMatch.score2 !== undefined
      ? Number(finalMatch.score1) > Number(finalMatch.score2)
        ? finalMatch.team1
        : Number(finalMatch.score2) > Number(finalMatch.score1)
          ? finalMatch.team2
          : null
      : null);
  const championFromFinal = computedWinner && computedWinner !== "Empate (Definir)"
    ? computedWinner
    : null;

  if (!championFromFinal) {
    // En formato liga, el podio sale de la tabla cuando todos los partidos están cargados.
    if (String(tournament.format || "").trim().toLocaleLowerCase("es") !== "league") return null;
    const groups = Array.isArray(tournament.groups) ? tournament.groups : [];
    const allMatches = groups.flatMap((group) => group.matches || []);
    if (!allMatches.length || allMatches.some((match) =>
      match.score1 === null || match.score1 === undefined ||
      match.score2 === null || match.score2 === undefined
    )) return null;

    const standings = groups.flatMap((group) =>
      calculateGroupStandings(group.teams || [], group.matches || [])
    ).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    if (standings.length < 2) return null;
    return {
      champion: standings[0]?.name || null,
      runnerUp: standings[1]?.name || null,
      bronze: standings[2]?.name ? [standings[2].name] : [],
    };
  }

  const champion = championFromFinal;
  const runnerUp = [finalMatch.team1, finalMatch.team2].find(
    (name) => name && name !== champion && name !== "Pasaje Directo"
  );

  const semifinalRound = rounds.length >= 2 ? rounds[rounds.length - 2] : [];
  const bronze = [];
  if (Array.isArray(semifinalRound) && semifinalRound.length === 2) {
    semifinalRound.forEach((match) => {
      const matchWinner = match?.winner ||
        (match && match.score1 !== null && match.score1 !== undefined &&
          match.score2 !== null && match.score2 !== undefined
          ? Number(match.score1) > Number(match.score2)
            ? match.team1
            : Number(match.score2) > Number(match.score1)
              ? match.team2
              : null
          : null);
      if (!matchWinner || matchWinner === "Empate (Definir)") return;
      const loser = [match.team1, match.team2].find(
        (name) => name && name !== matchWinner && name !== "Pasaje Directo"
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
