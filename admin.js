// ═══════════ ELEONOR ADMIN — PANEL MANTIĞI ═══════════
(function () {
'use strict';

const R = window.EleonorRender;
const esc = R.esc;
// baseline: "Geri Al"ın döndüğü nokta — her başarılı kayıt/yayında güncellenir,
// böylece geri alma yalnızca kaydedilmemiş değişiklikleri temizler.
let baseline = JSON.parse(JSON.stringify(window.SITE_CONTENT));
let state = JSON.parse(JSON.stringify(window.SITE_CONTENT));

const $ = s => document.querySelector(s);
const panelsEl = $('#admPanels');
const frame = $('#previewFrame');

// ─────────── Yol tabanlı erişim (örn "hero.stats.0.label") ───────────
function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}
function setPath(obj, path, val) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => o[k], obj);
  target[last] = val;
}

// ─────────── Canlı önizleme ───────────
let previewTimer = null;
function schedulePreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(refreshPreview, 600);
}
function refreshPreview() {
  try { sessionStorage.setItem('eleonor-preview', JSON.stringify(state)); } catch (e) {}
  try { frame.contentWindow.location.reload(); } catch (e) { frame.src = 'index.html?preview=1'; }
}
$('#btnRefresh').addEventListener('click', refreshPreview);

document.querySelectorAll('.dev-btn').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.dev-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    $('#previewWrap').classList.toggle('mobile', b.dataset.w === '390');
  });
});

// ─────────── Toast ───────────
let toastTimer = null;
function toast(msg, type) {
  const el = $('#toast');
  el.textContent = msg;
  el.className = 'adm-toast show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3800);
}

// ─────────── Form yapı taşları ───────────
function fInput(label, path, opts) {
  opts = opts || {};
  const val = getPath(state, path);
  return `<div class="f-group">
    <label class="f-label">${esc(label)}</label>
    <input class="f-input" data-path="${esc(path)}" ${opts.number ? 'data-type="number" type="number"' : 'type="text"'} value="${esc(val)}">
    ${opts.hint ? `<div class="f-hint">${esc(opts.hint)}</div>` : ''}
  </div>`;
}
function fArea(label, path, opts) {
  opts = opts || {};
  const raw = getPath(state, path);
  const val = opts.lines ? (raw || []).join('\n') : raw;
  return `<div class="f-group">
    <label class="f-label">${esc(label)}</label>
    <textarea class="f-area" data-path="${esc(path)}" ${opts.lines ? 'data-type="lines"' : ''} ${opts.csv ? 'data-type="csv"' : ''}>${esc(val)}</textarea>
    ${opts.hint ? `<div class="f-hint">${esc(opts.hint)}</div>` : ''}
  </div>`;
}
function liTools(list, idx, len) {
  return `<div class="li-tools">
    <button class="li-tool" data-act="up" data-list="${list}" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="Yukarı taşı">↑</button>
    <button class="li-tool" data-act="down" data-list="${list}" data-idx="${idx}" ${idx === len - 1 ? 'disabled' : ''} title="Aşağı taşı">↓</button>
    <button class="li-tool del" data-act="del" data-list="${list}" data-idx="${idx}" title="Sil">✕</button>
  </div>`;
}
function iconPicker(path, current) {
  return `<div class="f-group"><label class="f-label">İkon</label>
    <div class="pick-grid">${Object.entries(R.ICONS).map(([key, ic]) => `
      <button class="pick ${key === current ? 'sel' : ''}" data-pick="${esc(path)}" data-val="${key}" title="${esc(ic.label)}">${ic.svg.replace('width="58" height="58"', '')}</button>`).join('')}
    </div></div>`;
}
function themePicker(path, current) {
  return `<div class="f-group"><label class="f-label">Kart Rengi</label>
    <div class="pick-grid">${Object.entries(R.THEMES).map(([key, th]) => `
      <button class="pick pick-theme ${key === current ? 'sel' : ''}" data-pick="${esc(path)}" data-val="${key}" title="${esc(th.label)}" style="background:${th.css}"></button>`).join('')}
    </div></div>`;
}
function artPicker(path, current) {
  return `<div class="f-group"><label class="f-label">Animasyonlu Görsel</label>
    <div class="pick-grid">${Object.entries(R.ARTS).map(([key, a]) => `
      <button class="pick pick-art ${key === current ? 'sel' : ''}" data-pick="${esc(path)}" data-val="${key}" title="${esc(a.label)}" style="background:${R.THEMES[getPath(state, path.replace(/\.art$/, '.theme'))] ? R.THEMES[getPath(state, path.replace(/\.art$/, '.theme'))].css : '#222'}">${a.svg}</button>`).join('')}
    </div></div>`;
}

