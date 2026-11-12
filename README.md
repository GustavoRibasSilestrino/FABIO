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
  index.html        conteúdo e estrutura do site
  admin.html        painel de imóveis (aparece em /admin)
  css/style.css     identidade visual (tokens de cor e tipografia no topo)
  css/admin.css     estilos do painel
  js/main.js        busca/filtro, formulário → WhatsApp, menu, animações de rolagem
  js/config.js      endereço e chave pública do Supabase (único arquivo de ligação)
  js/comum.js       cidades, tipos de imóvel e funções usadas pelo site e pelo painel
  js/bairros.js     bairros de cada cidade (base de CEPs dos Correios), usados na busca e no painel
  js/imoveis.js     lê os imóveis do Supabase, monta os cartões e a galeria de fotos
  js/admin.js       login, cadastro de imóveis e envio de fotos
  js/vendor/        supabase-js (biblioteca, copiada para cá; licença MIT)
  assets/img/       fotos (hoje, imagens ilustrativas do Unsplash)
  assets/fonts/     Bricolage Grotesque e Hanken Grotesk (hospedadas aqui)
supabase/schema.sql tabelas, regras de segurança e pasta de fotos do banco (rodar no SQL Editor)
vercel.json         publica a pasta public/ e define cabeçalhos de cache
PRODUCT.md          contexto do produto (público, objetivo, restrições)
DESIGN.md           sistema visual (cores, tipografia, componentes)
```

## Dados reais e o que ainda é ilustrativo

A coluna "Hoje" diz o que já é real (informado pelo Fábio) e o que ainda é **ilustrativo** e precisa ser trocado: as fotos do Unsplash, os 6 imóveis de exemplo e os textos provisórios.

| O quê | Onde | Hoje |
| --- | --- | --- |
| Número do WhatsApp | `public/js/main.js` (`SITE.whatsapp`) e o link `tel:` em `public/index.html` | `5519974216218` (real) |
| Telefone exibido | `public/js/main.js` (`SITE.telefone`) e `public/index.html` | `(19) 97421-6218` (real) |
| CRECI | `public/js/main.js` (`SITE.creci`) e `public/index.html` | `195959` (real, informado pelo Fábio) |
| Nome e logotipo | `.marca` e rodapé em `public/index.html`; `public/assets/img/logo-fabio-ribas.webp`; ícones `public/assets/favicon-32.png`, `icon-192.png`, `apple-touch-icon.png` | "Fábio Ribas" e logotipo reais (enviados pelo Fábio) |
| Endereço | seção `#contato` e rodapé em `public/index.html` | Rua José Olegário, 246, Residencial Dona Margarida (real) |
| Texto "Sobre", números (8 anos, 200 negociações, 180 imóveis, 60 parceiros) e método de avaliação | seções `#sobre` e `#vender` em `public/index.html` | texto e números informados pelo Fábio (reais) |
| Fotos do topo, dos imóveis e dos ambientes | `public/assets/img/` (mantenha os nomes ou ajuste os `src` no HTML) | Unsplash |
| Foto do Fábio | seção `#sobre` em `public/index.html` e `public/assets/img/fabio-ribas.jpg` | foto real (enviada pelo Fábio) |
| Imóveis (código, bairro, quartos, preço, fotos, texto) | cadastrados pelo painel `/admin` (veja abaixo). Os 6 cartões `.imovel` de `public/index.html` são só de exemplo | exemplos aparecem enquanto não houver nenhum imóvel real cadastrado; no primeiro imóvel real eles somem sozinhos (e dá para apagá-los do HTML) |
| Cidades e bairros da busca | `<select id="f-cidade">` (3 cidades) em `public/index.html`; o campo Bairro (`<select id="f-bairro">`) lista os bairros da cidade escolhida, vindos de `public/js/bairros.js`, mais os bairros dos imóveis já cadastrados. Cada imóvel tem cidade e bairro | cidades informadas pelo Fábio; bairros da base de CEPs dos Correios (195 em Santa Bárbara d’Oeste, 259 em Americana, 91 em Nova Odessa), sem os códigos de zoneamento |
| Busca por código | linha "Código" no painel de busca do topo (`#busca-codigo`, `#f-codigo`), tratada em `public/js/main.js`; aceita "FB-101", "fb101" ou só "101" | funciona com o código de cada imóvel (gerado como FB-101, FB-102… ou escolhido no painel) |
| Textos de apresentação, "como funciona" e promessas | `public/index.html` | texto provisório, confirmar com o Fábio |
| Instagram e depoimentos reais | ainda não existem na página | a adicionar |
| Aviso "Imóveis de demonstração" e selos "Ilustrativo" | `.demo-nota` e `.selo--demo` | remover ao colocar imóveis reais |
| Indexação no Google | `public/index.html` | `noindex` removido em 12/11/2026 (decisão do Gustavo), com `canonical` e `og:url` apontando para `https://fabioribasimoveis.com.br/`. O conteúdo ainda tem imóveis e fotos de exemplo |
| Domínio | Vercel (projeto `fabio-imoveis`) e DNS no Registro.br; `vercel.json` redireciona `www` para o domínio principal | `fabioribasimoveis.com.br` |

