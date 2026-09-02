/**
 * Calcula la tabla de posiciones de un grupo basándose en los partidos jugados.
 * Sistema de puntos: Ganado = 3, Empatado = 2, Perdido = 1.
 */
export function calculateGroupStandings(teams, matches) {
    const standings = teams.map((team) => ({
        name: team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
    }));

    matches.forEach((match) => {
        if (match.score1 === null || match.score2 === null) return;

        const t1 = standings.find((s) => s.name === match.team1);
        const t2 = standings.find((s) => s.name === match.team2);

        if (!t1 || !t2) return;

        t1.played += 1;
        t2.played += 1;

        t1.goalsFor += match.score1;
        t1.goalsAgainst += match.score2;
        t2.goalsFor += match.score2;
        t2.goalsAgainst += match.score1;

        t1.goalDifference = t1.goalsFor - t1.goalsAgainst;
        t2.goalDifference = t2.goalsFor - t2.goalsAgainst;

        if (match.score1 > match.score2) {
            t1.won += 1;
            t1.points += 3;
            t2.lost += 1;
            t2.points += 1;
        } else if (match.score1 < match.score2) {
            t2.won += 1;
            t2.points += 3;
            t1.lost += 1;
            t1.points += 1;
        } else {
            t1.drawn += 1;
            t1.points += 2;
            t2.drawn += 1;
            t2.points += 2;
        }
    });

    return standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    });
}

/**
 * Genera la primera ronda de cruces de eliminación directa (Playoffs) emparejando extremos (1° vs último).
 */
export function generatePlayoffBrackets(qualifiedTeams) {
    const matches = [];
    const n = qualifiedTeams.length;

    for (let i = 0; i < n / 2; i++) {
        matches.push({
            id: `r1-m${i + 1}`,
            team1: qualifiedTeams[i],
            team2: qualifiedTeams[n - 1 - i],
            score1: null,
            score2: null,
            winner: null,
        });
    }

    return [matches];
}