'use strict';

(() => {
  const section = document.getElementById('estimasi');
  const model = document.getElementById('estimate-model');
  const service = document.getElementById('estimate-service');
  const custom = document.getElementById('estimate-custom');
  const caption = document.getElementById('estimate-caption');
  const amount = document.getElementById('estimate-amount');
  const sources = document.getElementById('estimate-sources');
  const consult = document.getElementById('estimate-consult');
  const stage = section.querySelector('.estimate-stage');
  const drawing = stage.querySelector('.estimate-drawing');
  const catalog = window.BITER_CONFIG?.repairReferences || {};
  const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  });
  let device = section.querySelector('[name="estimate-device"]:checked').value;
  let previousDraft = '';

  function fillModels(selected = '') {
    model.replaceChildren(new Option(translate('Pilih model perangkat'), ''));
    for (const entry of catalog[device] || []) model.add(new Option(entry.model, entry.model));
    model.add(new Option(translate('Model lainnya'), 'other'));
    model.value = selected;
  }

  function render() {
    const entry = (catalog[device] || []).find(item => item.model === model.value);
    const range = entry?.[service.value];
    document.getElementById('estimate-custom-label').hidden = model.value !== 'other';
    stage.dataset.device = device;
    stage.querySelectorAll('[data-part]').forEach(part => {
      part.toggleAttribute('hidden', part.dataset.part !== service.value);
    });
    sources.replaceChildren();
    sources.hidden = !range;
    if (range) {
      caption.textContent = translate('Harga pembanding') + ' · ' + entry.model;
      amount.textContent = range.map(value => rupiah.format(value)).join(' – ');
      for (const [name, url] of entry.sources) {
        if (sources.childNodes.length) sources.append(' · ');
        const link = document.createElement('a');
        link.href = url;
        link.textContent = name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        sources.append(link);
      }
    } else {
      caption.textContent = '';
      amount.textContent = translate(model.value ? 'Minta estimasi dari teknisi' : 'Pilih model untuk melihat kisaran');
    }
    amount.classList.toggle('estimate-prompt', !range);
    consult.disabled = !model.value;
  }

  section.addEventListener('change', event => {
    if (event.target.name === 'estimate-device') {
      device = event.target.value;
      custom.value = '';
      fillModels();
    }
    render();
    if (event.target !== custom && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drawing.getAnimations().forEach(animation => animation.cancel());
      drawing.animate([{ opacity: .6, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 300, easing: 'ease-out' });
    }
  });

  consult.addEventListener('click', () => {
    const modelName = model.value === 'other' ? custom.value.trim() : model.value;
    if (!modelName) {
      custom.focus();
      custom.setCustomValidity(translate('Isi merek dan tipe perangkatmu.'));
      custom.reportValidity();
      return;
    }
    const form = document.getElementById('consult');
    form.elements.device.value = device;
    form.elements.model.value = modelName;
    const repair = service.selectedOptions[0].textContent;
    const comparison = sources.hidden ? '' : ' (' + translate('Harga pembanding') + ' ' + amount.textContent + ')';
    const draft = translate('Mohon estimasi biaya untuk') + ' ' + repair + comparison + '.';
    const issue = form.elements.issue;
    const notes = previousDraft && issue.value.startsWith(previousDraft)
      ? issue.value.slice(previousDraft.length).trimStart() : issue.value;
    if (draft.length + notes.length + 2 <= issue.maxLength) {
      issue.value = notes ? draft + '\n\n' + notes : draft;
      previousDraft = draft;
    }
    location.hash = 'konsultasi';
    (form.elements.name.value ? issue : form.elements.name).focus({ preventScroll: true });
  });
  custom.addEventListener('input', () => custom.setCustomValidity(''));
  document.addEventListener('biter-language', () => {
    fillModels(model.value);
    render();
  });
  fillModels();
  render();
  section.hidden = false;
  document.getElementById('estimate-link').hidden = false;
})();
