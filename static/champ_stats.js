// Variável global para armazenar os dados do CSV
let df = null;
let isConfrontoDireto = false; // Flag para controlar o modo Confronto Direto

// Lista de campeonatos Tier 1
const TIER1_LEAGUES = ['LCK', 'LPL', 'LEC', 'LCS', 'LTA', 'LTA N', 'WLDS', 'MSI', 'EWC', 'LCP'];

// Função para carregar o CSV
function loadCSV() {
    Papa.parse('BaseDadosChamp.csv', {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data;
            // Filtrar linhas com dados vazios ou inválidos
            df = df.filter(row => {
                const teamCols = ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'];
                const adversaCols = ['adversa_top', 'adversa_jng', 'adversa_mid', 'adversa_bot', 'adversa_sup'];
                const allCols = [...teamCols, ...adversaCols];
                const hasValidChamps = allCols.every(col => row[col] && row[col].trim() !== '');
                const hasValidKills = row.totalKills && !isNaN(parseFloat(row.totalKills));
                const hasValidLength = row.gamelength && !isNaN(parseInt(row.gamelength));
                return hasValidChamps && hasValidKills && hasValidLength;
            });
            console.log('CSV carregado, primeiros 5 registros após filtragem:', df.slice(0, 5));
            console.log('Total de linhas após filtragem:', df.length);
            populateChampions();
            populatePatches();
            populateLeagues();
            
            // Exibir melhores campeões do meta ao carregar a página
            displayBestChampsMeta();
        },
        error: function(error) {
            console.error('Erro ao carregar CSV:', error);
            alert('Erro ao carregar os dados! Verifique se o arquivo está disponível.');
            // Exibir apenas melhores campeões do meta
            document.getElementById('champ-stats-table').innerHTML = '';
            displayBestChampsMeta();
        }
    });
}

// Função para preencher o datalist com os nomes dos campeões
function populateChampions() {
    const championCols = [
        'team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup',
        'adversa_top', 'adversa_jng', 'adversa_mid', 'adversa_bot', 'adversa_sup'
    ];
    const champions = [...new Set(
        df.flatMap(row => championCols.map(col => row[col]))
          .filter(name => name && name.trim() !== '')
    )].sort();
    const datalist = document.getElementById('champions-list');
    datalist.innerHTML = '';
    champions.forEach(champion => {
        const option = document.createElement('option');
        option.value = champion;
        datalist.appendChild(option);
    });
}

// Função para preencher o select de patches
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

// Função para preencher o select de ligas
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

// Função para mapear exceções de nomes de campeões
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

// Função para atualizar a imagem do campeão
function updateImage(champId) {
    const champInput = document.getElementById(champId);
    const imageDiv = document.getElementById(`${champId}-image`);
    if (champInput.value) {
        const cleanName = getCleanChampionName(champInput.value);
        const imgUrl = `https://gol.gg/_img/champions_icon/${cleanName}.png`;
        const placeholderUrl = 'https://media.tenor.com/_aAExG9FQDEAAAAj/league-of-legends-riot-games.gif';
        imageDiv.innerHTML = `<img src="${imgUrl}" alt="${champInput.value}" style="max-width: 100px; max-height: 100px;" onerror="this.src='${placeholderUrl}'; this.onerror=null;">`;
    } else {
        imageDiv.innerHTML = '';
    }
}
// Função para calcular médias (jogos, vitórias, vitórias %)
function calcularMedias(dados, isTeam2 = false) {
    const jogos = dados.length;
    const vitorias = dados.reduce((sum, row) => sum + (parseInt(row.result) === (isTeam2 ? 0 : 1) ? 1 : 0), 0);
    const winRate = jogos > 0 ? (vitorias / jogos * 100).toFixed(2) : 0;
    return {
        'Jogos': jogos,
        'Vitórias': vitorias,
        'Vitórias (%)': winRate
    };
}

