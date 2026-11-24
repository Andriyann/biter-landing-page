(() => {
  'use strict';

  const measurementId = window.BITER_CONFIG?.gaMeasurementId;
  if (location.hostname !== 'bitersolution.com' || !/^G-[A-Z0-9]+$/.test(measurementId)) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  window.trackBiterWhatsApp = placement => {
    gtag('event', 'whatsapp_click', { placement });
  };

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.append(tag);
})();
