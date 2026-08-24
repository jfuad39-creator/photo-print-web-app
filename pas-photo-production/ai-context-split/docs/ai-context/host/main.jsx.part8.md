<!-- AI CONTEXT | original: host/main.jsx | part 8 dari 11 | api.generate -->
```jsx
api.generate = function (raw) {
    var created = [];
    var doc;
    try {
      doc = activeDoc();
      var data = payload(raw);
      var layout = data.layout;
      if (!layout || !layout.sheets || !layout.sheets.length) {
        return response(false, "Layout kosong. Jalankan Preview terlebih dahulu.");
      }
      var opts = layout.options || {};
      var capOpts = layout.caption || null;
      var mode = data.grouping || opts.grouping || "flat";
      if (mode !== "flat" && mode !== "grouped") mode = "flat";
      var replacePrev = data.replace !== false;

      /* Simpan dulu edit manual (background/ganti foto/crop/flip) & slot
         hasil duplicate SEBELUM layer lama dihapus, supaya bisa dipasang
         lagi ke slot baru dengan slotId yang sama. slotId stabil lintas
         generate selama baris pesanan (ukuran) yang bersangkutan tidak
         dihapus dari panel - lihat catatan di layout-engine.js. */
      var overrides = {}, dupGroups = [], dupHoldLayer = null;
      if (replacePrev) {
        var preserved = collectPreservedState(doc);
        overrides = preserved.overrides;
        dupGroups = preserved.duplicateGroups;
        if (dupGroups.length) {
          dupHoldLayer = doc.layers.add();
          dupHoldLayer.name = "__PFPM_TEMP_DUP_HOLD__";
          for (var dh = 0; dh < dupGroups.length; dh++) {
            try { dupGroups[dh].group.move(dupHoldLayer, ElementPlacement.PLACEATEND); } catch (eDh) {}
            for (var dhb = 0; dhb < dupGroups[dh].borders.length; dhb++) {
              try { dupGroups[dh].borders[dhb].move(dupHoldLayer, ElementPlacement.PLACEATEND); } catch (eDhb) {}
            }
          }
        }
      }
      var clearedCount = replacePrev ? clearGenerated(doc) : 0;
      var jobId = data.jobId || nextJobId(doc);
      var useArtboards = data.artboards !== false;
      var totalSlots = 0;
      var restoredCount = 0;
      var i, j;

      /* Preserve the active artboard's pasteboard coordinates. A scripted
         document does not always place its artboard top at Y=0. */
      var firstArtboardIndex = 0;
      try { firstArtboardIndex = doc.artboards.getActiveArtboardIndex(); } catch (eActive) {}
      var anchorRect = doc.artboards[firstArtboardIndex].artboardRect;
      var anchorLeft = anchorRect[0];
      var anchorTop = anchorRect[1];

      for (i = 0; i < layout.sheets.length; i++) {
        var sheet = layout.sheets[i];
        var origin = { left: anchorLeft + i * (sheet.width + SHEET_GAP_MM) * MM, top: anchorTop, jobId: jobId, sheetIndex: i + 1 };
        if (useArtboards) ensureArtboard(doc, firstArtboardIndex + i, sheet, origin);
        var photoLayer = getLayer(doc, jobId + " Sheet " + pad2(i + 1));
        created.push(photoLayer);
        var parent = photoLayer;
        if (mode === "grouped") {
          var g = photoLayer.groupItems.add();
          g.name = "PAS FOTO JOB - " + jobId + " / SHEET " + pad2(i + 1);
          parent = g;
        }
        for (j = 0; j < sheet.slots.length; j++) {
          var ov = overrides[sheet.slots[j].slotId];
          if (ov) restoredCount++;
          createSlot(doc, parent, sheet.slots[j], origin, mode, !!opts.noBorder, opts.fitMode, ov, capOpts);
          totalSlots++;
        }
        bringBordersToFront(parent);
        if (opts.cutGuide) {
          var guideLayer = getLayer(doc, jobId + " Cut Guide " + pad2(i + 1));
          created.push(guideLayer);
          drawCutGuide(doc, guideLayer, sheet, origin);
          guideLayer.locked = true;
        }
      }
      /* Kembalikan slot hasil "Duplicate" (kalau ada) ke layer tersendiri -
         TIDAK ikut disusun ulang oleh layout-engine (di luar struktur
         baris pesanan), jadi posisinya dipertahankan apa adanya, hanya
         dipindah keluar dari layer sementara ke layer permanen job baru. */
      var dupRestoredCount = 0;
      if (dupHoldLayer) {
        if (dupGroups.length) {
          var dupLayer = getLayer(doc, jobId + " Manual Duplicates");
          created.push(dupLayer);
          for (var dr = 0; dr < dupGroups.length; dr++) {
            try { dupGroups[dr].group.move(dupLayer, ElementPlacement.PLACEATEND); dupRestoredCount++; } catch (eDr) {}
            for (var drb = 0; drb < dupGroups[dr].borders.length; drb++) {
              try { dupGroups[dr].borders[drb].move(dupLayer, ElementPlacement.PLACEATEND); } catch (eDrb) {}
            }
          }
        }
        try { dupHoldLayer.remove(); } catch (eDhRemove) {}
      }

      /* Hapus artboard "Sheet NN" sisa dari generate SEBELUMNYA yang jumlah
         sheet-nya lebih banyak dari generate SEKARANG - misalnya generate
         sebelumnya pakai media kecil (10x15) yang menghasilkan beberapa
         artboard untuk menampung semua foto, lalu user pindah ke media
         besar (A4/A5) yang cukup 1 artboard saja. ensureArtboard() di atas
         hanya reuse/update artboard index 0..(jumlah sheet baru - 1);
         artboard index SESUDAHNYA yang masih menyisakan nama "Sheet NN"
         dari job lama TIDAK ikut ter-update oleh loop di atas, jadi harus
         dibersihkan manual di sini. Hanya berjalan kalau "Timpa hasil
         sebelumnya" (replacePrev) aktif, supaya perilakunya konsisten
         dengan pembersihan layer generate lama (clearGenerated) di atas.
         Nama harus cocok PERSIS pola "Sheet NN" supaya tidak menyentuh
         artboard lain milik user yang kebetulan ada di urutan setelahnya. */
      var removedArtboards = 0;
      if (useArtboards && replacePrev) {
        var keepArtboardsUntil = firstArtboardIndex + layout.sheets.length;
        var pfpmSheetNameRe = /^Sheet \d+$/;
        while (keepArtboardsUntil < doc.artboards.length && pfpmSheetNameRe.test(doc.artboards[keepArtboardsUntil].name)) {
          try { doc.artboards.remove(keepArtboardsUntil); removedArtboards++; } catch (eRemoveAb) { break; }
        }
      }

      doc.selection = null;
      if (useArtboards) {
        try { doc.artboards.setActiveArtboardIndex(firstArtboardIndex); } catch (eRestore) {}
      }
      app.redraw();
      var doneMsg = "Berhasil: " + totalSlots + " foto pada " + layout.sheets.length + " lembar (" + (mode === "flat" ? "ungrouped / clipping mask" : "grouped") + ")." +
        (clearedCount > 0 ? " Hasil generate sebelumnya (" + clearedCount + " layer) dihapus otomatis." : "") +
        (removedArtboards > 0 ? " " + removedArtboards + " artboard sisa dari generate sebelumnya ikut dihapus." : "") +
        (restoredCount > 0 ? " " + restoredCount + " slot mempertahankan edit sebelumnya (background/foto/crop/flip)." : "") +
        (dupRestoredCount > 0 ? " " + dupRestoredCount + " slot duplikat manual dipindah ke layer \"" + jobId + " Manual Duplicates\" (posisi tidak diubah, cek ulang manual kalau perlu)." : "");
      return response(true, doneMsg, { jobId: jobId, slots: totalSlots, sheets: layout.sheets.length, mode: mode, cleared: clearedCount, removedArtboards: removedArtboards, restored: restoredCount, duplicatesPreserved: dupRestoredCount });
    } catch (e) {
      try { for (var c = created.length - 1; c >= 0; c--) { try { created[c].locked = false; created[c].remove(); } catch (e2) {} } } catch (e3) {}
      /* Kalau generate gagal SETELAH slot duplikat manual sempat dipindah ke
         layer sementara, JANGAN ikut dihapus - cukup ganti namanya supaya
         mudah ditemukan lagi, foto/edit user tidak boleh ikut hilang hanya
         karena generate baru gagal di tengah jalan. */
      try { if (typeof dupHoldLayer !== "undefined" && dupHoldLayer) dupHoldLayer.name = "PFPM Slot Duplikat (belum tersusun ulang - generate terakhir gagal)"; } catch (e4) {}
      return response(false, "Generate gagal: " + e.message);
    }
  }
```
