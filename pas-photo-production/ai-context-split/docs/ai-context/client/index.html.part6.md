<!-- AI CONTEXT | original: client/index.html | part 6 dari 6 | TAB: LABEL - bar teks (mis. nama sekolah) di bagian bawah tiap foto, di dalam frame + border yang sama (lihat createSlot() / addCaptionBar() di host/main.jsx). Resolusi teks per slot: baris Order Ukuran > foto sumber > default global di sini.; MODAL: Buat Dokumen Baru - pilih ukuran A4 / A5 -->
```html
<!-- ============================================================
       TAB: LABEL - bar teks (mis. nama sekolah) di bagian bawah tiap
       foto, di dalam frame + border yang sama (lihat createSlot() /
       addCaptionBar() di host/main.jsx). Resolusi teks per slot:
       baris Order Ukuran > foto sumber > default global di sini.
       ============================================================ -->
  <div class="tab-panel" id="tabLabel" role="tabpanel" aria-labelledby="tabBtnLabel">
    <section class="card">
      <div class="card-head">
        <h2><svg class="ic"><use xlink:href="#i-tag"/></svg>Label Teks di Bawah Foto</h2>
      </div>

      <label class="check">
        <input type="checkbox" id="capEnabled" />
        <span><b>Aktifkan label</b>
          <small>Tambahkan bar putih + teks (mis. nama sekolah) di bagian bawah tiap foto, di dalam border yang sama - tidak menambah ukuran fisik cetak, hanya memotong sedikit area foto.</small>
        </span>
      </label>

      <div id="capBody" class="field-grid" style="margin-top:10px">
        <label>Teks default (global)
          <input id="capText" class="input" type="text" placeholder="mis. NAMA SEKOLAH" />
        </label>
        <label>Tinggi bar (mm)
          <input id="capHeight" class="input" type="number" min="1" step="0.5" value="8" />
        </label>
        <label>Ukuran font (pt)
          <input id="capFontSize" class="input" type="number" min="3" step="0.5" value="7" />
        </label>
        <label class="check">
          <input type="checkbox" id="capBold" />
          <span><b>Bold</b></span>
        </label>
        <label class="check">
          <input type="checkbox" id="capUppercase" />
          <span><b>UPPERCASE</b></span>
        </label>
      </div>

      <p class="hint">
        <svg class="ic"><use xlink:href="#i-info"/></svg>
        <span>Teks default di atas dipakai untuk SEMUA foto, kecuali di-override per foto atau per baris Order Ukuran di bawah.</span>
      </p>
    </section>

    <section class="card card--navy">
      <div class="card-head">
        <h2><svg class="ic"><use xlink:href="#i-image"/></svg>Override per Foto Sumber</h2>
      </div>
      <div class="cap-override-list" id="capPhotoList"></div>
    </section>

    <section class="card">
      <div class="card-head">
        <h2><svg class="ic"><use xlink:href="#i-rows"/></svg>Override per Ukuran (Order)</h2>
      </div>
      <div class="cap-override-list" id="capItemList"></div>
    </section>
  </div>
</main>

<div class="toast" id="toast"></div>

<!-- ============================================================
     MODAL: Buat Dokumen Baru - pilih ukuran A4 / A5
     ============================================================ -->
<div class="modal-overlay" id="createDocModal" hidden>
  <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="createDocModalTitle">
    <div class="modal-head">
      <h3 id="createDocModalTitle"><svg class="ic"><use xlink:href="#i-doc"/></svg>Buat Dokumen Baru</h3>
      <button type="button" class="modal-x" id="createDocModalClose" aria-label="Tutup">&times;</button>
    </div>
    <p class="modal-desc">Pilih ukuran dokumen yang akan dibuat di Illustrator.</p>
    <div class="modal-size-grid">
      <button type="button" class="size-choice" data-size="A4">
        <span class="size-choice-swatch size-choice-a4"></span>
        <span class="size-choice-name">A4</span>
        <span class="size-choice-dim">210 &times; 297 mm</span>
      </button>
      <button type="button" class="size-choice" data-size="A5">
        <span class="size-choice-swatch size-choice-a5"></span>
        <span class="size-choice-name">A5</span>
        <span class="size-choice-dim">148 &times; 210 mm</span>
      </button>
    </div>
    <button type="button" class="btn block ghost" id="createDocModalCancel">Batal</button>
  </div>
</div>

<script src="../lib/CSInterface.js"></script>
<script src="js/state.js"></script>
<script src="js/bridge.js"></script>
<script src="js/layout-engine.js"></script>
<script src="js/app.js"></script>
</body>
</html>
```
