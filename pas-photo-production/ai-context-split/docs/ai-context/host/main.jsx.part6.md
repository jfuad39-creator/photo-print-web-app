<!-- AI CONTEXT | original: host/main.jsx | part 6 dari 11 | isDuplicateSlotId, collectPreservedState, drawCutGuide, ensureArtboard, mediaSize, pickStartupPreset -->
```jsx


  /* isDuplicateSlotId: slot hasil tombol "Duplicate" di editor (lihat
     api.duplicateSlot) selalu diberi slotId asli + akhiran "-copy" (bisa
     berantai "-copy-copy" kalau diduplikasi berkali-kali). Slot semacam ini
     BUKAN bagian dari struktur baris pesanan (size + quantity) sehingga
     layout-engine tidak pernah tahu keberadaannya dan tidak bisa ikut
     menyusun ulang posisinya secara otomatis. */
  function isDuplicateSlotId(slotId) { return /-copy$/.test(String(slotId || "")); }

  /* collectPreservedState: dipanggil SEBELUM clearGenerated() saat generate
     ulang (replace=true), supaya edit manual pada slot yang SUDAH ADA di
     dokumen tidak hilang saat layer lama dihapus & dibangun ulang.
     - overrides[slotId] = background/foto pengganti/crop/flip yang sudah
       di-edit user pada slot itu, untuk dipasangkan kembali ke slot BARU
       dengan slotId yang sama (lihat catatan stabilitas slotId di
       api.generate). Rotasi (rotate90) SENGAJA tidak disertakan di sini -
       lihat catatan pada createSlot().
     - duplicateGroups = daftar slot hasil "Duplicate" beserta border-nya;
       ini dipindah ke layer tersendiri supaya tidak ikut terhapus, TAPI juga
       tidak ikut disusun ulang (lihat api.generate). */
  function collectPreservedState(doc) {
    var overrides = {}, duplicateGroups = [], i;
    for (i = 0; i < doc.pageItems.length; i++) {
      var it = doc.pageItems[i];
      var m = getMeta(it);
      if (!m || !m.slotId) continue;
      if (isDuplicateSlotId(m.slotId)) {
        duplicateGroups.push({ group: it, borders: borderItemsForSlot(doc, m.slotId) });
      } else if (!overrides[m.slotId]) {
        overrides[m.slotId] = {
          sourcePath: m.sourcePath || "",
          sourceId: m.sourceId || "",
          sourceOverridden: !!m.sourceOverridden,
          backgroundColor: (typeof m.backgroundColor === "string") ? m.backgroundColor : "",
          backgroundOverridden: !!m.backgroundOverridden,
          crop: m.crop || { x: 0, y: 0, scale: 100 },
          flipH: !!m.flipH,
          flipV: !!m.flipV,
          captionFontSizeOverride: (typeof m.captionFontSizeOverride === "number") ? m.captionFontSizeOverride : null,
          captionTracking: (typeof m.captionTracking === "number") ? m.captionTracking : 0
        };
      }
    }
    return { overrides: overrides, duplicateGroups: duplicateGroups };
  }

  function drawCutGuide(doc, layer, sheet, origin) { var lines = {}, i, s; function key(v) { return String(Math.round(v * 100) / 100); } for (i = 0; i < sheet.slots.length; i++) { s = sheet.slots[i]; lines["v" + key(s.x)] = s.x; lines["v" + key(s.x + s.width)] = s.x + s.width; lines["h" + key(s.y)] = s.y; lines["h" + key(s.y + s.height)] = s.y + s.height; } var col = rgb(255, 0, 255); for (var k in lines) { if (!lines.hasOwnProperty(k)) continue; var val = lines[k]; var p = layer.pathItems.add(); p.filled = false; p.stroked = true; p.strokeColor = col; p.strokeWidth = 0.25; p.name = "CUT " + k; if (k.charAt(0) === "v") { var x = origin.left + val * MM; p.setEntirePath([[x, origin.top], [x, origin.top - sheet.height * MM]]); } else { var y = origin.top - val * MM; p.setEntirePath([[origin.left, y], [origin.left + sheet.width * MM, y]]); } } }

  function ensureArtboard(doc, index, sheet, origin) { var rect = [origin.left, origin.top, origin.left + sheet.width * MM, origin.top - sheet.height * MM]; var ab; if (index === 0 && doc.artboards.length >= 1) { ab = doc.artboards[0]; ab.artboardRect = rect; } else if (index < doc.artboards.length) { ab = doc.artboards[index]; ab.artboardRect = rect; } else { ab = doc.artboards.add(rect); } ab.name = "Sheet " + pad2(sheet.index || 1); return ab; }
  function mediaSize(media) {
    var type = (media && media.type) || "A4";
    if (type === "CUSTOM") {
      var cw = num(media.customWidth, 210), ch = num(media.customHeight, 297);
      if (cw <= 0) cw = 210;
      if (ch <= 0) ch = 297;
      return [cw, ch];
    }
    var m = { A3: [297, 420], A4: [210, 297], A5: [148, 210], A6: [105, 148], LETTER: [216, 279], "4R": [102, 152], "10R": [254, 305], "10x15": [100, 150], "20x30": [200, 300] };
    return m[type] || m.A4;
  }

  /* ---------- helpers to pick a startup preset (mirror File > New) ---------- */
  function pickStartupPreset() {
    /* Illustrator ships with a set of startup profiles ("Print", "Web",
       "Mobile", ...). File > New uses one of those profiles which gives the
       new document a proper active view, ruler & pasteboard placement.
       Prefer "Print" (default Print profile) with sensible fallbacks. */
    var wanted = ["Print", "[Default] Print", "Basic RGB", "Web", "[Default] Web"];
    var list = [];
    try { list = app.startupPresetsList || []; } catch (eList) { list = []; }
    var i, j;
    for (i = 0; i < wanted.length; i++) {
      for (j = 0; j < list.length; j++) {
        if (String(list[j]) === wanted[i]) return list[j];
      }
    }
    if (list.length) return list[0];
    return "Print"; /* string fallback; Illustrator resolves internally */
  }

  
```
