<!-- AI CONTEXT | original: client/index.html | part 5 dari 6 | FONT & KERNING LABEL PER UKURAN ============ Sama seperti kotak Ganti Background di atas, kotak ini SENGAJA "selalu aktif" (di luar #editorBody) karena tombol Terapkan-nya bekerja lewat sizeId ke SEMUA slot berukuran sama di dokumen, tidak butuh seleksi aktif di kanvas. Untuk atur font/kerning HANYA pada slot yang sedang dipilih, pakai tombol +/- di kotak "Font & kerning label" dalam ".pad-grid" di bawah (di dalam #editorBody, otomatis nonaktif kalau tidak ada seleksi). -->
```html
<!-- ============ FONT & KERNING LABEL PER UKURAN ============
             Sama seperti kotak Ganti Background di atas, kotak ini SENGAJA
             "selalu aktif" (di luar #editorBody) karena tombol Terapkan-nya
             bekerja lewat sizeId ke SEMUA slot berukuran sama di dokumen,
             tidak butuh seleksi aktif di kanvas. Untuk atur font/kerning
             HANYA pada slot yang sedang dipilih, pakai tombol +/- di kotak
             "Font & kerning label" dalam ".pad-grid" di bawah (di dalam
             #editorBody, otomatis nonaktif kalau tidak ada seleksi). -->
        <div class="bg-editor-box">
          <div class="bg-editor-head">
            <div class="field-label"><svg class="ic"><use xlink:href="#i-tag"/></svg>Font &amp; Kerning Label per Ukuran</div>
            <span class="bg-editor-badge"><svg class="ic ic-sm"><use xlink:href="#i-bolt"/></svg>Selalu aktif</span>
          </div>
          <div class="bg-apply-row">
            <input id="capSizeFontDelta" class="input" type="number" step="0.5" placeholder="+/- pt font" />
            <input id="capSizeTrackDelta" class="input" type="number" step="10" placeholder="+/- tracking" />
          </div>
          <div class="bg-apply-row">
            <select id="capSizeTarget" class="input"></select>
            <button id="btnCapApplySize" class="btn primary" title="Terapkan delta ukuran font / tracking di atas ke SEMUA slot dengan ukuran ini yang punya label aktif">
              <svg class="ic ic-sm"><use xlink:href="#i-grid"/></svg>Terapkan ke Ukuran Ini
            </button>
          </div>
          <p class="hint">
            <svg class="ic"><use xlink:href="#i-info"/></svg>
            <span>Isi salah satu atau kedua kolom di atas (delta, bukan nilai mutlak - ditambahkan ke ukuran yang sedang aktif di tiap slot), lalu terapkan ke semua slot dengan ukuran yang sama (misal semua 4x6) sekaligus.</span>
          </p>
        </div>

        <div class="editor-panel">
          <div class="sel-info empty" id="selInfo">Tidak ada slot terpilih di Illustrator.</div>

          <div id="editorBody" class="editor disabled">
            <div class="pad-grid">
              <div class="pad-box">
                <div class="field-label"><svg class="ic"><use xlink:href="#i-target"/></svg>Posisi slot (mm)</div>
                <div class="dpad">
                  <button class="btn" data-nudge="-1,-1" title="Kiri atas" aria-label="Geser kiri atas">&#8598;</button>
                  <button class="btn" data-nudge="0,-1" title="Atas" aria-label="Geser atas"><svg class="ic"><use xlink:href="#i-up"/></svg></button>
                  <button class="btn" data-nudge="1,-1" title="Kanan atas" aria-label="Geser kanan atas">&#8599;</button>
                  <button class="btn" data-nudge="-1,0" title="Kiri" aria-label="Geser kiri"><svg class="ic"><use xlink:href="#i-left"/></svg></button>
                  <span class="dpad-center"><svg class="ic"><use xlink:href="#i-target"/></svg></span>
                  <button class="btn" data-nudge="1,0" title="Kanan" aria-label="Geser kanan"><svg class="ic"><use xlink:href="#i-right"/></svg></button>
                  <button class="btn" data-nudge="-1,1" title="Kiri bawah" aria-label="Geser kiri bawah">&#8601;</button>
                  <button class="btn" data-nudge="0,1" title="Bawah" aria-label="Geser bawah"><svg class="ic"><use xlink:href="#i-down"/></svg></button>
                  <button class="btn" data-nudge="1,1" title="Kanan bawah" aria-label="Geser kanan bawah">&#8600;</button>
                </div>
              </div>

              <div class="pad-box">
                <div class="field-label"><svg class="ic"><use xlink:href="#i-crop"/></svg>Crop foto (mm)</div>
                <div class="dpad">
                  <button class="btn" data-crop="-1,-1" title="Kiri atas" aria-label="Crop kiri atas">&#8598;</button>
                  <button class="btn" data-crop="0,-1" title="Atas" aria-label="Crop atas"><svg class="ic"><use xlink:href="#i-up"/></svg></button>
                  <button class="btn" data-crop="1,-1" title="Kanan atas" aria-label="Crop kanan atas">&#8599;</button>
                  <button class="btn" data-crop="-1,0" title="Kiri" aria-label="Crop kiri"><svg class="ic"><use xlink:href="#i-left"/></svg></button>
                  <span class="dpad-center"><svg class="ic"><use xlink:href="#i-crop"/></svg></span>
                  <button class="btn" data-crop="1,0" title="Kanan" aria-label="Crop kanan"><svg class="ic"><use xlink:href="#i-right"/></svg></button>
                  <button class="btn" data-crop="-1,1" title="Kiri bawah" aria-label="Crop kiri bawah">&#8601;</button>
                  <button class="btn" data-crop="0,1" title="Bawah" aria-label="Crop bawah"><svg class="ic"><use xlink:href="#i-down"/></svg></button>
                  <button class="btn" data-crop="1,1" title="Kanan bawah" aria-label="Crop kanan bawah">&#8600;</button>
                </div>
                <div class="zoom-row">
                  <button class="btn small" data-zoom="-10"><svg class="ic ic-sm"><use xlink:href="#i-zoom-out"/></svg>-10%</button>
                  <button class="btn small" data-zoom="-5">-5%</button>
                  <button class="btn small" data-zoom="5">+5%</button>
                  <button class="btn small" data-zoom="10"><svg class="ic ic-sm"><use xlink:href="#i-zoom-in"/></svg>+10%</button>
                </div>
                <div class="bg-apply-row">
                  <button id="btnResetCrop" class="btn small ghost" title="Reset crop &amp; posisi foto ke tengah">Reset Crop</button>
                </div>
              </div>

              <div class="pad-box">
                <div class="field-label"><svg class="ic"><use xlink:href="#i-copy"/></svg>Duplikat slot (arah)</div>
                <div class="dpad dpad-plus">
                  <button class="btn" data-dup="up" title="Duplikat ke atas" aria-label="Duplikat ke atas"><svg class="ic"><use xlink:href="#i-up"/></svg></button>
                  <button class="btn" data-dup="left" title="Duplikat ke kiri" aria-label="Duplikat ke kiri"><svg class="ic"><use xlink:href="#i-left"/></svg></button>
                  <span class="dpad-center"><svg class="ic"><use xlink:href="#i-copy"/></svg></span>
                  <button class="btn" data-dup="right" title="Duplikat ke kanan" aria-label="Duplikat ke kanan"><svg class="ic"><use xlink:href="#i-right"/></svg></button>
                  <button class="btn" data-dup="down" title="Duplikat ke bawah" aria-label="Duplikat ke bawah"><svg class="ic"><use xlink:href="#i-down"/></svg></button>
                </div>
              </div>

              <div class="pad-box">
                <div class="field-label"><svg class="ic"><use xlink:href="#i-tag"/></svg>Font &amp; kerning label</div>
                <div class="zoom-row">
                  <button class="btn small" data-cap-font="-1">-1pt</button>
                  <button class="btn small" data-cap-font="-0.5">-0.5pt</button>
                  <button class="btn small" data-cap-font="0.5">+0.5pt</button>
                  <button class="btn small" data-cap-font="1">+1pt</button>
                </div>
                <div class="zoom-row">
                  <button class="btn small" data-cap-track="-50">-50</button>
                  <button class="btn small" data-cap-track="-10">-10</button>
                  <button class="btn small" data-cap-track="10">+10</button>
                  <button class="btn small" data-cap-track="50">+50</button>
                </div>
                <div class="bg-apply-row">
                  <button id="btnCapReset" class="btn small ghost" title="Reset ukuran font &amp; tracking label slot terpilih ke default panel Label">Reset Label</button>
                </div>
              </div>
            </div>

            <div class="tool-grid">
              <button id="btnFlipH" class="btn btn-col"><svg class="ic"><use xlink:href="#i-flip-h"/></svg>Flip H</button>
              <button id="btnFlipV" class="btn btn-col"><svg class="ic"><use xlink:href="#i-flip-v"/></svg>Flip V</button>
              <button id="btnRotate" class="btn btn-col"><svg class="ic"><use xlink:href="#i-rotate"/></svg>Rotate 90&deg;</button>
              <button id="btnReplace" class="btn btn-col"><svg class="ic"><use xlink:href="#i-swap"/></svg>Ganti Foto</button>
              <button id="btnDelete" class="btn btn-col danger"><svg class="ic"><use xlink:href="#i-trash"/></svg>Hapus Slot</button>
            </div>

            <p class="hint">
              <svg class="ic"><use xlink:href="#i-info"/></svg>
              <span>Shortcut: <b>Alt + Arrow</b> untuk nudge cepat.</span>
            </p>
          </div>
        </div>
      </section>
  </div>

  
```
