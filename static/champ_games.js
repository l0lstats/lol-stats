// Variável global para armazenar os dados do CSV
let df;

// Função para obter parâmetros da URL
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const champs1 = [];
    const lanes1 = [];
    const champs2 = [];
    const lanes2 = [];
    
    for (let i = 1; i <= 3; i++) {
        const champ1 = urlParams.get(`champ1_${i}`);
        const lane1 = urlParams.get(`lane1_${i}`);
        if (champ1) {
            champs1.push(decodeURIComponent(champ1));
            lanes1.push(lane1 || '');
        }
        const champ2 = urlParams.get(`champ2_${i}`);
        const lane2 = urlParams.get(`lane2_${i}`);
        if (champ2) {
            champs2.push(decodeURIComponent(champ2));
            lanes2.push(lane2 || '');
        }
    }

    return {
        champs1,
        lanes1,
        champs2,
        lanes2,
        patch: urlParams.get('patch') || '',
        year: urlParams.get('year') || '',
        league: urlParams.get('league') || '',
        recentGames: urlParams.get('recentGames') || '',
        confrontoDireto: urlParams.get('confrontoDireto') === 'true'
    };
}

// Função para carregar o CSV
function loadCSV() {
    Papa.parse('BaseDadosChamp.csv', {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data;
            console.log('CSV carregado, primeiros 5 registros:', df.slice(0, 5));
            displayChampData();
        },
        error: function(error) {
            console.error('Erro ao carregar CSV:', error);
            document.getElementById('champ-info').innerHTML = '<p>Erro ao carregar os dados! Verifique se o arquivo está disponível.</p>';
        }
    });
}

