let df = null;
let dfLiga = null;
let dfSide = null;
let dfResult = null;
let allTeams = [];
let isConfrontoDireto = false; // Flag para controlar o modo

function mostrarLoader() {
    document.getElementById('loader').style.display = 'flex';
}

function esconderLoader() {
    document.getElementById('loader').style.display = 'none';
}

// Função para capitalizar cada palavra
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Função para obter URL da imagem do time
function getTeamLogoUrl(teamName, variant = 'square', ext = 'webp') {
    const teamLogoExceptions = {
        'Beşiktaş Esports': 'Be3F_Esports',
        'LOUD': 'https://dpm.lol/esport/teams/LLL.webp',
        'FURIA': 'https://dpm.lol/esport/teams/FUR.webp',
        'INTZ': 'https://dpm.lol/esport/teams/ITZ.webp',
        'KaBuM! Ilha das Lendas': 'https://dpm.lol/esport/teams/KBM.webp',
        'KaBuM! Esports': 'https://dpm.lol/esport/teams/KBM.webp',
        'Flamengo MDL': 'https://gol.gg/_img/teams_icon/Flamengo_Esportslogo_square.webp',
        'Bilibili Gaming': 'https://static.flashscore.com/res/image/data/8GDKDOdM-MLEBzXUg.png',
        "Anyone's Legend": 'https://gol.gg/_img/teams_icon/Anyone_Legendlogo_profile.webp',
        'Top Esports': 'https://dpm.lol/esport/teams/TES.webp',
        'Invictus Gaming': 'https://dpm.lol/esport/teams/IG.webp',
        'Team WE': 'https://gol.gg/_img/teams_icon/team-we-2020.png',
        'FunPlus Phoenix': 'https://gol.gg/_img/teams_icon/funplus-phoenix-2021.png',
        'Ninjas in Pyjamas': 'https://gol.gg/_img/teams_icon/Ninjas_in_Pyjamaslogo_profile.webp',
        'JD Gaming': 'https://gol.gg/_img/teams_icon/jd-gaming-2020.png',
        'LGD Gaming': 'https://dpm.lol/esport/teams/LGD.webp',
        'EDward Gaming': 'https://dpm.lol/esport/teams/EDG.webp',
        'ThunderTalk Gaming': 'https://dpm.lol/esport/teams/TT.webp',
        'LNG Esports': 'https://gol.gg/_img/teams_icon/lng-esports-2020.png',
        'Royal Never Give Up': 'https://dpm.lol/esport/teams/RNG.webp',
        'Ultra Prime': 'https://dpm.lol/esport/teams/UP.webp',
        'DRX': 'https://gol.gg/_img/teams_icon/DRX-2020.png',
        'DRX Challengers': 'https://gol.gg/_img/teams_icon/DRX-2020.png',
        'Gen.G': 'https://dpm.lol/esport/teams/GENG.webp',
        'Gen.G Global Academy': 'https://dpm.lol/esport/teams/GENG.webp',
        'Hanwha Life Esports': 'https://dpm.lol/esport/teams/HLE.webp',
        'Hanwha Life Esports Challengers': 'https://dpm.lol/esport/teams/HLE.webp',
        'KT Rolster': 'https://dpm.lol/esport/teams/KT.webp',
        'KT Rolster Challengers': 'https://dpm.lol/esport/teams/KT.webp',
        'Nongshim RedForce': 'https://dpm.lol/esport/teams/NS.webp',
        'Nongshim Esports Academy': 'https://dpm.lol/esport/teams/NS.webp',
        'OKSavingsBank BRION': 'https://dpm.lol/esport/teams/BRO.webp',
        'OKSavingsBank BRION Challengers': 'https://dpm.lol/esport/teams/BRO.webp',
        'T1': 'https://dpm.lol/esport/teams/T1.webp',
        'SK Telecom T1': 'https://dpm.lol/esport/teams/T1.webp',
        'T1 Esports Academy': 'https://dpm.lol/esport/teams/T1.webp',
        'BNK FEARX Youth': 'https://dpm.lol/esport/teams/FOX.webp',
        'DN Freecs': 'https://dpm.lol/esport/teams/DNF.webp',
        'DN Freecs Challengers': 'https://dpm.lol/esport/teams/DNF.webp',
        'Dplus KIA Challengers': 'https://gol.gg/_img/teams_icon/Dplus_KIAlogo_profile.webp',
        'GiantX': 'https://dpm.lol/esport/teams/GX.webp',
        'Rogue': 'https://dpm.lol/esport/teams/RGE.webp',
        'Team BDS': 'https://dpm.lol/esport/teams/BDS.webp',
        'Furia': 'https://dpm.lol/esport/teams/FUR.webp',
        'Fluxo W7M': 'https://dpm.lol/esport/teams/FX.webp',
        'RED Canids': 'https://dpm.lol/esport/teams/RED.webp',
        'Disguised': 'https://dpm.lol/esport/teams/DSG.webp',
        'Dignitas': 'https://dpm.lol/esport/teams/DIG.webp',
        'TSM': 'https://dpm.lol/esport/teams/TSM.webp',
        'LYON': 'https://dpm.lol/esport/teams/LYON.webp',
        'Shopify Rebellion': 'https://dpm.lol/esport/teams/SR.webp',
        'Fukuoka SoftBank HAWKS gaming': 'https://dpm.lol/esport/teams/SHG.webp',
        'MGN Vikings Esports': 'https://dpm.lol/esport/teams/MVKE.webp',
        'TALON': 'https://dpm.lol/esport/teams/TLN.webp',
        'Team Secret Whales': 'https://dpm.lol/esport/teams/TS.webp',
        'Austrian Force willhaben': 'https://dpm.lol/esport/teams/AFW.webp',
        'Unicorns of Love Sexy Edition': 'https://dpm.lol/esport/teams/USE.webp',
        'Barça eSports': 'https://dpm.lol/esport/teams/BAR.webp',
        'GIANTX Pride': 'https://dpm.lol/esport/teams/GXP.webp',
        'Los Heretics': 'https://dpm.lol/esport/teams/HRTS.webp',
        'Movistar KOI Fénix': 'https://dpm.lol/esport/teams/KOI.webp',
        'UCAM Esports': 'https://dpm.lol/esport/teams/UCAM.webp',
        'Veni Vidi Vici': 'https://dpm.lol/esport/teams/VVV.webp',
        'Fnatic': 'https://dpm.lol/esport/teams/FNC.webp'
        
    };
    if (teamLogoExceptions[teamName] && teamLogoExceptions[teamName].startsWith('http')) {
        return teamLogoExceptions[teamName];
    }
    const formattedName = teamLogoExceptions[teamName] || capitalizeWords(teamName).replace(/ /g, '_');
    return `https://gol.gg/_img/teams_icon/${formattedName}logo_${variant}.${ext}`;
}

