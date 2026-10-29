/* Home page: hero cover(s), featured book, quote, categories and language selector.
   Sections adapt to the catalogue size: shelves and selectors appear once there is something to choose between. */
(function () {
  'use strict';

  var AP = window.AP;
  var U = AP.util;
  var UI = AP.ui;
  var esc = U.esc;
  var books = AP.books;
  var doc = document;

  function byFeatured(a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }
  function restartAnimation(el) {
    el.classList.remove('animate-in');
    void el.offsetWidth;
    el.classList.add('animate-in');
  }
  function hideSection(id) {
    var el = doc.getElementById(id);
    if (el) el.hidden = true;
  }

  if (!books.length) return;
  var featured = books.slice().sort(byFeatured);
  var lead = featured[0];
  var leadLang = U.bookLanguage(lead);
  var leadTitle = U.bookTitle(lead);

  /* Keep hero facts about the collection rather than its lead book. */
  var stats = doc.getElementById('hero-stats');
  if (stats) {
    var languageCount = new Set(books.map(function (b) { return b.languageName || b.language; })).size;
    var items = [[books.length, 'Books'], [languageCount, 'Languages']];
    stats.innerHTML = items.map(function (it) {
      return '<li><strong lang="' + U.textLang(it[0], leadLang.lang) + '">' + esc(it[0]) + '</strong><span>' + esc(it[1]) + '</span></li>';
    }).join('');
    stats.hidden = false;
  }

  /* Preview several covers here; every book is listed in the collection below. */
  var heroBooks = doc.getElementById('hero-books');
  if (heroBooks) {
    var picks = featured.slice(0, 5);
    heroBooks.classList.toggle('hero__books--solo', picks.length === 1);
    heroBooks.classList.toggle('hero__books--duo', picks.length === 2);
    heroBooks.innerHTML = picks.map(function (b, i) {
      return '<a class="hero-book" href="' + U.bookUrl(b) + '" data-tilt data-book-link style="--n:' + i + '" aria-label="' + esc(U.bookTitle(b).main + ' — ' + b.author) + '">' +
        '<div class="book3d">' + UI.coverHTML(b, { decorative: true, eager: true, sizes: picks.length === 1 ? '(max-width: 900px) 60vw, 300px' : '160px' }) + '</div></a>';
    }).join('');
  }

  var homeGrid = doc.getElementById('home-book-grid');
  if (homeGrid) {
    homeGrid.innerHTML = books.slice().sort(byFeatured).map(function (book, i) {
      return UI.bookCardHTML(book, { index: i, level: 3, green: true, reveal: true });
    }).join('');
  }

  /* Featured: spotlight (+ rail when there are more featured books) */
  var spot = doc.getElementById('featured-spotlight');
  var single = featured.length < 2;
  if (spot) {
    var authorLang = U.textLang(lead.author, leadLang.lang);
    var paras = U.paragraphs(lead.description);
    var descLang = U.textLang(paras[0], leadLang.lang);
    doc.querySelector('.featured__layout').classList.toggle('featured__layout--single', single);

    spot.innerHTML =
      '<a class="spotlight__cover" href="' + U.bookUrl(lead) + '" data-book-link data-tilt tabindex="-1" aria-hidden="true"><div class="book3d">' +
        UI.coverHTML(lead, { decorative: true, sizes: '(max-width: 900px) 50vw, 320px' }) + '</div></a>' +
      '<div class="spotlight__body">' +
        '<p class="spotlight__label">' + (single ? 'Featured book' : 'Featured pick') + ' · ' + esc(leadLang.name) + (lead.format ? ' · ' + esc(lead.format) : '') + '</p>' +
        '<h3 class="spotlight__title" id="spotlight-title" lang="' + leadTitle.mainLang + '">' + esc(leadTitle.main) + '</h3>' +
        (leadTitle.secondary ? '<p class="spotlight__native">' + esc(leadTitle.secondary) + '</p>' : '') +
        '<p class="spotlight__author">' + (authorLang === 'te' ? '<span lang="te">రచన</span> · ' : 'by ') + '<span lang="' + authorLang + '">' + esc(lead.author) + '</span></p>' +
        (lead.dedication ? '<p class="spotlight__dedication" lang="' + U.textLang(lead.dedication, leadLang.lang) + '">' + esc(lead.dedication) + '</p>' : '') +
        '<div class="spotlight__desc" lang="' + descLang + '">' +
          paras.slice(0, single ? 3 : 1).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
        '</div>' +
        '<div class="spotlight__foot">' +
          '<span class="spotlight__price"><span class="sr-only">Price: </span>' + U.formatPrice(lead.price) + '</span>' +
          '<div class="spotlight__actions">' +
            '<a class="btn btn--gold btn--sm" href="' + U.bookUrl(lead) + '" data-book-link aria-label="' + esc('Read more about ' + leadTitle.main) + '">Read more ' + U.icon('arrowRight', 'icon--arrow') + '</a>' +
            (single ? '<a class="btn btn--light btn--sm" href="' + esc(U.whatsappUrl(lead)) + '" target="_blank" rel="noopener">' + U.icon('chat') + 'Get This Book <span class="sr-only">(opens WhatsApp in a new tab)</span></a>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
  }

  var rail = doc.getElementById('featured-rail');
  var railWrap = doc.querySelector('.rail-wrap');
  if (rail && single) {
    railWrap.hidden = true;
  } else if (rail) {
    rail.innerHTML = featured.slice(1).map(function (b, i) {
      return UI.bookCardHTML(b, { index: i });
    }).join('');

    var prev = doc.querySelector('[data-rail="prev"]');
    var next = doc.querySelector('[data-rail="next"]');
    var frame = 0;
    var update = function () {
      frame = 0;
      var max = rail.scrollWidth - rail.clientWidth - 2;
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft >= max;
    };
    var scrollRail = function (dir) {
      rail.scrollBy({ left: dir * rail.clientWidth * 0.85, behavior: U.reduceMotion.matches ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', function () { scrollRail(-1); });
    next.addEventListener('click', function () { scrollRail(1); });
    rail.addEventListener('scroll', function () { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(rail);
    update();
  }

  /* Featured quote */
  var quoteBook = books.filter(function (b) { return b.quote && b.quote.length; }).sort(byFeatured)[0];
  var quoteEl = doc.getElementById('featured-quote');
  if (quoteEl && quoteBook) {
    var qLang = U.bookLanguage(quoteBook);
    var qTitle = U.bookTitle(quoteBook);
    quoteEl.querySelector('blockquote').innerHTML = quoteBook.quote.map(function (line, i) {
      return '<span class="book-quote__line reveal" style="--i:' + (i + 1) + '">' + esc(line) + '</span>';
    }).join('');
    quoteEl.querySelector('blockquote').setAttribute('lang', U.textLang(quoteBook.quote[0], qLang.lang));
    quoteEl.querySelector('figcaption').innerHTML =
      '<a href="' + U.bookUrl(quoteBook) + '" data-book-link><span lang="' + qTitle.mainLang + '">' + esc(qTitle.main) + '</span></a>' +
      ' · <span lang="' + U.textLang(quoteBook.author, qLang.lang) + '">' + esc(quoteBook.author) + '</span>';
  } else {
    hideSection('quote');
  }

  /* Category cards — shown once there are at least two categories to choose from */
  var catGrid = doc.getElementById('category-grid');
  var usedCats = AP.categories.filter(function (c) {
    return books.some(function (b) { return b.categories.indexOf(c.id) !== -1; });
  });
  if (catGrid && usedCats.length >= 2) {
    catGrid.innerHTML = usedCats.map(function (c, i) {
      var n = books.filter(function (b) { return b.categories.indexOf(c.id) !== -1; }).length;
      return '<li class="reveal" style="--i:' + (i % 4) + '">' +
        '<a class="cat-card" data-cat="' + esc(c.id) + '" href="books.html?cat=' + encodeURIComponent(c.id) + '">' +
          '<span class="cat-card__art">' + U.icon(c.id) + '</span>' +
          '<span class="cat-card__text">' +
            '<span class="cat-card__name">' + esc(c.name) + '</span>' +
            (c.native ? '<span class="cat-card__native" lang="' + U.textLang(c.native, 'te') + '">' + esc(c.native) + '</span>' : '') +
            '<span class="cat-card__blurb">' + esc(c.blurb) + '</span>' +
            '<span class="cat-card__count">' + plural(n, 'book') + '</span>' +
          '</span>' +
          U.icon('arrowRight', 'cat-card__arrow') +
        '</a></li>';
    }).join('');
  } else {
    hideSection('categories');
  }

  /* Language selector — shown once there are at least two languages */
  var picker = doc.getElementById('lang-picker');
  var langs = AP.languages.filter(function (l) {
    return books.some(function (b) { return b.language === l.id; });
  });
  if (picker && langs.length >= 2) {
    var grid = doc.getElementById('lang-grid');
    var count = doc.getElementById('lang-results-count');
    var clearBtn = doc.getElementById('lang-clear');
    var allLink = doc.getElementById('lang-all');

    picker.innerHTML =
      '<button class="lang-chip" type="button" aria-pressed="true" data-lang=""><span class="lang-chip__native">All</span><span class="lang-chip__name">' + plural(books.length, 'book') + '</span></button>' +
      langs.map(function (l) {
        var n = books.filter(function (b) { return b.language === l.id; }).length;
        return '<button class="lang-chip" type="button" aria-pressed="false" data-lang="' + esc(l.id) + '">' +
          '<span class="lang-chip__native" lang="' + esc(l.lang) + '">' + esc(l.native) + '</span>' +
          '<span class="lang-chip__name">' + esc(l.name) + ' · ' + n + '</span></button>';
      }).join('');

    var select = function (id, announce) {
      var lang = id ? U.getLanguage(id) : null;
      picker.querySelectorAll('.lang-chip').forEach(function (chip) {
        chip.setAttribute('aria-pressed', String(chip.dataset.lang === id));
      });
      var list = books.filter(function (b) { return !id || b.language === id; }).sort(byFeatured);
      var label = lang ? (lang.id === 'other' ? 'other languages' : lang.name) : '';
      count.textContent = lang ? plural(list.length, 'book') + ' in ' + label : 'All ' + plural(list.length, 'book');
      clearBtn.hidden = !id;
      allLink.href = id ? 'books.html?lang=' + encodeURIComponent(id) : 'books.html';
      allLink.firstChild.textContent = !lang ? 'Browse all books ' : lang.id === 'other' ? 'Browse all books in other languages ' : 'Browse all ' + lang.name + ' books ';
      grid.innerHTML = list.slice(0, 4).map(function (b, i) { return UI.bookCardHTML(b, { index: i }); }).join('');
      if (announce !== false) restartAnimation(grid);
    };

    picker.addEventListener('click', function (e) {
      var chip = e.target.closest('.lang-chip');
      if (chip) select(chip.dataset.lang);
    });
    clearBtn.addEventListener('click', function () {
      select('');
      var all = picker.querySelector('[data-lang=""]');
      if (all) all.focus();
    });
    select('', false);
  } else {
    hideSection('languages');
  }

  UI.reveal();
})();
