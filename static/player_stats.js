let df = null;
let isConfrontoDireto = false;

function loadCSV() {
    Papa.parse('BaseDadosPlayer.csv', {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data;
            populateLeagues();
            populatePlayers();
            document.getElementById('league-filter').onchange = populatePlayers;
            document.getElementById('year-filter').onchange = () => {
                populateLeagues();
                populatePlayers();
            };
        }
    });
}

function populateLeagues() {
    const yearFilter = document.getElementById('year-filter').value;

    const dfFiltered = yearFilter === '' ? df : df.filter(row => {
        if (!row.date) return false;
        const date = new Date(row.date);
        const year = date.getFullYear();
        return !isNaN(year) && year === parseInt(yearFilter);
    });

    const leagues = [...new Set(dfFiltered.map(row => row.league).filter(league => league))].sort();
    const selectLeague = document.getElementById('league-filter');
    selectLeague.innerHTML = '<option value="">Todos os Campeonatos</option>';
    leagues.forEach(league => {
        const option = document.createElement('option');
        option.value = league;
        option.textContent = league;
        selectLeague.appendChild(option);
    });
}

function populatePlayers() {
    const yearFilter = document.getElementById('year-filter').value;
    const leagueFilter = document.getElementById('league-filter').value;

    let dfFiltered = df;
    if (yearFilter !== '') {
        dfFiltered = dfFiltered.filter(row => {
            if (!row.date) return false;
            const date = new Date(row.date);
            const year = date.getFullYear();
            return !isNaN(year) && year === parseInt(yearFilter);
        });
    }

    if (leagueFilter !== '') {
        dfFiltered = dfFiltered.filter(row => row.league === leagueFilter);
    }

    const players = [...new Set(dfFiltered.map(row => row.playername).filter(p => p))].sort();
    const datalist = document.getElementById('players-list');
    datalist.innerHTML = '';
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        datalist.appendChild(option);
    });
}

function getCleanPlayerName(playerName) {
    return playerName.replace(/[^a-zA-Z0-9]/g, '');
}

function getPlayerLane(playerName, filteredData) {
    const lastGame = filteredData.filter(row => row.playername === playerName)
                                 .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return lastGame ? lastGame.position.toLowerCase() : '';
}

function updatePlayerImage(playerId) {
    const playerInput = document.getElementById(playerId);
    const imageDiv = document.getElementById(`${playerId}-image`);
    
    if (playerInput.value) {
        const cleanName = getCleanPlayerName(playerInput.value);
        const imgUrl = `https://dpm.lol/esport/players/${cleanName}.webp`;
        const placeholderUrl = `https://dpm.lol/esport/players/NoPicture.webp`;
        imageDiv.innerHTML = `<div class="kda" id="${playerId}-kda"></div><img src="${imgUrl}" alt="${playerInput.value}" onerror="this.src='${placeholderUrl}'; this.onerror=null;"><div class="lane" id="${playerId}-lane" style="display: none;"></div>`;
    } else {
        imageDiv.innerHTML = '';
    }
}

