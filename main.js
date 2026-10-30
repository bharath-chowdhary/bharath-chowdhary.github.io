gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const t = document.querySelector(a.getAttribute('href'));
  if (t) { e.preventDefault(); lenis.scrollTo(t, { duration: 1.6 }); }
}));

/* nav hide on scroll down */
const nav = document.getElementById('nav');
let lastY = 0;
lenis.on('scroll', ({ scroll }) => {
  nav.classList.toggle('hide', scroll > lastY && scroll > 200);
  lastY = scroll;
});

/* hero intro */
gsap.from('.hero-title .line span', { yPercent: 110, duration: 1.3, ease: 'power4.out', stagger: .12, delay: .2 });
gsap.from('.hero-tag span', { yPercent: 120, duration: 1.1, ease: 'power4.out', stagger: .15, delay: .6 });
gsap.from('.hero-photo', { scale: 1.12, opacity: 0, duration: 1.8, ease: 'power3.out' });
gsap.from('.nav > *', { y: -30, opacity: 0, duration: 1, ease: 'power3.out', stagger: .1, delay: .4 });

const mm = gsap.matchMedia();

mm.add('(min-width: 901px)', () => {
  /* hero → collage → rising orange panel */
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '#heroWrap', start: 'top top', end: 'bottom bottom', scrub: 1 }
  });
  tl.fromTo('#hero', { scale: 1, borderRadius: 0 }, { scale: .5, borderRadius: 14, ease: 'none', duration: 1 }, 0)
    .fromTo('#collage', { scale: 1.6, opacity: .35 }, { scale: 1, opacity: 1, ease: 'none', duration: 1 }, 0)
    .to('.hero-photo', { yPercent: 6, ease: 'none', duration: 1 }, 0)
    .to('#hero', { scale: .42, yPercent: -6, ease: 'none', duration: .6 }, 1)
    .to('#collage', { scale: .92, yPercent: -10, ease: 'none', duration: .6 }, 1)
    .to('#rise', { y: 0, yPercent: 0, ease: 'power1.out', duration: .9 }, 1)
    .fromTo('#rise', { borderRadius: '50% 50% 0 0 / 22vh 22vh 0 0' }, { borderRadius: '0% 0% 0 0 / 0vh 0vh 0 0', ease: 'none', duration: .9 }, 1)
    .from('.rise-title', { yPercent: 60, opacity: 0, ease: 'none', duration: .6 }, 1.2);

  /* projects: stacked cards */
  const cards = gsap.utils.toArray('.wcard');
  const items = gsap.utils.toArray('#workList li');
  gsap.set(cards, { filter: 'brightness(1)' });
  gsap.set(cards.slice(1), { yPercent: 115, rotate: 2 });
  const wt = gsap.timeline({
    scrollTrigger: {
      trigger: '#work', start: 'top top', end: 'bottom bottom', scrub: 1,
      onUpdate: self => {
        const idx = Math.min(cards.length - 1, Math.floor(self.progress * cards.length * 0.999 + .15));
        items.forEach((li, i) => { li.classList.toggle('active', i === idx); li.classList.toggle('done', i < idx); });
      }
    }
  });
  cards.slice(1).forEach((c, i) => {
    wt.to(c, { yPercent: 0, rotate: 0, ease: 'power2.inOut', duration: 1 }, i)
      .to(cards[i], { scale: .92, filter: 'brightness(.6)', ease: 'none', duration: 1 }, i);
  });
  wt.to({}, { duration: .4 });
  items.forEach((li, i) => li.addEventListener('click', () => {
    const st = wt.scrollTrigger;
    lenis.scrollTo(st.start + (st.end - st.start) * (i / cards.length) + 5, { duration: 1.2 });
  }));

  /* skills horizontal scroll */
  const track = document.getElementById('skillsTrack');
  gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: { trigger: '#skillsPin', start: 'top top', end: () => '+=' + (track.scrollWidth - window.innerWidth), pin: true, scrub: 1, invalidateOnRefresh: true }
  });
  gsap.from('.scard', { y: 80, opacity: 0, duration: 1, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '#skillsPin', start: 'top 80%' } });
});

/* generic reveals */
gsap.utils.toArray('.reveal').forEach(el => {
  gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
});
gsap.utils.toArray('.arow').forEach((el, i) => {
  gsap.from(el, { y: 40, opacity: 0, duration: .9, ease: 'power3.out', delay: (i % 4) * .05, scrollTrigger: { trigger: el, start: 'top 92%' } });
});

/* skill card cursor-origin fill */
document.querySelectorAll('.scard').forEach(c => {
  const set = e => { const r = c.getBoundingClientRect(); c.style.setProperty('--x', (e.clientX - r.left) + 'px'); c.style.setProperty('--y', (e.clientY - r.top) + 'px'); };
  c.addEventListener('mouseenter', set);
  c.addEventListener('mouseleave', set);
});

/* awards hover preview following cursor */
const preview = document.getElementById('preview');
const pvInner = document.getElementById('pvInner');
const list = document.getElementById('awardList');
const xTo = gsap.quickTo(preview, 'x', { duration: .6, ease: 'power3' });
const yTo = gsap.quickTo(preview, 'y', { duration: .6, ease: 'power3' });
gsap.set(preview, { xPercent: -50, yPercent: -50, x: innerWidth * .7, y: innerHeight / 2 });
window.addEventListener('mousemove', e => { xTo(e.clientX + 120); yTo(e.clientY); });
list.addEventListener('mouseenter', () => gsap.to(preview, { opacity: 1, scale: 1, duration: .45, ease: 'power3.out' }));
list.addEventListener('mouseleave', () => gsap.to(preview, { opacity: 0, scale: .6, duration: .4, ease: 'power3.in' }));
list.querySelectorAll('.arow').forEach(r => r.addEventListener('mouseenter', () => {
  pvInner.style.transform = `translateY(-${r.dataset.i * 100}%)`;
}));

