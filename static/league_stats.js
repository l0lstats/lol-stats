let df = null;

function loadCSV() {
    Papa.parse('BaseDadosCamp.csv', {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data;
            initializeFilters();
            filterAndDisplayTable();
        },
        error: function(error) {
            console.error('Erro ao carregar CSV:', error);
            alert('Erro ao carregar os dados! Verifique se o arquivo está disponível.');
            document.getElementById('camp-stats-table').innerHTML = '';
        }
    });
}

function initializeFilters() {
    const yearFilter = document.getElementById('year-filter');
    const leagueFilter = document.getElementById('league-filter');
    const splitFilter = document.getElementById('split-filter');
    const sideFilter = document.getElementById('side-filter');

    // Preencher Ano
    const years = [...new Set(df.map(row => {
        if (!row.date) return '';
        const date = new Date(row.date);
        return date.getFullYear();
    }).filter(year => year))].sort((a, b) => b - a);
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    yearFilter.value = '2025';

    // Ao mudar o ano
    yearFilter.onchange = () => {
        const year = yearFilter.value;
        let filteredData = df;
        if (year) {
            filteredData = filteredData.filter(row => {
                if (!row.date) return false;
                const date = new Date(row.date);
                return date.getFullYear() === parseInt(year);
            });
        }
        const leagues = [...new Set(filteredData.map(row => row.league).filter(league => league))].sort();
        const currentLeague = leagueFilter.value;

        leagueFilter.innerHTML = '';
        leagues.forEach(league => {
            const option = document.createElement('option');
            option.value = league;
            option.textContent = league;
            leagueFilter.appendChild(option);
        });

        leagueFilter.value = leagues.includes(currentLeague) ? currentLeague : leagues[0] || '';
        leagueFilter.dispatchEvent(new Event('change'));
    };

    // Ao mudar o campeonato
    leagueFilter.onchange = () => {
        const year = yearFilter.value;
        const league = leagueFilter.value;
        let filteredData = df;

        if (year) {
            filteredData = filteredData.filter(row => {
                if (!row.date) return false;
                const date = new Date(row.date);
                return date.getFullYear() === parseInt(year);
            });
        }
        if (league) {
            filteredData = filteredData.filter(row => row.league === league);
        }

        const splits = [...new Set(filteredData.map(row => row.split).filter(split => split))].sort();
        splitFilter.innerHTML = '<option value="">Todos os Splits</option>';
        splits.forEach(split => {
            const option = document.createElement('option');
            option.value = split;
            option.textContent = split;
            splitFilter.appendChild(option);
        });
        splitFilter.value = splits.length > 0 ? splits[splits.length - 1] : '';

        // Atualizar imagem do campeonato
        const leagueImage = document.getElementById('league-image');
        const sanitizedLeague = league.replace(/\s+/g, '').toUpperCase();

        let imageUrl;
        if (sanitizedLeague === 'WLDS') {
            imageUrl = 'https://dpm.lol/esport/leagues/WORLDS.webp';
        } else if (sanitizedLeague === 'LCKC') {
            imageUrl = 'https://dpm.lol/esport/leagues/LCK_CL.webp';
        } else if (sanitizedLeague === 'EUM') {
            imageUrl = 'https://dpm.lol/esport/leagues/EM.webp';
        }
         else if (sanitizedLeague === 'CK') {
            imageUrl = 'https://dpm.lol/esport/leagues/LCK_CL.webp';
        } else if (sanitizedLeague === 'LTA') {
            imageUrl = 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/b/bd/LTA_logo.png';
        } else if (sanitizedLeague === 'OGN') {
            imageUrl = 'https://i.imgur.com/oRrYSSG.png';
        } else if (sanitizedLeague === 'EULCS') {
            imageUrl = 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/6/6f/LCS_Europe_Logo.png';
        } else if (sanitizedLeague === 'NALCS') {
            imageUrl = 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/d/de/LCS_NorthAmerica_Logo.png';
        }
         else if (sanitizedLeague === 'LMS') {
            imageUrl = 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/1/15/LMS_2018_Logo.png';
        } else if (sanitizedLeague === 'LVPSL') {
            imageUrl = 'https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/1/1a/LVP_SuperLiga_logo.png';
        } else {
            imageUrl = `https://dpm.lol/esport/leagues/${sanitizedLeague}.webp`;
        }

        const fallback = 'https://i.imgur.com/xvbO2uZ.png';
        leagueImage.innerHTML = `<img src="${imageUrl}" alt="${league}" onerror="this.src='${fallback}'; this.onerror=null;" style="width: 50px; height: 50px; vertical-align: middle;">`;

        filterAndDisplayTable();
    };

    splitFilter.onchange = () => {
        filterAndDisplayTable();
    };

    sideFilter.onchange = () => {
        filterAndDisplayTable();
    };

    // Inicialização
    yearFilter.dispatchEvent(new Event('change'));
}