## Painel de imóveis (`/admin`)

O Fábio entra em `https://fabioribasimoveis.com.br/admin` com e-mail e senha e cadastra, edita, oculta, marca como vendido ou exclui imóveis, com várias fotos (a primeira é a capa). Os imóveis ficam no Supabase e o site os lê ao abrir, então não é preciso mexer no código nem publicar de novo.

- **Banco e fotos:** projeto Supabase `mhjvryysmsmtgekqcwvs`. As tabelas, as regras de segurança (RLS) e a pasta pública de fotos `imoveis` vêm de `supabase/schema.sql`.
- **Quem pode editar:** só os e-mails da tabela `public.admins`. Para liberar outra pessoa, crie o usuário em Authentication > Users e rode `insert into public.admins (email) values ('email@dela.com');`. O cadastro público de usuários fica desligado.
- **Ligação:** `public/js/config.js` tem o endereço do projeto e a chave **pública** (`sb_publishable_…` ou `anon`). Nunca coloque ali a chave `secret` ou `service_role`.
- **Fotos:** o painel reduz cada foto no navegador e guarda duas versões, a grande (até 1800 px, galeria) e a média (até 900 px, cartões).
- **Se a chave ainda não estiver preenchida:** o site mostra os exemplos do HTML e o painel avisa que não está conectado.
- **Se o Supabase não responder** (por exemplo, projeto gratuito pausado por falta de uso): o site mostra "Não conseguimos carregar os imóveis agora" com o botão de WhatsApp. Para voltar, abra o projeto no painel do Supabase e use **Restore project**.
- **Senha esquecida:** o link "Esqueci minha senha" do painel envia um e-mail de recuperação. Os endereços `https://fabioribasimoveis.com.br/admin` e `https://fabio-imoveis.vercel.app/admin` precisam estar em Authentication > URL Configuration > Redirect URLs.

- **Bairro:** no cadastro, o bairro é escolhido numa lista que muda com a cidade. Se faltar, "Outro bairro (digitar)" aceita o nome e ele passa a aparecer também na busca do site.
- **Código:** o painel gera FB-101, FB-102… Se preferir, o Fábio pode digitar o próprio código (letras, números e hífen, até 20 caracteres; não pode repetir). É o que o cliente usa em "Buscar código".

Os valores aceitos em `tipo` são: casa, casa-condominio, sobrado, apartamento, terreno, chacara, sitio e comercial. As cidades e os tipos exibidos estão em `public/js/comum.js`; para incluir uma cidade nova, edite a lista `CIDADES` ali e o `<select id="f-cidade">` de `public/index.html`.

## Publicação

O repositório está ligado à Vercel. Cada `git push` na branch principal publica uma nova versão. A configuração está em `vercel.json` (saída em `public/`).
