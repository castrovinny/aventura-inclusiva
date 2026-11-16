/**
 * ====================================================================
 * PROJETO: Aventura Inclusiva — Jogo Educativo Infantil Multiplataforma
 * ARQUITETURA: Vanilla JavaScript (ES6+), WCAG 2.2 AAA, SPA Resiliente
 * RECURSOS:
 *  - Voz Sintética Feminina e Acolhedora (pt-BR) via Web Speech API
 *  - 10 Fases Pedagógicas Completas por Categoria (50 Fases no Total)
 *  - Desbloqueio Progressivo de Fases e Estrelas Mágicas no Storage
 *  - Web Audio API (pop, vitória, estrelas, xilofone acolhedor)
 *  - Motor de Confetes em Canvas 60 FPS
 * ====================================================================
 */

'use strict';

/* ====================================================================
   1. GERENCIADOR RESILIENTE DE ARMAZENAMENTO (Storage Seguro)
   Protege contra SecurityError em navegação anônima ou cookies restritos.
   ==================================================================== */
const safeStorage = {
    memoria: {},

    obter(chave, padrao = null) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const valor = window.localStorage.getItem(chave);
                return valor !== null ? valor : padrao;
            }
        } catch (e) {
            console.warn('[Storage] Fallback em memória ativado:', e);
        }
        return this.memoria[chave] !== undefined ? this.memoria[chave] : padrao;
    },

    salvar(chave, valor) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(chave, String(valor));
            }
        } catch (e) {
            console.warn('[Storage] Fallback em memória ao salvar:', e);
        }
        this.memoria[chave] = String(valor);
    }
};

/* ====================================================================
   2. ESTADO GLOBAL DA APLICAÇÃO (Single Source of Truth)
   ==================================================================== */
const estadoApp = {
    estrelas: 0,
    categoriaAtiva: 'cores', // 'cores' | 'letramento' | 'objetos' | 'contagem' | 'libras'
    faseAtual: 1,            // 1 a 10
    questaoAtual: null,
    perfilAtivo: 'padrao',   // 'padrao' | 'motor' | 'visual' | 'libras'
    errosNaQuestao: 0,
    progresso: {
        cores:      { desbloqueada: 1, estrelas: [] },
        letramento: { desbloqueada: 1, estrelas: [] },
        objetos:    { desbloqueada: 1, estrelas: [] },
        contagem:   { desbloqueada: 1, estrelas: [] },
        libras:     { desbloqueada: 1, estrelas: [] }
    }
};

/* ====================================================================
   3. BANCO DE DADOS: 10 FASES POR CATEGORIA (50 FASES COMPLETAS)
   Progressão pedagógica gradual, lúdica e com apoio de Libras em todas!
   ==================================================================== */
