<!-- AI CONTEXT | original: client/index.html | part 3 dari 6 | 3. MEDIA & OPTIONS -->
```html
<!-- ============ 3. MEDIA & OPTIONS ============ -->
      <section class="card card--mint">
        <div class="card-head">
          <button type="button" class="card-toggle" id="mediaLayoutToggle" aria-expanded="false">
            <h2><span class="step-badge">3</span><svg class="ic"><use xlink:href="#i-sliders"/></svg>Media &amp; Layout</h2>
            <svg class="ic chevron"><use xlink:href="#i-down"/></svg>
          </button>
        </div>

        <div class="media-layout-grid" id="mediaLayoutBody">
          <div class="media-fields">
            <div class="field-grid">
              <label>Media
                <select id="mediaType" class="input">
                  <option value="A3">A3</option>
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                  <option value="A6">A6</option>
                  <option value="LETTER">Letter</option>
                  <option value="4R">4R (102x152mm)</option>
                  <option value="10R">10R (254x305mm)</option>
                  <option value="10x15">10x15 cm</option>
                  <option value="20x30">20x30 cm</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </label>

              <label>Orientation
                <select id="orientation" class="input">
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="auto">Otomatis (paling efisien)</option>
                </select>
              </label>

              <label title="Marjin kiri, kanan &amp; bawah artboard. Marjin atas tetap 5 mm secara default, tidak mengikuti nilai ini.">Margin kiri/kanan/bawah (mm)
                <input id="margin" class="input" type="number" min="0" step="0.5" value="4.5" title="Marjin kiri, kanan &amp; bawah artboard. Marjin atas tetap 5 mm secara default, tidak mengikuti nilai ini." />
              </label>

              <label>Gap (mm)
                <input id="gap" class="input" type="number" min="0" step="0.5" value="0" />
              </label>

              <label>Offset Border (mm)
                <input id="offsetBorder" class="input" type="number" min="0" step="0.1" value="1.5" />
              </label>

              <label>Rotasi otomatis
                <select id="rotateMode" class="input">
                  <option value="auto">Otomatis</option>
                  <option value="off">Nonaktif</option>
                  <option value="force">Paksa 90&deg;</option>
                </select>
              </label>

              <div class="position-field">
                <label>Posisi Hasil</label>
                <div class="position-options">
                  <label class="pos-radio">
                    <input type="radio" name="position" value="left" />
                    <span>Kiri Atas</span>
                  </label>
                  <label class="pos-radio">
                    <input type="radio" name="position" value="center" checked />
                    <span>Tengah Atas</span>
                  </label>
                  <label class="pos-radio">
                    <input type="radio" name="position" value="right" />
                    <span>Kanan Atas</span>
                  </label>
                </div>
              </div>

              <div class="custom-size-fields grid2" id="customSizeFields" style="display:none">
                <label>Lebar Custom (mm)
                  <input id="customWidth" class="input" type="number" min="10" step="1" value="210" />
                </label>
                <label>Tinggi Custom (mm)
                  <input id="customHeight" class="input" type="number" min="10" step="1" value="297" />
                </label>
              </div>
            </div>
          </div>

          <div class="structure-panel">
            <button type="button" class="structure-toggle label-mini" id="structureToggle" aria-expanded="false">
              <svg class="ic"><use xlink:href="#i-layers"/></svg>Struktur &amp; Output
              <svg class="ic chevron"><use xlink:href="#i-down"/></svg>
            </button>
            <div class="structure-body" id="structureBody">
              <div class="radio-row">
                <label class="radio">
                  <input type="radio" name="grouping" value="flat" checked />
                  <span><b>Ungrouped clipping mask</b><i>Default</i>
                    <small>Tiap foto ter-clipping mask ukuran aktual.</small>
                  </span>
                </label>
                <label class="radio">
                  <input type="radio" name="grouping" value="grouped" />
                  <span><b>Grouped</b>
                    <small>Struktur lama (kompatibilitas).</small>
                  </span>
                </label>
                <label class="radio">
                  <input type="radio" name="fitMode" value="fill" checked />
                  <span><b>Isi penuh (crop)</b><i>Default</i>
                    <small>Foto mengisi penuh slot, kelebihan terpotong.</small>
                  </span>
                </label>
                <label class="radio">
                  <input type="radio" name="fitMode" value="fit" />
                  <span><b>Muat penuh (letterbox)</b>
                    <small>Foto utuh tanpa terpotong, sisa area kosong.</small>
                  </span>
                </label>
                <label class="check">
                  <input type="checkbox" id="noBorder" />
                  <span><b>Tanpa border</b>
                    <small>Cetak tanpa garis border sama sekali.</small>
                  </span>
                </label>
                <label class="check">
                  <input type="checkbox" id="cutGuide" />
                  <span><b>Cutting guide</b>
                    <small>Layer panduan potong (terkunci).</small>
                  </span>
                </label>
                <label class="check">
                  <input type="checkbox" id="artboards" checked />
                  <span><b>Artboard per lembar</b>
                    <small>Buat satu artboard tiap sheet.</small>
                  </span>
                </label>
                <label class="check">
                  <input type="checkbox" id="replacePrev" checked />
                  <span><b>Timpa hasil sebelumnya</b>
                    <small>Hapus otomatis hasil generate PFPM lama sebelum membuat yang baru.</small>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="col col-b">

      
```
