let df = null;

function loadCSV() {
    Papa.parse('BaseDadosChamp.csv', {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data;
            // Filtrar linhas com dados válidos
            df = df.filter(row => {
                const teamCols = ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'];
                const adversaCols = ['adversa_top', 'adversa_jng', 'adversa_mid', 'adversa_bot', 'adversa_sup'];
                const allCols = [...teamCols, ...adversaCols];
                return allCols.every(col => row[col] && row[col].trim() !== '');
            });
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
    const champs1 = [];
    const lanes1 = [];
    const champs2 = [];
    const lanes2 = [];
    let i = 1;

    // Extrair champs1 e lanes1
    while (params.has(`champ1_${i}`)) {
        champs1.push(decodeURIComponent(params.get(`champ1_${i}`)));
        lanes1.push(params.get(`lane1_${i}`) || '');
        i++;
    }

    i = 1;
    while (params.has(`champ2_${i}`)) {
        champs2.push(decodeURIComponent(params.get(`champ2_${i}`)));
        lanes2.push(params.get(`lane2_${i}`) || '');
        i++;
    }

    return {
        champs1,
        champs2,
        lanes1,
        lanes2,
        patch: params.get('patch') || '',
        year: params.get('year') || '',
        leagueFilter: params.get('league') || '',
        recentGames: params.get('recentGames') || '',
        confrontoDireto: params.get('confrontoDireto') === 'true'
    };
}

function filterGames() {
    if (!df) {
        console.error('Dados não carregados!');
        return;
    }

    const { champs1, champs2, lanes1, lanes2, patch, year, leagueFilter, recentGames, confrontoDireto } = getQueryParams();

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

    if (patch !== '') {
        filteredData = filteredData.filter(row => row.patch === patch);
    }

    if (leagueFilter !== '') {
        if (leagueFilter === 'tier1') {
            const TIER1_LEAGUES = ['LCK', 'LPL', 'LEC', 'LCS', 'LTA', 'LTA N', 'WLDS', 'MSI', 'EWC', 'LCP'];
            filteredData = filteredData.filter(row => TIER1_LEAGUES.includes(row.league));
        } else {
            filteredData = filteredData.filter(row => row.league === leagueFilter);
        }
    }

    // Filtrar por campeões
    filteredData = filteredData.filter(row => {
        let effectiveChamps1 = confrontoDireto ? champs1 : [...champs1, ...champs2];
        let effectiveLanes1 = confrontoDireto ? lanes1 : [...lanes1, ...lanes2];
        let effectiveChamps2 = confrontoDireto ? champs2 : [];
        let effectiveLanes2 = confrontoDireto ? lanes2 : [];

        const teamMatch = effectiveChamps1.every((champ, index) => {
            const lane = effectiveLanes1[index] || '';
            const laneCol = lane ? `team_${lane}` : ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'].find(col => row[col] === champ);
            return laneCol && row[laneCol] === champ;
        });

        const adversaMatch = effectiveChamps2.every((champ, index) => {
            const lane = effectiveLanes2[index] || '';
            const laneCol = lane ? `adversa_${lane}` : ['adversa_top', 'adversa_jng', 'adversa_mid', 'adversa_bot', 'adversa_sup'].find(col => row[col] === champ);
            return laneCol && row[laneCol] === champ;
        });

        return teamMatch && adversaMatch;
    });

    // Ordenar por data em ordem decrescente (jogos mais recentes primeiro)
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filtro por jogos recentes (limita o número de jogos após a ordenação)
    if (recentGames !== '') {
        filteredData = filteredData.slice(0, parseInt(recentGames));
    }

    // Gerar tabela
    let tableContent = '<table>';
    tableContent += '<thead><tr>';
    tableContent += '<th>Patch</th>';
    tableContent += '<th>Data</th>';
    tableContent += '<th>Liga</th>';
    tableContent += '<th>Time</th>';
    tableContent += '<th>Vitória</th>';
    tableContent += '<th>Top</th>';
    tableContent += '<th>Jng</th>';
    tableContent += '<th>Mid</th>';
    tableContent += '<th>Bot</th>';
    tableContent += '<th>Sup</th>';
    tableContent += '<th>Adversário</th>';
    tableContent += '<th>Top adv</th>';
    tableContent += '<th>Jng adv</th>';
    tableContent += '<th>Mid adv</th>';
    tableContent += '<th>Bot adv</th>';
    tableContent += '<th>Sup adv</th>';
    tableContent += '<th>Kills</th>';
    tableContent += '<th>Tempo(min)</th>';
    tableContent += '</tr></thead>';

    tableContent += '<tbody>';

    filteredData.forEach(row => {
        tableContent += '<tr>';
        tableContent += `<td>${row.patch || ''}</td>`;
        tableContent += `<td>${row.date || ''}</td>`;
        tableContent += `<td>${row.league || ''}</td>`;
        tableContent += `<td>${row.teamname || ''}</td>`;
        tableContent += `<td>${row.result || ''}</td>`;
        tableContent += `<td>${row.team_top || ''}</td>`;
        tableContent += `<td>${row.team_jng || ''}</td>`;
        tableContent += `<td>${row.team_mid || ''}</td>`;
        tableContent += `<td>${row.team_bot || ''}</td>`;
        tableContent += `<td>${row.team_sup || ''}</td>`;
        tableContent += `<td>${row.adversa_team || ''}</td>`;
        tableContent += `<td>${row.adversa_top || ''}</td>`;
        tableContent += `<td>${row.adversa_jng || ''}</td>`;
        tableContent += `<td>${row.adversa_mid || ''}</td>`;
        tableContent += `<td>${row.adversa_bot || ''}</td>`;
        tableContent += `<td>${row.adversa_sup || ''}</td>`;
        tableContent += `<td>${row.totalKills || ''}</td>`;
        tableContent += `<td>${row.gamelength || ''}</td>`;
        tableContent += '</tr>';
    });

    tableContent += '</tbody></table>';

    const resultado = document.getElementById('games-table');
    resultado.innerHTML = '';

    // Gerar título e inseri-lo no .title-wrapper
    const titleWrapper = document.querySelector('.title-wrapper');
    if (titleWrapper) {
        titleWrapper.innerHTML = ''; // Limpar conteúdo anterior
        const h2 = document.createElement('h2');
        let titleText = '';
        if (champs1.length > 0 || champs2.length > 0) {
            if (confrontoDireto) {
                const team1Text = champs1.length > 0 ? champs1.join(' & ') : '';
                const team2Text = champs2.length > 0 ? champs2.join(' & ') : '';
                titleText = team1Text && team2Text ? `${team1Text} vs ${team2Text}` : team1Text || team2Text;
            } else {
                titleText = [...champs1, ...champs2].join(' & ');
            }
        } else {
            titleText = 'Jogos Selecionados';
        }

        if (patch !== '') titleText += ` (Patch ${patch})`;
        if (year !== '') titleText += ` (${year})`;
        if (leagueFilter !== '' && leagueFilter !== 'tier1') titleText += ` (${leagueFilter})`;
        if (leagueFilter === 'tier1') titleText += ` (Campeonatos Tier 1)`;
        if (recentGames !== '') titleText += ` (Últimos ${recentGames} jogos)`;

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

    const { champs1, champs2, lanes1, lanes2, patch, year, leagueFilter, recentGames, confrontoDireto } = getQueryParams();
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

    if (patch !== '') {
        filteredData = filteredData.filter(row => row.patch === patch);
    }

    if (leagueFilter !== '') {
        if (leagueFilter === 'tier1') {
            const TIER1_LEAGUES = ['LCK', 'LPL', 'LEC', 'LCS', 'LTA', 'LTA N', 'WLDS', 'MSI', 'EWC', 'LCP'];
            filteredData = filteredData.filter(row => TIER1_LEAGUES.includes(row.league));
        } else {
            filteredData = filteredData.filter(row => row.league === leagueFilter);
        }
    }

    filteredData = filteredData.filter(row => {
        let effectiveChamps1 = confrontoDireto ? champs1 : [...champs1, ...champs2];
        let effectiveLanes1 = confrontoDireto ? lanes1 : [...lanes1, ...lanes2];
        let effectiveChamps2 = confrontoDireto ? champs2 : [];
        let effectiveLanes2 = confrontoDireto ? lanes2 : [];

        const teamMatch = effectiveChamps1.every((champ, index) => {
            const lane = effectiveLanes1[index] || '';
            const laneCol = lane ? `team_${lane}` : ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'].find(col => row[col] === champ);
            return laneCol && row[laneCol] === champ;
        });

        const adversaMatch = effectiveChamps2.every((champ, index) => {
            const lane = effectiveLanes2[index] || '';
            const laneCol = lane ? `adversa_${lane}` : ['adversa_top', 'adversa_jng', 'adversa_mid', 'adversa_bot', 'adversa_sup'].find(col => row[col] === champ);
            return laneCol && row[laneCol] === champ;
        });

        return teamMatch && adversaMatch;
    });

    // Ordenar por data em ordem decrescente (jogos mais recentes primeiro)
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filtro por jogos recentes (limita o número de jogos após a ordenação)
    if (recentGames !== '') {
        filteredData = filteredData.slice(0, parseInt(recentGames));
    }

    // Definir os nomes das colunas conforme exibidos na tabela
    const columnOrder = [
        { display: 'Patch', original: 'patch' },
        { display: 'Data', original: 'date' },
        { display: 'Liga', original: 'league' },
        { display: 'Time', original: 'teamname' },
        { display: 'Vitória', original: 'result' },
        { display: 'Top', original: 'team_top' },
        { display: 'Jng', original: 'team_jng' },
        { display: 'Mid', original: 'team_mid' },
        { display: 'Bot', original: 'team_bot' },
        { display: 'Sup', original: 'team_sup' },
        { display: 'Adversário', original: 'adversa_team' },
        { display: 'Top adv', original: 'adversa_top' },
        { display: 'Jng adv', original: 'adversa_jng' },
        { display: 'Mid adv', original: 'adversa_mid' },
        { display: 'Bot adv', original: 'adversa_bot' },
        { display: 'Sup adv', original: 'adversa_sup' },
        { display: 'Kills', original: 'totalKills' },
        { display: 'Tempo(min)', original: 'gamelength' }
    ];

    // Transformar dados para corresponder aos nomes e ordem das colunas da tabela
    const transformedData = filteredData.map(row => {
        const newRow = {};
        columnOrder.forEach(col => {
            newRow[col.display] = row[col.original] || '';
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
    if (champs1.length > 0 || champs2.length > 0) {
        if (confrontoDireto) {
            const team1Text = champs1.length > 0 ? champs1.join('_') : '';
            const team2Text = champs2.length > 0 ? champs2.join('_') : '';
            fileName = team1Text && team2Text ? `${team1Text}_vs_${team2Text}` : team1Text || team2Text;
        } else {
            fileName = [...champs1, ...champs2].join('_');
        }
    } else {
        fileName = 'Jogos_Selecionados';
    }

    if (patch !== '') fileName += `_Patch_${patch}`;
    if (year !== '') fileName += `_${year}`;
    if (leagueFilter !== '' && leagueFilter !== 'tier1') fileName += `_${leagueFilter}`;
    if (leagueFilter === 'tier1') fileName += `_Tier1`;
    if (recentGames !== '') fileName += `_Ultimos_${recentGames}_jogos`;

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