const bancoCategorias = {
    // ----------------------------------------------------------------
    // CATEGORIA 1: CORES DIVERTIDAS (10 Fases Graduais)
    // ----------------------------------------------------------------
    cores: {
        nome: "Cores Divertidas",
        icone: "🎨",
        fases: {
            1: {
                nomeCurto: "Cor Azul",
                pergunta: "Onde está a linda cor AZUL do céu e do mar?",
                alvo: "🔵 Azul",
                opcoes: ["🔴 Vermelho", "🔵 Azul", "🟢 Verde"],
                dica: "Olhe para o céu limpo em um dia ensolarado ou para a água da piscina!",
                sinalNome: "Sinal de Azul em Libras",
                sinalEmoji: "🔵",
                sinalPassos: "Mãozinha aberta em formato de 'B' ondulando suavemente como as ondas do mar!"
            },
            2: {
                nomeCurto: "Cor Vermelha",
                pergunta: "Onde está a brilhante cor VERMELHA do moranguinho?",
                alvo: "🔴 Vermelho",
                opcoes: ["🔴 Vermelho", "🟡 Amarelo", "🔵 Azul"],
                dica: "É a cor de uma maçã docinha e do coração desenhado no papel!",
                sinalNome: "Sinal de Vermelho em Libras",
                sinalEmoji: "❤️",
                sinalPassos: "Dedo indicador tocando com carinho nos lábios da boquinha!"
            },
            3: {
                nomeCurto: "Cor Amarela",
                pergunta: "Onde está a radiante cor AMARELA do Sol?",
                alvo: "🟡 Amarelo",
                opcoes: ["🟢 Verde", "🟡 Amarelo", "🔴 Vermelho"],
                dica: "É a cor do sol brilhante no céu e de uma banana bem madurinha!",
                sinalNome: "Sinal de Amarelo em Libras",
                sinalEmoji: "☀️",
                sinalPassos: "Dedo indicador descendo suavemente pelo nariz como um raio de sol!"
            },
            4: {
                nomeCurto: "Cor Verde",
                pergunta: "Onde está a cor VERDE da floresta e da graminha?",
                alvo: "🟢 Verde",
                opcoes: ["🟣 Roxo", "🟢 Verde", "🟠 Laranja"],
                dica: "As folhinhas das árvores e o gramado do parque têm essa cor mágica!",
                sinalNome: "Sinal de Verde em Libras",
                sinalEmoji: "🌿",
                sinalPassos: "Faça um 'V' com os dois dedinhos e balance com suavidade!"
            },
            5: {
                nomeCurto: "Cor Laranja",
                pergunta: "Onde está a quentinha cor LARANJA da cenourinha?",
                alvo: "🟠 Laranja",
                opcoes: ["🟠 Laranja", "🔵 Azul", "🟣 Roxo"],
                dica: "É a cor da fruta laranja bem docinha e do pelo do tigrezinho!",
                sinalNome: "Sinal de Laranja em Libras",
                sinalEmoji: "🍊",
                sinalPassos: "Mão em formato de conchinha apertando na frente da boca!"
            },
            6: {
                nomeCurto: "Cor Roxa",
                pergunta: "Onde está a encantadora cor ROXA das uvas doces?",
                alvo: "🟣 Roxo",
                opcoes: ["🟡 Amarelo", "🟢 Verde", "🟣 Roxo"],
                dica: "É a cor de um cacho de uvas maduras e da flor de lavanda!",
                sinalNome: "Sinal de Roxo em Libras",
                sinalEmoji: "🍇",
                sinalPassos: "Mãozinha em formato de 'R' balançando suavemente no ar!"
            },
            7: {
                nomeCurto: "Cor Rosa",
                pergunta: "Onde está a doce cor ROSA do algodão-doce?",
                alvo: "🌸 Rosa",
                opcoes: ["🌸 Rosa", "🔴 Vermelho", "🔵 Azul"],
                dica: "É a cor das pétalas de rosas e do sorvete de morango com leite!",
                sinalNome: "Sinal de Rosa em Libras",
                sinalEmoji: "🌸",
                sinalPassos: "Mão em 'P' girando suavemente pertinho da bochecha!"
            },
            8: {
                nomeCurto: "Cores Quentes",
                pergunta: "Qual destas cores lembra o calor quentinho do FOGO?",
                alvo: "🔥 Vermelho e Laranja",
                opcoes: ["🔥 Vermelho e Laranja", "❄️ Azul e Gelo", "🌿 Verde Escuro"],
                dica: "Pense no fogo que nos aquece e nas labaredas radiantes da fogueira!",
                sinalNome: "Sinal de Quente em Libras",
                sinalEmoji: "🔥",
                sinalPassos: "Mão em concha na boca abrindo e puxando o ar quentinho!"
            },
            9: {
                nomeCurto: "Mistura Mágica",
                pergunta: "Se misturarmos a cor AZUL com a cor AMARELA, o que nasce?",
                alvo: "🟢 Cor Verde",
                opcoes: ["🟢 Cor Verde", "🔴 Cor Vermelha", "🟣 Cor Roxa"],
                dica: "Misturando o céu azul com a luz amarela do sol, nascem as plantinhas verdes!",
                sinalNome: "Sinal de Misturar em Libras",
                sinalEmoji: "🧪",
                sinalPassos: "Duas mãozinhas girando uma sobre a outra unindo as cores!"
            },
            10: {
                nomeCurto: "Arco-Íris Mágico",
                pergunta: "O que tem TODAS as cores brilhando juntas no céu depois da chuva?",
                alvo: "🌈 O Arco-Íris",
                opcoes: ["🌈 O Arco-Íris", "🌙 A Noite Escura", "☁️ Apenas Fumaça"],
                dica: "É uma ponte colorida e mágica pintada lá no alto com muito amor!",
                sinalNome: "Sinal de Arco-Íris em Libras",
                sinalEmoji: "🌈",
                sinalPassos: "Mão aberta desenhando um grande arco colorido no céu!"
            }
        }
    },

    // ----------------------------------------------------------------
    // CATEGORIA 2: LEITURA E LETRAMENTO (10 Fases Graduais)
    // ----------------------------------------------------------------
    letramento: {
        nome: "Leitura e Letramento",
        icone: "📚",
        fases: {
            1: {
                nomeCurto: "Vogal A",
                pergunta: "Qual palavra começa com a letrinha A da ABELHINHA 🐝?",
                alvo: "🍎 AMOR / ABELHA",
                opcoes: ["🍎 AMOR / ABELHA", "⚽ BOLA", "🐱 GATO"],
                dica: "Abra bem a boquinha e faça o sonzinho: AAAAA!",
                sinalNome: "Letra A em Libras",
                sinalEmoji: "🅰️",
                sinalPassos: "Mão fechadinha com o polegar encostado na lateral dos dedos!"
            },
            2: {
                nomeCurto: "Vogal E",
                pergunta: "Qual palavra começa com a letrinha E da ESTRELINHA ⭐?",
                alvo: "⭐ ESTRELA / ELEFANTE",
                opcoes: ["⭐ ESTRELA / ELEFANTE", "🚗 CARRO", "☀️ SOL"],
                dica: "Faça o som com um sorriso nos lábios: EEEEE!",
                sinalNome: "Letra E em Libras",
                sinalEmoji: "🌟",
                sinalPassos: "Todos os dedinhos dobrados para baixo encostando no polegar!"
            },
            3: {
                nomeCurto: "Vogal I",
                pergunta: "Qual palavra começa com a letrinha I da ILHA 🏝️?",
                alvo: "🏝️ ILHA / IGREJA",
                opcoes: ["🏠 CASA", "🏝️ ILHA / IGREJA", "⚽ BOLA"],
                dica: "Erga apenas o menor dedinho da mão e diga: IIIII!",
                sinalNome: "Letra I em Libras",
                sinalEmoji: "🌴",
                sinalPassos: "Mão fechada com apenas o dedinho mindinho erguido para o alto!"
            },
            4: {
                nomeCurto: "Vogal O",
                pergunta: "Qual palavra começa com a letrinha O dos OLHINHOS 👀?",
                alvo: "👀 OLHO / OVELHA",
                opcoes: ["✏️ LÁPIS", "👀 OLHO / OVELHA", "🌳 ÁRVORE"],
                dica: "Faça uma bolinha redonda com os lábios e diga: OOOOO!",
                sinalNome: "Letra O em Libras",
                sinalEmoji: "⭕",
                sinalPassos: "Junte todos os dedos formando um círculo redondo como a letra O!"
            },
            5: {
                nomeCurto: "Vogal U",
                pergunta: "Qual palavra começa com a letrinha U da UVINHA 🍇?",
                alvo: "🍇 UVA / URSO",
                opcoes: ["🍇 UVA / URSO", "🚗 CARRO", "🐱 GATO"],
                dica: "Junte dois dedinhos para o alto e diga com carinho: UUUUU!",
                sinalNome: "Letra U em Libras",
                sinalEmoji: "🍇",
                sinalPassos: "Dedos indicador e médio erguidos juntinhos para cima!"
            },
            6: {
                nomeCurto: "Amiguinho Gato",
                pergunta: "Qual palavra representa este bichinho fofinho: 🐱?",
                alvo: "🐱 GATO",
                opcoes: ["🐶 CÃO", "🐱 GATO", "🐮 VACA"],
                dica: "É um amiguinho que ronrona e fala 'miau' pedindo carinho!",
                sinalNome: "Sinal de Gato em Libras",
                sinalEmoji: "🐱",
                sinalPassos: "Puxe com as pontinhas dos dedos os bigodinhos imaginários na bochecha!"
            },
            7: {
                nomeCurto: "Amiguinho Cão",
                pergunta: "Qual palavra representa este amigo fiel: 🐶?",
                alvo: "🐶 CACHORRO",
                opcoes: ["🐶 CACHORRO", "🐱 GATO", "🐟 PEIXE"],
                dica: "Ele abana o rabinho feliz, late 'au au' e adora brincar no quintal!",
                sinalNome: "Sinal de Cachorro em Libras",
                sinalEmoji: "🐶",
                sinalPassos: "Bata com a mãozinha suavemente na perna chamando o cachorrinho!"
            },
            8: {
                nomeCurto: "Nosso Lar",
                pergunta: "Qual palavra representa o lugar seguro onde moramos: 🏠?",
                alvo: "🏠 CASA",
                opcoes: ["🏠 CASA", "🌳 ÁRVORE", "🚗 CARRO"],
                dica: "É o lugar onde descansamos e recebemos o abraço da nossa família!",
                sinalNome: "Sinal de Casa em Libras",
                sinalEmoji: "🏠",
                sinalPassos: "Palmas unidas no alto formando o telhadinho quentinho da casa!"
            },
            9: {
                nomeCurto: "Rimas Divertidas",
                pergunta: "Qual dessas palavrinhas rima com PATO 🦆?",
                alvo: "🐱 GATO",
                opcoes: ["🐱 GATO", "📚 LIVRO", "☀️ SOL"],
                dica: "Ouça o sonzinho final: PATO combina com... GATO!",
                sinalNome: "Sinal de Pato em Libras",
                sinalEmoji: "🦆",
                sinalPassos: "Mão na frente da boca abrindo e fechando como um biquinho!"
            },
            10: {
                nomeCurto: "Frase do Coração",
                pergunta: "Complete a frase mágica: 'Eu gosto de ___ com meus amigos!'",
                alvo: "🎉 BRINCAR",
                opcoes: ["🎉 BRINCAR", "🌧️ CHOVER", "🚪 FECHAR"],
                dica: "É a melhor coisa que as crianças fazem com alegria e sorrisos!",
                sinalNome: "Sinal de Brincar em Libras",
                sinalEmoji: "🎉",
                sinalPassos: "Mãos em 'Y' balançando felizes de um lado para o outro!"
            }
        }
    },

    // ----------------------------------------------------------------
    // CATEGORIA 3: NOME DE OBJETOS E COTIDIANO (10 Fases Graduais)
    // ----------------------------------------------------------------
    objetos: {
        nome: "Objetos e Cotidiano",
        icone: "🧸",
        fases: {
            1: {
                nomeCurto: "Escrever e Desenhar",
                pergunta: "Qual objeto usamos para ESCREVER e colorir o papel?",
                alvo: "✏️ Lápis",
                opcoes: ["🧸 Ursinho", "✏️ Lápis", "👟 Tênis"],
                dica: "Ele tem uma pontinha de grafite e faz traços lindos no caderno!",
                sinalNome: "Sinal de Lápis / Escrever",
                sinalEmoji: "✏️",
                sinalPassos: "Segure um lápis imaginário na mão e deslize sobre a palma aberta!"
            },
            2: {
                nomeCurto: "Beber Água",
                pergunta: "Qual objeto usamos para BEBER uma água fresca ou suco?",
                alvo: "🥛 Copo",
                opcoes: ["🥛 Copo", "🥄 Colher", "🪑 Cadeira"],
                dica: "Seguramos com a mão para matar a sede com muita saúde!",
                sinalNome: "Sinal de Copo em Libras",
                sinalEmoji: "🥛",
                sinalPassos: "Faça o formato da letra 'C' com a mão e leve pertinho da boca!"
            },
            3: {
                nomeCurto: "Passear na Estrada",
                pergunta: "Qual veículo tem RODAS e leva a família para passear?",
                alvo: "🚗 Carro",
                opcoes: ["👕 Camisa", "🚗 Carro", "🍎 Maçã"],
                dica: "O motorista segura o volante, coloca o cinto e segue pela pista!",
                sinalNome: "Sinal de Carro em Libras",
                sinalEmoji: "🚗",
                sinalPassos: "Segure um volante imaginário com as duas mãos e gire para os lados!"
            },
            4: {
                nomeCurto: "Ler Aventuras",
                pergunta: "Qual objeto tem páginas cheias de HISTÓRIAS e desenhos?",
                alvo: "📚 Livro",
                opcoes: ["📚 Livro", "📱 Celular", "🧦 Meia"],
                dica: "Tem capa, páginas de papel e nos leva para reinos mágicos!",
                sinalNome: "Sinal de Livro em Libras",
                sinalEmoji: "📚",
                sinalPassos: "Palmas das mãos unidas que se abrem como as páginas de um livro!"
            },
            5: {
                nomeCurto: "Recortar Papel",
                pergunta: "Qual objeto sem ponta usamos para RECORTAR papéis coloridos?",
                alvo: "✂️ Tesoura",
                opcoes: ["✂️ Tesoura", "🥛 Copo", "🛋️ Sofá"],
                dica: "Abre e fecha com os dedinhos fazendo cortes bem certinhos!",
                sinalNome: "Sinal de Tesoura em Libras",
                sinalEmoji: "✂️",
                sinalPassos: "Dedos indicador e médio abrindo e fechando como lâminas suaves!"
            },
            6: {
                nomeCurto: "Calçar os Pés",
                pergunta: "O que calçamos nos PÉS para correr e pular sem machucar?",
                alvo: "👟 Tênis",
                opcoes: ["👟 Tênis", "🧢 Boné", "🧤 Luva"],
                dica: "Tem cadarço ou velcro e protege a sola do pé no parquinho!",
                sinalNome: "Sinal de Sapato em Libras",
                sinalEmoji: "👟",
                sinalPassos: "Mãos fechadas batendo suavemente pelos polegares imitando os calçados!"
            },
            7: {
                nomeCurto: "Comer a Comidinha",
                pergunta: "Qual talher usamos para tomar uma SOPINHA bem gostosa?",
                alvo: "🥄 Colher",
                opcoes: ["🥄 Colher", "✏️ Lápis", "🪑 Cadeira"],
                dica: "É redondinha na ponta e segura o caldo da sopa sem derramar!",
                sinalNome: "Sinal de Colher em Libras",
                sinalEmoji: "🥄",
                sinalPassos: "Mão em conchinha levando comida imaginária até a boquinha!"
            },
            8: {
                nomeCurto: "Hora do Banho",
                pergunta: "O que usamos no banho para ficar CHEIROSO e limpinho?",
                alvo: "🧼 Sabonete",
                opcoes: ["🧼 Sabonete", "📚 Livro", "🚗 Carro"],
                dica: "Faz muita espuma perfumada e tira toda a sujeirinha com carinho!",
                sinalNome: "Sinal de Sabonete em Libras",
                sinalEmoji: "🧼",
                sinalPassos: "Esfregue as duas palmas das mãos como se estivesse ensaboando!"
            },
            9: {
                nomeCurto: "Dormir Quentinho",
                pergunta: "Onde deitamos com travesseiro macio para ter LINDOS SONHOS?",
                alvo: "🛏️ Cama",
                opcoes: ["🛏️ Cama", "👟 Tênis", "✂️ Tesoura"],
                dica: "Tem colchão fofinho, cobertor quente e nos abraça na hora de dormir!",
                sinalNome: "Sinal de Cama / Dormir",
                sinalEmoji: "🛏️",
                sinalPassos: "Incline a cabeça apoiando a bochecha nas palmas das mãos unidas!"
            },
            10: {
                nomeCurto: "Dentinhos Limpos",
                pergunta: "Qual objeto usamos com pasta para deixar os DENTES limpinhos?",
                alvo: "🪥 Escova de Dentes",
                opcoes: ["🪥 Escova de Dentes", "🥄 Colher", "🧢 Boné"],
                dica: "Tem cerdas macias e escova cada dentinho para ficarem branquinhos!",
                sinalNome: "Sinal de Escovar Dentes",
                sinalEmoji: "🪥",
                sinalPassos: "Dedo indicador na frente dos dentes movendo para a esquerda e direita!"
            }
        }
    },

    // ----------------------------------------------------------------
    // CATEGORIA 4: CONTAGEM MÁGICA E NÚMEROS (10 Fases Graduais)
    // ----------------------------------------------------------------
    contagem: {
        nome: "Contagem Mágica",
        icone: "🔢",
        fases: {
            1: {
                nomeCurto: "Número 1",
                pergunta: "Quantas maçãs vermelhinhas há aqui: 🍎?",
                alvo: "1 Uma",
                opcoes: ["1 Uma", "3 Três", "2 Duas"],
                dica: "Tem apenas uma frutinha deliciosa esperando pelo seu toque!",
                sinalNome: "Número 1 em Libras",
                sinalEmoji: "☝️",
                sinalPassos: "Aponte apenas o dedo indicador erguido para o céu!"
            },
            2: {
                nomeCurto: "Número 2",
                pergunta: "Quantas estrelinhas mágicas há aqui: ⭐ ⭐?",
                alvo: "2 Duas",
                opcoes: ["1 Uma", "2 Duas", "3 Três"],
                dica: "Aponte o dedinho e conte com calma: uma... duas estrelinhas!",
                sinalNome: "Número 2 em Libras",
                sinalEmoji: "✌️",
                sinalPassos: "Erga os dedinhos indicador e médio juntinhos para o alto!"
            },
            3: {
                nomeCurto: "Número 3",
                pergunta: "Quantas bolinhas azuis saltitantes há aqui: 🔵 🔵 🔵?",
                alvo: "3 Três",
                opcoes: ["2 Duas", "3 Três", "5 Cinco"],
                dica: "Vamos contar juntinhos: uma, duas e três bolinhas!",
                sinalNome: "Número 3 em Libras",
                sinalEmoji: "🤟",
                sinalPassos: "Erga o polegar, o indicador e o dedinho médio no alto!"
            },
            4: {
                nomeCurto: "Número 4",
                pergunta: "Quantos gatinhos fofos estão brincando: 🐱 🐱 🐱 🐱?",
                alvo: "4 Quatro",
                opcoes: ["3 Três", "4 Quatro", "6 Seis"],
                dica: "Conte devagarzinho: um, dois, três e quatro amiguinhos!",
                sinalNome: "Número 4 em Libras",
                sinalEmoji: "🖐️",
                sinalPassos: "Erga quatro dedos da mão para cima, recolhendo apenas o polegar!"
            },
            5: {
                nomeCurto: "Número 5",
                pergunta: "Quantos dedinhos temos em UMA mão inteira: 🖐️?",
                alvo: "5 Cinco",
                opcoes: ["4 Quatro", "5 Cinco", "2 Dois"],
                dica: "Abra a mãozinha toda e conte: polegar, indicador, médio, anelar e mindinho!",
                sinalNome: "Número 5 em Libras",
                sinalEmoji: "🖐️",
                sinalPassos: "Dedos indicador e médio dobrados para a frente em formato de conchinha!"
            },
            6: {
                nomeCurto: "Número 6",
                pergunta: "Quantos lápis coloridos você vê: ✏️ ✏️ ✏️ ✏️ ✏️ ✏️?",
                alvo: "6 Seis",
                opcoes: ["5 Cinco", "6 Seis", "7 Sete"],
                dica: "É uma mãozinha cheia mais um dedinho da outra mão!",
                sinalNome: "Número 6 em Libras",
                sinalEmoji: "👌",
                sinalPassos: "Polegar encostando na ponta do indicador formando um círculo!"
            },
            7: {
                nomeCurto: "Número 7",
                pergunta: "Quantas cores mágicas tem o ARCO-ÍRIS no céu 🌈?",
                alvo: "7 Sete Cores",
                opcoes: ["3 Três", "5 Cinco", "7 Sete Cores"],
                dica: "Vermelho, laranja, amarelo, verde, azul, anil e violeta: são sete cores!",
                sinalNome: "Número 7 em Libras",
                sinalEmoji: "7️⃣",
                sinalPassos: "Dedo polegar deitado sobre a palma e os outros dedinhos levemente curvados!"
            },
            8: {
                nomeCurto: "Número 8",
                pergunta: "Quantos tentáculos tem o simpático POLVINHO no mar 🐙?",
                alvo: "8 Oito",
                opcoes: ["6 Seis", "8 Oito", "4 Quatro"],
                dica: "O polvinho nada usando oito bracinhos flexíveis e fortes!",
                sinalNome: "Número 8 em Libras",
                sinalEmoji: "🐙",
                sinalPassos: "Mão fechada com o polegar tocando no centro como a letra 'S'!"
            },
            9: {
                nomeCurto: "Número 9",
                pergunta: "Quantos balões coloridos estão subindo: 🎈 🎈 🎈 🎈 🎈 🎈 🎈 🎈 🎈?",
                alvo: "9 Nove",
                opcoes: ["8 Oito", "9 Nove", "10 Dez"],
                dica: "Falta apenas um balãozinho para chegar ao número dez!",
                sinalNome: "Número 9 em Libras",
                sinalEmoji: "🎈",
                sinalPassos: "Polegar e indicador formando o desenho arredondado do nove virado para baixo!"
            },
            10: {
                nomeCurto: "Número 10",
                pergunta: "Quantos dedinhos temos juntando as DUAS mãos: 🖐️ + 🖐️?",
                alvo: "10 Dez Dedinhos",
                opcoes: ["8 Oito", "9 Nove", "10 Dez Dedinhos"],
                dica: "Cinco dedinhos em uma mão mais cinco dedinhos na outra somam dez!",
                sinalNome: "Número 10 em Libras",
                sinalEmoji: "🔟",
                sinalPassos: "Número 1 com a mão seguido do número 0 fazendo o dez!"
            }
        }
    },

    // ----------------------------------------------------------------
    // CATEGORIA 5: PRIMEIROS SINAIS EM LIBRAS (10 Fases Graduais)
    // ----------------------------------------------------------------
    libras: {
        nome: "Sinais em Libras",
        icone: "🤟",
        fases: {
            1: {
                nomeCurto: "Sinal de Amor",
                pergunta: "Qual sinal representa AMOR e AFETO em Libras?",
                alvo: "🤲 Amor / Carinho",
                opcoes: ["🤲 Amor / Carinho", "👏 Palmas", "🦶 Pés"],
                dica: "Cruzamos os dois bracinhos com ternura, abraçando o próprio peito!",
                sinalNome: "Sinal de Amor e Carinho",
                sinalEmoji: "💖",
                sinalPassos: "Cruze os dois bracinhos no peito e dê um abraço bem gostoso em você!"
            },
            2: {
                nomeCurto: "Sinal de Obrigado",
                pergunta: "Qual gesto usamos para agradecer e dizer OBRIGADO(A)?",
                alvo: "🙏 Obrigado",
                opcoes: ["👋 Tchau", "🙏 Obrigado", "👆 Para cima"],
                dica: "Tocamos suavemente a mãozinha na testa e estendemos para a frente sorrindo!",
                sinalNome: "Sinal de Obrigado em Libras",
                sinalEmoji: "🙏",
                sinalPassos: "Toque as pontinhas dos dedos na testa e leve a mão para a frente com um sorriso!"
            },
            3: {
                nomeCurto: "Sinal de Bom Dia",
                pergunta: "Qual sinal usamos para desejar um radiante BOM DIA?",
                alvo: "☀️ Bom Dia",
                opcoes: ["🌙 Boa Noite", "☀️ Bom Dia", "🌧️ Chuva"],
                dica: "Fazemos o sinal de 'bom' na boca e erguemos a mão como o sol acordando!",
                sinalNome: "Sinal de Bom Dia em Libras",
                sinalEmoji: "☀️",
                sinalPassos: "Mão na boca em conchinha e depois abra os dedos no ar como o amanhecer!"
            },
            4: {
                nomeCurto: "Sinal de Amigo",
                pergunta: "Qual sinal representa um grande AMIGO(A) do coração?",
                alvo: "🤝 Amigo(a)",
                opcoes: ["🤝 Amigo(a)", "🚪 Porta", "🕒 Relógio"],
                dica: "Apoiamos com carinho a palma da mão aberta sobre o lado do coração!",
                sinalNome: "Sinal de Amigo do Coração",
                sinalEmoji: "🤝",
                sinalPassos: "Pouse a mãozinha aberta bem quentinha no peito, onde bate o coração!"
            },
            5: {
                nomeCurto: "Sinal de Por Favor",
                pergunta: "Qual sinal fazemos para pedir gentilmente POR FAVOR?",
                alvo: "🤲 Por Favor / Com Licença",
                opcoes: ["🤲 Por Favor / Com Licença", "🏃 Correr", "😴 Dormir"],
                dica: "Juntamos as duas mãozinhas abertas à frente com muita gentileza e educação!",
                sinalNome: "Sinal de Por Favor em Libras",
                sinalEmoji: "🤲",
                sinalPassos: "Palmas das mãos unidas e abertas deslizando suavemente para a frente!"
            },
            6: {
                nomeCurto: "Sinal de Família",
                pergunta: "Qual sinal representa a nossa unida e querida FAMÍLIA?",
                alvo: "👨‍👩‍👧 Família",
                opcoes: ["🚗 Estrada", "👨‍👩‍👧 Família", "📚 Livro"],
                dica: "Fazemos duas mãozinhas em 'F' e unimos em um abraço circular que acolhe todos!",
                sinalNome: "Sinal de Família em Libras",
                sinalEmoji: "👨‍👩‍👧",
                sinalPassos: "Mãos em 'F' fazendo um círculo no ar e se unindo pelos dedinhos mínimos!"
            },
            7: {
                nomeCurto: "Sinal de Brincar",
                pergunta: "Qual sinal representa BRINCAR e se divertir com alegria?",
                alvo: "🎉 Brincar",
                opcoes: ["🎉 Brincar", "🚪 Porta", "🪑 Cadeira"],
                dica: "Fazemos o sinal de 'Y' com os dedinhos e balançamos com energia feliz!",
                sinalNome: "Sinal de Brincar em Libras",
                sinalEmoji: "🎉",
                sinalPassos: "Polegar e mindinho abertos balançando alegremente na altura do peito!"
            },
            8: {
                nomeCurto: "Sinal de Água",
                pergunta: "Qual sinal usamos para pedir um copo de ÁGUA fresca?",
                alvo: "💧 Água",
                opcoes: ["💧 Água", "👟 Sapato", "🍎 Fruta"],
                dica: "Dedo indicador em formato de 'L' tocando suavemente no queixinho!",
                sinalNome: "Sinal de Água em Libras",
                sinalEmoji: "💧",
                sinalPassos: "Mão em 'L' com o indicador balançando pertinho do queixo!"
            },
            9: {
                nomeCurto: "Sinal de Comer",
                pergunta: "Qual sinal representa a hora gostosa de COMER o lanchinho?",
                alvo: "🍎 Comer / Lanche",
                opcoes: ["🍎 Comer / Lanche", "⚽ Chutar", "📖 Ler"],
                dica: "Juntamos os dedinhos da mãozinha e levamos pertinho da boca sorrindo!",
                sinalNome: "Sinal de Comer em Libras",
                sinalEmoji: "🍎",
                sinalPassos: "Pontas dos dedos unidas tocando duas vezes com carinho nos lábios!"
            },
            10: {
                nomeCurto: "Palmas em Libras",
                pergunta: "Como aplaudimos e comemoramos uma VITÓRIA em Libras?",
                alvo: "👏 Palmas Visuais (Mãos no ar)",
                opcoes: ["👏 Palmas Visuais (Mãos no ar)", "🤫 Silêncio", "😴 Sono"],
                dica: "Erguemos as duas mãos no alto e giramos suavemente como estrelinhas cintilantes!",
                sinalNome: "Palmas e Celebração em Libras",
                sinalEmoji: "👏",
                sinalPassos: "Duas mãozinhas erguidas no ar girando os pulsos em festa silenciosa e linda!"
            }
        }
    }
};

