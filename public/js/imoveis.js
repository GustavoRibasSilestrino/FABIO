/* Imóveis do site: lê do Supabase (cadastrados pelo painel /admin), monta os cartões
   e a galeria de fotos. Sem a chave em js/config.js, os imóveis de exemplo do HTML continuam. */
(() => {
  'use strict';

  const F = window.FABIO;
  const grade = document.getElementById('grade');
  if (!F || !F.ativo || !grade) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const CAMPOS = 'id,codigo,titulo,tipo,cidade,bairro,quartos,banheiros,vagas,area_terreno,area_construida,preco,descricao,fotos,destaque,status';
  const porId = new Map();

  /* ---------- pequenas ajudas para montar HTML sem injetar texto ---------- */
  const h = (tag, attrs, ...filhos) => {
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === false || v == null) return;
      if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    filhos.flat().forEach(f => { if (f != null && f !== false) el.append(f); });
    return el;
  };
  const icone = id => {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'i');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#' + id);
    svg.append(use);
    return svg;
  };

  const tituloDe = im => im.titulo || `${F.rotulo(F.TIPOS, im.tipo)} em ${im.bairro}`;
  const fotosDe = im => (Array.isArray(im.fotos) ? im.fotos : []);

  const especificacoes = im => {
    const l = [];
    if (im.quartos > 0) l.push(['i-bed', F.plural(im.quartos, 'quarto', 'quartos')]);
    if (im.banheiros > 0) l.push(['i-bath', F.plural(im.banheiros, 'banheiro', 'banheiros')]);
    if (im.vagas > 0) l.push(['i-car', F.plural(im.vagas, 'vaga', 'vagas')]);
    const usa = F.areasDoTipo(im.tipo);
    if (usa.includes('terreno') && im.area_terreno > 0) l.push(['i-area', `${F.numero(im.area_terreno)} m² de terreno`]);
    if (usa.includes('construida') && im.area_construida > 0) {
      // apartamento tem uma metragem só: "68 m²"; nos demais, "180 m² construídos"
      l.push(['i-area', im.tipo === 'apartamento' ? `${F.numero(im.area_construida)} m²` : `${F.numero(im.area_construida)} m² construídos`]);
    }
    return l;
  };

  const etiqueta = im => h('dl', { class: 'etiqueta' },
    h('div', {}, h('dt', { text: 'Código' }), h('dd', { text: im.codigo })),
    h('div', {}, h('dt', { text: 'Tipo' }), h('dd', { text: F.rotulo(F.TIPOS, im.tipo) })),
    h('div', {}, h('dt', { text: 'Bairro' }), h('dd', { text: im.bairro }))
  );

  const specsLista = im => h('ul', { class: 'specs' },
    especificacoes(im).map(([icon, txt]) => h('li', {}, icone(icon), txt))
  );

  const precoDe = im => {
    if (im.status === 'vendido') return h('p', { class: 'preco preco--texto', text: 'Vendido' });
    if (im.preco == null) return h('p', { class: 'preco preco--texto', text: 'Consulte' });
    return h('p', { class: 'preco' }, h('span', { text: 'R$' }), ' ' + F.moeda(im.preco));
  };

  const botaoZap = (im, classe) => {
    const vendido = im.status === 'vendido';
    const msg = vendido
      ? `Olá, Fábio! Vi que o imóvel ${im.codigo} já foi vendido. Você tem algo parecido?`
      : `Olá, Fábio! Tenho interesse no imóvel ${im.codigo} (${F.rotulo(F.TIPOS, im.tipo)}, ${im.bairro}).`;
    return h('a', { class: classe, href: '#contato', 'data-wa': msg },
      icone('i-wa'), vendido ? 'Quero algo parecido' : 'Tenho interesse');
  };

  /* ---------- cartão ---------- */
  const RATIOS = ['45', '11', '45', '45', '11', '11'];

  const cartao = (im, i) => {
    const fotos = fotosDe(im);
    const titulo = tituloDe(im);
    const curva = i % 2 === 0 ? 'tl' : 'tr';

    const foto = h('div', { class: `imovel__foto imovel__foto--${curva} ratio-${RATIOS[i % RATIOS.length]}`, 'data-abrir': im.id },
      fotos.length
        ? h('img', { src: F.fotoUrl(fotos[0], true), width: 900, height: 900, loading: 'lazy', decoding: 'async', alt: `Foto de ${titulo}` })
        : h('span', { class: 'imovel__sem-foto', text: 'Fotos em breve' }),
      im.destaque && im.status !== 'vendido' ? h('span', { class: 'selo selo--destaque', text: 'Destaque' }) : null,
      im.status === 'vendido' ? h('span', { class: 'selo selo--destaque', text: 'Vendido' }) : null,
      fotos.length > 1 ? h('span', { class: 'selo selo--demo', text: `${fotos.length} fotos` }) : null
    );

    return h('article', {
      class: 'imovel' + (im.status === 'vendido' ? ' imovel--vendido' : ''),
      'data-id': im.id, 'data-codigo': im.codigo, 'data-cidade': im.cidade, 'data-tipo': im.tipo,
      'data-bairro': im.bairro, 'data-quartos': im.quartos || 0
    },
      foto,
      etiqueta(im),
      h('h3', {}, h('button', { type: 'button', class: 'imovel__abrir', 'data-abrir': im.id, text: titulo })),
      specsLista(im),
      h('div', { class: 'imovel__pe' }, precoDe(im), botaoZap(im, 'btn btn--ghost btn--sm'))
    );
  };

  /* ---------- filtros por tipo: só os que existem ---------- */
  const montaFiltros = lista => {
    const filtro = document.querySelector('.filtro');
    if (!filtro) return;
    const chip = (tipo, texto, ativo) =>
      h('button', { type: 'button', class: 'chip', 'data-tipo': tipo, 'aria-pressed': String(ativo), text: texto });
    const tipos = F.TIPOS.map(t => t.v).filter(v => lista.some(im => im.tipo === v));
    filtro.replaceChildren(chip('', 'Todos', true), ...tipos.map(v => chip(v, F.TIPOS_PLURAL[v], false)));
    filtro.hidden = tipos.length < 2;
  };

  /* ---------- galeria de fotos ---------- */
  let dlg = null;
  let atual = { im: null, i: 0 };
  const els = {};

  const monta = () => {
    els.fechar = h('button', { type: 'button', class: 'galeria__fechar', 'aria-label': 'Fechar' }, icone('i-close'));
    els.ant = h('button', { type: 'button', class: 'galeria__nav galeria__nav--ant', 'aria-label': 'Foto anterior' }, icone('i-arrow'));
    els.prox = h('button', { type: 'button', class: 'galeria__nav galeria__nav--prox', 'aria-label': 'Próxima foto' }, icone('i-arrow'));
    els.img = h('img', { class: 'galeria__img', alt: '', decoding: 'async' });
    els.cont = h('p', { class: 'galeria__cont', 'aria-live': 'polite' });
    els.palco = h('div', { class: 'galeria__palco' }, els.img, els.ant, els.prox, els.cont);
    els.minis = h('div', { class: 'galeria__minis' });
    els.texto = h('div', { class: 'galeria__texto' });
    dlg = h('dialog', { class: 'galeria', 'aria-labelledby': 'galeria-titulo' },
      h('div', { class: 'galeria__in' }, els.fechar,
        h('div', { class: 'galeria__fotos' }, els.palco, els.minis), els.texto));
    document.body.append(dlg);

    els.fechar.addEventListener('click', () => dlg.close());
    els.ant.addEventListener('click', () => vai(-1));
    els.prox.addEventListener('click', () => vai(1));
    els.minis.addEventListener('click', e => {
      const b = e.target.closest('[data-foto]');
      if (b) { atual.i = Number(b.dataset.foto); mostraFoto(); }
    });
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') vai(-1);
      if (e.key === 'ArrowRight') vai(1);
    });
    let x0 = null;
    els.palco.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    els.palco.addEventListener('touchend', e => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) vai(dx < 0 ? 1 : -1);
    });
  };

  const vai = passo => {
    const n = fotosDe(atual.im).length;
    if (n < 2) return;
    atual.i = (atual.i + passo + n) % n;
    mostraFoto();
  };

  const mostraFoto = () => {
    const im = atual.im;
    const fotos = fotosDe(im);
    const n = fotos.length;
    if (n) {
      els.img.hidden = false;
      els.img.src = F.fotoUrl(fotos[atual.i], false);
      els.img.alt = `Foto ${atual.i + 1} de ${n}: ${tituloDe(im)}`;
      els.cont.textContent = `${atual.i + 1} / ${n}`;
    } else {
      els.img.hidden = true;
      els.cont.textContent = 'Fotos em breve';
    }
    els.cont.hidden = n < 2 && n > 0;
    els.ant.hidden = els.prox.hidden = n < 2;
    els.minis.hidden = n < 2;
    els.minis.querySelectorAll('[data-foto]').forEach((b, i) => b.setAttribute('aria-current', String(i === atual.i)));
  };

  const abrir = id => {
    const im = porId.get(id);
    if (!im) return;
    if (!dlg) monta();
    atual = { im, i: 0 };
    const fotos = fotosDe(im);

    els.minis.replaceChildren(...fotos.map((p, i) =>
      h('button', { type: 'button', class: 'galeria__mini', 'data-foto': i, 'aria-label': `Ver foto ${i + 1}` },
        h('img', { src: F.fotoUrl(p, true), alt: '', width: 120, height: 90, decoding: 'async' }))));

    els.texto.replaceChildren(
      h('h3', { id: 'galeria-titulo', text: tituloDe(im) }),
      etiqueta(im),
      specsLista(im),
      im.descricao ? h('p', { class: 'galeria__desc', text: im.descricao }) : null,
      h('div', { class: 'imovel__pe' }, precoDe(im), botaoZap(im, 'btn btn--primary'))
    );
    if (F.preencheWa) F.preencheWa(els.texto);
    mostraFoto();
    dlg.showModal();
    dlg.scrollTop = 0;
  };

  grade.addEventListener('click', e => {
    const alvo = e.target.closest('[data-abrir]');
    if (alvo) abrir(alvo.dataset.abrir);
  });

  /* ---------- carregamento ---------- */
  const avisa = () => document.dispatchEvent(new CustomEvent('imoveis:atualizados'));
  const tiraNotaDeDemonstracao = () => document.querySelectorAll('.demo-nota').forEach(el => el.remove());

  const mostra = lista => {
    porId.clear();
    lista.forEach(im => porId.set(im.id, im));
    grade.replaceChildren(...lista.map(cartao));
    tiraNotaDeDemonstracao();
    montaFiltros(lista);
    avisa();
  };

  const falha = () => {
    grade.replaceChildren();
    grade.dataset.erro = '1';
    tiraNotaDeDemonstracao();
    grade.after(h('div', { class: 'vazio', id: 'erro-carga' },
      h('p', { class: 'vazio__t', text: 'Não conseguimos carregar os imóveis agora.' }),
      h('p', { text: 'Chame a gente no WhatsApp e mostramos o que temos disponível.' }),
      h('div', { class: 'vazio__acoes' },
        h('a', { class: 'btn btn--primary', href: '#contato', 'data-wa': 'Olá, Fábio! Quero ver os imóveis disponíveis.' }, icone('i-wa'), 'Falar com a gente'))
    ));
    avisa();
  };

  const busca = async () => {
    const url = `${F.base}/rest/v1/imoveis?select=${CAMPOS}&status=in.(ativo,vendido)&order=destaque.desc,criado_em.desc&limit=200`;
    const r = await fetch(url, { headers: { apikey: F.key, Accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  };

  const carrega = async () => {
    let lista = null;
    for (let tentativa = 0; tentativa < 2 && !lista; tentativa += 1) {
      try { lista = await busca(); }
      catch (e) { if (tentativa === 0) await new Promise(ok => setTimeout(ok, 1500)); }
    }
    if (!lista) { falha(); return; }
    if (lista.length) mostra(lista); // sem nenhum imóvel cadastrado, os exemplos do HTML continuam
  };

  // espera main.js (que também é "defer") para que os botões de WhatsApp sejam preenchidos
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', carrega);
  else carrega();
})();
