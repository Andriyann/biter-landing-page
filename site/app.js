'use strict';
const config = window.BITER_CONFIG || {};
const $ = id => document.getElementById(id);
$('year').textContent = new Date().getFullYear();
$('menu').addEventListener('click', () => {
  const open = $('nav').classList.toggle('open');
  $('menu').setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => {
  $('nav').classList.remove('open'); $('menu').setAttribute('aria-expanded', 'false');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('nav').classList.contains('open')) {
    $('menu').click();
    $('menu').focus();
  }
});

const sectionLinks = Array.from($('nav').querySelectorAll('a[href^="#"]'));
const currentSections = new Set();
const sectionObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) currentSections.add(entry.target.id);
    else currentSections.delete(entry.target.id);
  }
  const active = sectionLinks.find(link => currentSections.has(link.hash.slice(1)));
  for (const link of sectionLinks) {
    if (link === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}, { rootMargin: '-15% 0px -45% 0px' });
for (const link of sectionLinks) sectionObserver.observe($(link.hash.slice(1)));
$('address').textContent = config.address;
const whatsappNumber = String(config.whatsapp || '').replace(/\D/g, '');
const whatsappUrl = /^[1-9]\d{7,14}$/.test(whatsappNumber)
  ? 'https://wa.me/' + whatsappNumber
  : '';
if (whatsappUrl) {
  const launcher = $('whatsapp-launcher');
  launcher.href = whatsappUrl + '?text=' + encodeURIComponent('Halo BITER, saya ingin konsultasi servis perangkat.');
  launcher.target = '_blank';
  launcher.rel = 'noopener noreferrer';
  $('footer-whatsapp').href = whatsappUrl;
}

for (const [id, url] of [['directions', config.directionsUrl], ['review-link', config.reviewsUrl]]) {
  const link = $(id);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.hidden = false;
}

const reviewTrack = $('reviews');
const carousel = $('review-carousel');
const previousReview = $('review-prev');
const nextReview = $('review-next');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let carouselVisible = false;
let reviewTimer;

function updateReviewControls() {
  const end = reviewTrack.scrollWidth - reviewTrack.clientWidth;
  previousReview.disabled = reviewTrack.scrollLeft <= 2;
  nextReview.disabled = reviewTrack.scrollLeft >= end - 2;
}

function scheduleReviewAdvance() {
  window.clearTimeout(reviewTimer);
  if (motionPreference.matches || !carouselVisible || document.hidden || carousel.matches(':hover, :focus-within')) return;
  if (previousReview.disabled && nextReview.disabled) return;
  reviewTimer = window.setTimeout(() => {
    if (nextReview.disabled) reviewTrack.scrollTo({ left: 0, behavior: 'instant' });
    else moveReviews(1);
    scheduleReviewAdvance();
  }, 9000);
}

motionPreference.addEventListener('change', scheduleReviewAdvance);
const reviewObserver = new IntersectionObserver(([entry]) => {
  carouselVisible = entry.isIntersecting;
  scheduleReviewAdvance();
});
reviewObserver.observe(carousel);
for (const event of ['pointerenter', 'pointerleave', 'focusin', 'focusout']) {
  carousel.addEventListener(event, () => window.requestAnimationFrame(scheduleReviewAdvance));
}
document.addEventListener('visibilitychange', scheduleReviewAdvance);

function moveReviews(direction) {
  const [first, second] = reviewTrack.children;
  if (!second) return;
  const distance = second.offsetLeft - first.offsetLeft;
  reviewTrack.scrollBy({ left: direction * distance, behavior: motionPreference.matches ? 'instant' : 'smooth' });
}

previousReview.addEventListener('click', () => moveReviews(-1));
nextReview.addEventListener('click', () => moveReviews(1));
reviewTrack.addEventListener('scroll', updateReviewControls, { passive: true });
window.addEventListener('resize', () => {
  updateReviewControls();
  scheduleReviewAdvance();
});

const testimonials = (config.testimonials || []).map(({ name, photo, text }) => ({
  text,
  authorAttribution: { displayName: name, photoURI: photo }
}));
const reviewerName = review => review.authorAttribution?.displayName?.trim().toLocaleLowerCase('id');
const featuredNames = new Set(testimonials.map(reviewerName));