/* ====================================================================
   4. SISTEMA DE ÁUDIO SINTETIZADO (Web Audio API)
   ==================================================================== */
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

    tocarSomPop() {
        try {
            const ctx = this.obterContexto();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.11);
        } catch (e) {
            console.warn('[AudioService] Pop som indisponível:', e);
        }
    },

    tocarSomVitoria() {
        try {
            const ctx = this.obterContexto();
            if (!ctx) return;

            const notas = [523.25, 659.25, 783.99, 1046.50];
            notas.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.11);

                gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.11);
                gain.gain.exponentialRampToValueAtTime(0.28, ctx.currentTime + i * 0.11 + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.11 + 0.45);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + i * 0.11);
                osc.stop(ctx.currentTime + i * 0.11 + 0.5);
            });
        } catch (e) {
            console.warn('[AudioService] Som de vitória indisponível:', e);
        }
    },

    tocarSomEstrela() {
        try {
            const ctx = this.obterContexto();
            if (!ctx) return;

            const notas = [1046.5, 1318.5, 1567.98];
            notas.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

                gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + idx * 0.07);
                osc.stop(ctx.currentTime + idx * 0.07 + 0.28);
            });
        } catch (e) {
            console.warn('[AudioService] Som de estrela indisponível:', e);
        }
    },

    tocarSomAcolhedor() {
        try {
            const ctx = this.obterContexto();
            if (!ctx) return;

            const acordes = [440.00, 523.25];
            acordes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

                gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.12 + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 0.55);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + idx * 0.12);
                osc.stop(ctx.currentTime + idx * 0.12 + 0.6);
            });
        } catch (e) {
            console.warn('[AudioService] Som acolhedor indisponível:', e);
        }
    }
};

