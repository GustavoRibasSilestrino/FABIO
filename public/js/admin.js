/* Painel /admin: login, cadastro de imóveis e envio de fotos (Supabase).
   A segurança está no banco (supabase/schema.sql): sem login de administrador nada é gravado. */
(() => {
  'use strict';

  const F = window.FABIO;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const VISTAS = ['conexao', 'login', 'senha', 'lista', 'form'];
  const MAX_FOTOS = 30;

  /* ---------- ajudas ---------- */
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

  let logado = false;
  let recuperando = /type=recovery/.test(location.hash + location.search);
  let avisoTimer = null;

  const aviso = (texto, tipo) => {
    const el = $('#aviso');
    clearTimeout(avisoTimer);
    el.textContent = texto;
    el.className = 'adm-aviso' + (tipo === 'erro' ? ' adm-aviso--erro' : '');
    el.hidden = !texto;
    if (texto && tipo !== 'erro') avisoTimer = setTimeout(() => { el.hidden = true; }, 7000);
  };

  const mostra = (nome, { foco = true } = {}) => {
    VISTAS.forEach(v => { $('#v-' + v).hidden = v !== nome; });
    $('#acoes-topo').hidden = !logado && nome !== 'senha';
    if (foco) { const t = $('#v-' + nome + ' h1'); if (t) t.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0 });
  };

  const msgErro = e => {
    const texto = String((e && (e.message || e.error_description)) || e || '').toLowerCase();
    const codigo = e && e.code;
    if (texto.includes('invalid login')) return 'E-mail ou senha incorretos.';
    if (texto.includes('email not confirmed')) return 'Esse e-mail ainda não foi confirmado.';
    if (codigo === '42501' || texto.includes('row-level security') || texto.includes('not allowed') || texto.includes('unauthorized')) {
      return 'Este usuário não tem permissão para alterar imóveis.';
    }
    if (texto.includes('failed to fetch') || texto.includes('network') || texto.includes('load failed')) {
      return 'Sem conexão com a internet. Confira e tente de novo.';
    }
    if (codigo === '23505' || texto.includes('duplicate key')) return 'Já existe um imóvel com esse código. Escolha outro.';
    if (texto.includes('rate limit') || (e && e.status === 429)) return 'Muitas tentativas. Espere alguns minutos e tente de novo.';
    if (texto.includes('password should be') || texto.includes('weak')) return 'Senha fraca. Use pelo menos 8 caracteres, com letras e números.';
    if (texto.includes('same password') || texto.includes('different from the old')) return 'A nova senha precisa ser diferente da atual.';
    return 'Algo deu errado: ' + ((e && e.message) || e);
  };

  /* ---------- sem conexão configurada ---------- */
  if (!F || !F.ativo || !window.supabase) {
    mostra('conexao');
    return;
  }

  const sb = window.supabase.createClient(F.base, F.key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const armazem = sb.storage.from('imoveis');

  /* ---------- confirmação ---------- */
  const confirma = (texto, rotulo) => new Promise(resolve => {
    const d = $('#d-confirma');
    const sim = $('#d-confirma-sim');
    const nao = $('#d-confirma-nao');
    $('#d-confirma-txt').textContent = texto;
    sim.textContent = rotulo || 'Confirmar';
    let respondido = false;
    const fim = resposta => {
      if (respondido) return;
      respondido = true;
      d.removeEventListener('close', aoFechar);
      sim.onclick = nao.onclick = null;
      if (d.open) d.close();
      resolve(resposta);
    };
    const aoFechar = () => fim(false); // Esc ou clique fora
    d.addEventListener('close', aoFechar);
    sim.onclick = () => fim(true);
    nao.onclick = () => fim(false);
    d.showModal();
  });

  /* ---------- entrar / sair ---------- */
  const erroLogin = txt => { $('#l-erro').textContent = txt || ''; };

  $('#f-login').addEventListener('submit', async e => {
    e.preventDefault();
    erroLogin('');
    const email = $('#l-email').value.trim();
    const senha = $('#l-senha').value;
    if (!email || !senha) { erroLogin('Preencha o e-mail e a senha.'); return; }
    const botao = $('#btn-entrar');
    botao.disabled = true;
    const { error } = await sb.auth.signInWithPassword({ email, password: senha });
    botao.disabled = false;
    if (error) { erroLogin(msgErro(error)); return; }
    $('#l-senha').value = '';
    // o resto acontece em onAuthStateChange
  });

  $('#btn-esqueci').addEventListener('click', async () => {
    erroLogin('');
    const email = $('#l-email').value.trim();
    if (!email) { erroLogin('Digite o seu e-mail no campo acima e toque de novo em “Esqueci minha senha”.'); $('#l-email').focus(); return; }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/admin' });
    if (error) { erroLogin(msgErro(error)); return; }
    aviso('Se esse e-mail tiver cadastro, enviamos um link para criar uma nova senha. Olhe também a caixa de spam.');
  });

  $('#btn-sair').addEventListener('click', async () => {
    await sb.auth.signOut();
  });

  /* ---------- trocar senha ---------- */
  const abreSenha = (volta) => {
    $('#f-senha').reset();
    $('#s-erro').textContent = '';
    $('#t-senha').textContent = volta ? 'Trocar senha' : 'Criar nova senha';
    $('#btn-senha-volta').hidden = !volta;
    mostra('senha');
  };
  $('#btn-senha').addEventListener('click', () => abreSenha(true));
  $('#btn-senha-volta').addEventListener('click', () => mostra('lista'));

  $('#f-senha').addEventListener('submit', async e => {
    e.preventDefault();
    const nova = $('#s-nova').value;
    const repete = $('#s-repete').value;
    const erro = $('#s-erro');
    erro.textContent = '';
    if (nova.length < 8) { erro.textContent = 'Use pelo menos 8 caracteres.'; return; }
    if (nova !== repete) { erro.textContent = 'As duas senhas não são iguais.'; return; }
    const { error } = await sb.auth.updateUser({ password: nova });
    if (error) { erro.textContent = msgErro(error); return; }
    $('#f-senha').reset();
    aviso('Senha alterada.');
    if (recuperando) {
      recuperando = false;
      history.replaceState(null, '', location.pathname);
      const { data } = await sb.auth.getSession();
      if (data.session) { logado = false; entrou(data.session); } else mostra('login');
    } else {
      mostra('lista');
    }
  });

  /* ---------- sessão ---------- */
  let usuarioId = null;

  const entrou = async sessao => {
    if (logado && usuarioId === sessao.user.id) return;
    // confere se é administrador antes de mostrar qualquer coisa
    const { data, error } = await sb.rpc('is_admin');
    if (error || data !== true) {
      await sb.auth.signOut();
      mostra('login');
      erroLogin(error ? msgErro(error) : 'Este usuário não tem permissão de administrador. Fale com quem cuida do site.');
      return;
    }
    logado = true;
    usuarioId = sessao.user.id;
    await carregaLista();
    mostra('lista');
  };

  sb.auth.onAuthStateChange((evento, sessao) => {
    // não chamar o Supabase aqui dentro (trava): adia para o próximo ciclo
    setTimeout(() => {
      if (evento === 'PASSWORD_RECOVERY') { recuperando = true; abreSenha(false); return; }
      if (evento === 'SIGNED_OUT') { logado = false; usuarioId = null; mostra('login'); return; }
      if (recuperando) return;
      if ((evento === 'INITIAL_SESSION' || evento === 'SIGNED_IN') && sessao) entrou(sessao);
      else if (evento === 'INITIAL_SESSION' && !sessao) mostra('login', { foco: false });
    }, 0);
  });

  /* ---------- lista ---------- */
  let imoveis = [];

  const carregaLista = async () => {
    const { data, error } = await sb.from('imoveis').select('*').order('criado_em', { ascending: false });
    if (error) { aviso(msgErro(error), 'erro'); return; }
    imoveis = data || [];
    pintaLista();
  };

  const SITUACAO = { ativo: 'No site', vendido: 'Vendido', oculto: 'Oculto' };

  const pintaLista = () => {
    const lista = $('#lista');
    lista.replaceChildren(...imoveis.map(itemLista));
    $('#lista-vazio').hidden = imoveis.length > 0;
    const publicados = imoveis.filter(i => i.status === 'ativo').length;
    $('#lista-resumo').textContent = imoveis.length
      ? `${imoveis.length} cadastrado${imoveis.length > 1 ? 's' : ''}, ${publicados} no site agora.`
      : '';
  };

  const itemLista = im => {
    const fotos = im.fotos || [];
    const titulo = im.titulo || `${F.rotulo(F.TIPOS, im.tipo)} em ${im.bairro}`;
    const preco = im.preco == null ? 'Preço: consulte' : 'R$ ' + F.moeda(im.preco);
    const acao = (texto, fn, classe) => {
      const b = h('button', { type: 'button', class: 'btn btn--sm ' + (classe || 'btn--ghost'), text: texto });
      b.addEventListener('click', fn);
      return b;
    };
    return h('li', { class: 'adm-item' },
      h('div', { class: 'adm-item__foto' }, fotos.length ? h('img', { src: F.fotoUrl(fotos[0], true), alt: '', width: 112, height: 112, loading: 'lazy' }) : null),
      h('div', {},
        h('p', { class: 'adm-item__cod', text: `${im.codigo} · ${F.rotulo(F.TIPOS, im.tipo)} · ${im.bairro}` }),
        h('p', { class: 'adm-item__tit', text: titulo }),
        h('p', { class: 'adm-item__meta', text: `${preco} · ${F.rotulo(F.CIDADES, im.cidade)} · ${fotos.length} foto${fotos.length === 1 ? '' : 's'}` }),
        h('div', { class: 'adm-item__sel' },
          h('span', { class: `adm-badge adm-badge--${im.status}`, text: SITUACAO[im.status] || im.status }),
          im.destaque ? h('span', { class: 'adm-badge adm-badge--destaque', text: 'Destaque' }) : null)
      ),
      h('div', { class: 'adm-item__acoes' },
        acao('Editar', () => abreForm(im), 'btn--ink'),
        im.status === 'vendido'
          ? acao('Voltar para o site', () => mudaStatus(im, 'ativo'))
          : acao('Marcar como vendido', () => mudaStatus(im, 'vendido')),
        im.status === 'oculto'
          ? acao('Mostrar no site', () => mudaStatus(im, 'ativo'))
          : acao('Ocultar do site', () => mudaStatus(im, 'oculto')),
        acao('Excluir', () => exclui(im), 'btn--perigo'))
    );
  };

  const mudaStatus = async (im, status) => {
    const { error } = await sb.from('imoveis').update({ status }).eq('id', im.id);
    if (error) { aviso(msgErro(error), 'erro'); return; }
    await carregaLista();
    aviso(`${im.codigo}: ${status === 'ativo' ? 'no site.' : status === 'vendido' ? 'marcado como vendido.' : 'oculto do site.'}`);
  };

  const apagaArquivos = async caminhos => {
    const todos = caminhos.flatMap(p => [p, F.caminhoMedio(p)]);
    if (!todos.length) return;
    try { await armazem.remove(todos); } catch (e) { /* sobra de arquivo não atrapalha o site */ }
  };

  const exclui = async im => {
    const ok = await confirma(`Excluir o imóvel ${im.codigo} (${im.titulo || im.bairro})? As fotos também serão apagadas e não dá para desfazer.`, 'Excluir');
    if (!ok) return;
    const { error } = await sb.from('imoveis').delete().eq('id', im.id);
    if (error) { aviso(msgErro(error), 'erro'); return; }
    await apagaArquivos(im.fotos || []);
    await carregaLista();
    aviso(`${im.codigo} foi excluído.`);
  };

  $('#btn-novo').addEventListener('click', () => abreForm(null));

  /* ---------- formulário ---------- */
  const selTipo = $('#i-tipo');
  const selCidade = $('#i-cidade');
  F.TIPOS.forEach(t => selTipo.append(h('option', { value: t.v, text: t.t })));
  F.CIDADES.forEach(c => selCidade.append(h('option', { value: c.v, text: c.t })));

  let edicao = null; // { id, novo, codigo, fotos, originais, novas, enviando }

  /* bairro: lista da cidade escolhida (js/bairros.js) + bairros já usados em outros imóveis + "Outro bairro" */
  const OUTRO = '__outro__';
  const selBairro = $('#i-bairro');
  const normaliza = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const mostraOutro = () => { $('#campo-bairro-outro').hidden = selBairro.value !== OUTRO; };
  const montaBairros = (cidade, atual) => {
    const lista = new Map(((F.BAIRROS && F.BAIRROS[cidade]) || []).map(n => [normaliza(n), n]));
    imoveis.filter(i => i.cidade === cidade).forEach(i => {
      if (!lista.has(normaliza(i.bairro))) lista.set(normaliza(i.bairro), i.bairro);
    });
    if (atual && !lista.has(normaliza(atual))) lista.set(normaliza(atual), atual);
    const nomes = [...lista.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    selBairro.replaceChildren(
      h('option', { value: '', text: 'Escolha o bairro' }),
      h('option', { value: OUTRO, text: '+ Não encontrei: incluir outro bairro' }),
      ...nomes.map(n => h('option', { value: n, text: n })));
    selBairro.value = atual ? lista.get(normaliza(atual)) : '';
    mostraOutro();
  };
  selCidade.addEventListener('change', () => montaBairros(selCidade.value, ''));
  selBairro.addEventListener('change', () => {
    mostraOutro();
    if (selBairro.value === OUTRO) $('#i-bairro-outro').focus();
  });
  // atalho visível para quem não acha o bairro na lista
  $('#btn-bairro-novo').addEventListener('click', () => {
    selBairro.value = OUTRO;
    mostraOutro();
    $('#i-bairro-outro').focus();
  });

  /* metragens: casa e parecidos têm terreno e construção; apartamento e terreno têm uma só (js/comum.js) */
  const AJUDA_AREAS = {
    2: 'Terreno é o tamanho do lote; construída é a área do imóvel. Deixe em branco o que não souber.',
    apartamento: 'Informe a área do apartamento.',
    terreno: 'Informe o tamanho do terreno.'
  };
  const ajustaMedidas = () => {
    const tipo = selTipo.value;
    const usa = F.areasDoTipo(tipo);
    $('#campo-area-terreno').hidden = !usa.includes('terreno');
    $('#campo-area-construida').hidden = !usa.includes('construida');
    $('#rot-area-terreno').textContent = F.rotuloArea(tipo, 'terreno');
    $('#rot-area-construida').textContent = F.rotuloArea(tipo, 'construida');
    $('#ajuda-areas').textContent = usa.length === 2 ? AJUDA_AREAS[2] : (AJUDA_AREAS[tipo] || '');
  };
  selTipo.addEventListener('change', ajustaMedidas);

  const campos = {
    tipo: selTipo, cidade: selCidade, bairro: selBairro, bairroOutro: $('#i-bairro-outro'), codigo: $('#i-codigo'),
    titulo: $('#i-titulo'),
    quartos: $('#i-quartos'), banheiros: $('#i-banheiros'), vagas: $('#i-vagas'),
    areaTerreno: $('#i-area-terreno'), areaConstruida: $('#i-area-construida'),
    preco: $('#i-preco'), descricao: $('#i-descricao'), destaque: $('#i-destaque')
  };
  const radiosStatus = () => document.querySelectorAll('input[name="i-status"]');
  const erroForm = txt => { $('#i-erro').textContent = txt || ''; };

  const idNovo = () => (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

  const abreForm = im => {
    erroForm('');
    Object.values(campos).forEach(c => c.removeAttribute('aria-invalid'));
    $('#fotos-status').textContent = '';
    const novo = !im;
    edicao = {
      id: novo ? idNovo() : im.id,
      novo,
      codigo: novo ? '' : im.codigo,
      fotos: novo ? [] : [...(im.fotos || [])],
      originais: novo ? [] : [...(im.fotos || [])],
      novas: [],
      enviando: false
    };
    $('#t-form').textContent = novo ? 'Novo imóvel' : 'Editar imóvel';
    $('#form-cod').textContent = novo ? 'O código (FB-101, FB-102…) é criado sozinho ao salvar.' : `Código ${im.codigo}`;

    campos.tipo.value = novo ? 'casa' : im.tipo;
    campos.cidade.value = novo ? F.CIDADES[0].v : im.cidade;
    montaBairros(campos.cidade.value, novo ? '' : im.bairro);
    campos.bairroOutro.value = '';
    campos.codigo.value = novo ? '' : im.codigo;
    campos.titulo.value = novo ? '' : (im.titulo || '');
    campos.quartos.value = novo || im.quartos == null ? '' : im.quartos;
    campos.banheiros.value = novo || im.banheiros == null ? '' : im.banheiros;
    campos.vagas.value = novo || im.vagas == null ? '' : im.vagas;
    campos.areaTerreno.value = novo || im.area_terreno == null ? '' : String(im.area_terreno).replace('.', ',');
    campos.areaConstruida.value = novo || im.area_construida == null ? '' : String(im.area_construida).replace('.', ',');
    ajustaMedidas();
    campos.preco.value = novo || im.preco == null ? '' : F.moeda(im.preco);
    campos.descricao.value = novo ? '' : (im.descricao || '');
    campos.destaque.checked = !novo && !!im.destaque;
    radiosStatus().forEach(r => { r.checked = r.value === (novo ? 'ativo' : im.status); });

    pintaFotos();
    mostra('form');
  };

  /* fotos */
  const pintaFotos = () => {
    const ul = $('#fotos');
    const n = edicao.fotos.length;
    ul.replaceChildren(...edicao.fotos.map((p, i) => {
      const mini = (rotulo, glifo, fn, desligado) => {
        const b = h('button', { type: 'button', class: 'adm-mini', 'aria-label': rotulo, text: glifo, disabled: desligado });
        b.addEventListener('click', fn);
        return b;
      };
      return h('li', { class: 'adm-foto' },
        h('img', { src: F.fotoUrl(p, true), alt: `Foto ${i + 1} de ${n}`, loading: 'lazy' }),
        i === 0 ? h('span', { class: 'adm-foto__capa', text: 'Capa' }) : null,
        h('div', { class: 'adm-foto__ctl' },
          mini('Mover foto para antes', '‹', () => move(i, -1), i === 0),
          mini('Remover foto', '×', () => remove(i)),
          mini('Mover foto para depois', '›', () => move(i, 1), i === n - 1)));
    }));
    $('#rotulo-upload').hidden = n >= MAX_FOTOS;
  };

  const move = (i, passo) => {
    const j = i + passo;
    if (j < 0 || j >= edicao.fotos.length) return;
    [edicao.fotos[i], edicao.fotos[j]] = [edicao.fotos[j], edicao.fotos[i]];
    pintaFotos();
  };

  const remove = i => {
    const [p] = edicao.fotos.splice(i, 1);
    const idx = edicao.novas.indexOf(p);
    if (idx >= 0) { edicao.novas.splice(idx, 1); apagaArquivos([p]); } // enviada agora e ainda não salva
    pintaFotos();
  };

  const carregaImagem = async arquivo => {
    if ('createImageBitmap' in window) {
      try { return await createImageBitmap(arquivo, { imageOrientation: 'from-image' }); } catch (e) { /* tenta o jeito antigo */ }
    }
    return new Promise((ok, falha) => {
      const url = URL.createObjectURL(arquivo);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); ok(img); };
      img.onerror = () => { URL.revokeObjectURL(url); falha(new Error('Não consegui abrir esta imagem.')); };
      img.src = url;
    });
  };

  const redimensiona = (img, ladoMax, qualidade) => {
    const w0 = img.width || img.naturalWidth;
    const h0 = img.height || img.naturalHeight;
    const esc = Math.min(1, ladoMax / Math.max(w0, h0));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w0 * esc));
    c.height = Math.max(1, Math.round(h0 * esc));
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return new Promise((ok, falha) => c.toBlob(b => (b ? ok(b) : falha(new Error('Não consegui preparar a foto.'))), 'image/jpeg', qualidade));
  };

  const sobe = async (caminho, blob) => {
    const { error } = await armazem.upload(caminho, blob, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });
    if (error) throw error;
  };

  $('#f-arquivos').addEventListener('change', async e => {
    const entrada = e.target;
    const escolhidas = [...entrada.files].filter(a => a.type.startsWith('image/'));
    entrada.value = '';
    if (!escolhidas.length || !edicao) return;

    const espaco = MAX_FOTOS - edicao.fotos.length;
    const lote = escolhidas.slice(0, espaco);
    const status = $('#fotos-status');
    const rotulo = $('#rotulo-upload');
    edicao.enviando = true;
    rotulo.classList.add('is-ocupado');
    let falhas = 0;

    for (let i = 0; i < lote.length; i += 1) {
      status.textContent = `Enviando foto ${i + 1} de ${lote.length}…`;
      try {
        const img = await carregaImagem(lote[i]);
        const grande = await redimensiona(img, 1800, 0.82);
        const media = await redimensiona(img, 900, 0.8);
        if (img.close) img.close();
        const nome = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        const caminho = `${edicao.id}/${nome}.jpg`;
        await sobe(caminho, grande);
        await sobe(F.caminhoMedio(caminho), media);
        edicao.fotos.push(caminho);
        edicao.novas.push(caminho);
        pintaFotos();
      } catch (err) {
        falhas += 1;
        status.textContent = `Não foi possível enviar a foto ${i + 1}: ${msgErro(err)}`;
        await new Promise(ok => setTimeout(ok, 1800));
      }
    }

    edicao.enviando = false;
    rotulo.classList.remove('is-ocupado');
    const extra = escolhidas.length > lote.length ? ` O limite é de ${MAX_FOTOS} fotos por imóvel.` : '';
    status.textContent = falhas
      ? `${lote.length - falhas} de ${lote.length} fotos enviadas.${extra}`
      : `${lote.length} foto${lote.length > 1 ? 's' : ''} enviada${lote.length > 1 ? 's' : ''}.${extra}`;
  });

  /* máscaras */
  campos.preco.addEventListener('input', () => {
    const d = campos.preco.value.replace(/\D/g, '').slice(0, 12);
    campos.preco.value = d ? Number(d).toLocaleString('pt-BR') : '';
  });

  /* salvar */
  const numeroOuNulo = (campo, nome, { inteiro = false, max = 1e7 } = {}) => {
    // aceita "145,5", "145.5" e "1.250,75" (ponto como separador de milhar)
    const digitado = campo.value.trim();
    const bruto = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(digitado)
      ? digitado.replace(/\./g, '').replace(',', '.')
      : digitado.replace(',', '.');
    if (bruto === '') return { valor: null };
    const n = Number(bruto);
    if (!Number.isFinite(n) || n < 0 || n > max || (inteiro && !Number.isInteger(n))) {
      campo.setAttribute('aria-invalid', 'true');
      return { erro: `Confira o campo “${nome}”.`, campo };
    }
    return { valor: n };
  };

  const leForm = () => {
    Object.values(campos).forEach(c => c.removeAttribute('aria-invalid'));
    const outro = campos.bairro.value === OUTRO;
    const bairro = (outro ? campos.bairroOutro.value : campos.bairro.value).trim();
    if (!bairro) {
      const campo = outro ? campos.bairroOutro : campos.bairro;
      campo.setAttribute('aria-invalid', 'true');
      return { erro: outro ? 'Digite o nome do bairro.' : 'Escolha o bairro.', campo };
    }
    const codigo = campos.codigo.value.trim().toUpperCase();
    if (codigo && !/^[A-Z0-9][A-Z0-9-]{0,19}$/.test(codigo)) {
      campos.codigo.setAttribute('aria-invalid', 'true');
      return { erro: 'No código use só letras, números e hífen (sem espaços).', campo: campos.codigo };
    }
    const quartos = numeroOuNulo(campos.quartos, 'Quartos', { inteiro: true, max: 50 });
    const banheiros = numeroOuNulo(campos.banheiros, 'Banheiros', { inteiro: true, max: 50 });
    const vagas = numeroOuNulo(campos.vagas, 'Vagas', { inteiro: true, max: 50 });
    // só as metragens que o tipo usa são lidas; as outras ficam vazias (ex.: troca de casa para apartamento)
    const usa = F.areasDoTipo(campos.tipo.value);
    const areaTerreno = usa.includes('terreno')
      ? numeroOuNulo(campos.areaTerreno, F.rotuloArea(campos.tipo.value, 'terreno').replace(' (m²)', ''), { max: 99999999 }) : { valor: null };
    const areaConstruida = usa.includes('construida')
      ? numeroOuNulo(campos.areaConstruida, F.rotuloArea(campos.tipo.value, 'construida').replace(' (m²)', ''), { max: 99999999 }) : { valor: null };
    for (const r of [quartos, banheiros, vagas, areaTerreno, areaConstruida]) if (r.erro) return r;

    const digitos = campos.preco.value.replace(/\D/g, '');
    const status = [...radiosStatus()].find(r => r.checked).value;
    return {
      dados: {
        tipo: campos.tipo.value,
        cidade: campos.cidade.value,
        bairro,
        titulo: campos.titulo.value.trim() || null,
        quartos: quartos.valor,
        banheiros: banheiros.valor,
        vagas: vagas.valor,
        area_terreno: areaTerreno.valor,
        area_construida: areaConstruida.valor,
        preco: digitos ? Number(digitos) : null,
        descricao: campos.descricao.value.trim() || null,
        destaque: campos.destaque.checked,
        status,
        ...(codigo ? { codigo } : {}) // vazio: o banco cria sozinho (FB-101, FB-102…) ou mantém o atual
      }
    };
  };

  $('#f-imovel').addEventListener('submit', async e => {
    e.preventDefault();
    erroForm('');
    if (edicao.enviando) { erroForm('Espere terminar o envio das fotos.'); return; }
    const r = leForm();
    if (r.erro) { erroForm(r.erro); r.campo.focus(); return; }

    const botao = $('#btn-salvar');
    botao.disabled = true;
    const dados = { ...r.dados, fotos: edicao.fotos };
    let resposta;
    if (edicao.novo) resposta = await sb.from('imoveis').insert({ id: edicao.id, ...dados }).select().single();
    else resposta = await sb.from('imoveis').update(dados).eq('id', edicao.id).select().single();
    botao.disabled = false;

    if (resposta.error) { erroForm(msgErro(resposta.error)); return; }

    // fotos tiradas deste imóvel (que já estavam salvas) saem do armazenamento só agora
    const removidas = edicao.originais.filter(p => !edicao.fotos.includes(p));
    await apagaArquivos(removidas);
    edicao.novas = [];

    const salvo = resposta.data;
    await carregaLista();
    mostra('lista');
    aviso(salvo.status === 'ativo'
      ? `${salvo.codigo} salvo. Já está no site.`
      : salvo.status === 'vendido' ? `${salvo.codigo} salvo como vendido.` : `${salvo.codigo} salvo, mas está oculto: não aparece no site.`);
  });

  $('#btn-cancelar').addEventListener('click', async () => {
    if (edicao && edicao.enviando) { erroForm('Espere terminar o envio das fotos.'); return; }
    if (edicao && edicao.novas.length) await apagaArquivos(edicao.novas); // fotos enviadas que não foram salvas
    edicao = null;
    mostra('lista');
  });
})();
