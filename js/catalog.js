/* Catalogue page: search, language/category/price filters, sorting and URL state. */
(function () {
  'use strict';

  var AP = window.AP;
  var U = AP.util;
  var UI = AP.ui;
  var esc = U.esc;
  var books = AP.books;
  var doc = document;
  var PAGE_SIZE = 24;
  var cur = AP.config.currency;

  var PRICES = [
    { id: '', label: 'Any price', test: function () { return true; } },
    { id: 'under-100', label: 'Under ' + cur + '100', test: function (p) { return p < 100; } },
    { id: '100-300', label: cur + '100 – ' + cur + '300', test: function (p) { return p >= 100 && p <= 300; } },
    { id: 'over-300', label: 'Above ' + cur + '300', test: function (p) { return p > 300; } }
  ];
  var SORTS = [
    { id: 'recommended', label: 'Recommended' },
    { id: 'title', label: 'Title (A–Z)' },
    { id: 'price-asc', label: 'Price: low to high' },
    { id: 'price-desc', label: 'Price: high to low' }
  ];

  var languages = AP.languages.filter(function (l) { return books.some(function (b) { return b.language === l.id; }); });
  var categories = AP.categories.filter(function (c) { return books.some(function (b) { return b.categories.indexOf(c.id) !== -1; }); });
  var langIds = languages.map(function (l) { return l.id; });
  var catIds = categories.map(function (c) { return c.id; });

  var el = {
    search: doc.getElementById('catalog-search'),
    searchClear: doc.querySelector('.field__clear'),
    lang: doc.getElementById('filter-lang'),
    cat: doc.getElementById('filter-cat'),
    price: doc.getElementById('filter-price'),
    sort: doc.getElementById('sort'),
    count: doc.getElementById('results-count'),
    active: doc.getElementById('active-filters'),
    grid: doc.getElementById('book-grid'),
    more: doc.getElementById('load-more'),
    moreWrap: doc.querySelector('.load-more'),
    empty: doc.getElementById('empty-state'),
    note: doc.getElementById('catalog-note'),
    filters: doc.getElementById('filters'),
    toggle: doc.querySelector('.filters-toggle'),
    badge: doc.querySelector('[data-filter-count]')
  };

  var state = { q: '', lang: [], cat: [], price: '', sort: 'recommended', limit: PAGE_SIZE };
  var currentList = [];

  /* ---------- URL state ---------- */
  function readURL() {
    var p = new URLSearchParams(window.location.search);
    var list = function (key, allowed) {
      return (p.get(key) || '').split(',').filter(function (v) { return allowed.indexOf(v) !== -1; });
    };
    state.q = (p.get('q') || '').trim().slice(0, 100);
    state.lang = list('lang', langIds);
    state.cat = list('cat', catIds);
    var price = p.get('price') || '';
    state.price = PRICES.some(function (x) { return x.id === price; }) ? price : '';
    var sort = p.get('sort') || '';
    state.sort = SORTS.some(function (x) { return x.id === sort; }) ? sort : 'recommended';
  }

  function writeURL() {
    var p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.lang.length) p.set('lang', state.lang.join(','));
    if (state.cat.length) p.set('cat', state.cat.join(','));
    if (state.price) p.set('price', state.price);
    if (state.sort !== 'recommended') p.set('sort', state.sort);
    var qs = p.toString();
    history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
  }

  /* ---------- Filtering ---------- */
  function priceTest(id) {
    for (var i = 0; i < PRICES.length; i++) if (PRICES[i].id === id) return PRICES[i].test;
    return PRICES[0].test;
  }

  function matches(b, skip) {
    if (skip !== 'lang' && state.lang.length && state.lang.indexOf(b.language) === -1) return false;
    if (skip !== 'cat' && state.cat.length && !state.cat.some(function (c) { return b.categories.indexOf(c) !== -1; })) return false;
    if (skip !== 'price' && state.price && !priceTest(state.price)(b.price)) return false;
    return true;
  }

  function baseList() {
    return state.q ? U.searchBooks(state.q) : books.slice();
  }

  function sortList(list) {
    var byTitle = function (a, b) { return a.title.localeCompare(b.title); };
    switch (state.sort) {
      case 'title': return list.sort(byTitle);
      case 'price-asc': return list.sort(function (a, b) { return a.price - b.price || byTitle(a, b); });
      case 'price-desc': return list.sort(function (a, b) { return b.price - a.price || byTitle(a, b); });
      default:
        // Searches keep relevance order; otherwise featured books lead.
        if (state.q) return list;
        return list.map(function (b, i) { return { b: b, i: i }; })
          .sort(function (x, y) { return (y.b.featured ? 1 : 0) - (x.b.featured ? 1 : 0) || x.i - y.i; })
          .map(function (x) { return x.b; });
    }
  }

  function activeCount() {
    return (state.q ? 1 : 0) + state.lang.length + state.cat.length + (state.price ? 1 : 0);
  }

  /* ---------- Build controls once ---------- */
  function chipHTML(facet, id, label, labelLang) {
    return '<button class="chip" type="button" aria-pressed="false" data-facet="' + facet + '" data-value="' + esc(id) + '">' +
      U.icon('check', 'chip__check') +
      '<span' + (labelLang ? ' lang="' + labelLang + '"' : '') + '>' + label + '</span>' +
      '<span class="chip__count"></span></button>';
  }

  function buildControls() {
    el.lang.innerHTML = languages.map(function (l) {
      var native = l.native !== l.name && l.id !== 'other' ? ' <span lang="' + esc(l.lang) + '">' + esc(l.native) + '</span>' : '';
      return chipHTML('lang', l.id, esc(l.name) + native);
    }).join('');
    el.cat.innerHTML = categories.map(function (c) {
      var native = c.native ? ' <span lang="' + U.textLang(c.native, 'te') + '">' + esc(c.native) + '</span>' : '';
      return chipHTML('cat', c.id, esc(c.name) + native);
    }).join('');
    el.price.innerHTML = PRICES.map(function (p) {
      return '<label class="radio-row"><input type="radio" name="price" value="' + p.id + '"><span>' + esc(p.label) + '</span><span class="radio-row__count"></span></label>';
    }).join('');
    el.sort.innerHTML = SORTS.map(function (s) { return '<option value="' + s.id + '">' + esc(s.label) + '</option>'; }).join('');
  }

  /* ---------- Sync UI with state ---------- */
  function updateFacets(base) {
    var countFor = function (skip, test) {
      var n = 0;
      for (var i = 0; i < base.length; i++) if (test(base[i]) && matches(base[i], skip)) n++;
      return n;
    };
    el.lang.querySelectorAll('.chip').forEach(function (chip) {
      var id = chip.dataset.value;
      var on = state.lang.indexOf(id) !== -1;
      var n = countFor('lang', function (b) { return b.language === id; });
      chip.setAttribute('aria-pressed', String(on));
      chip.disabled = !n && !on;
      chip.querySelector('.chip__count').innerHTML = n + '<span class="sr-only"> books</span>';
    });
    el.cat.querySelectorAll('.chip').forEach(function (chip) {
      var id = chip.dataset.value;
      var on = state.cat.indexOf(id) !== -1;
      var n = countFor('cat', function (b) { return b.categories.indexOf(id) !== -1; });
      chip.setAttribute('aria-pressed', String(on));
      chip.disabled = !n && !on;
      chip.querySelector('.chip__count').innerHTML = n + '<span class="sr-only"> books</span>';
    });
    el.price.querySelectorAll('input').forEach(function (input) {
      input.checked = input.value === state.price;
      var test = priceTest(input.value);
      var n = countFor('price', function (b) { return test(b.price); });
      input.parentNode.querySelector('.radio-row__count').textContent = n;
    });
  }

  function updateActiveTags() {
    var tags = [];
    var tag = function (type, value, label) {
      tags.push('<button class="chip" type="button" data-remove="' + type + '" data-value="' + esc(value) + '" aria-label="' + esc('Remove filter: ' + label) + '">' +
        esc(label) + U.icon('close') + '</button>');
    };
    if (state.q) tag('q', state.q, 'Search: “' + state.q + '”');
    state.lang.forEach(function (id) { tag('lang', id, U.getLanguage(id).name); });
    state.cat.forEach(function (id) { tag('cat', id, U.getCategory(id).name); });
    if (state.price) tag('price', state.price, PRICES.filter(function (p) { return p.id === state.price; })[0].label);
    el.active.innerHTML = tags.join('');
  }

  function renderCards(from, to, animate) {
    var html = currentList.slice(from, to).map(function (b, i) {
      return UI.bookCardHTML(b, { index: i, query: state.q, level: 2 });
    }).join('');
    if (from === 0) {
      el.grid.innerHTML = html;
      if (animate) {
        el.grid.classList.remove('animate-in');
        void el.grid.offsetWidth;
        el.grid.classList.add('animate-in');
      }
    } else {
      el.grid.insertAdjacentHTML('beforeend', html);
    }
    el.moreWrap.hidden = currentList.length <= to;
    if (!el.moreWrap.hidden) {
      var remaining = currentList.length - to;
      el.more.textContent = 'Show more books (' + remaining + ' more)';
    }
  }

  function update(opts) {
    opts = opts || {};
    var base = baseList();
    currentList = sortList(base.filter(function (b) { return matches(b); }));
    var n = currentList.length;
    var filtered = activeCount() > 0;

    el.count.textContent = n
      ? (n === 1 ? '1 book' : n + ' books') + (filtered ? ' match your filters' : ' in the collection')
      : 'No books found';
    el.empty.hidden = n > 0;
    el.grid.hidden = n === 0;
    if (el.note) el.note.hidden = books.length >= 4 || n === 0;
    el.search.value = state.q;
    el.searchClear.hidden = !state.q;
    el.sort.value = state.sort;
    el.badge.hidden = !filtered;
    el.badge.textContent = activeCount();

    updateFacets(base);
    updateActiveTags();
    renderCards(0, Math.min(state.limit, n), opts.animate !== false);
    if (opts.url !== false) writeURL();
  }

  function resetFilters() {
    state.q = '';
    state.lang = [];
    state.cat = [];
    state.price = '';
    state.limit = PAGE_SIZE;
  }

  /* ---------- Events ---------- */
  function toggleIn(arr, value) {
    var i = arr.indexOf(value);
    if (i === -1) arr.push(value); else arr.splice(i, 1);
  }

  function onChipClick(e) {
    var chip = e.target.closest('.chip[data-facet]');
    if (!chip || chip.disabled) return;
    toggleIn(state[chip.dataset.facet], chip.dataset.value);
    state.limit = PAGE_SIZE;
    update();
  }
  el.lang.addEventListener('click', onChipClick);
  el.cat.addEventListener('click', onChipClick);

  el.price.addEventListener('change', function (e) {
    state.price = e.target.value;
    state.limit = PAGE_SIZE;
    update();
  });

  el.sort.addEventListener('change', function () {
    state.sort = el.sort.value;
    update();
  });

  var searchTimer;
  el.search.addEventListener('input', function () {
    el.searchClear.hidden = !el.search.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.q = el.search.value.trim().slice(0, 100);
      state.limit = PAGE_SIZE;
      update();
    }, 180);
  });
  el.search.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && el.search.value) {
      e.preventDefault();
      el.search.value = '';
      state.q = '';
      update();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(searchTimer);
      state.q = el.search.value.trim().slice(0, 100);
      update();
    }
  });
  el.searchClear.addEventListener('click', function () {
    state.q = '';
    update();
    el.search.focus();
  });

  el.active.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove]');
    if (!btn) return;
    var type = btn.dataset.remove;
    var index = Array.prototype.indexOf.call(el.active.children, btn);
    if (type === 'q') state.q = '';
    else if (type === 'price') state.price = '';
    else toggleIn(state[type], btn.dataset.value);
    state.limit = PAGE_SIZE;
    update();
    // Keep keyboard focus nearby after the tag disappears.
    var next = el.active.children[Math.min(index, el.active.children.length - 1)];
    (next || el.count).focus();
  });

  doc.querySelectorAll('[data-clear-filters]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var had = activeCount() > 0;
      resetFilters();
      update();
      if (had) UI.toast('Filters cleared');
      if (btn.closest('.empty-state')) el.count.focus();
    });
  });

  el.more.addEventListener('click', function () {
    var from = state.limit;
    state.limit += PAGE_SIZE;
    renderCards(from, Math.min(state.limit, currentList.length), false);
    var first = el.grid.children[from];
    if (first) {
      var link = first.querySelector('.book-card__link');
      if (link) link.focus();
    }
  });

  el.toggle.addEventListener('click', function () {
    var open = el.toggle.getAttribute('aria-expanded') !== 'true';
    el.toggle.setAttribute('aria-expanded', String(open));
    el.filters.classList.toggle('is-open', open);
    if (open) {
      var first = el.filters.querySelector('input, button:not([disabled])');
      if (first) first.focus();
    }
  });
  el.filters.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && el.filters.classList.contains('is-open') && e.target !== el.search) {
      el.toggle.setAttribute('aria-expanded', 'false');
      el.filters.classList.remove('is-open');
      el.toggle.focus();
    }
  });

  /* ---------- Init ---------- */
  buildControls();
  readURL();
  var headerSearch = doc.getElementById('site-search');
  if (headerSearch && state.q) headerSearch.value = state.q;
  update({ url: false, animate: true });
})();