/* ====================================================================
   5. VOZ SINTÉTICA FEMININA E ACOLHEDORA (Web Speech API)
   Filtro inteligente para vozes brasileiras femininas nativas e suaves.
   ==================================================================== */
let falaUtteranceGlobal = null; // Previne coleta indevida pelo Garbage Collector
let vozFemininaPtBRCache = null;

/**
 * Busca e prioriza uma voz feminina brasileira de tom acolhedor e claro.
 */
function obterMelhorVozFemininaPtBR() {
    if (vozFemininaPtBRCache) return vozFemininaPtBRCache;
    if (!('speechSynthesis' in window)) return null;

    const vozes = window.speechSynthesis.getVoices();
    if (!vozes || vozes.length === 0) return null;

    // Filtra todas as vozes em português
    const vozesPt = vozes.filter(v => v.lang && (v.lang === 'pt-BR' || v.lang.startsWith('pt')));

    // Nomes comuns de vozes femininas nativas no Windows, Android, iOS e macOS
    const nomesFemininos = [
        "luciana", "maria", "heloisa", "francisca", "vitoria", "vitória",
        "camila", "alice", "joana", "yara", "brenda", "zira", "natural"
    ];

    // 1ª Prioridade: Voz pt-BR cujo nome contenha um nome feminino conhecido
    for (const v of vozesPt) {
        const nomeLower = (v.name || '').toLowerCase();
        for (const fem of nomesFemininos) {
            if (nomeLower.includes(fem)) {
                vozFemininaPtBRCache = v;
                return v;
            }
        }
        if (nomeLower.includes("female") || nomeLower.includes("feminina") || nomeLower.includes("mulher")) {
            vozFemininaPtBRCache = v;
            return v;
        }
    }

    // 2ª Prioridade: Voz oficial do Google pt-BR (reconhecida por entonação feminina clara)
    const vozGoogle = vozesPt.find(v => (v.name || '').toLowerCase().includes("google português"));
    if (vozGoogle) {
        vozFemininaPtBRCache = vozGoogle;
        return vozGoogle;
    }

    // 3ª Prioridade: Qualquer voz em pt-BR disponível no navegador
    const vozQualquerPtBR = vozes.find(v => v.lang === 'pt-BR');
    if (vozQualquerPtBR) {
        vozFemininaPtBRCache = vozQualquerPtBR;
        return vozQualquerPtBR;
    }

    // Fallback: Primeira voz em português
    if (vozesPt.length > 0) {
        vozFemininaPtBRCache = vozesPt[0];
        return vozesPt[0];
    }

    return null;
}

