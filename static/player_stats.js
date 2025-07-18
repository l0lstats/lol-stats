let df = null;
let isConfrontoDireto = false;

function mostrarLoader() {
    document.getElementById('loader').style.display = 'flex';
}

function esconderLoader() {
    document.getElementById('loader').style.display = 'none';
}

function loadCSV() {
    Papa.parse('BaseDadosPlayer.csv', {
        download: true,
        header: true,
        complete: function(results) {
            mostrarLoader();
            df = results.data.filter(row => row.date && !isNaN(new Date(row.date).getTime()) && row.playername && row.playername.trim() !== '');
            console.log('CSV carregado, total de linhas:', df.length);
            populateLeagues();
            populatePlayers();
            document.getElementById('league-filter').onchange = populatePlayers;
            document.getElementById('year-filter').onchange = () => {
                populateLeagues();
                populatePlayers();
            };
            document.getElementById('result-filter').onchange = populatePlayers;
            
            esconderLoader();
        }
    });
}

function populateLeagues() {
    const yearFilter = document.getElementById('year-filter').value;
    const resultFilter = document.getElementById('result-filter').value;

    let dfFiltered = df;
    if (yearFilter !== '') {
        dfFiltered = dfFiltered.filter(row => {
            const date = new Date(row.date);
            const year = date.getFullYear();
            return !isNaN(year) && year === parseInt(yearFilter);
        });
    }
    if (resultFilter !== '') {
        dfFiltered = dfFiltered.filter(row => row.result === resultFilter);
    }
    console.log('populateLeagues - Dados filtrados:', dfFiltered.length);

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
    const resultFilter = document.getElementById('result-filter').value;

    let dfFiltered = df;
    if (yearFilter !== '') {
        dfFiltered = dfFiltered.filter(row => {
            const date = new Date(row.date);
            const year = date.getFullYear();
            return !isNaN(year) && year === parseInt(yearFilter);
        });
    }
    if (leagueFilter !== '') {
        dfFiltered = dfFiltered.filter(row => row.league === leagueFilter);
    }
    if (resultFilter !== '') {
        dfFiltered = dfFiltered.filter(row => row.result === resultFilter);
    }
    console.log('populatePlayers - Dados filtrados:', dfFiltered.length);

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
    return playerName
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/ /g, '%20');
}

function getPlayerLane(playerName, filteredData) {
    const positions = filteredData.filter(row => row.playername === playerName && row.position)
        .map(row => row.position.toLowerCase());
    if (positions.length === 0) return '';
    const positionCount = {};
    positions.forEach(pos => {
        positionCount[pos] = (positionCount[pos] || 0) + 1;
    });
    return Object.keys(positionCount).reduce((a, b) => positionCount[a] > positionCount[b] ? a : b, '');
}

function updatePlayerImage(playerId) {
    const playerInput = document.getElementById(playerId);
    const imageDiv = document.getElementById(`${playerId}-image`);
    
    if (playerInput.value) {
        const cleanName = getCleanPlayerName(playerInput.value).toLowerCase();
        let imgUrl = `https://dpm.lol/esport/players/${cleanName}.webp`;
        const placeholderUrl = `https://dpm.lol/esport/players/nopicture.webp`;
        
        if (playerInput.value === "xPeke") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/c/c0/OG_xPeke_2016_Summer.png";
        }
        if (playerInput.value === "Kami") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/8/82/PNG_Kami_2020_Split_1.png";
        }
        if (playerInput.value === "4LaN") {
            imgUrl = "https://img.freepik.com/fotos-gratis/vista-frontal-da-mao-mostrando-a-palma_23-2148775895.jpg?semt=ais_hybrid&w=740";
        }
        if (playerInput.value === "element") {
            imgUrl = "https://media.tenor.com/_3HkBReYdCAAAAAj/malphite-laugh.gif";
        }
        if (playerInput.value === "Mylon") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/4/4f/PaiN_Mylon_2016_Summer.png";
        }
        if (playerInput.value === "Lep") {
            imgUrl = "https://i.makeagif.com/media/2-05-2021/fog5cD.gif";
        }
        if (playerInput.value === "Klaus") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/3/3a/VK_Klaus_2020_Split_1.png";
        }
        if (playerInput.value === "brTT") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/4/42/LOS_brTT_2024_Split_2_player.png";
        }
        if (playerInput.value === "Baiano") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/5/59/CNB_Baiano_2018_Split_2.png";
        }
        if (playerInput.value === "Jukes") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/8/87/C9_Jukes_2019_Split_2.png";
        }
        if (playerInput.value === "Rakin") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/2/25/CNB_Rakin_2018_Spring.png";
        }
        if (playerInput.value === "Minerva") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/f/f6/RNS_Minerva_2022_Split_2.png";
        }
        if (playerInput.value === "takeshi") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/b/b6/ONE_takeshi_2019_Split_2.png";
        }
        if (playerInput.value === "Revolta") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/7/7a/ITZ_Revolta_2021_Split_1.png";
        }
        if (playerInput.value === "esA") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/b/bb/PNG_esA_2020_Split_2.png";
        }
        if (playerInput.value === "Tay") {
            imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/8/82/INTZ_Tay_2024_Split_1.png";
        }

        imageDiv.innerHTML = `<div class="kda" id="${playerId}-kda"></div><img class="player-img" src="${imgUrl}" alt="${playerInput.value}" onerror="this.src='${placeholderUrl}'; this.onerror=null;"><div class="lane" id="${playerId}-lane" style="display: none;"></div>`;
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

