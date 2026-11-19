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
