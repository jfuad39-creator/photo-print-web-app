/* =====================================================================
 * src/js/app.js - controller Pas Foto Web (TAHAP 1 + TAHAP 2).
 * ---------------------------------------------------------------------
 * ADAPTASI dari client/js/app.js milik plugin CEP.
 *
 * Tahap 1 (form): Sumber Foto, Order Ukuran, Media & Layout - semuanya
 * murni form yang menulis ke state.js, sama seperti versi CEP.
 *
 * Tahap 2 (preview visual): fungsi preview() di bawah adalah PORT dari
 * preview() versi CEP - ternyata sudah DOM/CSS murni (div absolut +
 * background-image utk foto), bukan Illustrator-dependent, jadi bisa
 * dipakai ulang hampir 1:1. Satu-satunya penyesuaian: pencocokan foto
 * per slot lewat sourceId (bukan path filesystem, lihat state.js).
 *
 * SENGAJA BELUM ADA (menyusul di tahap berikutnya, lihat CLAUDE.md):
 *  - Slot editor interaktif (drag/crop/rotate/flip/bg per-slot/duplicate)
 *    - tahap 3.
 *  - Export PDF / print - tahap 4.
 *  - Cut-guide (garis panduan potong) di layar preview - di versi CEP pun
 *    itu cuma digambar ke artboard Illustrator saat Generate, bukan
 *    bagian dari preview panel; ekuivalennya nanti muncul di hasil
 *    export PDF (tahap 4).
 *  - Chroma-key ganti background otomatis (DIPANGKAS dari roadmap -
 *    lihat konteks proyek/CLAUDE.md). Warna background per foto (swatch
 *    solid di kartu Sumber Foto) TETAP ADA - itu bukan chroma-key, cuma
 *    warna polos di belakang PNG transparan, sama seperti versi CEP.
 *
 * Tidak ada koneksi ke Illustrator/CEP sama sekali di file ini - semua
 * foto berupa File object browser biasa (input picker / drag-drop).
 * ===================================================================== */