function updateChampionImage(champId, playerName, filteredData, otherPlayerName = null) {
    const champInput = document.getElementById(champId);
    const imageDiv = document.getElementById(`${champId}-image`);
    if (champInput.value) {
        const filteredChampData = filteredData.filter(row => row.playername === playerName && row.champion === champInput.value);
        if (filteredChampData.length > 0) {
            const cleanName = getCleanChampionName(champInput.value);
            const imgUrl = `https://gol.gg/_img/champions_icon/${cleanName}.png`;
            const placeholderUrl = `blitzGif.gif`;
            const games = filteredChampData.length;
            const wins = filteredChampData.reduce((sum, row) => sum + (parseInt(row.result) === 1 ? 1 : 0), 0);
            const winrate = ((wins / games) * 100).toFixed(2);

            const gamesLink = generatePlayerGamesLink(
                [playerName],
                [],
                otherPlayerName ? [otherPlayerName] : [],
                [],
                champInput.value
            );

            imageDiv.innerHTML = `
                <div class="champion-stats">
                    <a href="${gamesLink}" target="_blank" class="games-link">Partidas</a>
                    <div class="winrate" style="color: ${getWinrateColor(winrate)}">${winrate}%</div>
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
    console.log('getTopChampions - Total de campeões:', Object.keys(championCounts).length);
    
    // Criar uma cópia dos dados para evitar modificar filteredData
    const champions = Object.keys(championCounts).map(champ => ({
        name: champ,
        games: championCounts[champ].games,
        winrate: ((championCounts[champ].wins / championCounts[champ].games) * 100).toFixed(2)
    }));
    
    // Ordenar por número de jogos (decrescente) e selecionar os 7 primeiros
    const topByGames = champions.sort((a, b) => b.games - a.games).slice(0, 7);
    console.log('getTopChampions - Após seleção dos 7 com mais jogos:', topByGames.length);
    
    // Ordenar os 7 selecionados por taxa de vitória (decrescente)
    const topChampions = topByGames.sort((a, b) => b.winrate - a.winrate || b.games - a.games);
    console.log('getTopChampions - Após ordenação por winrate:', topChampions.length);
    
    return topChampions;
}

function generatePlayerGamesLink(players1, lanes1, players2 = [], lanes2 = [], champion = null) {
    const urlParams = new URLSearchParams();
    
    // Definir jogadores efetivos
    const effectivePlayers1 = players1.length > 0 ? players1 : players2;
    // Incluir players2 apenas se isConfrontoDireto for true ou se não houver champion
    const effectivePlayers2 = (isConfrontoDireto || !champion) && players1.length > 0 && players2.length > 0 ? players2 : [];

    if (effectivePlayers1[0]) {
        urlParams.append('player1_1', encodeURIComponent(effectivePlayers1[0]));
    }
    if (effectivePlayers2.length > 0 && effectivePlayers2[0]) {
        urlParams.append('player2_1', encodeURIComponent(effectivePlayers2[0]));
    }
    const year = document.getElementById('year-filter').value;
    if (year) {
        urlParams.append('year', year);
    }
    const league = document.getElementById('league-filter').value;
    if (league) {
        urlParams.append('league', league);
    }
    const result = document.getElementById('result-filter').value;
    if (result) {
        urlParams.append('result', result);
    }
    const recentGames = document.getElementById('recent-games').value;
    if (recentGames && recentGames !== 'Todos os Jogos') {
        urlParams.append('recentGames', recentGames);
    }
    if (isConfrontoDireto && effectivePlayers2.length > 0) {
        urlParams.append('confrontoDireto', 'true');
    }
    if (champion) {
        urlParams.append('champion', encodeURIComponent(champion));
    }
    return `player_games.html?${urlParams.toString()}`;
}

function gerarChampionSection(playerId, playerName, filteredData, otherPlayerName = null) {
    if (!playerName) return '';
    const cleanName = getCleanPlayerName(playerName).toLowerCase();
    let imgUrl = `https://dpm.lol/esport/players/${cleanName}.webp`;
    const placeholderUrl = `https://dpm.lol/esport/players/nopicture.webp`;

    if (playerName === "xPeke") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/c/c0/OG_xPeke_2016_Summer.png";
    }
    if (playerName === "Kami") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/8/82/PNG_Kami_2020_Split_1.png";
    }
    if (playerName === "4LaN") {
        imgUrl = "https://img.freepik.com/fotos-gratis/vista-frontal-da-mao-mostrando-a-palma_23-2148775895.jpg?semt=ais_hybrid&w=740";
    }
    if (playerName === "element") {
        imgUrl = "https://media.tenor.com/_3HkBReYdCAAAAAj/malphite-laugh.gif";
    }
    if (playerName === "Mylon") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/4/4f/PaiN_Mylon_2016_Summer.png";
    }
    if (playerName === "Lep") {
        imgUrl = "https://i.makeagif.com/media/2-05-2021/fog5cD.gif";
    }
    if (playerName === "Klaus") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/3/3a/VK_Klaus_2020_Split_1.png";
    }
    if (playerName === "brTT") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/4/42/LOS_brTT_2024_Split_2_player.png";
    }
    if (playerName === "Baiano") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/5/59/CNB_Baiano_2018_Split_2.png";
    }
    if (playerName === "Jukes") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/8/87/C9_Jukes_2019_Split_2.png";
    }
    if (playerName === "Rakin") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/2/25/CNB_Rakin_2018_Spring.png";
    }
    if (playerName === "Minerva") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/f/f6/RNS_Minerva_2022_Split_2.png";
    }
    if (playerName === "takeshi") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/b/b6/ONE_takeshi_2019_Split_2.png";
    }
    if (playerName === "Revolta") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/7/7a/ITZ_Revolta_2021_Split_1.png";
    }
    if (playerName === "esA") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/b/bb/PNG_esA_2020_Split_2.png";
    }
    if (playerName === "Tay") {
        imgUrl = "https://static.wikia.nocookie.net/lolesports_gamepedia_en/images/8/82/INTZ_Tay_2024_Split_1.png";
    }

    let champFilteredData = filteredData;
    const recentGames = document.getElementById('recent-games').value;

    console.log('gerarChampionSection - Dados iniciais:', champFilteredData.length);
    champFilteredData = champFilteredData.filter(row => row.playername === playerName);
    console.log('gerarChampionSection - Após filtro de jogador:', champFilteredData.length);
    if (recentGames && recentGames !== 'Todos os Jogos') {
        champFilteredData = champFilteredData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        console.log('gerarChampionSection - Após filtro de jogos recentes:', champFilteredData.length);
    }
    if (isConfrontoDireto && otherPlayerName) {
        const playerLane = getPlayerLane(playerName, df);
        const otherPlayerLane = getPlayerLane(otherPlayerName, df);
        const adversaCol = `adversa_player_${otherPlayerLane}`;
        champFilteredData = champFilteredData.filter(row => 
            row.position.toLowerCase() === playerLane && row[adversaCol] === otherPlayerName
        );
        console.log('gerarChampionSection - Após filtro de confronto direto:', champFilteredData.length);
    }

    const topChampions = getTopChampions(playerName, champFilteredData);

    const selectedPlayers1 = playerName ? [{ name: playerName, lane: getPlayerLane(playerName, df) }] : [];
    const selectedPlayers2 = otherPlayerName ? [{ name: otherPlayerName, lane: getPlayerLane(otherPlayerName, df) }] : [];

    let titleText = '';
    if (isConfrontoDireto && selectedPlayers1.length > 0 && selectedPlayers2.length > 0) {
        titleText = `${selectedPlayers1[0].name} vs ${selectedPlayers2[0].name}`;
    } else if (selectedPlayers1.length > 0) {
        titleText = selectedPlayers1[0].name;
    }
    let filters = [];
    const yearFilter = document.getElementById('year-filter').value;
    const leagueFilter = document.getElementById('league-filter').value;
    const resultFilter = document.getElementById('result-filter').value;
    if (yearFilter) filters.push(yearFilter);
    if (leagueFilter) filters.push(leagueFilter);
    if (resultFilter === '1') filters.push('Vitórias');
    if (resultFilter === '0') filters.push('Derrotas');
    if (recentGames && recentGames !== 'Todos os Jogos') filters.push(`Últimos ${recentGames} jogos`);
    if (filters.length > 0) {
        titleText += ` (${filters.join(', ')})`;
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
        const champPlaceholderUrl = `blitzGif.gif`;
        const gamesLink = generatePlayerGamesLink([playerName], [], otherPlayerName ? [otherPlayerName] : [], [], champ.name);
        content += `
            <div class="champion">
                <div class="winrate" style="color: ${getWinrateColor(champ.winrate)}">${champ.winrate}%</div>
                <a href="${gamesLink}" target="_blank"><img src="${champImgUrl}" alt="${champ.name}" onerror="this.src='${champPlaceholderUrl}'; this.onerror=null;"></a>
                <div class="games">${champ.games} jogos</div>
            </div>
        `;
    });
    content += `</div></div>`;

    populateChampions(playerId, playerName, champFilteredData);

    setTimeout(() => {
        const champInput = document.getElementById(`champ-${playerId}`);
        if (champInput) {
            champInput.addEventListener('input', () => {
                let currentFilteredData = filteredData;
                const recentGames = document.getElementById('recent-games').value;

                console.log('champInput - Dados iniciais:', currentFilteredData.length);
                currentFilteredData = currentFilteredData.filter(row => row.playername === playerName);
                console.log('champInput - Após filtro de jogador:', currentFilteredData.length);
                if (recentGames && recentGames !== 'Todos os Jogos') {
                    currentFilteredData = currentFilteredData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
                    console.log('champInput - Após filtro de jogos recentes:', currentFilteredData.length);
                }
                if (isConfrontoDireto && otherPlayerName) {
                    const playerLane = getPlayerLane(playerName, df);
                    const otherPlayerLane = getPlayerLane(otherPlayerName, df);
                    const adversaCol = `adversa_player_${otherPlayerLane}`;
                    currentFilteredData = currentFilteredData.filter(row => 
                        row.position.toLowerCase() === playerLane && row[adversaCol] === otherPlayerName
                    );
                    console.log('champInput - Após filtro de confronto direto:', currentFilteredData.length);
                }

                updateChampionImage(`champ-${playerId}`, playerName, currentFilteredData, otherPlayerName);
            });
        }
    }, 0);

    return content;
}

