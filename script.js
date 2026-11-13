/**
 * ====================================================================
 * PROJETO: Aventura Inclusiva - Jogo Educativo Multiplataforma
 * ARQUITETURA: Vanilla JavaScript (ES6+), WCAG 2.1/2.2 AA/AAA, SPA
 * AUTOR: Engenheiro Front-end Sênior especialista em Acessibilidade
 * ====================================================================
 */

'use strict';

/* ====================================================================
   1. ESTADO GLOBAL DA APLICAÇÃO (Single Source of Truth)
   ==================================================================== */
const estadoApp = {
    estrelas: 0,
    faseAtual: 1,
    indiceQuestao: 0,
    questaoAtual: null,
    perfilAtivo: 'padrao', // 'padrao' | 'motor' | 'visual' | 'libras'
    errosNaQuestao: 0
};

/* ====================================================================
   2. BANCO DE DADOS DOS MINI-JOGOS (5 Fases Pedagógicas Inclusivas)
   ==================================================================== */
const bancoFases = {
    // FASE 1: Cores Divertidas (Discriminação visual e associação sensorial)
    1: [
        {
            pergunta: "Onde está a cor AZUL?",
            alvo: "🔵 Azul",
            opcoes: ["🔴 Vermelho", "🔵 Azul", "🟢 Verde"],
            dica: "Olhe para o céu limpo em um dia lindo ou para as águas calmas do mar!",
            sinal: "💙 Sinal de Azul (Mão em formato de 'B' ondulando suavemente)"
        },
        {
            pergunta: "Onde está a cor VERMELHA?",
            alvo: "🔴 Vermelho",
            opcoes: ["🔴 Vermelho", "🟡 Amarelo", "🔵 Azul"],
            dica: "É a cor de um moranguinho doce e de uma maçã bem madurinha!",
            sinal: "❤️ Sinal de Vermelho (Dedo indicador tocando suavemente os lábios)"
        },
        {
            pergunta: "Onde está a cor AMARELA?",
            alvo: "🟡 Amarelo",
            opcoes: ["🟢 Verde", "🟡 Amarelo", "🔴 Vermelho"],
            dica: "O sol brilhante que nos aquece e a banana deliciosa têm essa cor radiante!",
            sinal: "💛 Sinal de Amarelo (Dedo indicador descendo pelo nariz)"
        },
        {
            pergunta: "Onde está a cor VERDE?",
            alvo: "🟢 Verde",
            opcoes: ["🟣 Roxo", "🟢 Verde", "🟠 Laranja"],
            dica: "As folhas das árvores na floresta e a graminha fresca do jardim têm essa cor!",
            sinal: "💚 Sinal de Verde (Mão em formato de 'V' balançando suavemente)"
        }
    ],

    // FASE 2: Leitura e Símbolos (Letramento inicial e pareamento pictográfico)
    2: [
        {
            pergunta: "Qual palavra representa este animalzinho: 🐱?",
            alvo: "🐱 GATO",
            opcoes: ["🐶 CÃO", "🐱 GATO", "🐮 VACA"],
            dica: "É um bichinho carinhoso que ronrona e diz 'miau' quando pede carinho.",
            sinal: "🐱 Sinal de Gato (Puxar suavemente os bigodes imaginários na bochecha)"
        },
        {
            pergunta: "Qual palavra representa este brinquedo: ⚽?",
            alvo: "⚽ BOLA",
            opcoes: ["📚 LIVRO", "⚽ BOLA", "🚗 CARRO"],
            dica: "Um brinquedo redondo e alegre que a gente chuta no campinho com os amigos!",
            sinal: "⚽ Sinal de Bola (Desenhar uma esfera no ar usando as duas mãos)"
        },
        {
            pergunta: "Qual palavra representa este lugar acolhedor: 🏠?",
            alvo: "🏠 CASA",
            opcoes: ["🏠 CASA", "🌳 ÁRVORE", "🐟 PEIXE"],
            dica: "O lugar quentinho e seguro onde moramos e descansamos com quem amamos.",
            sinal: "🏠 Sinal de Casa (Palmas unidas formando o telhadinho no alto)"
        },
        {
            pergunta: "Qual palavra representa este astro radiante: ☀️?",
            alvo: "☀️ SOL",
            opcoes: ["🌙 LUA", "☀️ SOL", "⭐ ESTRELA"],
            dica: "Brilha lá no alto do céu pela manhã, iluminando o dia com calor.",
            sinal: "☀️ Sinal de Sol (Mão subindo e abrindo os dedos como raios luminosos)"
        }
    ],

    // FASE 3: Nome de Objetos (Função instrumental e cognição cotidiana)
    3: [
        {
            pergunta: "Qual é o objeto que usamos para ESCREVER e DESENHAR?",
            alvo: "✏️ Lápis",
            opcoes: ["🧸 Ursinho", "✏️ Lápis", "👟 Tênis"],
            dica: "Ele tem uma pontinha de grafite e deixa traços coloridos no papel.",
            sinal: "✏️ Sinal de Escrever (Simular segurar um lápis sobre a palma aberta)"
        },
        {
            pergunta: "Qual é o objeto que usamos para BEBER ÁGUA ou SUCO?",
            alvo: "🥛 Copo",
            opcoes: ["🥛 Copo", "🥄 Colher", "🪑 Cadeira"],
            dica: "Seguramos com a mão para nos refrescar e matar a sede com saúde.",
            sinal: "🥛 Sinal de Beber (Mão em formato de 'C' levando suavemente à boca)"
        },
        {
            pergunta: "Qual veículo tem RODAS e nos leva para passear na rua?",
            alvo: "🚗 Carro",
            opcoes: ["👕 Camisa", "🚗 Carro", "🍎 Maçã"],
            dica: "O motorista buzina, gira o volante e segue pela estrada com cinto de segurança.",
            sinal: "🚗 Sinal de Carro (Simular segurar e manusear o volante de um carro)"
        },
        {
            pergunta: "Qual objeto usamos para LER histórias mágicas e poemas?",
            alvo: "📚 Livro",
            opcoes: ["📚 Livro", "📱 Telefone", "🧦 Meia"],
            dica: "Tem várias páginas de papel cheias de letras, desenhos e aventuras incríveis.",
            sinal: "📚 Sinal de Livro (Palmas das mãos abrindo suavemente como páginas)"
        }
    ],

    // FASE 4: Contagem Mágica (Numeramento acessível e quantificação)
    4: [
        {
            pergunta: "Quantas estrelinhas mágicas há aqui: ⭐ ⭐?",
            alvo: "2 Duas",
            opcoes: ["1 Uma", "2 Duas", "3 Três"],
            dica: "Aponte o dedinho e conte com calma: uma... duas estrelinhas!",
            sinal: "🔢 Número 2 em Libras (Dedos indicador e médio erguidos em 'V')"
        },
        {
            pergunta: "Quantas bolinhas azuis você vê aqui: 🔵 🔵 🔵?",
            alvo: "3 Três",
            opcoes: ["2 Duas", "3 Três", "5 Cinco"],
            dica: "Vamos contar juntinhos: uma, duas e três bolinhas saltitantes!",
            sinal: "🔢 Número 3 em Libras (Dedos polegar, indicador e médio erguidos)"
        },
        {
            pergunta: "Quantas maçãs deliciosas há aqui: 🍎?",
            alvo: "1 Uma",
            opcoes: ["1 Uma", "4 Quatro", "2 Duas"],
            dica: "Tem apenas uma frutinha deliciosa esperando pelo seu toque!",
            sinal: "🔢 Número 1 em Libras (Apenas o dedo indicador apontado para o alto)"
        },
        {
            pergunta: "Quantos gatinhos fofinhos há aqui: 🐱 🐱 🐱 🐱?",
            alvo: "4 Quatro",
            opcoes: ["3 Três", "4 Quatro", "5 Cinco"],
            dica: "Conte cada um devagar: um, dois, três e quatro amiguinhos de quatro patas!",
            sinal: "🔢 Número 4 em Libras (Quatro dedos da mão erguidos para cima)"
        }
    ],

    // FASE 5: Primeiros Sinais em Libras (Inclusão comunicativa e empatia)
    5: [
        {
            pergunta: "Qual sinal representa AMOR e AFETO em Libras?",
            alvo: "🤲 Amor / Carinho",
            opcoes: ["🤲 Amor / Carinho", "👏 Palmas", "🦶 Pés"],
            dica: "Cruzamos os dois braços com carinho, abraçando suavemente o próprio peito!",
            sinal: "🤲 Sinal de Amor (Braços cruzados abraçando o peito com afeto)"
        },
        {
            pergunta: "Qual gesto usamos para agradecer e dizer OBRIGADO(A)?",
            alvo: "🙏 Obrigado",
            opcoes: ["👋 Tchau", "🙏 Obrigado", "👆 Para cima"],
            dica: "Tocamos com a mão na testa e no queixo, estendendo-a para a frente com um sorriso.",
            sinal: "🙏 Sinal de Agradecimento (Mão saindo da testa em direção à pessoa)"
        },
        {
            pergunta: "Qual sinal representa desejar um radiante BOM DIA?",
            alvo: "☀️ Bom Dia",
            opcoes: ["🌙 Boa Noite", "☀️ Bom Dia", "🌧️ Chuva"],
            dica: "Fazemos o sinal de 'bom' na boca e erguemos a mão como o sol nascendo feliz.",
            sinal: "☀️ Sinal de Bom Dia (Sinal de 'Bom' seguido do sol se abrindo)"
        },
        {
            pergunta: "Qual sinal representa um grande AMIGO(A) do coração?",
            alvo: "🤝 Amigo(a)",
            opcoes: ["🤝 Amigo(a)", "🚪 Porta", "🕒 Relógio"],
            dica: "Colocamos a mão direita aberta suavemente sobre o peito, no lado do coração.",
            sinal: "🤝 Sinal de Amigo (Palma da mão apoiada com ternura no peito)"
        }
    ]
};