/* floating tech logos */
const logos = ['python', 'django', 'react', 'fastapi', 'postgresql', 'mysql', 'java', 'html5', 'css3', 'javascript', 'git', 'github', 'bootstrap'];
const cloud = document.getElementById('logoCloud');
const els = logos.map(n => { const i = new Image(); i.src = `assets/logos/${n}.svg`; i.alt = n; i.className = 'flogo'; if (n === 'github') i.style.filter = 'invert(1)'; cloud.appendChild(i); return i; });
let li = 0;
function popLogo() {
  const el = els[li++ % els.length];
  const ang = Math.random() * Math.PI * 2;
  const rx = innerWidth * (.26 + Math.random() * .16), ry = innerHeight * (.2 + Math.random() * .14);
  const tx = Math.cos(ang) * rx, ty = Math.sin(ang) * ry;
  const base = el.style.filter.includes('invert') ? 'invert(1) ' : '';
  gsap.timeline()
    .fromTo(el, { xPercent: -50, yPercent: -50, x: tx * .35, y: ty * .35, scale: .5, opacity: 0, filter: base + 'blur(12px)' },
      { x: tx * .8, y: ty * .8, scale: 1, opacity: 1, filter: base + 'blur(0px)', duration: 1.4, ease: 'power3.out' })
    .to(el, { x: tx, y: ty, scale: 1.15, opacity: 0, filter: base + 'blur(10px)', duration: 1.4, ease: 'power2.in' }, '+=0.6');
}
ScrollTrigger.create({
  trigger: '#trusted', start: 'top 70%', end: 'bottom 20%',
  onToggle: self => {
    if (self.isActive) { popLogo(); cloud._iv = setInterval(popLogo, 520); }
    else clearInterval(cloud._iv);
  }
});

/* profiles switcher */
const profiles = [
  { name: 'GitHub', role: '@bharath-chowdhary · Repositories', quote: '“Explore my code — Student Material Hub, Student Management System and more. Clean commits, real projects, always shipping.”', btn: 'View GitHub', href: 'https://github.com/bharath-chowdhary?tab=repositories' },
  { name: 'LinkedIn', role: 'Bharath Cherukuri · Software Engineer aspirant', quote: '“Let’s connect! I share my journey through projects, internships like Infosys Springboard, and certifications in AI-ML and data analytics.”', btn: 'Connect on LinkedIn', href: 'https://www.linkedin.com/in/bharath-cherukuri-0492932b7/' },
  { name: 'Bharath Cherukuri', role: 'CSE (Data Science) · QISCET · 2027', quote: '“I build practical, real-world applications — from academic portals to AI-integrated search systems — and I’m actively seeking an entry-level Software Engineer or Web Developer role where I can contribute, grow and create meaningful impact.”', btn: 'Download Resume', href: 'assets/Bharath_Cherukuri_Resume.pdf' },
  { name: 'LeetCode', role: 'Bharath_cherukuri · Problem Solver', quote: '“Sharpening data structures & algorithms one problem at a time — consistent practice for efficient, optimized solutions.”', btn: 'View LeetCode', href: 'https://leetcode.com/u/Bharath_cherukuri/' },
  { name: 'Email Me', role: 'bharathchowdhary.cherukuri@gmail.com · +91 74160 39605', quote: '“Have an opportunity, a project or just want to say hi? My inbox is always open — I’ll get back to you quickly.”', btn: 'Send an Email', href: 'mailto:bharathchowdhary.cherukuri@gmail.com' }
];
const avBtns = [...document.querySelectorAll('#avatars button')];
const pbody = document.getElementById('pbody');
let cur = 2, auto;
function showProfile(i) {
  if (i === cur) return;
  cur = i;
  avBtns.forEach(b => b.classList.toggle('on', +b.dataset.i === i));
  pbody.classList.add('swap');
  setTimeout(() => {
    const p = profiles[i];
    document.getElementById('pName').textContent = p.name;
    document.getElementById('pRole').textContent = p.role;
    document.getElementById('pQuote').textContent = p.quote;
    document.getElementById('pBtn').textContent = p.btn;
    const l = document.getElementById('pLink');
    l.href = p.href;
    if (p.href.startsWith('mailto')) l.removeAttribute('target'); else l.target = '_blank';
    pbody.classList.remove('swap');
  }, 320);
}
const startAuto = () => { clearInterval(auto); auto = setInterval(() => showProfile((cur + 1) % profiles.length), 5000); };
avBtns.forEach(b => b.addEventListener('click', () => { showProfile(+b.dataset.i); startAuto(); }));
startAuto();

/* FAQ accordion */
const qas = [...document.querySelectorAll('.qa')];
const setH = q => { const a = q.querySelector('.ans'); a.style.height = q.classList.contains('open') ? a.scrollHeight + 'px' : '0px'; };
qas.forEach(q => {
  setH(q);
  q.querySelector('button').addEventListener('click', () => {
    const open = !q.classList.contains('open');
    qas.forEach(o => { o.classList.remove('open'); setH(o); });
    if (open) { q.classList.add('open'); setH(q); }
    setTimeout(() => ScrollTrigger.refresh(), 600);
  });
});
window.addEventListener('resize', () => qas.forEach(setH));

window.addEventListener('load', () => ScrollTrigger.refresh());
