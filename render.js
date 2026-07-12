// ═══════════ ELEONOR SOFTWARE — RENDER MOTORU ═══════════
// content.js içindeki SITE_CONTENT'i okuyup sayfayı çizer.
// Admin paneli de ikon/tema/görsel şablonlarını buradan kullanır.
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ── Animasyonlu servis ikonları ──
  const ICONS = {
    web: { label: 'Web / Tarayıcı', svg: `
      <svg viewBox="0 0 64 64" width="58" height="58">
        <rect x="6" y="10" width="52" height="42" rx="6" fill="none" stroke="currentColor" stroke-width="2.5"/>
        <line x1="6" y1="20" x2="58" y2="20" stroke="currentColor" stroke-width="2.5"/>
        <circle class="io-dot d1" cx="13" cy="15" r="1.8" fill="currentColor"/>
        <circle class="io-dot d2" cx="19" cy="15" r="1.8" fill="currentColor"/>
        <circle class="io-dot d3" cx="25" cy="15" r="1.8" fill="currentColor"/>
        <rect class="io-bar b1" x="13" y="27" width="24" height="4" rx="2" fill="currentColor"/>
        <rect class="io-bar b2" x="13" y="35" width="34" height="4" rx="2" fill="currentColor"/>
        <rect class="io-bar b3" x="13" y="43" width="18" height="4" rx="2" fill="currentColor"/>
        <circle class="io-cursor" cx="46" cy="42" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
      </svg>` },
    mobile: { label: 'Mobil / Telefon', svg: `
      <svg viewBox="0 0 64 64" width="58" height="58">
        <rect x="18" y="6" width="28" height="52" rx="7" fill="none" stroke="currentColor" stroke-width="2.5"/>
        <line x1="27" y1="12" x2="37" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <rect class="io-screen s1" x="23" y="19" width="18" height="7" rx="2" fill="currentColor"/>
        <rect class="io-screen s2" x="23" y="30" width="18" height="7" rx="2" fill="currentColor"/>
        <rect class="io-screen s3" x="23" y="41" width="18" height="7" rx="2" fill="currentColor"/>
        <circle class="io-ring r1" cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <circle class="io-ring r2" cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>` },
    cart: { label: 'E-Ticaret / Sepet', svg: `
      <svg viewBox="0 0 64 64" width="58" height="58">
        <path d="M8 12h7l7 30h26l6-22H20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle class="io-wheel" cx="26" cy="52" r="4" fill="none" stroke="currentColor" stroke-width="2.5"/>
        <circle class="io-wheel w2" cx="48" cy="52" r="4" fill="none" stroke="currentColor" stroke-width="2.5"/>
        <rect class="io-box" x="30" y="16" width="10" height="10" rx="2" fill="currentColor"/>
      </svg>` },
    radar: { label: 'Takip / Radar', svg: `
      <svg viewBox="0 0 64 64" width="58" height="58">
        <circle class="io-radar-ring" cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"/>
        <circle cx="32" cy="32" r="15" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"/>
        <circle cx="32" cy="32" r="3.5" fill="currentColor"/>
        <g class="io-radar-sweep">
          <path d="M32 32 L32 6 A26 26 0 0 1 50 13 Z" fill="currentColor" opacity=".28"/>
          <line x1="32" y1="32" x2="32" y2="6" stroke="currentColor" stroke-width="2"/>
        </g>
        <circle class="io-blip bl1" cx="45" cy="22" r="2.5" fill="currentColor"/>
        <circle class="io-blip bl2" cx="20" cy="42" r="2.5" fill="currentColor"/>
      </svg>` },
    chart: { label: 'SEO / Grafik', svg: `
      <svg viewBox="0 0 64 64" width="58" height="58">
        <line x1="10" y1="54" x2="56" y2="54" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <rect class="io-chart c1" x="14" y="36" width="8" height="18" rx="2" fill="currentColor"/>
        <rect class="io-chart c2" x="27" y="26" width="8" height="28" rx="2" fill="currentColor"/>
        <rect class="io-chart c3" x="40" y="14" width="8" height="40" rx="2" fill="currentColor"/>
        <path class="io-arrow" d="M12 30 Q30 22 46 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <path class="io-arrowhead" d="M40 9 L47 9.5 L44 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>` },
    gear: { label: 'Özel Yazılım / Dişli', svg: `
      <svg viewBox="0 0 64 64" width="58" height="58">
        <g class="io-gear g1">
          <circle cx="26" cy="28" r="7" fill="none" stroke="currentColor" stroke-width="2.5"/>
          <g stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="26" y1="15" x2="26" y2="19"/><line x1="26" y1="37" x2="26" y2="41"/>
            <line x1="13" y1="28" x2="17" y2="28"/><line x1="35" y1="28" x2="39" y2="28"/>
            <line x1="17" y1="19" x2="20" y2="22"/><line x1="32" y1="34" x2="35" y2="37"/>
            <line x1="35" y1="19" x2="32" y2="22"/><line x1="20" y1="34" x2="17" y2="37"/>
          </g>
        </g>
        <g class="io-gear g2">
          <circle cx="44" cy="44" r="5.5" fill="none" stroke="currentColor" stroke-width="2.5"/>
          <g stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="44" y1="34" x2="44" y2="37"/><line x1="44" y1="51" x2="44" y2="54"/>
            <line x1="34" y1="44" x2="37" y2="44"/><line x1="51" y1="44" x2="54" y2="44"/>
          </g>
        </g>
      </svg>` },
    shield: { label: 'Güvenlik / Kalkan', svg: `
      <svg viewBox="0 0 64 64" width="58" height="58">
        <path class="io-shield" d="M32 6 L52 14 V30 C52 44 43 53 32 58 C21 53 12 44 12 30 V14 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
        <path class="io-check" d="M23 31 L30 38 L43 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>` },
    bolt: { label: 'Hız / Şimşek', svg: `
      <svg viewBox="0 0 64 64" width="58" height="58">
        <path class="io-bolt" d="M36 6 L16 36 h12 L26 58 L48 26 H34 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
        <circle class="io-ring r1" cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>` }
  };

  // ── Proje kartı görselleri (animasyonlu SVG sahneler) ──
  const ARTS = {
    dashboard: { label: 'Yönetim Paneli', svg: `
      <svg viewBox="0 0 300 200" class="case-art">
        <rect x="30" y="24" width="240" height="152" rx="10" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.25)"/>
        <rect x="30" y="24" width="240" height="24" rx="10" fill="rgba(255,255,255,.08)"/>
        <circle cx="44" cy="36" r="3" fill="#ff5f57"/><circle cx="56" cy="36" r="3" fill="#febc2e"/><circle cx="68" cy="36" r="3" fill="#28c840"/>
        <rect class="art-pulse" x="46" y="62" width="90" height="10" rx="5" fill="rgba(255,255,255,.5)"/>
        <rect x="46" y="80" width="130" height="7" rx="3.5" fill="rgba(255,255,255,.22)"/>
        <rect x="46" y="93" width="110" height="7" rx="3.5" fill="rgba(255,255,255,.16)"/>
        <g class="art-float">
          <rect x="196" y="62" width="58" height="76" rx="8" fill="rgba(168,85,247,.35)" stroke="rgba(255,255,255,.3)"/>
          <path d="M210 118 l10-14 8 9 12-18" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <rect class="art-bar ab1" x="46" y="120" width="40" height="34" rx="6" fill="rgba(0,229,255,.3)"/>
        <rect class="art-bar ab2" x="94" y="130" width="40" height="24" rx="6" fill="rgba(0,229,255,.45)"/>
        <rect class="art-bar ab3" x="142" y="112" width="40" height="42" rx="6" fill="rgba(0,229,255,.6)"/>
      </svg>` },
    route: { label: 'Rota / Lojistik', svg: `
      <svg viewBox="0 0 300 200" class="case-art">
        <path class="art-route" d="M40 160 C 90 60, 180 170, 260 50" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2.5" stroke-dasharray="8 8"/>
        <circle cx="40" cy="160" r="8" fill="none" stroke="#fff" stroke-width="2.5"/>
        <circle cx="40" cy="160" r="3" fill="#fff"/>
        <g class="art-truck">
          <rect x="-16" y="-11" width="24" height="16" rx="3" fill="rgba(255,255,255,.9)"/>
          <rect x="8" y="-6" width="10" height="11" rx="2" fill="rgba(255,255,255,.7)"/>
          <circle cx="-8" cy="7" r="3.5" fill="#0b0d16"/><circle cx="10" cy="7" r="3.5" fill="#0b0d16"/>
        </g>
        <g class="art-pin">
          <path d="M260 30 c-8 0 -13 6 -13 13 0 10 13 22 13 22 s13 -12 13 -22 c0 -7 -5 -13 -13 -13z" fill="#fff"/>
          <circle cx="260" cy="43" r="5" fill="#0b0d16"/>
        </g>
      </svg>` },
    globe: { label: 'Küre / Seyahat', svg: `
      <svg viewBox="0 0 300 200" class="case-art">
        <circle class="art-globe" cx="150" cy="100" r="55" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2"/>
        <ellipse cx="150" cy="100" rx="55" ry="20" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>
        <ellipse cx="150" cy="100" rx="20" ry="55" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>
        <g class="art-plane"><path d="M0 0 l14 5 -14 5 3 -5z" fill="#fff"/></g>
        <circle class="art-sat s1" cx="150" cy="100" r="4" fill="#fff"/>
      </svg>` },
    heartbeat: { label: 'Sağlık / Nabız', svg: `
      <svg viewBox="0 0 300 200" class="case-art">
        <path class="art-heartbeat" d="M30 100 h55 l12-30 18 60 14-42 10 12 h56" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <g class="art-paw">
          <circle cx="228" cy="60" r="7" fill="rgba(255,255,255,.85)"/>
          <circle cx="246" cy="56" r="7" fill="rgba(255,255,255,.85)"/>
          <circle cx="222" cy="78" r="6" fill="rgba(255,255,255,.6)"/>
          <circle cx="252" cy="74" r="6" fill="rgba(255,255,255,.6)"/>
          <ellipse cx="237" cy="82" rx="12" ry="9" fill="rgba(255,255,255,.9)"/>
        </g>
        <rect class="art-pulse" x="30" y="140" width="120" height="9" rx="4.5" fill="rgba(255,255,255,.4)"/>
        <rect x="30" y="156" width="90" height="7" rx="3.5" fill="rgba(255,255,255,.22)"/>
      </svg>` },
    spark: { label: 'Dijital / Genel', svg: `
      <svg viewBox="0 0 300 200" class="case-art">
        <rect class="art-float" x="105" y="55" width="90" height="90" rx="20" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.5)" stroke-width="2"/>
        <path class="art-code" d="M132 88 l-14 12 14 12 M168 88 l14 12 -14 12 M156 84 l-12 40" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle class="art-orb o1" cx="70" cy="60" r="5" fill="rgba(255,255,255,.8)"/>
        <circle class="art-orb o2" cx="235" cy="75" r="4" fill="rgba(255,255,255,.6)"/>
        <circle class="art-orb o3" cx="80" cy="150" r="3.5" fill="rgba(255,255,255,.5)"/>
        <circle class="art-orb o4" cx="225" cy="145" r="6" fill="rgba(255,255,255,.7)"/>
        <circle class="art-halo" cx="150" cy="100" r="70" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>
      </svg>` },
    shop: { label: 'Mağaza / E-Ticaret', svg: `
      <svg viewBox="0 0 300 200" class="case-art">
        <path d="M80 80 h140 v80 a8 8 0 0 1 -8 8 h-124 a8 8 0 0 1 -8 -8 z" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.4)" stroke-width="2"/>
        <path class="art-awning" d="M70 80 L86 46 h128 L230 80 a12 12 0 0 1 -24 0 a13 13 0 0 1 -26 0 a13 13 0 0 1 -30 0 a13 13 0 0 1 -30 0 a13 13 0 0 1 -26 0 a12 12 0 0 1 -24 0z" fill="rgba(255,255,255,.55)"/>
        <rect x="100" y="112" width="38" height="56" rx="4" fill="rgba(255,255,255,.3)"/>
        <rect class="art-pulse" x="156" y="112" width="44" height="30" rx="4" fill="rgba(255,255,255,.35)"/>
        <g class="art-tag">
          <rect x="196" y="88" width="46" height="26" rx="6" fill="#fff"/>
          <text x="219" y="106" text-anchor="middle" font-size="14" font-weight="bold" fill="#0b0d16">%</text>
        </g>
      </svg>` }
  };

  // ── Kart arka plan temaları ──
  const THEMES = {
    purple: { label: 'Mor', css: 'linear-gradient(135deg, #2a1a5e, #7c5cff 60%, #b18cff)' },
    cyan:   { label: 'Turkuaz', css: 'linear-gradient(135deg, #023b4a, #00a6c8 55%, #6ee7ff)' },
    sunset: { label: 'Gün Batımı', css: 'linear-gradient(135deg, #4a1042, #c2287f 55%, #ff8a5c)' },
    green:  { label: 'Yeşil', css: 'linear-gradient(135deg, #06301f, #0e9f6e 60%, #7bf0c1)' },
    gold:   { label: 'Altın', css: 'linear-gradient(135deg, #4a2e04, #d97706 55%, #fcd34d)' },
    blue:   { label: 'Mavi', css: 'linear-gradient(135deg, #0a1e4a, #2563eb 55%, #93c5fd)' }
  };

  function icon(key) { return (ICONS[key] || ICONS.web).svg; }
  function art(key) { return (ARTS[key] || ARTS.spark).svg; }
  function themeStyle(key) { return 'background:' + (THEMES[key] || THEMES.purple).css + ';'; }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function telHref(s) {
    let d = digits(s);
    if (d.startsWith('90')) return '+' + d;
    if (d.startsWith('0')) return '+9' + d;
    return '+90' + d;
  }

  function renderSite(c) {
    // ── SEO ──
    document.title = c.seo.title;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', c.seo.description);

    // ── Preloader ──
    document.querySelector('.preloader-word').innerHTML =
      [...c.brand.name].map(l => `<span>${esc(l)}</span>`).join('');

    // ── Nav ──
    document.querySelector('.brand-text').innerHTML = `${esc(c.brand.name)}<em>${esc(c.brand.suffix)}</em>`;
    document.getElementById('navMenu').innerHTML = `
      <a href="#services" class="nav-item" data-cursor="hover"><span data-text="${esc(c.nav.services)}">${esc(c.nav.services)}</span></a>
      <a href="#work" class="nav-item" data-cursor="hover"><span data-text="${esc(c.nav.work)}">${esc(c.nav.work)}</span></a>
      <a href="#process" class="nav-item" data-cursor="hover"><span data-text="${esc(c.nav.process)}">${esc(c.nav.process)}</span></a>
      <a href="#contact" class="nav-item nav-pill magnetic" data-cursor="hover">${esc(c.nav.cta)} <i>→</i></a>`;

    // ── Hero ──
    document.getElementById('heroInner').innerHTML = `
      <div class="hero-eyebrow" data-hero><span class="eyebrow-pulse"></span>${esc(c.hero.eyebrow)}</div>
      <h1 class="hero-h1">
        <div class="h1-row" data-split>${esc(c.hero.line1)}</div>
        <div class="h1-row h1-outline" data-split>${esc(c.hero.line2)}</div>
        <div class="h1-row"><span class="h1-grad" data-rise>${esc(c.hero.line3)}</span></div>
      </h1>
      <p class="hero-lede" data-hero>
        ${esc(c.hero.lede)}
        <span class="rotator"><span class="rotator-track" id="rotatorTrack">
          ${c.hero.rotator.map(r => `<em>${esc(r)}</em>`).join('')}
          <em>${esc(c.hero.rotator[0] || '')}</em>
        </span></span>
      </p>
      <div class="hero-cta" data-hero>
        <a href="#contact" class="btn-main magnetic" data-cursor="hover">
          <span class="btn-fill"></span>
          <span class="btn-label">${esc(c.hero.ctaPrimary)}</span>
          <span class="btn-orb">→</span>
        </a>
        <a href="#work" class="btn-line magnetic" data-cursor="hover">${esc(c.hero.ctaSecondary)}</a>
      </div>`;

    document.getElementById('heroFooter').innerHTML = `
      <div class="hero-stats">
        ${c.hero.stats.map(s => `
          <div class="hstat"><b data-count="${Number(s.value) || 0}">0</b><i>${esc(s.suffix)}</i><small>${esc(s.label)}</small></div>`).join('')}
      </div>
      <div class="scroll-cue">
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 4v14m0 0l-6-6m6 6l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
        ${esc(c.hero.cue)}
      </div>`;

    // ── Marquee ──
    const mqItems = c.marquee.map((m, i) =>
      `<span class="${i % 2 ? 'mq-ghost' : 'mq-solid'}">${esc(m)}</span><b>✦</b>`).join('');
    document.getElementById('mqTrack').innerHTML =
      `<div class="mq-set">${mqItems}</div><div class="mq-set" aria-hidden="true">${mqItems}</div>`;

    // ── Hizmetler ──
    document.getElementById('servicesHead').innerHTML = `
      <span class="sec-no">01</span>
      <h2 class="sec-title" data-split>${esc(c.services.heading)}</h2>
      <p class="sec-sub">${esc(c.services.sub)}</p>`;
    document.getElementById('svcGrid').innerHTML = c.services.items.map((s, i) => `
      <article class="svc" data-reveal>
        <div class="svc-icon">${icon(s.icon)}</div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.desc)}</p>
        <span class="svc-num">${String(i + 1).padStart(2, '0')}</span>
      </article>`).join('');

    // ── Projeler ──
    document.getElementById('workHead').innerHTML = `
      <span class="sec-no">02</span>
      <h2 class="sec-title" data-split>${esc(c.work.heading)}</h2>`;
    const cases = c.work.items.map(w => `
      <article class="case" data-cursor="drag">
        <div class="case-visual" style="${themeStyle(w.theme)}">${art(w.art)}</div>
        <div class="case-info">
          <div class="case-tags">${(w.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.desc)}${w.highlight ? ` <em>${esc(w.highlight)}</em>` : ''}</p>
        </div>
      </article>`).join('');
    document.getElementById('showcaseTrack').innerHTML = cases + `
      <article class="case case-more" data-cursor="drag">
        <div class="case-more-inner">
          <div class="case-more-num" data-count="${Number(c.work.more.number) || 0}">0</div>
          <p>${esc(c.work.more.text).replace(/\n/g, '<br>')}</p>
          <a href="#contact" class="btn-line magnetic" data-cursor="hover">${esc(c.work.more.cta)}</a>
        </div>
      </article>`;

    // ── Süreç ──
    document.getElementById('processHead').innerHTML = `
      <span class="sec-no">03</span>
      <h2 class="sec-title" data-split>${esc(c.process.heading)}</h2>
      <p class="sec-sub">${esc(c.process.sub)}</p>`;
    document.getElementById('stepsWrap').innerHTML = c.process.steps.map((s, i) => `
      ${i > 0 ? '<div class="step-link" aria-hidden="true"><span></span></div>' : ''}
      <div class="step" data-reveal>
        <div class="step-ring"><svg viewBox="0 0 80 80"><circle class="ring-bg" cx="40" cy="40" r="34"/><circle class="ring-fg" cx="40" cy="40" r="34"/></svg><b>${i + 1}</b></div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.desc)}</p>
      </div>`).join('');

    // ── İletişim ──
    const channels = [];
    if (c.contact.phone) channels.push(`
      <a href="tel:${telHref(c.contact.phone)}" class="ccard magnetic" data-cursor="hover">
        <svg viewBox="0 0 24 24" width="26" height="26" class="ccard-ico ico-phone"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
        <b>${esc(c.contact.phone)}</b><small>Telefon</small>
      </a>`);
    if (c.contact.email) channels.push(`
      <a href="mailto:${esc(c.contact.email)}" class="ccard magnetic" data-cursor="hover">
        <svg viewBox="0 0 24 24" width="26" height="26" class="ccard-ico ico-mail"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path class="mail-flap" d="M3.5 6.5 12 13l8.5-6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <b>${esc(c.contact.email)}</b><small>E-posta</small>
      </a>`);
    if (c.contact.whatsapp) channels.push(`
      <a href="https://wa.me/${digits(c.contact.whatsapp)}" target="_blank" rel="noopener" class="ccard magnetic" data-cursor="hover">
        <svg viewBox="0 0 24 24" width="26" height="26" class="ccard-ico ico-chat"><path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L4 21l1.5-4.4A8.5 8.5 0 1 1 21 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle class="chat-dot cd1" cx="9" cy="12" r="1.1" fill="currentColor"/><circle class="chat-dot cd2" cx="12.5" cy="12" r="1.1" fill="currentColor"/><circle class="chat-dot cd3" cx="16" cy="12" r="1.1" fill="currentColor"/></svg>
        <b>WhatsApp</b><small>Hemen yazın</small>
      </a>`);
    document.getElementById('contactInner').innerHTML = `
      <span class="sec-no">04</span>
      <h2 class="contact-h2">
        <span data-split>${esc(c.contact.heading1)}</span>
        <span><span class="h1-grad" data-rise>${esc(c.contact.heading2)}</span></span>
      </h2>
      <p class="contact-p">${esc(c.contact.text)}</p>
      <div class="contact-cards">${channels.join('')}</div>`;

    // ── Footer ──
    const brandLine = `${esc(c.brand.name)} ${esc(c.brand.suffix)}&nbsp;✦&nbsp;${esc(c.brand.name)} ${esc(c.brand.suffix)}&nbsp;✦&nbsp;`;
    document.getElementById('footBig').innerHTML = `<span>${brandLine}</span><span aria-hidden="true">${brandLine}</span>`;
    document.getElementById('footRow').innerHTML = `<p>${esc(c.footer.left)}</p><p>${esc(c.footer.right)}</p>`;
  }

  window.EleonorRender = { ICONS, ARTS, THEMES, renderSite, esc };
})();
