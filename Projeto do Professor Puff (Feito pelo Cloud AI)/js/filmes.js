/* =====================================================================
   CineCatálogo — dados dos filmes (js/filmes.js)

   COMO ADICIONAR UM FILME
   1. Coloque o pôster na pasta imagens/
   2. Copie um bloco { ... } da lista FILMES, cole no final da lista
      (sem esquecer a vírgula entre os blocos) e troque os dados.
   3. Pronto: o filme aparece no catálogo, nos gêneros, na busca
      e ganha a própria página de detalhes automaticamente.

   Campos opcionais: tituloOriginal, estreia, duracao, aviso.
   ===================================================================== */

window.GENEROS = [
  { nome: "Ação",      slug: "acao",      descricao: "Perseguições, lutas e muita adrenalina." },
  { nome: "Animação",  slug: "animacao",  descricao: "Desenhos e animes para todos os gostos." },
  { nome: "Aventura",  slug: "aventura",  descricao: "Jornadas épicas e mundos para explorar." },
  { nome: "Comédia",   slug: "comedia",   descricao: "Para rir do começo ao fim." },
  { nome: "Corrida",   slug: "corrida",   descricao: "Motores acelerados e rachas nas ruas." },
  { nome: "Drama",     slug: "drama",     descricao: "Histórias intensas e personagens profundos." },
  { nome: "Ficção",    slug: "ficcao",    descricao: "Futuros e universos que desafiam a realidade." },
  { nome: "Romance",   slug: "romance",   descricao: "Encontros, amores e despedidas." },
  { nome: "Terror",    slug: "terror",    descricao: "Prepare-se para o susto." }
];