function calcularMedias(dados, isTeam2 = false) {
    const jogos = dados.length;
    console.log('calcularMedias - Jogos:', jogos);
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
        'Mais Kills que o oponente (%)': killsVsOpponent,
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

function calcularAssistStats(dados, assistLine) {
    const totalJogos = dados.length;
    const assistsBelow = dados.filter(row => parseFloat(row.assists) < assistLine).length;
    const assistsAbove = totalJogos - assistsBelow;
    const percentBelow = totalJogos > 0 ? (assistsBelow / totalJogos * 100).toFixed(2) : 0;
    const percentAbove = totalJogos > 0 ? (assistsAbove / totalJogos * 100).toFixed(2) : 0;
    return { totalJogos, assistsBelow, assistsAbove, percentBelow, percentAbove };
}

function gerarTabela(medias1, medias2, killStats1, killStats2, deathStats1, deathStats2, assistStats1, assistStats2, selectedPlayers1, selectedPlayers2, killLine, deathLine, assistLine) {
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

    tableContent += `<tr><td>Under ${assistLine} Assistências</td>`;
    if (selectedPlayers1.length > 0) tableContent += `<td>${assistStats1.percentBelow}%</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${assistStats2.percentBelow}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Over ${assistLine} Assistências</td>`;
    if (selectedPlayers1.length > 0) tableContent += `<td>${assistStats1.percentAbove}%</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${assistStats2.percentAbove}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Mais Kills que o oponente de Lane</td>`;
    if (selectedPlayers1.length > 0) tableContent += `<td>${medias1['Mais Kills que o oponente (%)']}%</td>`;
    if (selectedPlayers2.length > 0) tableContent += `<td>${medias2['Mais Kills que o oponente (%)']}%</td>`;
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

function gerarTitulo(selectedPlayers1, selectedPlayers2, yearFilter, leagueFilter, resultFilter, recentGames, isConfrontoDireto) {
    const h2 = document.createElement('h2');
    if (selectedPlayers1.length === 0 && selectedPlayers2.length === 0) {
        h2.textContent = 'Estatísticas de Jogadores';
    } else {
        if (isConfrontoDireto && selectedPlayers1.length > 0 && selectedPlayers2.length > 0) {
            const link1 = document.createElement('a');
            link1.href = generatePlayerGamesLink(
                selectedPlayers1.map(p => p.name),
                [],
                selectedPlayers2.map(p => p.name),
                []
            );
            link1.target = '_blank';
            link1.textContent = selectedPlayers1[0].name;
            link1.className = 'player-link';
            h2.appendChild(link1);

            h2.appendChild(document.createTextNode(' vs '));

            const link2 = document.createElement('a');
            link2.href = generatePlayerGamesLink(
                selectedPlayers2.map(p => p.name),
                [],
                selectedPlayers1.map(p => p.name),
                []
            );
            link2.target = '_blank';
            link2.textContent = selectedPlayers2[0].name;
            link2.className = 'player-link';
            h2.appendChild(link2);
        } else {
            if (selectedPlayers1.length > 0) {
                const link1 = document.createElement('a');
                link1.href = generatePlayerGamesLink(
                    selectedPlayers1.map(p => p.name),
                    [],
                    [],
                    []
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
                    selectedPlayers2.map(p => p.name),
                    [],
                    [],
                    []
                );
                link2.target = '_blank';
                link2.textContent = selectedPlayers2[0].name;
                link2.className = 'player-link';
                h2.appendChild(link2);
            }
        }
        let filters = [];
        if (yearFilter) filters.push(yearFilter);
        if (leagueFilter) filters.push(leagueFilter);
        if (resultFilter === '1') filters.push('Vitórias');
        if (resultFilter === '0') filters.push('Derrotas');
        if (recentGames && recentGames !== 'Todos os Jogos') filters.push(`Últimos ${recentGames} jogos`);
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

function getKDAColor(kda) {
    const kdaValue = parseFloat(kda);
    if (kdaValue < 3) {
        return '#ff0000';
    } else if (kdaValue >= 3 && kdaValue < 4) {
        return '#ffa500';
    } else {
        return '#00ff00';
    }
}

function getWinrateColor(winrate) {
    const winrateValue = parseFloat(winrate);
    if (winrateValue < 40) {
        return '#ff0000';
    } else if (winrateValue >= 40 && winrateValue < 55) {
        return '#ffa500';
    } else {
        return '#00ff00';
    }
}

function generateStats() {
    isConfrontoDireto = false;
    const player1 = document.getElementById('player1_1').value;
    const player2 = document.getElementById('player2_1').value;
    const yearFilter = document.getElementById('year-filter').value;
    const leagueFilter = document.getElementById('league-filter').value;
    const resultFilter = document.getElementById('result-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const killLine = parseFloat(document.getElementById('kill-line').value);
    const deathLine = parseFloat(document.getElementById('death-line').value);
    const assistLine = parseFloat(document.getElementById('assist-line').value);

    const selectedPlayers1 = player1 ? [{ name: player1, lane: null }] : [];
    const selectedPlayers2 = player2 ? [{ name: player2, lane: null }] : [];

    let filteredData = df;
    if (yearFilter) {
        filteredData = filteredData.filter(row => new Date(row.date).getFullYear().toString() === yearFilter);
    }
    if (leagueFilter) {
        filteredData = filteredData.filter(row => row.league === leagueFilter);
    }
    if (resultFilter) {
        filteredData = filteredData.filter(row => row.result === resultFilter);
    }
    console.log('generateStats - Dados filtrados (antes de jogadores e recentGames):', filteredData.length);

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

    if (recentGames && recentGames !== 'Todos os Jogos') {
        filteredData1 = filteredData1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        filteredData2 = filteredData2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    console.log('generateStats - Dados filtrados player1:', filteredData1.length);
    console.log('generateStats - Dados filtrados player2:', filteredData2.length);

    const medias1 = selectedPlayers1.length > 0 ? calcularMedias(filteredData1, false) : {
        Jogos: 0,
        Vitórias: 0,
        'Vitórias (%)': 0,
        KDA: 0,
        'Mais Kills que o oponente (%)': 0,
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
        'Mais Kills que o oponente (%)': 0,
        'Participação de Kills (%)': 0,
        'Dano/Gold': 0,
        'CS/minuto': 0,
        'Wards (Usadas+Destruídas)': 0
    };
    const killStats1 = selectedPlayers1.length > 0 ? calcularKillStats(filteredData1, killLine) : { percentBelow: 0, percentAbove: 0 };
    const killStats2 = selectedPlayers2.length > 0 ? calcularKillStats(filteredData2, killLine) : { percentBelow: 0, percentAbove: 0 };
    const deathStats1 = selectedPlayers1.length > 0 ? calcularDeathStats(filteredData1, deathLine) : { percentBelow: 0, percentAbove: 0 };
    const deathStats2 = selectedPlayers2.length > 0 ? calcularDeathStats(filteredData2, deathLine) : { percentBelow: 0, percentAbove: 0 };
    const assistStats1 = selectedPlayers1.length > 0 ? calcularAssistStats(filteredData1, assistLine) : { percentBelow: 0, percentAbove: 0 };
    const assistStats2 = selectedPlayers2.length > 0 ? calcularAssistStats(filteredData2, assistLine) : { percentBelow: 0, percentAbove: 0 };

    const resultado = document.getElementById('player-stats-table');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(selectedPlayers1, selectedPlayers2, yearFilter, leagueFilter, resultFilter, recentGames, isConfrontoDireto);
    resultado.appendChild(h2);
    const tableContent = gerarTabela(medias1, medias2, killStats1, killStats2, deathStats1, deathStats2, assistStats1, assistStats2, selectedPlayers1, selectedPlayers2, killLine, deathLine, assistLine);
    resultado.insertAdjacentHTML('beforeend', tableContent);

    if (selectedPlayers1.length > 0) {
        const kdaElement1 = document.getElementById('player1_1-kda');
        kdaElement1.textContent = `KDA ${medias1.KDA}`;
        kdaElement1.style.color = getKDAColor(medias1.KDA);
        updateLaneDisplay('player1_1', selectedPlayers1[0].lane);
    }
    if (selectedPlayers2.length > 0) {
        const kdaElement2 = document.getElementById('player2_1-kda');
        kdaElement2.textContent = `KDA ${medias2.KDA}`;
        kdaElement2.style.color = getKDAColor(medias2.KDA);
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
    const resultFilter = document.getElementById('result-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const killLine = parseFloat(document.getElementById('kill-line').value);
    const deathLine = parseFloat(document.getElementById('death-line').value);
    const assistLine = parseFloat(document.getElementById('assist-line').value);

    const selectedPlayers1 = player1 ? [{ name: player1, lane: null }] : [];
    const selectedPlayers2 = player2 ? [{ name: player2, lane: null }] : [];

    if (!player1) {
        alert('Selecione um primeiro jogador para o Confronto Direto!');
        return;
    }
    
    if (!player2) {
        alert('Selecione um segundo jogador para o Confronto Direto!');
        return;
    }
    if (player1 === player2) {
        alert('Selecione jogadores diferentes para o Confronto Direto!');
        return;
    }

    let filteredData = df;
    if (yearFilter) {
        filteredData = filteredData.filter(row => new Date(row.date).getFullYear().toString() === yearFilter);
    }
    if (leagueFilter) {
        filteredData = filteredData.filter(row => row.league === leagueFilter);
    }
    if (resultFilter) {
        filteredData = filteredData.filter(row => row.result === resultFilter);
    }
    console.log('confrontoDireto - Dados filtrados (antes de jogadores e recentGames):', filteredData.length);

    let filteredData1 = filteredData;
    let filteredData2 = filteredData;

    if (selectedPlayers1.length > 0 && selectedPlayers2.length > 0) {
        selectedPlayers1[0].lane = getPlayerLane(player1, filteredData1);
        selectedPlayers2[0].lane = getPlayerLane(player2, filteredData2);

        filteredData1 = filteredData.filter(row => {
            const adversaCol = `adversa_player_${selectedPlayers2[0].lane}`;
            return row.playername === player1 && row.position.toLowerCase() === selectedPlayers1[0].lane && row[adversaCol] === player2;
        });

        filteredData2 = filteredData.filter(row => {
            const adversaCol = `adversa_player_${selectedPlayers1[0].lane}`;
            return row.playername === player2 && row.position.toLowerCase() === selectedPlayers2[0].lane && row[adversaCol] === player1;
        });
    }

    if (recentGames && recentGames !== 'Todos os Jogos') {
        filteredData1 = filteredData1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        filteredData2 = filteredData2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    console.log('confrontoDireto - Dados filtrados player1:', filteredData1.length);
    console.log('confrontoDireto - Dados filtrados player2:', filteredData2.length);

    const medias1 = filteredData1.length > 0 ? calcularMedias(filteredData1, false) : {
        Jogos: 0,
        Vitórias: 0,
        'Vitórias (%)': 0,
        KDA: 0,
        'Mais Kills que o oponente (%)': 0,
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
        'Mais Kills que o oponente (%)': 0,
        'Participação de Kills (%)': 0,
        'Dano/Gold': 0,
        'CS/minuto': 0,
        'Wards (Usadas+Destruídas)': 0
    };
    const killStats1 = filteredData1.length > 0 ? calcularKillStats(filteredData1, killLine) : { percentBelow: 0, percentAbove: 0 };
    const killStats2 = filteredData2.length > 0 ? calcularKillStats(filteredData2, killLine) : { percentBelow: 0, percentAbove: 0 };
    const deathStats1 = filteredData1.length > 0 ? calcularDeathStats(filteredData1, deathLine) : { percentBelow: 0, percentAbove: 0 };
    const deathStats2 = filteredData2.length > 0 ? calcularDeathStats(filteredData2, deathLine) : { percentBelow: 0, percentAbove: 0 };
    const assistStats1 = filteredData1.length > 0 ? calcularAssistStats(filteredData1, assistLine) : { percentBelow: 0, percentAbove: 0 };
    const assistStats2 = filteredData2.length > 0 ? calcularAssistStats(filteredData2, assistLine) : { percentBelow: 0, percentAbove: 0 };

    const resultado = document.getElementById('player-stats-table');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(selectedPlayers1, selectedPlayers2, yearFilter, leagueFilter, resultFilter, recentGames, isConfrontoDireto);
    resultado.appendChild(h2);
    const tableContent = gerarTabela(medias1, medias2, killStats1, killStats2, deathStats1, deathStats2, assistStats1, assistStats2, selectedPlayers1, selectedPlayers2, killLine, deathLine, assistLine);
    resultado.insertAdjacentHTML('beforeend', tableContent);

    if (selectedPlayers1.length > 0) {
        const kdaElement1 = document.getElementById('player1_1-kda');
        kdaElement1.textContent = `KDA ${medias1.KDA}`;
        kdaElement1.style.color = getKDAColor(medias1.KDA);
        updateLaneDisplay('player1_1', selectedPlayers1[0].lane);
    }
    if (selectedPlayers2.length > 0) {
        const kdaElement2 = document.getElementById('player2_1-kda');
        kdaElement2.textContent = `KDA ${medias2.KDA}`;
        kdaElement2.style.color = getKDAColor(medias2.KDA);
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

function comparar() {
    isConfrontoDireto = false;
    const player1 = document.getElementById('player1_1').value;
    const player2 = document.getElementById('player2_1').value;
    const yearFilter = document.getElementById('year-filter').value;
    const leagueFilter = document.getElementById('league-filter').value;
    const resultFilter = document.getElementById('result-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const killLine = parseFloat(document.getElementById('kill-line').value);
    const deathLine = parseFloat(document.getElementById('death-line').value);
    const assistLine = parseFloat(document.getElementById('assist-line').value);

    const selectedPlayers1 = player1 ? [{ name: player1, lane: null }] : [];
    const selectedPlayers2 = player2 ? [{ name: player2, lane: null }] : [];

    if (selectedPlayers1.length === 0 && selectedPlayers2.length === 0) {
        alert('Selecione pelo menos um jogador para gerar as estatísticas!');
        return;
    }

    let filteredData = df;
    if (yearFilter) {
        filteredData = filteredData.filter(row => new Date(row.date).getFullYear().toString() === yearFilter);
    }
    if (leagueFilter) {
        filteredData = filteredData.filter(row => row.league === leagueFilter);
    }
    if (resultFilter) {
        filteredData = filteredData.filter(row => row.result === resultFilter);
    }
    console.log('comparar - Dados filtrados (antes de jogadores e recentGames):', filteredData.length);

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

    if (recentGames && recentGames !== 'Todos os Jogos') {
        filteredData1 = filteredData1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        filteredData2 = filteredData2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    console.log('comparar - Dados filtrados player1:', filteredData1.length);
    console.log('comparar - Dados filtrados player2:', filteredData2.length);

    const medias1 = filteredData1.length > 0 ? calcularMedias(filteredData1, false) : {
        Jogos: 0,
        Vitórias: 0,
        'Vitórias (%)': 0,
        KDA: 0,
        'Mais Kills que o oponente (%)': 0,
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
        'Mais Kills que o oponente (%)': 0,
        'Participação de Kills (%)': 0,
        'Dano/Gold': 0,
        'CS/minuto': 0,
        'Wards (Usadas+Destruídas)': 0
    };
    const killStats1 = filteredData1.length > 0 ? calcularKillStats(filteredData1, killLine) : { percentBelow: 0, percentAbove: 0 };
    const killStats2 = filteredData2.length > 0 ? calcularKillStats(filteredData2, killLine) : { percentBelow: 0, percentAbove: 0 };
    const deathStats1 = filteredData1.length > 0 ? calcularDeathStats(filteredData1, deathLine) : { percentBelow: 0, percentAbove: 0 };
    const deathStats2 = filteredData2.length > 0 ? calcularDeathStats(filteredData2, deathLine) : { percentBelow: 0, percentAbove: 0 };
    const assistStats1 = filteredData1.length > 0 ? calcularAssistStats(filteredData1, assistLine) : { percentBelow: 0, percentAbove: 0 };
    const assistStats2 = filteredData2.length > 0 ? calcularAssistStats(filteredData2, assistLine) : { percentBelow: 0, percentAbove: 0 };

    const resultado = document.getElementById('player-stats-table');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(selectedPlayers1, selectedPlayers2, yearFilter, leagueFilter, resultFilter, recentGames, false);
    resultado.appendChild(h2);
    const tableContent = gerarTabela(medias1, medias2, killStats1, killStats2, deathStats1, deathStats2, assistStats1, assistStats2, selectedPlayers1, selectedPlayers2, killLine, deathLine, assistLine);
    resultado.insertAdjacentHTML('beforeend', tableContent);

    if (selectedPlayers1.length > 0) {
        const kdaElement1 = document.getElementById('player1_1-kda');
        kdaElement1.textContent = `KDA ${medias1.KDA}`;
        kdaElement1.style.color = getKDAColor(medias1.KDA);
        updateLaneDisplay('player1_1', selectedPlayers1[0].lane);
    }
    if (selectedPlayers2.length > 0) {
        const kdaElement2 = document.getElementById('player2_1-kda');
        kdaElement2.textContent = `KDA ${medias2.KDA}`;
        kdaElement2.style.color = getKDAColor(medias2.KDA);
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