/**
 * Sintetiza áudio em voz alta com parâmetros calibrados para o público infantil.
 */
function falarTexto(texto, callback) {
    if (!('speechSynthesis' in window)) return;

    try {
        window.speechSynthesis.cancel(); // Evita sobreposição de falas

        if (!texto || texto.trim() === '') return;

        falaUtteranceGlobal = new SpeechSynthesisUtterance(texto);
        falaUtteranceGlobal.lang = 'pt-BR';
        falaUtteranceGlobal.rate = 0.90;  // Cadência suave, pausada e didática
        falaUtteranceGlobal.pitch = 1.15; // Timbre feminino acolhedor e doce

        const vozEscolhida = obterMelhorVozFemininaPtBR();
        if (vozEscolhida) {
            falaUtteranceGlobal.voice = vozEscolhida;
        }

        falaUtteranceGlobal.onend = () => {
            falaUtteranceGlobal = null;
            if (callback && typeof callback === 'function') callback();
        };

        falaUtteranceGlobal.onerror = (err) => {
            console.warn('[SpeechSynthesis] Aviso de fala:', err);
            falaUtteranceGlobal = null;
        };

        window.speechSynthesis.speak(falaUtteranceGlobal);
    } catch (e) {
        console.warn('[SpeechSynthesis] Erro ao sintetizar áudio:', e);
    }
}

function falarInstrucaoAtual() {
    AudioService.tocarSomPop();
    if (estadoApp.questaoAtual) {
        falarTexto(estadoApp.questaoAtual.pergunta);
    }
}

/* ====================================================================
   6. MOTOR DE CONFETES E PARTÍCULAS CANVAS (60fps)
   ==================================================================== */
const ConfetesCanvas = {
    canvas: null,
    ctx: null,
    particulas: [],
    animando: false,

    inicializar() {
        this.canvas = document.getElementById('canvas-confetes');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.redimensionar();
        window.addEventListener('resize', () => this.redimensionar());
    },

    redimensionar() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    disparar(quantidade = 60) {
        if (!this.canvas || !this.ctx) return;
        this.redimensionar();

        const cores = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9f43', '#a55eea', '#2ed573', '#45aaf2'];
        const centroX = window.innerWidth / 2;
        const centroY = window.innerHeight * 0.45;

        for (let i = 0; i < quantidade; i++) {
            const angulo = Math.random() * Math.PI * 2;
            const velocidade = 5 + Math.random() * 9;
            this.particulas.push({
                x: centroX + (Math.random() * 80 - 40),
                y: centroY + (Math.random() * 80 - 40),
                vx: Math.cos(angulo) * velocidade,
                vy: Math.sin(angulo) * velocidade - 3,
                gravidade: 0.28,
                raio: 5 + Math.random() * 6,
                rotacao: Math.random() * 360,
                vRotacao: (Math.random() - 0.5) * 12,
                cor: cores[Math.floor(Math.random() * cores.length)],
                vida: 1,
                decaimento: 0.012 + Math.random() * 0.015
            });
        }

        if (!this.animando) {
            this.animando = true;
            this.loop();
        }
    },

    loop() {
        if (!this.animando) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particulas.length - 1; i >= 0; i--) {
            const p = this.particulas[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravidade;
            p.rotacao += p.vRotacao;
            p.vida -= p.decaimento;

            if (p.vida <= 0 || p.y > this.canvas.height + 20) {
                this.particulas.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.vida);
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotacao * Math.PI) / 180);
            this.ctx.fillStyle = p.cor;
            this.ctx.fillRect(-p.raio / 2, -p.raio / 2, p.raio, p.raio * 1.3);
            this.ctx.restore();
        }

        if (this.particulas.length > 0) {
            requestAnimationFrame(() => this.loop());
        } else {
            this.animando = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
};

/* ====================================================================
   7. MASCOTE ESTRELINHA MÁGICA (Interação Acolhedora)
   ==================================================================== */
const falasMascote = [
    "Você é muito esperto e dedicado! ✨",
    "Vamos aprender juntos com muito amor! 💖",
    "Estou tão feliz em brincar com você hoje! 🌟",
    "Você sabia que errar nos ajuda a descobrir coisas novas? 🤗",
    "Olha quanta aventura mágica temos para viver! 🎨"
];