function showReviews(place) {
  const googleReviews = (place?.reviews || [])
    .filter(review => !featuredNames.has(reviewerName(review)));
  const cards = [...testimonials, ...googleReviews].map(review => {
    const card = document.createElement('article');
    card.className = 'quote';
    const author = review.authorAttribution;
    const name = document.createElement(author?.uri ? 'a' : 'strong');
    name.textContent = author?.displayName || 'Pengguna Google Maps';
    if (author?.uri) {
      name.href = author.uri;
      name.target = '_blank';
      name.rel = 'noopener noreferrer';
      name.className = 'textlink';
    }
    if (review.rating) {
      const rating = document.createElement('p');
      rating.className = 'review-rating';
      rating.setAttribute('aria-label', review.rating + ' dari 5 bintang');
      const stars = document.createElement('span');
      stars.setAttribute('aria-hidden', 'true');
      const filled = Math.min(5, Math.max(0, Math.round(review.rating)));
      stars.textContent = '★'.repeat(filled) + '☆'.repeat(5 - filled);
      rating.append(stars);
      card.append(rating);
    }
    if (review.text) {
      const quote = document.createElement('blockquote');
      quote.textContent = review.text;
      card.append(quote);
    }
    const byline = document.createElement('div');
    byline.className = 'review-author';
    byline.append(name);
    if (googleReviews.includes(review)) {
      const source = document.createElement('small');
      source.className = 'review-source';
      source.textContent = 'Google Maps';
      byline.append(source);
    }
    const avatar = document.createElement('span');
    avatar.className = 'review-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = name.textContent.trim().split(/\s+/).slice(0, 2)
      .map(part => Array.from(part)[0]).join('').toLocaleUpperCase('id') || '?';
    if (author?.photoURI) {
      const image = document.createElement('img');
      image.alt = '';
      image.loading = 'lazy';
      image.addEventListener('error', () => image.remove(), { once: true });
      image.src = author.photoURI;
      avatar.append(image);
    }
    byline.append(avatar);
    card.append(byline);
    return card;
  });

  const previousOffset = reviewTrack.scrollLeft;
  reviewTrack.replaceChildren(...cards);
  carousel.hidden = !cards.length;
  reviewTrack.scrollLeft = previousOffset;
  updateReviewControls();
  scheduleReviewAdvance();
  $('review-status').textContent = place?.rating
    ? 'Google Maps · ' + place.rating + '/5 (' + place.userRatingCount + ' penilaian). Ulasan tambahan diurutkan berdasarkan relevansi.'
    : 'Pengalaman pelanggan yang pernah servis di BITER.';
  const attributions = $('review-attributions');
  attributions.replaceChildren();
  for (const { provider, providerURI } of place?.attributions || []) {
    if (!provider) continue;
    const credit = document.createElement(providerURI ? 'a' : 'span');
    credit.textContent = provider;
    if (providerURI) {
      credit.href = providerURI;
      credit.target = '_blank';
      credit.rel = 'noopener noreferrer';
    }
    attributions.append(credit, ' ');
  }
  attributions.hidden = !attributions.childNodes.length;
}

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: config.googleMapsApiKey, loading: 'async', callback: 'biterMapsReady',
      v: 'weekly', language: 'id', region: 'ID'
    });
    window.biterMapsReady = resolve;
    window.gm_authFailure = () => reject(new Error('Google Maps authentication failed'));
    script.onerror = reject;
    script.src = 'https://maps.googleapis.com/maps/api/js?' + params;
    script.async = true;
    document.head.append(script);
  });
}

async function startReviews() {
  const status = $('review-status');
  status.textContent = 'Memuat ulasan Google Maps…';
  try {
    await loadGoogleMaps();
    const { Place } = await google.maps.importLibrary('places');
    const refresh = async () => {
      try {
        const place = new Place({ id: config.placeId, requestedLanguage: 'id' });
        await place.fetchFields({ fields: ['rating', 'userRatingCount', 'reviews'] });
        showReviews(place);
      } catch {
        status.textContent = 'Ulasan belum bisa diperbarui. Buka Google Maps untuk melihat ulasan terbaru.';
      } finally {
        window.setTimeout(refreshWhenVisible, 5 * 60 * 1000);
      }
    };
    function refreshWhenVisible() {
      if (document.hidden) {
        document.addEventListener('visibilitychange', refreshWhenVisible, { once: true });
      } else {
        void refresh();
      }
    }
    refreshWhenVisible();
  } catch {
    status.textContent = 'Ulasan tidak dapat dimuat. Lihat langsung di Google Maps.';
  }
}

