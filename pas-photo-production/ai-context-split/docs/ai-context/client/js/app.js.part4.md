<!-- AI CONTEXT | original: client/js/app.js | part 4 dari 8 | renderCaptionTab -->
```javascript
function renderCaptionTab(st) {
    st = st || S.get();
    var c = st.caption;

    $("#capEnabled").checked = !!c.enabled;
    $("#capText").value = c.text || "";
    $("#capHeight").value = c.heightMm;
    $("#capFontSize").value = c.fontSize;
    $("#capBold").checked = !!c.bold;
    $("#capUppercase").checked = !!c.uppercase;
    var body = $("#capBody");
    if (body) body.classList.toggle("disabled", !c.enabled);

    $("#capEnabled").onchange = function (e) { c.enabled = e.target.checked; S.save(); preview(); };
    $("#capText").onchange = function (e) { c.text = e.target.value; S.save(); preview(); };
    $("#capHeight").onchange = function (e) { c.heightMm = Math.max(1, Number(e.target.value) || 8); S.save(); preview(); };
    $("#capFontSize").onchange = function (e) { c.fontSize = Math.max(3, Number(e.target.value) || 7); S.save(); preview(); };
    $("#capBold").onchange = function (e) { c.bold = e.target.checked; S.save(); preview(); };
    $("#capUppercase").onchange = function (e) { c.uppercase = e.target.checked; S.save(); preview(); };
    attachSpinner($("#capHeight"));
    attachSpinner($("#capFontSize"));

    var photoWrap = $("#capPhotoList");
    if (photoWrap) {
      photoWrap.innerHTML = "";
      if (!st.photos.length) {
        photoWrap.appendChild(el("p", "hint", "Belum ada foto sumber."));
      }
      st.photos.forEach(function (p) {
        var row = el("div", "cap-override-row");
        row.innerHTML =
          '<span class="cap-override-name" title="' + esc(p.path) + '">' + esc(p.name) + "</span>" +
          '<input class="input cap-override-input" type="text" placeholder="\u2014 pakai teks global \u2014" value="' + esc(p.captionText || "") + '" />';
        row.querySelector(".cap-override-input").onchange = function (e) {
          S.setPhotoCaption(p.id, e.target.value);
          preview();
        };
        photoWrap.appendChild(row);
      });
    }

    var itemWrap = $("#capItemList");
    if (itemWrap) {
      itemWrap.innerHTML = "";
      if (!st.items.length) {
        itemWrap.appendChild(el("p", "hint", "Belum ada baris Order Ukuran."));
      }
      st.items.forEach(function (it) {
        var row = el("div", "cap-override-row");
        row.innerHTML =
          '<span class="cap-override-name">' + esc(it.label) + " (" + it.width + "\u00d7" + it.height + "mm)</span>" +
          '<input class="input cap-override-input" type="text" placeholder="\u2014 pakai teks foto/global \u2014" value="' + esc(it.captionText || "") + '" />';
        row.querySelector(".cap-override-input").onchange = function (e) {
          it.captionText = e.target.value; S.save(); preview();
        };
        itemWrap.appendChild(row);
      });
    }
  }

  /* ---------------- preview ---------------- */
  
```