/* ====================================================================
   3. SÍNTESE DE ÁUDIO NATIVA (Web Audio API & SpeechSynthesis)
   Multimodalidade sem necessidade de arquivos externos de áudio.
   ==================================================================== */

// Gerador de áudio via sintetizador Web Audio API (100% autônomo e sem falhas de rede)
const AudioService = {
    ctx: null,

    obterContexto() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    },

    // Acorde alegre de celebração e vitória (C5, E5, G5, C6)
    tocarSomVitoria() {
        try {
            const ctx = this.obterContexto();
            if (!ctx) return;

            const notas = [523.25, 659.25, 783.99, 1046.50]; // Dó, Mi, Sol, Dó agudo
            notas.forEach((frequencia, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(frequencia, ctx.currentTime + index * 0.1);

                gain.gain.setValueAtTime(0.001, ctx.currentTime + index * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + index * 0.1 + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.1 + 0.45);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + index * 0.1);
                osc.stop(ctx.currentTime + index * 0.1 + 0.5);
            });
        } catch (e) {
            console.warn("Web Audio API indisponível:", e);
        }
    },

    // Tom suave, calmo e acolhedor para momentos de reflexão e nova tentativa
    tocarSomAcolhedor() {
        try {
            const ctx = this.obterContexto();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(392.00, ctx.currentTime); // Sol4
            osc.frequency.exponentialRampToValueAtTime(440.00, ctx.currentTime + 0.3); // Lá4 suave

            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.55);
        } catch (e) {
            console.warn("Web Audio API indisponível:", e);
        }
    }
};

