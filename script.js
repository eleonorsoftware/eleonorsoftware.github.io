// ═══════════════════ ELEONOR SOFTWARE ═══════════════════
(function () {
'use strict';

// İkisi birden yüklenmiş olmalı: gsap yüklenip ScrollTrigger yüklenemezse
// (kısmi CDN kesintisi) çıplak ScrollTrigger referansı tüm script'i öldürürdü.
const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isPreview = new URLSearchParams(location.search).has('preview');
document.documentElement.classList.add(hasGsap ? 'has-gsap' : 'no-gsap');
if (isPreview) document.documentElement.classList.add('preview');
if (hasGsap) gsap.registerPlugin(ScrollTrigger);

// ─────────── İçerik: admin önizlemesi varsa onu kullan ───────────
let content = window.SITE_CONTENT;
if (isPreview) {
  try {
    const stored = sessionStorage.getItem('eleonor-preview');
    if (stored) content = JSON.parse(stored);
  } catch (e) { /* bozuk önizleme verisi → varsayılan içerik */ }
}
window.EleonorRender.renderSite(content);

// ─────────── Split text: kelime kelime sar, harflere böl ───────────
// (kelimeler bütün kalır → mobilde satır sonu kelimeden kırılır)
document.querySelectorAll('[data-split]').forEach(el => {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text);
  text.split(' ').forEach((wordText, i, arr) => {
    const word = document.createElement('span');
    word.className = 'word';
    [...wordText].forEach(ch => {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch;
      word.appendChild(s);
    });
    el.appendChild(word);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
});

// ─────────── Başlık sığdırma ───────────
// Admin'den girilen metin ne olursa olsun başlıklar satıra sığar:
// en uzun satır taşıyorsa tüm başlığın font boyutu oranla küçültülür.
function fitText(el) {
  el.style.fontSize = '';
  const rowEls = el.querySelectorAll(':scope > .h1-row, :scope > span:not(.word)');
  const targets = rowEls.length ? [...rowEls] : [el];
  const base = parseFloat(getComputedStyle(el).fontSize);
  let ratio = 1;
  targets.forEach(row => {
    const avail = row.clientWidth;
    if (avail > 0 && row.scrollWidth > avail) ratio = Math.max(ratio, row.scrollWidth / avail);
  });
  if (ratio > 1.001) el.style.fontSize = (Math.floor(base / ratio * 100) / 100) + 'px';
}
let syncShowcaseMode = null; // GSAP bloğunda tanımlanır; genişlik değişince çağrılır
function fitAll() {
  document.querySelectorAll('.hero-h1, .sec-title, .contact-h2').forEach(el => {
    fitText(el);
    fitText(el); // ikinci geçiş: yeni boyutta yeniden ölç (yakınsama)
  });
  if (syncShowcaseMode) syncShowcaseMode();
  if (hasGsap) ScrollTrigger.refresh();
}
fitAll();
let fitTimer = null;
function queueFit() {
  clearTimeout(fitTimer);
  fitTimer = setTimeout(fitAll, 180);
}
window.addEventListener('resize', queueFit);
// resize event'i atlansa bile düzen genişliği değişince yakala (emülasyon, döndürme vs.)
if (window.ResizeObserver) {
  let lastW = document.documentElement.clientWidth;
  new ResizeObserver(() => {
    const w = document.documentElement.clientWidth;
    if (w !== lastW) { lastW = w; queueFit(); }
  }).observe(document.documentElement);
}
// Font swap sonrası yeniden sığdır: soğuk önbellekte fonts.ready swap'ten önce
// tetiklenebiliyor; loadingdone + zamanlı emniyet geçişleri bunu telafi eder.
if (document.fonts) {
  if (document.fonts.ready) document.fonts.ready.then(() => fitAll());
  if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => fitAll());
}
setTimeout(fitAll, 1200);
setTimeout(fitAll, 3000);

// ─────────── Preloader ───────────
const preloader = document.getElementById('preloader');
const preCounter = document.getElementById('preCounter');

function startIntro() {
  document.body.classList.remove('locked');
  preloader.classList.add('done');

  if (!hasGsap || reducedMotion) {
    preloader.style.display = 'none';
    return;
  }
  const tl = gsap.timeline();
  tl.to('.preloader-content', { opacity: 0, y: -40, duration: .5, ease: 'power2.in' })
    .to('.preloader-curtain.c2', { scaleY: 0, duration: .85, ease: 'power4.inOut' }, '-=.1')
    .to('.preloader-curtain', { scaleY: 0, duration: .85, ease: 'power4.inOut' }, '-=.65')
    .set(preloader, { display: 'none' })
    .fromTo('.hero .char',
      { yPercent: 120, rotate: 6 },
      { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: .028, clearProps: 'transform' }, '-=.55')
    .fromTo('.hero [data-rise]',
      { yPercent: 115 },
      { yPercent: 0, duration: 1.05, ease: 'power4.out' }, '-=.85')
    .to('[data-hero]', { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .12 }, '-=.6')
    .call(observeHeroCounters); // sayaçlar ancak perde açılınca saymaya başlasın
}

let introSkipped = false;
if (isPreview || !hasGsap || reducedMotion) {
  // Önizleme: preloader'ı ve giriş animasyonunu tamamen atla
  introSkipped = true;
  preloader.style.display = 'none';
  document.querySelectorAll('[data-hero]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
} else {
  document.body.classList.add('locked');
  gsap.set('[data-hero]', { opacity: 0, y: 30 });
  gsap.set('.hero .char', { yPercent: 120 });
  gsap.set('.hero [data-rise]', { yPercent: 115 });
  gsap.fromTo('.preloader-word span', { yPercent: 120 }, { yPercent: 0, duration: .9, ease: 'power4.out', stagger: .07 });

  // Sayaç 0 → 100
  let pct = 0;
  const counterTimer = setInterval(() => {
    pct += Math.floor(Math.random() * 9) + 3;
    if (pct >= 100) {
      pct = 100;
      clearInterval(counterTimer);
      setTimeout(startIntro, 250);
    }
    preCounter.textContent = pct;
  }, 70);
}

// ─────────── Custom cursor ───────────
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px';
  dot.style.top = my + 'px';
});
(function ringFollow() {
  rx += (mx - rx) * 0.16;
  ry += (my - ry) * 0.16;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(ringFollow);
})();

document.querySelectorAll('[data-cursor]').forEach(el => {
  const mode = el.dataset.cursor;
  el.addEventListener('mouseenter', () => ring.classList.add(mode === 'drag' ? 'is-drag' : 'is-hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('is-hover', 'is-drag'));
});

// ─────────── Magnetic elemanlar ───────────
if (matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.magnetic').forEach(el => {
    const strength = 0.35;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
      el.style.transform = 'translate(0,0)';
      setTimeout(() => (el.style.transition = ''), 500);
    });
  });
}