function interagirMascote() {
    AudioService.tocarSomEstrela();
    const mascoteEl = document.getElementById('mascote-topo');
    const balaoEl = document.getElementById('balao-mascote');

    if (mascoteEl) {
        mascoteEl.style.transform = "scale(1.28) rotate(15deg)";
        setTimeout(() => {
            mascoteEl.style.transform = "";
        }, 320);
    }

    if (balaoEl) {
        const falaAleatoria = falasMascote[Math.floor(Math.random() * falasMascote.length)];
        balaoEl.innerText = falaAleatoria;
        falarTexto(falaAleatoria);
    }
}

/* ====================================================================
   8. GERENCIAMENTO DE TELAS (SPA & Acessibilidade WCAG)
   ==================================================================== */
function navegarPara(idTelaAlvo) {
    const telas = document.querySelectorAll('.tela');
    let telaAtiva = null;

    telas.forEach(tela => {
        if (tela.id === idTelaAlvo) {
            tela.classList.add('ativa');
            tela.removeAttribute('aria-hidden');
            telaAtiva = tela;
        } else {
            tela.classList.remove('ativa');
            tela.setAttribute('aria-hidden', 'true');
        }
    });

    if (telaAtiva) {
        const titulo = telaAtiva.querySelector('h1, h2, h3');
        if (titulo) {
            titulo.setAttribute('tabindex', '-1');
            titulo.focus();
        }
    }
}

function iniciarJogo() {
    AudioService.tocarSomPop();
    exibirVisaoCategorias();
    navegarPara('tela-fases');
    falarTexto("Escolha um mundo mágico para explorar as dez fases!");
}

function voltarInicio() {
    AudioService.tocarSomPop();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    navegarPara('tela-inicio');
    falarTexto("Você voltou para a página inicial!");
}

function gerenciarVoltarMapa() {
    AudioService.tocarSomPop();
    const visaoTrilha = document.getElementById("visao-trilha-fases");
    const estaNaTrilha = visaoTrilha && !visaoTrilha.classList.contains("escondido");

    if (estaNaTrilha) {
        // Se estiver vendo a trilha de 10 fases, volta para as categorias
        exibirVisaoCategorias();
        falarTexto("Escolha uma categoria mágica!");
    } else {
        // Se estiver nas categorias, volta para a tela inicial
        voltarInicio();
    }
}

function voltarParaTrilhaFases() {
    AudioService.tocarSomPop();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    abrirCategoria(estadoApp.categoriaAtiva);
    navegarPara('tela-fases');
}

/* ====================================================================
   9. GESTÃO DE CATEGORIAS E TRILHA DE 10 FASES
   ==================================================================== */

function exibirVisaoCategorias() {
    const visaoCategorias = document.getElementById("visao-categorias");
    const visaoTrilha = document.getElementById("visao-trilha-fases");
    const subtituloMapa = document.getElementById("subtitulo-mapa-texto");
    const tituloPrincipal = document.getElementById("titulo-mapa-principal");
    const textoBtnVoltar = document.getElementById("texto-btn-voltar");

    if (visaoCategorias) visaoCategorias.classList.remove("escondido");
    if (visaoTrilha) visaoTrilha.classList.add("escondido");

    if (subtituloMapa) subtituloMapa.innerText = "Trilha de Conhecimento";
    if (tituloPrincipal) tituloPrincipal.innerText = "🗺️ Escolha seu Mundo";
    if (textoBtnVoltar) textoBtnVoltar.innerText = "Início";

    atualizarBadgesCategorias();
}

function atualizarBadgesCategorias() {
    const chaves = ['cores', 'letramento', 'objetos', 'contagem', 'libras'];
    chaves.forEach(cat => {
        const el = document.getElementById(`status-cat-${cat}`);
        if (el) {
            const prog = estadoApp.progresso[cat];
            const qtdEstrelas = (prog && prog.estrelas) ? prog.estrelas.length : 0;
            if (qtdEstrelas >= 10) {
                el.innerText = "🏆 10/10";
            } else if (qtdEstrelas > 0) {
                el.innerText = `⭐ ${qtdEstrelas}/10`;
            } else {
                el.innerText = "Jogar";
            }
        }
    });
}

function abrirCategoria(chaveCategoria) {
    AudioService.tocarSomPop();
    estadoApp.categoriaAtiva = chaveCategoria;

    const catData = bancoCategorias[chaveCategoria];
    if (!catData) return;

    const visaoCategorias = document.getElementById("visao-categorias");
    const visaoTrilha = document.getElementById("visao-trilha-fases");
    const subtituloMapa = document.getElementById("subtitulo-mapa-texto");
    const tituloPrincipal = document.getElementById("titulo-mapa-principal");
    const textoBtnVoltar = document.getElementById("texto-btn-voltar");

    const iconeCatAtiva = document.getElementById("icone-categoria-ativa");
    const nomeCatAtiva = document.getElementById("nome-categoria-ativa");
    const progressoCatTexto = document.getElementById("progresso-categoria-texto");

    if (visaoCategorias) visaoCategorias.classList.add("escondido");
    if (visaoTrilha) visaoTrilha.classList.remove("escondido");

    if (subtituloMapa) subtituloMapa.innerText = `Categoria: ${catData.nome}`;
    if (tituloPrincipal) tituloPrincipal.innerText = `🌟 Trilha de 10 Fases`;
    if (textoBtnVoltar) textoBtnVoltar.innerText = "Mundos";

    if (iconeCatAtiva) iconeCatAtiva.innerText = catData.icone;
    if (nomeCatAtiva) nomeCatAtiva.innerText = catData.nome;

    const progresso = estadoApp.progresso[chaveCategoria] || { desbloqueada: 1, estrelas: [] };
    const qtdEstrelas = progresso.estrelas ? progresso.estrelas.length : 0;
    if (progressoCatTexto) {
        progressoCatTexto.innerText = `⭐ ${qtdEstrelas} de 10 estrelas mágicas conquistadas`;
    }

    renderizarGrade10Fases(chaveCategoria);
    falarTexto(`Você está no mundo de ${catData.nome}. Escolha uma fase liberada!`);
}

function renderizarGrade10Fases(chaveCategoria) {
    const container = document.getElementById("grade-10-fases");
    if (!container) return;
    container.innerHTML = "";

    const catData = bancoCategorias[chaveCategoria];
    const progresso = estadoApp.progresso[chaveCategoria] || { desbloqueada: 1, estrelas: [] };
    const faseDesbloqueada = progresso.desbloqueada || 1;

    for (let i = 1; i <= 10; i++) {
        const faseInfo = catData.fases[i];
        const estaLiberada = i <= faseDesbloqueada;
        const temEstrela = progresso.estrelas && progresso.estrelas.includes(i);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `btn-fase-trilha ${estaLiberada ? 'liberada' : 'bloqueada'}`;
        btn.setAttribute('aria-label', `Fase ${i}: ${faseInfo.nomeCurto}. ${estaLiberada ? (temEstrela ? 'Concluída com estrela' : 'Disponível para jogar') : 'Bloqueada, conclua a fase anterior'}`);

        if (estaLiberada) {
            btn.onclick = () => carregarFaseEspecifica(chaveCategoria, i);
        } else {
            btn.onclick = () => {
                AudioService.tocarSomAcolhedor();
                falarTexto(`Esta fase está bloqueada com carinho. Conclua a fase ${i - 1} para liberá-la!`);
            };
        }

        const tagNumero = document.createElement("span");
        tagNumero.className = "numero-fase-tag";
        tagNumero.innerText = `Fase ${i}`;

        const icone = document.createElement("span");
        icone.className = "icone-fase-trilha";
        icone.innerText = estaLiberada ? (faseInfo.sinalEmoji || catData.icone) : "🔒";

        const nomeCurto = document.createElement("strong");
        nomeCurto.className = "nome-fase-curto";
        nomeCurto.innerText = faseInfo.nomeCurto;

        const statusEstrela = document.createElement("span");
        statusEstrela.className = `status-estrela-fase ${temEstrela ? 'estrela-conquistada' : 'estrela-pendente'}`;
        statusEstrela.innerText = temEstrela ? "⭐ Conquistada" : (estaLiberada ? "☆ Jogar" : "🔒 Bloqueada");

        btn.appendChild(tagNumero);
        btn.appendChild(icone);
        btn.appendChild(nomeCurto);
        btn.appendChild(statusEstrela);

        if (!estaLiberada) {
            const cadeadoBadge = document.createElement("span");
            cadeadoBadge.className = "cadeado-bloqueio";
            cadeadoBadge.innerText = "🔒";
            btn.appendChild(cadeadoBadge);
        }

        container.appendChild(btn);
    }
}