/**
 * Lê em voz alta qualquer texto usando a SpeechSynthesis nativa em pt-BR.
 * Configurada com cadência e tom acolhedores para crianças.
 */
function falarTexto(texto, callback) {
    if (!('speechSynthesis' in window)) return;

    // Cancela falas anteriores em andamento para não encavalar o áudio
    window.speechSynthesis.cancel();

    if (!texto || texto.trim() === '') return;

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.92;  // Cadência ligeiramente pausada para excelente compreensão
    utterance.pitch = 1.05; // Timbre acolhedor e encorajador

    if (callback && typeof callback === 'function') {
        utterance.onend = callback;
    }

    // Tenta obter uma voz pt-BR adequada se disponível no navegador
    const vozes = window.speechSynthesis.getVoices();
    const vozPt = vozes.find(v => v.lang.startsWith('pt-BR') || v.lang.startsWith('pt'));
    if (vozPt) {
        utterance.voice = vozPt;
    }

    window.speechSynthesis.speak(utterance);
}

/**
 * Repete a instrução e a pergunta da questão atual quando o usuário clica no botão de áudio.
 */
function falarInstrucaoAtual() {
    if (estadoApp.questaoAtual) {
        falarTexto(estadoApp.questaoAtual.pergunta);
    }
}

/* ====================================================================
   4. GERENCIAMENTO DE TELAS (SPA - Single Page Application)
   Garante alternância fluida com classes de estado e acessibilidade WCAG.
   ==================================================================== */