// ─────────── Nav ───────────
const nav = document.getElementById('nav');
const navMenu = document.getElementById('navMenu');
const navToggle = document.getElementById('navToggle');
let lastY = 0;

window.addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('solid', y > 60);
  nav.classList.toggle('hidden', y > 500 && y > lastY && !navMenu.classList.contains('open'));
  lastY = y;

  const h = document.documentElement.scrollHeight - innerHeight;
  document.getElementById('scrollProgress').style.width = (h > 0 ? (y / h * 100) : 0) + '%';
}, { passive: true });

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navMenu.classList.toggle('open');
});
navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navToggle.classList.remove('open');
  navMenu.classList.remove('open');
}));

// ─────────── Hero: 3D dalga nokta ağı ───────────
const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');
let W, H, t = 0, heroVisible = true;

function sizeCanvas() {
  W = canvas.width = canvas.offsetWidth * devicePixelRatio;
  H = canvas.height = canvas.offsetHeight * devicePixelRatio;
}
sizeCanvas();
window.addEventListener('resize', sizeCanvas);

let tiltX = 0, tiltTarget = 0;
document.addEventListener('mousemove', e => {
  tiltTarget = (e.clientX / innerWidth - 0.5) * 2;
});

const COLS = 46, ROWS = 26;
function drawWave() {
  if (heroVisible && !reducedMotion) {
    ctx.clearRect(0, 0, W, H);
    t += 0.016;
    tiltX += (tiltTarget - tiltX) * 0.04;

    const horizon = H * 0.28;
    const spreadX = W * 1.7;

    for (let r = 0; r < ROWS; r++) {
      const depth = r / (ROWS - 1);
      const persp = 0.12 + Math.pow(depth, 1.7) * 0.88;
      const y0 = horizon + Math.pow(depth, 1.6) * (H - horizon) * 0.95;

      for (let c = 0; c < COLS; c++) {
        const u = c / (COLS - 1) - 0.5;
        const x = W / 2 + (u + tiltX * 0.06 * (1 - depth)) * spreadX * persp;
        const wave =
          Math.sin(u * 7 + t * 1.3 + depth * 3.5) * 16 +
          Math.sin(u * 13 - t * 0.9) * 9 +
          Math.cos(depth * 9 + t * 1.1) * 12;
        const y = y0 + wave * persp * devicePixelRatio;

        const size = (0.6 + depth * 2.1) * devicePixelRatio;
        const alpha = 0.08 + depth * 0.5;
        const hueMix = (u + 0.5 + Math.sin(t * .4) * .2);
        const rC = Math.round(0 + hueMix * 124);
        const gC = Math.round(229 - hueMix * 137);

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rC},${gC},255,${alpha})`;
        ctx.fill();
      }
    }
  }
  requestAnimationFrame(drawWave);
}
drawWave();

new IntersectionObserver(en => { heroVisible = en[0].isIntersecting; })
  .observe(document.getElementById('hero'));

// ─────────── Rotator (dönen kelimeler) ───────────
const rotTrack = document.getElementById('rotatorTrack');
const rotCount = Math.max(content.hero.rotator.length, 1);
let rotIdx = 0;
if (rotCount > 1) {
  setInterval(() => {
    rotIdx++;
    rotTrack.style.transition = 'transform .7s cubic-bezier(.65,0,.15,1)';
    rotTrack.style.transform = `translateY(-${rotIdx * 1.65}em)`;
    if (rotIdx === rotCount) {
      setTimeout(() => {
        rotTrack.style.transition = 'none';
        rotTrack.style.transform = 'translateY(0)';
        rotIdx = 0;
      }, 750);
    }
  }, 2400);
}

// ─────────── Sayaçlar ───────────
function runCounter(el) {
  const target = +el.dataset.count;
  const dur = 1600, start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(performance.now());
}
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { runCounter(e.target); cntObs.unobserve(e.target); }
  });
}, { threshold: 0.5 });
// Hero sayaçları preloader perdesinin arkasında kalır (IntersectionObserver
// örtmeyi bilmez) — onları giriş animasyonu bitince gözlemlemeye başlarız.
function observeHeroCounters() {
  document.querySelectorAll('.hero [data-count]').forEach(el => cntObs.observe(el));
}
document.querySelectorAll('[data-count]').forEach(el => {
  if (!el.closest('.hero')) cntObs.observe(el);
});
if (introSkipped) observeHeroCounters();

// ─────────── Servis kartları: parıltı koordinatı ───────────
document.querySelectorAll('.svc').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// ─────────── Süreç halkaları ───────────
const stepObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); stepObs.unobserve(e.target); }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.step').forEach(s => stepObs.observe(s));

// ─────────── Vitrin: dar ekranda fareyle sürükle-kaydır ───────────
// Dar ekranda vitrin native yatay kaydırmaya döner; dokunmatikte swipe zaten
// çalışır ama farede kaydırma çubuğu gizli olduğundan sürükleme desteği şart.
(function () {
  const trackEl = document.getElementById('showcaseTrack');
  // CSS ile birebir aynı sorgu: kesirli genişliklerde (820.5px gibi) iki modun
  // arasında boşluk kalmasın diye min-width yerine max-width'in değili kullanılır.
  const isNarrow = () => window.matchMedia('(max-width: 820px)').matches;
  let dragDown = false, dragStartX = 0, dragStartScroll = 0;

  trackEl.addEventListener('pointerdown', e => {
    if (!isNarrow() || e.pointerType !== 'mouse') return;
    dragDown = true;
    dragStartX = e.clientX;
    dragStartScroll = trackEl.scrollLeft;
    trackEl.setPointerCapture(e.pointerId);
    trackEl.style.scrollSnapType = 'none'; // sürüklerken kart kart yapışmasın
    trackEl.style.cursor = 'grabbing';
  });
  trackEl.addEventListener('pointermove', e => {
    if (!dragDown) return;
    trackEl.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
    e.preventDefault();
  });
  ['pointerup', 'pointercancel'].forEach(ev => trackEl.addEventListener(ev, () => {
    if (!dragDown) return;
    dragDown = false;
    trackEl.style.scrollSnapType = '';
    trackEl.style.cursor = '';
  }));
  trackEl.addEventListener('wheel', e => {
    if (!isNarrow()) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      trackEl.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });
})();

// ─────────── GSAP scroll animasyonları ───────────
if (hasGsap && !reducedMotion) {

  // Kart / blok reveal
  document.querySelectorAll('[data-reveal]').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
  });

  // Bölüm başlıkları: harf harf
  document.querySelectorAll('.sec-title[data-split], .contact-h2 [data-split]').forEach(el => {
    gsap.fromTo(el.querySelectorAll('.char'),
      { yPercent: 130, rotate: 5 },
      {
        yPercent: 0, rotate: 0, duration: .9, ease: 'power4.out', stagger: .03,
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
  });

  // Gradient satırlar: blok halinde yüksel (harf bölme gradient'i bozar)
  document.querySelectorAll('.contact-h2 [data-rise]').forEach(el => {
    gsap.fromTo(el,
      { yPercent: 115 },
      {
        yPercent: 0, duration: 1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
  });

  // Yatay vitrin — geniş ekranda pin'li kaydırma, dar ekranda native scroll.
  // matchMedia change event'i her ortamda güvenilir değil; bu yüzden mod geçişi
  // hem MQL listener hem de genişlik-değişim (fitAll) üzerinden tetiklenir.
  let horizTween = null;
  const narrowMQ = window.matchMedia('(max-width: 820px)'); // CSS ile birebir aynı sınır
  syncShowcaseMode = function () {
    const wide = !narrowMQ.matches;
    const track = document.getElementById('showcaseTrack');
    if (wide && !horizTween) {
      track.scrollLeft = 0;
      // Az proje varken track viewport'tan dar olabilir; negatif mesafe ters yönde kaydırırdı
      const getDistance = () => Math.max(0, track.scrollWidth - innerWidth);
      horizTween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: '.showcase',
          start: 'top top',
          end: () => '+=' + (getDistance() + innerHeight * 0.3),
          scrub: 1,
          pin: '.showcase-pin',
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    } else if (!wide && horizTween) {
      if (horizTween.scrollTrigger) horizTween.scrollTrigger.kill(true);
      horizTween.kill();
      gsap.set(track, { clearProps: 'transform' });
      horizTween = null;
    }
  };
  syncShowcaseMode();
  narrowMQ.addEventListener('change', () => syncShowcaseMode());

  // Hero paralaks
  gsap.to('.hero-inner', {
    y: -110, opacity: 0.25, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // Footer dev yazı hafif paralaks
  gsap.fromTo('.foot-big-track', { xPercent: 0 }, {
    xPercent: -6, ease: 'none',
    scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true },
  });

} else {
  // Fallback: IntersectionObserver ile reveal
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.transition = 'opacity .8s ease, transform .8s ease';
        e.target.style.opacity = 1;
        e.target.style.transform = 'none';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
}

})();