// ─────────── Paneller ───────────
const PANELS = {
  hero: {
    title: 'Ana Sayfa (Hero)',
    html() {
      const c = state;
      return `
        ${fInput('Üst Rozet Yazısı', 'hero.eyebrow')}
        <div class="f-row">
          ${fInput('Başlık 1. Satır (dolu)', 'hero.line1')}
          ${fInput('Başlık 2. Satır (kontur)', 'hero.line2')}
        </div>
        ${fInput('Başlık 3. Satır (renkli gradient)', 'hero.line3')}
        ${fInput('Alt Açıklama', 'hero.lede')}
        ${fArea('Dönen Kelimeler', 'hero.rotator', { lines: true, hint: 'Her satır sırayla dönerek gösterilir.' })}
        <div class="f-row">
          ${fInput('Ana Buton', 'hero.ctaPrimary')}
          ${fInput('İkinci Buton', 'hero.ctaSecondary')}
        </div>
        ${fInput('Kaydırma İpucu Yazısı', 'hero.cue')}

        <div class="f-section">📊 Sayaçlar</div>
        ${c.hero.stats.map((s, i) => `
          <div class="li-card">
            <div class="li-head"><span class="li-title">Sayaç ${i + 1}</span>${liTools('hero.stats', i, c.hero.stats.length)}</div>
            <div class="f-row-3">
              ${fInput('Sayı', `hero.stats.${i}.value`, { number: true })}
              ${fInput('Ek (+, %)', `hero.stats.${i}.suffix`)}
              ${fInput('Etiket', `hero.stats.${i}.label`)}
            </div>
          </div>`).join('')}
        <button class="btn-add" data-act="add" data-list="hero.stats">+ Sayaç Ekle</button>`;
    }
  },

  services: {
    title: 'Hizmetler',
    html() {
      const c = state;
      return `
        ${fInput('Bölüm Başlığı', 'services.heading')}
        ${fInput('Bölüm Alt Yazısı', 'services.sub')}
        <div class="f-section">🧩 Hizmet Kartları</div>
        ${c.services.items.map((s, i) => `
          <div class="li-card">
            <div class="li-head"><span class="li-title">${esc(s.title) || 'Hizmet ' + (i + 1)}</span>${liTools('services.items', i, c.services.items.length)}</div>
            ${iconPicker(`services.items.${i}.icon`, s.icon)}
            ${fInput('Başlık', `services.items.${i}.title`)}
            ${fArea('Açıklama', `services.items.${i}.desc`)}
          </div>`).join('')}
        <button class="btn-add" data-act="add" data-list="services.items">+ Hizmet Ekle</button>`;
    }
  },

  work: {
    title: 'Projeler',
    html() {
      const c = state;
      return `
        ${fInput('Bölüm Başlığı', 'work.heading')}
        <div class="f-section">🖼️ Proje Kartları</div>
        ${c.work.items.map((w, i) => `
          <div class="li-card">
            <div class="li-head"><span class="li-title">${esc(w.title) || 'Proje ' + (i + 1)}</span>${liTools('work.items', i, c.work.items.length)}</div>
            ${fInput('Proje Adı', `work.items.${i}.title`)}
            ${fArea('Açıklama', `work.items.${i}.desc`)}
            ${fInput('Etiketler', `work.items.${i}.tags`, { hint: 'Virgülle ayırın: Web, Mobil, SEO' }).replace('data-path', 'data-type="csv" data-path')}
            ${fInput('Vurgu (ör. site adresi — boş bırakılabilir)', `work.items.${i}.highlight`)}
            ${themePicker(`work.items.${i}.theme`, w.theme)}
            ${artPicker(`work.items.${i}.art`, w.art)}
          </div>`).join('')}
        <button class="btn-add" data-act="add" data-list="work.items">+ Proje Ekle</button>

        <div class="f-section">➕ "Daha Fazlası" Kartı</div>
        ${fInput('Büyük Sayı', 'work.more.number', { number: true })}
        ${fArea('Yazı', 'work.more.text', { hint: 'Satır sonları kartta korunur.' })}
        ${fInput('Buton Yazısı', 'work.more.cta')}`;
    }
  },

  process: {
    title: 'Süreç',
    html() {
      const c = state;
      return `
        ${fInput('Bölüm Başlığı', 'process.heading')}
        ${fInput('Bölüm Alt Yazısı', 'process.sub')}
        <div class="f-section">🪜 Adımlar</div>
        ${c.process.steps.map((s, i) => `
          <div class="li-card">
            <div class="li-head"><span class="li-title">Adım ${i + 1}: ${esc(s.title)}</span>${liTools('process.steps', i, c.process.steps.length)}</div>
            ${fInput('Başlık', `process.steps.${i}.title`)}
            ${fArea('Açıklama', `process.steps.${i}.desc`)}
          </div>`).join('')}
        <button class="btn-add" data-act="add" data-list="process.steps">+ Adım Ekle</button>`;
    }
  },

  contact: {
    title: 'İletişim',
    html() {
      return `
        <div class="f-row">
          ${fInput('Başlık 1. Satır', 'contact.heading1')}
          ${fInput('Başlık 2. Satır (renkli)', 'contact.heading2')}
        </div>
        ${fArea('Açıklama Yazısı', 'contact.text')}
        <div class="f-section">📞 Kanallar <span class="f-hint" style="display:inline;font-family:'Space Grotesk';font-weight:400">(boş bırakılan kart sitede gizlenir)</span></div>
        ${fInput('Telefon', 'contact.phone', { hint: 'Görünen numara. Arama linki otomatik oluşturulur.' })}
        ${fInput('E-posta', 'contact.email')}
        ${fInput('WhatsApp Numarası', 'contact.whatsapp', { hint: 'Ülke koduyla, boşluksuz: 905421710083' })}`;
    }
  },

  general: {
    title: 'Genel & SEO',
    html() {
      return `
        <div class="f-section" style="margin-top:0;border-top:none;padding-top:0">🏷️ Marka</div>
        <div class="f-row">
          ${fInput('Marka Adı', 'brand.name')}
          ${fInput('Marka Eki', 'brand.suffix')}
        </div>
        <div class="f-section">🧭 Menü Yazıları</div>
        <div class="f-row">
          ${fInput('Hizmetler Linki', 'nav.services')}
          ${fInput('Projeler Linki', 'nav.work')}
        </div>
        <div class="f-row">
          ${fInput('Süreç Linki', 'nav.process')}
          ${fInput('Buton (Teklif Al)', 'nav.cta')}
        </div>
        <div class="f-section">🎞️ Kayan Yazı Şeridi</div>
        ${fArea('Kelimeler', 'marquee', { lines: true, hint: 'Her satır bir kelime. Sırayla dolu/kontur stillenir.' })}
        <div class="f-section">🔍 SEO</div>
        ${fInput('Site Başlığı (sekme + Google)', 'seo.title')}
        ${fArea('Site Açıklaması (Google)', 'seo.description')}
        <div class="f-section">⬇️ Alt Bilgi</div>
        <div class="f-row">
          ${fInput('Sol Yazı', 'footer.left')}
          ${fInput('Sağ Yazı', 'footer.right')}
        </div>`;
    }
  }
};

