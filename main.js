/* ============================================================
   AABHUSHAN SALES — main.js
   Lightweight, dependency-free interactions
   ============================================================ */
'use strict';

/* ------------------------------------------------------------
   CONFIG  ——  EDIT YOUR DETAILS HERE
   • WHATSAPP_NUMBER: country code + number, digits only (no +, spaces or dashes)
     Example: India number 79905 41616  ->  '917990541616'
   ------------------------------------------------------------ */
var CONFIG = {
  WHATSAPP_NUMBER: '917990541616',
  BRAND: 'Aabhushan Sales'
};

/* ------------------------------------------------------------
   PRODUCTS  ——  EDIT YOUR CATALOGUE HERE
   • Each product can have its own photos. Drop image files into the
     /images folder and list the filenames in `images: [...]`.
   • Leave `images: []` empty to show an elegant branded placeholder.
   • If you add 2+ images, customers get a thumbnail switcher + lightbox.
     Example:  images: ['necklace-1.jpg', 'necklace-2.jpg']
   ------------------------------------------------------------ */
var PRODUCTS = [
  {
    code: 'AS-NS',
    name: 'Necklaces & Sets',
    tagline: 'Bridal sets, casual wear & statement pieces in gold & silver finish.',
    emoji: '💍',
    images: []
  },
  {
    code: 'AS-ER',
    name: 'Earrings',
    tagline: 'Studs, jhumkas, chandeliers & hoops — over 200 designs available.',
    emoji: '💎',
    images: []
  },
  {
    code: 'AS-BB',
    name: 'Bangles & Bracelets',
    tagline: 'Traditional & contemporary designs — plain, meenakari & stone-set.',
    emoji: '🔮',
    images: []
  },
  {
    code: 'AS-RG',
    name: 'Rings',
    tagline: 'Cocktail rings, bands & adjustable designs for every occasion.',
    emoji: '⭐',
    images: []
  },
  {
    code: 'AS-MT',
    name: 'Maang Tikka',
    tagline: 'Bridal headpieces with kundan, polki & floral inspirations.',
    emoji: '✨',
    images: []
  },
  {
    code: 'AS-AH',
    name: 'Anklets & Haath Phool',
    tagline: 'Delicate chains, ghungroo anklets & full hand-harness designs.',
    emoji: '🌟',
    images: []
  }
];

/* Where product images live */
var IMAGE_DIR = 'images/';

/* ------------------------------------------------------------
   Helpers
   ------------------------------------------------------------ */
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

/* Build a wa.me link with an encoded message */
function waLink(message) {
  return 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
}

/* Track the selected box quantity per product code */
var selectedBoxes = {};

/* Build the WhatsApp order message for one product */
function buildOrderMessage(product) {
  var boxes = selectedBoxes[product.code] || 1;
  var lines = [
    'Hello ' + CONFIG.BRAND + ', I would like to place an order:',
    '',
    '• Product: ' + product.name + (product.code ? ' (' + product.code + ')' : ''),
    '• Quantity: ' + boxes + ' Box' + (boxes > 1 ? 'es' : ''),
    '',
    'Please share availability and wholesale pricing. Thank you!'
  ];
  return lines.join('\n');
}

/* Generic enquiry message */
function buildGeneralMessage() {
  return 'Hello ' + CONFIG.BRAND + ', I am interested in your jewellery collection. Please share your latest designs and wholesale box pricing.';
}

/* ------------------------------------------------------------
   Render product cards
   ------------------------------------------------------------ */
