const slides = [...document.querySelectorAll('.slide')];
const counter = document.getElementById('counter');
let current = Math.min(slides.length - 1, Math.max(0, Number(location.hash.slice(1)) - 1 || 0));
function scale() {
  document.documentElement.style.setProperty('--deck-scale', Math.min(innerWidth / 1280, innerHeight / 720).toFixed(4));
}
function show(index) {
  current = Math.min(slides.length - 1, Math.max(0, index));
  slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
  counter.textContent = (current + 1) + ' / ' + slides.length;
  history.replaceState(null, '', '#' + (current + 1));
}
slides.forEach((slide, i) => {
  slide.querySelector('.page-number').innerHTML = (i + 1) + '<span class="page-total"> / ' + slides.length + '</span>';
});
document.getElementById('prev').addEventListener('click', () => show(current - 1));
document.getElementById('next').addEventListener('click', () => show(current + 1));
document.addEventListener('keydown', event => {
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(current + 1); }
  if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(event.key)) { event.preventDefault(); show(current - 1); }
  if (event.key === 'Home') show(0);
  if (event.key === 'End') show(slides.length - 1);
});
window.addEventListener('hashchange', () => show(Number(location.hash.slice(1)) - 1));
window.addEventListener('resize', scale);
scale();
show(current);
