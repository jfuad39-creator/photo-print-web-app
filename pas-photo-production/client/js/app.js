/* =====================================================================
 * client/js/app.js - controller panel Pas Foto Print
 *
 * Bind event tombol/form, orkestrasi state.js -> layout-engine.js ->
 * bridge.js, dan render preview. Riwayat perubahan: lihat CHANGELOG.md.
 * ===================================================================== */
(function () {
  "use strict";

  var S = window.PFState;
  var B = window.PFBridge;
  var L = window.PFLayout;
  var lastLayout = null;
  var pendingBg = ""; /* warna yang sedang dipilih di panel "Ganti Background Foto" (slot editor) */

  /* ---------------- helpers ---------------- */
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fileUrl(p) {
    if (!p) return "";
    var s = String(p).replace(/\\/g, "/");
    return "file:///" + encodeURI(s.replace(/^\/+/, ""));
  }
  function isRenderable(p) { return /\.(jpe?g|png|gif|bmp|webp)$/i.test(String(p || "")); }

  /* teks pilihan dropdown ukuran (Order Ukuran, Terapkan ke Ukuran Ini).
     Dulu formatnya "label (widthMm\u00d7heightMm)" misal "4x6 (40\u00d760)"
     - dobel & kepanjangan sampai kepotong di dropdown yang sempit.
     Sekarang:
       - kalau label sendiri sudah berupa ukuran cm (pola "4x6", "3x4", dst)
         cukup tampilkan "4x6 cm" saja, tanpa duplikasi angka mm.
       - selain itu (mis. kode kertas foto 2R/3R/4R) tetap tampilkan ukuran
         cm-nya di dalam kurung, dikonversi dari mm supaya singkat & konsisten. */
  function fmtCm(mm) {
    var cm = mm / 10;
    var s = cm.toFixed(1);
    if (s.slice(-2) === ".0") s = s.slice(0, -2);
    return s;
  }
  function sizeOptionText(label, w, h) {
    if (/^\d+\s*x\s*\d+$/i.test(label)) return label + " cm";
    return label + " (" + fmtCm(w) + "\u00d7" + fmtCm(h) + " cm)";
  }

  /* wraps a <input type=number> with a small stacked up/down spinner UI */
  function attachSpinner(input) {
    if (!input || (input.parentElement && input.parentElement.classList.contains("numfield"))) return;
    var wrap = el("span", "numfield");
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    var spin = el("span", "spin",
      '<button type="button" tabindex="-1">\u25b2</button><button type="button" tabindex="-1">\u25bc</button>');
    wrap.appendChild(spin);
    var btns = spin.querySelectorAll("button");
    function step(dir) {
      var stepVal = parseFloat(input.step) || 1;
      var val = (parseFloat(input.value) || 0) + dir * stepVal;
      var min = input.min !== "" ? parseFloat(input.min) : null;
      var max = input.max !== "" ? parseFloat(input.max) : null;
      if (min !== null && val < min) val = min;
      if (max !== null && val > max) val = max;
      input.value = (Math.round(val * 100) / 100);
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    btns[0].onclick = function (e) { e.preventDefault(); step(1); };
    btns[1].onclick = function (e) { e.preventDefault(); step(-1); };
  }

  var toastTimer = null;
  function toast(msg, kind) {
    var t = $("#toast");
    t.textContent = msg;
    t.className = "toast show " + (kind || "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = "toast " + (kind || ""); }, 2600);
  }

  /* ---------------- photo source ---------------- */
  function renderPhotos() {
    var grid = $("#photoGrid");
    var st = S.get();
    grid.innerHTML = "";
    $("#photoHint").style.display = st.photos.length ? "none" : "block";

    st.photos.forEach(function (p) {
      var card = el("div", "photo-card");
      var media = isRenderable(p.path)
        ? '<img class="thumb" src="' + esc(p.thumb || fileUrl(p.path)) + '" alt="" onerror="this.outerHTML=\'<div class=&quot;ph&quot;>TIFF</div>\'" />'
        : '<div class="ph">\ud83d\uddbc</div>';

      var curBg = p.bg || "";
      var presetValues = S.bgPresets.map(function (bp) { return bp.value; });
      var isCustom = curBg !== "" && presetValues.indexOf(curBg) === -1;
      var bgSwatches = S.bgPresets.map(function (bp) {
        var active = (curBg === bp.value) ? " active" : "";
        var noneCls = (bp.value === "") ? " none" : "";
        var style = bp.value ? ' style="background:' + esc(bp.value) + '"' : "";
        return '<button type="button" class="bg-swatch' + noneCls + active + '" data-bg="' + esc(bp.value) + '" title="' + esc(bp.label) + '"' + style + '></button>';
      }).join("");

      card.innerHTML =
        media +
        '<button class="del" title="Hapus">\u00d7</button>' +
        '<div class="meta"><span class="dot" style="background:' + esc(p.color) + '"></span>' +
        '<input class="nm" value="' + esc(p.name) + '" title="' + esc(p.path) + '" /></div>' +
        '<div class="bg-row" title="Warna background di belakang foto (PNG transparan)">' +
          bgSwatches +
          '<label class="bg-custom' + (isCustom ? " active" : "") + '" title="Warna custom">' +
            '<input type="color" value="' + esc(isCustom ? curBg : "#ffffff") + '" />' +
          '</label>' +
        '</div>';

      card.querySelector(".del").onclick = function () {
        S.removePhoto(p.id); renderPhotos(); renderOrder(); preview();
      };
      card.querySelector(".nm").onchange = function (e) {
        p.name = e.target.value; S.save(); renderOrder();
      };
      Array.prototype.forEach.call(card.querySelectorAll("[data-bg]"), function (btn) {
        btn.onclick = function () {
          S.setPhotoBg(p.id, btn.getAttribute("data-bg"));
          renderPhotos(); preview();
        };
      });
      var customInput = card.querySelector(".bg-custom input");
      customInput.oninput = function (e) {
        S.setPhotoBg(p.id, e.target.value);
        preview();
      };
      customInput.onchange = function () { renderPhotos(); };
      grid.appendChild(card);
    });
  }

  function addPhotoPaths(files) {
    if (!files || !files.length) return;
    files.forEach(function (f) { S.addPhoto(f.name, f.path, f.thumb || ""); });
    var st = S.get();
    st.items.forEach(function (it) {
      if (!it.sourceId && st.photos.length) it.sourceId = st.photos[0].id;
    });
    S.save();
    renderPhotos(); renderOrder(); preview();
    toast(files.length + " foto ditambahkan.", "ok");
  }

  $("#btnAddPhoto").onclick = function () {
    if (!B.isCEP) { toast("Fitur ini hanya aktif di dalam Illustrator.", "err"); return; }
    B.call("pickFiles", {}, function (res) {
      if (!res.ok) return toast(res.message, "err");
      addPhotoPaths((res.data && res.data.files) || []);
    });
  };

  $("#btnFromSelection").onclick = function () {
    if (!B.isCEP) { toast("Fitur ini hanya aktif di dalam Illustrator.", "err"); return; }
    B.call("fromSelection", {}, function (res) {
      if (!res.ok) return toast(res.message, "err");
      addPhotoPaths((res.data && res.data.files) || []);
    });
  };

  var dz = $("#dropZone");
  ["dragenter", "dragover"].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("over"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("over"); });
  });
  dz.addEventListener("drop", function (e) {
    var list = e.dataTransfer && e.dataTransfer.files;
    if (!list || !list.length) return;
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      var p = f.path || f.name;
      if (!/\.(jpe?g|png|tiff?)$/i.test(p)) continue;
      out.push({ name: f.name, path: p });
    }
    if (!out.length) return toast("Hanya JPG / PNG / TIFF yang didukung.", "err");
    addPhotoPaths(out);
  });

  /* ---------------- order ---------------- */
  function renderSizePresets() {
    var sel = $("#sizePreset");
    sel.innerHTML = "";
    S.sizes.forEach(function (s) {
      var o = el("option");
      o.value = s.id;
      o.textContent = sizeOptionText(s.label, s.width, s.height);
      sel.appendChild(o);
    });
  }

  function renderOrder() {
    var wrap = $("#orderList");
    var st = S.get();
    wrap.innerHTML = "";
    $("#orderHint").style.display = st.items.length ? "none" : "block";

    var showSrc = st.photos.length > 1;

    st.items.forEach(function (it) {
      var row = el("div", "order-row" + (showSrc ? " has-src" : ""));
      var opts = st.photos.map(function (p) {
        return '<option value="' + esc(p.id) + '"' + (p.id === it.sourceId ? " selected" : "") + '>' + esc(p.name) + "</option>";
      }).join("");
      row.innerHTML =
        '<span class="tag">' + esc(it.label) + "</span>" +
        '<input class="input w" type="number" step="1" min="5" value="' + it.width + '" title="Lebar (mm)" />' +
        '<input class="input h" type="number" step="1" min="5" value="' + it.height + '" title="Tinggi (mm)" />' +
        '<input class="input q" type="number" step="1" min="1" value="' + it.quantity + '" title="Quantity" />' +
        (showSrc ? '<select class="input src">' + (opts || '<option value="">\u2014 pilih foto \u2014</option>') + "</select>" : "") +
        '<button class="x" title="Hapus baris"><svg class="ic"><use xlink:href="#i-trash"/></svg></button>';

      row.querySelector(".w").onchange = function (e) { it.width = Number(e.target.value) || 10; S.save(); preview(); };
      row.querySelector(".h").onchange = function (e) { it.height = Number(e.target.value) || 10; S.save(); preview(); };
      row.querySelector(".q").onchange = function (e) { it.quantity = Math.max(0, parseInt(e.target.value, 10) || 0); S.save(); preview(); };
      if (showSrc) row.querySelector(".src").onchange = function (e) { it.sourceId = e.target.value; S.save(); preview(); };
      row.querySelector(".x").onclick = function () { S.removeItem(it.id); renderOrder(); preview(); };
      attachSpinner(row.querySelector(".w"));
      attachSpinner(row.querySelector(".h"));
      attachSpinner(row.querySelector(".q"));
      wrap.appendChild(row);
    });

    renderSizeTargetSelect("#bgSizeTarget");
    renderSizeTargetSelect("#capSizeTarget");
  }

  /* dropdown "Terapkan ke Ukuran Ini" - dipakai bareng oleh blok Ganti
     Background (#bgSizeTarget) dan blok Font & Kerning Label
     (#capSizeTarget) - diambil dari daftar ukuran yang sedang dipakai di
     Order Ukuran, unik per sizeId. */
  function renderSizeTargetSelect(selector) {
    var sel = $(selector);
    if (!sel) return;
    var st = S.get();
    var seen = {}, opts = [];
    st.items.forEach(function (it) {
      if (seen[it.sizeId]) return;
      seen[it.sizeId] = true;
      opts.push(it);
    });
    sel.innerHTML = opts.length
      ? opts.map(function (it) {
          return '<option value="' + esc(it.sizeId) + '">' + esc(sizeOptionText(it.label, it.width, it.height)) + "</option>";
        }).join("")
      : '<option value="">\u2014 tidak ada ukuran \u2014</option>';
  }

  $("#btnAddItem").onclick = function () {
    S.addItem($("#sizePreset").value);
    renderOrder(); preview();
  };

  /* paket cetak foto: isi cepat qty default 4x6=4, 3x4=4, 2x3=6 */
  var PRINT_PACKAGE = [
    { sizeId: "4x6", quantity: 4 },
    { sizeId: "3x4", quantity: 4 },
    { sizeId: "2x3", quantity: 6 }
  ];
  $("#btnPrintPackage").onclick = function () {
    var st = S.get();
    PRINT_PACKAGE.forEach(function (p) {
      var existing = st.items.filter(function (it) { return it.sizeId === p.sizeId; })[0];
      if (existing) existing.quantity = p.quantity;
      else S.addItem(p.sizeId);
    });
    S.save();
    renderOrder(); preview();
    toast("Paket cetak foto diterapkan.", "ok");
  };

  /* ---------------- options ---------------- */
  function bindOptions() {
    var st = S.get();
    $("#mediaType").value = st.media.type;
    $("#orientation").value = st.media.orientation;
    $("#margin").value = st.media.margin;
    $("#gap").value = st.media.gap;
    $("#customWidth").value = st.media.customWidth;
    $("#customHeight").value = st.media.customHeight;
    $("#customSizeFields").style.display = (st.media.type === "CUSTOM") ? "" : "none";
    $("#offsetBorder").value = st.options.offsetBorder;
    $("#noBorder").checked = !!st.options.noBorder;
    $("#offsetBorder").disabled = !!st.options.noBorder;
    $("#rotateMode").value = st.options.rotateMode;
    $("#cutGuide").checked = !!st.options.cutGuide;
    $("#artboards").checked = st.options.artboards !== false;
    $("#replacePrev").checked = st.options.replacePrev !== false;
    $$("input[name=\"grouping\"]").forEach(function (r) { r.checked = (r.value === st.options.grouping); });
    $$("input[name=\"fitMode\"]").forEach(function (r) { r.checked = (r.value === (st.options.fitMode || "fill")); });
    $$("input[name=\"position\"]").forEach(function (r) {
      r.checked = (r.value === (st.options.position || "center"));
      r.closest(".pos-radio").classList.toggle("active", r.checked);
    });

    function on(id, fn) { $(id).onchange = function (e) { fn(e.target); S.save(); preview(); }; }
    on("#mediaType", function (t) {
      st.media.type = t.value;
      $("#customSizeFields").style.display = (t.value === "CUSTOM") ? "" : "none";
    });
    on("#orientation", function (t) { st.media.orientation = t.value; });
    on("#margin", function (t) { st.media.margin = Number(t.value) || 0; });
    on("#gap", function (t) { st.media.gap = Number(t.value) || 0; });
    on("#customWidth", function (t) { st.media.customWidth = Math.max(10, Number(t.value) || 210); });
    on("#customHeight", function (t) { st.media.customHeight = Math.max(10, Number(t.value) || 297); });
    on("#offsetBorder", function (t) { st.options.offsetBorder = Number(t.value) || 0; });
    on("#noBorder", function (t) { st.options.noBorder = t.checked; $("#offsetBorder").disabled = t.checked; });
    on("#rotateMode", function (t) { st.options.rotateMode = t.value; });
    on("#cutGuide", function (t) { st.options.cutGuide = t.checked; });
    on("#artboards", function (t) { st.options.artboards = t.checked; });
    on("#replacePrev", function (t) { st.options.replacePrev = t.checked; });
    $$("input[name=\"grouping\"]").forEach(function (r) {
      r.onchange = function () { if (r.checked) { st.options.grouping = r.value; S.save(); } };
    });
    $$("input[name=\"fitMode\"]").forEach(function (r) {
      r.onchange = function () { if (r.checked) { st.options.fitMode = r.value; S.save(); } };
    });
    $$("input[name=\"position\"]").forEach(function (r) {
      r.onchange = function () {
        if (!r.checked) return;
        st.options.position = r.value;
        $$("input[name=\"position\"]").forEach(function (o) { o.closest(".pos-radio").classList.toggle("active", o.checked); });
        S.save();
        preview();
      };
    });

    attachSpinner($("#margin"));
    attachSpinner($("#gap"));
    attachSpinner($("#customWidth"));
    attachSpinner($("#customHeight"));
    attachSpinner($("#offsetBorder"));
  }

  /* ---------------- tab bar (Setup / Slot Editor) ----------------
     Tab bar di-pin (position:sticky) tepat di bawah topbar lewat CSS
     var --topbar-h (lihat theme.css). Topbar bisa berubah tinggi
     (topbar-actions boleh wrap ke baris ke-2 di panel sempit), jadi
     nilainya diukur ulang dari DOM tiap kali panel resize supaya
     tab-bar selalu menempel pas tanpa celah/tabrakan. */
  function syncTopbarHeight() {
    var tb = $(".topbar");
    if (!tb) return;
    document.documentElement.style.setProperty("--topbar-h", tb.offsetHeight + "px");
  }

  /* TAB_PANELS: peta nama tab -> id panel/tombolnya. "label" (tab Label
     teks caption) ditambahkan di sini saja - switchTab() generik untuk
     jumlah tab berapa pun, tidak perlu diubah lagi kalau nanti nambah tab. */
  var TAB_PANELS = {
    setup: { panel: "tabSetup", btn: "tabBtnSetup" },
    editor: { panel: "tabEditor", btn: "tabBtnEditor" },
    label: { panel: "tabLabel", btn: "tabBtnLabel" }
  };
  function switchTab(name) {
    Object.keys(TAB_PANELS).forEach(function (key) {
      var t = TAB_PANELS[key];
      var isActive = key === name;
      $("#" + t.panel).classList.toggle("active", isActive);
      $("#" + t.btn).classList.toggle("active", isActive);
      $("#" + t.btn).setAttribute("aria-selected", String(isActive));
    });
    /* preview-box bisa saja sempat digambar ulang (mis. lewat popup
       "Buat Dokumen Baru" atau tombol Reset di topbar, keduanya tetap
       bisa dipicu walau tab Setup sedang tidak aktif) selagi #tabSetup
       disembunyikan (display:none -> clientWidth 0). Gambar ulang di
       sini supaya preview selalu memakai lebar asli begitu tab Setup
       terlihat lagi, bukan fallback 320px di preview(). */
    if (name === "setup") preview();
  }
  $("#tabBtnSetup").onclick = function () { switchTab("setup"); };
  $("#tabBtnEditor").onclick = function () { switchTab("editor"); };
  $("#tabBtnLabel").onclick = function () { switchTab("label"); };

  /* ---------------- media & layout panel (collapsible, default tersembunyi) ---------------- */
  $("#mediaLayoutToggle").onclick = function () {
    var body = $("#mediaLayoutBody");
    var open = !body.classList.contains("open");
    body.classList.toggle("open", open);
    $("#mediaLayoutToggle").setAttribute("aria-expanded", String(open));
  };

  /* ---------------- structure panel (collapsible, default tersembunyi) ---------------- */
  $("#structureToggle").onclick = function () {
    var body = $("#structureBody");
    var open = !body.classList.contains("open");
    body.classList.toggle("open", open);
    $("#structureToggle").setAttribute("aria-expanded", String(open));
  };

  /* ---------------- tab Label (caption) ----------------
     Render field global + daftar override per foto/per baris Order Ukuran.
     Dipanggil dari preview() (lihat di bawah) supaya selalu sinkron begitu
     ada foto/baris ditambah-hapus atau teksnya diubah - input pakai
     onchange (bukan oninput) persis seperti field ".nm" (nama foto),
     supaya rebuild DOM di sini tidak memutus fokus user saat sedang
     mengetik (baru rebuild setelah blur/Enter). */
  function renderCaptionTab(st) {
    st = st || S.get();
    var c = st.caption;

    $("#capEnabled").checked = !!c.enabled;
    $("#capText").value = c.text || "";
    $("#capHeight").value = c.heightMm;
    $("#capFontSize").value = c.fontSize;
    $("#capBold").checked = !!c.bold;
    $("#capUppercase").checked = !!c.uppercase;
    var body = $("#capBody");
    if (body) body.classList.toggle("disabled", !c.enabled);

    $("#capEnabled").onchange = function (e) { c.enabled = e.target.checked; S.save(); preview(); };
    $("#capText").onchange = function (e) { c.text = e.target.value; S.save(); preview(); };
    $("#capHeight").onchange = function (e) { c.heightMm = Math.max(1, Number(e.target.value) || 8); S.save(); preview(); };
    $("#capFontSize").onchange = function (e) { c.fontSize = Math.max(3, Number(e.target.value) || 7); S.save(); preview(); };
    $("#capBold").onchange = function (e) { c.bold = e.target.checked; S.save(); preview(); };
    $("#capUppercase").onchange = function (e) { c.uppercase = e.target.checked; S.save(); preview(); };
    attachSpinner($("#capHeight"));
    attachSpinner($("#capFontSize"));

    var photoWrap = $("#capPhotoList");
    if (photoWrap) {
      photoWrap.innerHTML = "";
      if (!st.photos.length) {
        photoWrap.appendChild(el("p", "hint", "Belum ada foto sumber."));
      }
      st.photos.forEach(function (p) {
        var row = el("div", "cap-override-row");
        row.innerHTML =
          '<span class="cap-override-name" title="' + esc(p.path) + '">' + esc(p.name) + "</span>" +
          '<input class="input cap-override-input" type="text" placeholder="\u2014 pakai teks global \u2014" value="' + esc(p.captionText || "") + '" />';
        row.querySelector(".cap-override-input").onchange = function (e) {
          S.setPhotoCaption(p.id, e.target.value);
          preview();
        };
        photoWrap.appendChild(row);
      });
    }

    var itemWrap = $("#capItemList");
    if (itemWrap) {
      itemWrap.innerHTML = "";
      if (!st.items.length) {
        itemWrap.appendChild(el("p", "hint", "Belum ada baris Order Ukuran."));
      }
      st.items.forEach(function (it) {
        var row = el("div", "cap-override-row");
        row.innerHTML =
          '<span class="cap-override-name">' + esc(it.label) + " (" + it.width + "\u00d7" + it.height + "mm)</span>" +
          '<input class="input cap-override-input" type="text" placeholder="\u2014 pakai teks foto/global \u2014" value="' + esc(it.captionText || "") + '" />';
        row.querySelector(".cap-override-input").onchange = function (e) {
          it.captionText = e.target.value; S.save(); preview();
        };
        itemWrap.appendChild(row);
      });
    }
  }

  /* ---------------- preview ---------------- */
  function preview() {
    var box = $("#preview");
    var msg = $("#previewMsg");
    box.innerHTML = "";
    msg.textContent = "";
    msg.className = "msg";
    lastLayout = null;

    var st = S.get();
    renderCaptionTab(st);
    if (!st.items.length) { msg.textContent = "Tambahkan minimal satu ukuran."; return; }

    var missing = st.items.filter(function (i) { return i.quantity > 0 && !i.sourceId; });
    if (missing.length) {
      msg.className = "msg err";
      msg.textContent = "Ada baris tanpa foto sumber. Pilih foto pada setiap ukuran.";
      return;
    }

    var layout;
    try { layout = L.generate(S.buildJob()); }
    catch (e) { msg.className = "msg err"; msg.textContent = e.message; return; }

    lastLayout = layout;

    /* FIX: Hitung lebar tersedia lebih aman.
       Sebelumnya memakai box.clientWidth - padding - 6, yang terlalu
       mepet sehingga sheet bisa terpotong. Sekarang kurangi extra
       margin 24px (2x10px padding + 4px buffer) untuk memastikan sheet
       selalu muat termasuk border dan scrollbar. */
    var RV_W = 30;
    var rawW = box.clientWidth || 320;
    var availW = Math.max(120, rawW - RV_W - 24);

    layout.sheets.forEach(function (sheet) {
      var scale = Math.min(availW / sheet.width, 3.2);
      var wPx = Math.round(sheet.width * scale);
      var hPx = Math.round(sheet.height * scale);

      var blockEl = el("div", "sheet-block");
      blockEl.appendChild(el("div", "sheet-caption",
        "Sheet " + sheet.index + " \u00b7 " + sheet.slots.length + " foto \u00b7 " + sheet.efficiency.toFixed(1) + "%"));

      var stage = el("div", "sheet-stage");

      var hRuler = el("div", "ruler-h");
      hRuler.style.width = wPx + "px";
      hRuler.style.marginLeft = RV_W + "px";
      hRuler.innerHTML = '<span class="ruler-arrow">\u25c0</span><span class="ruler-line"></span><span class="ruler-arrow">\u25b6</span>';
      stage.appendChild(hRuler);

      var row = el("div", "stage-row");

      var vRuler = el("div", "ruler-v");
      vRuler.style.height = hPx + "px";
      vRuler.style.width = RV_W + "px";
      vRuler.innerHTML =
        '<span class="rv-label">' + sheet.height + " mm</span>" +
        '<span class="rv-arrows"><span class="ruler-arrow">\u25b2</span><span class="rv-line"></span><span class="ruler-arrow">\u25bc</span></span>';
      row.appendChild(vRuler);

      var page = el("div", "sheet");
      page.style.width = wPx + "px";
      page.style.height = hPx + "px";

      var mSide = Math.round((sheet.margin || 0) * scale);
      var mTop = Math.round((sheet.marginTop != null ? sheet.marginTop : (sheet.margin || 0)) * scale);
      if (mSide > 0 || mTop > 0) {
        var guide = el("div", "sheet-guide");
        guide.style.left = mSide + "px"; guide.style.top = mTop + "px";
        guide.style.right = mSide + "px"; guide.style.bottom = mSide + "px";
        page.appendChild(guide);
      }

      sheet.slots.forEach(function (s) {
        var d = el("div", "slot" + (s.rotation ? " rot" : ""));
        d.style.left = (s.x * scale) + "px";
        d.style.top = (s.y * scale) + "px";
        d.style.width = (s.width * scale) + "px";
        d.style.height = (s.height * scale) + "px";

        var photo = S.get().photos.filter(function (p) { return p.path === s.sourcePath; })[0];

        var rot = ((Number(s.rotation) || 0) % 360 + 360) % 360;
        var swapped = (rot % 180) !== 0;
        var pw = swapped ? s.height : s.width;
        var ph = swapped ? s.width : s.height;

        var photoEl = el("div", "slot-photo");
        photoEl.style.width = (pw * scale) + "px";
        photoEl.style.height = (ph * scale) + "px";
        photoEl.style.transform = "translate(-50%,-50%)" + (rot ? " rotate(" + rot + "deg)" : "");
        if (photo && isRenderable(photo.path)) {
          photoEl.style.backgroundImage = "url('" + (photo.thumb || fileUrl(photo.path)) + "')";
          photoEl.style.backgroundColor = (photo && photo.bg) ? photo.bg : "transparent";
        } else {
          photoEl.style.background = (photo && photo.color) || "#8aa";
        }
        d.appendChild(photoEl);

        /* overlay bar caption (kalau aktif & slot ini punya teks hasil
           resolusi) - hanya perkiraan visual, bukan render presisi (yang
           presisi ada di host/main.jsx saat Generate); cukup untuk
           mengecek dari Preview kalau labelnya sudah muncul di slot yang
           benar sebelum benar-benar generate ke Illustrator. */
        if (layout.caption && layout.caption.enabled && s.captionText) {
          var capMm = Math.max(0, Number(layout.caption.heightMm) || 8);
          var capPx = capMm * scale;
          if (capPx > 1) {
            var capEl = el("div", "slot-caption");
            capEl.style.height = Math.round(capPx) + "px";
            capEl.textContent = s.captionText;
            d.appendChild(capEl);
          }
        }

        d.title = s.label + " " + s.physicalWidth + "\u00d7" + s.physicalHeight + "mm" + (s.rotation ? " (rotasi 90\u00b0)" : "");
        page.appendChild(d);
      });

      if (!(layout.options && layout.options.noBorder)) {
        sheet.slots.forEach(function (s) {
          var ob = Math.max(0, Number(s.offsetBorder) || 0);
          var bd = el("div", "slot-border");
          bd.style.left = ((s.x - ob) * scale) + "px";
          bd.style.top = ((s.y - ob) * scale) + "px";
          bd.style.width = ((s.width + 2 * ob) * scale) + "px";
          bd.style.height = ((s.height + 2 * ob) * scale) + "px";
          page.appendChild(bd);
        });
      }

      row.appendChild(page);
      stage.appendChild(row);
      blockEl.appendChild(stage);
      box.appendChild(blockEl);
    });

    msg.className = "msg ok";
    msg.textContent = "Efisiensi " + layout.efficiency.toFixed(1) + "% \u00b7 " +
      layout.placed + "/" + layout.totalSlots + " foto tersusun pada " + layout.sheets.length + " lembar.";
    if (layout.unplaced > 0) {
      msg.className = "msg err";
      msg.textContent += " (" + layout.unplaced + " foto tidak muat!)";
    }
  }

  $("#btnPreview").onclick = preview;

  /* ---------------- generate ---------------- */
  $("#btnGenerate").onclick = function () {
    if (!lastLayout) preview();
    if (!lastLayout) return toast("Layout belum siap.", "err");
    if (!B.isCEP) return toast("Buka panel di dalam Illustrator untuk generate.", "err");

    var st = S.get();
    var btn = $("#btnGenerate");
    /* FIX: tombol #btnGenerate terdiri dari 2 <span> terpisah
       (.btn-generate-label + .btn-generate-icon) yang di-style theme.css
       menjadi bentuk pill dengan kapsul ikon menempel di ujung kanan
       (lihat CSS #btnGenerate.btn.primary). Sebelumnya kode ini memakai
       btn.textContent = "..." untuk menampilkan status "Generating..." /
       mengembalikan label semula - ini MENIMPA SELURUH isi HTML tombol
       (kedua span ikut terhapus, diganti satu text node polos), sehingga
       struktur pill + kapsul ikon hilang begitu tombol pernah dipakai
       sekali. Perbaikan: hanya ubah teks di dalam span label-nya saja,
       span ikon (dan seluruh struktur/CSS pill) tidak pernah disentuh -
       tampilan tombol jadi tetap konsisten seperti saat pertama kali
       di-load, sebelum maupun sesudah generate. */
    var btnLabel = btn.querySelector(".btn-generate-label");
    btn.disabled = true;
    if (btnLabel) btnLabel.textContent = "Generating\u2026";
    else btn.textContent = "\u23f3 Generating\u2026";

    B.call("generate", {
      layout: lastLayout,
      grouping: st.options.grouping,
      artboards: st.options.artboards !== false,
      replace: st.options.replacePrev !== false
    }, function (res) {
      btn.disabled = false;
      if (btnLabel) btnLabel.textContent = "Generate ke Illustrator";
      else btn.textContent = "\u26a1 Generate ke Illustrator";
      toast(res.message, res.ok ? "ok" : "err");
    });
  };

  $("#btnUngroup").onclick = function () {
    if (!B.isCEP) return toast("Hanya tersedia di dalam Illustrator.", "err");
    B.call("ungroupAll", {}, function (res) { toast(res.message, res.ok ? "ok" : "err"); });
  };

  $("#btnResetArtboard").onclick = function () {
    if (!B.isCEP) return toast("Hanya tersedia di dalam Illustrator.", "err");
    var btn = $("#btnResetArtboard");
    btn.disabled = true;
    B.call("resetArtboard", {}, function (res) {
      btn.disabled = false;
      toast(res.message, res.ok ? "ok" : "err");
      refreshSelection(true);
    });
  };

  $("#btnUndo").onclick = function () {
    B.call("undo", {}, function (res) { toast(res.message, res.ok ? "ok" : "err"); });
  };

  /* ---------------- modal: buat dokumen baru (pilih ukuran A4/A5) ----------------
     Sebelumnya tombol "Doc" langsung membuat dokumen sesuai ukuran yang aktif
     di dropdown Media & Layout (step 3). Sekarang selalu munculkan popup agar
     user memilih tegas antara A4 atau A5 sebelum dokumen dibuat, terlepas dari
     apa pun yang sedang dipilih di dropdown Media. */
  function openCreateDocModal() {
    var modal = $("#createDocModal");
    if (!modal) return;
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add("open"); });
  }
  function closeCreateDocModal() {
    var modal = $("#createDocModal");
    if (!modal) return;
    modal.classList.remove("open");
    setTimeout(function () { modal.hidden = true; }, 160);
  }
  function runCreateDocument(sizeType) {
    var st = S.get();
    var btn = $("#btnCreateDoc");
    var label = btn.querySelector("span");
    var labelText = label ? label.textContent : "";
    btn.disabled = true;
    if (label) label.textContent = "\u2026";
    B.call("createDocument", {
      media: {
        type: sizeType,
        orientation: st.media.orientation,
        customWidth: st.media.customWidth,
        customHeight: st.media.customHeight
      }
    }, function (res) {
      btn.disabled = false;
      if (label) label.textContent = labelText;
      toast(res.message, res.ok ? "ok" : "err");
    });
  }
  /* Sinkronkan ukuran yang dipilih di popup (A4/A5) ke dropdown Media di
     card "Media & Layout" (step 3), supaya keduanya selalu sama begitu
     dokumen dibuat lewat popup. Fungsi ini HANYA dipanggil dari pilihan
     popup (yang memang cuma berisi A4 & A5) - ukuran lain di dropdown
     Media (A3, A6, Letter, 4R, dst) tetap sepenuhnya independen dan hanya
     bisa diubah langsung dari card Media & Layout seperti biasa. */
  function syncMediaTypeFromModal(sizeType) {
    var st = S.get();
    st.media.type = sizeType;
    S.save();
    bindOptions();
    preview();
  }

  $("#btnCreateDoc").onclick = function () {
    if (!B.isCEP) return toast("Hanya tersedia di dalam Illustrator.", "err");
    if ($("#btnCreateDoc").disabled) return;
    openCreateDocModal();
  };
  $("#createDocModalClose").onclick = closeCreateDocModal;
  $("#createDocModalCancel").onclick = closeCreateDocModal;
  $("#createDocModal").onclick = function (e) {
    if (e.target === $("#createDocModal")) closeCreateDocModal();
  };
  $$(".size-choice").forEach(function (b) {
    b.onclick = function () {
      var size = b.getAttribute("data-size");
      closeCreateDocModal();
      syncMediaTypeFromModal(size);
      runCreateDocument(size);
    };
  });

  $("#btnPrint").onclick = function () {
    if (!B.isCEP) return toast("Hanya tersedia di dalam Illustrator.", "err");
    var btn = $("#btnPrint");
    btn.disabled = true;
    B.call("print", {}, function (res) {
      btn.disabled = false;
      toast(res.message, res.ok ? "ok" : "err");
    });
  };

  /* ---------------- reset ---------------- */
  $("#btnReset").onclick = function () {
    S.reset();
    renderSizePresets();
    renderPhotos();
    renderOrder();
    bindOptions();
    pendingBg = "";
    renderEditBgSwatches();
    preview();
    toast("Semua parameter direset ke default.", "ok");
  };

  /* ---------------- editor ---------------- */
  function setEditorEnabled(on) {
    $("#editorBody").className = "editor" + (on ? "" : " disabled");
  }

  /* indikator kecil warna background TERKINI dari slot yang sedang
     terpilih - dibaca ulang dari dokumen lewat selectionInfo (field
     backgroundColor/bgColors/bgMixed, lihat host/main.jsx), BUKAN dari
     pendingBg (yang cuma warna yang lagi dipilih di swatch, belum tentu
     sudah diterapkan). Dipanggil dari refreshSelection supaya area Slot
     Editor langsung menunjukkan hasil background terbaru setiap kali
     seleksi berubah ATAU setelah tombol "Terapkan ke Slot Terpilih" /
     "Terapkan ke Ukuran Ini" diklik - tanpa perlu lihat langsung ke
     kanvas Illustrator. */
  function bgLiveIndicatorHtml(d) {
    if (d.bgMixed) {
      return '<div class="bg-live"><span class="bg-live-dot mixed" title="Warna background berbeda-beda di antara slot terpilih"></span>' +
        '<span>Background saat ini: <b>campuran</b> (' + d.bgColors.length + ' warna)</span></div>';
    }
    var hex = d.backgroundColor || "";
    var label = hex ? hex : "Transparan";
    var style = hex ? ' style="background:' + esc(hex) + '"' : "";
    return '<div class="bg-live"><span class="bg-live-dot' + (hex ? "" : " none") + '"' + style + '></span>' +
      '<span>Background saat ini: <b>' + esc(label) + '</b></span></div>';
  }

  /* Indikator ukuran font & tracking label SAAT INI - cuma ditampilkan
     kalau tepat SATU slot terpilih dan slot itu punya label aktif (untuk
     seleksi banyak slot, nilainya bisa beda-beda per slot jadi tidak
     ditampilkan, sama seperti alasan bgMixed di atas hanya menghitung
     jumlah warna, bukan menampilkan angka tunggal). */
  function capLiveIndicatorHtml(d) {
    if (d.count > 1 || !d.captionEnabled) return "";
    var fs = (typeof d.captionFontSize === "number") ? (Math.round(d.captionFontSize * 10) / 10) + "pt" : "\u2014";
    var trk = (typeof d.captionTracking === "number") ? d.captionTracking : 0;
    return '<div class="bg-live"><span class="bg-live-dot" style="background:#7be7c3"></span>' +
      "<span>Label saat ini: <b>" + esc(fs) + "</b> \u00b7 tracking <b>" + esc(String(trk)) + "</b></span></div>";
  }

  function refreshSelection(silent) {
    if (!B.isCEP) { setEditorEnabled(false); setBgApplySelEnabled(false); return; }
    B.call("selectionInfo", {}, function (res) {
      var info = $("#selInfo");
      if (!res.ok || !res.data || !res.data.count) {
        info.className = "sel-info empty";
        info.textContent = "Tidak ada slot terpilih di Illustrator.";
        setEditorEnabled(false);
        setBgApplySelEnabled(false);
        if (!silent && res.message) toast(res.message);
        return;
      }
      var d = res.data;
      info.className = "sel-info";
      info.innerHTML = (d.count > 1
        ? "<b>" + d.count + " slot terpilih</b> \u2014 mode batch, semua aksi diterapkan sekaligus."
        : "<b>" + esc(d.label || d.slotId) + "</b> \u00b7 " + esc(d.size) +
          " \u00b7 rot " + (d.rotation || 0) + "\u00b0 \u00b7 zoom " + ((d.crop && d.crop.scale) || 100) + "%" +
          "<br><small style='color:#9a9a9a'>" + esc(d.sourcePath || "") + "</small>") +
        bgLiveIndicatorHtml(d) + capLiveIndicatorHtml(d);
      setEditorEnabled(true);
      setBgApplySelEnabled(true);
    });
  }

  function setBgApplySelEnabled(on) {
    var btn = $("#btnBgApplySel");
    if (btn) btn.disabled = !on;
  }

  $("#btnRefreshSel").onclick = function () { refreshSelection(false); };

  $$("[data-nudge]").forEach(function (b) {
    b.onclick = function () {
      var v = b.getAttribute("data-nudge").split(",");
      B.call("nudge", { dx: Number(v[0]), dy: Number(v[1]) }, function (r) { toast(r.message, r.ok ? "ok" : "err"); });
    };
  });
  $$("[data-crop]").forEach(function (b) {
    b.onclick = function () {
      var v = b.getAttribute("data-crop").split(",");
      B.call("crop", { dx: Number(v[0]), dy: Number(v[1]) }, function (r) { toast(r.message, r.ok ? "ok" : "err"); });
    };
  });
  $$("[data-zoom]").forEach(function (b) {
    b.onclick = function () {
      B.call("crop", { scale: Number(b.getAttribute("data-zoom")) }, function (r) { toast(r.message, r.ok ? "ok" : "err"); });
    };
  });
  $$("[data-dup]").forEach(function (b) {
    b.onclick = function () {
      B.call("duplicateSlot", { dir: b.getAttribute("data-dup") }, function (r) { toast(r.message, r.ok ? "ok" : "err"); });
    };
  });
  /* Font & Kerning Label (slot terpilih) - data-cap-font/data-cap-track
     berisi DELTA (mis. "-0.5", "1", "-20", "20"), ditambahkan ke ukuran
     yang sedang aktif di artboard sekarang, bukan nilai absolut - sama
     seperti pola data-zoom di atas. */
  $$("[data-cap-font]").forEach(function (b) {
    b.onclick = function () {
      B.call("captionAdjust", { fontSize: Number(b.getAttribute("data-cap-font")) }, function (r) { toast(r.message, r.ok ? "ok" : "err"); refreshSelection(true); });
    };
  });
  $$("[data-cap-track]").forEach(function (b) {
    b.onclick = function () {
      B.call("captionAdjust", { tracking: Number(b.getAttribute("data-cap-track")) }, function (r) { toast(r.message, r.ok ? "ok" : "err"); refreshSelection(true); });
    };
  });
  $("#btnCapReset").onclick = function () { B.call("captionAdjust", { reset: true }, function (r) { toast(r.message, r.ok ? "ok" : "err"); refreshSelection(true); }); };
  $("#btnCapApplySize").onclick = function () {
    if (!B.isCEP) return toast("Hanya tersedia di dalam Illustrator.", "err");
    var sizeId = $("#capSizeTarget").value;
    if (!sizeId) return toast("Tidak ada ukuran untuk diterapkan.", "err");
    var fontSize = Number($("#capSizeFontDelta").value) || 0;
    var tracking = Number($("#capSizeTrackDelta").value) || 0;
    if (!fontSize && !tracking) return toast("Isi delta ukuran font atau tracking dulu.", "err");
    B.call("captionAdjustBySize", { sizeId: sizeId, fontSize: fontSize, tracking: tracking }, function (r) { toast(r.message, r.ok ? "ok" : "err"); refreshSelection(true); });
  };

  $("#btnResetCrop").onclick = function () { B.call("crop", { reset: true }, function (r) { toast(r.message, r.ok ? "ok" : "err"); }); };
  $("#btnFlipH").onclick = function () { B.call("flip", { horizontal: true }, function (r) { toast(r.message, r.ok ? "ok" : "err"); }); };
  $("#btnFlipV").onclick = function () { B.call("flip", { vertical: true }, function (r) { toast(r.message, r.ok ? "ok" : "err"); }); };
  $("#btnRotate").onclick = function () { B.call("rotate90", {}, function (r) { toast(r.message, r.ok ? "ok" : "err"); }); };
  $("#btnDelete").onclick = function () {
    B.call("deleteSlot", {}, function (r) { toast(r.message, r.ok ? "ok" : "err"); refreshSelection(true); });
  };
  $("#btnReplace").onclick = function () {
    B.call("pickFiles", {}, function (res) {
      if (!res.ok || !res.data || !res.data.files.length) return;
      var f = res.data.files[0];
      B.call("replacePhoto", { path: f.path, sourceId: f.name }, function (r) { toast(r.message, r.ok ? "ok" : "err"); });
    });
  };

  /* ---------------- ganti background (slot yang sudah di-generate) ---------------- */
  function renderEditBgSwatches() {
    var wrap = $("#editBgSwatches");
    if (!wrap) return;
    var presetValues = S.bgPresets.map(function (bp) { return bp.value; });
    var isCustom = pendingBg !== "" && presetValues.indexOf(pendingBg) === -1;
    var html = S.bgPresets.map(function (bp) {
      var active = (pendingBg === bp.value) ? " active" : "";
      var noneCls = (bp.value === "") ? " none" : "";
      var style = bp.value ? ' style="background:' + esc(bp.value) + '"' : "";
      return '<button type="button" class="bg-swatch' + noneCls + active + '" data-bg="' + esc(bp.value) + '" title="' + esc(bp.label) + '"' + style + '></button>';
    }).join("");
    html += '<label class="bg-custom' + (isCustom ? " active" : "") + '" title="Warna custom">' +
      '<input type="color" value="' + esc(isCustom ? pendingBg : "#ffffff") + '" /></label>';
    wrap.innerHTML = html;

    Array.prototype.forEach.call(wrap.querySelectorAll("[data-bg]"), function (btn) {
      btn.onclick = function () { pendingBg = btn.getAttribute("data-bg"); renderEditBgSwatches(); };
    });
    var customInput = wrap.querySelector(".bg-custom input");
    customInput.oninput = function (e) { pendingBg = e.target.value; };
    customInput.onchange = function () { renderEditBgSwatches(); };
  }

  $("#btnBgApplySel").onclick = function () {
    if (!B.isCEP) return toast("Hanya tersedia di dalam Illustrator.", "err");
    B.call("setBackground", { hex: pendingBg }, function (r) { toast(r.message, r.ok ? "ok" : "err"); refreshSelection(true); });
  };
  $("#btnBgApplySize").onclick = function () {
    if (!B.isCEP) return toast("Hanya tersedia di dalam Illustrator.", "err");
    var sizeId = $("#bgSizeTarget").value;
    if (!sizeId) return toast("Tidak ada ukuran untuk diterapkan.", "err");
    /* refreshSelection(true) ditambahkan di sini juga (sebelumnya hanya
       ada di btnBgApplySel) - kalau slot yang sedang terpilih kebetulan
       termasuk ukuran yang baru saja diterapkan, indikator background
       di #selInfo ikut ter-update tanpa perlu klik Refresh manual. */
    B.call("setBackgroundBySize", { sizeId: sizeId, hex: pendingBg }, function (r) { toast(r.message, r.ok ? "ok" : "err"); refreshSelection(true); });
  };

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var cdModal = $("#createDocModal");
      if (cdModal && !cdModal.hidden) { closeCreateDocModal(); return; }
    }
    if (!e.altKey) return;
    var map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    var d = map[e.key];
    if (!d) return;
    e.preventDefault();
    B.call("nudge", { dx: d[0], dy: d[1] }, function () {});
  });

  /* ---------------- init ---------------- */
  function init() {
    /* FIX 3: Selalu render preset ukuran dari S.sizes (termasuk 2R-8R)
       SEBELUM cek items, supaya dropdown selalu lengkap. */
    renderSizePresets();
    renderPhotos();
    if (!S.get().items.length) { S.addItem("4x6"); S.addItem("3x4"); S.addItem("2x3"); }
    renderOrder();
    bindOptions();
    renderEditBgSwatches();
    setBgApplySelEnabled(false);
    preview();

    var info = $("#hostInfo");
    var connected = !!B.isCEP;
    info.textContent = connected ? "Generate" : "Mode browser";
    info.title = connected
      ? "Klik untuk Generate ke Illustrator \u00b7 Terhubung ke " + (B.host.appName || "Illustrator") + " " + (B.host.appVersion || "") + " \u00b7 v2.7.4"
      : "Mode browser (preview saja) \u2014 buka di dalam Illustrator untuk fitur penuh. v2.7.4";
    info.classList.toggle("action", connected);
    /* Delegasi klik ke tombol Generate yang sudah ada, supaya perilakunya
       (preview otomatis kalau belum ada, disable+spinner saat proses,
       toast hasil) 100% sama - tidak duplikasi logic. */
    info.onclick = function () {
      if (!B.isCEP) return;
      var genBtn = $("#btnGenerate");
      if (genBtn && !genBtn.disabled) genBtn.click();
    };
    $$(".logo-dot, .status-dot").forEach(function (d) { d.classList.toggle("off", !connected); });

    if (B.isCEP) {
      B.call("ping", {}, function () {});
      setInterval(function () { refreshSelection(true); }, 1400);
    } else {
      setEditorEnabled(false);
    }
    syncTopbarHeight();
    window.addEventListener("resize", preview);
    window.addEventListener("resize", syncTopbarHeight);
  }

  init();
})();