function renderProducts() {
  var grid = $('#productGrid');
  if (!grid) return;

  PRODUCTS.forEach(function (product, index) {
    selectedBoxes[product.code] = 1;

    var hasImg = product.images && product.images.length > 0;
    var firstImg = hasImg ? IMAGE_DIR + product.images[0] : '';

    var card = document.createElement('article');
    card.className = 'product-card reveal';
    if (index % 3) card.setAttribute('data-d', String(index % 3));

    /* ----- Media (image or placeholder) ----- */
    var media =
      '<div class="product-media" data-code="' + product.code + '" role="button" tabindex="0" aria-label="View ' + product.name + ' photo">' +
        '<span class="product-badge">' + product.code + '</span>' +
        (hasImg
          ? '<img src="' + firstImg + '" alt="' + product.name + '" loading="lazy" />'
          : '<div class="product-placeholder"><span class="emoji">' + product.emoji + '</span><small>Photo coming soon</small></div>'
        ) +
        '<span class="product-zoom" aria-hidden="true">🔍</span>' +
      '</div>';

    /* ----- Thumbnails (only if multiple images) ----- */
    var thumbs = '';
    if (hasImg && product.images.length > 1) {
      thumbs = '<div class="product-thumbs" data-code="' + product.code + '">';
      product.images.forEach(function (img, i) {
        thumbs +=
          '<button type="button" class="' + (i === 0 ? 'active' : '') + '" data-index="' + i + '" aria-label="View image ' + (i + 1) + '">' +
            '<img src="' + IMAGE_DIR + img + '" alt="' + product.name + ' ' + (i + 1) + '" loading="lazy" />' +
          '</button>';
      });
      thumbs += '</div>';
    }

    /* ----- Body with box selector + order button ----- */
    var body =
      '<div class="product-body">' +
        '<span class="product-code">' + product.code + '</span>' +
        '<h3 class="product-name">' + product.name + '</h3>' +
        '<p class="product-tag">' + product.tagline + '</p>' +
        '<div class="box-select">' +
          '<span class="box-label">Select quantity</span>' +
          '<div class="box-options" data-code="' + product.code + '">' +
            '<button type="button" class="active" data-box="1">1 Box</button>' +
            '<button type="button" data-box="2">2 Box</button>' +
            '<button type="button" data-box="3">3 Box</button>' +
          '</div>' +
        '</div>' +
        '<a class="btn btn-wa btn-block product-order" data-code="' + product.code + '" href="' + waLink(buildOrderMessage(product)) + '" target="_blank" rel="noopener">' +
          '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>' +
          'Order on WhatsApp' +
        '</a>' +
      '</div>';

    card.innerHTML = media + thumbs + body;
    grid.appendChild(card);
  });

  attachProductEvents();
}

/* ------------------------------------------------------------
   Product card interactions (box select, thumbs, lightbox)
   ------------------------------------------------------------ */
function attachProductEvents() {
  /* Box quantity selector */
  $all('.box-options').forEach(function (group) {
    var code = group.getAttribute('data-code');
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-box]');
      if (!btn) return;
      $all('button', group).forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectedBoxes[code] = parseInt(btn.getAttribute('data-box'), 10);

      /* Refresh the WhatsApp link for this card */
      var product = findProduct(code);
      var orderBtn = $('.product-order[data-code="' + code + '"]');
      if (product && orderBtn) orderBtn.setAttribute('href', waLink(buildOrderMessage(product)));
    });
  });

  /* Thumbnail switch (updates main card image) */
  $all('.product-thumbs').forEach(function (strip) {
    var code = strip.getAttribute('data-code');
    strip.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-index]');
      if (!btn) return;
      var product = findProduct(code);
      var idx = parseInt(btn.getAttribute('data-index'), 10);
      var mainImg = $('.product-media[data-code="' + code + '"] img');
      if (product && mainImg) mainImg.setAttribute('src', IMAGE_DIR + product.images[idx]);
      $all('button', strip).forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  /* Open lightbox from media area */
  $all('.product-media').forEach(function (media) {
    var code = media.getAttribute('data-code');
    function open() { openLightbox(code); }
    media.addEventListener('click', open);
    media.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}

function findProduct(code) {
  for (var i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].code === code) return PRODUCTS[i];
  }
  return null;
}

/* ------------------------------------------------------------
   Lightbox (zoom + multi-image)
   ------------------------------------------------------------ */
var lightbox = $('#lightbox');
var lbStage = $('#lightboxStage');
var lbTitle = $('#lightboxTitle');
var lbThumbs = $('#lightboxThumbs');

