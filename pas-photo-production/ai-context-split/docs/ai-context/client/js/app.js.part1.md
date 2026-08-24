<!-- AI CONTEXT | original: client/js/app.js | part 1 dari 8 | $, $$, el, esc, fileUrl, isRenderable, fmtCm, sizeOptionText, attachSpinner, toast, renderPhotos, addPhotoPaths -->
```javascript
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
```