/**
 * Alterna entre as telas da aplicação, atualizando atributos ARIA e focando no cabeçalho
 * para que leitores de tela anunciem a mudança de tela de forma autônoma (WCAG 2.4.3).
 */
function navegarPara(idTelaAlvo) {
    const telas = document.querySelectorAll('.tela');
    let telaAtivada = null;

    telas.forEach(tela => {
        if (tela.id === idTelaAlvo) {
            tela.classList.add('ativa');
            tela.removeAttribute('aria-hidden');
            telaAtivada = tela;
        } else {
            tela.classList.remove('ativa');
            tela.setAttribute('aria-hidden', 'true');
        }
    });

    // Gerenciamento acessível de foco: foca no título da nova tela ativa
    if (telaAtivada) {
        const titulo = telaAtivada.querySelector('h1, h2, h3');
        if (titulo) {
            titulo.setAttribute('tabindex', '-1');
            titulo.focus();
        }
    }
}

function iniciarJogo() {
    navegarPara('tela-fases');
    falarTexto("Escolha uma aventura mágica para começar a aprender!");
}

function voltarInicio() {
    window.speechSynthesis.cancel();
    navegarPara('tela-inicio');
    falarTexto("Você voltou para a página inicial.");
}

function voltarFases() {
    window.speechSynthesis.cancel();
    navegarPara('tela-fases');
    falarTexto("Escolha outra aventura!");
}

/* ====================================================================
   5. SISTEMA DE PERFIS DE ACESSIBILIDADE COM TOGGLE (LIGA/DESLIGA)
   Permite ativar um modo e desativá-lo clicando novamente no mesmo botão.
   Persiste a escolha no localStorage com suporte a aria-pressed.
   ==================================================================== */

const NOMES_PERFIS = {
    padrao: 'Padrão',
    motor: 'Modo Motor com Botões Grandes',
    visual: 'Modo Visual de Alto Contraste',
    libras: 'Modo Libras com Sinais Visuais'
};

/**
 * Aplica o perfil no DOM, sincroniza classes no body e atributos acessíveis.
 */