Papa.parse('BaseDadosTeam.csv', {
    download: true,
    header: true,
    complete: function(results) {
        mostrarLoader();
        df = results.data;
        if (df.length === 0) {
            alert('Nenhum dado válido encontrado!');
            return;
        }
        console.log('Dados brutos do CSV:', df);
        df.forEach(row => {
            if (row.date) {
                const date = new Date(row.date);
                console.log(`Data: ${row.date}, Ano extraído: ${date.getFullYear()}`);
            }
        })
        carregarLigas();
        carregarTimes();
        carregarSides();
        // Adicionar eventos para atualizar dinamicamente
        document.getElementById('year-filter').onchange = () => {
            carregarLigas();
            carregarTimes();
        };
        document.getElementById('liga').onchange = carregarTimes;
        
        esconderLoader();
    },
    error: function(error) {
        console.error('Erro ao carregar CSV:', error);
        esconderLoader();
    }
});

function carregarLigas() {
    const yearFilter = document.getElementById('year-filter').value;
    let dfFiltered = yearFilter === '' ? df : df.filter(row => {
        if (!row.date) return false;
        const date = new Date(row.date);
        const year = date.getFullYear();
        return !isNaN(year) && year === parseInt(yearFilter);
    });

    const ligas = [...new Set(dfFiltered.map(row => row.league).filter(liga => liga))].sort();
    const selectLiga = document.getElementById('liga');
    selectLiga.innerHTML = '<option value="">Todos os campeonatos</option>';
    ligas.forEach(liga => {
        const option = document.createElement('option');
        option.value = liga;
        option.textContent = liga;
        selectLiga.appendChild(option);
    });
}


