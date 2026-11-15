(function () {
  'use strict';
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-btn');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? 'Modo claro' : 'Modo escuro';
    themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
    try { localStorage.setItem('tema-dicionario', t); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('tema-dicionario'); } catch (e) {}
  setTheme(saved || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeBtn.addEventListener('click', function () {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  var sidebar = document.getElementById('sidebar'), overlay = document.getElementById('overlay'), menuBtn = document.getElementById('menu-btn');
  function toggleMenu(open) {
    sidebar.classList.toggle('aberta', open);
    overlay.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function () { toggleMenu(!sidebar.classList.contains('aberta')); });
  overlay.addEventListener('click', function () { toggleMenu(false); });
  sidebar.addEventListener('click', function (e) { if (e.target.tagName === 'A') toggleMenu(false); });

  var input = document.getElementById('busca'), contagem = document.getElementById('contagem'), vazio = document.getElementById('vazio');
  var secoes = Array.prototype.slice.call(document.querySelectorAll('section.tabela'));
  var links = {};
  Array.prototype.forEach.call(sidebar.querySelectorAll('a[data-tabela]'), function (a) { links[a.dataset.tabela] = a; });
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function filtrar() {
    var q = norm(input.value.trim()), tabs = 0, cols = 0;
    secoes.forEach(function (sec) {
      var nome = sec.dataset.tabela, nomeCasa = q === '' || norm(nome).indexOf(q) > -1, vis = 0;
      Array.prototype.forEach.call(sec.querySelectorAll('tbody tr'), function (tr) {
        var ok = nomeCasa || norm(tr.dataset.col).indexOf(q) > -1;
        tr.hidden = !ok;
        if (ok) vis++;
      });
      sec.hidden = vis === 0;
      if (links[nome]) links[nome].hidden = vis === 0;
      if (vis) { tabs++; cols += vis; }
    });
    vazio.hidden = tabs > 0;
    contagem.textContent = tabs + (tabs === 1 ? ' tabela, ' : ' tabelas, ') + cols + (cols === 1 ? ' coluna' : ' colunas');
  }
  input.addEventListener('input', filtrar);

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.dataset.tabela]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('ativo'); });
          links[en.target.dataset.tabela].classList.add('ativo');
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    secoes.forEach(function (s) { io.observe(s); });
  }

  var modal = document.getElementById('der-modal'), area = document.getElementById('der-area'), img = document.getElementById('der-img'), pz = null, abrir = document.getElementById('der-btn');
  function iniciar() {
    if (pz || typeof Panzoom === 'undefined') return;
    pz = Panzoom(img, { maxScale: 10, minScale: 0.3, step: 0.3, cursor: 'grab' });
    area.addEventListener('wheel', function (e) { e.preventDefault(); pz.zoomWithWheel(e); }, { passive: false });
  }
  function abrirModal() {
    modal.hidden = false; document.body.style.overflow = 'hidden';
    iniciar(); if (pz) pz.reset({ animate: false });
    document.getElementById('der-fechar').focus();
  }
  function fecharModal() { modal.hidden = true; document.body.style.overflow = ''; abrir.focus(); }
  abrir.addEventListener('click', abrirModal);
  document.getElementById('der-fechar').addEventListener('click', fecharModal);
  document.getElementById('zoom-in').addEventListener('click', function () { if (pz) pz.zoomIn(); });
  document.getElementById('zoom-out').addEventListener('click', function () { if (pz) pz.zoomOut(); });
  document.getElementById('zoom-reset').addEventListener('click', function () { if (pz) pz.reset(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) fecharModal(); });
})();
