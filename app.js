(function () {
  "use strict";

  var CONFIG = {
    supabaseUrl: "https://hkwmeeeajkuxycgovevc.supabase.co",
    supabaseKey: "sb_publishable_oA7vBAjke-TU7ipfUyW8oQ_7vIHshPf",
    whatsapp: "917990541616",
    siteUrl: "https://aabhushansales.com/"
  };

  var CATEGORY_DEFS = [
    { label: "Earrings", aliases: ["earrings", "earring"], mark: "E" },
    { label: "Rings", aliases: ["rings", "ring"], mark: "R" },
    { label: "Pendant Sets", aliases: ["pendant sets", "pendant", "pendants"], mark: "P" },
    { label: "Necklaces", aliases: ["necklace", "necklaces", "necklace sets"], mark: "N" },
    { label: "Bracelets", aliases: ["bracelets", "bracelet", "bangles", "bangle"], mark: "B" },
    { label: "Mang Tikkas", aliases: ["mang tikkas", "mang tikka", "maang tikka", "tikka"], mark: "M" }
  ];

  var FALLBACK_PRODUCTS = [
    {
      id: "fallback-ring-1",
      name: "Premium IGP Gents Ring",
      code: "ASBR139026",
      category: "Rings",
      subcategory: "Gents Ring",
      price: 90,
      moq: 20,
      stock: 200,
      box: "Mix designs",
      unit: "per piece",
      image: "https://hkwmeeeajkuxycgovevc.supabase.co/storage/v1/object/public/product-photos/p_1781184727367_q3ok9.jpg",
      createdAt: "2026-06-11T13:32:10.023615+00:00"
    },
    {
      id: "fallback-ring-2",
      name: "Heavy Flat Micro Ring",
      code: "ASAR137526",
      category: "Rings",
      subcategory: "Gents Ring",
      price: 75,
      moq: 20,
      stock: 200,
      box: "Mix designs",
      unit: "per piece",
      image: "https://hkwmeeeajkuxycgovevc.supabase.co/storage/v1/object/public/product-photos/p_1781183255882_xypin.jpg",
      createdAt: "2026-06-11T13:07:37.812905+00:00"
    },
    {
      id: "fallback-necklace-1",
      name: "Premium Necklace Set",
      code: "ASNK001",
      category: "Necklaces",
      subcategory: "Necklace",
      price: 400,
      moq: 1,
      stock: 4,
      box: "Single design box",
      unit: "per piece",
      image: "https://hkwmeeeajkuxycgovevc.supabase.co/storage/v1/object/public/product-photos/p_1780061906130_yyd20.jpeg",
      createdAt: "2026-05-29T13:38:34.875225+00:00"
    },
    {
      id: "fallback-bracelet-1",
      name: "Bangle Box Design",
      code: "ASBG001",
      category: "Bracelets",
      subcategory: "Bangles",
      price: 200,
      moq: 6,
      stock: 1,
      box: "Mix designs",
      unit: "per piece",
      image: "https://hkwmeeeajkuxycgovevc.supabase.co/storage/v1/object/public/product-photos/p_1780055951180_tnaa3.jpeg",
      createdAt: "2026-05-29T11:59:12.485804+00:00"
    }
  ];

  var state = {
    products: [],
    activeCategory: "All",
    query: "",
    sort: "new",
    saved: loadSaved(),
    cart: loadCart()
  };

  var els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheEls();
    bindEvents();
    updateBadges();
    renderOrder();
    loadProducts();
    updateActiveNav();
    window.addEventListener("scroll", updateActiveNav, { passive: true });
  }

  function cacheEls() {
    els.categoryGrid = document.getElementById("categoryGrid");
    els.categoryChips = document.getElementById("categoryChips");
    els.productGrid = document.getElementById("productGrid");
    els.productCount = document.getElementById("productCount");
    els.catalogueStatus = document.getElementById("catalogueStatus");
    els.searchInput = document.getElementById("searchInput");
    els.sortSelect = document.getElementById("sortSelect");
    els.clearFilters = document.getElementById("clearFilters");
    els.savedGrid = document.getElementById("savedGrid");
    els.orderList = document.getElementById("orderList");
    els.orderTotal = document.getElementById("orderTotal");
    els.savedBadge = document.getElementById("savedBadge");
    els.orderBadge = document.getElementById("orderBadge");
    els.menuToggle = document.getElementById("menuToggle");
    els.mobileMenu = document.getElementById("mobileMenu");
    els.menuScrim = document.getElementById("menuScrim");
    els.sendOrder = document.getElementById("sendOrder");
  }

  function bindEvents() {
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("change", onDocumentChange);
    document.addEventListener("input", onDocumentInput);

    els.searchInput.addEventListener("input", function () {
      state.query = els.searchInput.value.trim();
      renderProducts();
    });

    els.sortSelect.addEventListener("change", function () {
      state.sort = els.sortSelect.value;
      renderProducts();
    });

    els.clearFilters.addEventListener("click", function () {
      state.activeCategory = "All";
      state.query = "";
      els.searchInput.value = "";
      renderAll();
      scrollToEl("#catalogue");
    });

    els.sendOrder.addEventListener("click", sendCartToWhatsApp);
  }

  async function loadProducts() {
    setStatus("Opening the catalogue...");
    try {
      var controller = new AbortController();
      var timeout = window.setTimeout(function () {
        controller.abort();
      }, 9000);

      var select = "id,name,code,category,subcategory,price,moq,stock,image_url,images,box_type,price_unit,best_seller,created_at";
      var url = CONFIG.supabaseUrl + "/rest/v1/products?select=" + encodeURIComponent(select) + "&order=created_at.desc";
      var response = await fetch(url, {
        signal: controller.signal,
        headers: {
          apikey: CONFIG.supabaseKey,
          Authorization: "Bearer " + CONFIG.supabaseKey
        }
      });
      window.clearTimeout(timeout);

      if (!response.ok) {
        throw new Error("Catalogue request failed");
      }

      var rows = await response.json();
      var normalized = rows.map(normalizeProduct).filter(Boolean);
      state.products = normalized.length ? normalized : FALLBACK_PRODUCTS.slice();
      setStatus("");
    } catch (error) {
      state.products = FALLBACK_PRODUCTS.slice();
      setStatus("Showing a small sample catalogue while live inventory reconnects.");
    }

    renderAll();
  }

  function normalizeProduct(row) {
    if (!row || !row.id) return null;
    var images = parseImages(row.images);
    if (!images.length && row.image_url) images = [row.image_url];
    return {
      id: String(row.id),
      name: beautifyName(row.name || "Jewellery Design"),
      code: String(row.code || "").trim(),
      rawCategory: String(row.category || "").trim(),
      category: resolveCategory(row.category || ""),
      subcategory: String(row.subcategory || "").trim(),
      price: Number(row.price || 0),
      moq: Math.max(1, Number(row.moq || 1)),
      stock: Number(row.stock || 0),
      box: String(row.box_type || "Mix designs").trim(),
      unit: String(row.price_unit || "per piece").trim(),
      image: images[0] || "",
      images: images,
      best: Boolean(row.best_seller),
      createdAt: row.created_at || ""
    };
  }

  function parseImages(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    try {
      var parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  function renderAll() {
    renderCategories();
    renderChips();
    renderProducts();
    renderSaved();
    renderOrder();
    updateBadges();
  }

  function renderCategories() {
    els.categoryGrid.innerHTML = CATEGORY_DEFS.map(function (def) {
      var items = productsForCategory(def.label);
      var sample = items.find(function (product) { return product.image; });
      var countText = items.length ? items.length + " design" + (items.length === 1 ? "" : "s") : "Coming soon";
      return [
        '<button class="category-card" type="button" data-category="' + escAttr(def.label) + '">',
        sample ? '<img loading="lazy" src="' + escAttr(sample.image) + '" alt="' + escAttr(def.label) + '">' : '<span class="fallback-mark">' + esc(def.mark) + '</span>',
        '<span><strong>' + esc(def.label) + '</strong><span>' + esc(countText) + '</span></span>',
        '</button>'
      ].join("");
    }).join("");
  }

  function renderChips() {
    var chips = [{ label: "All", count: state.products.length }].concat(CATEGORY_DEFS.map(function (def) {
      return { label: def.label, count: productsForCategory(def.label).length };
    }));

    var extras = unique(state.products.map(function (product) { return product.category; }))
      .filter(function (label) {
        return label && !CATEGORY_DEFS.some(function (def) { return def.label === label; });
      })
      .map(function (label) {
        return { label: label, count: productsForCategory(label).length };
      });

    chips = chips.concat(extras);

    els.categoryChips.innerHTML = chips.map(function (chip) {
      var active = chip.label === state.activeCategory ? " is-active" : "";
      var label = chip.label + (chip.label === "All" ? "" : " (" + chip.count + ")");
      return '<button class="chip' + active + '" type="button" role="tab" aria-selected="' + (chip.label === state.activeCategory) + '" data-category="' + escAttr(chip.label) + '">' + esc(label) + '</button>';
    }).join("");
  }

  function renderProducts() {
    var list = getVisibleProducts();
    els.productCount.textContent = list.length + " of " + state.products.length + " designs";
    els.clearFilters.hidden = state.activeCategory === "All" && !state.query;

    if (!list.length) {
      els.productGrid.innerHTML = emptyState("No designs found", "Try another category or search term.");
      return;
    }

    els.productGrid.innerHTML = list.map(function (product) {
      return productCard(product);
    }).join("");
  }

  function renderSaved() {
    var savedProducts = state.products.filter(function (product) {
      return state.saved.has(product.id);
    });

    if (!savedProducts.length) {
      els.savedGrid.innerHTML = emptyState("No saved designs yet", "Tap the save icon on products you want to shortlist.");
      return;
    }

    els.savedGrid.innerHTML = savedProducts.map(function (product) {
      return productCard(product);
    }).join("");
  }

  function renderOrder() {
    var items = cartItems();
    if (!items.length) {
      els.orderList.innerHTML = "";
      els.orderTotal.textContent = "No designs added yet.";
      return;
    }

    els.orderList.innerHTML = items.map(function (entry) {
      var product = entry.product;
      var item = entry.item;
      return [
        '<article class="order-item" data-order-item="' + escAttr(product.id) + '">',
        product.image ? '<img loading="lazy" src="' + escAttr(product.image) + '" alt="' + escAttr(product.name) + '">' : '<div class="product-fallback">AS</div>',
        '<div>',
        '<h3>' + esc(product.name) + '</h3>',
        '<p>' + esc(product.code || "No code") + ' - ' + esc(money(product.price)) + ' ' + esc(product.unit) + '</p>',
        '<select class="box-select" data-order-box="' + escAttr(product.id) + '">' + boxOptions(item.box || product.box) + '</select>',
        '<div class="order-controls">',
        qtyControl(product.id, item.qty || product.moq, "order"),
        '<button class="remove-button" type="button" data-remove="' + escAttr(product.id) + '">Remove</button>',
        '</div>',
        '</div>',
        '</article>'
      ].join("");
    }).join("");

    var qtyTotal = items.reduce(function (sum, entry) { return sum + Number(entry.item.qty || 0); }, 0);
    var priceTotal = items.reduce(function (sum, entry) {
      return sum + (Number(entry.product.price || 0) * Number(entry.item.qty || 0));
    }, 0);
    els.orderTotal.textContent = items.length + " design" + (items.length === 1 ? "" : "s") + " - " + qtyTotal + " pcs - approx " + money(priceTotal);
  }

  function productCard(product) {
    var isSaved = state.saved.has(product.id);
    var cartItem = state.cart[product.id];
    var qty = cartItem ? cartItem.qty : product.moq;
    return [
      '<article class="product-card" data-product-card="' + escAttr(product.id) + '">',
      '<button class="save-button' + (isSaved ? " is-saved" : "") + '" type="button" data-save="' + escAttr(product.id) + '" aria-pressed="' + isSaved + '" aria-label="Save ' + escAttr(product.name) + '">',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21l-7-4.5L5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"></path></svg>',
      '</button>',
      '<div class="product-thumb">',
      product.image ? '<img loading="lazy" src="' + escAttr(product.image) + '" alt="' + escAttr(product.name) + '">' : '<div class="product-fallback">AS</div>',
      '</div>',
      '<div class="product-body">',
      '<p class="product-code">' + esc(product.code || product.category) + '</p>',
      '<h3>' + esc(product.name) + '</h3>',
      '<div class="product-meta"><span>' + esc(money(product.price)) + ' ' + esc(product.unit) + '</span><span>MOQ ' + esc(product.moq) + ' - Stock ' + esc(product.stock || "Ask") + '</span></div>',
      '<select class="box-select" data-box="' + escAttr(product.id) + '" aria-label="Box option for ' + escAttr(product.name) + '">' + boxOptions((cartItem && cartItem.box) || product.box) + '</select>',
      '<div class="card-actions">',
      qtyControl(product.id, qty, "card"),
      '<button class="add-button" type="button" data-add="' + escAttr(product.id) + '">Add to Order</button>',
      '<button class="whatsapp-button" type="button" data-whatsapp="' + escAttr(product.id) + '">Order on WhatsApp</button>',
      '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function qtyControl(id, value, scope) {
    return [
      '<div class="qty-row" data-qty-row="' + escAttr(id) + '">',
      '<button type="button" data-qty-minus="' + escAttr(id) + '" data-scope="' + escAttr(scope) + '" aria-label="Decrease quantity">-</button>',
      '<input type="number" min="1" step="1" inputmode="numeric" value="' + escAttr(value) + '" data-qty-input="' + escAttr(id) + '" data-scope="' + escAttr(scope) + '" aria-label="Quantity">',
      '<button type="button" data-qty-plus="' + escAttr(id) + '" data-scope="' + escAttr(scope) + '" aria-label="Increase quantity">+</button>',
      '</div>'
    ].join("");
  }

  function boxOptions(selected) {
    var choices = unique([selected || "Mix designs", "Mix designs", "Single design box", "Ask for available packing"]);
    return choices.map(function (choice) {
      var sel = choice === selected ? " selected" : "";
      return '<option value="' + escAttr(choice) + '"' + sel + '>' + esc(choice) + '</option>';
    }).join("");
  }

  function onDocumentClick(event) {
    var target = event.target;
    var actionEl = target.closest("[data-action]");
    if (actionEl) {
      var action = actionEl.getAttribute("data-action");
      if (action === "search") {
        scrollToEl("#catalogue");
        window.setTimeout(function () { els.searchInput.focus(); }, 350);
      }
      if (action === "saved") scrollToEl("#saved");
      if (action === "order") scrollToEl("#order");
      if (action === "close-menu") closeMenu();
      return;
    }

    if (target.closest("#menuToggle")) {
      toggleMenu();
      return;
    }

    if (target === els.menuScrim) {
      closeMenu();
      return;
    }

    var menuLink = target.closest(".mobile-menu a");
    if (menuLink) {
      closeMenu();
      return;
    }

    var heroCat = target.closest("[data-category-short]");
    if (heroCat) {
      setCategory(heroCat.getAttribute("data-category-short"));
      return;
    }

    var cat = target.closest("[data-category]");
    if (cat) {
      setCategory(cat.getAttribute("data-category"));
      return;
    }

    var save = target.closest("[data-save]");
    if (save) {
      toggleSaved(save.getAttribute("data-save"));
      return;
    }

    var minus = target.closest("[data-qty-minus]");
    if (minus) {
      adjustQty(minus.getAttribute("data-qty-minus"), -1, minus.getAttribute("data-scope"));
      return;
    }

    var plus = target.closest("[data-qty-plus]");
    if (plus) {
      adjustQty(plus.getAttribute("data-qty-plus"), 1, plus.getAttribute("data-scope"));
      return;
    }

    var add = target.closest("[data-add]");
    if (add) {
      addToCart(add.getAttribute("data-add"));
      return;
    }

    var singleWa = target.closest("[data-whatsapp]");
    if (singleWa) {
      sendProductToWhatsApp(singleWa.getAttribute("data-whatsapp"));
      return;
    }

    var remove = target.closest("[data-remove]");
    if (remove) {
      delete state.cart[remove.getAttribute("data-remove")];
      persistCart();
      renderOrder();
      updateBadges();
      toast("Removed from order");
    }
  }

  function onDocumentChange(event) {
    var orderBox = event.target.closest("[data-order-box]");
    if (orderBox) {
      var id = orderBox.getAttribute("data-order-box");
      if (state.cart[id]) {
        state.cart[id].box = orderBox.value;
        persistCart();
      }
    }
  }

  function onDocumentInput(event) {
    var input = event.target.closest("[data-qty-input]");
    if (!input) return;
    var id = input.getAttribute("data-qty-input");
    var scope = input.getAttribute("data-scope");
    var value = clampQty(input.value);
    input.value = value;
    if (scope === "order" && state.cart[id]) {
      state.cart[id].qty = value;
      persistCart();
      renderOrder();
      updateBadges();
    }
  }

  function setCategory(category) {
    state.activeCategory = category || "All";
    renderChips();
    renderProducts();
    scrollToEl("#catalogue");
  }

  function toggleSaved(id) {
    if (state.saved.has(id)) {
      state.saved.delete(id);
      toast("Removed from saved");
    } else {
      state.saved.add(id);
      toast("Saved for later");
    }
    persistSaved();
    renderProducts();
    renderSaved();
    updateBadges();
  }

  function adjustQty(id, delta, scope) {
    var selector = '[data-qty-input="' + cssEscape(id) + '"][data-scope="' + cssEscape(scope) + '"]';
    var input = document.querySelector(selector);
    if (!input) return;
    var next = clampQty(Number(input.value || 1) + delta);
    input.value = next;
    if (scope === "order" && state.cart[id]) {
      state.cart[id].qty = next;
      persistCart();
      renderOrder();
      updateBadges();
    }
  }

  function addToCart(id) {
    var product = productById(id);
    if (!product) return;
    state.cart[id] = {
      qty: cardQty(id) || product.moq,
      box: cardBox(id) || product.box
    };
    persistCart();
    renderOrder();
    updateBadges();
    toast("Added to order");
  }

  function sendProductToWhatsApp(id) {
    var product = productById(id);
    if (!product) return;
    var qty = cardQty(id) || product.moq;
    var box = cardBox(id) || product.box;
    openWhatsApp(productMessage(product, qty, box));
  }

  function sendCartToWhatsApp() {
    var items = cartItems();
    if (!items.length) {
      toast("Add at least one design first");
      scrollToEl("#catalogue");
      return;
    }
    openWhatsApp(cartMessage(items));
  }

  function productMessage(product, qty, box) {
    return [
      "Hello Aabhushan Sales,",
      "",
      "I would like to order this design:",
      "Product: " + product.name,
      "Code: " + (product.code || "-"),
      "Category: " + product.category,
      "Quantity: " + qty,
      "Box option: " + box,
      "Rate: " + money(product.price) + " " + product.unit,
      "Page: " + productLink(product)
    ].join("\n");
  }

  function cartMessage(items) {
    var buyerName = valueOf("buyerName") || "-";
    var buyerPhone = valueOf("buyerPhone") || "-";
    var note = valueOf("buyerNote") || "-";
    var lines = [
      "Hello Aabhushan Sales,",
      "",
      "I would like to place a wholesale order.",
      "",
      "Buyer: " + buyerName,
      "Mobile: " + buyerPhone,
      "Note: " + note,
      "",
      "Designs:"
    ];

    items.forEach(function (entry, index) {
      var product = entry.product;
      var item = entry.item;
      lines.push(
        (index + 1) + ". " + product.name,
        "Code: " + (product.code || "-"),
        "Qty: " + item.qty,
        "Box option: " + (item.box || product.box),
        "Rate: " + money(product.price) + " " + product.unit,
        "Link: " + productLink(product),
        ""
      );
    });

    lines.push("Website: " + CONFIG.siteUrl);
    return lines.join("\n");
  }

  function openWhatsApp(message) {
    var url = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank", "noopener");
  }

  function getVisibleProducts() {
    var list = state.products.slice();
    if (state.activeCategory !== "All") {
      list = list.filter(function (product) {
        return product.category === state.activeCategory;
      });
    }

    if (state.query) {
      var q = normalizeText(state.query);
      list = list.filter(function (product) {
        return normalizeText([product.name, product.code, product.category, product.subcategory].join(" ")).indexOf(q) >= 0;
      });
    }

    list.sort(function (a, b) {
      if (state.sort === "priceLow") return a.price - b.price;
      if (state.sort === "priceHigh") return b.price - a.price;
      if (state.sort === "name") return a.name.localeCompare(b.name);
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });

    return list;
  }

  function cartItems() {
    return Object.keys(state.cart).map(function (id) {
      return { product: productById(id), item: state.cart[id] };
    }).filter(function (entry) {
      return entry.product;
    });
  }

  function productById(id) {
    return state.products.find(function (product) {
      return product.id === id;
    });
  }

  function productsForCategory(label) {
    return state.products.filter(function (product) {
      return product.category === label;
    });
  }

  function resolveCategory(raw) {
    var value = normalizeText(raw);
    if (!value) return "Jewellery";
    for (var i = 0; i < CATEGORY_DEFS.length; i += 1) {
      if (CATEGORY_DEFS[i].aliases.indexOf(value) >= 0) return CATEGORY_DEFS[i].label;
    }
    return beautifyName(raw);
  }

  function cardQty(id) {
    var input = document.querySelector('[data-qty-input="' + cssEscape(id) + '"][data-scope="card"]');
    return input ? clampQty(input.value) : 1;
  }

  function cardBox(id) {
    var select = document.querySelector('[data-box="' + cssEscape(id) + '"]');
    return select ? select.value : "";
  }

  function clampQty(value) {
    var number = parseInt(value, 10);
    if (!Number.isFinite(number) || number < 1) return 1;
    return Math.min(number, 9999);
  }

  function money(value) {
    var number = Number(value || 0);
    if (!number) return "Price on request";
    return "Rs. " + number.toLocaleString("en-IN");
  }

  function productLink(product) {
    return CONFIG.siteUrl + "#product-" + encodeURIComponent(product.id);
  }

  function valueOf(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function setStatus(text) {
    els.catalogueStatus.textContent = text || "";
    els.catalogueStatus.hidden = !text;
  }

  function updateBadges() {
    var savedCount = state.saved.size;
    var orderCount = Object.keys(state.cart).length;
    setBadge(els.savedBadge, savedCount);
    setBadge(els.orderBadge, orderCount);
  }

  function setBadge(el, count) {
    if (!el) return;
    el.textContent = count;
    el.hidden = !count;
  }

  function scrollToEl(selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleMenu() {
    if (document.body.classList.contains("menu-open")) closeMenu();
    else openMenu();
  }

  function openMenu() {
    els.mobileMenu.hidden = false;
    els.menuScrim.hidden = false;
    document.body.classList.add("menu-open");
    els.menuToggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    document.body.classList.remove("menu-open");
    els.menuToggle.setAttribute("aria-expanded", "false");
    els.mobileMenu.hidden = true;
    els.menuScrim.hidden = true;
  }

  function updateActiveNav() {
    var sections = [
      { id: "home", nav: "home" },
      { id: "categories", nav: "categories" },
      { id: "catalogue", nav: "search" },
      { id: "saved", nav: "saved" },
      { id: "order", nav: "order" }
    ];
    var current = "home";
    var offset = 120;
    sections.forEach(function (item) {
      var el = document.getElementById(item.id);
      if (el && el.getBoundingClientRect().top <= offset) current = item.nav;
    });
    document.querySelectorAll(".bottom-link").forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("data-nav") === current);
    });
  }

  function toast(message) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-visible");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(function () {
      el.classList.remove("is-visible");
    }, 1800);
  }

  function emptyState(title, message) {
    return '<div class="empty-state"><span>AS</span><h3>' + esc(title) + '</h3><p>' + esc(message) + '</p></div>';
  }

  function loadSaved() {
    try {
      return new Set(JSON.parse(localStorage.getItem("as_saved_mobile") || "[]"));
    } catch (error) {
      return new Set();
    }
  }

  function persistSaved() {
    localStorage.setItem("as_saved_mobile", JSON.stringify(Array.from(state.saved)));
  }

  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem("as_cart_mobile") || "{}");
      Object.keys(raw).forEach(function (id) {
        if (typeof raw[id] === "number") raw[id] = { qty: raw[id], box: "Mix designs" };
        raw[id].qty = clampQty(raw[id].qty || 1);
      });
      return raw;
    } catch (error) {
      return {};
    }
  }

  function persistCart() {
    localStorage.setItem("as_cart_mobile", JSON.stringify(state.cart));
  }

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function beautifyName(value) {
    var text = String(value || "").trim().replace(/\s+/g, " ");
    if (!text) return "";
    text = text.toLowerCase().replace(/\b[a-z]/g, function (letter) { return letter.toUpperCase(); });
    return text
      .replace(/\bIgp\b/g, "IGP")
      .replace(/\bDc\b/g, "DC")
      .replace(/\bBm\b/g, "BM")
      .replace(/\bSq\b/g, "SQ")
      .replace(/\bAs\b/g, "AS");
  }

  function unique(values) {
    var seen = [];
    values.forEach(function (value) {
      if (value && seen.indexOf(value) < 0) seen.push(value);
    });
    return seen;
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
    });
  }

  function escAttr(value) {
    return esc(value);
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/["\\]/g, "\\$&");
  }
})();
