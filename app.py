from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)

# Carrega o banco de dados uma vez
df = pd.read_csv(r'C:\Users\mateu\OneDrive\Documentos\Projetos\RelatoriosApostas\LOL\BaseDeDados.csv')

@app.route('/')
def index():
    ligas = sorted(df['league'].dropna().unique())
    return render_template('index.html', ligas=ligas)

@app.route('/get_times', methods=['POST'])
def get_times():
    liga = request.json['liga']
    times = sorted(df[df['league'] == liga]['teamname'].dropna().unique())
    return jsonify(times=times)

@app.route('/comparar', methods=['POST'])
def comparar():
    data = request.json
    liga = data['liga']
    time1 = data['time1']
    time2 = data['time2']

    # Filtra dados da liga
    df_liga = df[df['league'] == liga]

    # Filtra dados de cada time
    dados_time1 = df_liga[df_liga['teamname'] == time1]
    dados_time2 = df_liga[df_liga['teamname'] == time2]

    def calcular_medias(dados):
        return {
            'Vitórias': round(dados['result'].mean() * 100, 2),
            'Torres': round(dados['firsttower'].mean(), 2),
            'Dragões': round(dados['firstdragon'].mean(), 2)
        }

    medias_time1 = calcular_medias(dados_time1)
    medias_time2 = calcular_medias(dados_time2)

    return jsonify({
        'time1': {'nome': time1, **medias_time1},
        'time2': {'nome': time2, **medias_time2}
    })

if __name__ == '__main__':
    app.run(debug=True)