function getCleanChampionName(championName) {
    const exceptions = {
        "Cho'Gath": "Chogath",
        "Kai'Sa": "Kaisa",
        "Bel'Veth": "Belveth",
        "Nunu & Willump": "Nunu",
        "K'Sante": "KSante"
    };
    return exceptions[championName] || championName.replace(/['\s]/g, '');
}

function populateChampions(playerId, playerName, filteredData) {
    const champions = [...new Set(filteredData.filter(row => row.playername === playerName).map(row => row.champion))].sort();
    const datalist = document.getElementById(`champions-${playerId}`);
    datalist.innerHTML = '';
    champions.forEach(champion => {
        const option = document.createElement('option');
        option.value = champion;
        datalist.appendChild(option);
    });
}

function updateChampionImage(champId, playerName, filteredData) {
    const champInput = document.getElementById(champId);
    const imageDiv = document.getElementById(`${champId}-image`);
    if (champInput.value) {
        const filteredChampData = filteredData.filter(row => row.playername === playerName && row.champion === champInput.value);
        if (filteredChampData.length > 0) {
            const cleanName = getCleanChampionName(champInput.value);
            const imgUrl = `https://gol.gg/_img/champions_icon/${cleanName}.png`;
            const placeholderUrl = `https://media.tenor.com/_aAExG9FQDEAAAAj/league-of-legends-riot-games.gif`;
            const games = filteredChampData.length;
            const wins = filteredChampData.reduce((sum, row) => sum + (parseInt(row.result) === 1 ? 1 : 0), 0);
            const winrate = ((wins / games) * 100).toFixed(2);
            imageDiv.innerHTML = `
                <div class="champion-stats">
                    <div class="winrate">${winrate}%</div>
                    <img src="${imgUrl}" alt="${champInput.value}" onerror="this.src='${placeholderUrl}'; this.onerror=null;">
                    <div class="games">${games} jogos</div>
                </div>
            `;
        } else {
            imageDiv.innerHTML = '';
        }
    } else {
        imageDiv.innerHTML = '';
    }
}

function getTopChampions(playerName, filteredData) {
    const championCounts = {};
    filteredData.filter(row => row.playername === playerName).forEach(row => {
        championCounts[row.champion] = (championCounts[row.champion] || { games: 0, wins: 0 });
        championCounts[row.champion].games += 1;
        championCounts[row.champion].wins += parseInt(row.result) === 1 ? 1 : 0;
    });
    const champions = Object.keys(championCounts)
        .filter(champ => championCounts[champ].games >= 10)
        .map(champ => ({
            name: champ,
            games: championCounts[champ].games,
            winrate: ((championCounts[champ].wins / championCounts[champ].games) * 100).toFixed(2)
        }))
        .sort((a, b) => b.winrate - a.winrate || b.games - a.games)
        .slice(0, 7);
    return champions;
}

function gerarChampionSection(playerId, playerName, filteredData, otherPlayerName = null) {
    if (!playerName) return '';
    const cleanName = getCleanPlayerName(playerName);
    const imgUrl = `https://dpm.lol/esport/players/${cleanName}.webp`;
    const placeholderUrl = `https://dpm.lol/esport/players/NoPicture.webp`;
    const topChampions = getTopChampions(playerName, filteredData);
    
    // Gerar título dinâmico
    let titleText = `Campeões de ${playerName}`;
    if (isConfrontoDireto && otherPlayerName) {
        titleText = `Campeões de ${playerName} vs ${otherPlayerName}`;
    }
    
    let content = `
        <div class="champion-section">
            <h3>${titleText}</h3>
            <div class="champion-selection">
                <img class="player-img" src="${imgUrl}" alt="${playerName}" onerror="this.src='${placeholderUrl}'; this.onerror=null;">
                <div class="filter-group">
                    <input type="text" id="champ-${playerId}" list="champions-${playerId}" placeholder="Selecione um campeão">
                </div>
                <div id="champ-${playerId}-image"></div>
            </div>
            <div class="top-champions">
    `;
    topChampions.forEach(champ => {
        const cleanChampName = getCleanChampionName(champ.name);
        const champImgUrl = `https://gol.gg/_img/champions_icon/${cleanChampName}.png`;
        const champPlaceholderUrl = `https://media.tenor.com/_aAExG9FQDEAAAAj/league-of-legends-riot-games.gif`;
        content += `
            <div class="champion">
                <div class="winrate">${champ.winrate}%</div>
                <img src="${champImgUrl}" alt="${champ.name}" onerror="this.src='${champPlaceholderUrl}'; this.onerror=null;">
                <div class="games">${champ.games} jogos</div>
            </div>
        `;
    });
    content += `</div></div>`;

    populateChampions(playerId, playerName, filteredData);

    setTimeout(() => {
        const champInput = document.getElementById(`champ-${playerId}`);
        if (champInput) {
            champInput.addEventListener('input', () => {
                let currentFilteredData = df;
                const yearFilter = document.getElementById('year-filter').value;
                const leagueFilter = document.getElementById('league-filter').value;
                if (yearFilter) {
                    currentFilteredData = currentFilteredData.filter(row => new Date(row.date).getFullYear().toString() === yearFilter);
                }
                if (leagueFilter) {
                    currentFilteredData = currentFilteredData.filter(row => row.league === leagueFilter);
                }
                currentFilteredData = currentFilteredData.filter(row => row.playername === playerName);
                updateChampionImage(`champ-${playerId}`, playerName, currentFilteredData);
            });
        }
    }, 0);

    return content;
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
    const avgKPC = jogos > 0 ? (
        dados.reduce((sum, row) => sum + parseFloat(row.KPC), 0) / jogos
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
        'Participação de Kills (%)': avgKPC,
        'Dano/Gold': avgDPG,
        'CS/minuto': avgCSPM,
        'Wards (Usadas+Destruídas)': avgWardScore
    };
}

function calcularKillStats(dados, killLine) {
    const totalJogos = dados.length;
    const killsBelow = dados.filter(row => parseFloat(row.kills) < killLine).length;
    const killsAbove = totalJogos - killsBelow;
    const percentBelow = totalJogos > 0 ? (killsBelow / totalJogos * 100).toFixed(2) : 0;
    const percentAbove = totalJogos > 0 ? (killsAbove / totalJogos * 100).toFixed(2) : 0;
    return { totalJogos, killsBelow, killsAbove, percentBelow, percentAbove };
}

function calcularDeathStats(dados, deathLine) {
    const totalJogos = dados.length;
    const deathsBelow = dados.filter(row => parseFloat(row.deaths) < deathLine).length;
    const deathsAbove = totalJogos - deathsBelow;
    const percentBelow = totalJogos > 0 ? (deathsBelow / totalJogos * 100).toFixed(2) : 0;
    const percentAbove = totalJogos > 0 ? (deathsAbove / totalJogos * 100).toFixed(2) : 0;
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
    const year = document.getElementById('year-filter').value;
    if (year) urlParams.append('year', year);
    const league = document.getElementById('league-filter').value;
    if (league) urlParams.append('league', league);
    if (isConfrontoDireto && players2.length > 0) {
        urlParams.append('confrontoDireto', 'true');
    }
    return `player_games.html?${urlParams.toString()}`;
}

function gerarTitulo(selectedPlayers1, selectedPlayers2, yearFilter, leagueFilter, isConfrontoDireto) {
    const h2 = document.createElement('h2');
    if (selectedPlayers1.length === 0 && selectedPlayers2.length === 0) {
        h2.textContent = 'Estatísticas de Jogadores';
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
                link1.href = generatePlayerGamesLink(
                    selectedPlayers1.map(p => p.name),
                    selectedPlayers1.map(p => p.lane)
                );
                link1.target = '_blank';
                link1.textContent = selectedPlayers1[0].name;
                link1.className = 'player-link';
                h2.appendChild(link1);
            }
            if (selectedPlayers2.length > 0) {
                if (selectedPlayers1.length > 0) {
                    h2.appendChild(document.createTextNode(' | '));
                }
                const link2 = document.createElement('a');
                link2.href = generatePlayerGamesLink(
                    [],
                    [],
                    selectedPlayers2.map(p => p.name),
                    selectedPlayers2.map(p => p.lane)
                );
                link2.target = '_blank';
                link2.textContent = selectedPlayers2[0].name;
                link2.className = 'player-link';
                h2.appendChild(link2);
            }
        }
        let filters = [];
        if (yearFilter) filters.push(`${yearFilter}`);
        if (leagueFilter) filters.push(leagueFilter);
        if (filters.length > 0) {
            h2.appendChild(document.createTextNode(` (${filters.join(', ')})`));
        }
    }
    return h2;
}

