'use strict';

const colorPreference = window.matchMedia('(prefers-color-scheme: dark)');
let selectedTheme;
try {
  selectedTheme = localStorage.getItem('biter-theme');
} catch {}

function applyTheme() {
  const dark = selectedTheme === 'dark' || (!selectedTheme && colorPreference.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelectorAll('header .brand img').forEach(logo => {
    logo.src = dark ? './logo-dark.svg' : './logo.svg';
  });
  document.querySelectorAll('.site-footer .brand img').forEach(logo => {
    logo.src = './logo-dark.svg';
  });
  document.querySelector('meta[name="theme-color"]').content = dark ? '#111a23' : '#ffffff';
  document.getElementById('theme')?.setAttribute('aria-pressed', String(dark));
}

applyTheme();
colorPreference.addEventListener('change', applyTheme);
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  document.getElementById('theme').addEventListener('click', () => {
    selectedTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('biter-theme', selectedTheme);
    } catch {}
    applyTheme();
  });
});
