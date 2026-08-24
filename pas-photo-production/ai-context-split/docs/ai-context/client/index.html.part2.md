<!-- AI CONTEXT | original: client/index.html | part 2 dari 6 | TAB BAR: "Setup" (kartu 1-4, alur sebelum generate) vs "Slot Editor" (kartu 5, kerja di dokumen yang sudah di-generate). Slot Editor dipisah jadi tab sendiri karena dia baca seleksi kanvas Illustrator langsung (poll refreshSelection tiap 1.4 detik di app.js) - independen dari Preview, jadi aman disembunyikan tanpa mengganggu apa pun. Pindah tab dilakukan manual oleh user (tidak auto-pindah setelah Generate).; 1. PHOTO SOURCE; 2. ORDER -->
```html
<!-- ============================================================
       TAB BAR: "Setup" (kartu 1-4, alur sebelum generate) vs
       "Slot Editor" (kartu 5, kerja di dokumen yang sudah di-generate).
       Slot Editor dipisah jadi tab sendiri karena dia baca seleksi
       kanvas Illustrator langsung (poll refreshSelection tiap 1.4 detik
       di app.js) - independen dari Preview, jadi aman disembunyikan
       tanpa mengganggu apa pun. Pindah tab dilakukan manual oleh user
       (tidak auto-pindah setelah Generate).
       ============================================================ -->
  <div class="tab-bar" role="tablist">
    <button type="button" class="tab-btn active" id="tabBtnSetup" role="tab" aria-selected="true" aria-controls="tabSetup">
      <svg class="ic ic-sm"><use xlink:href="#i-sliders"/></svg>Setup
    </button>
    <button type="button" class="tab-btn" id="tabBtnEditor" role="tab" aria-selected="false" aria-controls="tabEditor">
      <svg class="ic ic-sm"><use xlink:href="#i-target"/></svg>Slot Editor
    </button>
    <button type="button" class="tab-btn" id="tabBtnLabel" role="tab" aria-selected="false" aria-controls="tabLabel">
      <svg class="ic ic-sm"><use xlink:href="#i-tag"/></svg>Label
    </button>
  </div>

  <div class="tab-panel active" id="tabSetup" role="tabpanel" aria-labelledby="tabBtnSetup">
  <div class="layout">
    <div class="col col-a">

      <!-- ============ 1. PHOTO SOURCE ============ -->
      <section class="card card--navy">
        <div class="card-head">
          <h2><span class="step-badge">1</span><svg class="ic"><use xlink:href="#i-image"/></svg>Sumber Foto</h2>
          <div class="head-actions">
            <button id="btnAddPhoto" class="btn small accent-soft"><svg class="ic ic-sm"><use xlink:href="#i-plus"/></svg>Tambah Foto</button>
            <button id="btnFromSelection" class="btn small ghost" title="Ambil foto dari objek yang dipilih di Illustrator"><svg class="ic ic-sm"><use xlink:href="#i-pointer"/></svg>Dari Seleksi</button>
          </div>
        </div>

        <div class="dropzone" id="dropZone">
          <div class="photo-grid" id="photoGrid"></div>
          <p id="photoHint">
            <svg class="ic"><use xlink:href="#i-upload"/></svg>
            <span>Drag &amp; drop file JPG / PNG / TIFF ke sini, atau klik <b>+ Tambah Foto</b>.</span>
          </p>
        </div>
      </section>

      <!-- ============ 2. ORDER ============ -->
      <section class="card">
        <div class="card-head">
          <h2><span class="step-badge">2</span><svg class="ic"><use xlink:href="#i-rows"/></svg>Order Ukuran</h2>
          <div class="head-actions">
            <select id="sizePreset" class="input tiny"></select>
            <button id="btnAddItem" class="btn small accent-soft"><svg class="ic ic-sm"><use xlink:href="#i-plus"/></svg>Tambah</button>
          </div>
        </div>

        <div class="order-legend">
          <span>Ukuran</span><i></i>
          <span>Lebar mm</span><i></i>
          <span>Tinggi mm</span><i></i>
          <span>Qty</span>
        </div>
        <div class="order-list" id="orderList"></div>
        <p class="hint" id="orderHint">
          <svg class="ic"><use xlink:href="#i-info"/></svg>
          <span>Belum ada ukuran. Tambahkan minimal satu baris.</span>
        </p>
        <button id="btnPrintPackage" class="btn block outline-accent"><svg class="ic"><use xlink:href="#i-grid"/></svg>Paket Cetak Foto (4x6=4, 3x4=4, 2x3=6)</button>
      </section>

      
```
