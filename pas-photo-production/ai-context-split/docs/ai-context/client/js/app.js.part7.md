<!-- AI CONTEXT | original: client/js/app.js | part 7 dari 8 | capLiveIndicatorHtml, refreshSelection, setBgApplySelEnabled, renderEditBgSwatches -->
```javascript
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
```
