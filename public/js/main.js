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
  $$('[data-wa]').forEach(a => {
    a.href = waUrl(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });

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
  const chips = $$('.chip');
  const cards = $$('.imovel');
  const resultado = $('#resultado');
  const vazio = $('#vazio');

  const state = { cidade: selCidade.value, tipo: '', bairro: '', quartos: 0 };

  // os bairros listados dependem da cidade escolhida
  const ajustaBairros = () => {
    const cidade = selCidade.value;
    Array.from(selBairro.options).forEach(op => {
      if (!op.value) return;
      const fora = Boolean(cidade) && op.dataset.cidade !== cidade;
      op.disabled = fora;
      op.hidden = fora;
    });
    const atual = selBairro.selectedOptions[0];
    if (atual && atual.disabled) selBairro.value = '';
  };
  // sem cidade escolhida, o campo mostra só a orientação "Escolha a cidade" (em tom mais suave)
  const marcaCidade = () => selCidade.classList.toggle('is-vazio', !selCidade.value);
  selCidade.addEventListener('change', () => { ajustaBairros(); marcaCidade(); });

  const render = (animate) => {
    let shown = 0;
    cards.forEach(card => {
      const d = card.dataset;
      const ok =
        (!state.cidade || d.cidade === state.cidade) &&
        (!state.tipo || d.tipo === state.tipo) &&
        (!state.bairro || d.bairro === state.bairro) &&
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
    resultado.textContent = shown === 1 ? '1 imóvel' : `${shown} imóveis`;
    vazio.hidden = shown !== 0;
    chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.tipo === state.tipo)));
  };

  const readSelects = () => {
    state.cidade = selCidade.value;
    state.tipo = selTipo.value;
    state.bairro = selBairro.value;
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

  chips.forEach(chip => chip.addEventListener('click', () => {
    state.tipo = chip.dataset.tipo;
    selTipo.value = state.tipo;
    render(true);
  }));

  $('#limpar').addEventListener('click', () => {
    selCidade.selectedIndex = 0;
    state.cidade = selCidade.value; state.tipo = ''; state.bairro = ''; state.quartos = 0;
    selTipo.value = ''; selBairro.value = ''; selQuartos.value = '0';
    ajustaBairros(); marcaCidade();
    render(true);
  });

  ajustaBairros(); marcaCidade();
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
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { en.isIntersecting ? vistos.add(en.target) : vistos.delete(en.target); });
      atualizaFlutuante();
    }, { threshold: 0.2 });
    // some enquanto a busca ou qualquer botão de WhatsApp da página já está na tela, para nunca cobri-los
    $$('main a[data-wa]').forEach(el => io.observe(el));
    io.observe($('#busca'));
    io.observe($('#contato'));
  } else {
    flutuante.classList.remove('is-oculto');
  }

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
