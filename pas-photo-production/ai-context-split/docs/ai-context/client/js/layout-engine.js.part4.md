<!-- AI CONTEXT | original: client/js/layout-engine.js | part 4 dari 4 | build, scoreResult, generate -->
```javascript
function build(job, landscape) {
    var base;
    if (job.media.type === "CUSTOM") {
      var cw = clampNum(job.media.customWidth, 210);
      var ch = clampNum(job.media.customHeight, 297);
      if (cw <= 0 || ch <= 0) throw new Error("Ukuran custom tidak valid.");
      base = [cw, ch];
    } else {
      base = MEDIA_SIZES[job.media.type] || MEDIA_SIZES.A4;
    }
    var pw = landscape ? base[1] : base[0];
    var ph = landscape ? base[0] : base[1];
    /* "margin" = marjin kiri/kanan/bawah, mengikuti input parameter panel
       (default 4.5mm). Marjin atas SENGAJA dipisah: default-nya tetap
       5mm (DEFAULT_TOP_MARGIN) dan tidak ikut berubah walau nilai
       parameter "margin" diubah user, kecuali job.media.marginTop
       dikirim eksplisit. */
    var margin = Math.max(0, clampNum(job.media.margin, 4.5));
    var topMargin = Math.max(0, clampNum(job.media.marginTop, DEFAULT_TOP_MARGIN));
    var gap = Math.max(0, clampNum(job.media.gap, 0));
    var rotateMode = (job.options && job.options.rotateMode) || "auto";
    var noBorder = !!(job.options && job.options.noBorder);
    var offsetBorder = noBorder ? 0 : Math.max(0, clampNum(job.options && (job.options.offsetBorder !== undefined ? job.options.offsetBorder : job.options.borderWidth), 1.5));
    var position = (job.options && job.options.position) || "center";
    var area = { x: margin, y: topMargin, w: r2(pw - margin * 2), h: r2(ph - topMargin - margin) };
    if (area.w <= 0 || area.h <= 0) throw new Error("Margin terlalu besar untuk media " + job.media.type + ".");
    var rows = [];
    for (var i = 0; i < (job.items || []).length; i++) {
      var it = job.items[i];
      var qty = Math.max(0, parseInt(it.quantity, 10) || 0);
      if (qty <= 0) continue;
      var w = clampNum(it.width, 0), h = clampNum(it.height, 0);
      if (w <= 0 || h <= 0) continue;
      var fitsNormal = (w <= area.w + EPS && h <= area.h + EPS);
      var fitsRotated = (h <= area.w + EPS && w <= area.h + EPS);
      if (!fitsNormal && !fitsRotated) throw new Error("Ukuran " + (it.label || it.id) + " (" + w + "x" + h + "mm) lebih besar dari area cetak.");
      rows.push({ id: it.id, sizeId: (it.sizeId || it.id), label: it.label || it.id, w: w, h: h, qty: qty, srcId: it.sourceId, srcPath: it.sourcePath || "", bg: it.backgroundColor || "", captionText: it.captionText || "" });
    }
    if (!rows.length) throw new Error("Tidak ada item dengan quantity > 0.");
    /* FIX v2.6.0: gabungkan baris-baris dengan ukuran fisik sama sebelum
       dipakai algoritma packing manapun - lihat mergeRowsBySize() di atas
       dan catatan lengkap di kepala file ini. */
    var items = mergeRowsBySize(rows);
    items.sort(function (a, b) { var A = a.w * a.h, B = b.w * b.h; return A === B ? (b.h - a.h) : (B - A); });
    var totalRequested = 0;
    for (var t = 0; t < items.length; t++) totalRequested += items[t].qty;
    var sheets = [];
    var usableArea = area.w * area.h;
    var guard = 0;
    while (guard++ < 200) {
      var remaining = 0;
      for (var q = 0; q < items.length; q++) remaining += items[q].qty;
      if (remaining <= 0) break;
      var slots;
      /* FIX: sebelumnya cabang default di sini selalu memakai
         packHorizontalShelf() - algoritma "shelf/band" yang menyusun per
         baris berdasarkan tinggi item yang PERSIS SAMA. Begitu satu baris
         "ditutup" (pindah ke baris berikutnya), sisa ruang kosong di
         kanan baris itu TIDAK PERNAH dipakai lagi oleh item lain yang
         tingginya berbeda - walaupun ukurannya jelas muat (mis. foto 2x3
         yang harusnya bisa nempel di sebelah foto 4x6 pada media 20x30,
         tapi malah dilempar ke baris baru sendirian). Sekarang dipakai
         packSheet() - algoritma guillotine bin-packing yang sudah ada di
         file ini sebelumnya (lihat _internal.packSheet) tapi belum pernah
         benar-benar dipanggil di sini. packSheet memecah sisa ruang
         kosong di kanan & bawah tiap blok foto yang baru ditempatkan
         menjadi rectangle bebas baru, sehingga item lain (ukuran apa pun)
         bisa mengisi sisa ruang tersebut selama masih muat. */
      if (!landscape && gap === 0 && onlyPassportSizes(items) && job.media.type === "A4") slots = packReferenceA4(items, area, offsetBorder, rotateMode);
      else if (!landscape && gap === 0 && onlyPassportSizes(items) && job.media.type === "A5") slots = packReferenceA5(items, area, offsetBorder, rotateMode);
      else slots = packSheet(items, area, gap, rotateMode, offsetBorder);
      if (!slots.length) slots = packHorizontalShelf(items, area, gap, rotateMode, offsetBorder);
      if (!slots.length) break;
      slots = applyPosition(slots, area, position);
      var used = 0;
      for (var s = 0; s < slots.length; s++) used += slots[s].width * slots[s].height;
      sheets.push({ index: sheets.length + 1, width: pw, height: ph, margin: margin, marginTop: topMargin, gap: gap, slots: slots, usedArea: r2(used), efficiency: r2((used / usableArea) * 100) });
    }
    var placed = 0, totalUsed = 0;
    for (var k = 0; k < sheets.length; k++) { placed += sheets[k].slots.length; totalUsed += sheets[k].usedArea; }
    var efficiency = sheets.length ? r2((totalUsed / (usableArea * sheets.length)) * 100) : 0;
    return {
      media: { type: job.media.type, width: pw, height: ph, margin: margin, marginTop: topMargin, gap: gap, landscape: !!landscape },
      sheets: sheets,
      totalSlots: totalRequested,
      placed: placed,
      unplaced: totalRequested - placed,
      efficiency: efficiency,
      options: { offsetBorder: offsetBorder, noBorder: noBorder, rotateMode: rotateMode, cutGuide: !!(job.options && job.options.cutGuide), grouping: (job.options && job.options.grouping) || "flat", fitMode: (job.options && job.options.fitMode === "fit") ? "fit" : "fill", position: position },
      /* caption: konfigurasi visual GLOBAL untuk label teks di bawah tiap
         foto (tinggi/font/bold/uppercase) - teks per slot sendiri sudah
         di-resolve final di state.buildJob() dan ikut tiap slot lewat
         slot.captionText (lihat addSlot() di atas), bukan di sini. */
      caption: job.caption ? {
        enabled: !!job.caption.enabled,
        heightMm: clampNum(job.caption.heightMm, 8),
        fontSize: clampNum(job.caption.fontSize, 7),
        bold: !!job.caption.bold,
        uppercase: !!job.caption.uppercase
      } : null
    };
  }

  function scoreResult(res) { return (-res.sheets.length * 1000) + res.efficiency; }

  function generate(job) {
    if (!job || !job.media) throw new Error("Job tidak valid.");
    var mode = job.media.orientation || "auto";
    if (mode === "portrait") return build(job, false);
    if (mode === "landscape") return build(job, true);
    if ((job.media.type === "A4" || job.media.type === "A5") && (job.media.gap === 0 || job.media.gap === "0" || job.media.gap === undefined)) return build(job, false);
    var p = build(job, false);
    var l = build(job, true);
    return scoreResult(l) > scoreResult(p) ? l : p;
  }

  root.PFLayout = {
    generate: generate,
    mediaSizes: MEDIA_SIZES,
    _internal: { packSheet: packSheet, subtractRect: subtractRect, chooseBlock: chooseBlock, mergeRowsBySize: mergeRowsBySize }
  };
})(typeof window !== "undefined" ? window : this);
```
