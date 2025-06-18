let df = null;
let isConfrontoDireto = false;
const TIER1_LEAGUES = ['LCK', 'LPL', 'LEC', 'LCS', 'LTA', 'LTA N', 'WLDS', 'MSI', 'EWC', 'LCP'];

function loadCSV() {
    Papa.parse('BaseDadosPlayer.csv', {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data;
            df = df.filter(row => {
                const playerCols = [
                    'team_player_top', 'team_player_jng', 'team_player_mid', 'team_player_bot', 'team_player_sup',
                    'adversa_player_top', 'adversa_player_jng', 'adversa_player_mid', 'adversa_player_bot', 'adversa_player_sup'
                ];
                return playerCols.every(col => row[col] && row[col].trim() !== '') && row.result && !isNaN(parseInt(row.result));
            });
            console.log('CSV carregado, primeiros 5 registros:', df.slice(0, 5));
            populatePlayers();
            populatePatches();
            populateLeagues();
        },
        error: function(error) {
            console.error('Erro ao carregar CSV:', error);
            alert('Erro ao carregar os dados! Verifique se o arquivo está disponível.');
            document.getElementById('player-stats-table').innerHTML = '';
        }
    });
}

function populatePlayers() {
    const playerCols = [
        'team_player_top', 'team_player_jng', 'team_player_mid', 'team_player_bot', 'team_player_sup',
        'adversa_player_top', 'adversa_player_jng', 'adversa_player_mid', 'adversa_player_bot', 'adversa_player_sup'
    ];
    const players = [...new Set(df.flatMap(row => playerCols.map(col => row[col])).filter(name => name && name.trim() !== ''))].sort();
    const datalist = document.getElementById('players-list');
    datalist.innerHTML = '';
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        datalist.appendChild(option);
    });
}

function populatePatches() {
    const patches = [...new Set(df.map(row => row.patch).filter(patch => patch && patch.trim() !== ''))].sort((a, b) => parseFloat(b) - parseFloat(a));
    const selectPatch = document.getElementById('patch-filter');
    selectPatch.innerHTML = '<option value="">Todos os Patches</option>';
    patches.forEach(patch => {
        const option = document.createElement('option');
        option.value = patch;
        option.textContent = patch;
        selectPatch.appendChild(option);
    });
}

function populateLeagues() {
    const leagues = [...new Set(df.map(row => row.league).filter(league => league && league.trim() !== ''))].sort();
    const selectLeague = document.getElementById('league-filter');
    leagues.forEach(league => {
        if (!selectLeague.querySelector(`option[value="${league}"]`)) {
            const option = document.createElement('option');
            option.value = league;
            option.textContent = league;
            selectLeague.appendChild(option);
        }
    });
}

function getCleanPlayerName(playerName) {
    return playerName.replace(/[^a-zA-Z0-9]/g, '');
}

function updateImage(playerId) {
    const playerInput = document.getElementById(playerId);
    const imageDiv = document.getElementById(`${playerId}-image`);
    if (playerInput.value) {
        const cleanName = getCleanPlayerName(playerInput.value);
        const imgUrl = `https://dpm.lol/esport/players/${cleanName}.webp`;
        const placeholderUrl = 'https://via.placeholder.com/100x100.png?text=No+Image';
        imageDiv.innerHTML = `<img src="${imgUrl}" alt="${playerInput.value}" style="max-width: 100px; max-height: 100px;" onerror="this.src='${placeholderUrl}'; this.onerror=null;">`;
    } else {
        imageDiv.innerHTML = '';
    }
}

function calcularMedias(dados, isTeam2 = false) {
    const jogos = dados.length;
    const vitorias = dados.reduce((sum, row) => sum + (parseInt(row.result) === (isTeam2 ? 0 : 1) ? 1 : 0), 0);
    const winRate = jogos > 0 ? (vitorias / jogos * 100).toFixed(2) : 0;
    return { 'Jogos': jogos, 'Vitórias': vitorias, 'Vitórias (%)': winRate };
}

function gerarTabela(medias1, medias2, selectedPlayers1, selectedPlayers2) {
    let tableContent = '<table>';
    tableContent += '<tr><th>Estatística</th>';
    if (selectedPlayers1.length > 0) tableContent += `<th>${selectedPlayers1[0].name}</th>`;
    if (selectedPlayers2.length > 0) tableContent += `<th>${selectedPlayers2[0].name}</th>`;
    tableContent += '</tr>';

    tableContent += '<tr><td>Jogos Disputados</td>';
    if (selectedPlayers1.length > 0) tableContent += `<td>${medias1.Jogos}</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${medias2.Jogos}</td>`;
    tableContent += '</tr>';

    tableContent += '<tr><td>Vitórias</td>';
    if (selectedPlayers1.length > 0) tableContent += `<td>${medias1.Vitórias}</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${medias2.Vitórias}</td>`;
    tableContent += '</tr>';

    tableContent += '<tr><td>Vitórias (%)</td>';
    if (selectedPlayers1.length > 0) tableContent += `<td>${medias1['Vitórias (%)']}%</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${medias2['Vitórias (%)']}%</td>`;
    tableContent += '</tr>';

    tableContent += '</table>';
    return tableContent;
}