(function () {
  "use strict";

  var S = window.PFState;
  var L = window.PFLayout;


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
  /* Sama seperti isRenderable() versi CEP: browser (persis seperti
     Chromium CEP-nya dulu) juga tidak bisa menampilkan TIFF lewat
     <img> - butuh placeholder "TIFF" di grid, bukan thumbnail asli. */
  function isRenderable(name) { return /\.(jpe?g|png|gif|bmp|webp)$/i.test(String(name || "")); }

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
      var media = isRenderable(p.name)
        ? '<img class="thumb" src="' + esc(p.thumb) + '" alt="" onerror="this.outerHTML=\'<div class=&quot;ph&quot;>TIFF</div>\'" />'
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
        '<input class="nm" value="' + esc(p.name) + '" title="' + esc(p.name) + '" /></div>' +
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
        p.name = e.target.value; renderOrder();
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

  var ACCEPT_RE = /\.(jpe?g|png|tiff?)$/i;

  function addPhotoFiles(files) {
    if (!files || !files.length) return;
    var added = 0;
    Array.prototype.forEach.call(files, function (f) {
      if (!ACCEPT_RE.test(f.name)) return;
      S.addPhoto(f);
      added++;
    });
    if (!added) { toast("Hanya JPG / PNG / TIFF yang didukung.", "err"); return; }
    var st = S.get();
    st.items.forEach(function (it) {
      if (!it.sourceId && st.photos.length) it.sourceId = st.photos[0].id;
    });
    renderPhotos(); renderOrder(); preview();
    toast(added + " foto ditambahkan.", "ok");
  }

  $("#btnAddPhoto").onclick = function () { $("#filePicker").click(); };
  $("#filePicker").onchange = function (e) {
    addPhotoFiles(e.target.files);
    e.target.value = ""; /* reset supaya pilih file yang sama lagi tetap trigger onchange */
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
    addPhotoFiles(list);
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

      row.querySelector(".w").onchange = function (e) { it.width = Number(e.target.value) || 10; preview(); };
      row.querySelector(".h").onchange = function (e) { it.height = Number(e.target.value) || 10; preview(); };
      row.querySelector(".q").onchange = function (e) { it.quantity = Math.max(0, parseInt(e.target.value, 10) || 0); preview(); };
      if (showSrc) row.querySelector(".src").onchange = function (e) { it.sourceId = e.target.value; preview(); };
      row.querySelector(".x").onclick = function () { S.removeItem(it.id); renderOrder(); preview(); };
      attachSpinner(row.querySelector(".w"));
      attachSpinner(row.querySelector(".h"));
      attachSpinner(row.querySelector(".q"));
      wrap.appendChild(row);
    });
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
    $$("input[name=\"fitMode\"]").forEach(function (r) {
      r.onchange = function () { if (r.checked) { st.options.fitMode = r.value; S.save(); preview(); } };
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

  /* ---------------- media & layout panel (collapsible) ---------------- */
  $("#mediaLayoutToggle").onclick = function () {
    var body = $("#mediaLayoutBody");
    var open = !body.classList.contains("open");
    body.classList.toggle("open", open);
    $("#mediaLayoutToggle").setAttribute("aria-expanded", String(open));
  };
  $("#structureToggle").onclick = function () {
    var body = $("#structureBody");
    var open = !body.classList.contains("open");
    body.classList.toggle("open", open);
    $("#structureToggle").setAttribute("aria-expanded", String(open));
  };

  /* ---------------- slot editor: state modul ----------------
     `slotIndex` dibangun ULANG tiap kali preview() jalan (key: slotId ->
     data resolved + referensi elemen DOM), dipakai bareng oleh drag,
     klik-pilih, dan semua tombol panel editor supaya semuanya baca
     sumber yang sama. */
  var selectedSlotId = null;
  var slotIndex = {};
  var dragState = null;

  /** Gabungkan slot ASLI (hasil PFLayout.generate(), dikunci override
      lewat slotId - lihat state.js) atau slot DUPLIKAT (berdiri sendiri,
      tidak lewat override) jadi satu bentuk data seragam buat dirender
      maupun diedit. rawX/rawY (posisi murni hasil algoritma packing,
      tanpa override) disimpan supaya drag bisa hitung delta yang benar
      tanpa numpuk tiap kali di-drag ulang. */
  function resolveSlot(base, sheetIndex, isDup) {
    if (isDup) {
      return {
        slotId: base.slotId, sheetIndex: sheetIndex, isDup: true,
        x: base.x, y: base.y, rawX: base.x, rawY: base.y,
        width: base.width, height: base.height,
        physicalWidth: base.physicalWidth, physicalHeight: base.physicalHeight,
        rotation: base.rotation, offsetBorder: base.offsetBorder,
        label: base.label, sizeId: base.sizeId,
        sourceId: base.sourceId, backgroundColor: base.backgroundColor || "",
        crop: base.crop, rotationExtra: Number(base.rotationExtra) || 0,
        flipH: !!base.flipH, flipV: !!base.flipV
      };
    }
    var ov = S.getOverride(base.slotId);
    return {
      slotId: base.slotId, sheetIndex: sheetIndex, isDup: false,
      x: base.x + (ov ? ov.dx : 0), y: base.y + (ov ? ov.dy : 0),
      rawX: base.x, rawY: base.y,
      width: base.width, height: base.height,
      physicalWidth: base.physicalWidth, physicalHeight: base.physicalHeight,
      rotation: base.rotation, offsetBorder: base.offsetBorder,
      label: base.label, sizeId: base.sizeId,
      sourceId: (ov && ov.sourceId) || base.sourceId,
      backgroundColor: (ov && ov.backgroundColor !== null && ov.backgroundColor !== undefined) ? ov.backgroundColor : (base.backgroundColor || ""),
      crop: ov ? ov.crop : { x: 0, y: 0, scale: 100 },
      rotationExtra: ov ? Number(ov.rotationExtra) || 0 : 0,
      flipH: ov ? !!ov.flipH : false,
      flipV: ov ? !!ov.flipV : false
    };
  }

  function clampMm(v, max) { return Math.max(0, Math.min(v, Math.max(0, max))); }

  function selectSlot(slotId) {
    if (selectedSlotId && slotIndex[selectedSlotId] && slotIndex[selectedSlotId].slotEl) {
      slotIndex[selectedSlotId].slotEl.classList.remove("selected");
    }
    selectedSlotId = slotId || null;
    if (selectedSlotId && slotIndex[selectedSlotId] && slotIndex[selectedSlotId].slotEl) {
      slotIndex[selectedSlotId].slotEl.classList.add("selected");
    }
    renderEditor();
  }

  /* ---------------- drag: geser posisi slot langsung di preview ----------------
     Dipasang SEKALI di document (bukan per-render) supaya drag tetap
     jalan mulus walau elemen di bawah kursor berganti-ganti tiap
     preview() render ulang. Selama drag, elemen digeser langsung lewat
     style.left/top (tanpa preview() ulang tiap mousemove, biar tidak
     lag) - baru di-commit ke state.js + preview() penuh saat mouseup. */
  function onDocMouseMove(e) {
    if (!dragState) return;
    var dxPx = e.clientX - dragState.startClientX;
    var dyPx = e.clientY - dragState.startClientY;
    if (Math.abs(dxPx) > 3 || Math.abs(dyPx) > 3) dragState.moved = true;
    if (!dragState.moved) return;
    var nx = clampMm(dragState.startX + dxPx / dragState.scale, dragState.sheetW - dragState.width);
    var ny = clampMm(dragState.startY + dyPx / dragState.scale, dragState.sheetH - dragState.height);
    dragState.curX = nx; dragState.curY = ny;
    var info = slotIndex[dragState.slotId];
    if (!info) return;
    if (info.slotEl) { info.slotEl.style.left = (nx * dragState.scale) + "px"; info.slotEl.style.top = (ny * dragState.scale) + "px"; }
    if (info.borderEl) {
      var ob = Number(info.resolved.offsetBorder) || 0;
      info.borderEl.style.left = ((nx - ob) * dragState.scale) + "px";
      info.borderEl.style.top = ((ny - ob) * dragState.scale) + "px";
    }
  }
  function onDocMouseUp() {
    if (!dragState) return;
    var ds = dragState;
    dragState = null;
    if (ds.moved) {
      if (ds.isDup) S.setDuplicatePos(ds.slotId, ds.curX, ds.curY);
      else S.setOverridePos(ds.slotId, ds.curX - ds.startRawX, ds.curY - ds.startRawY);
      selectedSlotId = ds.slotId;
      preview();
    } else {
      selectSlot(ds.slotId);
    }
  }
  document.addEventListener("mousemove", onDocMouseMove);
  document.addEventListener("mouseup", onDocMouseUp);

  /* ---------------- preview visual ----------------
     PORT dari preview() versi CEP - ternyata SUDAH DOM/CSS murni (div
     ber-posisi absolut + background-image utk foto), BUKAN Illustrator-
     dependent sama sekali! Satu-satunya penyesuaian: versi CEP mencocokkan
     foto tiap slot lewat `photo.path === slot.sourcePath` (path filesystem);
     di sini dicocokkan lewat `photo.id === slot.sourceId` karena tidak ada
     path di web (lihat catatan sourcePath di state.js). Cut-guide (garis
     panduan potong magenta) SENGAJA TIDAK digambar di sini - di versi CEP
     pun itu cuma digambar langsung ke artboard Illustrator saat Generate,
     bukan bagian dari preview panel; ekuivalennya di web nanti muncul di
     hasil export PDF (tahap 4), bukan di preview layar.

     TAHAP 3: tiap slot sekarang bisa diklik (pilih -> buka Slot Editor)
     dan di-drag (geser posisi). Override (posisi/crop/rotate/flip/bg/
     ganti foto) dan slot duplikat digabung lewat resolveSlot() di atas
     sebelum dirender - lihat catatan overrides/duplicates di state.js. */
  function preview() {
    var box = $("#preview");
    var msg = $("#previewMsg");
    box.innerHTML = "";
    msg.textContent = "";
    msg.className = "msg";
    slotIndex = {};

    var st = S.get();
    if (!st.items.length) { msg.textContent = "Tambahkan minimal satu ukuran."; renderEditor(); return null; }

    var missing = st.items.filter(function (i) { return i.quantity > 0 && !i.sourceId; });
    if (missing.length) {
      msg.className = "msg err";
      msg.textContent = "Ada baris tanpa foto sumber. Pilih foto pada setiap ukuran.";
      renderEditor();
      return null;
    }

    var layout;
    try { layout = L.generate(S.buildJob()); }
    catch (e) { msg.className = "msg err"; msg.textContent = e.message; renderEditor(); return null; }

    var RV_W = 30;
    var rawW = box.clientWidth || 320;
    var availW = Math.max(120, rawW - RV_W - 24);

    layout.sheets.forEach(function (sheet, sheetIndex) {
      var scale = Math.min(availW / sheet.width, 3.2);
      var wPx = Math.round(sheet.width * scale);
      var hPx = Math.round(sheet.height * scale);

      var renderList = sheet.slots.map(function (s) { return resolveSlot(s, sheetIndex, false); });
      S.duplicates().filter(function (d) { return d.sheetIndex === sheetIndex; })
        .forEach(function (d) { renderList.push(resolveSlot(d, sheetIndex, true)); });

      var blockEl = el("div", "sheet-block");
      blockEl.appendChild(el("div", "sheet-caption",
        "Sheet " + sheet.index + " \u00b7 " + renderList.length + " foto \u00b7 " + sheet.efficiency.toFixed(1) + "%"));

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

      renderList.forEach(function (r) {
        var baseRot = ((Number(r.rotation) || 0) % 360 + 360) % 360;
        var totalRot = (baseRot + (Number(r.rotationExtra) || 0)) % 360;

        var d = el("div", "slot" + (baseRot ? " rot" : "") + (r.slotId === selectedSlotId ? " selected" : ""));
        d.style.left = (r.x * scale) + "px";
        d.style.top = (r.y * scale) + "px";
        d.style.width = (r.width * scale) + "px";
        d.style.height = (r.height * scale) + "px";
        d.dataset.slotId = r.slotId;

        var photo = S.photoById(r.sourceId);

        var swapped = (baseRot % 180) !== 0;
        var pw = swapped ? r.height : r.width;
        var ph = swapped ? r.width : r.height;

        var zoom = (Number(r.crop.scale) || 100) / 100;
        var sx = zoom * (r.flipH ? -1 : 1);
        var sy = zoom * (r.flipV ? -1 : 1);
        var panX = (Number(r.crop.x) || 0) * scale;
        var panY = (Number(r.crop.y) || 0) * scale;

        var photoEl = el("div", "slot-photo");
        photoEl.style.width = (pw * scale) + "px";
        photoEl.style.height = (ph * scale) + "px";
        photoEl.style.transform =
          "translate(-50%,-50%) translate(" + panX + "px," + panY + "px)" +
          (totalRot ? " rotate(" + totalRot + "deg)" : "") +
          " scale(" + sx + "," + sy + ")";
        if (photo && isRenderable(photo.name)) {
          photoEl.style.backgroundImage = "url('" + photo.thumb + "')";
          photoEl.style.backgroundColor = r.backgroundColor || "transparent";
        } else {
          photoEl.style.background = (photo && photo.color) || "#8aa";
        }
        d.appendChild(photoEl);

        d.title = r.label + " " + r.physicalWidth + "\u00d7" + r.physicalHeight + "mm" +
          (baseRot ? " (rotasi " + baseRot + "\u00b0)" : "") + (r.isDup ? " \u00b7 duplikat" : "") +
          " \u2014 klik utk edit, drag utk geser";
        d.addEventListener("mousedown", function (e) {
          if (e.button !== 0) return;
          e.preventDefault();
          dragState = {
            slotId: r.slotId, isDup: r.isDup,
            startClientX: e.clientX, startClientY: e.clientY,
            startX: r.x, startY: r.y,
            startRawX: r.rawX, startRawY: r.rawY,
            curX: r.x, curY: r.y,
            scale: scale, sheetW: sheet.width, sheetH: sheet.height,
            width: r.width, height: r.height,
            moved: false
          };
        });
        page.appendChild(d);

        var bd = null;
        if (!(layout.options && layout.options.noBorder)) {
          var ob = Math.max(0, Number(r.offsetBorder) || 0);
          bd = el("div", "slot-border");
          bd.style.left = ((r.x - ob) * scale) + "px";
          bd.style.top = ((r.y - ob) * scale) + "px";
          bd.style.width = ((r.width + 2 * ob) * scale) + "px";
          bd.style.height = ((r.height + 2 * ob) * scale) + "px";
          page.appendChild(bd);
        }

        slotIndex[r.slotId] = { resolved: r, sheetIndex: sheetIndex, scale: scale, sheetW: sheet.width, sheetH: sheet.height, slotEl: d, borderEl: bd };
      });

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
    renderEditor();
    return layout;
  }
  $("#btnPreview").onclick = preview;

  /* ---------------- panel Slot Editor ----------------
     Kolom Slot Editor sekarang SELALU kelihatan (bukan cuma muncul saat
     ada seleksi, sejak layout 3-kolom) - jadi di sini yang di-toggle
     adalah pesan `.sel-info.empty` + class `.disabled` pada #editorBody
     (meredupkan kontrol, style-nya sudah ada di theme.css), bukan
     display:none pada seluruh kartu. */
  function renderEditor() {
    var infoEl = $("#editorInfo");
    var body = $("#editorBody");
    var info = selectedSlotId ? slotIndex[selectedSlotId] : null;
    if (!info) {
      infoEl.className = "sel-info empty";
      infoEl.textContent = "Klik salah satu foto di Preview untuk mulai edit (posisi, crop/zoom, rotate, flip, ganti foto/background, duplikat).";
      body.classList.add("disabled");
      $("#btnDeleteSlot").style.display = "none";
      return;
    }
    body.classList.remove("disabled");
    var r = info.resolved;
    var photo = S.photoById(r.sourceId);

    infoEl.className = "sel-info";
    infoEl.innerHTML =
      "<b>" + esc(r.label) + "</b> \u00b7 " + r.physicalWidth + "\u00d7" + r.physicalHeight + "mm" +
      " \u00b7 Sheet " + (info.sheetIndex + 1) + (r.isDup ? " \u00b7 <i>duplikat</i>" : "") +
      "<br><small style='color:#9a9a9a'>" + esc(photo ? photo.name : "(tanpa foto)") + "</small>";

    var st = S.get();
    var srcSel = $("#editorSourceSelect");
    srcSel.innerHTML = st.photos.length
      ? st.photos.map(function (p) {
          return '<option value="' + esc(p.id) + '"' + (p.id === r.sourceId ? " selected" : "") + '>' + esc(p.name) + "</option>";
        }).join("")
      : '<option value="">\u2014 belum ada foto \u2014</option>';
    srcSel.onchange = function (e) {
      if (r.isDup) { var d = S.duplicateById(selectedSlotId); if (d) d.sourceId = e.target.value; }
      else S.setOverrideSource(selectedSlotId, e.target.value);
      preview();
    };

    var bgWrap = $("#editorBgRow");
    var curBg = r.backgroundColor || "";
    var presetValues = S.bgPresets.map(function (bp) { return bp.value; });
    var isCustom = curBg !== "" && presetValues.indexOf(curBg) === -1;
    bgWrap.innerHTML = S.bgPresets.map(function (bp) {
      var active = (curBg === bp.value) ? " active" : "";
      var noneCls = (bp.value === "") ? " none" : "";
      var style = bp.value ? ' style="background:' + esc(bp.value) + '"' : "";
      return '<button type="button" class="bg-swatch' + noneCls + active + '" data-bg="' + esc(bp.value) + '" title="' + esc(bp.label) + '"' + style + '></button>';
    }).join("") +
      '<label class="bg-custom' + (isCustom ? " active" : "") + '" title="Warna custom">' +
      '<input type="color" value="' + esc(isCustom ? curBg : "#ffffff") + '" /></label>';

    function applyBg(hex) {
      if (r.isDup) { var d = S.duplicateById(selectedSlotId); if (d) d.backgroundColor = hex || ""; }
      else S.setOverrideBg(selectedSlotId, hex);
      preview();
    }
    Array.prototype.forEach.call(bgWrap.querySelectorAll("[data-bg]"), function (btn) {
      btn.onclick = function () { applyBg(btn.getAttribute("data-bg")); };
    });
    bgWrap.querySelector(".bg-custom input").oninput = function (e) { applyBg(e.target.value); };

    $("#btnDeleteSlot").style.display = r.isDup ? "" : "none";
  }

  function withSelected(dupFn, overrideFn) {
    if (!selectedSlotId) return;
    var info = slotIndex[selectedSlotId];
    if (!info) return;
    if (info.resolved.isDup) {
      var d = S.duplicateById(selectedSlotId);
      if (d) dupFn(d);
    } else {
      overrideFn(selectedSlotId);
    }
    preview();
  }

  $$("[data-nudge]").forEach(function (b) {
    b.onclick = function () {
      var v = b.getAttribute("data-nudge").split(",");
      var dx = Number(v[0]), dy = Number(v[1]);
      withSelected(
        function (d) { d.x += dx; d.y += dy; },
        function (id) { S.nudgeOverride(id, dx, dy); }
      );
    };
  });
  $$("[data-crop]").forEach(function (b) {
    b.onclick = function () {
      var v = b.getAttribute("data-crop").split(",");
      var dx = Number(v[0]), dy = Number(v[1]);
      withSelected(
        function (d) { d.crop.x += dx; d.crop.y += dy; },
        function (id) { S.setOverrideCrop(id, { dx: dx, dy: dy }); }
      );
    };
  });
  $$("[data-zoom]").forEach(function (b) {
    b.onclick = function () {
      var delta = Number(b.getAttribute("data-zoom"));
      withSelected(
        function (d) { d.crop.scale = Math.max(20, Math.min(600, (Number(d.crop.scale) || 100) + delta)); },
        function (id) { S.setOverrideCrop(id, { scale: delta }); }
      );
    };
  });
  $("#btnResetCrop").onclick = function () {
    withSelected(
      function (d) { d.crop = { x: 0, y: 0, scale: 100 }; },
      function (id) { S.setOverrideCrop(id, { reset: true }); }
    );
  };
  $("#btnFlipH").onclick = function () {
    withSelected(function (d) { d.flipH = !d.flipH; }, function (id) { S.flipOverride(id, "h"); });
  };
  $("#btnFlipV").onclick = function () {
    withSelected(function (d) { d.flipV = !d.flipV; }, function (id) { S.flipOverride(id, "v"); });
  };
  $("#btnRotate").onclick = function () {
    withSelected(
      function (d) { d.rotationExtra = (Number(d.rotationExtra) + 90) % 360; },
      function (id) { S.rotateOverride(id); }
    );
  };
  $("#btnResetSlot").onclick = function () {
    withSelected(
      function (d) { d.crop = { x: 0, y: 0, scale: 100 }; d.flipH = false; d.flipV = false; d.rotationExtra = 0; },
      function (id) { S.resetOverride(id); }
    );
  };
  $("#btnDeleteSlot").onclick = function () {
    if (!selectedSlotId) return;
    S.removeDuplicate(selectedSlotId);
    selectedSlotId = null;
    preview();
  };
  $("#btnEditorClose").onclick = function () { selectSlot(null); };

  /* Duplikat: dpad-plus (atas/bawah/kiri/kanan) - target posisi dihitung
     di sini (offset sebesar lebar/tinggi slot ke arah yg dipilih), lalu
     S.duplicateSlot() tinggal clamp ke batas lembar. Slot baru langsung
     dipilih supaya bisa terus diedit (mis. ganti foto/bg) tanpa klik lagi. */
  $$("[data-dup]").forEach(function (b) {
    b.onclick = function () {
      if (!selectedSlotId) return;
      var info = slotIndex[selectedSlotId];
      if (!info) return;
      var r = info.resolved;
      var dir = b.getAttribute("data-dup");
      var dx = 0, dy = 0;
      if (dir === "right") dx = r.width; else if (dir === "left") dx = -r.width;
      else if (dir === "up") dy = -r.height; else if (dir === "down") dy = r.height;
      var target = {
        slotId: r.slotId, sizeId: r.sizeId, label: r.label,
        x: r.x + dx, y: r.y + dy, width: r.width, height: r.height,
        physicalWidth: r.physicalWidth, physicalHeight: r.physicalHeight,
        rotation: r.rotation, offsetBorder: r.offsetBorder,
        sourceId: r.sourceId, backgroundColor: r.backgroundColor,
        crop: r.crop, rotationExtra: r.rotationExtra, flipH: r.flipH, flipV: r.flipV
      };
      var dup = S.duplicateSlot(target, info.sheetIndex, info.sheetW, info.sheetH);
      selectedSlotId = dup.slotId;
      preview();
    };
  });

  /* ---------------- reset ---------------- */
  $("#btnReset").onclick = function () {
    S.reset();
    selectedSlotId = null;
    renderSizePresets();
    renderPhotos();
    renderOrder();
    bindOptions();
    preview();
    toast("Semua parameter direset ke default.", "ok");
  };

  /* ---------------- layout 3 kolom: drag utk atur lebar ----------------
     Cuma aktif secara visual di layar lebar (>=1100px, lihat theme.css)
     - resizer disembunyikan (display:none) di layar sempit lewat CSS,
     jadi listener di bawah aman dipasang selalu tanpa perlu deteksi
     breakpoint di JS (drag tidak mungkin terjadi di elemen yang
     display:none). Lebar kolom Setup (--w-a) & Slot Editor (--w-c)
     disimpan sebagai CSS custom property di #layoutRoot, diinget lewat
     localStorage supaya lebar yang diatur user tetap sama tiap buka
     lagi (BEDA dari state.js - ini murni preferensi tampilan, bukan
     bagian dari data job cetak, jadi sengaja dipisah kuncinya). */
  function initResizableLayout() {
    var root = $("#layoutRoot");
    var leftEl = $("#resizerLeft");
    var rightEl = $("#resizerRight");
    if (!root || !leftEl || !rightEl) return;

    var MIN_W = 240, MAX_W = 640;
    var LAYOUT_KEY = "pfweb.layout.v1";
    var widths = { a: 360, c: 360 };
    try {
      var saved = JSON.parse(localStorage.getItem(LAYOUT_KEY) || "null");
      if (saved && saved.a) widths.a = Math.max(MIN_W, Math.min(MAX_W, saved.a));
      if (saved && saved.c) widths.c = Math.max(MIN_W, Math.min(MAX_W, saved.c));
    } catch (e) { /* localStorage tidak tersedia - pakai default */ }
    root.style.setProperty("--w-a", widths.a + "px");
    root.style.setProperty("--w-c", widths.c + "px");

    function persist() {
      try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(widths)); } catch (e) {}
    }

    function startDrag(which, handleEl) {
      return function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        e.preventDefault();
        handleEl.classList.add("active");
        var startClientX = e.clientX;
        var startW = widths[which];
        function onMove(ev) {
          var dx = ev.clientX - startClientX;
          /* resizer kiri: geser kanan -> kolom Setup melebar (+dx).
             resizer kanan: geser kanan -> kolom Preview melebar, jadi
             kolom Slot Editor menyempit (-dx). */
          var raw = (which === "a") ? startW + dx : startW - dx;
          widths[which] = Math.max(MIN_W, Math.min(MAX_W, raw));
          root.style.setProperty("--w-" + which, widths[which] + "px");
        }
        function onUp() {
          handleEl.classList.remove("active");
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
          persist();
        }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      };
    }
    leftEl.addEventListener("mousedown", startDrag("a", leftEl));
    rightEl.addEventListener("mousedown", startDrag("c", rightEl));

    /* aksesibilitas: resizer bisa difokus (tabindex=0 di HTML) dan
       diatur pakai tombol panah kiri/kanan, tidak cuma lewat mouse. */
    function keyDrag(which, sign) {
      return function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        var step = (e.key === "ArrowRight" ? 1 : -1) * sign * 20;
        widths[which] = Math.max(MIN_W, Math.min(MAX_W, widths[which] + step));
        root.style.setProperty("--w-" + which, widths[which] + "px");
        persist();
      };
    }
    leftEl.addEventListener("keydown", keyDrag("a", 1));
    rightEl.addEventListener("keydown", keyDrag("c", -1));
  }

  /* ---------------- init ---------------- */
  function init() {
    initResizableLayout();
    renderSizePresets();
    renderPhotos();
    renderOrder();
    bindOptions();
    preview();
  }
  init();
})();