showReviews();
if (config.googleMapsApiKey?.trim()) void startReviews();

document.querySelectorAll('.service').forEach(button => button.addEventListener('click', () => {
  $('device').value=button.dataset.device; location.hash='konsultasi'; $('device').focus({preventScroll:true});
}));
$('consult').addEventListener('submit', event => {
  event.preventDefault();
  if (!whatsappUrl) {
    $('notice').textContent='Nomor WhatsApp BITER belum tersedia. Silakan kunjungi halaman ini kembali setelah informasi kontak diperbarui.'; return;
  }
  const data=new FormData(event.currentTarget);
  const message=`Halo BITER Services Solution, saya ${String(data.get('name')).trim()}.\nPerangkat: ${data.get('device')}\nMerek/model: ${String(data.get('model')).trim() || '-'}\nKendala/pertanyaan: ${String(data.get('issue')).trim()}\nMohon informasi langkah berikutnya. Terima kasih.`;
  window.location.assign(whatsappUrl+'?text='+encodeURIComponent(message));
});

const partDialog = $('part-dialog');
document.querySelectorAll('.anatomy-part').forEach(part => {
  part.addEventListener('click', () => {
    $('part-name').textContent = part.querySelector('span').textContent;
    $('part-function').textContent = part.dataset.description;
    $('part-example').textContent = part.dataset.example;
    partDialog.querySelector('.part-preview').replaceChildren(part.querySelector('svg').cloneNode(true));
    partDialog.showModal();
  });
});

const deviceLessons = {
  anatomi: {
    'Rekam suara': [
      ['Mikrofon', 'Gelombang suara menggerakkan membran mikrofon. Suaramu berubah menjadi sinyal.'],
      ['Papan utama', 'Sistem mengolah data audio dan menyimpan rekaman.'],
      ['Speaker', 'Saat diputar kembali, speaker mengubah sinyal audio menjadi suara.']
    ],
    'Ketik pesan': [
      ['Layar sentuh', 'Saat jari mengetuk keyboard di layar, sensor membaca posisi sentuhan.'],
      ['Papan utama', 'Sistem mengenali huruf dan mengirim perintah umpan balik jika getar sentuh aktif.'],
      ['Motor getar', 'Denyut singkat terasa di jarimu sebagai tanda ketukan diterima.']
    ],
    'Ambil foto': [
      ['Kamera', 'Cahaya masuk melalui lensa. Sensor mengubahnya menjadi data gambar.'],
      ['Papan utama', 'Prosesor gambar mengolah warna dan kecerahan dari data sensor.'],
      ['Layar sentuh', 'Layar menampilkan hasil foto. Kamu bisa mencubit layar untuk melihat detailnya.']
    ],
    'Putar musik': [
      ['Layar sentuh', 'Sensor sentuh membaca ketukanmu pada tombol putar.'],
      ['Papan utama', 'Prosesor mengolah berkas audio. Rangkaian audio menyiapkan sinyal untuk speaker.'],
      ['Speaker', 'Membran speaker bergetar mengikuti sinyal, lalu terdengarlah musik.']
    ],
    'Isi daya': [
      ['Port USB-C', 'Saat kabel terpasang, daya dari adaptor masuk melalui port USB-C.'],
      ['Papan utama', 'Rangkaian pengisian mengatur tegangan dan arus ke baterai.'],
      ['Baterai', 'Baterai menyimpan energi agar HP bisa dipakai lagi setelah kabel dicabut.']
    ]
  },
  'anatomi-laptop': {
    'Ketik dokumen': [
      ['Keyboard', 'Ketukan pada tombol menghasilkan kode yang menandai tombol tersebut.'],
      ['Prosesor', 'Sistem dan aplikasi menerjemahkan ketukan itu menjadi karakter dalam dokumen.'],
      ['Layar', 'Karakter yang baru kamu ketik muncul di posisi kursor.']
    ],
    'Lihat foto': [
      ['SSD', 'Aplikasi galeri membaca berkas foto dari penyimpanan.'],
      ['RAM', 'Data gambar tersedia di memori untuk diproses dan ditampilkan.'],
      ['Layar', 'Piksel pada panel menampilkan warna dan detail fotomu.']
    ],
    'Buka aplikasi': [
      ['SSD', 'Sistem membaca berkas aplikasi dari penyimpanan.'],
      ['RAM', 'Kode dan data yang sedang dibutuhkan dimuat ke memori kerja.'],
      ['Prosesor', 'CPU menjalankan instruksi aplikasi sehingga kamu bisa mulai menggunakannya.']
    ],
    'Simpan unduhan': [
      ['Wi-Fi', 'Modul Wi-Fi menerima paket data dari router.'],
      ['RAM', 'Data ditampung sementara selama proses unduh berlangsung.'],
      ['SSD', 'Sistem menulis berkas ke penyimpanan agar bisa dibuka lagi setelah laptop dimatikan.']
    ],
    'Main gim': [
      ['Baterai', 'Saat adaptor dilepas, baterai memasok daya untuk menjalankan gim.'],
      ['Prosesor', 'CPU menghitung logika permainan, termasuk gerakan karakter dan respons terhadap tombol.'],
      ['Kipas', 'Jika suhu naik, kipas membantu membuang panas melalui sirip pendingin.']
    ]
  }
};

