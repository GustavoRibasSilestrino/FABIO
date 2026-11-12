/* Fábio · Corretor de Imóveis
   Para trocar os dados de contato, edite SITE abaixo e o link tel: no index.html. */
(() => {
  'use strict';

  const SITE = {
    whatsapp: '5519974216218',      // DDI + DDD + número, só dígitos
    telefone: '(19) 97421-6218',    // como aparece na tela
    creci: '195959'
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Dados do site e links de WhatsApp ---------- */
  $$('[data-site="telefone"]').forEach(el => { el.textContent = SITE.telefone; });
  $$('[data-site="creci"]').forEach(el => { el.textContent = SITE.creci; });
  $$('[data-site-tel]').forEach(a => { a.href = 'tel:+' + SITE.whatsapp; });

  const waUrl = msg => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
  const preencheWa = (raiz = document) => $$('[data-wa]', raiz).forEach(a => {
    a.href = waUrl(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });
  preencheWa();
  // js/imoveis.js usa estas duas funções para os cartões e a galeria que monta depois de carregar
  window.FABIO = Object.assign(window.FABIO || {}, { waUrl, preencheWa });

  /* ---------- Menu no celular ---------- */
  const menuBtn = $('.menu-btn');
  const nav = $('#nav');
  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Busca e filtro dos imóveis ---------- */
  const form = $('#busca');
  const selCidade = $('#f-cidade');
  const selTipo = $('#f-tipo');
  const selBairro = $('#f-bairro');
  const selQuartos = $('#f-quartos');
  const filtro = $('.filtro');
  const grade = $('#grade');
  const resultado = $('#resultado');
  const vazio = $('#vazio');
  // os cartões e os filtros podem ser trocados por js/imoveis.js (imóveis do painel), por isso são lidos de novo
  let cards = $$('.imovel');

  const state = { cidade: selCidade.value, tipo: '', bairro: '', quartos: 0 };

  // nomes comparados sem acento, sem maiúsculas e sem pontuação ("vila linopolis" = "Vila Linópolis")
  const normaliza = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  // sem cidade escolhida, o campo mostra só a orientação "Escolha a cidade" (em tom mais suave)
  const marcaCidade = () => selCidade.classList.toggle('is-vazio', !selCidade.value);
  const marcaBairro = () => selBairro.classList.toggle('is-vazio', !selBairro.value);

  /* Bairros: ao escolher a cidade, o campo lista todos os bairros dela (js/bairros.js) mais qualquer
     bairro de imóvel já cadastrado que ainda não esteja na lista. */
  const BAIRROS = (window.FABIO && window.FABIO.BAIRROS) || {};
  const nomeBairroDoCartao = c => {
    const dd = c.querySelector('.etiqueta div:last-child dd');
    return dd ? dd.textContent.trim() : c.dataset.bairro;
  };
  const bairrosDaCidade = cidade => {
    const lista = new Map();
    (BAIRROS[cidade] || []).forEach(n => lista.set(normaliza(n), n));
    cards.filter(c => c.dataset.cidade === cidade).forEach(c => {
      const n = nomeBairroDoCartao(c);
      if (n && !lista.has(normaliza(n))) lista.set(normaliza(n), n);
    });
    return [...lista.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  };
  const preencheBairros = manter => {
    const cidade = selCidade.value;
    const atual = manter ? selBairro.value : '';
    selBairro.replaceChildren();
    if (!cidade) {
      selBairro.append(new Option('Escolha a cidade primeiro', ''));
      selBairro.disabled = true;
    } else {
      selBairro.append(new Option('Todos os bairros', ''));
      bairrosDaCidade(cidade).forEach(n => selBairro.append(new Option(n, n)));
      selBairro.disabled = false;
      if (atual && [...selBairro.options].some(o => o.value === atual)) selBairro.value = atual;
    }
    marcaBairro();
  };
  selCidade.addEventListener('change', () => { marcaCidade(); preencheBairros(false); });
  selBairro.addEventListener('change', marcaBairro);

  const render = (animate) => {
    let shown = 0;
    cards.forEach(card => {
      const d = card.dataset;
      const ok =
        (!state.cidade || d.cidade === state.cidade) &&
        (!state.tipo || d.tipo === state.tipo) &&
        (!state.bairro || normaliza(d.bairro) === state.bairro) &&
        (!state.quartos || Number(d.quartos) >= state.quartos);
      card.hidden = !ok;
      card.classList.remove('is-entrando');
      if (ok) {
        card.dataset.col = String(shown % 3);
        if (animate && !reduceMotion) {
          card.style.setProperty('--n', String(shown));
          void card.offsetWidth; // reinicia a animação
          card.classList.add('is-entrando');
        }
        shown += 1;
      }
    });
    const erro = grade.dataset.erro === '1';
    resultado.textContent = shown === 1 ? '1 imóvel' : `${shown} imóveis`;
    resultado.hidden = erro;
    vazio.hidden = shown !== 0 || erro;
    $$('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.tipo === state.tipo)));
  };

  const readSelects = () => {
    state.cidade = selCidade.value;
    state.tipo = selTipo.value;
    state.bairro = normaliza(selBairro.value);
    state.quartos = Number(selQuartos.value);
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    readSelects();
    render(true);
    const alvo = $('#imoveis');
    alvo.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => resultado.focus({ preventScroll: true }), reduceMotion ? 0 : 500);
  });

  filtro.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    state.tipo = chip.dataset.tipo;
    selTipo.value = state.tipo;
    render(true);
  });

  const limpaFiltros = () => {
    selCidade.selectedIndex = 0;
    state.cidade = selCidade.value; state.tipo = ''; state.bairro = ''; state.quartos = 0;
    selTipo.value = ''; selQuartos.value = '0';
    marcaCidade();
    preencheBairros(false);
  };
  $('#limpar').addEventListener('click', () => { limpaFiltros(); render(true); });

  /* ---------- Busca pelo código do imóvel ---------- */
  const formCodigo = $('#busca-codigo');
  const campoCodigo = $('#f-codigo');
  const msgCodigo = $('#codigo-msg');
  const chaveCodigo = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  // os cartões de exemplo do HTML não têm data-codigo: vem da etiqueta (Código FB-101)
  const marcaCodigos = () => cards.forEach(c => {
    if (c.dataset.codigo) return;
    const dd = c.querySelector('.etiqueta dd');
    if (dd) c.dataset.codigo = dd.textContent.trim();
  });
  const erroCodigo = txt => {
    msgCodigo.textContent = txt;
    if (txt) campoCodigo.setAttribute('aria-invalid', 'true'); else campoCodigo.removeAttribute('aria-invalid');
  };
  campoCodigo.addEventListener('input', () => erroCodigo(''));

  formCodigo.addEventListener('submit', e => {
    e.preventDefault();
    const digitado = campoCodigo.value.trim();
    const chave = chaveCodigo(digitado);
    if (!chave) { erroCodigo('Digite o código do imóvel.'); campoCodigo.focus(); return; }
    // "101", "fb101" e "FB-101" valem para o mesmo imóvel
    const card = cards.find(c => {
      const k = chaveCodigo(c.dataset.codigo || '');
      return k === chave || (/^\d+$/.test(chave) && k === 'fb' + chave);
    });
    if (!card) {
      erroCodigo(`Não encontramos o código ${digitado.toUpperCase()}. Confira o número ou chame a gente no WhatsApp.`);
      return;
    }
    erroCodigo('');
    limpaFiltros();           // o imóvel pode estar escondido por um filtro da busca
    render(false);
    resultado.textContent = `Imóvel ${card.dataset.codigo} encontrado.`;
    $$('.imovel.is-achado').forEach(c => c.classList.remove('is-achado'));
    card.classList.add('is-achado');
    card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    const alvoFoco = card.querySelector('.imovel__abrir') || card.querySelector('.imovel__pe a');
    setTimeout(() => { if (alvoFoco) alvoFoco.focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
    setTimeout(() => card.classList.remove('is-achado'), 4500);
  });

  marcaCidade();
  marcaCodigos();
  preencheBairros(false);
  render(false);

  /* ---------- Formulário de contato → WhatsApp ---------- */
  const contato = $('#form-contato');
  const nome = $('#c-nome');
  const zap = $('#c-zap');
  const msg = $('#c-msg');

  zap.addEventListener('input', () => {
    const d = zap.value.replace(/\D/g, '').slice(0, 11);
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    zap.value = out;
  });

  const setErro = (input, text) => {
    const p = $('#' + input.getAttribute('aria-describedby'));
    p.textContent = text;
    if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  };

  [nome, zap].forEach(el => el.addEventListener('input', () => setErro(el, '')));

  contato.addEventListener('submit', e => {
    e.preventDefault();
    const n = nome.value.trim();
    const digitos = zap.value.replace(/\D/g, '');
    let primeiroErro = null;

    if (n.length < 2) { setErro(nome, 'Informe seu nome para o Fábio saber com quem fala.'); primeiroErro = primeiroErro || nome; }
    else setErro(nome, '');

    if (digitos.length < 10) { setErro(zap, 'Informe seu WhatsApp com DDD, por exemplo (19) 90000-0000.'); primeiroErro = primeiroErro || zap; }
    else setErro(zap, '');

    if (primeiroErro) { primeiroErro.focus(); return; }

    const interesse = (new FormData(contato)).get('interesse');
    const extra = msg.value.trim();
    const texto = `Olá, Fábio! Meu nome é ${n} e quero ${interesse}.` +
      (extra ? ` ${extra}` : '') + ` Meu WhatsApp: ${zap.value}.`;
    window.open(waUrl(texto), '_blank', 'noopener');
  });

  /* ---------- Botão flutuante: some quando o botão principal já está na tela ---------- */
  const flutuante = $('#wa-flutuante');
  const vistos = new Set();
  const atualizaFlutuante = () => flutuante.classList.toggle('is-oculto', vistos.size > 0);
  let obsFlutuante = null;
  if ('IntersectionObserver' in window) {
    obsFlutuante = new IntersectionObserver(entries => {
      entries.forEach(en => { en.isIntersecting ? vistos.add(en.target) : vistos.delete(en.target); });
      atualizaFlutuante();
    }, { threshold: 0.2 });
    // some enquanto a busca ou qualquer botão de WhatsApp da página já está na tela, para nunca cobri-los
    $$('main a[data-wa]').forEach(el => obsFlutuante.observe(el));
    obsFlutuante.observe($('#busca'));
    obsFlutuante.observe($('#contato'));
  } else {
    flutuante.classList.remove('is-oculto');
  }

  /* ---------- Quando js/imoveis.js troca os cartões pelos imóveis cadastrados no painel ---------- */
  document.addEventListener('imoveis:atualizados', () => {
    cards = $$('.imovel');
    marcaCodigos();
    preencheBairros(true);
    preencheWa($('#imoveis'));
    if (obsFlutuante) $$('#imoveis a[data-wa]').forEach(el => obsFlutuante.observe(el));
    vistos.forEach(el => { if (!el.isConnected) vistos.delete(el); });
    atualizaFlutuante();
    render(false);
  });

  /* ---------- Revelação ao rolar ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    document.documentElement.classList.add('reveal-ready');
    const alvos = $$('[data-reveal], .passos');
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    alvos.forEach(el => io.observe(el));
  }
})();
