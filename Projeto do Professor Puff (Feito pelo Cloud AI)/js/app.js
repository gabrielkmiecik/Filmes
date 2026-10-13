/* =====================================================================
   CineCatálogo — app.js
   Comportamentos do site: menu, busca, Modo cinema, "Minha lista",
   filtros do catálogo, página do filme, formulários etc.
   Os dados dos filmes ficam em js/filmes.js
   ===================================================================== */
(function () {
  "use strict";

  const FILMES = window.FILMES || [];
  const GENEROS = window.GENEROS || [];

  /* ---------- 1. Utilitários ---------- */
  const $ = (seletor, contexto = document) => contexto.querySelector(seletor);
  const $$ = (seletor, contexto = document) => Array.from(contexto.querySelectorAll(seletor));

  // Evita que texto digitado vire HTML (segurança básica)
  const escapar = (texto) =>
    String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // "Ação" e "acao" viram a mesma coisa na hora de buscar
  const normalizar = (texto) =>
    String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const nota = (n) => Number(n).toFixed(1).replace(".", ",");
  const icone = (nome, extra = "") =>
    `<svg class="icone ${extra}" aria-hidden="true"><use href="#i-${nome}"></use></svg>`;
  const params = () => new URLSearchParams(window.location.search);
  const urlFilme = (f) => `single.html?id=${encodeURIComponent(f.id)}`;
  const urlGenero = (nome) => `filmes.html?genero=${encodeURIComponent(nome)}`;
  const filmePorId = (id) => FILMES.find((f) => f.id === id);
  const generosDe = (f) => f.generos || [f.categoria];
  const filmesDoGenero = (nome) => FILMES.filter((f) => generosDe(f).includes(nome));
  const generoPorChave = (chave) => {
    const k = normalizar(chave);
    return GENEROS.find((g) => normalizar(g.nome) === k || g.slug === k);
  };
  const sortearEntre = (lista, excluirId) => {
    const opcoes = lista.filter((f) => f.id !== excluirId);
    const base = opcoes.length ? opcoes : lista;
    return base[Math.floor(Math.random() * base.length)];
  };
  const ehFuturo = (f) => Boolean(f.estreia) && new Date(f.estreia + "T00:00:00") > new Date();
  const dataLonga = (iso) =>
    new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const duracaoTexto = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
  };

  const ORDENACOES = {
    destaques: () => 0, // mantém a ordem do arquivo filmes.js
    nota: (a, b) => b.nota - a.nota || b.ano - a.ano,
    recentes: (a, b) => b.ano - a.ano || b.nota - a.nota,
    antigos: (a, b) => a.ano - b.ano || b.nota - a.nota,
    az: (a, b) => a.titulo.localeCompare(b.titulo, "pt-BR")
  };

  /* ---------- 2. Armazenamento no navegador (localStorage) ---------- */
  const memoria = {}; // plano B caso o navegador bloqueie o localStorage
  const Armazenamento = {
    ler(chave, padrao) {
      try {
        const bruto = localStorage.getItem(chave);
        if (bruto !== null) return JSON.parse(bruto);
      } catch (e) { /* ignora */ }
      return chave in memoria ? memoria[chave] : padrao;
    },
    gravar(chave, valor) {
      memoria[chave] = valor;
      try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* ignora */ }
    }
  };

  // "Minha lista": guarda só os ids dos filmes
  const Lista = {
    chave: "cc-lista",
    ids() {
      const salvos = Armazenamento.ler(this.chave, []);
      return Array.isArray(salvos) ? salvos.filter((id) => filmePorId(id)) : [];
    },
    tem(id) { return this.ids().includes(id); },
    alternar(id) { // devolve true se o filme entrou na lista
      const ids = this.ids();
      const pos = ids.indexOf(id);
      if (pos >= 0) ids.splice(pos, 1); else ids.push(id);
      Armazenamento.gravar(this.chave, ids);
      return pos < 0;
    },
    limpar() { Armazenamento.gravar(this.chave, []); }
  };

  /* ---------- 3. Aviso rápido (toast) ---------- */
  function toast(mensagem) {
    const area = $(".toasts");
    if (!area) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = icone("check") + `<span>${escapar(mensagem)}</span>`;
    area.appendChild(el);
    setTimeout(() => {
      el.classList.add("saindo");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 2600);
    setTimeout(() => el.remove(), 3600);
  }

  /* ---------- 4. Modo cinema (tema escuro) ---------- */
  function iniciarTema() {
    const raiz = document.documentElement;
    const botoes = $$("[data-alternar-tema]");
    const atualizar = () => {
      const escuro = raiz.getAttribute("data-tema") === "escuro";
      botoes.forEach((b) => {
        b.setAttribute("aria-pressed", escuro ? "true" : "false");
        b.setAttribute("aria-label", escuro ? "Desativar o Modo cinema" : "Ativar o Modo cinema");
        b.title = escuro ? "Voltar ao tema claro" : "Modo cinema (tema escuro)";
      });
    };
    botoes.forEach((b) =>
      b.addEventListener("click", () => {
        const novo = raiz.getAttribute("data-tema") === "escuro" ? "claro" : "escuro";
        raiz.setAttribute("data-tema", novo);
        try { localStorage.setItem("cc-tema", novo); } catch (e) { /* ignora */ }
        atualizar();
      })
    );
    atualizar();
  }

  /* ---------- 5. Cabeçalho: menu mobile e busca ---------- */
  function iniciarCabecalho() {
    const topo = $(".topo");
    if (!topo) return;
    const hamburguer = $(".hamburguer", topo);
    const buscaBtn = $(".busca-toggle", topo);

    const fecharPaineis = () => {
      topo.classList.remove("menu-aberto", "busca-aberta");
      if (hamburguer) {
        hamburguer.setAttribute("aria-expanded", "false");
        hamburguer.setAttribute("aria-label", "Abrir menu");
      }
      if (buscaBtn) buscaBtn.setAttribute("aria-expanded", "false");
    };

    if (hamburguer) {
      hamburguer.addEventListener("click", () => {
        const abrir = !topo.classList.contains("menu-aberto");
        fecharPaineis();
        if (abrir) {
          topo.classList.add("menu-aberto");
          hamburguer.setAttribute("aria-expanded", "true");
          hamburguer.setAttribute("aria-label", "Fechar menu");
        }
      });
    }
    if (buscaBtn) {
      buscaBtn.addEventListener("click", () => {
        const abrir = !topo.classList.contains("busca-aberta");
        fecharPaineis();
        if (abrir) {
          topo.classList.add("busca-aberta");
          buscaBtn.setAttribute("aria-expanded", "true");
          const campo = $(".busca input", topo);
          if (campo) campo.focus();
        }
      });
    }
    $$(".submenu-btn", topo).forEach((botao) =>
      botao.addEventListener("click", () => {
        const aberto = botao.closest(".tem-submenu").classList.toggle("aberto");
        botao.setAttribute("aria-expanded", aberto ? "true" : "false");
      })
    );
    $$(".menu a", topo).forEach((a) => a.addEventListener("click", fecharPaineis));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharPaineis(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 960) fecharPaineis(); });
  }

  // Busca com sugestões enquanto digita
  function iniciarBusca() {
    const form = $(".busca");
    if (!form) return;
    const campo = $("input", form);
    const lista = $(".busca__sugestoes", form);
    let ativo = -1;

    const textoDoFilme = (f) =>
      normalizar([f.titulo, f.tituloOriginal || "", generosDe(f).join(" "), (f.elenco || []).join(" "), f.direcao || ""].join(" "));

    const fechar = () => {
      lista.hidden = true;
      lista.innerHTML = "";
      ativo = -1;
      campo.setAttribute("aria-expanded", "false");
      campo.removeAttribute("aria-activedescendant");
    };

    const marcar = (indice) => {
      const itens = $$(".sugestao", lista);
      if (!itens.length) return;
      ativo = (indice + itens.length) % itens.length;
      itens.forEach((li, i) => li.classList.toggle("ativo", i === ativo));
      campo.setAttribute("aria-activedescendant", itens[ativo].id);
    };

    const mostrar = () => {
      const termo = normalizar(campo.value);
      if (!termo) return fechar();
      const achados = FILMES.filter((f) => textoDoFilme(f).includes(termo)).slice(0, 5);
      ativo = -1;
      lista.innerHTML = achados.length
        ? achados.map((f, i) => `
            <li class="sugestao" id="sug-${i}" role="option">
              <a href="${urlFilme(f)}">
                <img src="${escapar(f.poster)}" alt="">
                <span><strong>${escapar(f.titulo)}</strong><small>${escapar(f.categoria)}, ${f.ano}</small></span>
              </a>
            </li>`).join("")
        : `<li class="sugestao--vazia" role="presentation">Nenhum filme encontrado para “${escapar(campo.value.trim())}”.</li>`;
      lista.hidden = false;
      campo.setAttribute("aria-expanded", "true");
    };

    campo.addEventListener("input", mostrar);
    campo.addEventListener("focus", () => { if (campo.value.trim()) mostrar(); });
    campo.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); marcar(ativo + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); marcar(ativo - 1); }
      else if (e.key === "Escape") { fechar(); }
      else if (e.key === "Enter" && ativo >= 0) {
        e.preventDefault();
        const link = $(".sugestao.ativo a", lista);
        if (link) window.location.href = link.getAttribute("href");
      }
    });
    document.addEventListener("click", (e) => { if (!form.contains(e.target)) fechar(); });
  }

  /* ---------- 6. Favoritos (botão de coração) ---------- */
  const rotuloFav = (f, ativo) => `${ativo ? "Remover" : "Adicionar"} ${f.titulo} ${ativo ? "da" : "à"} minha lista`;

  function atualizarFavoritos() {
    const ids = Lista.ids();
    $$("[data-fav]").forEach((botao) => {
      const f = filmePorId(botao.dataset.fav);
      if (!f) return;
      const ativo = ids.includes(f.id);
      botao.setAttribute("aria-pressed", ativo ? "true" : "false");
      const texto = $("[data-fav-texto]", botao);
      if (texto) texto.textContent = ativo ? "Na minha lista" : "Adicionar à minha lista";
      else botao.setAttribute("aria-label", rotuloFav(f, ativo)); // só o coração dos cards precisa de rótulo
    });
    $$("[data-contador-lista]").forEach((el) => {
      el.textContent = ids.length;
      el.hidden = ids.length === 0;
    });
  }

  function iniciarFavoritos() {
    document.addEventListener("click", (e) => {
      const botao = e.target.closest("[data-fav]");
      if (!botao) return;
      e.preventDefault();
      const f = filmePorId(botao.dataset.fav);
      if (!f) return;
      const entrou = Lista.alternar(f.id);
      atualizarFavoritos();
      botao.classList.add("pop");
      setTimeout(() => botao.classList.remove("pop"), 400);
      toast(entrou ? `“${f.titulo}” foi para a sua lista` : `“${f.titulo}” saiu da sua lista`);
      document.dispatchEvent(new CustomEvent("lista:mudou"));
    });
    atualizarFavoritos();
  }

  /* ---------- 7. Peças de HTML reaproveitadas ---------- */
  function cardFilme(f) {
    const ativo = Lista.tem(f.id);
    const breve = ehFuturo(f) ? '<span class="selo-breve">Em breve</span>' : "";
    return `
      <article class="card">
        <a class="card__link" href="${urlFilme(f)}" aria-label="Ver detalhes de ${escapar(f.titulo)}">
          <div class="card__poster">
            <img src="${escapar(f.poster)}" alt="Pôster de ${escapar(f.titulo)}" loading="lazy">
            <span class="nota">${icone("estrela", "icone--cheio")}${nota(f.nota)}</span>
            ${breve}
          </div>
          <div class="card__info">
            <h3 class="card__titulo">${escapar(f.titulo)}</h3>
            <p class="card__meta"><span>${escapar(f.categoria)}</span><span>${f.ano}</span></p>
            <p class="card__resumo">${escapar(f.resumo)}</p>
          </div>
        </a>
        <button class="fav" type="button" data-fav="${escapar(f.id)}" aria-pressed="${ativo}" aria-label="${escapar(rotuloFav(f, ativo))}">${icone("coracao")}</button>
      </article>`;
  }

  function itemRanking(f, i) {
    return `
      <li>
        <a class="ranking__item" href="${urlFilme(f)}">
          <span class="ranking__pos" aria-hidden="true">${i + 1}</span>
          <span class="ranking__poster"><img src="${escapar(f.poster)}" alt="" loading="lazy"></span>
          <span class="ranking__info"><strong>${escapar(f.titulo)}</strong><small>${escapar(f.categoria)}, ${f.ano}</small></span>
          <span class="ranking__nota">
            <b>${icone("estrela", "icone--cheio")}${nota(f.nota)}</b>
            <span class="barra" style="--nota:${f.nota}"><i></i></span>
          </span>
        </a>
      </li>`;
  }

  function linhaGenero(g, modo) {
    const filmes = filmesDoGenero(g.nome);
    const qtd = filmes.length;
    const fotos = filmes.slice(0, 3).map((f) => `<img src="${escapar(f.poster)}" alt="" loading="lazy">`).join("");
    const rotulo = qtd ? `${qtd} ${qtd === 1 ? "filme" : "filmes"}` : "Em breve";
    const miolo = `
      <span><span class="quadro__nome">${escapar(g.nome)}</span><span class="quadro__desc">${escapar(g.descricao)}</span></span>
      <span class="quadro__qtd">${rotulo}</span>
      <span class="quadro__fotos" aria-hidden="true">${fotos}</span>`;
    if (!qtd) return `<li><div class="quadro__linha quadro__linha--vazia">${miolo}</div></li>`;
    const destino = modo === "ancora" ? `#genero-${g.slug}` : urlGenero(g.nome);
    return `<li><a class="quadro__linha" href="${destino}">${miolo}</a></li>`;
  }

  function cardEstreia(f) {
    const futuro = ehFuturo(f);
    const ativo = Lista.tem(f.id);
    const contagem = futuro
      ? `<div class="contagem" role="timer" aria-label="Tempo que falta para a estreia" data-contagem="${f.estreia}T00:00:00">
           <div><strong data-u="d">00</strong><span>dias</span></div>
           <div><strong data-u="h">00</strong><span>horas</span></div>
           <div><strong data-u="m">00</strong><span>min</span></div>
           <div><strong data-u="s">00</strong><span>seg</span></div>
         </div>`
      : "";
    return `
      <article class="estreia">
        <a class="estreia__poster" href="${urlFilme(f)}" tabindex="-1" aria-hidden="true"><img src="${escapar(f.poster)}" alt="" loading="lazy"></a>
        <div>
          <span class="estreia__status ${futuro ? "estreia__status--breve" : ""}">${futuro ? "Em breve" : "Já lançado"}</span>
          <h3><a href="${urlFilme(f)}">${escapar(f.titulo)}</a></h3>
          <p class="estreia__data">${icone("calendario")} ${futuro ? "Estreia em" : "Lançado em"} ${dataLonga(f.estreia)}</p>
          <p class="estreia__resumo">${escapar(f.resumo)}</p>
          ${contagem}
          <div class="estreia__acoes">
            <a class="btn btn--primario btn--pequeno" href="${urlFilme(f)}">Ver detalhes</a>
            <button class="btn btn--contorno btn--pequeno" type="button" data-fav="${escapar(f.id)}" aria-pressed="${ativo}">${icone("coracao")}<span data-fav-texto>Adicionar à minha lista</span></button>
          </div>
        </div>
      </article>`;
  }

  /* ---------- 8. Carrossel, contagem regressiva e sorteio ---------- */
  function iniciarCarrosseis() {
    $$("[data-carrossel]").forEach((car) => {
      const trilho = $(".carrossel__trilho", car);
      const ant = $(".carrossel__btn--ant", car);
      const prox = $(".carrossel__btn--prox", car);
      if (!trilho || !ant || !prox) return;
      const passo = () => Math.max(trilho.clientWidth * 0.8, 220);
      const atualizar = () => {
        ant.disabled = trilho.scrollLeft <= 4;
        prox.disabled = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4;
      };
      ant.addEventListener("click", () => trilho.scrollBy({ left: -passo(), behavior: "smooth" }));
      prox.addEventListener("click", () => trilho.scrollBy({ left: passo(), behavior: "smooth" }));
      trilho.addEventListener("scroll", atualizar, { passive: true });
      window.addEventListener("resize", atualizar);
      atualizar();
    });
  }

  function iniciarContagens() {
    const contadores = $$("[data-contagem]");
    if (!contadores.length) return;
    const atualizar = () => contadores.forEach((el) => {
      if (!el.isConnected) return;
      const falta = new Date(el.dataset.contagem) - new Date();
      if (falta <= 0) {
        el.outerHTML = `<p class="estreia__data">${icone("check")} Já estreou!</p>`;
        return;
      }
      const s = Math.floor(falta / 1000);
      const partes = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
      Object.keys(partes).forEach((k) => {
        const alvo = $(`[data-u="${k}"]`, el);
        if (alvo) alvo.textContent = String(partes[k]).padStart(2, "0");
      });
    });
    atualizar();
    setInterval(atualizar, 1000);
  }

  function iniciarSorteio() {
    const botao = $("#sortear-btn");
    const area = $("#sorteio-resultado");
    if (!botao || !area || !FILMES.length) return;
    let ultimo = null;

    const sortear = () => {
      const f = sortearEntre(FILMES, ultimo);
      ultimo = f.id;
      area.innerHTML = `
        <div class="sorteio__filme">
          <a class="card__poster" href="${urlFilme(f)}" tabindex="-1" aria-hidden="true"><img src="${escapar(f.poster)}" alt=""></a>
          <div>
            <h3>${escapar(f.titulo)}</h3>
            <p class="card__meta"><span>${escapar(f.categoria)}</span><span>${f.ano}</span><span>Nota ${nota(f.nota)}</span></p>
            <p>${escapar(f.resumo)}</p>
            <div class="estreia__acoes">
              <a class="btn btn--primario btn--pequeno" href="${urlFilme(f)}">Ver detalhes</a>
              <button class="btn btn--contorno btn--pequeno" type="button" data-fav="${escapar(f.id)}" aria-pressed="false">${icone("coracao")}<span data-fav-texto>Adicionar à minha lista</span></button>
            </div>
          </div>
        </div>`;
      botao.textContent = "Sortear outro";
      atualizarFavoritos();
    };

    botao.addEventListener("click", sortear);
    // o botão do hero rola até aqui e já sorteia um filme
    $$("[data-ir-sorteio]").forEach((link) =>
      link.addEventListener("click", () => setTimeout(() => { if (!ultimo) sortear(); }, 500))
    );
  }

  /* ---------- 9. Página inicial ---------- */
  function paginaHome() {
    const trilho = $("#trilho-destaques");
    if (trilho) trilho.innerHTML = FILMES.map(cardFilme).join("");

    const ranking = $("#ranking");
    if (ranking) ranking.innerHTML = FILMES.slice().sort(ORDENACOES.nota).slice(0, 5).map(itemRanking).join("");

    const estreias = FILMES.filter((f) => f.estreia).sort((a, b) => a.estreia.localeCompare(b.estreia));
    const blocoEstreias = $("#estreias");
    if (blocoEstreias) {
      if (estreias.length) blocoEstreias.innerHTML = estreias.map(cardEstreia).join("");
      else if ($("#secao-estreias")) $("#secao-estreias").hidden = true;
    }

    const quadro = $("#quadro-generos");
    if (quadro) quadro.innerHTML = GENEROS.map((g) => linhaGenero(g, "catalogo")).join("");

    iniciarCarrosseis();
    iniciarContagens();
    iniciarSorteio();
  }

  /* ---------- 10. Catálogo: busca, filtros e ordenação ---------- */
  function paginaCatalogo() {
    const grade = $("#lista-filmes");
    if (!grade) return;

    const campoBusca = $("#f-busca");
    const campoNota = $("#f-nota");
    const saidaNota = $("#f-nota-saida");
    const seletorDecada = $("#f-decada");
    const seletorOrdem = $("#f-ordem");
    const blocoGeneros = $("#f-generos");
    const contagem = $("#contagem");
    const vazio = $("#vazio");
    const vazioTexto = $("#vazio-texto");
    const painel = $(".filtros");

    // Opções que dependem dos dados
    const decadas = Array.from(new Set(FILMES.map((f) => Math.floor(f.ano / 10) * 10))).sort((a, b) => b - a);
    seletorDecada.innerHTML =
      '<option value="">Todas</option>' + decadas.map((d) => `<option value="${d}">Anos ${d}</option>`).join("");
    blocoGeneros.innerHTML =
      `<button type="button" class="chip" data-genero="" aria-pressed="false">Todos<small>${FILMES.length}</small></button>` +
      GENEROS.map((g) => {
        const qtd = filmesDoGenero(g.nome).length;
        return `<button type="button" class="chip ${qtd ? "" : "chip--vazio"}" data-genero="${escapar(g.nome)}" aria-pressed="false">${escapar(g.nome)}<small>${qtd}</small></button>`;
      }).join("");

    // Estado inicial (vem do endereço: filmes.html?genero=Ação&ordem=nota)
    const q = params();
    const generoUrl = q.get("genero") ? generoPorChave(q.get("genero")) : null;
    const estado = {
      busca: (q.get("busca") || "").slice(0, 80),
      genero: generoUrl ? generoUrl.nome : "",
      notaMin: Math.min(5, Math.max(0, parseFloat(q.get("nota")) || 0)),
      decada: decadas.map(String).includes(q.get("decada")) ? q.get("decada") : "",
      ordem: Object.keys(ORDENACOES).includes(q.get("ordem")) ? q.get("ordem") : "destaques",
      vista: q.get("vista") === "lista" ? "lista" : "grade"
    };
    campoBusca.value = estado.busca;
    campoNota.value = estado.notaMin;
    seletorDecada.value = estado.decada;
    seletorOrdem.value = estado.ordem;

    function filtrar() {
      const termo = normalizar(estado.busca);
      return FILMES.filter((f) => {
        if (estado.genero && !generosDe(f).includes(estado.genero)) return false;
        if (f.nota < estado.notaMin) return false;
        if (estado.decada && String(Math.floor(f.ano / 10) * 10) !== estado.decada) return false;
        if (termo) {
          const texto = normalizar([f.titulo, f.tituloOriginal, generosDe(f).join(" "), f.direcao, (f.elenco || []).join(" "), f.ano].filter(Boolean).join(" "));
          if (!texto.includes(termo)) return false;
        }
        return true;
      }).sort(ORDENACOES[estado.ordem]);
    }

    function guardarNoEndereco() {
      const novo = new URLSearchParams();
      if (estado.busca) novo.set("busca", estado.busca);
      if (estado.genero) novo.set("genero", estado.genero);
      if (estado.notaMin > 0) novo.set("nota", estado.notaMin);
      if (estado.decada) novo.set("decada", estado.decada);
      if (estado.ordem !== "destaques") novo.set("ordem", estado.ordem);
      if (estado.vista !== "grade") novo.set("vista", estado.vista);
      try { history.replaceState(null, "", novo.toString() ? `?${novo}` : window.location.pathname); } catch (e) { /* abrindo direto do arquivo, ignora */ }
    }

    function aplicar() {
      const resultado = filtrar();

      grade.className = "grade" + (estado.vista === "lista" ? " grade--lista" : "");
      grade.innerHTML = resultado.map(cardFilme).join("");
      grade.hidden = resultado.length === 0;
      vazio.hidden = resultado.length > 0;
      contagem.innerHTML = `Mostrando <strong>${resultado.length}</strong> de ${FILMES.length} ${FILMES.length === 1 ? "filme" : "filmes"}`;

      if (!resultado.length) {
        const semTitulos = estado.genero && filmesDoGenero(estado.genero).length === 0;
        vazioTexto.textContent = semTitulos
          ? `Ainda não temos filmes de ${estado.genero}. Novos títulos chegam em breve.`
          : "Nenhum filme combina com a busca e os filtros escolhidos. Tente remover algum filtro.";
      }

      $$(".chip", blocoGeneros).forEach((chip) => chip.setAttribute("aria-pressed", chip.dataset.genero === estado.genero ? "true" : "false"));
      $$(".vista button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.vista === estado.vista ? "true" : "false"));
      saidaNota.textContent = estado.notaMin > 0 ? `${nota(estado.notaMin)} ou mais` : "Todas";
      guardarNoEndereco();
    }

    campoBusca.addEventListener("input", () => { estado.busca = campoBusca.value.trim(); aplicar(); });
    campoNota.addEventListener("input", () => { estado.notaMin = parseFloat(campoNota.value) || 0; aplicar(); });
    seletorDecada.addEventListener("change", () => { estado.decada = seletorDecada.value; aplicar(); });
    seletorOrdem.addEventListener("change", () => { estado.ordem = seletorOrdem.value; aplicar(); });
    blocoGeneros.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      estado.genero = chip.dataset.genero;
      aplicar();
    });
    $$(".vista button").forEach((b) => b.addEventListener("click", () => { estado.vista = b.dataset.vista; aplicar(); }));

    const limpar = () => {
      Object.assign(estado, { busca: "", genero: "", notaMin: 0, decada: "", ordem: "destaques" });
      campoBusca.value = "";
      campoNota.value = 0;
      seletorDecada.value = "";
      seletorOrdem.value = "destaques";
      aplicar();
    };
    $$("[data-limpar-filtros]").forEach((b) => b.addEventListener("click", limpar));

    // painel de filtros no celular
    const alternar = $(".filtros__alternar");
    if (alternar && painel) {
      alternar.addEventListener("click", () => {
        const aberto = painel.classList.toggle("filtros--aberto");
        alternar.setAttribute("aria-expanded", aberto ? "true" : "false");
      });
    }

    aplicar();
  }

  /* ---------- 11. Página de gêneros ---------- */
  function paginaGeneros() {
    const quadro = $("#quadro-generos");
    const secoes = $("#generos-secoes");
    if (quadro) quadro.innerHTML = GENEROS.map((g) => linhaGenero(g, "ancora")).join("");
    if (!secoes) return;
    secoes.innerHTML = GENEROS.filter((g) => filmesDoGenero(g.nome).length).map((g) => {
      const filmes = filmesDoGenero(g.nome);
      return `
        <section class="genero-secao" id="genero-${g.slug}" aria-labelledby="gt-${g.slug}">
          <div class="container">
            <header class="secao__topo">
              <div>
                <h2 id="gt-${g.slug}">${escapar(g.nome)}</h2>
                <p>${escapar(g.descricao)} ${filmes.length} ${filmes.length === 1 ? "filme" : "filmes"} no catálogo.</p>
              </div>
              <a class="link-todos" href="${urlGenero(g.nome)}">Ver no catálogo</a>
            </header>
            <div class="grade">${filmes.map(cardFilme).join("")}</div>
          </div>
        </section>`;
    }).join("");
  }

  /* ---------- 12. Página do filme (single.html?id=...) ---------- */
  async function compartilhar(f) {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: f.titulo, text: f.resumo, url }); return; }
      catch (e) { if (e.name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copiado!");
    } catch (e) {
      const campo = document.createElement("textarea");
      campo.value = url;
      document.body.appendChild(campo);
      campo.select();
      try { document.execCommand("copy"); toast("Link copiado!"); } catch (erro) { toast("Não foi possível copiar o link"); }
      campo.remove();
    }
  }

  function iniciarSuaNota(f) {
    const caixa = $("[data-sua-nota]");
    const texto = $("[data-sua-nota-texto]");
    if (!caixa || !texto) return;
    const botoes = $$("button", caixa);
    const salvas = () => Armazenamento.ler("cc-notas", {});
    const pintar = (n) => botoes.forEach((b) => b.classList.toggle("ativa", Number(b.dataset.valor) <= n));
    const mostrar = () => {
      const n = salvas()[f.id] || 0;
      pintar(n);
      texto.textContent = n ? `Você deu ${n} de 5 estrelas.` : "Clique nas estrelas para avaliar.";
    };
    botoes.forEach((b) => {
      b.addEventListener("mouseenter", () => pintar(Number(b.dataset.valor)));
      b.addEventListener("click", () => {
        const todas = salvas();
        const valor = Number(b.dataset.valor);
        if (todas[f.id] === valor) delete todas[f.id]; else todas[f.id] = valor;
        Armazenamento.gravar("cc-notas", todas);
        mostrar();
      });
    });
    caixa.addEventListener("mouseleave", mostrar);
    mostrar();
  }

  function paginaFilme() {
    const alvo = $("#detalhe");
    if (!alvo) return;
    const id = params().get("id");
    const f = id ? filmePorId(id) : FILMES[0];

    if (!f) {
      document.title = "Filme não encontrado — CineCatálogo";
      alvo.innerHTML = `
        <div class="container erro">
          <h1>Ops!</h1>
          <h2>Filme não encontrado</h2>
          <p>O endereço pode estar errado ou o filme saiu do catálogo.</p>
          <a class="btn btn--primario" href="filmes.html">Ver o catálogo</a>
        </div>`;
      return;
    }

    document.title = `${f.titulo} — CineCatálogo`;
    const descricao = $('meta[name="description"]');
    if (descricao) descricao.setAttribute("content", f.resumo);

    const futuro = ehFuturo(f);
    const ativo = Lista.tem(f.id);
    const meta = [`<li>${icone("calendario")} ${f.ano}</li>`];
    if (f.duracao) meta.push(`<li>${icone("relogio")} ${duracaoTexto(f.duracao)}</li>`);
    if (f.pais) meta.push(`<li>${icone("globo")} ${escapar(f.pais)}</li>`);

    const ficha = [
      ["Título original", f.tituloOriginal],
      ["Direção", f.direcao],
      ["Elenco", (f.elenco || []).join(", ")],
      ["Duração", f.duracao ? duracaoTexto(f.duracao) : ""],
      ["País", f.pais],
      ["Estúdio", f.estudio],
      ["Ano", String(f.ano)],
      ["Estreia", f.estreia ? dataLonga(f.estreia) : ""]
    ].filter((linha) => linha[1]);

    const sinopse = (Array.isArray(f.sinopse) ? f.sinopse : [f.sinopse]).map((p) => `<p>${escapar(p)}</p>`).join("");

    let onde;
    if (futuro) {
      onde = `<div class="sinopse"><p>Estreia nos cinemas em <strong>${dataLonga(f.estreia)}</strong>.</p></div>`;
    } else if (f.plataformas && f.plataformas.length) {
      onde = `<ul class="plataformas">${f.plataformas.map((p) => `<li>${escapar(p)}</li>`).join("")}</ul>
              <p class="nota-rodape">A disponibilidade pode mudar. Confira na plataforma antes de assistir.</p>`;
    } else {
      onde = `<div class="sinopse"><p>Ainda não temos informações de onde assistir.</p></div>`;
    }

    // Filmes parecidos: os que dividem mais gêneros com este
    const emComum = (o) => generosDe(o).filter((g) => generosDe(f).includes(g)).length;
    let relacionados = FILMES.filter((o) => o.id !== f.id && emComum(o) > 0)
      .sort((a, b) => emComum(b) - emComum(a) || b.nota - a.nota).slice(0, 4);
    if (!relacionados.length) relacionados = FILMES.filter((o) => o.id !== f.id).sort(ORDENACOES.nota).slice(0, 4);

    const pos = FILMES.indexOf(f);
    const anterior = FILMES[(pos - 1 + FILMES.length) % FILMES.length];
    const proximo = FILMES[(pos + 1) % FILMES.length];

    alvo.innerHTML = `
      <section class="filme-hero ilha-escura" aria-labelledby="filme-titulo">
        <div class="container">
          <nav class="migalhas" aria-label="Você está em">
            <ol>
              <li><a href="index.html">Início</a></li>
              <li><a href="filmes.html">Filmes</a></li>
              <li aria-current="page">${escapar(f.titulo)}</li>
            </ol>
          </nav>
          <div class="filme-hero__grade">
            <figure class="filme-poster"><img src="${escapar(f.poster)}" alt="Pôster de ${escapar(f.titulo)}"></figure>
            <div class="filme-info">
              <ul class="filme-info__generos">${generosDe(f).map((g) => `<li><a href="${urlGenero(g)}">${escapar(g)}</a></li>`).join("")}</ul>
              <h1 id="filme-titulo">${escapar(f.titulo)}</h1>
              ${f.tituloOriginal ? `<p class="filme-info__original">${escapar(f.tituloOriginal)}</p>` : ""}
              <ul class="meta-linha">${meta.join("")}</ul>
              <div class="filme-nota">
                <strong>${nota(f.nota)}</strong>
                <div>
                  <span class="estrelas" style="--nota:${f.nota}" role="img" aria-label="Nota ${nota(f.nota)} de 5"></span>
                  <small>Nota do CineCatálogo</small>
                </div>
              </div>
              <div class="filme-acoes">
                <button class="btn btn--primario" type="button" data-fav="${escapar(f.id)}" aria-pressed="${ativo}">${icone("coracao")}<span data-fav-texto>Adicionar à minha lista</span></button>
                <button class="btn btn--contorno" type="button" data-compartilhar>${icone("compartilhar")} Compartilhar</button>
              </div>
              ${f.aviso ? `<p class="aviso">${escapar(f.aviso)}</p>` : ""}
            </div>
          </div>
        </div>
      </section>

      <div class="container detalhe-grade">
        <div class="detalhe-principal">
          <section class="sinopse" aria-labelledby="t-sinopse"><h2 id="t-sinopse">Sinopse</h2>${sinopse}</section>
          <section aria-labelledby="t-onde"><h2 id="t-onde">${futuro ? "Estreia" : "Onde assistir"}</h2>${onde}</section>
          <section aria-labelledby="t-aval">
            <h2 id="t-aval">Sua avaliação</h2>
            <div class="sua-nota" data-sua-nota role="group" aria-label="Sua avaliação">
              ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-valor="${n}" aria-label="${n} ${n === 1 ? "estrela" : "estrelas"}">${icone("estrela")}</button>`).join("")}
            </div>
            <p class="sua-nota__texto" data-sua-nota-texto aria-live="polite"></p>
          </section>
        </div>
        <aside class="ficha" aria-labelledby="t-ficha">
          <h2 id="t-ficha">Ficha técnica</h2>
          <dl>${ficha.map(([nome, valor]) => `<div><dt>${nome}</dt><dd>${escapar(valor)}</dd></div>`).join("")}</dl>
        </aside>
      </div>

      <section class="genero-secao" aria-labelledby="t-parecidos">
        <div class="container">
          <header class="secao__topo"><h2 id="t-parecidos">Você também pode gostar</h2><a class="link-todos" href="filmes.html">Ver todos</a></header>
          <div class="grade">${relacionados.map(cardFilme).join("")}</div>
        </div>
      </section>

      ${FILMES.length > 1 ? `
      <div class="container fim-pagina">
        <nav class="navega-filmes" aria-label="Outros filmes">
          <a href="${urlFilme(anterior)}"><img src="${escapar(anterior.poster)}" alt=""><span><small>Filme anterior</small><strong>${escapar(anterior.titulo)}</strong></span></a>
          <a href="${urlFilme(proximo)}"><span><small>Próximo filme</small><strong>${escapar(proximo.titulo)}</strong></span><img src="${escapar(proximo.poster)}" alt=""></a>
        </nav>
      </div>` : ""}`;

    const botaoCompartilhar = $("[data-compartilhar]");
    if (botaoCompartilhar) botaoCompartilhar.addEventListener("click", () => compartilhar(f));
    atualizarFavoritos();
    iniciarSuaNota(f);
  }

  /* ---------- 13. Minha lista ---------- */
  function paginaLista() {
    const grade = $("#lista-grade");
    if (!grade) return;
    const vazio = $("#lista-vazia");
    const barra = $("#lista-barra");
    const contagem = $("#lista-contagem");

    const desenhar = () => {
      const filmes = Lista.ids().map(filmePorId).filter(Boolean);
      grade.innerHTML = filmes.map(cardFilme).join("");
      grade.hidden = barra.hidden = filmes.length === 0;
      vazio.hidden = filmes.length > 0;
      contagem.innerHTML = `<strong>${filmes.length}</strong> ${filmes.length === 1 ? "filme salvo" : "filmes salvos"} neste navegador`;
    };

    document.addEventListener("lista:mudou", desenhar);
    $("#lista-limpar").addEventListener("click", () => {
      if (!confirm("Remover todos os filmes da sua lista?")) return;
      Lista.limpar();
      atualizarFavoritos();
      desenhar();
      toast("Sua lista foi limpa");
    });
    desenhar();
  }

  /* ---------- 14. Contato (formulário só visual: não envia nada) ---------- */
  function paginaContato() {
    const form = $("[data-form-contato]");
    if (!form) return;
    const mensagens = {
      nome: "Informe seu nome (mínimo de 2 letras).",
      email: "Digite um e-mail válido, como nome@exemplo.com.",
      assunto: "Escolha um assunto.",
      mensagem: "Escreva uma mensagem com pelo menos 10 caracteres."
    };
    const campos = $$("input, select, textarea", form);

    const validar = (campo) => {
      const caixa = campo.closest(".campo");
      const ok = campo.checkValidity();
      caixa.classList.toggle("invalido", !ok);
      campo.setAttribute("aria-invalid", ok ? "false" : "true");
      $(".campo__erro", caixa).textContent = ok ? "" : mensagens[campo.name];
      return ok;
    };

    campos.forEach((campo) => {
      campo.addEventListener("blur", () => validar(campo));
      campo.addEventListener("input", () => { if (campo.closest(".campo").classList.contains("invalido")) validar(campo); });
    });

    const mensagem = $("textarea", form);
    const contador = $("[data-contador]", form);
    if (mensagem && contador) mensagem.addEventListener("input", () => { contador.textContent = `${mensagem.value.length}/500`; });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const resultados = campos.map(validar);
      if (!resultados.every(Boolean)) {
        const primeiro = $(".invalido input, .invalido select, .invalido textarea", form);
        if (primeiro) primeiro.focus();
        return;
      }
      form.hidden = true;
      const sucesso = $("[data-form-sucesso]");
      sucesso.hidden = false;
      sucesso.focus();
    });
    $$("[data-novo-contato]").forEach((b) => b.addEventListener("click", () => {
      form.reset();
      campos.forEach((c) => c.closest(".campo").classList.remove("invalido"));
      $$(".campo__erro", form).forEach((el) => { el.textContent = ""; });
      if (contador) contador.textContent = "0/500";
      $("[data-form-sucesso]").hidden = true;
      form.hidden = false;
    }));
  }

  /* ---------- 15. Sobre: números do catálogo ---------- */
  function paginaSobre() {
    const total = FILMES.length;
    const media = total ? FILMES.reduce((soma, f) => soma + f.nota, 0) / total : 0;
    const plataformas = new Set(FILMES.flatMap((f) => f.plataformas || []));
    const valores = { filmes: total, generos: GENEROS.length, media: nota(media), plataformas: plataformas.size };
    $$("[data-estat]").forEach((el) => {
      if (valores[el.dataset.estat] !== undefined) el.textContent = valores[el.dataset.estat];
    });
  }

  /* ---------- 16. Voltar ao topo e inicialização ---------- */
  function iniciarVoltarTopo() {
    const botao = $(".voltar-topo");
    if (!botao) return;
    const aoRolar = () => botao.classList.toggle("visivel", window.scrollY > 700);
    window.addEventListener("scroll", aoRolar, { passive: true });
    botao.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    aoRolar();
  }

  const PAGINAS = {
    home: paginaHome,
    filmes: paginaCatalogo,
    generos: paginaGeneros,
    filme: paginaFilme,
    lista: paginaLista,
    contato: paginaContato,
    sobre: paginaSobre
  };

  document.addEventListener("DOMContentLoaded", () => {
    iniciarTema();
    iniciarCabecalho();
    iniciarBusca();
    iniciarFavoritos();
    const iniciar = PAGINAS[document.body.dataset.pagina];
    if (iniciar) iniciar();
    iniciarVoltarTopo();
    $$("[data-ano]").forEach((el) => { el.textContent = new Date().getFullYear(); });
  });
})();