window.FILMES = [
  {
    id: "homem-aranha-um-novo-dia",
    titulo: "Homem-Aranha: Um Novo Dia",
    tituloOriginal: "Spider-Man: Brand New Day",
    categoria: "Ficção",
    generos: ["Ficção", "Ação", "Aventura"],
    ano: 2026,
    estreia: "2026-07-31",
    nota: 5.0,
    poster: "imagens/brand-new-day.jpeg",
    resumo: "Quatro anos depois de Sem Volta para Casa, Peter Parker vive anônimo em Nova York, esquecido por todos que ama.",
    sinopse: [
      "O filme se passa quatro anos após os eventos de Homem-Aranha: Sem Volta para Casa (2021). Agora adulto, Peter Parker vive de forma completamente solitária e anônima em Nova York, já que o mundo inteiro esqueceu sua existência real devido ao feitiço do Doutor Estranho.",
      "Ele se dedica integralmente a ser o Homem-Aranha em tempo integral, sem usar tecnologias Stark. No entanto, a dor de ver seus antigos amigos — MJ (Zendaya) e Ned (Jacob Batalon) — seguirem em frente com suas vidas sem lembrarem dele gera uma imensa pressão emocional."
    ],
    direcao: "Destin Daniel Cretton",
    elenco: ["Tom Holland", "Zendaya", "Jacob Batalon", "Sadie Sink"],
    duracao: null,
    pais: "Estados Unidos",
    estudio: "Marvel Studios / Sony Pictures",
    plataformas: ["Netflix", "Prime Video", "Globo Play"]
  },
  {
    id: "the-end-of-evangelion",
    titulo: "Neon Genesis Evangelion: The End of Evangelion",
    categoria: "Ficção",
    generos: ["Ficção", "Animação", "Drama"],
    ano: 1997,
    nota: 5.0,
    poster: "imagens/evangelion.jpg",
    resumo: "O desfecho da saga de Shinji Ikari, quando o destino da humanidade e os conflitos íntimos dos personagens se encontram.",
    sinopse: [
      "Dando sequência ao final da série de TV, o filme acompanha Shinji Ikari, Asuka, Misato e a NERV em um confronto decisivo contra a SEELE, organização que quer forçar o Projeto de Instrumentalidade Humana.",
      "Entre batalhas devastadoras e momentos de forte carga emocional, o longa mergulha nos medos, nas solidões e nas escolhas dos personagens, em uma das conclusões mais comentadas da história dos animes."
    ],
    direcao: "Hideaki Anno e Kazuya Tsurumaki",
    elenco: ["Megumi Ogata", "Megumi Hayashibara", "Yūko Miyamura", "Kotono Mitsuishi"],
    duracao: 87,
    pais: "Japão",
    estudio: "Gainax / Production I.G",
    plataformas: ["Netflix"]
  },
  {
    id: "blade-runner-2049",
    titulo: "Blade Runner 2049",
    categoria: "Ficção",
    generos: ["Ficção", "Drama"],
    ano: 2017,
    nota: 4.9,
    poster: "imagens/ryan.png",
    resumo: "Trinta anos depois do clássico original, um novo blade runner descobre um segredo que pode mudar tudo.",
    sinopse: [
      "Trinta anos após os eventos do primeiro filme, o oficial K, um blade runner da polícia de Los Angeles, descobre um segredo enterrado capaz de mergulhar a sociedade no caos.",
      "A descoberta o leva a uma investigação que passa por corporações poderosas, replicantes e uma busca por Rick Deckard, ex-blade runner desaparecido há décadas."
    ],
    direcao: "Denis Villeneuve",
    elenco: ["Ryan Gosling", "Harrison Ford", "Ana de Armas", "Jared Leto"],
    duracao: 163,
    pais: "Estados Unidos",
    estudio: "Alcon Entertainment",
    plataformas: ["Prime Video"]
  },
  {
    id: "la-la-land",
    titulo: "La La Land: Cantando Estações",
    tituloOriginal: "La La Land",
    categoria: "Romance",
    generos: ["Romance", "Drama", "Comédia"],
    ano: 2016,
    nota: 4.7,
    poster: "imagens/lala.png",
    resumo: "Uma atriz e um pianista de jazz tentam realizar seus sonhos em Los Angeles e se apaixonam pelo caminho.",
    sinopse: [
      "Mia é uma aspirante a atriz que serve cafés entre um teste e outro. Sebastian é um pianista de jazz apaixonado que sonha em abrir o próprio clube. Em Los Angeles, os dois se encontram, se apaixonam e passam a apoiar os sonhos um do outro.",
      "Conforme o sucesso começa a aparecer, o casal precisa decidir quanto está disposto a abrir mão para seguir seus caminhos. Musical vencedor de seis Oscars, incluindo Melhor Direção e Melhor Atriz."
    ],
    direcao: "Damien Chazelle",
    elenco: ["Ryan Gosling", "Emma Stone", "John Legend", "Rosemarie DeWitt"],
    duracao: 128,
    pais: "Estados Unidos",
    estudio: "Summit Entertainment",
    plataformas: ["Netflix", "Globo Play"]
  },
  {
    id: "festa-da-salsicha",
    titulo: "Festa da Salsicha",
    tituloOriginal: "Sausage Party",
    categoria: "Animação",
    generos: ["Animação", "Comédia"],
    ano: 2016,
    nota: 1.9,
    poster: "imagens/festa.jpg",
    resumo: "Em um supermercado, os produtos sonham com o paraíso, até que uma salsicha descobre a verdade.",
    sinopse: [
      "Dentro de um supermercado, os produtos acreditam que os humanos são deuses e que, ao serem escolhidos, serão levados ao paraíso. Frank, uma salsicha otimista, começa a desconfiar quando um produto devolvido volta apavorado com o que viu lá fora.",
      "Decidido a descobrir a verdade, Frank parte em uma jornada caótica pelo mercado."
    ],
    aviso: "Esta não é uma animação para crianças: o humor é pesado e voltado ao público adulto.",
    direcao: "Greg Tiernan e Conrad Vernon",
    elenco: ["Seth Rogen", "Kristen Wiig", "Jonah Hill", "Michael Cera"],
    duracao: 89,
    pais: "Estados Unidos",
    estudio: "Columbia Pictures / Annapurna Pictures",
    plataformas: ["Prime Video"]
  },
  {
    id: "chainsaw-man-arco-da-reze",
    titulo: "Chainsaw Man - O Filme: Arco da Reze",
    tituloOriginal: "Chainsaw Man – The Movie: Reze Arc",
    categoria: "Ação",
    generos: ["Ação", "Animação"],
    ano: 2025,
    nota: 5.0,
    poster: "imagens/bomba.png",
    resumo: "Denji conhece a misteriosa Reze e vê um romance improvável virar uma batalha violenta.",
    sinopse: [
      "Denji vive como caçador de demônios ao lado de Pochita, o demônio-motosserra que se fundiu ao seu coração. Em meio a uma rotina de lutas e solidão, ele conhece Reze, uma garota carismática e misteriosa que desperta sentimentos que ele nunca tinha experimentado.",
      "O que parecia um romance simples logo se transforma em uma disputa violenta e cheia de segredos, em um filme que mistura ação intensa, drama e o capricho de animação do estúdio MAPPA."
    ],
    direcao: "Tatsuya Yoshihara",
    elenco: ["Kikunosuke Toya", "Reina Ueda", "Tomori Kusunoki", "Ai Fairouz"],
    duracao: 100,
    pais: "Japão",
    estudio: "MAPPA",
    plataformas: ["Prime Video", "Netflix"]
  },
  {
    id: "vingadores-doomsday",
    titulo: "Vingadores: Doomsday",
    tituloOriginal: "Avengers: Doomsday",
    categoria: "Ação",
    generos: ["Ação", "Ficção", "Aventura"],
    ano: 2026,
    estreia: "2026-12-18",
    nota: 5.0,
    poster: "imagens/mfdoom.png",
    resumo: "O Doutor Destino chega ao centro do palco e os Vingadores enfrentam uma de suas maiores ameaças.",
    sinopse: [
      "Dirigido pelos irmãos Anthony e Joe Russo, os mesmos de Guerra Infinita e Ultimato, Vingadores: Doomsday reúne heróis de diferentes gerações do Universo Cinematográfico Marvel contra uma ameaça de proporções gigantescas.",
      "O Doutor Destino, interpretado por Robert Downey Jr., é a figura central da trama. O filme tem estreia marcada para 18 de dezembro de 2026."
    ],
    direcao: "Anthony Russo e Joe Russo",
    elenco: ["Robert Downey Jr.", "Chris Hemsworth", "Anthony Mackie", "Sebastian Stan"],
    duracao: null,
    pais: "Estados Unidos",
    estudio: "Marvel Studios",
    plataformas: []
  },
  {
    id: "velozes-furiosos-desafio-em-toquio",
    titulo: "Velozes & Furiosos: Desafio em Tóquio",
    tituloOriginal: "The Fast and the Furious: Tokyo Drift",
    categoria: "Corrida",
    generos: ["Corrida", "Ação"],
    ano: 2006,
    nota: 4.9,
    poster: "imagens/tokyo.png",
    resumo: "Um jovem rebelde vai parar em Tóquio e descobre o mundo das corridas de drift.",
    sinopse: [
      "Depois de se meter em confusão por causa de rachas ilegais, o adolescente Sean Boswell é mandado para morar com o pai no Japão. Em Tóquio, ele conhece o universo das corridas de drift, onde precisa aprender uma nova forma de pilotar.",
      "Entre amizades improváveis, rivalidades e perseguições pelas ruas iluminadas da cidade, Sean tenta provar seu valor ao enfrentar o principal nome do drift local."
    ],
    direcao: "Justin Lin",
    elenco: ["Lucas Black", "Bow Wow", "Nathalie Kelley", "Sung Kang"],
    duracao: 104,
    pais: "Estados Unidos",
    estudio: "Universal Pictures",
    plataformas: ["Prime Video", "Globo Play"]
  }
];