function aplicarPerfil(tipo, salvarNoStorage = true, anunciarPorVoz = false) {
    const corpo = document.getElementById("corpo-pagina") || document.body;
    estadoApp.perfilAtivo = tipo;

    // Remove classes anteriores de modo
    corpo.classList.remove('modo-padrao', 'modo-motor', 'modo-visual', 'modo-libras');

    // Aplica a classe correspondente
    if (tipo === 'padrao') {
        corpo.classList.add('modo-padrao');
    } else {
        corpo.classList.add(`modo-${tipo}`);
    }

    // Atualiza o estado visual e ARIA dos botões de acessibilidade
    const botoes = document.querySelectorAll('.card-opcao-perfil');
    botoes.forEach(btn => {
        const ehEstePerfil = btn.id === `btn-${tipo}`;
        if (ehEstePerfil) {
            btn.classList.add('ativo');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('ativo');
            btn.setAttribute('aria-pressed', 'false');
        }
    });

    // Se estiver no jogo e o modo libras for ativado, ajusta o painel de apoio
    const painelLibras = document.getElementById("painel-libras");
    if (painelLibras) {
        if (tipo === 'libras' && document.getElementById("tela-jogo").classList.contains('ativa')) {
            painelLibras.classList.remove('escondido');
        } else if (tipo !== 'libras') {
            painelLibras.classList.add('escondido');
        }
    }

    // Persistência no localStorage
    if (salvarNoStorage) {
        localStorage.setItem("perfil_acessibilidade", tipo);
    }

    // Anúncio falado para feedback multimodal
    if (anunciarPorVoz) {
        const nomeLegivel = NOMES_PERFIS[tipo] || tipo;
        falarTexto(`${nomeLegivel} ativado com sucesso!`);
    }
}

/**
 * Função de Toggle (Liga/Desliga):
 * - Se o usuário clica no mesmo perfil ativo (que não seja padrão), DESLIGA e volta para o padrão.
 * - Se clica em outro perfil, ativa o novo perfil escolhido.
 */
function mudarPerfil(tipo) {
    const perfilAtivoAtual = estadoApp.perfilAtivo;

    // Toggle: Se já estava ativo e não é o padrão, desliga voltando ao padrão
    if (perfilAtivoAtual === tipo && tipo !== 'padrao') {
        aplicarPerfil('padrao', true, false);
        const nomeDesativado = NOMES_PERFIS[tipo] || tipo;
        falarTexto(`${nomeDesativado} desativado. Retornando ao modo padrão.`);
    } else {
        aplicarPerfil(tipo, true, true);
    }
}

/* ====================================================================
   6. LÓGICA DO MINI-JOGO E MONTAGEM DINÂMICA DAS QUESTÕES
   Embaralhamento seguro (Fisher-Yates) e geração de alternativas acessíveis.
   ==================================================================== */

/**
 * Algoritmo Fisher-Yates para embaralhar alternativas sem viés estatístico.
 */