function generatePlayerGamesLink(players1, lanes1, players2 = [], lanes2 = []) {
    const urlParams = new URLSearchParams();
    if (players1[0]) {
        urlParams.append('player1_1', encodeURIComponent(players1[0]));
        if (lanes1[0]) urlParams.append('lane1_1', lanes1[0]);
    }
    if (players2[0]) {
        urlParams.append('player2_1', encodeURIComponent(players2[0]));
        if (lanes2[0]) urlParams.append('lane2_1', lanes2[0]);
    }
    const patch = document.getElementById('patch-filter').value || '';
    if (patch) urlParams.append('patch', patch);
    const year = document.getElementById('year-filter').value || '';
    if (year) urlParams.append('year', year);
    const league = document.getElementById('league-filter').value || '';
    if (league) urlParams.append('league', league);
    const recentGames = document.getElementById('recent-games').value || '';
    if (recentGames) urlParams.append('recentGames', recentGames);
    if (isConfrontoDireto && players2.length > 0) {
        urlParams.append('confrontoDireto', 'true');
    }
    return `player_games.html?${urlParams.toString()}`;
}

function gerarTitulo(selectedPlayers1, selectedPlayers2, patchFilter, yearFilter, recentGames, leagueFilter, isConfrontoDireto) {
    const h2 = document.createElement('h2');
    if (selectedPlayers1.length === 0 && selectedPlayers2.length === 0) {
        h2.appendChild(document.createTextNode('Estatísticas de Jogadores'));
    } else {
        if (isConfrontoDireto && selectedPlayers1.length > 0 && selectedPlayers2.length > 0) {
            const link = document.createElement('a');
            link.href = generatePlayerGamesLink(
                selectedPlayers1.map(p => p.name),
                selectedPlayers1.map(p => p.lane),
                selectedPlayers2.map(p => p.name),
                selectedPlayers2.map(p => p.lane)
            );
            link.target = '_blank';
            link.textContent = `Partidas de ${selectedPlayers1[0].name} vs ${selectedPlayers2[0].name}`;
            link.className = 'confronto-link';
            h2.appendChild(link);
        } else {
            if (selectedPlayers1.length > 0) {
                const link1 = document.createElement('a');
                link1.href = generatePlayerGamesLink(selectedPlayers1.map(p => p.name), selectedPlayers1.map(p => p.lane));
                link1.target = '_blank';
                link1.textContent = selectedPlayers1[0].name;
                link1.className = 'player-link';
                h2.appendChild(link1);
            }
            if (selectedPlayers2.length > 0) {
                h2.appendChild(document.createTextNode(selectedPlayers1.length > 0 ? ' | ' : ''));
                const link2 = document.createElement('a');
                link2.href = generatePlayerGamesLink([], [], selectedPlayers2.map(p => p.name), selectedPlayers2.map(p => p.lane));
                link2.target = '_blank';
                link2.textContent = selectedPlayers2[0].name;
                link2.className = 'player-link';
                h2.appendChild(link2);
            }
        }
    }
    let filters = [];
    if (yearFilter) filters.push(`${yearFilter}`);
    if (patchFilter) filters.push(`Patch ${patchFilter}`);
    if (leagueFilter && leagueFilter !== 'tier1') filters.push(leagueFilter);
    if (leagueFilter === 'tier1') filters.push('Campeonatos Tier 1');
    if (recentGames) filters.push(`Últimos ${recentGames} jogos`);
    if (filters.length > 0) {
        h2.appendChild(document.createTextNode(` (${filters.join(', ')})`));
    }
    return h2;
}

