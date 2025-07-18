let df = null;

function loadCSV() {
    Papa.parse('BaseDadosPlayer.csv', {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data;
            df = df.filter(row => row.playername && row.playername.trim() !== '' && row.date && !isNaN(new Date(row.date).getTime())); // Garante datas válidas
            console.log('CSV carregado, primeiros 5:', df.slice(0, 5));
            filterGames();
        },
        error: function(error) {
            console.error('Erro ao carregar CSV:', error);
            alert('Erro ao carregar os dados! Verifique se o arquivo está disponível.');
            document.getElementById('games-table').innerHTML = '';
        }
    });
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const players1 = [];
    const players2 = [];
    let i = 1;

    while (params.has(`player1_${i}`)) {
        players1.push(decodeURIComponent(params.get(`player1_${i}`)));
        i++;
    }

    i = 1;
    while (params.has(`player2_${i}`)) {
        players2.push(decodeURIComponent(params.get(`player2_${i}`)));
        i++;
    }

    return {
        players1,
        players2,
        year: params.get('year') || '',
        leagueFilter: params.get('league') || '',
        result: params.get('result') || '',
        recentGames: params.get('recentGames') || '', // Adicionado suporte ao filtro recentGames
        confrontoDireto: params.get('confrontoDireto') === 'true',
        champion: params.get('champion') ? decodeURIComponent(params.get('champion')) : ''
    };
}

function getPlayerLane(playerName, data) {
    const positions = data.filter(row => row.playername && row.position && row.playername === playerName)
        .map(row => row.position.toLowerCase());
    if (positions.length === 0) return '';
    const positionCount = {};
    positions.forEach(pos => {
        positionCount[pos] = (positionCount[pos] || 0) + 1;
    });
    return Object.keys(positionCount).reduce((a, b) => positionCount[a] > positionCount[b] ? a : b, '');
}