/* ====================================================================
   10. SISTEMA DE PERFIS DE ACESSIBILIDADE COM TOGGLE (LIGA/DESLIGA)
   ==================================================================== */
const NOMES_PERFIS = {
    padrao: 'Modo Padrão',
    motor: 'Modo Motor com Botões Gigantes',
    visual: 'Modo de Alto Contraste',
    libras: 'Modo Libras com Sinais Visuais'
};

function aplicarPerfil(tipo, salvarNoStorage = true, anunciarPorVoz = false) {
    const corpo = document.getElementById("corpo-pagina") || document.body;
    estadoApp.perfilAtivo = tipo;

    corpo.classList.remove('modo-padrao', 'modo-motor', 'modo-visual', 'modo-libras');
    corpo.classList.add(`modo-${tipo}`);

    const botoes = document.querySelectorAll('.btn-perfil');
    botoes.forEach(btn => {
        const ehEste = btn.id === `btn-${tipo}`;
        if (ehEste) {
            btn.classList.add('ativo');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('ativo');
            btn.setAttribute('aria-pressed', 'false');
        }
    });

    atualizarExibicaoPainelLibras();

    if (salvarNoStorage) {
        safeStorage.salvar("perfil_acessibilidade", tipo);
    }

    if (anunciarPorVoz) {
        const nomeLegivel = NOMES_PERFIS[tipo] || tipo;
        falarTexto(`${nomeLegivel} ativado com sucesso!`);
    }
}

function mudarPerfil(tipo) {
    AudioService.tocarSomPop();
    const perfilAtivoAtual = estadoApp.perfilAtivo;

    if (perfilAtivoAtual === tipo && tipo !== 'padrao') {
        aplicarPerfil('padrao', true, false);
        const nomeDesativado = NOMES_PERFIS[tipo] || tipo;
        falarTexto(`${nomeDesativado} desativado. Voltando ao modo padrão.`);
    } else {
        aplicarPerfil(tipo, true, true);
    }
}

function atualizarExibicaoPainelLibras() {
    const painelLibras = document.getElementById("painel-libras");
    if (!painelLibras) return;

    const telaJogoAtiva = document.getElementById("tela-jogo")?.classList.contains('ativa');
    const deveExibir = (estadoApp.perfilAtivo === 'libras' || estadoApp.categoriaAtiva === 'libras') && telaJogoAtiva;

    if (deveExibir) {
        painelLibras.classList.remove('escondido');
    } else {
        painelLibras.classList.add('escondido');
    }
}

/* ====================================================================
   11. CARREGAMENTO E EXECUÇÃO DE UMA FASE ESPECÍFICA
   ==================================================================== */
function embaralharArray(arr) {
    const copia = [...arr];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function carregarFaseEspecifica(chaveCategoria, numeroFase) {
    AudioService.tocarSomPop();
    estadoApp.categoriaAtiva = chaveCategoria;
    estadoApp.faseAtual = numeroFase;
    estadoApp.errosNaQuestao = 0;

    const catData = bancoCategorias[chaveCategoria];
    const questao = catData?.fases[numeroFase];
    if (!questao) return;

    estadoApp.questaoAtual = questao;

    const tituloFaseEl = document.getElementById("titulo-fase");
    const indicadorRodadaEl = document.getElementById("indicador-rodada");

    if (tituloFaseEl) {
        tituloFaseEl.innerText = `${catData.nome} — Fase ${numeroFase}`;
    }
    if (indicadorRodadaEl) {
        indicadorRodadaEl.innerText = `Fase ${numeroFase} de 10`;
    }

    navegarPara('tela-jogo');
    montarQuestao();
}

function montarQuestao() {
    const questao = estadoApp.questaoAtual;
    if (!questao) return;

    const instrucaoEl = document.getElementById("instrucao-texto");
    const blocoPergunta = document.getElementById("bloco-pergunta");
    const opcoesContainer = document.getElementById("opcoes-container");
    const feedbackContainer = document.getElementById("feedback-container");
    const btnSairFase = document.getElementById("btn-sair-fase");

    instrucaoEl.innerText = questao.pergunta;
    blocoPergunta.style.display = "flex";

    const librasGestoEmoji = document.getElementById("libras-gesto-emoji");
    const librasNomeSinal = document.getElementById("libras-nome-sinal");
    const textoSinalLibras = document.getElementById("texto-sinal-libras");

    if (librasGestoEmoji) librasGestoEmoji.innerText = questao.sinalEmoji || "🤟";
    if (librasNomeSinal) librasNomeSinal.innerText = questao.sinalNome || "Sinal de Apoio";
    if (textoSinalLibras) textoSinalLibras.innerText = questao.sinalPassos || "";

    atualizarExibicaoPainelLibras();

    feedbackContainer.classList.add('escondido');
    opcoesContainer.style.display = "flex";
    opcoesContainer.innerHTML = "";
    if (btnSairFase) btnSairFase.style.display = "inline-flex";

    const opcoesEmbaralhadas = embaralharArray(questao.opcoes);
    const marcadores = ["A", "B", "C", "D"];

    opcoesEmbaralhadas.forEach((opcaoTexto, index) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "btn-opcao-jogo";
        botao.setAttribute('role', 'button');
        botao.setAttribute('aria-label', `Opção ${index + 1}: ${opcaoTexto}`);

        const marcador = document.createElement("span");
        marcador.className = "opcao-indicador";
        marcador.setAttribute('aria-hidden', 'true');
        marcador.innerText = marcadores[index] || "✦";

        const texto = document.createElement("span");
        texto.className = "opcao-texto";
        texto.innerText = opcaoTexto;

        botao.appendChild(marcador);
        botao.appendChild(texto);

        botao.onclick = () => {
            AudioService.tocarSomPop();
            verificarResposta(opcaoTexto);
        };

        opcoesContainer.appendChild(botao);
    });

    // Leitura suave feminina da pergunta após transição
    setTimeout(() => {
        falarTexto(questao.pergunta);
    }, 400);
}

/* ====================================================================
   12. FEEDBACK LÚDICO & ERRO ACOLHEDOR (PROGRESSÃO PEDAGÓGICA)
   ==================================================================== */
