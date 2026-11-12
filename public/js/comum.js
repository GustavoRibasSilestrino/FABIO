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
    CIDADES, TIPOS, TIPOS_PLURAL,
    rotulo, caminhoMedio, fotoUrl, numero, moeda, plural
  });
})();