function filterGames() {
    if (!df) {
        console.error('Dados não carregados!');
        return;
    }

    const { players1, players2, year, leagueFilter, result, recentGames, confrontoDireto, champion } = getQueryParams();

    let filteredData = df;

    // Aplicar filtros de ano, liga e resultado antes da filtragem por jogadores
    if (year !== '') {
        filteredData = filteredData.filter(row => {
            if (!row.date) return false;
            const date = new Date(row.date);
            const rowYear = date.getFullYear();
            return !isNaN(rowYear) && rowYear === parseInt(year);
        });
    }

    if (leagueFilter !== '') {
        filteredData = filteredData.filter(row => row.league === leagueFilter);
    }

    if (result !== '') {
        filteredData = filteredData.filter(row => row.result === result);
    }

    if (champion !== '') {
        filteredData = filteredData.filter(row => row.champion === champion);
    }

    // Determinar lanes dos jogadores
    const lane1 = players1.length > 0 ? getPlayerLane(players1[0], df) : '';
    const lane2 = players2.length > 0 ? getPlayerLane(players2[0], df) : '';

    // Filtrar por jogadores
    if (confrontoDireto && players1.length > 0 && players2.length > 0) {
        // Filtrar jogos onde player1 (ex.: Faker) está em playername e player2 (ex.: Canyon) está em adversa_player_{lane2}
        filteredData = filteredData.filter(row => {
            const adversaCol = `adversa_player_${lane2}`;
            return row.playername === players1[0] && row[adversaCol] === players2[0];
        });
    } else {
        // Stats Individual: filtrar apenas por jogadores em playername
        const effectivePlayers = [...players1, ...players2];
        filteredData = filteredData.filter(row => effectivePlayers.includes(row.playername));
    }

    // Ordenar por data em ordem decrescente e aplicar filtro de jogos recentes
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (recentGames && recentGames !== 'Todos os Jogos') {
        filteredData = filteredData.slice(0, parseInt(recentGames));
    }

    // Gerar título dinâmico
    let titleText = '';
    if (players1.length > 0 || players2.length > 0) {
        if (confrontoDireto && players1.length > 0 && players2.length > 0) {
            titleText = `${players1[0]} vs ${players2[0]}`;
        } else if (players1.length > 0) {
            titleText = players1[0];
        } else if (players2.length > 0) {
            titleText = players2[0];
        }
        if (champion !== '') titleText += ` (${champion})`;
    } else {
        titleText = 'Jogos Selecionados';
    }

    let filters = [];
    if (year !== '') filters.push(year);
    if (leagueFilter !== '') filters.push(leagueFilter);
    if (result === '1') filters.push('Vitórias');
    if (result === '0') filters.push('Derrotas');
    if (recentGames && recentGames !== 'Todos os Jogos') filters.push(`Últimos ${recentGames} jogos`);
    if (filters.length > 0) {
        titleText += ` (${filters.join(', ')})`;
    }

    // Atualizar título no header
    const headerTitle = document.getElementById('header-title');
    if (headerTitle) {
        headerTitle.textContent = titleText;
    }

    // Gerar tabela
    let tableContent = '<table>';
    tableContent += '<thead><tr>';
    tableContent += '<th>Data</th>';
    tableContent += '<th>Liga</th>';
    tableContent += '<th>Time</th>';
    tableContent += '<th>Lineup</th>';
    tableContent += '<th>Posição</th>';
    tableContent += '<th>Jogador</th>';
    tableContent += '<th>Vitória</th>';
    tableContent += '<th>Campeão</th>';
    tableContent += '<th>Kills</th>';
    tableContent += '<th>Deaths</th>';
    tableContent += '<th>Assists</th>';
    tableContent += '<th>Adversário</th>';
    tableContent += '<th>Time Adversário</th>';
    tableContent += '<th>Lineup Adv</th>';
    tableContent += '</tr></thead>';

    tableContent += '<tbody>';

    filteredData.forEach(row => {
        let adversaCol;
        if (confrontoDireto && players1.length > 0 && players2.length > 0) {
            // Modo Confronto Direto: usar a lane do adversário
            adversaCol = row.playername === players1[0] ? `adversa_player_${lane2}` : `adversa_player_${lane1}`;
        } else {
            // Modo Stats: usar a posição do jogador atual
            const position = row.position?.toLowerCase();
            adversaCol = position ? `adversa_player_${position}` : '';
        }

        tableContent += '<tr>';
        tableContent += `<td>${row.date || ''}</td>`;
        tableContent += `<td>${row.league || ''}</td>`;
        tableContent += `<td>${row.teamname || ''}</td>`;
        tableContent += `<td>${row.team_players || ''}</td>`;
        tableContent += `<td>${row.position || ''}</td>`;
        tableContent += `<td>${row.playername || ''}</td>`;
        tableContent += `<td>${row.result || ''}</td>`;
        tableContent += `<td>${row.champion || ''}</td>`;
        tableContent += `<td>${row.kills || ''}</td>`;
        tableContent += `<td>${row.deaths || ''}</td>`;
        tableContent += `<td>${row.assists || ''}</td>`;
        tableContent += `<td>${adversaCol ? row[adversaCol] || '' : ''}</td>`;
        tableContent += `<td>${row.adversa_team || ''}</td>`;
        tableContent += `<td>${row.adversa_players || ''}</td>`;
        tableContent += '</tr>';
    });

    tableContent += '</tbody></table>';

    const resultado = document.getElementById('games-table');
    resultado.innerHTML = tableContent;
}

