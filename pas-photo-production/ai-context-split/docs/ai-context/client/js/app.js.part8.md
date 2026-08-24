<!-- AI CONTEXT | original: client/js/app.js | part 8 dari 8 | init -->
```javascript


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
```
