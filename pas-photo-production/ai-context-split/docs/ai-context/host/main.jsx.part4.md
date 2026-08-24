<!-- AI CONTEXT | original: host/main.jsx | part 4 dari 11 | addCaptionBar -->
```jsx
function addCaptionBar(clipGroup, top, left, fw, fh, capH, text, style, baseName, rotation) {
    if (capH <= 0 || !text) return;
    var rotated = !!rotation;
    var bandLeft, bandTop, bandW, bandH;
    if (rotated) {
      bandW = capH; bandH = fh;
      bandLeft = left + (fw - capH);
      bandTop = top;
    } else {
      bandW = fw; bandH = capH;
      bandLeft = left;
      bandTop = top - (fh - capH);
    }
    /* Titik tengah band dihitung SEKALI di sini (bukan di dalam try block
       nanti) supaya tetap tersedia untuk langkah re-centering SETELAH
       rotate() di bawah, terlepas dari isi try block itu berhasil atau
       tidak - lihat catatan di dekat tf.rotate(). */
    var bandCenterX = bandLeft + bandW / 2;
    var bandCenterY = bandTop - bandH / 2;
    /* TRAP: bar digambar sedikit LEBIH BESAR (1.2pt tiap sisi) daripada
       ukuran band sebenarnya, lalu kelebihannya otomatis terpotong rapi
       oleh clip mask (fw x fh) yang sudah ada. Ini standar trik prepress
       untuk menghindari "hairline gap" - garis rambut tipis berwarna
       background yang kadang muncul di sambungan dua shape yang cuma
       bersebelahan pas (tanpa overlap) akibat pembulatan saat
       render/export. */
    var TRAP = 1.2;
    var bar = clipGroup.pathItems.rectangle(bandTop + TRAP, bandLeft - TRAP, bandW + TRAP * 2, bandH + TRAP * 2);
    bar.name = baseName + " (CAPTION BG)";
    bar.filled = true;
    bar.fillColor = rgb(255, 255, 255);
    bar.stroked = false;
    markCaptionPart(bar);
    /* PLACEATBEGINNING (bukan END): caption harus di DEPAN foto. fitMode
       "fill" bisa membuat foto meluber sedikit di luar photoFrame yang
       sudah dipersempit (area luber itu TIDAK ter-clip karena clip mask
       tetap penuh) - kalau caption ditaruh di BELAKANG foto, luberan itu
       akan menutupi bar+teksnya sampai keduanya tak terlihat sama
       sekali. */
    try { bar.move(clipGroup, ElementPlacement.PLACEATBEGINNING); } catch (eMv) {}

    var displayText = style.uppercase ? String(text).toUpperCase() : String(text);
    var tf = clipGroup.textFrames.pointText([bandLeft, bandTop]);
    tf.name = baseName + " (CAPTION TEXT)";
    tf.contents = displayText;
    markCaptionPart(tf);
    try {
      tf.textRange.characterAttributes.size = Math.max(4, num(style.fontSize, 7));
      tf.textRange.characterAttributes.tracking = num(style.tracking, 0);
      tf.textRange.characterAttributes.fillColor = rgb(0, 0, 0);
      var fontName = style.bold ? "Arial-BoldMT" : "ArialMT";
      try { tf.textRange.characterAttributes.textFont = app.textFonts.getByName(fontName); }
      catch (eFont) {
        /* Font PostScript name di atas mungkin tidak terpasang di mesin ini -
           biarkan Illustrator pakai font default dokumen daripada gagal total. */
      }
    } catch (eAttr) {}
    try {
      app.redraw();
      /* visibleBounds (bukan .width/.height/.left/.top): ini bounding box
         VISUAL hasil render yang sebenarnya - untuk pointText, properti
         .left/.top/.width/.height kadang mengikuti metrik "frame" teks
         (termasuk sedikit ruang ascender/descender font) yang tidak
         persis sama dengan tinta yang benar-benar tampak, jadi kalau
         dipakai untuk centering hasilnya bisa sedikit meleset - itu
         penyebab teks kelihatan tidak pas di tengah. visibleBounds =
         [left, top, right, bottom]. */
      var vb = tf.visibleBounds;
      var tw = vb[2] - vb[0], th = vb[1] - vb[3];
      /* Auto-FIT dua sumbu (bukan cuma auto-shrink satu sumbu seperti versi
         lama): dicari skala terbesar yang MASIH muat di sumbu "panjang"
         band (bandW kalau horizontal / bandH kalau band tegak hasil
         rotasi) DAN sumbu "tebal" band (bandH kalau horizontal / bandW
         kalau tegak) sekaligus - dipakai yang paling ketat di antara
         keduanya, bisa membesarkan MAUPUN mengecilkan, dibatasi maksimal
         4x fontSize panel dan minimal 3pt. DILEWATI kalau style.autoFit
         === false (slot ini punya font size manual dari api.captionAdjust
         - lihat adjustCaptionOnSlot) supaya pilihan manual user TIDAK
         ditimpa ulang oleh auto-fit setiap kali generate ulang. */
      if (style.autoFit !== false) {
        var lenAvail = (rotated ? bandH : bandW) - 4;
        var thickAvail = (rotated ? bandW : bandH) - 4;
        if (lenAvail > 1 && thickAvail > 1 && tw > 0 && th > 0) {
          var fitScale = Math.min(lenAvail / tw, thickAvail / th);
          var baseSize = tf.textRange.characterAttributes.size;
          var newSize = Math.max(3, Math.min(baseSize * fitScale, baseSize * 4));
          if (Math.abs(newSize - baseSize) > 0.05) {
            try { tf.textRange.characterAttributes.size = newSize; } catch (eShrink) {}
            app.redraw();
            vb = tf.visibleBounds;
            tw = vb[2] - vb[0]; th = vb[1] - vb[3];
          }
        }
      }
      /* Geser (relatif, bukan set absolut) supaya titik tengah bounding
         box VISUAL teks pas jatuh di titik tengah band - jauh lebih
         akurat daripada menghitung lewat .left/.top. */
      var curCenterX = (vb[0] + vb[2]) / 2;
      var curCenterY = (vb[1] + vb[3]) / 2;
      tf.translate(bandCenterX - curCenterX, bandCenterY - curCenterY);
    } catch (eCenter) {}
    if (rotated) {
      try { tf.rotate(rotation, true, true, true, true, Transformation.CENTER); } catch (eRot) {}
      /* Re-center SETELAH rotasi: Transformation.CENTER di Illustrator
         berputar mengelilingi titik tengah GEOMETRIC bounds teks (metrik
         frame font, termasuk ascender/descender), yang bisa sedikit
         berbeda dari titik tengah visibleBounds (tinta yang benar-benar
         tampak) yang dipakai untuk centering di atas - selisih itu yang
         bikin teks kelihatan geser dari tengah band begitu diputar 90
         derajat (paling kelihatan di slot besar seperti 4x6). Ukur ulang
         visibleBounds lalu geser sekali lagi ke bandCenter supaya benar-
         benar pas di tengah, apa pun anchor yang dipakai rotate(). */
      try {
        app.redraw();
        var vb2 = tf.visibleBounds;
        tf.translate(bandCenterX - (vb2[0] + vb2[2]) / 2, bandCenterY - (vb2[1] + vb2[3]) / 2);
      } catch (eRecenter) {}
    }
    try { tf.move(clipGroup, ElementPlacement.PLACEATBEGINNING); } catch (eMv2) {}
  }

  /* override (opsional): hasil edit manual pada slot dengan slotId yang sama
     dari generate SEBELUMNYA (lihat collectPreservedState + api.generate).
     Kalau ada, background/foto sumber/crop/flip/ukuran-font-label/tracking-
     label dari override dipakai menggantikan nilai default baris pesanan
     (slot.* / captionOpts.*) - TIDAK termasuk rotasi (slot.rotation tetap
     dipakai apa adanya dari hasil packing terbaru, karena rotasi itu bagian
     dari keputusan susun-ulang layout, bukan atribut visual independen). */
  
```
