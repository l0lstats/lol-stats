// Variável global para armazenar os dados do CSV
let df;

// Função para obter parâmetros da URL
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        teamname: decodeURIComponent(urlParams.get('teamname') || ''),
        year: urlParams.get('year') || '',
        liga: urlParams.get('liga') || '',
        side: urlParams.get('side') || '',
        result: urlParams.get('result') || '',
        recentGames: urlParams.get('recentGames') || '',
        confrontoDireto: urlParams.get('confrontoDireto') === 'true',
        time1: decodeURIComponent(urlParams.get('time1') || ''),
        time2: decodeURIComponent(urlParams.get('time2') || ''),
        killLine: urlParams.get('killLine') || '',
        timeLine: urlParams.get('timeLine') || '',
        dragonLine: urlParams.get('dragonLine') || '',
        baronLine: urlParams.get('baronLine') || '',
        towerLine: urlParams.get('towerLine') || '',
        inhibitorLine: urlParams.get('inhibitorLine') || ''
    };
}

// Função para carregar o CSV
function loadCSV() {
    Papa.parse('BaseDadosTeam.csv', {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data;
            console.log('CSV carregado, 1ºs 5 registros:', df.slice(0, 5));
            displayTeamData();
        },
        error: function(error) {
            console.error('Erro ao carregar CSV:', error);
            document.getElementById('team-info').innerHTML = '<p>Erro ao carregar os dados! Verifique se o arquivo está disponível.</p>';
        }
    });
}

// Função para exportar a tabela para CSV
function exportToCSV(filteredData, title) {
    // Definir os cabeçalhos do CSV (em português, como na tabela)
    const headers = [
        'Data', 'Liga', 'Lado','Time', 'Vitória','Lineup',
        'Kills', 'Deaths', '1ª Torre', '1º Dragão', '1º Sangue','Adversário', 'Lineup Adv','Tempo(min)',
        'Dragões', 'Barons', 'Torres', 'Inibidores'
    ];

    // Mapear os dados filtrados para corresponder aos cabeçalhos
    const csvData = filteredData.map(row => [
        row.date || '-',
        row.league || '-',
        row.side || '-',
        row.teamname || '-',
        row.result || '-',
        row.team_players || '-',
        row.kills || '-',
        row.deaths || '-',
        row.firsttower || '-',
        row.firstdragon || '-',
        row.firstblood || '-',
        row.adversa_team || '-',
        row.adversa_players || '-',
        row.gamelength || '-',
        row.totalDragons || '-',
        row.totalBarons || '-',
        row.totalTowers || '-',
        row.totalInhibitors || '-'
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

function displayTeamData() {
    const params = getUrlParams();
    const teamName = params.teamname;
    if (!teamName) {
        document.getElementById('team-info').innerHTML = '<p>Nenhum time selecionado!</p>';
        return;
    }

    let filteredData = df.filter(row => row.teamname === teamName);

    // Aplicar filtros gerais (sem Linhas e sem recentGames inicialmente)
    if (params.year) {
        filteredData = filteredData.filter(row => {
            const year = new Date(row.date).getFullYear().toString();
            return year === params.year;
        });
    }
    if (params.liga) {
        filteredData = filteredData.filter(row => row.league === params.liga);
    }
    if (params.side) {
        filteredData = filteredData.filter(row => row.side === params.side);
    }
    if (params.result) {
        filteredData = filteredData.filter(row => row.result === params.result);
    }

    // Aplicar lógica de Confronto Direto apenas se ativado
    if (params.confrontoDireto && params.time1 && params.time2) {
        if (teamName === params.time1) {
            filteredData = filteredData.filter(row => row.adversa_team === params.time2);
        } else if (teamName === params.time2) {
            filteredData = filteredData.filter(row => row.adversa_team === params.time1);
        }
    }

    // Ordenar por data decrescente e aplicar recentGames como último filtro
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (params.recentGames) {
        const recentLimit = parseInt(params.recentGames);
        if (!isNaN(recentLimit) && recentLimit > 0) {
            filteredData = filteredData.slice(0, recentLimit);
        }
    }

    if (filteredData.length === 0) {
        document.getElementById('team-info').innerHTML = `<p>Nenhuma partida encontrada para o time ${teamName} com os filtros aplicados!</p>`;
        return;
    }

    // Personalizar o título com base no confronto direto e incluir todos os filtros
    let filters = [];
    if (params.year) filters.push(`${params.year}`);
    if (params.liga) filters.push(params.liga);
    if (params.side) filters.push(`Lado ${params.side}`);
    if (params.result) filters.push(params.result === '1' ? 'Vitórias' : 'Derrotas');
    if (params.recentGames) filters.push(`Últimos ${params.recentGames} jogos`);
    const filtersText = filters.length > 0 ? `(${filters.join(', ')})` : '(Todas as ligas)';

    let title;
    if (params.confrontoDireto && params.time1 && params.time2) {
        if (teamName === params.time2) {
            title = `Partidas de ${params.time2} vs ${params.time1} ${filtersText}`;
        } else {
            title = `Partidas de ${params.time1} vs ${params.time2} ${filtersText}`;
        }
    } else {
        title = `Partidas de ${teamName} ${filtersText}`;
    }

    // Adicionar título centralizado e botão de download à direita
    document.getElementById('team-info').innerHTML = `
        <div class="header-container">
            <div class="title-wrapper">
                <h2>${title}</h2>
            </div>
            <button id="download-csv" class="download-btn">Download</button>
        </div>
    `;

    let tableContent = `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Liga</th>
                    <th>Lado</th>
                    <th>Time</th>
                    <th>Vitória</th>
                    <th>Lineup</th>
                    <th>Kills</th>
                    <th>Deaths</th>
                    <th>1ª Torre</th>
                    <th>1º Dragão</th>
                    <th>1º Sangue</th>
                    <th>Adversário</th>
                    <th>Lineup Adv</th>
                    <th>Tempo(min)</th>
                    <th>Dragões</th>
                    <th>Barons</th>
                    <th>Torres</th>
                    <th>Inibidores</th>
                </tr>
            </thead>
            <tbody>
    `;

    filteredData.forEach(row => {
        tableContent += `
            <tr>
                <td>${row.date || '-'}</td>
                <td>${row.league || '-'}</td>
                <td>${row.side || '-'}</td>
                <td>${row.teamname || '-'}</td>
                <td>${row.result || '-'}</td>
                <td>${row.team_players || '-'}</td>
                <td>${row.kills || '-'}</td>
                <td>${row.deaths || '-'}</td>
                <td>${row.firsttower || '-'}</td>
                <td>${row.firstdragon || '-'}</td>
                <td>${row.firstblood || '-'}</td>
                <td>${row.adversa_team || '-'}</td>
                <td>${row.adversa_players || '-'}</td>
                <td>${row.gamelength || '-'}</td>
                <td>${row.totalDragons || '-'}</td>
                <td>${row.totalBarons || '-'}</td>
                <td>${row.totalTowers || '-'}</td>
                <td>${row.totalInhibitors || '-'}</td>
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