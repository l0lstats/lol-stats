let df = null;

// Carregar o CSV ao iniciar
Papa.parse('https://qu.ax/SiXkb.csv', {
    download: true,
    header: true,
    complete: function(results) {
        df = results.data;
        carregarLigas();
    },
    error: function(error) {
        console.error('Erro ao carregar CSV:', error);
        alert('Falha ao carregar os dados. Verifique a URL do CSV.');
    }
});

function carregarLigas() {
    if (!df) return;
    // Extrair ligas únicas, removendo nulos e ordenando
    const ligas = [...new Set(df.map(row => row.league).filter(liga => liga))].sort();
    const selectLiga = document.getElementById('liga');
    selectLiga.innerHTML = '<option value="">Selecione o campeonato</option>';
    ligas.forEach(liga => {
        const option = document.createElement('option');
        option.value = liga;
        option.textContent = liga;
        selectLiga.appendChild(option);
    });
}

function carregarTimes() {
    if (!df) return;
    const liga = document.getElementById('liga').value;
    if (!liga) return;
    // Filtrar times por liga, removendo nulos e ordenando
    const times = [...new Set(df.filter(row => row.league === liga)
                               .map(row => row.teamname)
                               .filter(time => time))].sort();
    const selectTime1 = document.getElementById('time1');
    const selectTime2 = document.getElementById('time2');
    selectTime1.innerHTML = selectTime2.innerHTML = '<option value="">Selecione o time</option>';
    times.forEach(time => {
        const option1 = document.createElement('option');
        const option2 = document.createElement('option');
        option1.value = option1.textContent = time;
        option2.value = option2.textContent = time;
        selectTime1.appendChild(option1);
        selectTime2.appendChild(option2);
    });
}

function comparar() {
    const liga = document.getElementById('liga').value;
    const time1 = document.getElementById('time1').value;
    const time2 = document.getElementById('time2').value;

    // Validações
    if (!liga || !time1 || !time2) {
        alert('Selecione o campeonato e os dois times!');
        return;
    }
    if (time1 === time2) {
        alert('Selecione times diferentes!');
        return;
    }

    // Filtrar dados por liga
    const dfLiga = df.filter(row => row.league === liga);
    if (dfLiga.length === 0) {
        alert('Campeonato inválido!');
        return;
    }

    // Filtrar dados por time
    const dadosTime1 = dfLiga.filter(row => row.teamname === time1);
    const dadosTime2 = dfLiga.filter(row => row.teamname === time2);

    if (dadosTime1.length === 0 || dadosTime2.length === 0) {
        alert('Time inválido para o campeonato selecionado!');
        return;
    }

    // Calcular médias
    function calcularMedias(dados) {
        const vitorias = dados.reduce((sum, row) => sum + (parseInt(row.result) || 0), 0) / dados.length * 100;
        const torres = dados.reduce((sum, row) => sum + (parseFloat(row.firsttower) || 0), 0) / dados.length;
        const dragoes = dados.reduce((sum, row) => sum + (parseFloat(row.firstdragon) || 0), 0) / dados.length;
        return {
            'Vitórias': vitorias.toFixed(2),
            'Torres': torres.toFixed(2),
            'Dragões': dragoes.toFixed(2)
        };
    }

    const mediasTime1 = calcularMedias(dadosTime1);
    const mediasTime2 = calcularMedias(dadosTime2);

    // Exibir resultados
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = `
        <h2>Comparação: ${time1} vs ${time2}</h2>
        <table>
            <tr>
                <th>Estatística</th>
                <th>${time1}</th>
                <th>${time2}</th>
            </tr>
            <tr>
                <td>Vitórias (%)</td>
                <td>${mediasTime1.Vitórias}</td>
                <td>${mediasTime2.Vitórias}</td>
            </tr>
            <tr>
                <td>Primeira Torre</td>
                <td>${mediasTime1.Torres}</td>
                <td>${mediasTime2.Torres}</td>
            </tr>
            <tr>
                <td>Primeiro Dragão</td>
                <td>${mediasTime1.Dragões}</td>
                <td>${mediasTime2.Dragões}</td>
            </tr>
        </table>
    `;
}