function openLightbox(code) {
  var product = findProduct(code);
  if (!product || !lightbox) return;

  lbTitle.textContent = product.name + ' · ' + product.code;
  renderLightboxImage(product, 0);

  /* Thumbnails inside lightbox (only if multiple) */
  lbThumbs.innerHTML = '';
  if (product.images && product.images.length > 1) {
    product.images.forEach(function (img, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = i === 0 ? 'active' : '';
      b.setAttribute('aria-label', 'Image ' + (i + 1));
      b.innerHTML = '<img src="' + IMAGE_DIR + img + '" alt="" loading="lazy" />';
      b.addEventListener('click', function () {
        renderLightboxImage(product, i);
        $all('button', lbThumbs).forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
      });
      lbThumbs.appendChild(b);
    });
  }

  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderLightboxImage(product, index) {
  var hasImg = product.images && product.images.length > 0;
  if (hasImg) {
    lbStage.innerHTML = '<img src="' + IMAGE_DIR + product.images[index] + '" alt="' + product.name + '" />';
    lbStage.classList.remove('zoomed');
    /* tap to zoom */
    lbStage.onclick = function () { lbStage.classList.toggle('zoomed'); };
  } else {
    lbStage.innerHTML = '<div class="lightbox-ph"><span class="emoji">' + product.emoji + '</span><small>Photo coming soon — message us on WhatsApp for live photos</small></div>';
    lbStage.onclick = null;
  }
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

if (lightbox) {
  $('#lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
}

/* ------------------------------------------------------------
   Wire up all generic WhatsApp buttons ([data-wa="general"])
   ------------------------------------------------------------ */
function wireGeneralWhatsApp() {
  $all('[data-wa="general"]').forEach(function (el) {
    el.setAttribute('href', waLink(buildGeneralMessage()));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
}

/* ------------------------------------------------------------
   Header: shadow on scroll + mobile menu
   ------------------------------------------------------------ */
(function header() {
  var head = $('#header');
  window.addEventListener('scroll', function () {
    head.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  var toggle = $('#navToggle');
  var menu = $('#navMobile');
  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $all('a', menu).forEach(function (a) {
    a.addEventListener('click', function () {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ------------------------------------------------------------
   Scroll reveal
   ------------------------------------------------------------ */
function initReveal() {
  var els = $all('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
}

/* ------------------------------------------------------------
   Animated counters
   ------------------------------------------------------------ */
function initCounters() {
  var nums = $all('.num[data-count]');
  if (!nums.length) return;
  if (!('IntersectionObserver' in window)) {
    nums.forEach(function (n) { n.textContent = n.getAttribute('data-count'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.getAttribute('data-count'), 10);
      var start = null;
      var dur = 1600;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  nums.forEach(function (n) { io.observe(n); });
}

/* ------------------------------------------------------------
   Testimonials slider
   ------------------------------------------------------------ */
(function testimonials() {
  var track = $('#testiTrack');
  var dotsWrap = $('#testiDots');
  if (!track || !dotsWrap) return;

  var slides = $all('.testi-card', track).length;
  var current = 0;
  var timer;

  for (var i = 0; i < slides; i++) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Testimonial ' + (i + 1));
    if (i === 0) dot.classList.add('active');
    (function (idx) {
      dot.addEventListener('click', function () { go(idx); restart(); });
    })(i);
    dotsWrap.appendChild(dot);
  }
  var dots = $all('button', dotsWrap);

  function go(n) {
    current = (n + slides) % slides;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(function () { go(current + 1); }, 5500);
  }
  restart();
})();

/* ------------------------------------------------------------
   Enquiry form -> WhatsApp
   ------------------------------------------------------------ */
(function enquiryForm() {
  var form = $('#enquiryForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var category = form.category.value;
    var message = form.message.value.trim();

    var lines = ['Hello ' + CONFIG.BRAND + ', I would like to make an enquiry:', ''];
    if (name) lines.push('• Name: ' + name);
    if (phone) lines.push('• Phone: ' + phone);
    if (category) lines.push('• Category: ' + category);
    if (message) lines.push('• Requirement: ' + message);
    lines.push('', 'Please share details. Thank you!');

    window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  });
})();

/* ------------------------------------------------------------
   Footer year
   ------------------------------------------------------------ */
(function () {
  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ------------------------------------------------------------
   Init
   ------------------------------------------------------------ */
renderProducts();
wireGeneralWhatsApp();
initReveal();
initCounters();