function calculateTeamStats(filteredData) {
    const teamStats = {};
    filteredData.forEach(row => {
        const team = row.teamname;
        if (!teamStats[team]) {
            teamStats[team] = {
                games: 0, wins: 0,
                firsttower: [], firstdragon: [], firstblood: [],
                gamelength: [], totalKills: [], totalDragons: [],
                totalBarons: [], totalTowers: [], totalInhibitors: []
            };
        }
        teamStats[team].games += 1;
        teamStats[team].wins += parseInt(row.result) === 1 ? 1 : 0;
        teamStats[team].firsttower.push(parseFloat(row.firsttower) || 0);
        teamStats[team].firstdragon.push(parseFloat(row.firstdragon) || 0);
        teamStats[team].firstblood.push(parseFloat(row.firstblood) || 0);
        teamStats[team].gamelength.push(parseFloat(row.gamelength) || 0);
        teamStats[team].totalKills.push(parseFloat(row.totalKills) || 0);
        teamStats[team].totalDragons.push(parseFloat(row.totalDragons) || 0);
        teamStats[team].totalBarons.push(parseFloat(row.totalBarons) || 0);
        teamStats[team].totalTowers.push(parseFloat(row.totalTowers) || 0);
        teamStats[team].totalInhibitors.push(parseFloat(row.totalInhibitors) || 0);
    });

    const result = {};
    for (const team in teamStats) {
        const stats = teamStats[team];
        const losses = stats.games - stats.wins;
        const winRate = stats.games > 0 ? ((stats.wins / stats.games) * 100).toFixed(2) : 0;
        const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

        result[team] = {
            games: stats.games,
            score: `${stats.wins}-${losses}`,
            winRate: `${winRate}%`,
            firstTower: `${(avg(stats.firsttower) * 100).toFixed(2)}%`,
            firstDragon: `${(avg(stats.firstdragon) * 100).toFixed(2)}%`,
            firstBlood: `${(avg(stats.firstblood) * 100).toFixed(2)}%`,
            gameLength: avg(stats.gamelength).toFixed(2),
            totalKills: avg(stats.totalKills).toFixed(2),
            totalDragons: avg(stats.totalDragons).toFixed(2),
            totalBarons: avg(stats.totalBarons).toFixed(2),
            totalTowers: avg(stats.totalTowers).toFixed(2),
            totalInhibitors: avg(stats.totalInhibitors).toFixed(2),
        };
    }
    return result;
}

function filterAndDisplayTable() {
    const year = document.getElementById('year-filter').value;
    const league = document.getElementById('league-filter').value;
    const split = document.getElementById('split-filter').value;
    const side = document.getElementById('side-filter').value;

    let filteredData = df;
    if (year) {
        filteredData = filteredData.filter(row => {
            if (!row.date) return false;
            const date = new Date(row.date);
            return date.getFullYear() === parseInt(year);
        });
    }
    if (league) {
        filteredData = filteredData.filter(row => row.league === league);
    }
    if (split) {
        filteredData = filteredData.filter(row => row.split === split);
    }
    if (side) {
        filteredData = filteredData.filter(row => row.side === side);
    }

    const stats = calculateTeamStats(filteredData);
    const sorted = Object.entries(stats).sort(([, a], [, b]) => parseFloat(b.winRate) - parseFloat(a.winRate));

    let html = `<table>
    <thead><tr><th>Time</th><th>Jogos</th><th>Score</th><th>Vitórias(%)</th>
    <th>1ª Torre</th><th>1º Dragão</th><th>1º Sangue</th>
    <th>Tempo(min)</th><th>Kills</th><th>Dragões</th><th>Barons</th><th>Torres</th><th>Inibidores</th></tr></thead><tbody>`;

    for (const [team, stat] of sorted) {
        const encodedTeam = encodeURIComponent(team).replace(/%20/g, '%2520');
        const formattedLeague = league.replace(/ /g, '+');
        const teamLink = `team_games.html?teamname=${encodedTeam}&year=${year}&liga=${formattedLeague}`;

        html += `<tr>
            <td>
                <a href="${teamLink}" style="text-decoration: none; color: inherit;" target="_blank">${team}</a>
            </td>
            <td>${stat.games}</td><td>${stat.score}</td><td>${stat.winRate}</td>
            <td>${stat.firstTower}</td><td>${stat.firstDragon}</td><td>${stat.firstBlood}</td>
            <td>${stat.gameLength}</td><td>${stat.totalKills}</td><td>${stat.totalDragons}</td>
            <td>${stat.totalBarons}</td><td>${stat.totalTowers}</td><td>${stat.totalInhibitors}</td>
        </tr>`;
    }
    html += '</tbody></table>';

    document.getElementById('camp-stats-table').innerHTML = `<div class="table-wrapper">${html}</div>`;
}

window.onload = loadCSV;
