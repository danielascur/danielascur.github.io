/* Citation badges, Abstract/Cite toggles (BibTeX + APA) and "download all BibTeX".
   Data lives in js/papers.js. */
(function () {
  var P = window.PAPERS || {};

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  // ---------- BibTeX ----------
  var ORDER = ['author', 'title', 'journal', 'volume', 'number', 'pages', 'year', 'note', 'doi'];
  function bibtex(b) {
    var lines = ['@' + b.type + '{' + b.key + ','];
    ORDER.forEach(function (f) {
      if (!b[f]) return;
      var v = f === 'title' ? '{' + b.title + '}' : b[f];
      lines.push('  ' + f + ' = {' + v + '},');
    });
    lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
    lines.push('}');
    return lines.join('\n');
  }

  // ---------- APA 7 ----------
  function apaName(n) {
    var parts = n.split(',');
    var last = parts[0].trim(), first = (parts[1] || '').trim();
    var initials = first.split(/[\s]+/).filter(Boolean).map(function (w) {
      return w.split('-').map(function (h) { return h.charAt(0) + '.'; }).join('-');
    }).join(' ');
    return last + (initials ? ', ' + initials : '');
  }
  function apaAuthors(str) {
    var a = str.split(' and ').map(apaName);
    if (a.length === 1) return a[0];
    if (a.length <= 20) return a.slice(0, -1).join(', ') + ', & ' + a[a.length - 1];
    return a.slice(0, 19).join(', ') + ', . . . ' + a[a.length - 1];
  }
  function apa(b) {
    var yr = b.year === 'forthcoming' ? 'in press' : b.year;
    var out = apaAuthors(b.author) + ' (' + yr + '). ';
    if (b.type === 'article') {
      out += b.title + '. <i>' + esc(b.journal);
      if (b.volume) out += ', ' + b.volume + '</i>';
      else out += '</i>';
      if (b.number) out += '(' + b.number + ')';
      if (b.pages) out += ', ' + b.pages.replace('--', '–');
      out += '.';
    } else {
      out += '<i>' + esc(b.title) + '</i> [' + (b.note || 'Working paper') + '].';
    }
    if (b.doi) out += ' https://doi.org/' + b.doi;
    return out;
  }

  function copyText(text, btn) {
    function done() { var o = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = o; }, 1400); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done);
    } else {
      var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
      ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done();
    }
  }

  function makeToggle(label, panel, row, allPanels) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'tg'; b.innerHTML = label + ' <span class="chev">&#9662;</span>';
    b.addEventListener('click', function () {
      var open = !panel.hidden;
      allPanels.forEach(function (p) { p.hidden = true; });
      row.querySelectorAll('.tg').forEach(function (x) { x.classList.remove('on'); });
      if (!open) { panel.hidden = false; b.classList.add('on'); }
    });
    return b;
  }

  document.querySelectorAll('article.paper').forEach(function (art) {
    var d = P[art.getAttribute('data-id')];
    var body = art.querySelector('.entry-title') && art.querySelector('.entry-title').parentNode;
    if (!body) return;

    // 1. citation badge next to title (counts from js/citations.js)
    var C = (window.CITATIONS && window.CITATIONS.papers) || {};
    var ct = C[art.getAttribute('data-id')];
    if (ct && ct.citations) {
      var a = document.createElement(ct.citedByUrl ? 'a' : 'span');
      a.className = 'cite-badge';
      if (ct.citedByUrl) { a.href = ct.citedByUrl; a.target = '_blank'; a.rel = 'noopener'; }
      a.title = 'Google Scholar citations' + (window.CITATIONS.updated ? ' (updated ' + window.CITATIONS.updated + ')' : '');
      a.textContent = ct.citations + (ct.citations === 1 ? ' citation' : ' citations');
      var title = art.querySelector('.entry-title');
      var note = title.querySelector('.note');
      title.insertBefore(a, note || null);
    }

    // 2. Abstract / Cite toggle row (placed after the link pills)
    var abs = art.querySelector('details.abstract');
    if (!abs && !(d && d.bib)) return;
    var row = document.createElement('div'); row.className = 'entry-toggles';
    var panels = [];
    var wrap = document.createElement('div');

    if (abs) {
      var ap = document.createElement('div'); ap.className = 'tg-panel abstract-panel'; ap.hidden = true;
      ap.appendChild(abs.querySelector('p'));
      abs.parentNode.removeChild(abs);
      panels.push(ap);
      row.appendChild(makeToggle('Abstract', ap, row, panels));
      wrap.appendChild(ap);
    }
    if (d && d.bib) {
      var cp = document.createElement('div'); cp.className = 'tg-panel cite-panel'; cp.hidden = true;
      var bt = bibtex(d.bib), ap7 = apa(d.bib);
      cp.innerHTML =
        '<div class="cite-head"><div class="cite-fmt">' +
        '<button type="button" class="fmt on" data-f="bib">BibTeX</button>' +
        '<button type="button" class="fmt" data-f="apa">APA</button></div>' +
        '<button type="button" class="cite-copy">Copy</button></div>' +
        '<pre class="cite-box" data-f="bib">' + esc(bt) + '</pre>' +
        '<div class="cite-box apa" data-f="apa" hidden>' + ap7 + '</div>';
      var cur = 'bib';
      cp.querySelectorAll('.fmt').forEach(function (f) {
        f.addEventListener('click', function () {
          cur = f.getAttribute('data-f');
          cp.querySelectorAll('.fmt').forEach(function (x) { x.classList.toggle('on', x === f); });
          cp.querySelectorAll('.cite-box').forEach(function (x) { x.hidden = x.getAttribute('data-f') !== cur; });
        });
      });
      cp.querySelector('.cite-copy').addEventListener('click', function () {
        var box = cp.querySelector('.cite-box[data-f="' + cur + '"]');
        copyText(cur === 'bib' ? bt : box.textContent, this);
      });
      panels.push(cp);
      row.appendChild(makeToggle('Cite', cp, row, panels));
      wrap.appendChild(cp);
    }
    body.appendChild(row);
    while (wrap.firstChild) body.appendChild(wrap.firstChild);
  });

  // 3. "BibTeX ↓" download-all button next to the page title
  var h1 = document.querySelector('h1.page-title');
  var keys = Object.keys(P).filter(function (k) { return P[k].bib; });
  if (h1 && keys.length) {
    var dl = document.createElement('button');
    dl.type = 'button'; dl.className = 'bib-all';
    dl.title = 'Download all citations as a .bib file';
    dl.innerHTML = 'BibTeX <span aria-hidden="true">&#8595;</span>';
    dl.addEventListener('click', function () {
      var txt = '% Daniela Scur — publications and working papers\n% https://www.danielascur.com\n\n' +
        keys.map(function (k) { return bibtex(P[k].bib); }).join('\n\n') + '\n';
      var blob = new Blob([txt], { type: 'application/x-bibtex' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = 'scur.bib';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
    h1.appendChild(dl);
  }
})();