function updateLaneDisplay(playerId, lane) {
    const laneDiv = document.getElementById(`${playerId}-lane`);
    if (laneDiv && lane) {
        laneDiv.style.display = 'block';
        laneDiv.textContent = lane.charAt(0).toUpperCase() + lane.slice(1).toLowerCase();
    }
}

function generateStats() {
    isConfrontoDireto = false;
    const player1 = document.getElementById('player1_1').value;
    const player2 = document.getElementById('player2_1').value;
    const yearFilter = document.getElementById('year-filter').value;
    const leagueFilter = document.getElementById('league-filter').value;
    const killLine = parseFloat(document.getElementById('kill-line').value);
    const deathLine = parseFloat(document.getElementById('death-line').value);

    const selectedPlayers1 = player1 ? [{ name: player1, lane: null }] : [];
    const selectedPlayers2 = player2 ? [{ name: player2, lane: null }] : [];

    if (selectedPlayers1.length === 0 && selectedPlayers2.length === 0) {
        document.getElementById('player-stats-table').innerHTML = '';
        document.getElementById('champion-stats').innerHTML = '';
        return;
    }

    let filteredData = df;
    if (yearFilter) {
        filteredData = filteredData.filter(row => new Date(row.date).getFullYear().toString() === yearFilter);
    }
    if (leagueFilter) {
        filteredData = filteredData.filter(row => row.league === leagueFilter);
    }

    let filteredData1 = filteredData;
    let filteredData2 = filteredData;

    if (selectedPlayers1.length > 0) {
        filteredData1 = filteredData.filter(row => row.playername === player1);
        selectedPlayers1[0].lane = getPlayerLane(player1, filteredData1);
    }
    if (selectedPlayers2.length > 0) {
        filteredData2 = filteredData.filter(row => row.playername === player2);
        selectedPlayers2[0].lane = getPlayerLane(player2, filteredData2);
    }

    const medias1 = selectedPlayers1.length > 0 ? calcularMedias(filteredData1, false) : {
        Jogos: 0,
        Vitórias: 0,
        'Vitórias (%)': 0,
        KDA: 0,
        'Mais Kills que Oponente (%)': 0,
        'Participação de Kills (%)': 0,
        'Dano/Gold': 0,
        'CS/minuto': 0,
        'Wards (Usadas+Destruídas)': 0
    };
    const medias2 = selectedPlayers2.length > 0 ? calcularMedias(filteredData2, false) : {
        Jogos: 0,
        Vitórias: 0,
        'Vitórias (%)': 0,
        KDA: 0,
        'Mais Kills que Oponente (%)': 0,
        'Participação de Kills (%)': 0,
        'Dano/Gold': 0,
        'CS/minuto': 0,
        'Wards (Usadas+Destruídas)': 0
    };
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

    if (selectedPlayers1.length > 0) {
        document.getElementById('player1_1-kda').textContent = `KDA ${medias1.KDA}`;
        updateLaneDisplay('player1_1', selectedPlayers1[0].lane);
    }
    if (selectedPlayers2.length > 0) {
        document.getElementById('player2_1-kda').textContent = `KDA ${medias2.KDA}`;
        updateLaneDisplay('player2_1', selectedPlayers2[0].lane);
    }

    const championStats = document.getElementById('champion-stats');
    championStats.innerHTML = '';
    if (selectedPlayers1.length > 0) {
        championStats.insertAdjacentHTML('beforeend', gerarChampionSection('player1_1', player1, filteredData1, player2));
    }
    if (selectedPlayers2.length > 0) {
        championStats.insertAdjacentHTML('beforeend', gerarChampionSection('player2_1', player2, filteredData2, player1));
    }
}

