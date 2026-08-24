<!-- AI CONTEXT | original: client/index.html | part 4 dari 6 | 4. PREVIEW; 5. EDITOR; GANTI BACKGROUND (slot yang SUDAH di-generate) ============ Kotak ini SENGAJA ditaruh DI LUAR #editorBody (sebelum ".editor-panel" di bawah) supaya tidak ikut ter-disable saat tidak ada seleksi di kanvas - karena tombol "Terapkan ke Ukuran Ini" (btnBgApplySize) memang dirancang untuk bekerja pada SEMUA slot berukuran sama di seluruh dokumen tanpa perlu ada seleksi aktif sama sekali. STRUKTUR LAYOUT: kotak ini ditaruh di ATAS ".editor-panel" (bukan di bawah seperti sebelumnya) supaya kontrol background yang "selalu aktif" langsung terlihat duluan, sebelum bagian posisi/crop/duplikat yang bisa redup (disabled) saat tidak ada slot terpilih. ".bg-editor-box" tetap berdiri sebagai kotak sendiri, setara dengan ".editor-panel" - lengkap dengan kepala kotak sendiri + badge "Selalu aktif" di kanan supaya statusnya langsung kebaca tanpa perlu baca teks. -->
```html
<!-- ============ 4. PREVIEW ============ -->
      <section class="card preview-card card--yellow">
        <div class="card-head">
          <h2><span class="step-badge">4</span><svg class="ic"><use xlink:href="#i-eye"/></svg>Preview</h2>
          <button id="btnPreview" class="btn small outline-accent"><svg class="ic ic-sm"><use xlink:href="#i-refresh"/></svg>Refresh Preview</button>
        </div>

        <div class="preview-box" id="preview"></div>
        <p class="msg" id="previewMsg"></p>

        <div class="generate-wrap">
          <button id="btnGenerate" class="btn block primary"><span class="btn-generate-label">Generate ke Illustrator</span><span class="btn-generate-icon"><svg class="ic"><use xlink:href="#i-bolt"/></svg></span></button>
          <p class="generate-note">Pastikan dokumen Illustrator sudah terbuka sebelum generate.</p>
        </div>
      </section>
    </div>
  </div>
  </div>

  <div class="tab-panel" id="tabEditor" role="tabpanel" aria-labelledby="tabBtnEditor">
      <!-- ============ 5. EDITOR ============ -->
      <section class="card card--red">
        <div class="card-head">
          <h2><span class="step-badge">5</span><svg class="ic"><use xlink:href="#i-target"/></svg>Slot Editor</h2>
          <button id="btnRefreshSel" class="btn small ghost" title="Refresh info seleksi" aria-label="Refresh info seleksi"><svg class="ic ic-sm"><use xlink:href="#i-refresh"/></svg></button>
        </div>

        <!-- ============ GANTI BACKGROUND (slot yang SUDAH di-generate) ============
             Kotak ini SENGAJA ditaruh DI LUAR #editorBody (sebelum
             ".editor-panel" di bawah) supaya tidak ikut ter-disable saat
             tidak ada seleksi di kanvas - karena tombol "Terapkan ke Ukuran
             Ini" (btnBgApplySize) memang dirancang untuk bekerja pada SEMUA
             slot berukuran sama di seluruh dokumen tanpa perlu ada seleksi
             aktif sama sekali.

             STRUKTUR LAYOUT: kotak ini ditaruh di ATAS ".editor-panel"
             (bukan di bawah seperti sebelumnya) supaya kontrol background
             yang "selalu aktif" langsung terlihat duluan, sebelum bagian
             posisi/crop/duplikat yang bisa redup (disabled) saat tidak ada
             slot terpilih. ".bg-editor-box" tetap berdiri sebagai kotak
             sendiri, setara dengan ".editor-panel" - lengkap dengan kepala
             kotak sendiri + badge "Selalu aktif" di kanan supaya statusnya
             langsung kebaca tanpa perlu baca teks. -->
        <div class="bg-editor-box">
          <div class="bg-editor-head">
            <div class="field-label"><svg class="ic"><use xlink:href="#i-image"/></svg>Ganti Background Foto</div>
            <span class="bg-editor-badge"><svg class="ic ic-sm"><use xlink:href="#i-bolt"/></svg>Selalu aktif</span>
          </div>
          <div class="bg-row" id="editBgSwatches"></div>
          <div class="bg-apply-row">
            <button id="btnBgApplySel" class="btn accent-soft" disabled title="Terapkan warna di atas ke slot yang sedang dipilih di kanvas Illustrator">
              <svg class="ic ic-sm"><use xlink:href="#i-pointer"/></svg>Terapkan ke Slot Terpilih
            </button>
          </div>
          <div class="bg-apply-row">
            <select id="bgSizeTarget" class="input"></select>
            <button id="btnBgApplySize" class="btn primary" title="Terapkan warna di atas ke SEMUA slot dengan ukuran ini di seluruh dokumen, tanpa perlu select satu-satu">
              <svg class="ic ic-sm"><use xlink:href="#i-grid"/></svg>Terapkan ke Ukuran Ini
            </button>
          </div>
          <p class="hint">
            <svg class="ic"><use xlink:href="#i-info"/></svg>
            <span>Pilih warna di atas, lalu terapkan ke slot terpilih atau ke semua slot dengan ukuran yang sama (misal semua 3x4) sekaligus.</span>
          </p>
        </div>

        
```
