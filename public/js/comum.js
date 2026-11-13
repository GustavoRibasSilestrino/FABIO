/* Dados e funções usados pelo site (js/imoveis.js) e pelo painel (js/admin.js). */
(() => {
  'use strict';

  const cfg = window.FABIO_CONFIG || {};
  const base = String(cfg.supabaseUrl || '').replace(/\/+$/, '');
  const key = String(cfg.supabaseKey || '');

  const CIDADES = [
    { v: 'santa-barbara-d-oeste', t: 'Santa Bárbara d’Oeste' },
    { v: 'americana', t: 'Americana' },
    { v: 'nova-odessa', t: 'Nova Odessa' }
  ];

  const TIPOS = [
    { v: 'casa', t: 'Casa' },
    { v: 'casa-condominio', t: 'Casa em condomínio' },
    { v: 'sobrado', t: 'Sobrado' },
    { v: 'apartamento', t: 'Apartamento' },
    { v: 'terreno', t: 'Terreno' },
    { v: 'chacara', t: 'Chácara' },
    { v: 'sitio', t: 'Sítio' },
    { v: 'comercial', t: 'Imóvel comercial' }
  ];

  const TIPOS_PLURAL = {
    'casa': 'Casas', 'casa-condominio': 'Casas em condomínio', 'sobrado': 'Sobrados',
    'apartamento': 'Apartamentos', 'terreno': 'Terrenos', 'chacara': 'Chácaras',
    'sitio': 'Sítios', 'comercial': 'Imóveis comerciais'
  };

  // Metragens de cada tipo: casa, sobrado, chácara, sítio e comercial têm terreno e construção;
  // apartamento tem uma só (a do apartamento) e terreno tem uma só (a do terreno).
  const AREAS = {
    'casa': ['terreno', 'construida'], 'casa-condominio': ['terreno', 'construida'], 'sobrado': ['terreno', 'construida'],
    'apartamento': ['construida'], 'terreno': ['terreno'],
    'chacara': ['terreno', 'construida'], 'sitio': ['terreno', 'construida'], 'comercial': ['terreno', 'construida']
  };
  const areasDoTipo = tipo => AREAS[tipo] || ['terreno', 'construida'];
  const rotuloArea = (tipo, qual) => (qual === 'terreno'
    ? 'Área do terreno (m²)'
    : (tipo === 'apartamento' ? 'Área do apartamento (m²)' : 'Área construída (m²)'));

  // Só apartamento: andar (0 = térreo) e posição solar. O painel mostra a opção inteira; o anúncio, a forma curta.
  const SOL = [
    { v: 'nascente', t: 'Nascente (sol da manhã)', anuncio: 'Sol da manhã (nascente)' },
    { v: 'poente', t: 'Poente (sol da tarde)', anuncio: 'Sol da tarde (poente)' },
    { v: 'norte', t: 'Norte', anuncio: 'Posição solar norte' },
    { v: 'sul', t: 'Sul', anuncio: 'Posição solar sul' }
  ];
  const textoSol = v => { const s = SOL.find(i => i.v === v); return s ? s.anuncio : ''; };
  const textoAndar = n => (Number(n) === 0 ? 'Térreo' : `${Number(n)}º andar`);

  const rotulo = (lista, v) => {
    const item = lista.find(i => i.v === v);
    return item ? item.t : v;
  };

  // Cada foto é guardada em duas versões: "<id>/<nome>.jpg" (grande) e "<id>/<nome>-m.jpg" (média, para os cartões).
  const caminhoMedio = p => p.replace(/\.jpg$/i, '-m.jpg');
  const fotoUrl = (p, medio) =>
    `${base}/storage/v1/object/public/imoveis/${(medio ? caminhoMedio(p) : p).split('/').map(encodeURIComponent).join('/')}`;

  const numero = n => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  const moeda = n => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  const plural = (n, um, varios) => `${numero(n)} ${Number(n) === 1 ? um : varios}`;

  window.FABIO = Object.assign(window.FABIO || {}, {
    ativo: Boolean(base && key), base, key,
    CIDADES, TIPOS, TIPOS_PLURAL, AREAS, areasDoTipo, rotuloArea, SOL, textoSol, textoAndar,
    rotulo, caminhoMedio, fotoUrl, numero, moeda, plural
  });
})();
