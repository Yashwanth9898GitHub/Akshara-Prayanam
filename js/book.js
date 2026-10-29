/* Book details page: editorial layout, WhatsApp purchase, sample dialog, related books. */
(function () {
  'use strict';

  var AP = window.AP;
  var U = AP.util;
  var UI = AP.ui;
  var esc = U.esc;
  var doc = document;
  var mount = doc.getElementById('book-detail');

  var id = new URLSearchParams(window.location.search).get('id');
  var book = id ? U.getBook(id) : null;

  if (!book) {
    doc.title = 'Book not found — Akshara Prayanam';
    mount.innerHTML =
      '<div class="empty-state">' +
        U.icon('book', 'empty-state__art') +
        '<h1>We couldn’t find that book</h1>' +
        '<p>The link may be outdated, or the book may no longer be in our collection.</p>' +
        '<a class="btn btn--primary" href="books.html">Browse all books ' + U.icon('arrowRight', 'icon--arrow') + '</a>' +
      '</div>';
    return;
  }

  var lang = U.bookLanguage(book);
  var t = U.bookTitle(book);
  var cats = book.categories.map(U.getCategory).filter(Boolean);
  var wa = U.whatsappUrl(book);
  var tint = /^#[0-9a-f]{3,8}$/i.test((book.cover || {}).bg || '') ? book.cover.bg : '#8FAF9A';
  var authorLang = U.textLang(book.author, lang.lang);
  var descLang = U.textLang(U.paragraphs(book.description)[0], lang.lang);

  doc.title = t.main + ' — ' + book.author + ' | Akshara Prayanam';
  var meta = doc.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', book.short);

  var accent =
    '<svg class="detail__accent" viewBox="0 0 400 480" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" style="--tint:' + tint + '">' +
      '<defs><radialGradient id="da-glow"><stop offset="0" stop-color="#E2C285" stop-opacity=".5"/><stop offset="1" stop-color="#E2C285" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="200" cy="232" r="196" fill="url(#da-glow)"/>' +
      '<circle cx="200" cy="232" r="150" style="fill:var(--tint)" opacity=".1"/>' +
      '<circle cx="200" cy="232" r="168" fill="none" stroke="#8FAF9A" stroke-opacity=".55"/>' +
      '<circle cx="200" cy="232" r="186" fill="none" stroke="#C49A52" stroke-opacity=".5" stroke-dasharray="2 7"/>' +
      '<path d="M30 440C110 404 190 466 270 434S362 408 392 428" fill="none" stroke="#C49A52" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>' +
      '<path d="M44 92C80 64 116 76 128 46" fill="none" stroke="#8FAF9A" stroke-width="1.2" stroke-linecap="round"/>' +
      '<path d="M330 70l22-5 4 18-22 5z" fill="#FFFDF7" stroke="#E0D3B9"/>' +
    '</svg>';

  var labels =
    '<a class="chip chip--tag" href="books.html?lang=' + encodeURIComponent(book.language) + '">' + esc(lang.name) +
      (lang.native && lang.native !== lang.name ? ' · <span lang="' + esc(lang.lang) + '">' + esc(lang.native.replace(' · more', '')) + '</span>' : '') + '</a>' +
    cats.map(function (c) {
      return '<a class="chip chip--tag" href="books.html?cat=' + encodeURIComponent(c.id) + '">' +
        (c.native ? '<span lang="' + U.textLang(c.native, lang.lang) + '">' + esc(c.native) + '</span>' : esc(c.name)) + '</a>';
    }).join('') +
    (book.format ? '<span class="chip chip--tag chip--static">' + esc(book.format) + '</span>' : '');

  var quote = book.quote && book.quote.length
    ? '<figure class="book-quote enter" style="--d:5">' +
        '<blockquote lang="' + U.textLang(book.quote[0], lang.lang) + '">' +
          book.quote.map(function (line) { return '<span class="book-quote__line">' + esc(line) + '</span>'; }).join('') +
        '</blockquote>' +
      '</figure>'
    : '';

  var facts = [
    ['Language', lang.name + (lang.native !== lang.name ? ' · ' + lang.native : '')],
    ['Category', cats.map(function (c) { return c.native ? c.native + ' (' + c.name + ')' : c.name; }).join(', ')],
    ['Format', book.format],
    ['First published', book.published],
    ['Book ID', book.id]
  ].filter(function (f) { return f[1]; });

  mount.innerHTML =
    '<nav class="breadcrumb enter" aria-label="Breadcrumb"><ol>' +
      '<li><a href="index.html">Home</a></li>' +
      '<li><a href="books.html">Books</a></li>' +
      '<li><a href="books.html?lang=' + encodeURIComponent(book.language) + '">' + esc(U.getLanguage(book.language).name) + '</a></li>' +
      '<li aria-current="page" lang="' + t.mainLang + '">' + esc(t.main) + '</li>' +
    '</ol></nav>' +
    '<article class="detail__grid" aria-labelledby="book-title">' +
      '<div class="detail__stage">' + accent +
        '<div class="detail__cover enter" data-tilt><div class="book3d">' + UI.coverHTML(book, { eager: true, sizes: '(max-width: 800px) 240px, 310px' }) + '</div></div>' +
        (book.dedication ? '<p class="detail__dedication enter" style="--d:1" lang="' + U.textLang(book.dedication, lang.lang) + '">' + esc(book.dedication) + '</p>' : '') +
      '</div>' +
      '<div class="detail__info">' +
        '<div class="detail__labels enter" style="--d:1">' + labels + '</div>' +
        '<h1 class="detail__title enter" id="book-title" lang="' + t.mainLang + '" style="--d:2">' + esc(t.main) + '</h1>' +
        (t.secondary ? '<p class="detail__subtitle enter" style="--d:2">' + esc(t.secondary) + '</p>' : '') +
        '<p class="detail__author enter" style="--d:3">' + (authorLang === 'te' ? '<span lang="te">రచన</span>' : 'by') +
          ' <strong lang="' + authorLang + '">' + esc(book.author) + '</strong></p>' +
        '<div class="detail__price-row enter" style="--d:3"><span class="detail__price"><span class="sr-only">Price: </span>' + U.formatPrice(book.price) + '</span>' +
          (book.format ? '<span class="detail__price-note">' + esc(book.format) + '</span>' : '') + '</div>' +
        '<div class="detail__actions enter" style="--d:4">' +
          '<a class="btn btn--primary" id="buy-btn" href="' + esc(wa) + '" target="_blank" rel="noopener">' + U.icon('chat') +
            'Get This Book <span class="sr-only">(opens WhatsApp in a new tab)</span></a>' +
          (book.sample ? '<button class="btn btn--ghost" type="button" id="sample-btn" aria-haspopup="dialog" aria-controls="sample-dialog">' + U.icon('book') + 'Read Sample</button>' : '') +
          '<button class="text-btn" type="button" id="copy-link">' + U.icon('link') + 'Copy link</button>' +
        '</div>' +
        '<p class="detail__note enter" style="--d:4">' + U.icon('info') +
          '<span>“Get This Book” opens WhatsApp with this book’s title, ID, format and price filled in. We confirm payment and share your copy with you directly.</span></p>' +
        '<div class="detail__desc enter" style="--d:5" lang="' + descLang + '">' +
          U.paragraphs(book.description).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
        '</div>' +
        quote +
        '<dl class="facts enter" style="--d:6">' +
          facts.map(function (f) { return '<div><dt>' + esc(f[0]) + '</dt><dd lang="' + U.textLang(f[1], lang.lang) + '">' + esc(f[1]) + '</dd></div>'; }).join('') +
        '</dl>' +
      '</div>' +
    '</article>';

  /* WhatsApp purchase */
  doc.getElementById('buy-btn').addEventListener('click', function () {
    UI.toast('Opening WhatsApp with your book details…');
  });

  /* Copy link */
  doc.getElementById('copy-link').addEventListener('click', function () {
    var url = window.location.href;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(
        function () { UI.toast('Link copied'); },
        function () { UI.toast('Could not copy — please copy the address from your browser'); }
      );
    } else {
      UI.toast('Could not copy — please copy the address from your browser');
    }
  });

  /* Sample reading dialog (native <dialog>: modal, Escape to close, inert background) */
  var dialog = doc.getElementById('sample-dialog');
  var sampleBtn = doc.getElementById('sample-btn');
  if (book.sample && sampleBtn && dialog && typeof dialog.showModal === 'function') {
    var sample = book.sample;
    doc.getElementById('sample-title').textContent = t.main;
    doc.getElementById('sample-body').innerHTML =
      (sample.heading ? '<h3>' + esc(sample.heading) + '</h3>' : '') +
      sample.paragraphs.map(function (p) { return '<p lang="' + esc(sample.lang || 'en') + '">' + esc(p) + '</p>'; }).join('');
    var sampleBuy = doc.getElementById('sample-buy');
    sampleBuy.href = wa;

    sampleBtn.addEventListener('click', function () {
      dialog.showModal();
      doc.body.classList.add('is-locked');
      dialog.querySelector('[data-close-dialog]').focus();
    });
    dialog.querySelector('[data-close-dialog]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', function () {
      doc.body.classList.remove('is-locked');
      sampleBtn.focus();
    });
    sampleBuy.addEventListener('click', function () { UI.toast('Opening WhatsApp with your book details…'); });
  } else if (sampleBtn) {
    sampleBtn.remove();
  }

  /* Related books: shared categories first, then same language */
  var related = AP.books
    .filter(function (b) { return b.id !== book.id; })
    .map(function (b) {
      var shared = b.categories.filter(function (c) { return book.categories.indexOf(c) !== -1; }).length;
      return { b: b, score: shared * 2 + (b.language === book.language ? 1 : 0) + (b.featured ? 0.1 : 0) };
    })
    .filter(function (x) { return x.score >= 1; })
    .sort(function (a, b) { return b.score - a.score; })
    .slice(0, 4)
    .map(function (x) { return x.b; });

  if (related.length) {
    doc.getElementById('related-grid').innerHTML = related.map(function (b, i) {
      return UI.bookCardHTML(b, { index: i, reveal: true });
    }).join('');
    doc.getElementById('related').hidden = false;
  }

  UI.reveal();
})();
