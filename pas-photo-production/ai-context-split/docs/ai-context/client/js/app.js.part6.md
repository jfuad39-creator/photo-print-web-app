<!-- AI CONTEXT | original: client/js/app.js | part 6 dari 8 | openCreateDocModal, closeCreateDocModal, runCreateDocument, syncMediaTypeFromModal, setEditorEnabled, bgLiveIndicatorHtml -->
```javascript


  $("#btnPreview").onclick = preview;

  /* ---------------- generate ---------------- */
  $("#btnGenerate").onclick = function () {
    if (!lastLayout) preview();
    if (!lastLayout) return toast("Layout belum siap.", "err");
    if (!B.isCEP) return toast("Buka panel di dalam Illustrator untuk generate.", "err");

    var st = S.get();
    var btn = $("#btnGenerate");
    /* FIX: tombol #btnGenerate terdiri dari 2 <span> terpisah
       (.btn-generate-label + .btn-generate-icon) yang di-style theme.css
       menjadi bentuk pill dengan kapsul ikon menempel di ujung kanan
       (lihat CSS #btnGenerate.btn.primary). Sebelumnya kode ini memakai
       btn.textContent = "..." untuk menampilkan status "Generating..." /
       mengembalikan label semula - ini MENIMPA SELURUH isi HTML tombol
       (kedua span ikut terhapus, diganti satu text node polos), sehingga
       struktur pill + kapsul ikon hilang begitu tombol pernah dipakai
       sekali. Perbaikan: hanya ubah teks di dalam span label-nya saja,
       span ikon (dan seluruh struktur/CSS pill) tidak pernah disentuh -
       tampilan tombol jadi tetap konsisten seperti saat pertama kali
       di-load, sebelum maupun sesudah generate. */
    var btnLabel = btn.querySelector(".btn-generate-label");
    btn.disabled = true;
    if (btnLabel) btnLabel.textContent = "Generating\u2026";
    else btn.textContent = "\u23f3 Generating\u2026";

    B.call("generate", {
      layout: lastLayout,
      grouping: st.options.grouping,
      artboards: st.options.artboards !== false,
      replace: st.options.replacePrev !== false
    }, function (res) {
      btn.disabled = false;
      if (btnLabel) btnLabel.textContent = "Generate ke Illustrator";
      else btn.textContent = "\u26a1 Generate ke Illustrator";
      toast(res.message, res.ok ? "ok" : "err");
    });
  };

  $("#btnUngroup").onclick = function () {
    if (!B.isCEP) return toast("Hanya tersedia di dalam Illustrator.", "err");
    B.call("ungroupAll", {}, function (res) { toast(res.message, res.ok ? "ok" : "err"); });
  };

  $("#btnResetArtboard").onclick = function () {
    if (!B.isCEP) return toast("Hanya tersedia di dalam Illustrator.", "err");
    var btn = $("#btnResetArtboard");
    btn.disabled = true;
    B.call("resetArtboard", {}, function (res) {
      btn.disabled = false;
      toast(res.message, res.ok ? "ok" : "err");
      refreshSelection(true);
    });
  };

  $("#btnUndo").onclick = function () {
    B.call("undo", {}, function (res) { toast(res.message, res.ok ? "ok" : "err"); });
  };

  /* ---------------- modal: buat dokumen baru (pilih ukuran A4/A5) ----------------
     Sebelumnya tombol "Doc" langsung membuat dokumen sesuai ukuran yang aktif
     di dropdown Media & Layout (step 3). Sekarang selalu munculkan popup agar
     user memilih tegas antara A4 atau A5 sebelum dokumen dibuat, terlepas dari
     apa pun yang sedang dipilih di dropdown Media. */
  function openCreateDocModal() {
    var modal = $("#createDocModal");
    if (!modal) return;
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add("open"); });
  }
  function closeCreateDocModal() {
    var modal = $("#createDocModal");
    if (!modal) return;
    modal.classList.remove("open");
    setTimeout(function () { modal.hidden = true; }, 160);
  }
  function runCreateDocument(sizeType) {
    var st = S.get();
    var btn = $("#btnCreateDoc");
    var label = btn.querySelector("span");
    var labelText = label ? label.textContent : "";
    btn.disabled = true;
    if (label) label.textContent = "\u2026";
    B.call("createDocument", {
      media: {
        type: sizeType,
        orientation: st.media.orientation,
        customWidth: st.media.customWidth,
        customHeight: st.media.customHeight
      }
    }, function (res) {
      btn.disabled = false;
      if (label) label.textContent = labelText;
      toast(res.message, res.ok ? "ok" : "err");
    });
  }
  /* Sinkronkan ukuran yang dipilih di popup (A4/A5) ke dropdown Media di
     card "Media & Layout" (step 3), supaya keduanya selalu sama begitu
     dokumen dibuat lewat popup. Fungsi ini HANYA dipanggil dari pilihan
     popup (yang memang cuma berisi A4 & A5) - ukuran lain di dropdown
     Media (A3, A6, Letter, 4R, dst) tetap sepenuhnya independen dan hanya
     bisa diubah langsung dari card Media & Layout seperti biasa. */
  function syncMediaTypeFromModal(sizeType) {
    var st = S.get();
    st.media.type = sizeType;
    S.save();
    bindOptions();
    preview();
  }

  $("#btnCreateDoc").onclick = function () {
    if (!B.isCEP) return toast("Hanya tersedia di dalam Illustrator.", "err");
    if ($("#btnCreateDoc").disabled) return;
    openCreateDocModal();
  };
  $("#createDocModalClose").onclick = closeCreateDocModal;
  $("#createDocModalCancel").onclick = closeCreateDocModal;
  $("#createDocModal").onclick = function (e) {
    if (e.target === $("#createDocModal")) closeCreateDocModal();
  };
  $$(".size-choice").forEach(function (b) {
    b.onclick = function () {
      var size = b.getAttribute("data-size");
      closeCreateDocModal();
      syncMediaTypeFromModal(size);
      runCreateDocument(size);
    };
  });

  $("#btnPrint").onclick = function () {
    if (!B.isCEP) return toast("Hanya tersedia di dalam Illustrator.", "err");
    var btn = $("#btnPrint");
    btn.disabled = true;
    B.call("print", {}, function (res) {
      btn.disabled = false;
      toast(res.message, res.ok ? "ok" : "err");
    });
  };

  /* ---------------- reset ---------------- */
  $("#btnReset").onclick = function () {
    S.reset();
    renderSizePresets();
    renderPhotos();
    renderOrder();
    bindOptions();
    pendingBg = "";
    renderEditBgSwatches();
    preview();
    toast("Semua parameter direset ke default.", "ok");
  };

  /* ---------------- editor ---------------- */
  function setEditorEnabled(on) {
    $("#editorBody").className = "editor" + (on ? "" : " disabled");
  }

  /* indikator kecil warna background TERKINI dari slot yang sedang
     terpilih - dibaca ulang dari dokumen lewat selectionInfo (field
     backgroundColor/bgColors/bgMixed, lihat host/main.jsx), BUKAN dari
     pendingBg (yang cuma warna yang lagi dipilih di swatch, belum tentu
     sudah diterapkan). Dipanggil dari refreshSelection supaya area Slot
     Editor langsung menunjukkan hasil background terbaru setiap kali
     seleksi berubah ATAU setelah tombol "Terapkan ke Slot Terpilih" /
     "Terapkan ke Ukuran Ini" diklik - tanpa perlu lihat langsung ke
     kanvas Illustrator. */
  function bgLiveIndicatorHtml(d) {
    if (d.bgMixed) {
      return '<div class="bg-live"><span class="bg-live-dot mixed" title="Warna background berbeda-beda di antara slot terpilih"></span>' +
        '<span>Background saat ini: <b>campuran</b> (' + d.bgColors.length + ' warna)</span></div>';
    }
    var hex = d.backgroundColor || "";
    var label = hex ? hex : "Transparan";
    var style = hex ? ' style="background:' + esc(hex) + '"' : "";
    return '<div class="bg-live"><span class="bg-live-dot' + (hex ? "" : " none") + '"' + style + '></span>' +
      '<span>Background saat ini: <b>' + esc(label) + '</b></span></div>';
  }

  /* Indikator ukuran font & tracking label SAAT INI - cuma ditampilkan
     kalau tepat SATU slot terpilih dan slot itu punya label aktif (untuk
     seleksi banyak slot, nilainya bisa beda-beda per slot jadi tidak
     ditampilkan, sama seperti alasan bgMixed di atas hanya menghitung
     jumlah warna, bukan menampilkan angka tunggal). */
  
```
