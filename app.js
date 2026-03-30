/* ============================================================
   きくよう みんなの応援券 対象店検索 - アプリロジック
   ============================================================ */

(function () {
  'use strict';

  // ---- 状態 ----
  const state = {
    keyword: '',
    category: 'all',
    area: 'all',
    sort: 'default',
    page: 1,
    pageSize: 12,
    searchPanelOpen: true,
  };

  // ---- DOM参照 ----
  const $ = id => document.getElementById(id);
  const els = {
    toggleBtn   : $('toggleSearchBtn'),
    searchPanel : $('searchPanel'),
    keywordInput: $('keywordInput'),
    clearKeyword: $('clearKeyword'),
    categorySelect: $('categorySelect'),
    areaSelect  : $('areaSelect'),
    resetBtn    : $('resetBtn'),
    categoryPills: $('categoryPills'),
    areaPills   : $('areaPills'),
    resultCount : $('resultCount'),
    cardGrid    : $('cardGrid'),
    noResult    : $('noResult'),
    pagination  : $('pagination'),
    sortSelect  : $('sortSelect'),
    backToTop   : $('backToTop'),
  };

  // ---- カテゴリカラーマップ ----
  const CAT_COLORS = {
    food        : 'var(--cat-food)',
    supermarket : 'var(--cat-supermarket)',
    convenience : 'var(--cat-convenience)',
    retail      : 'var(--cat-retail)',
    beauty      : 'var(--cat-beauty)',
    health      : 'var(--cat-health)',
    auto        : 'var(--cat-auto)',
    construction: 'var(--cat-construction)',
    service     : 'var(--cat-service)',
    sports      : 'var(--cat-sports)',
    taxi        : 'var(--cat-taxi)',
    hotel       : 'var(--cat-hotel)',
    other       : 'var(--cat-other)',
  };

  // ---- 初期化 ----
  function init() {
    buildCategorySelect();
    buildAreaSelect();
    buildCategoryPills();
    buildAreaPills();
    bindEvents();
    render();
  }

  // ---- セレクト生成 ----
  function buildCategorySelect() {
    els.categorySelect.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const count = cat.id === 'all' ? STORES.length : STORES.filter(s => s.category === cat.id).length;
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.id === 'all' ? `${cat.label}（${count}件）` : `${cat.label}（${count}件）`;
      els.categorySelect.appendChild(opt);
    });
  }

  function buildAreaSelect() {
    els.areaSelect.innerHTML = '';
    AREAS.forEach(area => {
      const count = area.id === 'all' ? STORES.length : STORES.filter(s => s.area === area.id).length;
      const opt = document.createElement('option');
      opt.value = area.id;
      opt.textContent = area.id === 'all' ? `${area.label}（${count}件）` : `${area.label}（${count}件）`;
      els.areaSelect.appendChild(opt);
    });
  }

  // ---- ピル生成 ----
  function buildCategoryPills() {
    els.categoryPills.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const count = cat.id === 'all' ? STORES.length : STORES.filter(s => s.category === cat.id).length;
      const btn = document.createElement('button');
      btn.className = 'pill' + (state.category === cat.id ? ' active' : '');
      btn.dataset.value = cat.id;
      btn.innerHTML = `${escapeHtml(cat.label)}<span class="pill-count">${count}</span>`;
      btn.addEventListener('click', () => {
        state.category = cat.id;
        state.page = 1;
        syncSelects();
        updateCategoryPills();
        render();
      });
      els.categoryPills.appendChild(btn);
    });
  }

  function buildAreaPills() {
    els.areaPills.innerHTML = '';
    AREAS.forEach(area => {
      const count = area.id === 'all' ? STORES.length : STORES.filter(s => s.area === area.id).length;
      const btn = document.createElement('button');
      btn.className = 'pill' + (state.area === area.id ? ' active' : '');
      btn.dataset.value = area.id;
      btn.innerHTML = `${escapeHtml(area.label)}<span class="pill-count">${count}</span>`;
      btn.addEventListener('click', () => {
        state.area = area.id;
        state.page = 1;
        syncSelects();
        updateAreaPills();
        render();
      });
      els.areaPills.appendChild(btn);
    });
  }

  function updateCategoryPills() {
    els.categoryPills.querySelectorAll('.pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === state.category);
    });
  }

  function updateAreaPills() {
    els.areaPills.querySelectorAll('.pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === state.area);
    });
  }

  function syncSelects() {
    els.categorySelect.value = state.category;
    els.areaSelect.value = state.area;
  }

  // ---- イベント登録 ----
  function bindEvents() {
    // 検索パネルトグル
    els.toggleBtn.addEventListener('click', () => {
      state.searchPanelOpen = !state.searchPanelOpen;
      els.searchPanel.classList.toggle('collapsed', !state.searchPanelOpen);
      els.toggleBtn.setAttribute('aria-expanded', state.searchPanelOpen ? 'true' : 'false');
      els.toggleBtn.textContent = state.searchPanelOpen ? '検索条件を隠す' : '検索条件を表示';
    });

    // キーワード入力（デバウンス）
    let debounceTimer;
    els.keywordInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.keyword = els.keywordInput.value.trim();
        state.page = 1;
        render();
      }, 220);
    });

    // キーワードクリア
    els.clearKeyword.addEventListener('click', () => {
      els.keywordInput.value = '';
      state.keyword = '';
      state.page = 1;
      render();
      els.keywordInput.focus();
    });

    // 分類セレクト
    els.categorySelect.addEventListener('change', () => {
      state.category = els.categorySelect.value;
      state.page = 1;
      updateCategoryPills();
      render();
    });

    // エリアセレクト
    els.areaSelect.addEventListener('change', () => {
      state.area = els.areaSelect.value;
      state.page = 1;
      updateAreaPills();
      render();
    });

    // ソート
    els.sortSelect.addEventListener('change', () => {
      state.sort = els.sortSelect.value;
      state.page = 1;
      render();
    });

    // リセット
    els.resetBtn.addEventListener('click', () => {
      state.keyword = '';
      state.category = 'all';
      state.area = 'all';
      state.sort = 'default';
      state.page = 1;
      els.keywordInput.value = '';
      els.categorySelect.value = 'all';
      els.areaSelect.value = 'all';
      els.sortSelect.value = 'default';
      updateCategoryPills();
      updateAreaPills();
      render();
    });

    // 先頭に戻る
    window.addEventListener('scroll', () => {
      els.backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    els.backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- フィルタ・ソート ----
  function getFilteredStores() {
    let result = STORES;

    // キーワード
    if (state.keyword) {
      const kw = state.keyword.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(kw) ||
        s.address.toLowerCase().includes(kw) ||
        s.services.toLowerCase().includes(kw) ||
        s.tel.includes(kw) ||
        s.regNo.toLowerCase().includes(kw)
      );
    }

    // 分類
    if (state.category !== 'all') {
      result = result.filter(s => s.category === state.category);
    }

    // エリア
    if (state.area !== 'all') {
      result = result.filter(s => s.area === state.area);
    }

    // ソート
    result = [...result].sort((a, b) => {
      switch (state.sort) {
        case 'name':
          return a.name.localeCompare(b.name, 'ja');
        case 'area':
          return a.area.localeCompare(b.area) || a.name.localeCompare(b.name, 'ja');
        case 'category':
          return a.category.localeCompare(b.category) || a.name.localeCompare(b.name, 'ja');
        default:
          // 登録番号順（文字列なので少し整形）
          return parseRegNo(a.regNo) - parseRegNo(b.regNo);
      }
    });

    return result;
  }

  function parseRegNo(str) {
    if (!str) return 9999;
    const n = parseInt(str.replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 9999 : n;
  }

  // ---- レンダリング ----
  function render() {
    const filtered = getFilteredStores();
    const total = filtered.length;
    const totalPages = Math.ceil(total / state.pageSize);

    // ページ範囲補正
    if (state.page > totalPages) state.page = Math.max(1, totalPages);

    // 結果件数
    els.resultCount.innerHTML = `<strong>${total}</strong> 件の店舗が見つかりました`;

    // カード表示
    const start = (state.page - 1) * state.pageSize;
    const pageStores = filtered.slice(start, start + state.pageSize);

    if (total === 0) {
      els.cardGrid.innerHTML = '';
      els.noResult.classList.remove('hidden');
    } else {
      els.noResult.classList.add('hidden');
      els.cardGrid.innerHTML = pageStores.map(s => renderCard(s)).join('');
    }

    // ページネーション
    renderPagination(total, totalPages);
  }

  // ---- カードHTML ----
  function renderCard(store) {
    const catLabel = (CATEGORIES.find(c => c.id === store.category) || {}).label || '';
    const areaLabel = (AREAS.find(a => a.id === store.area) || {}).label || '';
    const hl = t => highlight(escapeHtml(t), state.keyword);

    const colorVar = CAT_COLORS[store.category] || 'var(--color-primary)';

    return `
    <article class="store-card cat-${escapeHtml(store.category)}">
      <div class="card-color-bar" style="background:${colorVar}"></div>
      <div class="card-body">
        <div class="card-name">${hl(store.name)}</div>
        <div class="card-badges">
          <span class="badge badge-category" style="background:${colorVar}">${escapeHtml(catLabel)}</span>
          ${areaLabel ? `<span class="badge badge-area">${escapeHtml(areaLabel)}</span>` : ''}
        </div>
        <div class="card-info">
          <div class="card-info-row">
            <span class="card-info-label">住所</span>
            <span class="card-info-value">${hl(store.address)}</span>
          </div>
          <div class="card-info-row card-tel">
            <span class="card-info-label">TEL</span>
            <span class="card-info-value">
              <a href="tel:${escapeHtml(store.tel)}">${escapeHtml(store.tel)}</a>
            </span>
          </div>
          <div class="card-info-row">
            <span class="card-info-label">内容</span>
            <span class="card-info-value card-services">${hl(store.services)}</span>
          </div>
        </div>
      </div>
      ${store.regNo ? `<div class="card-footer"><span class="card-regno">No. ${escapeHtml(store.regNo)}</span></div>` : ''}
    </article>`;
  }

  // ---- ページネーション ----
  function renderPagination(total, totalPages) {
    if (totalPages <= 1) {
      els.pagination.innerHTML = '';
      return;
    }

    const cur = state.page;
    let html = '';

    // 前へ
    html += `<button class="page-btn" ${cur === 1 ? 'disabled' : ''} data-page="${cur - 1}">前へ</button>`;

    // ページ番号（最大7つ表示）
    const range = getPageRange(cur, totalPages);
    range.forEach(p => {
      if (p === '...') {
        html += `<span class="page-btn" style="pointer-events:none;border:none;background:none">…</span>`;
      } else {
        html += `<button class="page-btn${p === cur ? ' active' : ''}" data-page="${p}">${p}</button>`;
      }
    });

    // 次へ
    html += `<button class="page-btn" ${cur === totalPages ? 'disabled' : ''} data-page="${cur + 1}">次へ</button>`;

    els.pagination.innerHTML = html;

    // ページボタンクリック
    els.pagination.querySelectorAll('.page-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.page = parseInt(btn.dataset.page, 10);
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function getPageRange(cur, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (cur <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (cur >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
    return [1, '...', cur - 1, cur, cur + 1, '...', total];
  }

  // ---- ユーティリティ ----
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlight(text, keyword) {
    if (!keyword) return text;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  }

  // ---- 起動 ----
  document.addEventListener('DOMContentLoaded', init);
})();
