import alimentos from './dados.js';

//Função para calcular a distância de Levenshtein entre duas strings - SUGESTÃO DO GEMINI
function calcularDistanciaLevenshtein(a, b) {
    const matriz = Array.from({ length: b.length + 1 }, (_, i) => [i]);

    for (let i = 1; i <= a.length; i++) {
        matriz[0][i] = i;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const custo = a[j - 1] === b[i - 1] ? 0 : 1;
            matriz[i][j] = Math.min(
                matriz[i - 1][j] + 1,    //Remoção
                matriz[i][j - 1] + 1,    //Inserção
                matriz[i - 1][j - 1] + custo  //Substituição
            );
        }
    }

    return matriz[b.length][a.length];
}

//Função para encontrar o alimento mais próximo usando a distância de Levenshtein
function encontrarMelhorCorrespondencia(query) {
    let melhorCorrespondencia = null;
    let menorDistancia = Infinity;

    alimentos.forEach(alimento => {
        const distancia = calcularDistanciaLevenshtein(query.toLowerCase(), alimento.nome.toLowerCase());
        if (distancia < menorDistancia) {
            menorDistancia = distancia;
            melhorCorrespondencia = alimento;
        }
    });

    return melhorCorrespondencia;
}

//Função para verificar se uma imagem existe
function verificarImagemExistente(imagemUrl, callback) {
    const img = new Image();
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
    img.src = imagemUrl;
}

//Seleciona elementos do DOM
const input = document.getElementById('busca');
const buscarBtn = document.getElementById('buscarBtn');
const resultadoDiv = document.getElementById('resultado');
const sugestoesDiv = document.getElementById('sugestoes');

//Adiciona o evento de clique para o botão de busca
buscarBtn.addEventListener('click', () => {
    const query = input.value.toLowerCase().trim();
    if (!query) return;

    //Busca por correspondência exata no nome do alimento
    const resultado = alimentos.find(alimento => alimento.nome.toLowerCase() === query);

    if (resultado) {
        mostrarResultado(resultado);
    } else {
        //Se não encontrar, tenta encontrar a melhor correspondência usando distância de Levenshtein
        const sugestao = encontrarMelhorCorrespondencia(query);
        if (sugestao) {
            resultadoDiv.innerHTML = `
                <p>Não encontramos um alimento exato, mas encontramos uma sugestão próxima:</p>
                <h2>${sugestao.nome}</h2>
                <p><strong>Pode consumir:</strong> ${sugestao.podeComer ? 'Sim' : 'Não'}</p>
                <p><strong>Moderação necessária:</strong> ${sugestao.moderacao ? 'Sim' : 'Não'}</p>
                <p><strong>Motivo:</strong> ${sugestao.motivo}</p>
                <div id="imagem"></div>
            `;

            const imagemUrl = `assets/images/${sugestao.imagem}`;
            verificarImagemExistente(imagemUrl, (existe) => {
                if (existe) {
                    resultadoDiv.querySelector('#imagem').innerHTML = `<img src="${imagemUrl}" alt="${sugestao.nome}">`;
                } else {
                    resultadoDiv.querySelector('#imagem').innerHTML = '';
                }
            });
        } else {
            resultadoDiv.innerHTML = `<p>Não encontramos um alimento parecido. Por favor, tente novamente.</p>`;
        }
    }
});

//Função para sugerir alimentos enquanto o usuário digita
function sugerirAlimentos(input) {
    sugestoesDiv.innerHTML = ''; //Limpa sugestões anteriores

    if (input.length > 0) {
        const correspondencias = alimentos.filter(alimento => alimento.nome.toLowerCase().includes(input.toLowerCase()));
        correspondencias.forEach(alimento => {
            const sugestao = document.createElement('div');
            sugestao.textContent = alimento.nome;
            sugestao.onclick = () => {
                document.getElementById('busca').value = alimento.nome;
                sugerirAlimentos(alimento.nome);  //Atualiza a pesquisa
                sugestoesDiv.innerHTML = '';  //Limpa sugestões após clicar
            };
            sugestoesDiv.appendChild(sugestao);
        });
    }
}

//Evento de entrada para capturar o texto digitado e mostrar sugestões
input.addEventListener('input', (e) => {
    sugerirAlimentos(e.target.value);
});

//Função para exibir o resultado
function mostrarResultado(alimento) {
    //Exibe informações do alimento
    const imagemUrl = `assets/images/${alimento.imagem}`;
    verificarImagemExistente(imagemUrl, (existe) => {
        resultadoDiv.innerHTML = `
            <h2>${alimento.nome}</h2>
            <p><strong>Pode consumir:</strong> ${alimento.podeComer ? 'Sim' : 'Não'}</p>
            <p><strong>Moderação necessária:</strong> ${alimento.moderacao ? 'Sim' : 'Não'}</p>
            <p><strong>Motivo:</strong> ${alimento.motivo}</p>
            ${existe ? `<img src="${imagemUrl}" alt="${alimento.nome}">` : ''}
        `;
    });
}