function generateStats() {
    isConfrontoDireto = false;
    const player1 = document.getElementById('player1_1').value;
    const player2 = document.getElementById('player2_1').value;
    const lane1 = document.getElementById('lane1_1').value;
    const lane2 = document.getElementById('lane2_1').value;
    const patchFilter = document.getElementById('patch-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const leagueFilter = document.getElementById('league-filter').value;

    const selectedPlayers1 = player1 ? [{ name: player1, lane: lane1 }] : [];
    const selectedPlayers2 = player2 ? [{ name: player2, lane: lane2 }] : [];

    if (selectedPlayers1.length === 0 && selectedPlayers2.length === 0) {
        alert('Selecione pelo menos um jogador!');
        document.getElementById('player-stats-table').innerHTML = '';
        return;
    }

    let filteredData = df;
    if (yearFilter) {
        filteredData = filteredData.filter(row => {
            if (!row.date) return false;
            const date = new Date(row.date);
            const year = date.getFullYear();
            return !isNaN(year) && year === parseInt(yearFilter);
        });
    }
    if (patchFilter) {
        filteredData = filteredData.filter(row => row.patch === patchFilter);
    }
    if (leagueFilter) {
        if (leagueFilter === 'tier1') {
            filteredData = filteredData.filter(row => TIER1_LEAGUES.includes(row.league));
        } else {
            filteredData = filteredData.filter(row => row.league === leagueFilter);
        }
    }

    let filteredData1 = filteredData;
    let filteredData2 = filteredData;

    if (selectedPlayers1.length > 0) {
        filteredData1 = filteredData.filter(row => {
            const laneCol = lane1 ? `team_player_${lane1}` : [
                'team_player_top', 'team_player_jng', 'team_player_mid', 'team_player_bot', 'team_player_sup'
            ].find(col => row[col] === player1);
            return laneCol && row[laneCol] === player1;
        });
    }
    if (selectedPlayers2.length > 0) {
        filteredData2 = filteredData.filter(row => {
            const laneCol = lane2 ? `adversa_player_${lane2}` : [
                'adversa_player_top', 'adversa_player_jng', 'adversa_player_mid', 'adversa_player_bot', 'adversa_player_sup'
            ].find(col => row[col] === player2);
            return laneCol && row[laneCol] === player2;
        });
    }

    if (recentGames) {
        if (filteredData1.length > 0) {
            filteredData1 = filteredData1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        }
        if (filteredData2.length > 0) {
            filteredData2 = filteredData2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        }
    }

    const medias1 = selectedPlayers1.length > 0 ? calcularMedias(filteredData1, false) : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0 };
    const medias2 = selectedPlayers2.length > 0 ? calcularMedias(filteredData2, true) : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0 };

    const tableContent = gerarTabela(medias1, medias2, selectedPlayers1, selectedPlayers2);

    const resultado = document.getElementById('player-stats-table');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(selectedPlayers1, selectedPlayers2, patchFilter, yearFilter, recentGames, leagueFilter, isConfrontoDireto);
    resultado.appendChild(h2);
    resultado.insertAdjacentHTML('beforeend', tableContent);
}

function confrontoDireto() {
    isConfrontoDireto = true;
    const player1 = document.getElementById('player1_1').value;
    const player2 = document.getElementById('player2_1').value;
    const lane1 = document.getElementById('lane1_1').value;
    const lane2 = document.getElementById('lane2_1').value;
    const patchFilter = document.getElementById('patch-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const leagueFilter = document.getElementById('league-filter').value;

    const selectedPlayers1 = player1 ? [{ name: player1, lane: lane1 }] : [];
    const selectedPlayers2 = player2 ? [{ name: player2, lane: lane2 }] : [];

    if (selectedPlayers1.length === 0 || selectedPlayers2.length === 0) {
        alert('Selecione um jogador de cada time para o Confronto Direto!');
        document.getElementById('player-stats-table').innerHTML = '';
        return;
    }

    let filteredData = df;
    if (yearFilter) {
        filteredData = filteredData.filter(row => {
            if (!row.date) return false;
            const date = new Date(row.date);
            const year = date.getFullYear();
            return !isNaN(year) && year === parseInt(yearFilter);
        });
    }
    if (patchFilter) {
        filteredData = filteredData.filter(row => row.patch === patchFilter);
    }
    if (leagueFilter) {
        if (leagueFilter === 'tier1') {
            filteredData = filteredData.filter(row => TIER1_LEAGUES.includes(row.league));
        } else {
            filteredData = filteredData.filter(row => row.league === leagueFilter);
        }
    }

    filteredData = filteredData.filter(row => {
        const laneCol1 = lane1 ? `team_player_${lane1}` : [
            'team_player_top', 'team_player_jng', 'team_player_mid', 'team_player_bot', 'team_player_sup'
        ].find(col => row[col] === player1);
        const laneCol2 = lane2 ? `adversa_player_${lane2}` : [
            'adversa_player_top', 'adversa_player_jng', 'adversa_player_mid', 'adversa_player_bot', 'adversa_player_sup'
        ].find(col => row[col] === player2);
        return laneCol1 && row[laneCol1] === player1 && laneCol2 && row[laneCol2] === player2;
    });

    if (recentGames) {
        filteredData = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    const medias1 = filteredData.length > 0 ? calcularMedias(filteredData, false) : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0 };
    const medias2 = filteredData.length > 0 ? {
        'Jogos': filteredData.length,
        'Vitórias': filteredData.length - medias1.Vitórias,
        'Vitórias (%)': filteredData.length > 0 ? ((filteredData.length - medias1.Vitórias) / filteredData.length * 100).toFixed(2) : 0
    } : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0 };

    const tableContent = gerarTabela(medias1, medias2, selectedPlayers1, selectedPlayers2);

    const resultado = document.getElementById('player-stats-table');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(selectedPlayers1, selectedPlayers2, patchFilter, yearFilter, recentGames, leagueFilter, isConfrontoDireto);
    resultado.appendChild(h2);
    resultado.insertAdjacentHTML('beforeend', tableContent);
}

window.onload = loadCSV;