# Fábio · Corretor de Imóveis

Site do corretor Fábio, de Santa Bárbara d’Oeste (SP). Página única, estática (HTML, CSS e JavaScript puros, sem build), publicada na Vercel a partir da pasta `public/`.

A primeira tela é feita para vender: promessa clara, botão de WhatsApp e busca de imóveis. O restante funciona como portfólio: imóveis em destaque, ambientes, como funciona, sobre e contato.

## Ver no seu computador

```bash
npx serve public
```

Ou abra `public/index.html` direto no navegador (a busca, o WhatsApp e o formulário funcionam do mesmo jeito).

## Estrutura

```
public/
  index.html        conteúdo e estrutura
  css/style.css     identidade visual (tokens de cor e tipografia no topo)
  js/main.js        busca/filtro, formulário → WhatsApp, menu, animações de rolagem
  assets/img/       fotos (hoje, imagens ilustrativas do Unsplash)
  assets/fonts/     Bricolage Grotesque e Hanken Grotesk (hospedadas aqui)
vercel.json         publica a pasta public/ e define cabeçalhos de cache
PRODUCT.md          contexto do produto (público, objetivo, restrições)
DESIGN.md           sistema visual (cores, tipografia, componentes)
```

## O que trocar quando o Fábio mandar os dados reais

Tudo abaixo hoje é **ilustrativo**. Nada disso é dado real do Fábio.

| O quê | Onde | Hoje |
| --- | --- | --- |
| Número do WhatsApp | `public/js/main.js` (`SITE.whatsapp`) e o link `tel:` em `public/index.html` | `5519974216218` (real) |
| Telefone exibido | `public/js/main.js` (`SITE.telefone`) e `public/index.html` | `(19) 97421-6218` (real) |
| CRECI | `public/js/main.js` (`SITE.creci`) e `public/index.html` | `195959` (real, informado pelo Fábio) |
| Nome / logotipo | `public/index.html` (`.marca`), `public/assets/favicon.svg`, título da página | "Fábio Ribas" (real) |
| Endereço | seção `#contato` e rodapé em `public/index.html` | Rua José Olegário, 246, Residencial Dona Margarida (real) |
| Texto "Sobre", números (8 anos, 200 negociações, 180 imóveis, 60 parceiros) e método de avaliação | seções `#sobre` e `#vender` em `public/index.html` | texto e números informados pelo Fábio (reais) |
| Fotos do topo, dos imóveis e dos ambientes | `public/assets/img/` (mantenha os nomes ou ajuste os `src` no HTML) | Unsplash |
| Foto do Fábio | seção `#sobre` em `public/index.html` (hoje uma silhueta) | silhueta; a foto real já foi enviada, falta salvar o arquivo em `public/assets/img/fabio-ribas.jpg` |
| Imóveis (código, bairro, quartos, preço, texto) | cartões `.imovel` em `public/index.html` | 6 exemplos |
| Bairros da busca | `<select id="f-bairro">` em `public/index.html` | exemplos |
| Textos de apresentação, "como funciona" e promessas | `public/index.html` | texto provisório, confirmar com o Fábio |
| Instagram e depoimentos reais | ainda não existem na página | a adicionar |
| Aviso "Imóveis de demonstração" e selos "Ilustrativo" | `.demo-nota` e `.selo--demo` | remover ao colocar imóveis reais |
| `noindex` | `<meta name="robots">` em `public/index.html` | **remover** quando o site for ao ar de verdade, para o Google indexar |

Para um novo imóvel, copie um bloco `<article class="imovel" …>` e ajuste `data-tipo`, `data-bairro` e `data-quartos` (a busca usa esses três campos), a foto e os textos.

## Publicação

O repositório está ligado à Vercel. Cada `git push` na branch principal publica uma nova versão. A configuração está em `vercel.json` (saída em `public/`).