// Yeni öğe şablonları
const NEW_ITEM = {
  'hero.stats': () => ({ value: 10, suffix: '+', label: 'Yeni Sayaç' }),
  'services.items': () => ({ icon: 'bolt', title: 'Yeni Hizmet', desc: 'Açıklama yazın...' }),
  'work.items': () => ({ title: 'Yeni Proje', desc: 'Proje açıklaması...', tags: ['Web'], theme: 'blue', art: 'spark', highlight: '' }),
  'process.steps': () => ({ title: 'Yeni Adım', desc: 'Adım açıklaması...' })
};

// ─────────── Panel çizimi ───────────
let currentPanel = 'hero';
function renderPanel() {
  panelsEl.innerHTML = `<div class="adm-panel active">${PANELS[currentPanel].html()}</div>`;
  $('#panelTitle').textContent = PANELS[currentPanel].title;
}
renderPanel();

document.querySelectorAll('.adm-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.adm-nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPanel = btn.dataset.panel;
    renderPanel();
  });
});

// ─────────── Girdi bağlama (delegasyon) ───────────
panelsEl.addEventListener('input', e => {
  const path = e.target.dataset.path;
  if (!path) return;
  const type = e.target.dataset.type;
  let val = e.target.value;
  if (type === 'number') val = Number(val) || 0;
  else if (type === 'lines') val = val.split('\n').map(s => s.trim()).filter(Boolean);
  else if (type === 'csv') val = val.split(',').map(s => s.trim()).filter(Boolean);
  setPath(state, path, val);
  schedulePreview();
});