function carregarTimes() {
    const liga = document.getElementById('liga').value;
    const side = document.getElementById('side').value;
    const resultFilter = document.getElementById('result-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const killLine = document.getElementById('kill-line').value;
    const timeLine = document.getElementById('time-line').value;
    const dragonLine = document.getElementById('dragon-line').value;
    const baronLine = document.getElementById('baron-line').value;
    const towerLine = document.getElementById('tower-line').value;
    const inhibitorLine = document.getElementById('inhibitor-line').value;
    const yearFilter = document.getElementById('year-filter').value;
    const time1Input = document.getElementById('time1');
    const time2Input = document.getElementById('time2');
    
    const time1Selecionado = time1Input.value;
    const time2Selecionado = time2Input.value;

    let dfFiltered = yearFilter === '' ? df : df.filter(row => {
        if (!row.date) return false;
        const date = new Date(row.date);
        const year = date.getFullYear();
        return !isNaN(year) && year === parseInt(yearFilter);
    });

    console.log(`Filtro de ano aplicado: ${yearFilter}, Total de linhas após filtro: ${dfFiltered.length}`);

    let dfLiga = liga ? dfFiltered.filter(row => row.league === liga) : dfFiltered;
    let dfSide = side ? dfLiga.filter(row => row.side === side) : dfLiga;
    let dfResult = resultFilter !== '' ? dfSide.filter(row => parseInt(row.result) === parseInt(resultFilter)) : dfSide;

    const times = [...new Set(dfResult.map(row => row.teamname).filter(time => time))].sort();
    const datalist = document.getElementById('times-list');
    datalist.innerHTML = '';
    times.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        datalist.appendChild(option);
    });

    // Gerar links visíveis
    const teamLinks = document.getElementById('team-links');
    if (teamLinks) {
        teamLinks.innerHTML = '';
        times.forEach(time => {
            const link = document.createElement('a');
            link.href = generateTeamGamesLink(time);
            link.textContent = time;
            link.onclick = (e) => {
                e.preventDefault();
                window.location.href = link.href;
            };
            teamLinks.appendChild(link);
            teamLinks.appendChild(document.createTextNode(' '));
        });
    }

    time1Input.value = time1Selecionado;
    if (time2Selecionado) time2Input.value = time2Selecionado;
}

function carregarSides() {
    const yearFilter = document.getElementById('year-filter').value;
    let dfFiltered = yearFilter === '' ? df : df.filter(row => {
        if (!row.date) return false;
        const date = new Date(row.date);
        const year = date.getFullYear();
        return !isNaN(year) && year === parseInt(yearFilter);
    });

    const sides = [...new Set(dfFiltered.map(row => row.side).filter(side => side))].sort();
    const selectSide = document.getElementById('side');
    selectSide.innerHTML = '<option value="">Todos os lados</option>';
    sides.forEach(side => {
        const option = document.createElement('option');
        option.value = side;
        option.textContent = side;
        selectSide.appendChild(option);
    });
}