function confrontoDireto() {
    isConfrontoDireto = true;
    const player1 = document.getElementById('player1_1').value;
    const player2 = document.getElementById('player2_1').value;
    const yearFilter = document.getElementById('year-filter').value;
    const leagueFilter = document.getElementById('league-filter').value;
    const killLine = parseFloat(document.getElementById('kill-line').value);
    const deathLine = parseFloat(document.getElementById('death-line').value);

    const selectedPlayers1 = player1 ? [{ name: player1, lane: null }] : [];
    const selectedPlayers2 = player2 ? [{ name: player2, lane: null }] : [];

    if (selectedPlayers1.length === 0 || selectedPlayers2.length === 0) {
        document.getElementById('player-stats-table').innerHTML = '';
        document.getElementById('champion-stats').innerHTML = '';
        return;
    }

    let filteredData1 = df;
    let filteredData2 = df;

    if (yearFilter) {
        filteredData1 = filteredData1.filter(row => new Date(row.date).getFullYear().toString() === yearFilter);
        filteredData2 = filteredData2.filter(row => new Date(row.date).getFullYear().toString() === yearFilter);
    }
    if (leagueFilter) {
        filteredData1 = filteredData1.filter(row => row.league === leagueFilter);
        filteredData2 = filteredData2.filter(row => row.league === leagueFilter);
    }

    selectedPlayers1[0].lane = getPlayerLane(player1, filteredData1);
    selectedPlayers2[0].lane = getPlayerLane(player2, filteredData2);

    filteredData1 = filteredData1.filter(row => {
        const adversaCol = `adversa_player_${selectedPlayers2[0].lane}`;
        return row.playername === player1 && row.position.toLowerCase() === selectedPlayers1[0].lane && row[adversaCol] === player2;
    });

    filteredData2 = filteredData2.filter(row => {
        const adversaCol = `adversa_player_${selectedPlayers1[0].lane}`;
        return row.playername === player2 && row.position.toLowerCase() === selectedPlayers2[0].lane && row[adversaCol] === player1;
    });

    const medias1 = filteredData1.length > 0 ? calcularMedias(filteredData1, false) : {
        Jogos: 0,
        Vitórias: 0,
        'Vitórias (%)': 0,
        KDA: 0,
        'Mais Kills que Oponente (%)': 0,
        'Participação de Kills (%)': 0,
        'Dano/Gold': 0,
        'CS/minuto': 0,
        'Wards (Usadas+Destruídas)': 0
    };
    const medias2 = filteredData2.length > 0 ? calcularMedias(filteredData2, false) : {
        Jogos: 0,
        Vitórias: 0,
        'Vitórias (%)': 0,
        KDA: 0,
        'Mais Kills que Oponente (%)': 0,
        'Participação de Kills (%)': 0,
        'Dano/Gold': 0,
        'CS/minuto': 0,
        'Wards (Usadas+Destruídas)': 0
    };
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

    if (selectedPlayers1.length > 0) {
        document.getElementById('player1_1-kda').textContent = `KDA ${medias1.KDA}`;
        updateLaneDisplay('player1_1', selectedPlayers1[0].lane);
    }
    if (selectedPlayers2.length > 0) {
        document.getElementById('player2_1-kda').textContent = `KDA ${medias2.KDA}`;
        updateLaneDisplay('player2_1', selectedPlayers2[0].lane);
    }

    const championStats = document.getElementById('champion-stats');
    championStats.innerHTML = '';
    if (selectedPlayers1.length > 0) {
        championStats.insertAdjacentHTML('beforeend', gerarChampionSection('player1_1', player1, filteredData1, player2));
    }
    if (selectedPlayers2.length > 0) {
        championStats.insertAdjacentHTML('beforeend', gerarChampionSection('player2_1', player2, filteredData2, player1));
    }
}

window.onload = loadCSV;