// Função para calcular estatísticas de kills (under/over)
function calcularKillStats(dados, killLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, killsBelow: 0, killsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const killsBelow = dados.filter(row => {
        const kills = parseFloat(row.totalKills);
        return !isNaN(kills) && (kills < killLine || kills === 0);
    }).length;
    const killsAbove = totalJogos - killsBelow;
    const percentBelow = (killsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (killsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, killsBelow, killsAbove, percentBelow, percentAbove };
}

// Função para calcular estatísticas de tempo (under/over)
function calcularTimeStats(dados, timeLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, timeBelow: 0, timeAbove: 0, percentBelow: 0, percentAbove: 0 };
    const timeBelow = dados.filter(row => {
        const length = parseInt(row.gamelength);
        return !isNaN(length) && (length < timeLine || length === 0);
    }).length;
    const timeAbove = totalJogos - timeBelow;
    const percentBelow = (timeBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (timeAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, timeBelow, timeAbove, percentBelow, percentAbove };
}

// Função para gerar a tabela
function gerarTabela(medias1, medias2, killStats1, killStats2, timeStats1, timeStats2, selectedChamps1, selectedChamps2, killLine, timeLine) {
    let tableContent = '<table>';
    tableContent += '<tr><th>Estatística</th>';
    if (selectedChamps1.length > 0) tableContent += `<th>${selectedChamps1.map(c => c.name).join(' & ')}</th>`;
    if (selectedChamps2.length > 0) tableContent += `<th>${selectedChamps2.map(c => c.name).join(' & ')}</th>`;
    tableContent += '</tr>';

    tableContent += '<tr><td>Jogos Disputados</td>';
    if (selectedChamps1.length > 0) tableContent += `<td>${medias1.Jogos}</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${medias2.Jogos}</td>`;
    tableContent += '</tr>';

    tableContent += '<tr><td>Vitórias</td>';
    if (selectedChamps1.length > 0) tableContent += `<td>${medias1.Vitórias}</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${medias2.Vitórias}</td>`;
    tableContent += '</tr>';

    tableContent += '<tr><td>Vitórias (%)</td>';
    if (selectedChamps1.length > 0) tableContent += `<td>${medias1['Vitórias (%)']}%</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${medias2['Vitórias (%)']}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Under ${killLine} Kills</td>`;
    if (selectedChamps1.length > 0) tableContent += `<td>${killStats1.percentBelow}%</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${killStats2.percentBelow}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Over ${killLine} Kills</td>`;
    if (selectedChamps1.length > 0) tableContent += `<td>${killStats1.percentAbove}%</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${killStats2.percentAbove}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Under ${timeLine} min</td>`;
    if (selectedChamps1.length > 0) tableContent += `<td>${timeStats1.percentBelow}%</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${timeStats2.percentBelow}%</td>`;
    tableContent += '</tr>';

    tableContent += `<tr><td>Over ${timeLine} min</td>`;
    if (selectedChamps1.length > 0) tableContent += `<td>${timeStats1.percentAbove}%</td>`;
    if (selectedChamps2.length > 0) tableContent += `<td>${timeStats2.percentAbove}%</td>`;
    tableContent += '</tr>';

    tableContent += '</table>';

    return tableContent;
}

// Função para gerar link para champ_games.html
function generateChampGamesLink(champs1, lanes1, champs2 = [], lanes2 = []) {
    const urlParams = new URLSearchParams();
    
    champs1.forEach((champ, index) => {
        if (champ) {
            const i = index + 1;
            urlParams.append(`champ1_${i}`, encodeURIComponent(champ));
            if (lanes1[index]) urlParams.append(`lane1_${i}`, lanes1[index]);
        }
    });

    champs2.forEach((champ, index) => {
        if (champ) {
            const i = index + 1;
            urlParams.append(`champ2_${i}`, encodeURIComponent(champ));
            if (lanes2[index]) urlParams.append(`lane2_${i}`, lanes2[index]);
        }
    });

    const patch = document.getElementById('patch-filter').value || '';
    if (patch) urlParams.append('patch', patch);

    const year = document.getElementById('year-filter').value || '';
    if (year) urlParams.append('year', year);

    const league = document.getElementById('league-filter').value || '';
    if (league) urlParams.append('league', league);

    const recentGames = document.getElementById('recent-games').value || '';
    if (recentGames) urlParams.append('recentGames', recentGames);

    if (isConfrontoDireto && champs2.length > 0) {
        urlParams.append('confrontoDireto', 'true');
    }

    return `champ_games.html?${urlParams.toString()}`;
}

// Função para gerar título dinâmico com links
function gerarTitulo(selectedChamps1, selectedChamps2, patchFilter, yearFilter, recentGames, leagueFilter, isConfrontoDireto) {
    const h2 = document.createElement('h2');

    if (selectedChamps1.length === 0 && selectedChamps2.length === 0) {
        h2.appendChild(document.createTextNode('Estatísticas de Campeões'));
    } else {
        if (isConfrontoDireto && selectedChamps1.length > 0 && selectedChamps2.length > 0) {
            // Gerar um único link para o confronto direto
            const champs1Text = selectedChamps1.map(c => c.name).join(' & ');
            const champs2Text = selectedChamps2.map(c => c.name).join(' & ');
            const link = document.createElement('a');
            link.href = generateChampGamesLink(
                selectedChamps1.map(c => c.name),
                selectedChamps1.map(c => c.lane),
                selectedChamps2.map(c => c.name),
                selectedChamps2.map(c => c.lane)
            );
            link.target = '_blank';
            link.textContent = `Partidas de ${champs1Text} vs ${champs2Text}`;
            link.className = 'confronto-link';
            h2.appendChild(link);
        } else {
            // Links individuais para cada time
            if (selectedChamps1.length > 0) {
                const team1Text = selectedChamps1.length > 1 ? `(${selectedChamps1.map(c => c.name).join(' & ')})` : selectedChamps1[0].name;
                const link1 = document.createElement('a');
                link1.href = generateChampGamesLink(selectedChamps1.map(c => c.name), selectedChamps1.map(c => c.lane));
                link1.target = '_blank';
                link1.textContent = team1Text;
                link1.className = 'champ-link';
                h2.appendChild(link1);
            }

            if (selectedChamps2.length > 0) {
                const team2Text = selectedChamps2.length > 1 ? `(${selectedChamps2.map(c => c.name).join(' & ')})` : selectedChamps2[0].name;
                h2.appendChild(document.createTextNode(selectedChamps1.length > 0 ? ' | ' : ''));
                const link2 = document.createElement('a');
                link2.href = generateChampGamesLink([], [], selectedChamps2.map(c => c.name), selectedChamps2.map(c => c.lane));
                link2.target = '_blank';
                link2.textContent = team2Text;
                link2.className = 'champ-link';
                h2.appendChild(link2);
            }
        }
    }

    // Adicionar filtros ao título
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

// Função para obter os melhores campeões do meta
function getBestChampsMeta() {
    // Filtrar por Tier 1 e últimos 200 jogos
    let metaData = df.filter(row => TIER1_LEAGUES.includes(row.league))
                     .sort((a, b) => new Date(b.date) - new Date(a.date))
                     .slice(0, 200);

    const lanes = [
        { col: 'team_top', name: 'Top' },
        { col: 'team_jng', name: 'Jng' },
        { col: 'team_mid', name: 'Mid' },
        { col: 'team_bot', name: 'Bot' },
        { col: 'team_sup', name: 'Sup' }
    ];

    const bestChamps = {};

    lanes.forEach(lane => {
        // Contar ocorrências e vitórias por campeão
        const champStats = {};
        metaData.forEach(row => {
            const champ = row[lane.col];
            if (champ && champ.trim() !== '') {
                if (!champStats[champ]) {
                    champStats[champ] = { occurrences: 0, wins: 0 };
                }
                champStats[champ].occurrences += 1;
                if (parseInt(row.result) === 1) {
                    champStats[champ].wins += 1;
                }
            }
        });

        // Calcular win rate, filtrar >= 15 jogos e ordenar
        const champList = Object.keys(champStats).map(champ => ({
            name: champ,
            occurrences: champStats[champ].occurrences,
            winRate: champStats[champ].occurrences > 0 ? (champStats[champ].wins / champStats[champ].occurrences * 100).toFixed(2) : 0
        })).filter(champ => champ.occurrences >= 15);

        // Ordenar por win rate (desc) e ocorrências (desc)
        champList.sort((a, b) => {
            if (b.winRate !== a.winRate) {
                return b.winRate - a.winRate;
            }
            return b.occurrences - a.occurrences;
        });

        // Pegar os 4 primeiros
        bestChamps[lane.name] = champList.slice(0, 4);
    });

    return bestChamps;
}

// Função para exibir os melhores campeões do meta
function displayBestChampsMeta() {
    const bestChamps = getBestChampsMeta();
    const container = document.getElementById('best-champs-meta');
    container.innerHTML = '<h3>Melhores Campeões do Meta Tier 1</h3>';

    const laneOrder = ['Top', 'Jng', 'Mid', 'Bot', 'Sup'];
    laneOrder.forEach(lane => {
        const laneSection = document.createElement('div');
        laneSection.className = 'lane-section';
        
        const champList = document.createElement('div');
        champList.className = 'champ-list';

        bestChamps[lane].forEach(champ => {
            const champBlock = document.createElement('div');
            champBlock.className = 'champ-block';
            const cleanName = getCleanChampionName(champ.name);
            champBlock.innerHTML = `
                <div class="win-rate">${champ.winRate}%</div>
                <img src="https://gol.gg/_img/champions_icon/${cleanName}.png" alt="${champ.name}">
                <div class="occurrences">${champ.occurrences} jogos</div>
            `;
            champList.appendChild(champBlock);
        });

        laneSection.appendChild(champList);
        container.appendChild(laneSection);
    });
}

// Função para Stats Individual
function generateStats() {
    isConfrontoDireto = false; // Desativar modo Confronto Direto
    const champs1 = ['champ1_1', 'champ1_2', 'champ1_3'];
    const champs2 = ['champ2_1', 'champ2_2', 'champ2_3'];
    const lanes1 = ['lane1_1', 'lane1_2', 'lane1_3'];
    const lanes2 = ['lane2_1', 'lane2_2', 'lane2_3'];
    const patchFilter = document.getElementById('patch-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const leagueFilter = document.getElementById('league-filter').value;
    const killLine = parseFloat(document.getElementById('kill-line').value) || 19.5;
    const timeLine = parseInt(document.getElementById('time-line').value) || 26;

    const selectedChamps1 = champs1.filter(id => document.getElementById(id).value).map(id => ({
        name: document.getElementById(id).value,
        lane: document.getElementById(lanes1[champs1.indexOf(id)]).value
    }));
    const selectedChamps2 = champs2.filter(id => document.getElementById(id).value).map(id => ({
        name: document.getElementById(id).value,
        lane: document.getElementById(lanes2[champs2.indexOf(id)]).value
    }));

    if (selectedChamps1.length === 0 && selectedChamps2.length === 0) {
        alert('Selecione pelo menos um campeão!');
        document.getElementById('champ-stats-table').innerHTML = '';
        displayBestChampsMeta();
        return;
    }

    // Aplicar para Stats Individual
    let filteredData = df;

    // Filtro por ano
    if (yearFilter !== '') {
        filteredData = filteredData.filter(row => {
            if (!row.date) return false;
            const date = new Date(row.date);
            const year = date.getFullYear();
            return !isNaN(year) && year === parseInt(yearFilter);
        });
    }

    // Filtro por patch
    if (patchFilter !== '') {
        filteredData = filteredData.filter(row => row.patch === patchFilter);
    }

    // Filtro para liga
    if (leagueFilter !== '') {
        if (leagueFilter === 'tier1') {
            filteredData = filteredData.filter(row => TIER1_LEAGUES.includes(row.league));
        } else {
            filteredData = filteredData.filter(row => row.league === leagueFilter);
        }
    }

    let filteredData1 = filteredData;
    let filteredData2 = filteredData;

    if (selectedChamps1.length > 0) {
        filteredData1 = filteredData.filter(row => {
            return selectedChamps1.every(champ => {
                const laneCol = champ.lane ? `team_${champ.lane}` : ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'].find(col => row[col] === champ.name);
                return laneCol && row[laneCol] === champ.name;
            });
        });
    }

    if (selectedChamps2.length > 0) {
        filteredData2 = filteredData.filter(row => {
            return selectedChamps2.every(champ => {
                const laneCol = champ.lane ? `adversa_${champ.lane}` : ['adversa_top', 'adversa_jng', 'adversa_mid', 'adversa_bot', 'adversa_sup'].find(col => row[col] === champ.name);
                return laneCol && row[laneCol] === champ.name;
            });
        });
    }

    // Filtro para jogos recentes
    if (recentGames !== '') {
        if (filteredData1.length > 0) {
            filteredData1 = filteredData1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        }
        if (filteredData2.length > 0) {
            filteredData2 = filteredData2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        }
    }

    const medias1 = selectedChamps1.length > 0 ? calcularMedias(filteredData1, false) : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0 };
    const medias2 = selectedChamps2.length > 0 ? calcularMedias(filteredData2, true) : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0 };
    const killStats1 = selectedChamps1.length > 0 ? calcularKillStats(filteredData1, killLine) : { percentBelow: 0, percentAbove: 0 };
    const killStats2 = selectedChamps2.length > 0 ? calcularKillStats(filteredData2, killLine) : { percentBelow: 0, percentAbove: 0 };
    const timeStats1 = selectedChamps1.length > 0 ? calcularTimeStats(filteredData1, timeLine) : { percentBelow: 0, percentAbove: 0 };
    const timeStats2 = selectedChamps2.length > 0 ? calcularTimeStats(filteredData2, timeLine) : { percentBelow: 0, percentAbove: 0 };

    const tableContent = gerarTabela(medias1, medias2, killStats1, killStats2, timeStats1, timeStats2, selectedChamps1, selectedChamps2, killLine, timeLine);

    const resultado = document.getElementById('champ-stats-table');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(selectedChamps1, selectedChamps2, patchFilter, yearFilter, recentGames, leagueFilter, isConfrontoDireto);
    resultado.appendChild(h2);
    resultado.insertAdjacentHTML('beforeend', tableContent);

    // Exibir melhores campeões do meta
    displayBestChampsMeta();
}

// Função para Confronto Direto
function confrontoDireto() {
    isConfrontoDireto = true; // Ativar modo Confronto Direto
    const champs1 = ['champ1_1', 'champ1_2', 'champ1_3'];
    const champs2 = ['champ2_1', 'champ2_2', 'champ2_3'];
    const lanes1 = ['lane1_1', 'lane1_2', 'lane1_3'];
    const lanes2 = ['lane2_1', 'lane2_2', 'lane2_3'];
    const patchFilter = document.getElementById('patch-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const leagueFilter = document.getElementById('league-filter').value;
    const killLine = parseFloat(document.getElementById('kill-line').value) || 19.5;
    const timeLine = parseInt(document.getElementById('time-line').value) || 26;

    const selectedChamps1 = champs1.filter(id => document.getElementById(id).value).map(id => ({
        name: document.getElementById(id).value,
        lane: document.getElementById(lanes1[champs1.indexOf(id)]).value
    }));
    const selectedChamps2 = champs2.filter(id => document.getElementById(id).value).map(id => ({
        name: document.getElementById(id).value,
        lane: document.getElementById(lanes2[champs2.indexOf(id)]).value
    }));

    if (selectedChamps1.length === 0 || selectedChamps2.length === 0) {
        alert('Selecione pelo menos um campeão de cada time para o Confronto Direto!');
        document.getElementById('champ-stats-table').innerHTML = '';
        displayBestChampsMeta();
        return;
    }

    // Aplicar filtros
    let filteredData = df;

    // Filtro por ano
    if (yearFilter !== '') {
        filteredData = filteredData.filter(row => {
            if (!row.date) return false;
            const date = new Date(row.date);
            const year = date.getFullYear();
            return !isNaN(year) && year === parseInt(yearFilter);
        });
    }

    // Filtro para patch
    if (patchFilter !== '') {
        filteredData = filteredData.filter(row => row.patch === patchFilter);
    }

    // Filtro para liga
    if (leagueFilter !== '') {
        if (leagueFilter === 'tier1') {
            filteredData = filteredData.filter(row => TIER1_LEAGUES.includes(row.league));
        } else {
            filteredData = filteredData.filter(row => row.league === leagueFilter);
        }
    }

    // Filtro para confronto direto
    filteredData = filteredData.filter(row => {
        return selectedChamps1.every(champ => {
            const laneCol = champ.lane ? `team_${champ.lane}` : ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'].find(col => row[col] === champ.name);
            return laneCol && row[laneCol] === champ.name;
        }) && 
        selectedChamps2.every(champ => {
            const laneCol = champ.lane ? `adversa_${champ.lane}` : ['adversa_top', 'adversa_jng', 'adversa_mid', 'adversa_bot', 'adversa_sup'].find(col => row[col] === champ.name);
            return laneCol && row[laneCol] === champ.name;
        });
    });

    // Filtro por jogos recentes
    if (recentGames !== '') {
        filteredData = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    const medias1 = filteredData.length > 0 ? calcularMedias(filteredData, false) : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0 };
    const medias2 = filteredData.length > 0 ? {
        'Jogos': filteredData.length,
        'Vitórias': filteredData.length - medias1.Vitórias,
        'Vitórias (%)': filteredData.length > 0 ? ((filteredData.length - medias1.Vitórias) / filteredData.length * 100).toFixed(2) : 0
    } : { 'Jogos': 0, 'Vitórias': 0, 'Vitórias (%)': 0 };
    const killStats1 = filteredData.length > 0 ? calcularKillStats(filteredData, killLine) : { percentBelow: 0, percentAbove: 0 };
    const killStats2 = killStats1;
    const timeStats1 = filteredData.length > 0 ? calcularTimeStats(filteredData, timeLine) : { percentBelow: 0, percentAbove: 0 };
    const timeStats2 = timeStats1;

    const tableContent = gerarTabela(medias1, medias2, killStats1, killStats2, timeStats1, timeStats2, selectedChamps1, selectedChamps2, killLine, timeLine);

    const resultado = document.getElementById('champ-stats-table');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(selectedChamps1, selectedChamps2, patchFilter, yearFilter, recentGames, leagueFilter, true);
    resultado.appendChild(h2);
    resultado.insertAdjacentHTML('beforeend', tableContent);

    // Exibir melhores campeões do meta
    displayBestChampsMeta();
}

// Iniciar o carregamento do CSV quando a página carrega
window.onload = loadCSV;