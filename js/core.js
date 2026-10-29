/* Akshara Prayanam — shared helpers and site-wide interactions. */
(function () {
  'use strict';

  var AP = window.AP = window.AP || {};
  var doc = document;
  var root = doc.documentElement;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var supportsVT = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('view-transition-name: none');

  /* ---------- Data helpers ---------- */
  var books = AP.books || [];
  var bookById = new Map(books.map(function (b) { return [b.id, b]; }));
  var langById = new Map((AP.languages || []).map(function (l) { return [l.id, l]; }));
  var catById = new Map((AP.categories || []).map(function (c) { return [c.id, c]; }));

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function safeColor(value, fallback) {
    return /^#[0-9a-f]{3,8}$/i.test(value || '') ? value : fallback;
  }

  function formatPrice(n) {
    return (AP.config.currency || '₹') + Number(n).toLocaleString('en-IN');
  }

  /* Display language for a book (books in "other" carry their own language name). */
  function bookLanguage(book) {
    var group = langById.get(book.language) || { name: book.language, native: book.language, lang: 'en' };
    return {
      id: group.id,
      name: book.languageName || group.name,
      native: book.languageNative || group.native,
      lang: book.languageCode || group.lang
    };
  }

  function bookUrl(book) { return 'book.html?id=' + encodeURIComponent(book.id); }

  /* Text in a non-Latin script gets the book's language tag so the right font is used. */
  function textLang(text, fallback) {
    return /[^\u0000-\u024F\u2000-\u206F]/.test(String(text || '')) ? fallback : 'en';
  }

  /* The native-script title leads; the transliteration is secondary. */
  function bookTitle(book) {
    var lang = bookLanguage(book);
    return {
      main: book.titleNative || book.title,
      mainLang: book.titleNative ? lang.lang : 'en',
      secondary: book.titleNative ? book.title : (book.subtitle || '')
    };
  }

  function paragraphs(value) {
    return Array.isArray(value) ? value : String(value || '').split(/\n{2,}/).filter(Boolean);
  }

  function whatsappUrl(book) {
    var lines;
    if (book) {
      lines = [
        'Hello Akshara Prayanam! I would like to get this book:',
        'Title: ' + (book.titleNative ? book.titleNative + ' (' + book.title + ')' : book.title),
        'Author: ' + book.author,
        'Book ID: ' + book.id,
        book.format ? 'Format: ' + book.format : '',
        'Price: ' + formatPrice(book.price)
      ].filter(Boolean);
    } else {
      lines = ['Hello Akshara Prayanam! I would like to know more about your books.'];
    }
    return 'https://wa.me/' + encodeURIComponent(AP.config.whatsappNumber) + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  /* ---------- Icons (inline SVG, stroke based) ---------- */
  var ICONS = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    arrowRight: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
    arrowUp: '<path d="M12 20V5"/><path d="m6 11 6-6 6 6"/>',
    chevronLeft: '<path d="m15 5-7 7 7 7"/>',
    chevronRight: '<path d="m9 5 7 7-7 7"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    chat: '<path d="M4.5 19.5 6 15.6A8 8 0 1 1 9 18.6z"/><path d="M9.2 9.3c.2 2.6 2.9 5.3 5.5 5.5l1.1-1.3-1.9-1-1 .7c-.9-.4-1.6-1.1-2-2l.7-1-1-1.9z"/>',
    book: '<path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1V18c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6.5V19"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    /* category motifs */
    fiction: '<rect x="5" y="3" width="12" height="16" rx="1.5"/><path d="M8 21h10.5a1.5 1.5 0 0 0 1.5-1.5V7"/><path d="M8 7.5h6M8 10.5h6M8 13.5h4"/>',
    romance: '<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>',
    emotional: '<path d="M12 3.5c3 4 5 6.6 5 9.2a5 5 0 0 1-10 0c0-2.6 2-5.2 5-9.2z"/><path d="M3.5 20.5c2.8-1.3 5.7-1.3 8.5 0s5.7 1.3 8.5 0"/>',
    'self-help': '<path d="M3 17h18"/><path d="M7 17a5 5 0 0 1 10 0"/><path d="M12 6.5v3M5.6 9.6l2 2M18.4 9.6l-2 2M6 20.5h12"/>',
    motivation: '<path d="m2.5 20 6.5-11 4 6.5 2.5-4L21.5 20z"/><path d="M15.5 11.5V3.5l4 1.6-4 1.6"/>',
    poetry: '<path d="M20 3.5C13.5 3.5 8.6 8 7.2 15.2L6.4 20"/><path d="M20 3.5c-.6 5.8-4.6 10.2-11.4 11.7"/><path d="M11.5 11.5 9.5 9.5"/><path d="M3 20.5c2-1 3.5-1 5 0s3 1 5 0"/>',
    education: '<path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1V18c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6.5V19"/>',
    technology: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx=".5"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
    business: '<path d="M4 20h16"/><path d="M6.5 20v-5M11 20v-8M15.5 20v-11"/><path d="m4.5 10.5 5-4 3 2 6.5-5"/><path d="M16 3.5h3v3"/>',
    philosophy: '<path d="M4.5 7h15M6 7l6-3.5L18 7"/><path d="M7.5 9.5v7.5M12 9.5v7.5M16.5 9.5v7.5"/><path d="M5.5 17.5h13M4 20.5h16"/>',
    spirituality: '<path d="M3.5 14h17c-1 3.6-4.6 5.6-8.5 5.6S4.5 17.6 3.5 14z"/><path d="M12 11.5c-1.7-1.5-1.7-3.8 0-7 1.7 3.2 1.7 5.5 0 7z"/>',
    biography: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7.5 18a4.5 4.5 0 0 1 9 0"/>',
    children: '<path d="M3 15.5h18l-3.2 4.5H6.2z"/><path d="M12 15.5V3.5l6.5 10H12"/><path d="M12 6.5 7 13.5h5"/>',
    mystery: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5.5 5.5"/><path d="M8 10.5A2.5 2.5 0 0 1 10.5 8"/>'
  };

  function icon(name, extraClass) {
    return '<svg class="icon' + (extraClass ? ' ' + extraClass : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------- Cover & card rendering ---------- */
  function coverHTML(book, opts) {
    opts = opts || {};
    var lang = bookLanguage(book);
    var label = book.coverAlt || 'Cover of ' + bookTitle(book).main + ' by ' + book.author;
    var a11y = opts.decorative || opts.mini ? 'aria-hidden="true"' : 'role="img" aria-label="' + esc(label) + '"';

    if (book.coverImage) {
      var small = book.coverImageSmall;
      var img = opts.mini
        ? '<img src="' + esc(small || book.coverImage) + '" alt="" width="68" height="102" loading="lazy" decoding="async">'
        : '<img src="' + esc(book.coverImage) + '"' +
          (small ? ' srcset="' + esc(small) + ' 480w, ' + esc(book.coverImage) + ' 1000w" sizes="' + esc(opts.sizes || '(max-width: 560px) 40vw, 220px') + '"' : '') +
          ' alt="" width="1000" height="1500"' + (opts.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
      return '<div class="cover cover--image' + (opts.mini ? ' cover--mini' : '') + '" ' + a11y + '>' + img +
        (opts.mini ? '' : '<span class="cover__shine"></span>') + '</div>';
    }

    var c = book.cover || {};
    var style = '--cv-bg:' + safeColor(c.bg, '#173F35') + ';--cv-ink:' + safeColor(c.ink, '#FAF7F0') + ';--cv-accent:' + safeColor(c.accent, '#C49A52');
    var motif = icon(book.categories[0]);

    if (opts.mini) {
      return '<div class="cover cover--mini" aria-hidden="true" style="' + style + '"><span class="cover__frame"></span><span class="cover__art">' + motif + '</span></div>';
    }

    var main = book.titleNative || book.title;
    var mainLang = book.titleNative ? lang.lang : 'en';
    var sub = book.titleNative ? book.title : (book.subtitle || '');
    var author = book.authorNative || book.author;
    var authorLang = book.authorNative ? lang.lang : 'en';
    var size = main.length > 30 ? ' cover--xlong' : main.length > 18 ? ' cover--long' : '';

    return '<div class="cover' + size + '" ' + a11y + ' style="' + style + '">' +
      '<span class="cover__frame"></span>' +
      '<span class="cover__kicker">' + esc(lang.name === 'Other Languages' ? 'World' : lang.name) + '</span>' +
      '<span class="cover__title" lang="' + mainLang + '">' + esc(main) + '</span>' +
      (sub ? '<span class="cover__sub">' + esc(sub) + '</span>' : '') +
      '<span class="cover__art">' + motif + '</span>' +
      '<span class="cover__author" lang="' + authorLang + '">' + esc(author) + '</span>' +
      '<span class="cover__shine"></span>' +
      '</div>';
  }

  function bookCardHTML(book, opts) {
    opts = opts || {};
    var lang = bookLanguage(book);
    var cat = catById.get(book.categories[0]);
    var t = bookTitle(book);
    var hl = opts.query ? function (s) { return highlight(s, opts.query); } : esc;
    var tag = 'h' + (opts.level || 3);
    return '<article class="book-card' + (opts.green ? ' book-card--green' : '') + (opts.reveal ? ' reveal' : '') + '" data-tilt style="--i:' + (opts.index || 0) + '">' +
      '<div class="book-card__media"><div class="book3d">' + coverHTML(book, { decorative: true }) + '</div></div>' +
      '<div class="book-card__body">' +
        '<p class="book-card__meta"><span>' + esc(lang.name) + '</span><span aria-hidden="true">·</span><span>' + esc(book.format ? book.format.replace(/^Digital /, '') : (cat ? cat.name : '')) + '</span></p>' +
        '<' + tag + ' class="book-card__title" lang="' + t.mainLang + '"><a class="book-card__link" href="' + bookUrl(book) + '" data-book-link>' + hl(t.main) + '</a></' + tag + '>' +
        (t.secondary ? '<p class="book-card__native">' + hl(t.secondary) + '</p>' : '') +
        '<p class="book-card__author" lang="' + textLang(book.author, lang.lang) + '">' + hl(book.author) + '</p>' +
        '<p class="book-card__desc" lang="' + textLang(book.short, lang.lang) + '">' + esc(book.short) + '</p>' +
        '<div class="book-card__foot">' +
          '<span class="book-card__price"><span class="sr-only">Price: </span>' + formatPrice(book.price) + '</span>' +
          '<span class="book-card__cta" aria-hidden="true">View details ' + icon('arrowRight') + '</span>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* ---------- Search ---------- */
  function norm(s) { return String(s || '').toLocaleLowerCase(); }

  var searchIndex = books.map(function (b) {
    var lang = bookLanguage(b);
    return {
      book: b,
      title: norm([b.title, b.titleNative, b.subtitle].join(' ')),
      author: norm([b.author, b.authorNative].join(' ')),
      lang: norm([lang.name, lang.native].join(' ')),
      cats: norm(b.categories.map(function (id) { var c = catById.get(id) || {}; return [c.name, c.native].join(' '); }).join(' ')),
      text: norm([b.short, b.format].join(' '))
    };
  });

  function scoreField(field, term, starts, contains) {
    var i = field.indexOf(term);
    if (i < 0) return 0;
    var wordStart = i === 0 || /[\s(\-'"]/.test(field.charAt(i - 1));
    return wordStart ? starts : contains;
  }

  /* Every term must match somewhere; title matches rank highest. */
  function searchBooks(query) {
    var terms = norm(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    var out = [];
    searchIndex.forEach(function (entry) {
      var total = 0;
      for (var t = 0; t < terms.length; t++) {
        var term = terms[t];
        var s = Math.max(
          scoreField(entry.title, term, 100, 45),
          scoreField(entry.author, term, 60, 30),
          scoreField(entry.lang, term, 35, 20),
          scoreField(entry.cats, term, 30, 15),
          scoreField(entry.text, term, 8, 4)
        );
        if (!s) return;
        total += s;
      }
      if (entry.title.indexOf(terms[0]) === 0) total += 50;
      out.push({ book: entry.book, score: total });
    });
    out.sort(function (a, b) { return b.score - a.score || a.book.title.localeCompare(b.book.title); });
    return out.map(function (r) { return r.book; });
  }

  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* Wrap query matches in <mark>; every fragment is escaped first. */
  function highlight(text, query) {
    var terms = String(query || '').trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
    if (!terms.length) return esc(text);
    var re;
    try { re = new RegExp('(' + terms.join('|') + ')', 'giu'); } catch (e) { return esc(text); }
    return String(text).split(re).map(function (part, i) {
      return i % 2 ? '<mark>' + esc(part) + '</mark>' : esc(part);
    }).join('');
  }

  function initSearch(form) {
    var input = form.querySelector('.search__input');
    var panel = form.querySelector('.search__panel');
    var list = form.querySelector('.search__list');
    var empty = form.querySelector('.search__empty');
    var hint = form.querySelector('.search__hint');
    var status = form.querySelector('[data-search-status]');
    var clearBtn = form.querySelector('.search__clear');
    var MAX = 6;
    var options = [];
    var active = -1;
    var statusTimer;

    function setOpen(open) {
      panel.hidden = !open;
      input.setAttribute('aria-expanded', String(open));
      if (!open) setActive(-1);
    }

    function setActive(i) {
      options.forEach(function (el, idx) {
        var on = idx === i;
        el.classList.toggle('is-active', on);
        el.setAttribute('aria-selected', String(on));
      });
      active = i;
      if (i >= 0 && options[i]) {
        input.setAttribute('aria-activedescendant', options[i].id);
        options[i].scrollIntoView({ block: 'nearest' });
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }

    function announce(msg) {
      clearTimeout(statusTimer);
      statusTimer = setTimeout(function () { status.textContent = msg; }, 450);
    }

    function render() {
      var q = input.value.trim();
      clearBtn.hidden = !input.value;
      if (!q) {
        list.innerHTML = '';
        options = [];
        empty.hidden = true;
        hint.hidden = false;
        status.textContent = '';
        setActive(-1);
        return;
      }
      hint.hidden = true;
      var results = searchBooks(q);
      var html = results.slice(0, MAX).map(function (b, i) {
        var lang = bookLanguage(b);
        var t = bookTitle(b);
        return '<li class="search-opt" role="option" id="' + input.id + '-opt-' + i + '" aria-selected="false" data-href="' + bookUrl(b) + '">' +
          '<span class="search-opt__thumb">' + coverHTML(b, { mini: true }) + '</span>' +
          '<span class="search-opt__text"><span class="search-opt__title" lang="' + t.mainLang + '">' + highlight(t.main, q) + '</span>' +
          '<span class="search-opt__meta">' + (t.secondary ? highlight(t.secondary, q) + ' · ' : '') + highlight(b.author, q) + ' · ' + esc(lang.name) + '</span></span>' +
          '<span class="search-opt__price">' + formatPrice(b.price) + '</span></li>';
      }).join('');
      if (results.length) {
        html += '<li class="search-opt search-opt--all" role="option" id="' + input.id + '-opt-all" aria-selected="false" data-href="books.html?q=' + encodeURIComponent(q) + '">' +
          '<span>See all ' + results.length + ' result' + (results.length === 1 ? '' : 's') + ' in the catalogue</span>' + icon('arrowRight') + '</li>';
      }
      list.innerHTML = html;
      options = Array.prototype.slice.call(list.querySelectorAll('[role="option"]'));
      empty.hidden = results.length > 0;
      if (!results.length) {
        empty.innerHTML = 'No books match “' + esc(q) + '”. Try a title, author, language or category — or <a href="books.html">browse all books</a>.';
      }
      setActive(-1);
      announce(results.length ? results.length + ' matching book' + (results.length === 1 ? '' : 's') + ' found. Use up and down arrows to choose.' : 'No matching books found.');
    }

    function go(el) {
      if (el && el.dataset.href) window.location.href = el.dataset.href;
    }

    input.addEventListener('input', function () { render(); setOpen(true); });
    input.addEventListener('focus', function () { render(); setOpen(true); });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (panel.hidden) setOpen(true);
        if (!options.length) return;
        e.preventDefault();
        // Cycle through options, with -1 meaning "back in the text field".
        var next = active + (e.key === 'ArrowDown' ? 1 : -1);
        if (next >= options.length) next = -1;
        if (next < -1) next = options.length - 1;
        setActive(next);
      } else if (e.key === 'Enter') {
        if (active >= 0 && options[active]) {
          e.preventDefault();
          go(options[active]);
        } else if (!input.value.trim()) {
          e.preventDefault();
        }
      } else if (e.key === 'Escape') {
        if (!panel.hidden) {
          e.preventDefault();
          setOpen(false);
        } else if (input.value) {
          input.value = '';
          render();
        }
      }
    });

    list.addEventListener('mousedown', function (e) { e.preventDefault(); });
    list.addEventListener('click', function (e) { go(e.target.closest('[role="option"]')); });
    list.addEventListener('mousemove', function (e) {
      var el = e.target.closest('[role="option"]');
      var i = options.indexOf(el);
      if (i >= 0 && i !== active) setActive(i);
    });

    hint.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-try]');
      if (!btn) return;
      input.value = btn.dataset.try;
      input.focus();
      render();
    });

    clearBtn.addEventListener('click', function () {
      input.value = '';
      input.focus();
      render();
    });

    form.addEventListener('focusout', function (e) {
      if (!form.contains(e.relatedTarget)) setOpen(false);
    });
    doc.addEventListener('pointerdown', function (e) {
      if (!panel.hidden && !form.contains(e.target)) setOpen(false);
    });

    form.addEventListener('submit', function (e) {
      if (!input.value.trim()) e.preventDefault();
    });
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    var header = doc.querySelector('.site-header');
    var toggle = doc.querySelector('.nav-toggle');
    if (!header || !toggle) return;
    var nav = doc.getElementById(toggle.getAttribute('aria-controls'));
    var desktop = window.matchMedia('(min-width: 1100px)');

    function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }
    function setOpen(open, returnFocus) {
      if (open) nav.style.setProperty('--nav-top', Math.round(header.getBoundingClientRect().bottom) + 'px');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
      if (open) {
        var first = nav.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      } else if (returnFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener('click', function () { setOpen(!isOpen()); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) setOpen(false, true);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && isOpen()) setOpen(false);
    });
    doc.addEventListener('pointerdown', function (e) {
      if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    nav.addEventListener('focusout', function (e) {
      if (isOpen() && e.relatedTarget && !nav.contains(e.relatedTarget) && e.relatedTarget !== toggle) setOpen(false);
    });
    desktop.addEventListener('change', function () { if (isOpen()) setOpen(false); });
  }

  /* ---------- Scroll state: header shadow + back-to-top (no scroll listeners) ---------- */
  function initScrollState() {
    var header = doc.querySelector('.site-header');
    var backBtn = doc.querySelector('.back-to-top');
    if (!('IntersectionObserver' in window)) return;

    var s1 = doc.createElement('div');
    s1.className = 'scroll-sentinel';
    s1.setAttribute('aria-hidden', 'true');
    var s2 = doc.createElement('div');
    s2.className = 'top-sentinel';
    s2.setAttribute('aria-hidden', 'true');
    doc.body.prepend(s1, s2);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === s1 && header) header.classList.toggle('is-scrolled', !entry.isIntersecting);
        if (entry.target === s2 && backBtn) backBtn.classList.toggle('is-visible', !entry.isIntersecting);
      });
    });
    io.observe(s1);
    io.observe(s2);

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        var brand = doc.querySelector('.brand');
        if (brand) brand.focus({ preventScroll: true });
      });
    }
  }

  /* ---------- Reveal on scroll ---------- */
  var revealObserver = null;
  function reveal(scope) {
    if (!root.classList.contains('reveal-on')) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    (scope || doc).querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Book tilt (delegated, rAF throttled, mouse only) ---------- */
  function initTilt() {
    var current = null;
    var target = null;
    var frame = 0;
    var lastX = 0;
    var lastY = 0;

    function reset(el) {
      if (!el) return;
      var b = el.querySelector('.book3d');
      if (b) { b.style.removeProperty('--rx'); b.style.removeProperty('--ry'); }
    }

    function apply() {
      frame = 0;
      if (!current || !target) return;
      var r = current.getBoundingClientRect();
      var px = (lastX - r.left) / r.width - 0.5;
      var py = (lastY - r.top) / r.height - 0.5;
      target.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg');
      target.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg');
    }

    doc.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || reduceMotion.matches || !finePointer.matches) return;
      var el = e.target.closest ? e.target.closest('[data-tilt]') : null;
      if (el !== current) {
        reset(current);
        current = el;
        target = el ? el.querySelector('.book3d') : null;
      }
      if (!el) return;
      lastX = e.clientX;
      lastY = e.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    }, { passive: true });

    doc.addEventListener('pointerout', function (e) {
      if (current && (!e.relatedTarget || !current.contains(e.relatedTarget))) {
        reset(current);
        current = target = null;
      }
    }, { passive: true });
  }

  /* ---------- Click response + shared-element page transition ---------- */
  function initBookLinks() {
    doc.addEventListener('click', function (e) {
      var link = e.target.closest('[data-book-link]');
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var card = link.closest('.book-card, .hero-book, .spotlight') || link;
      card.classList.add('is-pressed');
      if (supportsVT && !reduceMotion.matches) {
        doc.querySelectorAll('.cover[style*="view-transition-name"]').forEach(function (c) { c.style.viewTransitionName = ''; });
        var cover = card.querySelector('.cover');
        if (cover) cover.style.viewTransitionName = 'book-cover';
      }
    });

    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      doc.querySelectorAll('.is-pressed').forEach(function (el) { el.classList.remove('is-pressed'); });
      doc.querySelectorAll('.cover[style*="view-transition-name"]').forEach(function (c) { c.style.viewTransitionName = ''; });
    });
  }

  /* ---------- Pointer glow for decorative sections ---------- */
  function initGlow() {
    doc.querySelectorAll('[data-glow]').forEach(function (section) {
      var glow = section.querySelector('.hero__glow');
      if (!glow) return;
      var frame = 0;
      var x = 0;
      var y = 0;
      section.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || reduceMotion.matches || !finePointer.matches) return;
        var r = section.getBoundingClientRect();
        x = e.clientX - r.left;
        y = e.clientY - r.top;
        section.classList.add('is-glowing');
        if (!frame) {
          frame = requestAnimationFrame(function () {
            frame = 0;
            glow.style.setProperty('--gx', x + 'px');
            glow.style.setProperty('--gy', y + 'px');
          });
        }
      }, { passive: true });
      section.addEventListener('pointerleave', function () { section.classList.remove('is-glowing'); });
    });
  }

  /* Pause decorative loops while their section is off-screen. */
  function initOffscreenPause() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { entry.target.classList.toggle('is-offscreen', !entry.isIntersecting); });
    });
    doc.querySelectorAll('[data-pause-offscreen]').forEach(function (el) { io.observe(el); });
  }

  /* ---------- Toast ---------- */
  var toastEl = null;
  var toastTimer;
  function toast(message) {
    if (!toastEl) {
      toastEl = doc.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      toastEl.setAttribute('aria-atomic', 'true');
      doc.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3200);
  }

  /* ---------- Static enhancements ---------- */
  function initStatic() {
    doc.querySelectorAll('[data-whatsapp]').forEach(function (a) {
      a.href = whatsappUrl(null);
      a.target = '_blank';
      a.rel = 'noopener';
    });
    doc.querySelectorAll('[data-whatsapp-display]').forEach(function (el) { el.textContent = AP.config.whatsappDisplay; });
    doc.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  /* ---------- Public API ---------- */
  AP.util = {
    esc: esc,
    icon: icon,
    formatPrice: formatPrice,
    bookLanguage: bookLanguage,
    bookTitle: bookTitle,
    paragraphs: paragraphs,
    textLang: textLang,
    bookUrl: bookUrl,
    whatsappUrl: whatsappUrl,
    getBook: function (id) { return bookById.get(id); },
    getLanguage: function (id) { return langById.get(id); },
    getCategory: function (id) { return catById.get(id); },
    searchBooks: searchBooks,
    highlight: highlight,
    reduceMotion: reduceMotion
  };
  AP.ui = {
    coverHTML: coverHTML,
    bookCardHTML: bookCardHTML,
    reveal: reveal,
    toast: toast
  };

  initStatic();
  initNav();
  doc.querySelectorAll('form.search').forEach(initSearch);
  initScrollState();
  initTilt();
  initBookLinks();
  initGlow();
  initOffscreenPause();
  reveal();
  window.AP_READY = true;
})();