function downloadCSV() {
    if (!df) {
        alert('Dados não carregados!');
        return;
    }

    const { players1, players2, year, leagueFilter, result, recentGames, confrontoDireto, champion } = getQueryParams();
    let filteredData = df;

    // Aplicar filtros de ano, liga e resultado antes da filtragem por jogadores
    if (year !== '') {
        filteredData = filteredData.filter(row => {
            if (!row.date) return false;
            const date = new Date(row.date);
            const rowYear = date.getFullYear();
            return !isNaN(rowYear) && rowYear === parseInt(year);
        });
    }

    if (leagueFilter !== '') {
        filteredData = filteredData.filter(row => row.league === leagueFilter);
    }

    if (result !== '') {
        filteredData = filteredData.filter(row => row.result === result);
    }

    if (champion !== '') {
        filteredData = filteredData.filter(row => row.champion === champion);
    }

    // Determinar lanes dos jogadores
    const lane1 = players1.length > 0 ? getPlayerLane(players1[0], df) : '';
    const lane2 = players2.length > 0 ? getPlayerLane(players2[0], df) : '';

    // Filtrar por jogadores
    if (confrontoDireto && players1.length > 0 && players2.length > 0) {
        filteredData = filteredData.filter(row => {
            const adversaCol = `adversa_player_${lane2}`;
            return row.playername === players1[0] && row[adversaCol] === players2[0];
        });
    } else {
        const effectivePlayers = [...players1, ...players2];
        filteredData = filteredData.filter(row => effectivePlayers.includes(row.playername));
    }

    // Ordenar por data em ordem decrescente e aplicar filtro de jogos recentes
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (recentGames && recentGames !== 'Todos os Jogos') {
        filteredData = filteredData.slice(0, parseInt(recentGames));
    }

    // Definir os nomes das colunas conforme exibidos na tabela
    const columnOrder = [
        { display: 'Data', original: 'date' },
        { display: 'Liga', original: 'league' },
        { display: 'Time', original: 'teamname' },
        { display: 'Lineup', original: 'team_players' },
        { display: 'Posição', original: 'position' },
        { display: 'Jogador', original: 'playername' },
        { display: 'Vitória', original: 'result' },
        { display: 'Campeão', original: 'champion' },
        { display: 'Kills', original: 'kills' },
        { display: 'Deaths', original: 'deaths' },
        { display: 'Assists', original: 'assists' },
        { display: 'Adversário', original: null },
        { display: 'Time Adversário', original: 'adversa_team' },
        { display: 'Lineup Adv', original: 'adversa_players' }
    ];

    // Transformar dados para corresponder aos nomes e ordem das colunas da tabela
    const transformedData = filteredData.map(row => {
        const newRow = {};
        const adversaCol = confrontoDireto && players2.length > 0
            ? (row.playername === players1[0] ? `adversa_player_${lane2}` : `adversa_player_${lane1}`)
            : `adversa_player_${row.position?.toLowerCase() || ''}`;
        columnOrder.forEach(col => {
            if (col.display === 'Adversário') {
                newRow[col.display] = row[adversaCol] || '';
            } else {
                newRow[col.display] = row[col.original] || '';
            }
        });
        return newRow;
    });

    // Converter para CSV usando Papa.unparse
    const csv = Papa.unparse(transformedData, {
        header: true,
        delimiter: ',',
        quotes: true,
        columns: columnOrder.map(col => col.display)
    });

    // Gerar nome do arquivo com base nos filtros
    let fileName = '';
    if (players1.length > 0 || players2.length > 0) {
        if (confrontoDireto && players1.length > 0 && players2.length > 0) {
            fileName = `${players1[0]}_vs_${players2[0]}`;
        } else if (players1.length > 0) {
            fileName = players1[0];
        } else if (players2.length > 0) {
            fileName = players2[0];
        }
        if (champion !== '') fileName += `_${champion}`;
    } else {
        fileName = 'Jogos Selecionados';
    }

    if (year !== '') fileName += `_${year}`;
    if (leagueFilter !== '') fileName += `_${leagueFilter}`;
    if (result === '1') fileName += '_Vitórias';
    if (result === '0') fileName += '_Derrotas';
    if (recentGames && recentGames !== 'Todos os Jogos') fileName += `_Ultimos_${recentGames}_Jogos`;

    fileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_') + '.csv';

    // Criar blob e iniciar download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.onload = loadCSV;