# CineCatálogo

Site de catálogo de filmes feito só com **HTML, CSS e JavaScript** (sem frameworks e sem instalar nada).

## Como abrir

1. Extraia o `.zip`.
2. Dê dois cliques em `index.html`.

Com internet, o site carrega as fontes do Google Fonts (League Gothic e Instrument Sans). Sem internet, ele usa fontes do sistema e continua funcionando.

## Páginas

| Arquivo | O que é |
|---|---|
| `index.html` | Início: hero, faixa de destaques, ranking, estreias com contagem regressiva, gêneros e sorteio |
| `filmes.html` | Catálogo completo: busca, filtros (gênero, nota, década), ordenação e visualização em grade ou lista |
| `generos.html` | Todos os gêneros e os filmes de cada um |
| `single.html` | Página de detalhes. Uma só página serve para todos os filmes: `single.html?id=blade-runner-2049` |
| `minha-lista.html` | Filmes guardados pelo coração (ficam salvos no navegador) |
| `sobre.html` e `contato.html` | Sobre o projeto; contato com formulário e perguntas frequentes |
| `404.html` | Página de erro |

## Estrutura

```
cine-catalogo/
├── index.html, filmes.html, generos.html, single.html, ...
├── style.css        todo o visual, dividido em seções comentadas
├── js/
│   ├── filmes.js    os DADOS: lista de filmes e de gêneros
│   └── app.js       o comportamento do site (menu, busca, filtros...)
└── imagens/         suas imagens originais, sem alteração
```

## Como adicionar um filme

1. Coloque o pôster na pasta `imagens/`.
2. Abra `js/filmes.js`, copie um bloco `{ ... }` da lista `FILMES` e cole no final (com vírgula entre os blocos).
3. Troque os dados. Pronto: o filme aparece no catálogo, na busca e nos gêneros, e ganha a própria página de detalhes.

## Como mudar as cores

No começo do `style.css`, dentro de `:root { ... }`. O vermelho do logo é `--vermelho`. O "Modo cinema" (tema escuro) é o bloco logo abaixo.

## O que foi corrigido no código original

- `<h2>CineCatálogo</h3>` (abria com h2 e fechava com h3) e uma `<div>` solta dentro de `<ul>` no `index.html`.
- `single.html` sem `<!DOCTYPE html>`, e com um submenu de gêneros que o `index.html` não tinha.
- Uma chave `}` sobrando no `style.css`, antes de `footer > p`.
- Imagens sem `alt`, links `href="#"` sem destino e uma página de detalhes com um filme só.

## Para revisar antes de entregar

- **Dados preenchidos por mim:** direção, elenco, duração, estúdio e a lista de "onde assistir". Só o texto e as plataformas do Homem-Aranha vieram dos seus arquivos. Confira os demais.
- **Pôsteres de baixa resolução:** `brand-new-day.jpeg` (194 px de largura) e `tokyo.png` (269 px) ficam borrados nos tamanhos maiores. Troque por versões maiores, mantendo o mesmo nome de arquivo.
- **Formulário de contato:** é só visual e não envia nada. O e-mail `contato@exemplo.com` é um exemplo: troque em `contato.html`.
- **Minha lista, avaliações e tema:** ficam salvos no próprio navegador (localStorage).