// Liste araçları + seçiciler (delegasyon)
panelsEl.addEventListener('click', e => {
  const pickBtn = e.target.closest('[data-pick]');
  if (pickBtn) {
    setPath(state, pickBtn.dataset.pick, pickBtn.dataset.val);
    renderPanel();
    schedulePreview();
    return;
  }
  const actBtn = e.target.closest('[data-act]');
  if (!actBtn) return;
  const act = actBtn.dataset.act;
  const list = getPath(state, actBtn.dataset.list);
  const idx = Number(actBtn.dataset.idx);

  if (act === 'add') list.push(NEW_ITEM[actBtn.dataset.list]());
  else if (act === 'del') {
    if (list.length <= 1) { toast('Son öğe silinemez — en az bir tane kalmalı.', 'err'); return; }
    list.splice(idx, 1);
  }
  else if (act === 'up' && idx > 0) list.splice(idx - 1, 0, list.splice(idx, 1)[0]);
  else if (act === 'down' && idx < list.length - 1) list.splice(idx + 1, 0, list.splice(idx, 1)[0]);

  renderPanel();
  schedulePreview();
});

// CSV alanlarının başlangıç değeri dizi — inputa yazarken düzelt
function fixCsvInputs() {
  panelsEl.querySelectorAll('[data-type="csv"]').forEach(inp => {
    const v = getPath(state, inp.dataset.path);
    if (Array.isArray(v)) inp.value = v.join(', ');
  });
}
const origRender = renderPanel;
renderPanel = function () { origRender(); fixCsvInputs(); };
fixCsvInputs();

// ─────────── Geri al ───────────
$('#btnReset').addEventListener('click', () => {
  state = JSON.parse(JSON.stringify(baseline));
  renderPanel();
  refreshPreview();
  toast('Kaydedilmemiş değişiklikler geri alındı.', 'ok');
});

// ─────────── content.js metni üret ───────────
function fileText() {
  return '// ═══════════ ELEONOR SOFTWARE — SİTE İÇERİĞİ ═══════════\n' +
    '// Bu dosya admin paneli tarafından otomatik güncellenir.\n' +
    '// Elle düzenleyecekseniz sadece işaretler arasındaki JSON\'u değiştirin.\n' +
    'window.SITE_CONTENT = /*JSON-START*/' +
    JSON.stringify(state, null, 2) +
    '/*JSON-END*/;\n';
}