function embaralharArray(arrayOriginal) {
    const copia = [...arrayOriginal];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

/**
 * Carrega e inicia uma fase específica selecionada pelo usuário.
 */
function carregarFase(numero) {
    estadoApp.faseAtual = numero;
    estadoApp.indiceQuestao = 0;
    estadoApp.errosNaQuestao = 0;

    const titulosFases = {
        1: "Fase 1: Cores Divertidas",
        2: "Fase 2: Leitura e Símbolos",
        3: "Fase 3: Nome de Objetos",
        4: "Fase 4: Contagem Mágica",
        5: "Fase 5: Primeiros Sinais em Libras"
    };

    const elementoTitulo = document.getElementById("titulo-fase");
    if (elementoTitulo) {
        elementoTitulo.innerText = titulosFases[numero] || `Fase ${numero}`;
    }

    navegarPara('tela-jogo');
    montarQuestao();
}

/**
 * Constrói a interface da questão atual, embaralha opções e aciona o suporte acessível.
 */
function montarQuestao() {
    const listaQuestoes = bancoFases[estadoApp.faseAtual];
    if (!listaQuestoes || listaQuestoes.length === 0) return;

    // Proteção de índice cíclico
    if (estadoApp.indiceQuestao >= listaQuestoes.length) {
        estadoApp.indiceQuestao = 0;
    }

    const questao = listaQuestoes[estadoApp.indiceQuestao];
    estadoApp.questaoAtual = questao;

    // Atualiza texto da instrução e sinal de apoio
    const instrucaoEl = document.getElementById("instrucao-texto");
    const textoSinalEl = document.getElementById("texto-sinal-libras");
    const painelLibrasEl = document.getElementById("painel-libras");
    const opcoesContainer = document.getElementById("opcoes-container");
    const feedbackContainer = document.getElementById("feedback-container");
    const btnSairFase = document.getElementById("btn-sair-fase");

    instrucaoEl.innerText = questao.pergunta;
    instrucaoEl.style.display = "block";

    if (textoSinalEl) {
        textoSinalEl.innerText = questao.sinal;
    }

    // Exibe o painel de sinais se o modo Libras estiver ativo
    if (painelLibrasEl) {
        if (estadoApp.perfilAtivo === 'libras') {
            painelLibrasEl.classList.remove('escondido');
        } else {
            painelLibrasEl.classList.add('escondido');
        }
    }

    // Oculta área de feedback e exibe opções
    feedbackContainer.classList.add('escondido');
    opcoesContainer.style.display = "flex";
    opcoesContainer.innerHTML = "";
    if (btnSairFase) btnSairFase.style.display = "inline-block";

    // Embaralha as alternativas dinamicamente
    const opcoesEmbaralhadas = embaralharArray(questao.opcoes);

    // Renderiza cada opção como um botão acessível com alvos adequados (WCAG 2.5.5)
    opcoesEmbaralhadas.forEach((opcaoTexto, index) => {
        const botao = document.createElement("button");
        botao.className = "btn-opcao";
        botao.innerText = opcaoTexto;
        botao.setAttribute('role', 'button');
        botao.setAttribute('aria-label', `Opção ${index + 1}: ${opcaoTexto}`);
        botao.onclick = () => verificarResposta(opcaoTexto);
        opcoesContainer.appendChild(botao);
    });

    // Leitura automática amigável da instrução após transição de tela
    setTimeout(() => {
        falarTexto(questao.pergunta);
    }, 380);
}

/* ====================================================================
   7. FEEDBACK POSITIVO E MULTIMODAL ("ERRO ACOLHEDOR")
   Ao acertar: celebração, estrelas e áudio alegre.
   Ao errar: acolhimento carinhoso, dica pedagógica, sem Game Over!
   ==================================================================== */

/**
 * Valida a resposta do jogador e exibe o feedback correspondente.
 */
function verificarResposta(escolha) {
    const questao = estadoApp.questaoAtual;
    if (!questao) return;

    const opcoesContainer = document.getElementById("opcoes-container");
    const instrucaoEl = document.getElementById("instrucao-texto");
    const painelLibrasEl = document.getElementById("painel-libras");
    const feedbackContainer = document.getElementById("feedback-container");
    const feedbackConteudo = document.getElementById("feedback-conteudo");
    const bonecoFeedback = document.getElementById("boneco-feedback");
    const feedbackAcoes = document.getElementById("feedback-acoes");
    const btnSairFase = document.getElementById("btn-sair-fase");

    // Oculta a área de seleção durante o feedback
    opcoesContainer.style.display = "none";
    instrucaoEl.style.display = "none";
    if (painelLibrasEl) painelLibrasEl.classList.add('escondido');
    if (btnSairFase) btnSairFase.style.display = "none";

    feedbackContainer.classList.remove('escondido');

    // ================= ACERTO (Celebração e Reforço Positivo) =================
    if (escolha === questao.alvo) {
        estadoApp.errosNaQuestao = 0;
        estadoApp.estrelas++;
        localStorage.setItem("total_estrelas", estadoApp.estrelas);

        // Atualiza o contador de estrelas no DOM
        const contadorEstrelas = document.getElementById("contador-estrelas");
        if (contadorEstrelas) {
            contadorEstrelas.innerText = estadoApp.estrelas;
        }

        // Bonequinho feliz comemorando (com animação de pulo)
        bonecoFeedback.className = "boneco-animado boneco-feliz";
        bonecoFeedback.innerHTML = "🥳🎉⭐";

        // Estilização e conteúdo de sucesso
        feedbackConteudo.className = "feedback-sucesso";
        feedbackConteudo.innerHTML = `
            <p><strong>Uau, sensacional! Você acertou!</strong></p>
            <p>⭐ Você conquistou mais 1 estrela mágica! (Total: <strong>${estadoApp.estrelas}</strong> estrelas)</p>
            <p>🚀 Você está aprendendo muito rápido e brilhando na nossa aventura!</p>
        `;

        // Botão para avançar na jornada
        feedbackAcoes.innerHTML = `
            <button onclick="proximaRodada()" class="btn-principal btn-proximo-fase" id="btn-proximo">
                Continuar Aventura ✨
            </button>
        `;

        // Áudio sintetizado e leitura carinhosa
        AudioService.tocarSomVitoria();
        falarTexto(`Uau, parabéns! Você acertou e ganhou uma estrela mágica! Seu total agora é de ${estadoApp.estrelas} estrelas!`);

    } else {
        // ================= ERRO ACOLHEDOR (Sem Game Over / Afeto e Dica) =================
        estadoApp.errosNaQuestao++;

        // Bonequinho acolhedor com carinho e abraço
        bonecoFeedback.className = "boneco-animado boneco-acolhedor";
        bonecoFeedback.innerHTML = "🤗💖✨";

        // Estilização acolhedora e dica pedagógica clara
        feedbackConteudo.className = "feedback-erro";
        feedbackConteudo.innerHTML = `
            <p><strong>💡 Quase lá! Não se preocupe!</strong></p>
            <p>Errar faz parte da nossa aventura mágica e nos ajuda a aprender coisas novas!</p>
            <p style="margin-top: 10px;">🔍 <strong>Dica carinhosa:</strong> ${questao.dica}</p>
            <p style="margin-top: 8px;">💪 Vamos tentar juntinhos com muito carinho? Você consegue!</p>
        `;

        // Opções para a criança: Tentar novamente agora ou pular se preferir
        feedbackAcoes.innerHTML = `
            <button onclick="tentarNovamente()" class="btn-principal btn-tentar-novamente" id="btn-tentar">
                💖 Tentar de Novo com Carinho
            </button>
            <button onclick="proximaRodada()" class="btn-pular-questao" id="btn-pular">
                Pular para o Próximo Desafio ➡️
            </button>
        `;

        // Áudio suave e sintetizador de voz com a dica pedagógica
        AudioService.tocarSomAcolhedor();
        falarTexto(`Quase lá! Não se preocupe, errar nos ensina o caminho. A dica é: ${questao.dica}. Vamos tentar mais uma vez?`);
    }

    // Foca no container de feedback para leitura acessível imediata
    feedbackContainer.setAttribute('tabindex', '-1');
    feedbackContainer.focus();
}

/**
 * Permite que a criança tente responder a mesma questão novamente após receber a dica,
 * restaurando as opções sem qualquer tipo de penalidade.
 */
function tentarNovamente() {
    const feedbackContainer = document.getElementById("feedback-container");
    const opcoesContainer = document.getElementById("opcoes-container");
    const instrucaoEl = document.getElementById("instrucao-texto");
    const painelLibrasEl = document.getElementById("painel-libras");
    const btnSairFase = document.getElementById("btn-sair-fase");

    feedbackContainer.classList.add('escondido');
    instrucaoEl.style.display = "block";
    opcoesContainer.style.display = "flex";
    if (btnSairFase) btnSairFase.style.display = "inline-block";

    if (painelLibrasEl && estadoApp.perfilAtivo === 'libras') {
        painelLibrasEl.classList.remove('escondido');
    }

    // Relembra a questão e a dica para apoiar a tentativa
    falarTexto(`${estadoApp.questaoAtual.pergunta}. Lembre-se: ${estadoApp.questaoAtual.dica}`);
}

/**
 * Avança para a próxima rodada da fase atual ou exibe a tela de conclusão da fase.
 */
function proximaRodada() {
    const listaQuestoes = bancoFases[estadoApp.faseAtual];
    estadoApp.indiceQuestao++;

    // Se completou todas as questões da fase atual:
    if (estadoApp.indiceQuestao >= listaQuestoes.length) {
        exibirConclusaoFase();
    } else {
        montarQuestao();
    }
}

/**
 * Celebração de fase completa com feedback carinhoso e opções para continuar.
 */
function exibirConclusaoFase() {
    const opcoesContainer = document.getElementById("opcoes-container");
    const instrucaoEl = document.getElementById("instrucao-texto");
    const painelLibrasEl = document.getElementById("painel-libras");
    const feedbackContainer = document.getElementById("feedback-container");
    const feedbackConteudo = document.getElementById("feedback-conteudo");
    const bonecoFeedback = document.getElementById("boneco-feedback");
    const feedbackAcoes = document.getElementById("feedback-acoes");
    const btnSairFase = document.getElementById("btn-sair-fase");

    opcoesContainer.style.display = "none";
    instrucaoEl.style.display = "none";
    if (painelLibrasEl) painelLibrasEl.classList.add('escondido');
    if (btnSairFase) btnSairFase.style.display = "none";

    feedbackContainer.classList.remove('escondido');

    bonecoFeedback.className = "boneco-animado boneco-feliz";
    bonecoFeedback.innerHTML = "🏆🌟🎊";

    feedbackConteudo.className = "feedback-sucesso";
    feedbackConteudo.innerHTML = `
        <p style="font-size: 24px;"><strong>🎉 PARABÉNS! FASE CONCLUÍDA COM SUCESSO! 🎉</strong></p>
        <p>Você completou todos os desafios desta fase com muita dedicação e alegria!</p>
        <p>⭐ Você agora tem <strong>${estadoApp.estrelas} estrelas mágicas</strong> no seu baú de conquistas!</p>
        <p>Você é uma criança brilhante e muito especial! 💖</p>
    `;

    feedbackAcoes.innerHTML = `
        <button onclick="carregarFase(estadoApp.faseAtual)" class="btn-principal btn-tentar-novamente">
            🔄 Jogar Esta Fase Novamente
        </button>
        <button onclick="voltarFases()" class="btn-principal btn-proximo-fase" style="margin-top: 10px;">
            🗺️ Escolher Outra Aventura
        </button>
    `;

    AudioService.tocarSomVitoria();
    falarTexto(`Parabéns! Você concluiu todos os desafios desta fase! Você tem ${estadoApp.estrelas} estrelas mágicas! Que orgulho de você!`);
}

/* ====================================================================
   8. INICIALIZAÇÃO DA APLICAÇÃO (DOMContentLoaded & Acessibilidade)
   ==================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega o perfil salvo no localStorage (ou 'padrao')
    const perfilSalvo = localStorage.getItem("perfil_acessibilidade") || "padrao";
    aplicarPerfil(perfilSalvo, false, false);

    // 2. Carrega e exibe a pontuação de estrelas salva
    const estrelasSalvas = localStorage.getItem("total_estrelas");
    if (estrelasSalvas !== null) {
        const qtd = parseInt(estrelasSalvas, 10);
        estadoApp.estrelas = isNaN(qtd) ? 0 : qtd;
    }
    const contadorEstrelas = document.getElementById("contador-estrelas");
    if (contadorEstrelas) {
        contadorEstrelas.innerText = estadoApp.estrelas;
    }

    // 3. Garante que a tela de início seja a tela ativa inicial
    navegarPara('tela-inicio');

    // 4. Carrega as vozes do navegador antecipadamente (necessário no Chrome/Edge)
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }
});