// Função para exportar a tabela para CSV
function exportToCSV(filteredData, title) {
    // Definir os cabeçalhos do CSV
    const headers = [
        'Data', 'Liga', 'Time', 'Resultado', 'Adversário',
        'Top', 'Jungle', 'Mid', 'Bot', 'Suporte',
        'adversa_Top', 'adversa_Jng', 'adversa_Mid', 'adversa_Bot', 'adversa_Sup'
    ];

    // Mapear os dados filtrados para corresponder aos cabeçalhos
    const csvData = filteredData.map(row => [
        row.date || '-',
        row.league || '-',
        row.teamname || '-',
        row.result || '-',
        row.adversa_team || '-',
        row.team_top || '-',
        row.team_jng || '-',
        row.team_mid || '-',
        row.team_bot || '-',
        row.team_sup || '-',
        row.adversa_top || '-',
        row.adversa_jng || '-',
        row.adversa_mid || '-',
        row.adversa_bot || '-',
        row.adversa_sup || '-'
    ]);

    // Converter para CSV usando PapaParse
    const csv = Papa.unparse({
        fields: headers,
        data: csvData
    });

    // Criar um blob com o conteúdo CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Criar um link temporário para download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Função para exibir os dados dos campeões
function displayChampData() {
    const params = getUrlParams();
    const champs1 = params.champs1;
    const lanes1 = params.lanes1;
    const champs2 = params.champs2;
    const lanes2 = params.lanes2;

    if (champs1.length === 0 && champs2.length === 0) {
        document.getElementById('champ-info').innerHTML = '<p>Nenhum campeão selecionado!</p>';
        return;
    }

    let filteredData = df;

    // Aplicar filtros gerais
    if (params.year) {
        filteredData = filteredData.filter(row => {
            if (!row.date) return false;
            const year = new Date(row.date).getFullYear().toString();
            return year === params.year;
        });
    }
    if (params.patch) {
        filteredData = filteredData.filter(row => row.patch === params.patch);
    }
    if (params.league) {
        if (params.league === 'tier1') {
            const TIER1_LEAGUES = ['LCK', 'LPL', 'LEC', 'LCS', 'LTA', 'LTA N', 'WLDS', 'MSI', 'EWC', 'LCP'];
            filteredData = filteredData.filter(row => TIER1_LEAGUES.includes(row.league));
        } else {
            filteredData = filteredData.filter(row => row.league === params.league);
        }
    }

    // Filtro por campeões do time 1
    if (champs1.length > 0) {
        filteredData = filteredData.filter(row => {
            return champs1.every((champ, index) => {
                const lane = lanes1[index];
                const laneCol = lane ? `team_${lane}` : ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'].find(col => row[col] === champ);
                return laneCol && row[laneCol] === champ;
            });
        });
    }

    // Filtro por campeões do time 2 (adversário)
    if (champs2.length > 0) {
        filteredData = filteredData.filter(row => {
            return champs2.every((champ, index) => {
                const lane = lanes2[index];
                const laneCol = lane ? `adversa_${lane}` : ['adversa_top', 'adversa_jng', 'adversa_mid', 'adversa_bot', 'adversa_sup'].find(col => row[col] === champ);
                return laneCol && row[laneCol] === champ;
            });
        });
    }

    // Aplicar lógica de Confronto Direto
    if (params.confrontoDireto && champs1.length > 0 && champs2.length > 0) {
        filteredData = filteredData.filter(row => {
            return champs1.every((champ, index) => {
                const lane = lanes1[index];
                const laneCol = lane ? `team_${lane}` : ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'].find(col => row[col] === champ);
                return laneCol && row[laneCol] === champ;
            }) && champs2.every((champ, index) => {
                const lane = lanes2[index];
                const laneCol = lane ? `adversa_${lane}` : ['adversa_top', 'adversa_jng', 'adversa_mid', 'adversa_bot', 'adversa_sup'].find(col => row[col] === champ);
                return laneCol && row[laneCol] === champ;
            });
        });
    }

    // Ordenar por data decrescente e aplicar recentGames
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (params.recentGames) {
        const recentLimit = parseInt(params.recentGames);
        if (!isNaN(recentLimit) && recentLimit > 0) {
            filteredData = filteredData.slice(0, recentLimit);
        }
    }

    if (filteredData.length === 0) {
        const champsText = [...champs1, ...champs2].join(' & ');
        document.getElementById('champ-info').innerHTML = `<p>Nenhuma partida encontrada para ${champsText} com os filtros aplicados!</p>`;
        return;
    }

    // Gerar título dinâmico
    let filters = [];
    if (params.year) filters.push(`${params.year}`);
    if (params.patch) filters.push(`Patch ${params.patch}`);
    if (params.league) filters.push(params.league === 'tier1' ? 'Campeonatos Tier 1' : params.league);
    if (params.recentGames) filters.push(`Últimos ${params.recentGames} jogos`);
    const filtersText = filters.length > 0 ? `(${filters.join(', ')})` : '(Todas as ligas)';

    let title;
    if (params.confrontoDireto && champs1.length > 0 && champs2.length > 0) {
        title = `Partidas de ${champs1.join(' & ')} vs ${champs2.join(' & ')} ${filtersText}`;
    } else {
        const champsText = [...champs1, ...champs2].join(' & ');
        title = `Partidas de ${champsText} ${filtersText}`;
    }

    // Adicionar título e botão de download
    document.getElementById('champ-info').innerHTML = `
        <div class="header-container">
            <div class="title-wrapper">
                <h2>${title}</h2>
            </div>
            <button id="download-csv" class="download-btn">Download</button>
        </div>
    `;

    // Gerar tabela
    let tableContent = `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Liga</th>
                    <th>Time</th>
                    <th>Vitória</th>
                    <th>Adversário</th>
                    <th>Top</th>
                    <th>Jungle</th>
                    <th>Mid</th>
                    <th>Bot</th>
                    <th>Suporte</th>
                    <th>adversa_Top</th>
                    <th>adversa_Jng</th>
                    <th>adversa_Mid</th>
                    <th>adversa_Bot</th>
                    <th>adversa_Sup</th>                   
                </tr>
            </thead>
            <tbody>
    `;

    filteredData.forEach(row => {
        tableContent += `
            <tr>
                <td>${row.date || '-'}</td>
                <td>${row.league || '-'}</td>
                <td>${row.teamname || '-'}</td>
                <td>${row.result || '-'}</td>
                <td>${row.adversa_team || '-'}</td>
                <td>${row.team_top || '-'}</td>
                <td>${row.team_jng || '-'}</td>
                <td>${row.team_mid || '-'}</td>
                <td>${row.team_bot || '-'}</td>
                <td>${row.team_sup || '-'}</td>
                <td>${row.adversa_top || '-'}</td>
                <td>${row.adversa_jng || '-'}</td>
                <td>${row.adversa_mid || '-'}</td>
                <td>${row.adversa_bot || '-'}</td>
                <td>${row.adversa_sup || '-'}</td>
            </tr>
        `;
    });

    tableContent += `</tbody></table>`;
    document.getElementById('games-table').innerHTML = tableContent;

    // Adicionar evento de clique ao botão de download
    document.getElementById('download-csv').addEventListener('click', () => {
        exportToCSV(filteredData, title);
    });
}

// Iniciar o carregamento do CSV quando a página carrega
window.onload = loadCSV;