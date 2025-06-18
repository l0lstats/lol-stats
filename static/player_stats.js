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
                const requiredCols = ['playername', 'position', 'kills', 'deaths', 'assists', 'KPG', 'DPG', 'cspm', 'wardscore', 'result', 'adversa_kills'];
                return requiredCols.every(col => row[col] && row[col].toString().trim() !== '') && !isNaN(parseInt(row.result));
            });
            console.log('CSV carregado, primeiros 5 registros:', df.slice(0, 5));
            populatePlayers();
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
    const players = [...new Set(df.map(row => row.playername).filter(name => name && name.trim() !== ''))].sort();
    const datalist = document.getElementById('players-list');
    datalist.innerHTML = '';
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        datalist.appendChild(option);
    });
}

function populateLeagues() {
    const leagues = [...new Set(df.map(row => row.league).filter(league => league && league.trim() !== ''))].sort();
    const selectLeague = document.getElementById('league-filter');
    selectLeague.innerHTML = '<option value="">Todos os Campeonatos</option>';
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

function getPlayerLane(playerName) {
    if (!playerName || !df) return '';
    const lastGame = df.filter(row => row.playername === playerName)
                       .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return lastGame ? lastGame.position.toLowerCase() : '';
}

function updateImageAndLane(playerId) {
    const playerInput = document.getElementById(playerId);
    const laneSelect = document.getElementById(`lane${playerId.split('_')[0].slice(-1)}_1`);
    const imageDiv = document.getElementById(`${playerId}-image`);
    
    // Atualizar lane
    if (playerInput.value && df.some(row => row.playername === playerInput.value)) {
        const lane = getPlayerLane(playerInput.value);
        if (lane) {
            laneSelect.value = lane;
        } else {
            laneSelect.value = '';
        }
    } else {
        laneSelect.value = '';
    }

    // Atualizar imagem
    if (playerInput.value) {
        const cleanName = getCleanPlayerName(playerInput.value);
        const imgUrl = `https://dpm.lol/esport/players/${cleanName}.webp`;
        const placeholderUrl = 'https://dpm.lol/esport/players/NoPicture.webp';
        imageDiv.innerHTML = `<div class="kda" id="${playerId}-kda"></div><img src="${imgUrl}" alt="${playerInput.value}" onerror="this.src='${placeholderUrl}'; this.onerror=null;">`;
    } else {
        imageDiv.innerHTML = '';
    }
}

function calcularMedias(dados, isTeam2 = false) {
    const jogos = dados.length;
    const vitorias = dados.reduce((sum, row) => sum + (parseInt(row.result) === (isTeam2 ? 0 : 1) ? 1 : 0), 0);
    const winRate = jogos > 0 ? (vitorias / jogos * 100).toFixed(2) : 0;
    const kda = jogos > 0 ? (
        (dados.reduce((sum, row) => sum + parseFloat(row.kills) + parseFloat(row.assists), 0) /
         dados.reduce((sum, row) => sum + parseFloat(row.deaths) || 1, 0))
    ).toFixed(2) : 0;
    const killsVsOpponent = jogos > 0 ? (
        (dados.filter(row => parseFloat(row.kills) > parseFloat(row.adversa_kills)).length / jogos * 100)
    ).toFixed(2) : 0;
    const avgKPG = jogos > 0 ? (
        dados.reduce((sum, row) => sum + parseFloat(row.KPG), 0) / jogos
    ).toFixed(2) : 0;
    const avgDPG = jogos > 0 ? (
        dados.reduce((sum, row) => sum + parseFloat(row.DPG), 0) / jogos
    ).toFixed(2) : 0;
    const avgCSPM = jogos > 0 ? (
        dados.reduce((sum, row) => sum + parseFloat(row.cspm), 0) / jogos
    ).toFixed(2) : 0;
    const avgWardScore = jogos > 0 ? (
        dados.reduce((sum, row) => sum + parseFloat(row.wardscore), 0) / jogos
    ).toFixed(2) : 0;
    return {
        Jogos: jogos,
        Vitórias: vitorias,
        'Vitórias (%)': winRate,
        KDA: kda,
        'Mais Kills que Oponente (%)': killsVsOpponent,
        'Participação de Kills (%)': avgKPG,
        'Dano/Gold': avgDPG,
        'CS/minuto': avgCSPM,
        'Wards (Usadas+Destruídas)': avgWardScore
    };
}

function calcularKillStats(dados, killLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, killsBelow: 0, killsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const killsBelow = dados.filter(row => {
        const kills = parseFloat(row.kills);
        return !isNaN(kills) && (kills < killLine || kills === 0);
    }).length;
    const killsAbove = totalJogos - killsBelow;
    const percentBelow = (killsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (killsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, killsBelow, killsAbove, percentBelow, percentAbove };
}

function calcularDeathStats(dados, deathLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, deathsBelow: 0, deathsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const deathsBelow = dados.filter(row => {
        const deaths = parseFloat(row.deaths);
        return !isNaN(deaths) && (deaths < deathLine || deaths === 0);
    }).length;
    const deathsAbove = totalJogos - deathsBelow;
    const percentBelow = (deathsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (deathsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, deathsBelow, deathsAbove, percentBelow, percentAbove };
}

function gerarTabela(medias1, medias2, killStats1, killStats2, deathStats1, deathStats2, selectedPlayers1, selectedPlayers2, killLine, deathLine) {
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

    tableContent += `<tr><td>Under ${killLine} Kills</td>`;
    if (selectedPlayers1.length > 0) tableContent += `<td>${killStats1.percentBelow}%</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${killStats2.percentBelow}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Over ${killLine} Kills</td>`;
    if (selectedPlayers1.length > 0) tableContent += `<td>${killStats1.percentAbove}%</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${killStats2.percentAbove}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Under ${deathLine} Mortes</td>`;
    if (selectedPlayers1.length > 0) tableContent += `<td>${deathStats1.percentBelow}%</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${deathStats2.percentBelow}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Over ${deathLine} Mortes</td>`;
    if (selectedPlayers1.length > 0) tableContent += `<td>${deathStats1.percentAbove}%</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${deathStats2.percentAbove}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Mais Kills que Oponente de Lane</td>`;
    if (selectedPlayers1.length > 0) tableContent += `<td>${medias1['Mais Kills que Oponente (%)']}%</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${medias2['Mais Kills que Oponente (%)']}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Participação de Kills / Jogo</td>`;
    if (selectedPlayers1.length > 0) tableContent += `<td>${medias1['Participação de Kills (%)']}%</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${medias2['Participação de Kills (%)']}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>(Dano / Gold) / Jogo</td>`;
    if (selectedPlayers1.length > 0) tableContent += `<td>${medias1['Dano/Gold']}</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${medias2['Dano/Gold']}</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>(CS/minuto) / Jogo</td>`;
    if (selectedPlayers1.length > 0) tableContent += `<td>${medias1['CS/minuto']}</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${medias2['CS/minuto']}</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>(Wards Usadas+Destruídas) / Jogo</td>`;
    if (selectedPlayers1.length > 0) tableContent += `<td>${medias1['Wards (Usadas+Destruídas)']}</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${medias2['Wards (Usadas+Destruídas)']}</td>`;
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
    const year = document.getElementById('year-filter').value || '';
    if (year) urlParams.append('year', year);
    const league = document.getElementById('league-filter').value || '';
    if (league) urlParams.append('league', league);
    if (isConfrontoDireto && players2.length > 0) {
        urlParams.append('confrontoDireto', 'true');
    }
    return `player_games.html?${urlParams.toString()}`;
}

function gerarTitulo(selectedPlayers1, selectedPlayers2, yearFilter, leagueFilter, isConfrontoDireto) {
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
    if (leagueFilter) filters.push(leagueFilter);
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
    const yearFilter = document.getElementById('year-filter').value;
    const leagueFilter = document.getElementById('league-filter').value;
    const killLine = parseFloat(document.getElementById('kill-line').value) || 4.5;
    const deathLine = parseFloat(document.getElementById('death-line').value) || 4.5;

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
    if (leagueFilter) {
        filteredData = filteredData.filter(row => row.league === leagueFilter);
    }

    let filteredData1 = filteredData;
    let filteredData2 = filteredData;

    if (selectedPlayers1.length > 0) {
        filteredData1 = filteredData.filter(row => row.playername === player1 && (!lane1 || row.position.toLowerCase() === lane1));
    }
    if (selectedPlayers2.length > 0) {
        filteredData2 = filteredData.filter(row => row.playername === player2 && (!lane2 || row.position.toLowerCase() === lane2));
    }

    const medias1 = selectedPlayers1.length > 0 ? calcularMedias(filteredData1, false) : { Jogos: 0, Vitórias: 0, 'Vitórias (%)': 0, KDA: 0, 'Mais Kills que Oponente (%)': 0, 'Participação de Kills (%)': 0, 'Dano/Gold': 0, 'CS/minuto': 0, 'Wards (Usadas+Destruídas)': 0 };
    const medias2 = selectedPlayers2.length > 0 ? calcularMedias(filteredData2, false) : { Jogos: 0, Vitórias: 0, 'Vitórias (%)': 0, KDA: 0, 'Mais Kills que Oponente (%)': 0, 'Participação de Kills (%)': 0, 'Dano/Gold': 0, 'CS/minuto': 0, 'Wards (Usadas+Destruídas)': 0 };
    const killStats1 = selectedPlayers1.length > 0 ? calcularKillStats(filteredData1, killLine) : { percentBelow: 0, percentAbove: 0 };
    const killStats2 = selectedPlayers2.length > 0 ? calcularKillStats(filteredData2, killLine) : { percentBelow: 0, percentAbove: 0 };
    const deathStats1 = selectedPlayers1.length > 0 ? calcularDeathStats(filteredData1, deathLine) : { percentBelow: 0, percentAbove: 0 };
    const deathStats2 = selectedPlayers2.length > 0 ? calcularDeathStats(filteredData2, deathLine) : { percentBelow: 0, percentAbove: 0 };

    const resultado = document.getElementById('player-stats-table');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(selectedPlayers1, selectedPlayers2, yearFilter, leagueFilter, isConfrontoDireto);
    resultado.appendChild(h2);
    const tableContent = gerarTabela(medias1, medias2, killStats1, killStats2, deathStats1, deathStats2, selectedPlayers1, selectedPlayers2, killLine, deathLine);
    resultado.insertAdjacentHTML('beforeend', tableContent);

    // Atualizar KDA acima das imagens
    if (selectedPlayers1.length > 0) {
        document.getElementById('player1_1-kda').textContent = `KDA ${medias1.KDA}`;
    }
    if (selectedPlayers2.length > 0) {
        document.getElementById('player2_1-kda').textContent = `KDA ${medias2.KDA}`;
    }
}

function confrontoDireto() {
    isConfrontoDireto = true;
    const player1 = document.getElementById('player1_1').value;
    const player2 = document.getElementById('player2_1').value;
    const lane1 = document.getElementById('lane1_1').value || getPlayerLane(player1);
    const lane2 = document.getElementById('lane2_1').value || getPlayerLane(player2);
    const yearFilter = document.getElementById('year-filter').value;
    const leagueFilter = document.getElementById('league-filter').value;
    const killLine = parseFloat(document.getElementById('kill-line').value) || 4.5;
    const deathLine = parseFloat(document.getElementById('death-line').value) || 4.5;

    const selectedPlayers1 = player1 ? [{ name: player1, lane: lane1 }] : [];
    const selectedPlayers2 = player2 ? [{ name: player2, lane: lane2 }] : [];

    if (selectedPlayers1.length === 0 || selectedPlayers2.length === 0) {
        alert('Selecione um jogador de cada time para o Confronto Direto!');
        document.getElementById('player-stats-table').innerHTML = '';
        return;
    }

    let filteredData1 = df;
    let filteredData2 = df;

    if (yearFilter) {
        filteredData1 = filteredData1.filter(row => {
            if (!row.date) return false;
            const date = new Date(row.date);
            const year = date.getFullYear();
            return !isNaN(year) && year === parseInt(yearFilter);
        });
        filteredData2 = filteredData2.filter(row => {
            if (!row.date) return false;
            const date = new Date(row.date);
            const year = date.getFullYear();
            return !isNaN(year) && year === parseInt(yearFilter);
        });
    }
    if (leagueFilter) {
        filteredData1 = filteredData1.filter(row => row.league === leagueFilter);
        filteredData2 = filteredData2.filter(row => row.league === leagueFilter);
    }

    // Filtrar dados para player1 (playername = player1, adversa_player_[lane2] = player2)
    filteredData1 = filteredData1.filter(row => {
        const adversaCol = `adversa_player_${lane2}`;
        return row.playername === player1 && 
               (!lane1 || row.position.toLowerCase() === lane1) && 
               row[adversaCol] === player2;
    });

    // Filtrar dados para player2 (playername = player2, adversa_player_[lane1] = player1)
    filteredData2 = filteredData2.filter(row => {
        const adversaCol = `adversa_player_${lane1}`;
        return row.playername === player2 && 
               (!lane2 || row.position.toLowerCase() === lane2) && 
               row[adversaCol] === player1;
    });

    const medias1 = filteredData1.length > 0 ? calcularMedias(filteredData1, false) : { Jogos: 0, Vitórias: 0, 'Vitórias (%)': 0, KDA: 0, 'Mais Kills que Oponente (%)': 0, 'Participação de Kills (%)': 0, 'Dano/Gold': 0, 'CS/minuto': 0, 'Wards (Usadas+Destruídas)': 0 };
    const medias2 = filteredData2.length > 0 ? calcularMedias(filteredData2, false) : { Jogos: 0, Vitórias: 0, 'Vitórias (%)': 0, KDA: 0, 'Mais Kills que Oponente (%)': 0, 'Participação de Kills (%)': 0, 'Dano/Gold': 0, 'CS/minuto': 0, 'Wards (Usadas+Destruídas)': 0 };
    const killStats1 = filteredData1.length > 0 ? calcularKillStats(filteredData1, killLine) : { percentBelow: 0, percentAbove: 0 };
    const killStats2 = filteredData2.length > 0 ? calcularKillStats(filteredData2, killLine) : { percentBelow: 0, percentAbove: 0 };
    const deathStats1 = filteredData1.length > 0 ? calcularDeathStats(filteredData1, deathLine) : { percentBelow: 0, percentAbove: 0 };
    const deathStats2 = filteredData2.length > 0 ? calcularDeathStats(filteredData2, deathLine) : { percentBelow: 0, percentAbove: 0 };

    const resultado = document.getElementById('player-stats-table');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(selectedPlayers1, selectedPlayers2, yearFilter, leagueFilter, isConfrontoDireto);
    resultado.appendChild(h2);
    const tableContent = gerarTabela(medias1, medias2, killStats1, killStats2, deathStats1, deathStats2, selectedPlayers1, selectedPlayers2, killLine, deathLine);
    resultado.insertAdjacentHTML('beforeend', tableContent);

    // Atualizar KDA acima das imagens
    if (selectedPlayers1.length > 0) {
        document.getElementById('player1_1-kda').textContent = `KDA ${medias1.KDA}`;
    }
    if (selectedPlayers2.length > 0) {
        document.getElementById('player2_1-kda').textContent = `KDA ${medias2.KDA}`;
    }
}

window.onload = loadCSV;