for (const [id, lessons] of Object.entries(deviceLessons)) {
  const section = document.getElementById(id);
  const model = section.querySelector('.anatomy-model, .notebook-case');
  const parts = new Map([...model.querySelectorAll('.anatomy-part')].map(part =>
    [part.querySelector('span').textContent, part]));
  const controls = section.querySelector('.lab-controls');
  const reader = section.querySelector('.lab-reader');
  const playback = reader.querySelector('.lab-playback');
  const meter = reader.querySelector('.lab-meter');
  const choices = controls.querySelector('.lab-choices');
  const ns = 'http://www.w3.org/2000/svg';
  const overlay = document.createElementNS(ns, 'svg');
  overlay.classList.add('lab-trace');
  overlay.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(ns, 'polyline');
  overlay.append(path);
  model.append(overlay);
  let selected = '';
  let step = 0;
  let paused = false;
  let finished = false;
  let timer;

  function schedule() {
    clearTimeout(timer);
    if (!selected || paused || finished || document.hidden || partDialog.open) return;
    const delay = Math.max(3500, lessons[selected][step][1].length * 65);
    timer = setTimeout(() => {
      if (step + 1 === lessons[selected].length) finished = true;
      else step++;
      render();
    }, delay);
  }
  document.addEventListener('visibilitychange', schedule);
  model.addEventListener('click', schedule);
  partDialog.addEventListener('close', schedule);

  function drawPath() {
    const points = (lessons[selected] || []).slice(0, step + 1).map(([name]) => {
      const rect = parts.get(name).getBoundingClientRect();
      const origin = overlay.getBoundingClientRect();
      return [rect.left - origin.left + rect.width / 2, rect.top - origin.top + rect.height / 2].join(',');
    });
    path.setAttribute('points', points.join(' '));
  }

  function render() {
    const steps = lessons[selected];
    reader.hidden = !steps;
    for (const button of choices.children) button.setAttribute('aria-pressed', String(button.textContent === selected));
    for (const [name, part] of parts) part.classList.toggle('lab-active', name === steps?.[step][0]);
    if (steps) {
      const [name, description] = steps[step];
      reader.querySelector('.lab-caption').textContent = (step + 1) + '/' + steps.length + ' · ' + name + ' — ' + description;
      meter.replaceChildren(...steps.map((_, i) => {
        const segment = document.createElement('span');
        segment.classList.toggle('reached', i <= step);
        return segment;
      }));
      playback.textContent = finished ? 'Putar ulang' : paused ? 'Teruskan' : 'Jeda';
    }
    drawPath();
    schedule();
  }

  for (const label of Object.keys(lessons)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      selected = label;
      step = 0;
      paused = finished = false;
      render();
    });
    choices.append(button);
  }
  playback.addEventListener('click', () => {
    if (finished) {
      step = 0;
      paused = finished = false;
    } else paused = !paused;
    render();
  });
  new ResizeObserver(drawPath).observe(model);
  controls.hidden = false;
  render();
}
