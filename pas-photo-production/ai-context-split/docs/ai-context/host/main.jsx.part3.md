<!-- AI CONTEXT | original: host/main.jsx | part 3 dari 11 | setSlotBackground, adjustCaptionOnSlot -->
```jsx
function setSlotBackground(doc, slotItem, meta, hex) {
    if (!slotItem || slotItem.typename !== "GroupItem") return null;
    var bg = findBgRect(slotItem);
    var c = hexToRgb(hex);
    if (!c) {
      if (bg) { try { bg.remove(); } catch (e) {} }
      meta.backgroundColor = "";
    } else {
      if (!bg) {
        var clip = findClipPath(slotItem);
        if (clip) {
          bg = slotItem.pathItems.rectangle(clip.top, clip.left, clip.width, clip.height);
          bg.stroked = false;
          try { bg.move(slotItem, ElementPlacement.PLACEATEND); } catch (eMv) {}
        }
      }
      if (bg) {
        bg.filled = true;
        bg.fillColor = rgb(c.r, c.g, c.b);
        bg.stroked = false;
        bg.name = slotItem.name + " (BG " + hex + ")";
      }
      meta.backgroundColor = hex;
    }
    meta.backgroundOverridden = true;
    setMeta(slotItem, meta);
    return slotItem;
  }

  /* adjustCaptionOnSlot: ubah UKURAN FONT dan/atau TRACKING (kerning) label
     teks pada SATU slot yang sudah di-generate & sudah punya caption aktif,
     lalu re-center otomatis supaya teks tetap pas di tengah bar putihnya -
     posisi TIDAK PERNAH geser walau ukurannya berubah, jadi aman dipanggil
     berkali-kali. Dipakai bareng oleh api.captionAdjust (slot yang sedang
     dipilih di artboard) dan api.captionAdjustBySize (semua slot 1 ukuran
     sekaligus) - persis pola yang sama dengan setSlotBackground() di atas
     dipakai bareng oleh api.setBackground / api.setBackgroundBySize.

     d.fontSize / d.tracking = DELTA (ditambahkan ke nilai SEKARANG di
     artboard, bukan nilai absolut) supaya konsisten dengan tombol +/-
     lain di Slot Editor (mis. zoom crop). d.reset = true mengembalikan
     font size ke default panel Label (meta.captionFontSize) & tracking
     ke 0, menghapus override manual.

     Kenapa titik tengahnya diambil dari bar (bukan dihitung ulang dari
     fw/fh/capH seperti di addCaptionBar): bar caption SELALU digambar
     simetris (di-trap sama rata di 4 sisi dari band aslinya - lihat
     addCaptionBar), jadi titik tengah bar SAMA PERSIS dengan titik tengah
     band, tanpa perlu tahu apa-apa soal rotasi/capH/dst di sini. */
  function adjustCaptionOnSlot(item, meta, d) {
    if (!meta || !meta.captionEnabled || !meta.captionText) return false;
    var tf = findCaptionText(item), bar = findCaptionBar(item);
    if (!tf || !bar) return false;
    try {
      if (d.reset) {
        tf.textRange.characterAttributes.size = Math.max(3, num(meta.captionFontSize, 7));
        tf.textRange.characterAttributes.tracking = 0;
        meta.captionFontSizeOverride = null;
        meta.captionTracking = 0;
      } else {
        if (d.fontSize) {
          var curSize = num(tf.textRange.characterAttributes.size, num(meta.captionFontSize, 7));
          var newSize = Math.max(3, Math.min(200, curSize + num(d.fontSize, 0)));
          tf.textRange.characterAttributes.size = newSize;
          meta.captionFontSizeOverride = newSize;
        }
        if (d.tracking) {
          var curTrack = num(tf.textRange.characterAttributes.tracking, 0);
          var newTrack = Math.max(-500, Math.min(1000, curTrack + num(d.tracking, 0)));
          tf.textRange.characterAttributes.tracking = newTrack;
          meta.captionTracking = newTrack;
        }
      }
    } catch (eAttr) {}
    try {
      app.redraw();
      var barCx = bar.left + bar.width / 2;
      var barCy = bar.top - bar.height / 2;
      var vb = tf.visibleBounds;
      tf.translate(barCx - (vb[0] + vb[2]) / 2, barCy - (vb[1] + vb[3]) / 2);
    } catch (eCenter) {}
    setMeta(item, meta);
    return true;
  }

  /* addCaptionBar: gambar bar putih + teks (mis. "NAMA SEKOLAH") menempel
     di SATU SISI frame slot, di dalam clipGroup yang sama dengan foto -
     supaya ikut ter-nudge/duplicate/delete/rotate sebagai satu kesatuan
     dengan slot-nya (persis seperti bgRect), dan ikut terbungkus offset
     border yang sudah ada (border tetap digambar mengelilingi fw x fh
     PENUH, tidak berubah - lihat drawOffsetBorder). capH dalam POINT
     (bukan mm) - konversi sudah dilakukan pemanggil.

     rotation: derajat rotasi FOTO di slot ini (slot.rotation, biasanya 0
     atau 90 dari hasil packing layout-engine). Kalau 0: bar jadi strip
     horizontal di TEPI BAWAH (lebar fw, tinggi capH), teks datar. Kalau
     90 (dirotasi): bar dipindah jadi strip VERTIKAL di TEPI KANAN (lebar
     capH, tinggi fh) dan teksnya ikut diputar 90 derajat supaya lurus
     dengan orientasi foto - PENTING: bar-nya sendiri yang dipindah ke
     sisi lain (bukan cuma teksnya diputar di posisi lama), karena teks
     panjang yang diputar 90 derajat di tempat akan jauh lebih TINGGI
     dari capH dan malah menembus ke area foto (createSlot() juga
     mempersempit photoFrame dari sisi kanan, bukan dari bawah, ketika
     rotasi aktif - lihat di sana). */
  /* CATATAN PENTING soal fw/fh/capH di fungsi ini: caller (createSlot)
     SENGAJA mengirim versi frame & capH yang sudah "diperbesar" supaya
     mencakup margin offsetBorder di sisi caption (lihat komentar di
     createSlot, dekat variabel fwClip/fhClip/capHVisual) - BUKAN ukuran
     fisik fw/fh/capH asli. Fungsi ini sendiri tidak perlu tahu-menahu
     soal offsetBorder; ia cuma menggambar & meng-center bar+teks di
     dalam band capH x (fw atau fh) yang diberikan, sama seperti
     sebelumnya. Bar+teks tetap anak dari clipGroup (BUKAN dipindah ke
     parent) supaya nudge/rotate90/duplicate/delete slot yang sudah ada
     (semua bekerja dengan me-rigid-transform clipGroup sebagai satu
     kesatuan) tidak perlu diubah sama sekali. */
  
```
