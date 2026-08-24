<!-- AI CONTEXT | original: host/main.jsx | part 5 dari 11 | createSlot -->
```jsx
function createSlot(doc, parent, slot, origin, mode, noBorder, fitMode, override, captionOpts) {
    var left = origin.left + num(slot.x, 0) * MM;
    var top = origin.top - num(slot.y, 0) * MM;
    var fw = num(slot.width, 10) * MM;
    var fh = num(slot.height, 10) * MM;
    var offsetBorder = Math.max(0, num(slot.offsetBorder !== undefined ? slot.offsetBorder : slot.borderWidth, 1.5)) * MM;
    var ov = override || null;
    /* Foto lama hanya menang atas pilihan panel bila memang diganti manual
       lewat Slot Editor. Jika tidak, Generate harus mengikuti Preview. */
    var useSourceOverride = !!(ov && ov.sourceOverridden && ov.sourcePath);
    var sourcePath = useSourceOverride ? ov.sourcePath : slot.sourcePath;
    var sourceId = useSourceOverride ? ov.sourceId : slot.sourceId;
    var file = new File(sourcePath);
    if (!file.exists) throw new Error("File foto tidak ditemukan: " + sourcePath);
    var baseName = "PF " + safeName(slot.label || slot.sizeId) + " #" + safeName(slot.slotId);
    var useBackgroundOverride = !!(ov && ov.backgroundOverridden && typeof ov.backgroundColor === "string");
    var bgHex = useBackgroundOverride ? ov.backgroundColor : ((typeof slot.backgroundColor === "string") ? slot.backgroundColor : "");
    var cropVal = (ov && ov.crop) ? ov.crop : (slot.crop || { x: 0, y: 0, scale: 100 });
    var flipH = ov ? !!ov.flipH : false;
    var flipV = ov ? !!ov.flipV : false;
    /* caption: label teks (mis. nama sekolah) di bagian bawah frame - lihat
       addCaptionBar(). "aktif" hanya kalau toggle global di tab Label
       menyala DAN slot ini punya teks hasil resolusi (lihat buildJob() di
       state.js). Tinggi caption MEMOTONG area foto di dalam frame yang
       sama (fh tidak berubah) supaya layout-engine.js tidak perlu tahu
       apa-apa soal fitur ini. */
    var captionText = String(slot.captionText || "");
    var captionHeightMmRaw = captionOpts ? num(captionOpts.heightMm, 8) : 8;
    var capActive = !!(captionOpts && captionOpts.enabled && captionText);
    var rotationDeg = num(slot.rotation, 0);
    /* Saat rotasi aktif, bar caption dipindah ke sisi KANAN (bukan bawah -
       lihat addCaptionBar), jadi batas wajar "maksimal 60% dari dimensi
       terkait" memakai fw (lebar), bukan fh (tinggi), untuk kasus itu. */
    var capH = capActive ? Math.min((rotationDeg ? fw : fh) * 0.6, Math.max(0, captionHeightMmRaw) * MM) : 0;
    /* fwClip/fhClip/capHVisual: khusus dipakai untuk clip mask, bgRect, &
       addCaptionBar - BUKAN untuk photoFrame/meta.frame (ukuran & posisi
       FOTO tetap pakai fw/fh/capH asli, tidak berubah sama sekali di
       bawah). Saat caption aktif, clip mask "diperlebar" sejauh
       offsetBorder di SISI CAPTION SAJA, supaya band capH-nya ikut
       melebar mencakup margin offsetBorder yang di situ (yang tadinya
       cuma kanvas kosong antara tepi foto & garis border) - bar+teks
       caption jadi boleh di-center di tengah AREA PUTIH YANG BENAR-BENAR
       TERLIHAT (band + margin), bukan cuma di tengah band capH yang
       sempit. Posisi garis offsetBorder sendiri (drawOffsetBorder di
       bawah) TIDAK ikut berubah - tetap dihitung dari fw/fh asli seperti
       biasa - dan kebetulan itu PERSIS jatuh di tepi clip mask yang
       sudah diperlebar ini, jadi bar caption menyambung rapi sampai ke
       garis border tanpa menyisakan gap kosong di sisi itu. Caption tetap
       digambar sebagai ANAK clipGroup (lihat addCaptionBar) - bukan
       dipisah ke `parent` - supaya nudge/rotate90/duplicate/delete slot
       (yang me-rigid-transform clipGroup apa adanya) tidak perlu diubah. */
    var fwClip = fw, fhClip = fh, capHVisual = capH;
    if (capH > 0) {
      capHVisual = capH + offsetBorder;
      if (rotationDeg) { fwClip = fw + offsetBorder; } else { fhClip = fh + offsetBorder; }
    }
    var meta = { pfpm: true, version: 2, jobId: origin.jobId, sheet: origin.sheetIndex, slotId: slot.slotId, sizeId: slot.sizeId, label: slot.label, sourceId: sourceId, sourcePath: sourcePath, sourceOverridden: useSourceOverride, crop: cropVal, rotation: rotationDeg, flipH: flipH, flipV: flipV, physicalWidth: slot.physicalWidth, physicalHeight: slot.physicalHeight, offsetBorder: num(slot.offsetBorder !== undefined ? slot.offsetBorder : slot.borderWidth, 1.5), mode: mode, fitMode: (fitMode === "fit") ? "fit" : "fill", backgroundColor: bgHex, backgroundOverridden: useBackgroundOverride, frame: { left: left, top: top, w: fw, h: fh }, captionEnabled: capActive, captionText: capActive ? captionText : "", captionHeightMm: captionHeightMmRaw, captionFontSize: captionOpts ? num(captionOpts.fontSize, 7) : 7, captionBold: captionOpts ? !!captionOpts.bold : true, captionUppercase: captionOpts ? !!captionOpts.uppercase : false };
    meta.frame = { left: left, top: top, w: fw, h: fh };
    /* captionFontSizeOverride / captionTracking: hasil atur manual lewat
       Slot Editor > "Font & Kerning Label" (api.captionAdjust /
       api.captionAdjustBySize - lihat adjustCaptionOnSlot), dipertahankan
       lintas generate ulang lewat collectPreservedState sama seperti
       crop/flip/background. override null/tidak ada = pakai default
       auto-fit dari panel Label seperti biasa. */
    meta.captionFontSizeOverride = (ov && typeof ov.captionFontSizeOverride === "number") ? ov.captionFontSizeOverride : null;
    meta.captionTracking = (ov && typeof ov.captionTracking === "number") ? ov.captionTracking : 0;
    var clipGroup = parent.groupItems.add(); clipGroup.name = baseName;
    var clip = clipGroup.pathItems.rectangle(top, left, fwClip, fhClip); clip.name = "FRAME " + slot.physicalWidth + "x" + slot.physicalHeight + "mm"; clip.stroked = false; clip.filled = false;
    var bgRect = addBackgroundRect(clipGroup, top, left, fwClip, fhClip, bgHex, baseName);
    var placed = doc.placedItems.add(); placed.file = file; placed.name = "PHOTO " + safeName(sourceId); placed.move(clipGroup, ElementPlacement.PLACEATEND);
    /* photoFrame: kalau caption aktif, area foto dipersempit dari sisi
       yang berlawanan dengan posisi bar - dari BAWAH kalau bar horizontal
       (rotasi 0), dari KANAN kalau bar dipindah ke sisi (rotasi 90).
       SENGAJA pakai fw/fh/capH ASLI (bukan fwClip/fhClip/capHVisual) -
       ukuran & posisi foto tidak boleh ikut berubah gara-gara clip mask
       di atas diperlebar untuk keperluan caption. */
    var photoFrame = meta.frame;
    if (capH > 0) {
      photoFrame = rotationDeg
        ? { left: left, top: top, w: fw - capH, h: fh }
        : { left: left, top: top, w: fw, h: fh - capH };
    }
    fitPlaced(placed, photoFrame, meta);
    if (bgRect) { try { bgRect.move(clipGroup, ElementPlacement.PLACEATEND); } catch (eBg) {} }
    if (capH > 0) {
      addCaptionBar(clipGroup, top, left, fwClip, fhClip, capHVisual, captionText, {
        fontSize: (meta.captionFontSizeOverride !== null) ? meta.captionFontSizeOverride : meta.captionFontSize,
        bold: meta.captionBold, uppercase: meta.captionUppercase,
        tracking: meta.captionTracking,
        autoFit: meta.captionFontSizeOverride === null
      }, baseName, meta.rotation);
    }
    clip.move(clipGroup, ElementPlacement.PLACEATBEGINNING); clip.clipping = true; clipGroup.clipped = true;
    setMeta(clipGroup, meta);
    if (!noBorder) drawOffsetBorder(parent, top, left, fw, fh, offsetBorder, baseName, slot.slotId);
    return clipGroup;
  }
```
