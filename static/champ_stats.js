// Variável global para armazenar os dados do CSV
let df;

// Função para carregar o CSV
function loadCSV() {
    Papa.parse('/BaseDadosChamp.csv', {
        download: true,
        header: true,
        complete: function(results) {
            df = results.data;
            console.log('CSV carregado, primeiros 5 registros:', df.slice(0, 5));
            populateChampions();
            updateStats(); // Inicializa as estatísticas
        },
        error: function(error) {
            console.error('Erro ao carregar CSV:', error);
            document.getElementById('champ-stats-table').innerHTML = '<p>Erro ao carregar os dados!</p>';
        }
    });
}

// Função para preencher o datalist com os nomes dos campeões
function populateChampions() {
    const laneColumns = ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'];
    const champions = [...new Set(df.flatMap(row => laneColumns.map(col => row[col])).filter(name => name && name.trim() !== ''))];
    const datalist = document.getElementById('champions-list');
    datalist.innerHTML = '';
    champions.forEach(champion => {
        const option = document.createElement('option');
        option.value = champion;
        datalist.appendChild(option);
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
function updateChampionImage(championName) {
    if (championName) {
        const cleanName = getCleanChampionName(championName);
        const imgUrl = `https://gol.gg/_img/champions_icon/${cleanName}.png`;
        const imgDiv = document.getElementById('champion-image');
        imgDiv.innerHTML = `<img src="${imgUrl}" alt="${championName}" style="max-width: 100px; max-height: 100px;">`;
    } else {
        document.getElementById('champion-image').innerHTML = '';
    }
}

// Função para calcular e exibir as estatísticas
function updateStats() {
    const championName = document.getElementById('champion-input').value;
    const lane = document.getElementById('lane-select').value;
    updateChampionImage(championName);

    if (!championName) {
        document.getElementById('champ-stats-table').innerHTML = '<p>Selecione um campeão!</p>';
        return;
    }

    const laneColumn = lane ? `team_${lane}` : null;
    let filteredData = df.filter(row => 
        laneColumn ? row[laneColumn] === championName : 
        ['team_top', 'team_jng', 'team_mid', 'team_bot', 'team_sup'].some(col => row[col] === championName)
    );

    const totalGames = filteredData.length;
    const wins = filteredData.filter(row => row.result === '1').length;
    const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(2) : 0;

    let tableContent = `
        <table>
            <thead>
                <tr>
                    <th>Jogos</th>
                    <th>Vitórias</th>
                    <th>% Vitórias</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${totalGames}</td>
                    <td>${wins}</td>
                    <td>${winRate}%</td>
                </tr>
            </tbody>
        </table>
    `;
    document.getElementById('champ-stats-table').innerHTML = tableContent;
}

// Evento para atualizar estatísticas ao mudar o campeão
document.getElementById('champion-input').addEventListener('input', updateStats);

// Iniciar o carregamento do CSV quando a página carrega
window.onload = loadCSV;