// ─────────── Bilgisayara kaydet ───────────
$('#btnSaveLocal').addEventListener('click', async () => {
  const text = fileText();
  if (window.showSaveFilePicker) {
    try {
      const handle = await showSaveFilePicker({
        suggestedName: 'content.js',
        types: [{ description: 'JavaScript', accept: { 'text/javascript': ['.js'] } }]
      });
      const w = await handle.createWritable();
      await w.write(text);
      await w.close();
      baseline = JSON.parse(JSON.stringify(state));
      toast('content.js kaydedildi. Site klasöründeki dosyanın üzerine yazdıysanız iş tamam.', 'ok');
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  // Yedek yöntem: indir
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
  a.download = 'content.js';
  a.click();
  URL.revokeObjectURL(a.href);
  baseline = JSON.parse(JSON.stringify(state));
  toast('content.js indirildi. Site klasöründeki dosyayla değiştirin.', 'ok');
});

// ─────────── GitHub ayarları ───────────
const CFG_KEY = 'eleonor-admin-github';
function getCfg() {
  try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch (e) { return {}; }
}
const ghDialog = $('#ghDialog');
$('#btnGhConfig').addEventListener('click', openGhDialog);
function openGhDialog() {
  const cfg = getCfg();
  $('#ghOwner').value = cfg.owner || '';
  $('#ghRepo').value = cfg.repo || '';
  $('#ghBranch').value = cfg.branch || 'main';
  $('#ghToken').value = cfg.token || '';
  ghDialog.showModal();
}
$('#ghCancel').addEventListener('click', () => ghDialog.close());
$('#ghSave').addEventListener('click', () => {
  localStorage.setItem(CFG_KEY, JSON.stringify({
    owner: $('#ghOwner').value.trim(),
    repo: $('#ghRepo').value.trim(),
    branch: $('#ghBranch').value.trim() || 'main',
    token: $('#ghToken').value.trim()
  }));
  ghDialog.close();
  toast('GitHub ayarları bu tarayıcıya kaydedildi.', 'ok');
});

// ─────────── GitHub'a yayınla ───────────
function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin);
}

$('#btnPublish').addEventListener('click', async () => {
  const cfg = getCfg();
  if (!cfg.owner || !cfg.repo || !cfg.token) {
    toast('Önce GitHub ayarlarını doldurun.', 'err');
    openGhDialog();
    return;
  }
  const btn = $('#btnPublish');
  btn.disabled = true;
  btn.textContent = '⏳ Yayınlanıyor...';
  try {
    const api = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/content.js`;
    const headers = {
      'Authorization': 'Bearer ' + cfg.token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    // Mevcut dosyanın sha'sını al (güncelleme için gerekli)
    let sha = null;
    const getRes = await fetch(`${api}?ref=${encodeURIComponent(cfg.branch)}`, { headers });
    if (getRes.status === 200) sha = (await getRes.json()).sha;
    else if (getRes.status === 401) throw new Error('Token geçersiz veya süresi dolmuş (401).');
    else if (getRes.status !== 404) throw new Error('Depoya erişilemedi (' + getRes.status + '). Kullanıcı adı / repo adını kontrol edin.');

    const body = {
      message: 'Site içeriği güncellendi (admin paneli)',
      content: b64utf8(fileText()),
      branch: cfg.branch
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(api, { method: 'PUT', headers, body: JSON.stringify(body) });
    if (!putRes.ok) {
      const detail = await putRes.json().catch(() => ({}));
      throw new Error('Yayınlama başarısız (' + putRes.status + '): ' + (detail.message || 'bilinmeyen hata'));
    }
    baseline = JSON.parse(JSON.stringify(state));
    toast('✅ Yayınlandı! Site 1-2 dakika içinde güncellenir.', 'ok');
  } catch (err) {
    toast('❌ ' + err.message, 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = "🚀 GitHub'a Yayınla";
  }
});

// İlk önizlemeyi mevcut içerikle senkronla
refreshPreview();

})();
