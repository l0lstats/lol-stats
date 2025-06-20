let df = null;

function loadCSV() {
    Papa.parse('BaseDadosPlayer.csv', {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data;
            // Filtrar linhas com dados válidos
            df = df.filter(row => row.playername && row.playername.trim() !== '');
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

    // Extrair players1
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
        confrontoDireto: params.get('confrontoDireto') === 'true',
        champion: params.get('champion') ? decodeURIComponent(params.get('champion')) : ''
    };
}

function filterGames() {
    if (!df) {
        console.error('Dados não carregados!');
        return;
    }

    const { players1, players2, year, leagueFilter, confrontoDireto, champion } = getQueryParams();

    let filteredData = df;

    // Aplicar filtros
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

    if (champion !== '') {
        filteredData = filteredData.filter(row => row.champion === champion);
    }

    // Filtrar por jogadores
    filteredData = filteredData.filter(row => {
        let effectivePlayers1 = confrontoDireto ? players1 : [...players1, ...players2];
        let effectivePlayers2 = confrontoDireto ? players2 : [];

        const playerMatch = effectivePlayers1.includes(row.playername);

        if (confrontoDireto && effectivePlayers2.length > 0) {
            const lane = row.position?.toLowerCase();
            const adversaCol = `adversa_player_${lane}`;
            return playerMatch && effectivePlayers2.includes(row[adversaCol]);
        }

        return playerMatch;
    });

    // Gerar tabela
    let tableContent = '<table>';
    tableContent += '<thead><tr>';
    tableContent += '<th>Data</th>';
    tableContent += '<th>Liga</th>';
    tableContent += '<th>Time</th>';
    tableContent += '<th>Posição</th>';
    tableContent += '<th>Jogador</th>';
    tableContent += '<th>Campeão</th>';
    tableContent += '<th>Vitória</th>';
    tableContent += '<th>Kills</th>';
    tableContent += '<th>Deaths</th>';
    tableContent += '<th>Assists</th>';
    tableContent += '<th>Jogador Adversário</th>';
    tableContent += '<th>Time Adversário</th>';
    tableContent += '</tr></thead>';

    tableContent += '<tbody>';

    filteredData.forEach(row => {
        const lane = row.position?.toLowerCase();
        const adversaCol = `adversa_player_${lane}`;
        tableContent += '<tr>';
        tableContent += `<td>${row.date || ''}</td>`;
        tableContent += `<td>${row.league || ''}</td>`;
        tableContent += `<td>${row.teamname || ''}</td>`;
        tableContent += `<td>${row.position || ''}</td>`;
        tableContent += `<td>${row.playername || ''}</td>`;
        tableContent += `<td>${row.champion || ''}</td>`;
        tableContent += `<td>${row.result || ''}</td>`;
        tableContent += `<td>${row.kills || ''}</td>`;
        tableContent += `<td>${row.deaths || ''}</td>`;
        tableContent += `<td>${row.assists || ''}</td>`;
        tableContent += `<td>${row[adversaCol] || ''}</td>`;
        tableContent += `<td>${row.adversa_team || ''}</td>`;
        tableContent += '</tr>';
    });

    tableContent += '</tbody></table>';

    const resultado = document.getElementById('games-table');
    resultado.innerHTML = '';

    // Gerar título e inseri-lo no .title-wrapper
    const titleWrapper = document.querySelector('.title-wrapper');
    if (titleWrapper) {
        titleWrapper.innerHTML = '';
        const h2 = document.createElement('h2');
        let titleText = '';
        if (players1.length > 0 || players2.length > 0) {
            if (confrontoDireto && players1.length > 0 && players2.length > 0) {
                titleText = `${players1[0]} vs ${players2[0]}`;
            } else if (players1.length > 0) {
                titleText = players1[0]; // Usar apenas o primeiro jogador de players1
            } else if (players2.length > 0) {
                titleText = players2[0]; // Usar apenas o primeiro jogador de players2
            }
            if (champion !== '') titleText += ` (${champion})`;
        } else {
            titleText = 'Jogos Selecionados';
        }

        if (year !== '') titleText += ` (${year})`;
        if (leagueFilter !== '') titleText += ` (${leagueFilter})`;

        h2.textContent = titleText;
        titleWrapper.appendChild(h2);
    }

    // Inserir tabela
    resultado.insertAdjacentHTML('beforeend', tableContent);
}

function downloadCSV() {
    if (!df) {
        alert('Dados não carregados!');
        return;
    }

    const { players1, players2, year, leagueFilter, confrontoDireto, champion } = getQueryParams();
    let filteredData = df;

    // Aplicar os mesmos filtros usados em filterGames
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

    if (champion !== '') {
        filteredData = filteredData.filter(row => row.champion === champion);
    }

    filteredData = filteredData.filter(row => {
        let effectivePlayers1 = confrontoDireto ? players1 : [...players1, ...players2];
        let effectivePlayers2 = confrontoDireto ? players2 : [];

        const playerMatch = effectivePlayers1.includes(row.playername);

        if (confrontoDireto && effectivePlayers2.length > 0) {
            const lane = row.position?.toLowerCase();
            const adversaCol = `adversa_player_${lane}`;
            return playerMatch && effectivePlayers2.includes(row[adversaCol]);
        }

        return playerMatch;
    });

    // Definir os nomes das colunas conforme exibidos na tabela
    const columnOrder = [
        { display: 'Data', original: 'date' },
        { display: 'Liga', original: 'league' },
        { display: 'Time', original: 'teamname' },
        { display: 'Posição', original: 'position' },
        { display: 'Jogador', original: 'playername' },
        { display: 'Campeão', original: 'champion' },
        { display: 'Vitória', original: 'result' },
        { display: 'Kills', original: 'kills' },
        { display: 'Deaths', original: 'deaths' },
        { display: 'Assists', original: 'assists' },
        { display: 'Jogador Adversário', original: null },
        { display: 'Time Adversário', original: 'adversa_team' }
    ];

    // Transformar dados para corresponder aos nomes e ordem das colunas da tabela
    const transformedData = filteredData.map(row => {
        const newRow = {};
        const lane = row.position?.toLowerCase();
        const adversaCol = `adversa_player_${lane}`;
        columnOrder.forEach(col => {
            if (col.display === 'Jogador Adversário') {
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
            fileName = players1[0]; // Usar apenas o primeiro jogador de players1
        } else if (players2.length > 0) {
            fileName = players2[0]; // Usar apenas o primeiro jogador de players2
        }
        if (champion !== '') fileName += `_${champion}`;
    } else {
        fileName = 'Jogos_Selecionados';
    }

    if (year !== '') fileName += `_${year}`;
    if (leagueFilter !== '') fileName += `_${leagueFilter}`;

    fileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_') + '.csv';

    // Criar blob e iniciar download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);s
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.onload = loadCSV;