function verificarResposta(escolha) {
    const questao = estadoApp.questaoAtual;
    if (!questao) return;

    const opcoesContainer = document.getElementById("opcoes-container");
    const blocoPergunta = document.getElementById("bloco-pergunta");
    const painelLibras = document.getElementById("painel-libras");
    const feedbackContainer = document.getElementById("feedback-container");
    const feedbackConteudo = document.getElementById("feedback-conteudo");
    const bonecoFeedback = document.getElementById("boneco-feedback");
    const feedbackAcoes = document.getElementById("feedback-acoes");
    const btnSairFase = document.getElementById("btn-sair-fase");

    opcoesContainer.style.display = "none";
    blocoPergunta.style.display = "none";
    if (painelLibras) painelLibras.classList.add('escondido');
    if (btnSairFase) btnSairFase.style.display = "none";

    feedbackContainer.classList.remove('escondido');

    // ================= ACERTO (Celebração, Desbloqueio e Estrela) =================
    if (escolha === questao.alvo) {
        estadoApp.errosNaQuestao = 0;

        const cat = estadoApp.categoriaAtiva;
        const faseNum = estadoApp.faseAtual;
        const prog = estadoApp.progresso[cat];

        // Se ainda não tinha ganho estrela nesta fase específica:
        if (!prog.estrelas.includes(faseNum)) {
            prog.estrelas.push(faseNum);
            estadoApp.estrelas++;
            safeStorage.salvar("total_estrelas", estadoApp.estrelas);

            const contadorEstrelas = document.getElementById("contador-estrelas");
            if (contadorEstrelas) {
                contadorEstrelas.innerText = estadoApp.estrelas;
            }
        }

        // Desbloqueia a próxima fase da categoria (até 10)
        if (faseNum < 10) {
            prog.desbloqueada = Math.max(prog.desbloqueada, faseNum + 1);
        }

        // Salva progresso serializado no storage
        safeStorage.salvar("progresso_aventura", JSON.stringify(estadoApp.progresso));

        bonecoFeedback.className = "boneco-animado boneco-feliz";
        bonecoFeedback.innerHTML = "🥳🎉⭐";

        const ehUltimaFase = faseNum === 10;

        if (ehUltimaFase) {
            // Celebração da conclusão das 10 fases do mundo!
            feedbackConteudo.className = "feedback-sucesso-card";
            feedbackConteudo.innerHTML = `
                <h3 class="fb-titulo-sucesso">🎉 VOCÊ COMPLETOU AS 10 FASES! 🎉</h3>
                <p class="fb-mensagem-sucesso">Você conquistou todas as 10 estrelas mágicas do mundo de <strong>${bancoCategorias[cat].nome}</strong>!</p>
                <p class="fb-mensagem-sucesso">Seu baú agora tem <strong>${estadoApp.estrelas} estrelas</strong> mágicas! Que orgulho de você! 💖</p>
            `;

            feedbackAcoes.innerHTML = `
                <button type="button" onclick="voltarParaTrilhaFases()" class="btn-continuar-aventura">
                    🗺️ Ver a Trilha Completa
                </button>
                <button type="button" onclick="iniciarJogo()" class="btn-tentar-carinho" style="margin-top: 6px;">
                    🚀 Escolher Outro Mundo Mágico
                </button>
            `;

            AudioService.tocarSomVitoria();
            ConfetesCanvas.disparar(120);
            falarTexto(`Sensacional! Você completou todas as dez fases com alegria! Você tem ${estadoApp.estrelas} estrelas mágicas!`);

        } else {
            // Acerto de fase intermediária
            feedbackConteudo.className = "feedback-sucesso-card";
            feedbackConteudo.innerHTML = `
                <h3 class="fb-titulo-sucesso">UAU, SENSACIONAL! VOCÊ BRILHOU! 🌟</h3>
                <p class="fb-mensagem-sucesso">Você acertou e a <strong>Fase ${faseNum + 1}</strong> foi desbloqueada com carinho!</p>
                <p class="fb-mensagem-sucesso">Você já tem <strong>${estadoApp.estrelas} estrelas mágicas</strong> no seu baú! 💖</p>
            `;

            feedbackAcoes.innerHTML = `
                <button type="button" onclick="avancarParaProximaFase()" class="btn-continuar-aventura" id="btn-proximo">
                    Ir para a Fase ${faseNum + 1} ➔ ✨
                </button>
                <button type="button" onclick="voltarParaTrilhaFases()" class="btn-pular-amigo" style="margin-top: 6px;">
                    🗺️ Ver Todas as Fases
                </button>
            `;

            AudioService.tocarSomVitoria();
            ConfetesCanvas.disparar(75);
            falarTexto(`Uau, parabéns! Você acertou e liberou a fase ${faseNum + 1}! Você está brilhando!`);
        }

    } else {
        // ================= ERRO ACOLHEDOR (Sem Game Over / Afeto e Dica) =================
        estadoApp.errosNaQuestao++;

        bonecoFeedback.className = "boneco-animado boneco-acolhedor";
        bonecoFeedback.innerHTML = "🤗💖✨";

        feedbackConteudo.className = "feedback-erro-card";
        feedbackConteudo.innerHTML = `
            <h3 class="fb-titulo-acolhedor">Quase lá, amiguinho! Não se preocupe! 💖</h3>
            <p class="fb-texto-afeto">Errar nos ajuda a descobrir novos caminhos mágicos!</p>
            
            <div class="caixa-dica-pedagogica">
                <div class="titulo-dica-wrap">
                    <span aria-hidden="true">🔍</span>
                    <span>Dica Carinhosa:</span>
                </div>
                <p class="conteudo-dica-texto">${questao.dica}</p>
            </div>

            <p class="fb-texto-afeto">Vamos tentar juntinhos mais uma vez? Eu confio em você! ✨</p>
        `;

        feedbackAcoes.innerHTML = `
            <button type="button" onclick="tentarNovamente()" class="btn-tentar-carinho" id="btn-tentar">
                💖 Tentar de Novo com Carinho
            </button>
            <button type="button" onclick="voltarParaTrilhaFases()" class="btn-pular-amigo">
                🗺️ Voltar para a Trilha de Fases
            </button>
        `;

        AudioService.tocarSomAcolhedor();
        falarTexto(`Quase lá, não se preocupe! A dica carinhosa é: ${questao.dica}. Vamos tentar mais uma vez?`);
    }

    feedbackContainer.setAttribute('tabindex', '-1');
    feedbackContainer.focus();
}

function tentarNovamente() {
    AudioService.tocarSomPop();
    const feedbackContainer = document.getElementById("feedback-container");
    const opcoesContainer = document.getElementById("opcoes-container");
    const blocoPergunta = document.getElementById("bloco-pergunta");
    const btnSairFase = document.getElementById("btn-sair-fase");

    feedbackContainer.classList.add('escondido');
    blocoPergunta.style.display = "flex";
    opcoesContainer.style.display = "flex";
    if (btnSairFase) btnSairFase.style.display = "inline-flex";

    atualizarExibicaoPainelLibras();

    falarTexto(`Vamos lá! ${estadoApp.questaoAtual.pergunta}. Lembre-se: ${estadoApp.questaoAtual.dica}`);
}

function avancarParaProximaFase() {
    AudioService.tocarSomPop();
    const proxima = estadoApp.faseAtual + 1;
    if (proxima <= 10) {
        carregarFaseEspecifica(estadoApp.categoriaAtiva, proxima);
    } else {
        voltarParaTrilhaFases();
    }
}

/* ====================================================================
   13. INICIALIZAÇÃO DA APLICAÇÃO (DOMContentLoaded & Audio Unlock)
   ==================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa o motor de confetes canvas
    ConfetesCanvas.inicializar();

    // 2. Carrega perfil de acessibilidade salvo
    const perfilSalvo = safeStorage.obter("perfil_acessibilidade", "padrao");
    aplicarPerfil(perfilSalvo, false, false);

    // 3. Carrega estrelas salvas
    const estrelasSalvas = safeStorage.obter("total_estrelas", "0");
    const qtd = parseInt(estrelasSalvas, 10);
    estadoApp.estrelas = isNaN(qtd) ? 0 : qtd;

    const contadorEstrelas = document.getElementById("contador-estrelas");
    if (contadorEstrelas) {
        contadorEstrelas.innerText = estadoApp.estrelas;
    }

    // 4. Carrega progresso das 10 fases salvo
    try {
        const progressoSalvo = safeStorage.obter("progresso_aventura", null);
        if (progressoSalvo) {
            const parsed = JSON.parse(progressoSalvo);
            if (parsed && typeof parsed === 'object') {
                estadoApp.progresso = { ...estadoApp.progresso, ...parsed };
            }
        }
    } catch (e) {
        console.warn('[Storage] Erro ao carregar progresso salvo:', e);
    }

    // 5. Garante que a tela de início seja a ativa
    navegarPara('tela-inicio');

    // 6. Pré-carrega vozes e atualiza cache de voz feminina
    if ('speechSynthesis' in window) {
        obterMelhorVozFemininaPtBR();
        window.speechSynthesis.onvoiceschanged = () => {
            vozFemininaPtBRCache = null;
            obterMelhorVozFemininaPtBR();
        };
    }

    // 7. Desbloqueia AudioContext na primeira interação do usuário
    const desbloquearAudio = () => {
        AudioService.obterContexto();
        document.removeEventListener('click', desbloquearAudio);
        document.removeEventListener('touchstart', desbloquearAudio);
    };
    document.addEventListener('click', desbloquearAudio, { once: true });
    document.addEventListener('touchstart', desbloquearAudio, { once: true });
});
