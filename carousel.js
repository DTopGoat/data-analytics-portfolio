document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const slides = [...carousel.querySelectorAll('.slide')];
  const prev = carousel.querySelector('.prev');
  const next = carousel.querySelector('.next');
  const dotsWrap = carousel.parentElement.querySelector('.carousel-dots');
  let index = 0;

  if (slides.length <= 1) {
    if (prev) prev.hidden = true;
    if (next) next.hidden = true;
    if (dotsWrap) dotsWrap.hidden = true;
    return;
  }

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => go(i));
    if (dotsWrap) dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap ? [...dotsWrap.querySelectorAll('.carousel-dot')] : [];
  function go(newIndex) {
    index = (newIndex + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  if (prev) prev.addEventListener('click', () => go(index - 1));
  if (next) next.addEventListener('click', () => go(index + 1));
});