function calcularKillStats(dados, killLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, killsBelow: 0, killsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const killsBelow = dados.filter(row => parseFloat(row.totalKills) < killLine || parseFloat(row.totalKills) === 0).length;
    const killsAbove = totalJogos - killsBelow;
    const percentBelow = (killsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (killsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, killsBelow, killsAbove, percentBelow, percentAbove };
}

function calcularTimeStats(dados, timeLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, timeBelow: 0, timeAbove: 0, percentBelow: 0, percentAbove: 0 };
    const timeBelow = dados.filter(row => parseInt(row.gamelength) < timeLine || parseInt(row.gamelength) === 0).length;
    const timeAbove = totalJogos - timeBelow;
    const percentBelow = (timeBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (timeAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, timeBelow, timeAbove, percentBelow, percentAbove };
}

function calcularDragonStats(dados, dragonLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, dragonsBelow: 0, dragonsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const dragonsBelow = dados.filter(row => parseFloat(row.totalDragons) < dragonLine || parseFloat(row.totalDragons) === 0).length;
    const dragonsAbove = totalJogos - dragonsBelow;
    const percentBelow = (dragonsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (dragonsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, dragonsBelow, dragonsAbove, percentBelow, percentAbove };
}

function calcularBaronStats(dados, baronLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, baronsBelow: 0, baronsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const baronsBelow = dados.filter(row => parseFloat(row.totalBarons) < baronLine || parseFloat(row.totalBarons) === 0).length;
    const baronsAbove = totalJogos - baronsBelow;
    const percentBelow = (baronsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (baronsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, baronsBelow, baronsAbove, percentBelow, percentAbove };
}

function calcularTowerStats(dados, towerLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, towersBelow: 0, towersAbove: 0, percentBelow: 0, percentAbove: 0 };
    const towersBelow = dados.filter(row => parseFloat(row.totalTowers) < towerLine || parseFloat(row.totalTowers) === 0).length;
    const towersAbove = totalJogos - towersBelow;
    const percentBelow = (towersBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (towersAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, towersBelow, towersAbove, percentBelow, percentAbove };
}

function calcularInhibitorStats(dados, inhibitorLine) {
    const totalJogos = dados.length;
    if (totalJogos === 0) return { totalJogos: 0, inhibitorsBelow: 0, inhibitorsAbove: 0, percentBelow: 0, percentAbove: 0 };
    const inhibitorsBelow = dados.filter(row => parseFloat(row.totalInhibitors) < inhibitorLine || parseFloat(row.totalInhibitors) === 0).length;
    const inhibitorsAbove = totalJogos - inhibitorsBelow;
    const percentBelow = (inhibitorsBelow / totalJogos * 100).toFixed(2);
    const percentAbove = (inhibitorsAbove / totalJogos * 100).toFixed(2);
    return { totalJogos, inhibitorsBelow, inhibitorsAbove, percentBelow, percentAbove };
}

function calcularMedias(dados) {
    const jogos = dados.length;
    const vitorias = dados.reduce((sum, row) => sum + (parseInt(row.result) || 0), 0);
    const torres = dados.reduce((sum, row) => sum + (parseInt(row.firsttower) || 0), 0);
    const dragoes = dados.reduce((sum, row) => sum + (parseInt(row.firstdragon) || 0), 0);
    const firstBlood = dados.reduce((sum, row) => sum + (parseInt(row.firstblood) || 0), 0);
    return {
        'Jogos': jogos,
        'Vitórias': vitorias,
        'Vitórias (%)': (vitorias / jogos * 100 || 0).toFixed(2),
        '1ª Torre': (torres / jogos * 100 || 0).toFixed(2),
        '1º Dragão': (dragoes / jogos * 100 || 0).toFixed(2),
        '1º Sangue': (firstBlood / jogos * 100 || 0).toFixed(2)
    };
}

function gerarTabela(statsTime1, statsTime2, mediasTime1, mediasTime2, time1, time2, killLine, timeLineMin, dragonLine, baronLine, towerLine, inhibitorLine) {
    let tableContent = '';
    if (!time2 || time1 === time2) {
        tableContent = `
            <table>
                <tr><th>Estatística</th><th>${time1}</th></tr>
                <tr><td>Jogos Disputados</td><td>${mediasTime1.Jogos}</td></tr>
                <tr><td>Vitórias</td><td>${mediasTime1.Vitórias}</td></tr>
                <tr><td>Vitórias (%)</td><td>${mediasTime1['Vitórias (%)']}%</td></tr>
                <tr><td>1ª Torre</td><td>${mediasTime1['1ª Torre']}%</td></tr>
                <tr><td>1º Dragão</td><td>${mediasTime1['1º Dragão']}%</td></tr>
                <tr><td>1º Sangue</td><td>${mediasTime1['1º Sangue']}%</td></tr>
                <tr><td>Under ${killLine} Kills</td><td>${statsTime1.killStats.percentBelow}%</td></tr>
                <tr><td>Over ${killLine} Kills</td><td>${statsTime1.killStats.percentAbove}%</td></tr>
                <tr><td>Under ${timeLineMin} min</td><td>${statsTime1.timeStats.percentBelow}%</td></tr>
                <tr><td>Over ${timeLineMin} min</td><td>${statsTime1.timeStats.percentAbove}%</td></tr>
                <tr><td>Under ${dragonLine} Dragons</td><td>${statsTime1.dragonStats.percentBelow}%</td></tr>
                <tr><td>Over ${dragonLine} Dragons</td><td>${statsTime1.dragonStats.percentAbove}%</td></tr>
                <tr><td>Under ${baronLine} Barons</td><td>${statsTime1.baronStats.percentBelow}%</td></tr>
                <tr><td>Over ${baronLine} Barons</td><td>${statsTime1.baronStats.percentAbove}%</td></tr>
                <tr><td>Under ${towerLine} Torres</td><td>${statsTime1.towerStats.percentBelow}%</td></tr>
                <tr><td>Over ${towerLine} Torres</td><td>${statsTime1.towerStats.percentAbove}%</td></tr>
                <tr><td>Under ${inhibitorLine} Inibidor</td><td>${statsTime1.inhibitorStats.percentBelow}%</td></tr>
                <tr><td>Over ${inhibitorLine} Inibidor</td><td>${statsTime1.inhibitorStats.percentAbove}%</td></tr>
            </table>
        `;
    } else {
        tableContent = `
            <table>
                <tr><th>Estatística</th><th>${time1}</th><th>${time2}</th></tr>
                <tr><td>Jogos Disputados</td><td>${mediasTime1.Jogos}</td><td>${mediasTime2.Jogos}</td></tr>
                <tr><td>Vitórias</td><td>${mediasTime1.Vitórias}</td><td>${mediasTime2.Vitórias}</td></tr>
                <tr><td>Vitórias (%)</td><td>${mediasTime1['Vitórias (%)']}%</td><td>${mediasTime2['Vitórias (%)']}%</td></tr>
                <tr><td>1ª Torre</td><td>${mediasTime1['1ª Torre']}%</td><td>${mediasTime2['1ª Torre']}%</td></tr>
                <tr><td>1º Dragão</td><td>${mediasTime1['1º Dragão']}%</td><td>${mediasTime2['1º Dragão']}%</td></tr>
                <tr><td>1º Sangue</td><td>${mediasTime1['1º Sangue']}%</td><td>${mediasTime2['1º Sangue']}%</td></tr>
                <tr><td>Under ${killLine} Kills</td><td>${statsTime1.killStats.percentBelow}%</td><td>${statsTime2.killStats.percentBelow}%</td></tr>
                <tr><td>Over ${killLine} Kills</td><td>${statsTime1.killStats.percentAbove}%</td><td>${statsTime2.killStats.percentAbove}%</td></tr>
                <tr><td>Under ${timeLineMin} min</td><td>${statsTime1.timeStats.percentBelow}%</td><td>${statsTime2.timeStats.percentBelow}%</td></tr>
                <tr><td>Over ${timeLineMin} min</td><td>${statsTime1.timeStats.percentAbove}%</td><td>${statsTime2.timeStats.percentAbove}%</td></tr>
                <tr><td>Under ${dragonLine} Dragons</td><td>${statsTime1.dragonStats.percentBelow}%</td><td>${statsTime2.dragonStats.percentBelow}%</td></tr>
                <tr><td>Over ${dragonLine} Dragons</td><td>${statsTime1.dragonStats.percentAbove}%</td><td>${statsTime2.dragonStats.percentAbove}%</td></tr>
                <tr><td>Under ${baronLine} Barons</td><td>${statsTime1.baronStats.percentBelow}%</td><td>${statsTime2.baronStats.percentBelow}%</td></tr>
                <tr><td>Over ${baronLine} Barons</td><td>${statsTime1.baronStats.percentAbove}%</td><td>${statsTime2.baronStats.percentAbove}%</td></tr>
                <tr><td>Under ${towerLine} Torres</td><td>${statsTime1.towerStats.percentBelow}%</td><td>${statsTime2.towerStats.percentBelow}%</td></tr>
                <tr><td>Over ${towerLine} Torres</td><td>${statsTime1.towerStats.percentAbove}%</td><td>${statsTime2.towerStats.percentAbove}%</td></tr>
                <tr><td>Under ${inhibitorLine} Inibidor</td><td>${statsTime1.inhibitorStats.percentBelow}%</td><td>${statsTime2.inhibitorStats.percentBelow}%</td></tr>
                <tr><td>Over ${inhibitorLine} Inibidor</td><td>${statsTime1.inhibitorStats.percentAbove}%</td><td>${statsTime2.inhibitorStats.percentAbove}%</td></tr>
            </table>
        `;
    }
    return tableContent;
}

function gerarTitulo(time1, time2, side, liga, resultFilter, recentGames, yearFilter, separator) {
    const h2 = document.createElement('h2');
    
    if (time1) {
        const link1 = document.createElement('a');
        link1.href = generateTeamGamesLink(time1);
        link1.target = '_blank';
        link1.textContent = time1;
        h2.appendChild(link1);
    }
    
    if (time2 && time1 !== time2) {
        h2.appendChild(document.createTextNode(` ${separator} `));
        const link2 = document.createElement('a');
        link2.href = generateTeamGamesLink(time2);
        link2.target = '_blank';
        link2.textContent = time2;
        h2.appendChild(link2);
    }
    
    if (side) h2.appendChild(document.createTextNode(` (${side})`));
    if (liga) h2.appendChild(document.createTextNode(` (${liga})`));
    if (resultFilter !== '') h2.appendChild(document.createTextNode(` (${resultFilter === '1' ? 'Vitórias' : 'Derrotas'})`));
    if (recentGames) h2.appendChild(document.createTextNode(` (Últimos ${recentGames} jogos)`));
    if (yearFilter !== '') h2.appendChild(document.createTextNode(` (${yearFilter})`));
    
    return h2;
}

function comparar() {
    isConfrontoDireto = false; // Desativar modo confronto ao usar Stats Individual
    const liga = document.getElementById('liga').value;
    const side = document.getElementById('side').value;
    const resultFilter = document.getElementById('result-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const killLine = parseFloat(document.getElementById('kill-line').value);
    const timeLineValue = parseInt(document.getElementById('time-line').value);
    const dragonLine = parseFloat(document.getElementById('dragon-line').value);
    const baronLine = parseFloat(document.getElementById('baron-line').value);
    const towerLine = parseFloat(document.getElementById('tower-line').value);
    const inhibitorLine = parseFloat(document.getElementById('inhibitor-line').value);
    const yearFilter = document.getElementById('year-filter').value;
    const timeLine = isNaN(timeLineValue) ? 31 : timeLineValue;
    let time1 = document.getElementById('time1').value;
    const time2 = document.getElementById('time2').value;

    if (!time1 && time2) {
        time1 = time2;
    }

    if (!time1) {
        alert('Selecione pelo menos um time!');
        return;
    }

    let dfFiltered = yearFilter === '' ? df : df.filter(row => {
        if (!row.date) return false;
        const date = new Date(row.date);
        const year = date.getFullYear();
        return !isNaN(year) && year === parseInt(yearFilter);
    });

    console.log(`Filtro de ano aplicado: ${yearFilter}, Total de linhas após filtro: ${dfFiltered.length}`);

    let dfLiga = liga ? dfFiltered.filter(row => row.league === liga) : dfFiltered;
    let dfSide = side ? dfLiga.filter(row => row.side === side) : dfLiga;
    let dfResult = resultFilter !== '' ? dfSide.filter(row => parseInt(row.result) === parseInt(resultFilter)) : dfSide;

    let dadosTime1 = time1 ? dfResult.filter(row => row.teamname === time1) : [];
    let dadosTime2 = time2 && time1 !== time2 ? dfResult.filter(row => row.teamname === time2) : [];

    if (recentGames) {
        dadosTime1 = dadosTime1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        if (time2 && time1 !== time2) dadosTime2 = dadosTime2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    if (dadosTime1.length === 0 && (!time2 || dadosTime2.length === 0)) {
        alert('Dados insuficientes para os times selecionados no ano escolhido!');
        return;
    }

    const statsTime1 = {
        killStats: calcularKillStats(dadosTime1, killLine),
        timeStats: calcularTimeStats(dadosTime1, timeLine),
        dragonStats: calcularDragonStats(dadosTime1, dragonLine),
        baronStats: calcularBaronStats(dadosTime1, baronLine),
        towerStats: calcularTowerStats(dadosTime1, towerLine),
        inhibitorStats: calcularInhibitorStats(dadosTime1, inhibitorLine)
    };

    const statsTime2 = time2 && time1 !== time2 ? {
        killStats: calcularKillStats(dadosTime2, killLine),
        timeStats: calcularTimeStats(dadosTime2, timeLine),
        dragonStats: calcularDragonStats(dadosTime2, dragonLine),
        baronStats: calcularBaronStats(dadosTime2, baronLine),
        towerStats: calcularTowerStats(dadosTime2, towerLine),
        inhibitorStats: calcularInhibitorStats(dadosTime2, inhibitorLine)
    } : {
        killStats: { percentBelow: 0, percentAbove: 0 },
        timeStats: { percentBelow: 0, percentAbove: 0 },
        dragonStats: { percentBelow: 0, percentAbove: 0 },
        baronStats: { percentBelow: 0, percentAbove: 0 },
        towerStats: { percentBelow: 0, percentAbove: 0 },
        inhibitorStats: { percentBelow: 0, percentAbove: 0 }
    };

    const mediasTime1 = calcularMedias(dadosTime1);
    const mediasTime2 = time2 && time1 !== time2 ? calcularMedias(dadosTime2) : {
        'Jogos': 0,
        'Vitórias': 0,
        'Vitórias (%)': 0,
        '1ª Torre': 0,
        '1º Dragão': 0,
        '1º Sangue': 0
    };

    const timeLineMin = parseInt(document.getElementById('time-line').value);

    const tableContent = gerarTabela(statsTime1, statsTime2, mediasTime1, mediasTime2, time1, time2, killLine, timeLineMin, dragonLine, baronLine, towerLine, inhibitorLine);

    console.log('Conteúdo da tabela (sem título):', tableContent);

    const resultado = document.getElementById('resultado');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(time1, time2, side, liga, resultFilter, recentGames, yearFilter, ' | ');
    
    const teamLogos = document.getElementById('team-logos');
    teamLogos.innerHTML = '';
    if (time1) {
        const img1 = document.createElement('img');
        img1.src = getTeamLogoUrl(time1, 'square', 'webp');
        img1.alt = `${time1} Logo`;
        img1.onload = () => console.log(`Imagem ${time1} carregada: ${img1.src}, Dimensões: ${img1.naturalWidth}x${img1.naturalHeight}px`);
        img1.onerror = () => {
            img1.src = getTeamLogoUrl(time1, 'square', 'png');
            img1.onerror = () => {
                img1.src = getTeamLogoUrl(time1, 'profile', 'webp');
                img1.onerror = () => {
                    img1.src = getTeamLogoUrl(time1, 'profile', 'png');
                    img1.onerror = () => {
                        img1.src = 'https://media.tenor.com/_aAExG9FQDEAAAAj/league-of-legends-riot-games.gif';
                        console.log(`Falha ao carregar imagem de ${time1}`);
                    };
                };
            };
        };
        teamLogos.appendChild(img1);
    }
    if (time2 && time1 !== time2) {
        const img2 = document.createElement('img');
        img2.src = getTeamLogoUrl(time2, 'square', 'webp');
        img2.alt = `${time2} Logo`;
        img2.onload = () => console.log(`Imagem ${time2} carregada: ${img2.src}, Dimensões: ${img2.naturalWidth}x${img2.naturalHeight}px`);
        img2.onerror = () => {
            img2.src = getTeamLogoUrl(time2, 'square', 'png');
            img2.onerror = () => {
                img2.src = getTeamLogoUrl(time2, 'profile', 'webp');
                img2.onerror = () => {
                    img2.src = getTeamLogoUrl(time2, 'profile', 'png');
                    img2.onerror = () => {
                        img2.src = 'https://media.tenor.com/W_GgSsF7x9sAAAAi/amumu-sad.gif';
                        console.log(`Falha ao carregar imagem de ${time2}`);
                    };
                };
            };
        };
        teamLogos.appendChild(img2);
    }

    resultado.appendChild(h2);
    resultado.insertAdjacentHTML('beforeend', tableContent);
    
    console.log('Título renderizado:', h2.outerHTML);
}

function confrontoDireto() {
    isConfrontoDireto = true; // Ativar modo confronto
    const liga = document.getElementById('liga').value;
    const side = document.getElementById('side').value;
    const resultFilter = document.getElementById('result-filter').value;
    const recentGames = document.getElementById('recent-games').value;
    const killLine = parseFloat(document.getElementById('kill-line').value);
    const timeLineValue = parseInt(document.getElementById('time-line').value);
    const dragonLine = parseFloat(document.getElementById('dragon-line').value);
    const baronLine = parseFloat(document.getElementById('baron-line').value);
    const towerLine = parseFloat(document.getElementById('tower-line').value);
    const inhibitorLine = parseFloat(document.getElementById('inhibitor-line').value);
    const yearFilter = document.getElementById('year-filter').value;
    const timeLine = isNaN(timeLineValue) ? 31 : timeLineValue;
    let time1 = document.getElementById('time1').value;
    const time2 = document.getElementById('time2').value;

    if (!time1 && time2) {
        time1 = time2;
    }

    if (!time1 || !time2 || time1 === time2) {
        alert('Selecione dois times diferentes para o Confronto Direto!');
        return;
    }

    let dfFiltered = yearFilter === '' ? df : df.filter(row => {
        if (!row.date) return false;
        const date = new Date(row.date);
        const year = date.getFullYear();
        return !isNaN(year) && year === parseInt(yearFilter);
    });

    console.log(`Filtro de ano aplicado: ${yearFilter}, Total de linhas após filtro: ${dfFiltered.length}`);

    let dfLiga = liga ? dfFiltered.filter(row => row.league === liga) : dfFiltered;
    let dfSide = side ? dfLiga.filter(row => row.side === side) : dfLiga;
    let dfResult = resultFilter !== '' ? dfSide.filter(row => parseInt(row.result) === parseInt(resultFilter)) : dfSide;

    let dadosTime1 = dfResult.filter(row => row.teamname === time1 && row.adversa_team === time2);
    let dadosTime2 = dfResult.filter(row => row.teamname === time2 && row.adversa_team === time1);

    if (recentGames) {
        dadosTime1 = dadosTime1.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
        dadosTime2 = dadosTime2.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(recentGames));
    }

    if (dadosTime1.length === 0 && dadosTime2.length === 0) {
        alert('Nenhum confronto direto encontrado entre os times selecionados no ano escolhido!');
        return;
    }

    const statsTime1 = {
        killStats: calcularKillStats(dadosTime1, killLine),
        timeStats: calcularTimeStats(dadosTime1, timeLine),
        dragonStats: calcularDragonStats(dadosTime1, dragonLine),
        baronStats: calcularBaronStats(dadosTime1, baronLine),
        towerStats: calcularTowerStats(dadosTime1, towerLine),
        inhibitorStats: calcularInhibitorStats(dadosTime1, inhibitorLine)
    };

    const statsTime2 = {
        killStats: calcularKillStats(dadosTime2, killLine),
        timeStats: calcularTimeStats(dadosTime2, timeLine),
        dragonStats: calcularDragonStats(dadosTime2, dragonLine),
        baronStats: calcularBaronStats(dadosTime2, baronLine),
        towerStats: calcularTowerStats(dadosTime2, towerLine),
        inhibitorStats: calcularInhibitorStats(dadosTime2, inhibitorLine)
    };

    const mediasTime1 = calcularMedias(dadosTime1);
    const mediasTime2 = calcularMedias(dadosTime2);

    const timeLineMin = parseInt(document.getElementById('time-line').value);

    const tableContent = gerarTabela(statsTime1, statsTime2, mediasTime1, mediasTime2, time1, time2, killLine, timeLineMin, dragonLine, baronLine, towerLine, inhibitorLine);

    console.log('Conteúdo da tabela (sem título):', tableContent);

    const resultado = document.getElementById('resultado');
    resultado.innerHTML = '';
    const h2 = gerarTitulo(time1, time2, side, liga, resultFilter, recentGames, yearFilter, 'vs');
    
    const teamLogos = document.getElementById('team-logos');
    teamLogos.innerHTML = '';
    if (time1) {
        const img1 = document.createElement('img');
        img1.src = getTeamLogoUrl(time1, 'square', 'webp');
        img1.alt = `${time1} Logo`;
        img1.onload = () => console.log(`Imagem ${time1} carregada: ${img1.src}, Dimensões: ${img1.naturalWidth}x${img1.naturalHeight}px`);
        img1.onerror = () => {
            img1.src = getTeamLogoUrl(time1, 'square', 'png');
            img1.onerror = () => {
                img1.src = getTeamLogoUrl(time1, 'profile', 'webp');
                img1.onerror = () => {
                    img1.src = getTeamLogoUrl(time1, 'profile', 'png');
                    img1.onerror = () => {
                        img1.src = 'https://media.tenor.com/W_GgSsF7x9sAAAAi/amumu-sad.gif';
                        console.log(`Falha ao carregar imagem de ${time1}`);
                    };
                };
            };
        };
        teamLogos.appendChild(img1);
    }
    if (time2 && time1 !== time2) {
        const img2 = document.createElement('img');
        img2.src = getTeamLogoUrl(time2, 'square', 'webp');
        img2.alt = `${time2} Logo`;
        img2.onload = () => console.log(`Imagem ${time2} carregada: ${img2.src}, Dimensões: ${img2.naturalWidth}x${img2.naturalHeight}px`);
        img2.onerror = () => {
            img2.src = getTeamLogoUrl(time2, 'square', 'png');
            img2.onerror = () => {
                img2.src = getTeamLogoUrl(time2, 'profile', 'webp');
                img2.onerror = () => {
                    img2.src = getTeamLogoUrl(time2, 'profile', 'png');
                    img2.onerror = () => {
                        img2.src = 'https://media.tenor.com/_aAExG9FQDEAAAAj/league-of-legends-riot-games.gif';
                        console.log(`Falha ao carregar imagem de ${time2}`);
                    };
                };
            };
        };
        teamLogos.appendChild(img2);
    }

    resultado.appendChild(h2);
    resultado.insertAdjacentHTML('beforeend', tableContent);
    
    console.log('Título renderizado:', h2.outerHTML);
}

function generateTeamGamesLink(teamName) {
    const urlParams = new URLSearchParams();
    urlParams.append('teamname', encodeURIComponent(teamName));

    // Adicionar filtros da página (sem Linhas)
    const year = document.getElementById('year-filter').value || '';
    if (year) urlParams.append('year', year);

    const liga = document.getElementById('liga').value || '';
    if (liga) urlParams.append('liga', liga);

    const side = document.getElementById('side').value || '';
    if (side) urlParams.append('side', side);

    const result = document.getElementById('result-filter').value || '';
    if (result) urlParams.append('result', result);

    

    // Lógica de Confronto Direto: incluir apenas se o modo estiver ativo
    if (isConfrontoDireto) {
        const time1 = document.getElementById('time1').value || '';
        const time2 = document.getElementById('time2').value || '';
        if (time1 && time2 && time1 !== time2) {
            urlParams.append('confrontoDireto', 'true');
            urlParams.append('time1', encodeURIComponent(time1));
            urlParams.append('time2', encodeURIComponent(time2));
        }
    }
    const recentGames = document.getElementById('recent-games').value;
    if (recentGames) urlParams.append('recentGames', recentGames);

    const url = `team_games.html?${urlParams.toString()}`;
    console.log('URL gerada para', teamName, ':', url); // Depuração
    return url;
}

// [Outras funções permanecem iguais]