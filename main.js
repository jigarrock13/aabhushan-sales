/* ============================
   AABHUSHAN SALES – MAIN JS
   3D Animations + Motion
   ============================ */

'use strict';

// ===== GSAP SETUP =====
gsap.registerPlugin(ScrollTrigger);

// ===== LOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
    initHeroAnimations();
  }, 2400);
});

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  gsap.to(cursor, { x: mouseX - 5, y: mouseY - 5, duration: 0.1 });
});

function animateCursorFollower() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  gsap.set(cursorFollower, { x: followerX - 16, y: followerY - 16 });
  requestAnimationFrame(animateCursorFollower);
}
animateCursorFollower();

document.querySelectorAll('a, button, .collection-card, .why-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    gsap.to(cursor, { scale: 2.5, duration: 0.3 });
    gsap.to(cursorFollower, { scale: 1.5, opacity: 0.4, duration: 0.3 });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(cursor, { scale: 1, duration: 0.3 });
    gsap.to(cursorFollower, { scale: 1, opacity: 0.6, duration: 0.3 });
  });
});

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (mobileMenu.classList.contains('open')) {
    gsap.to(spans[0], { y: 6.5, rotate: 45, duration: 0.3 });
    gsap.to(spans[1], { opacity: 0, duration: 0.3 });
    gsap.to(spans[2], { y: -6.5, rotate: -45, duration: 0.3 });
  } else {
    gsap.to(spans[0], { y: 0, rotate: 0, duration: 0.3 });
    gsap.to(spans[1], { opacity: 1, duration: 0.3 });
    gsap.to(spans[2], { y: 0, rotate: 0, duration: 0.3 });
  }
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    const spans = hamburger.querySelectorAll('span');
    gsap.to(spans[0], { y: 0, rotate: 0, duration: 0.3 });
    gsap.to(spans[1], { opacity: 1, duration: 0.3 });
    gsap.to(spans[2], { y: 0, rotate: 0, duration: 0.3 });
  });
});

// ===== SCROLL REVEAL =====
function initReveal() {
  const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay ? parseInt(entry.target.dataset.delay) : 0;
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  elements.forEach(el => observer.observe(el));
}
initReveal();

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, parseInt(el.dataset.target));
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

// ===== HERO ANIMATIONS =====
function initHeroAnimations() {
  const tl = gsap.timeline();
  tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    .to('.hero-title .line:nth-child(1)', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.4')
    .to('.hero-title .line:nth-child(2)', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6')
    .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
    .to('.hero-actions', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    .to('.hero-scroll-hint', { opacity: 1, duration: 0.6 }, '-=0.2')
    .to('.hero-stats', { opacity: 1, duration: 0.6 }, '-=0.4');
}

// ===== THREE.JS SCENES =====

// --- HERO CANVAS: Floating Gem Particles ---
(function initHeroScene() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 30;

  // Gold particles
  const particleCount = 300;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const speeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    sizes[i] = Math.random() * 3 + 0.5;
    speeds[i] = Math.random() * 0.005 + 0.001;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xC9A84C,
    size: 0.15,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geometry, particleMaterial);
  scene.add(particles);

  // Large central gem (OctahedronGeometry = diamond shape)
  const gemGeo = new THREE.OctahedronGeometry(5, 0);
  const gemMat = new THREE.MeshStandardMaterial({
    color: 0xC9A84C,
    metalness: 0.9,
    roughness: 0.1,
    wireframe: false,
    transparent: true,
    opacity: 0.15,
  });
  const gem = new THREE.Mesh(gemGeo, gemMat);
  gem.position.set(15, 0, -5);
  scene.add(gem);

  const gemWire = new THREE.Mesh(gemGeo, new THREE.MeshBasicMaterial({ color: 0xC9A84C, wireframe: true, transparent: true, opacity: 0.3 }));
  gemWire.position.copy(gem.position);
  scene.add(gemWire);

  // Ambient + point lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const pointLight = new THREE.PointLight(0xC9A84C, 2, 60);
  pointLight.position.set(15, 10, 10);
  scene.add(pointLight);

  // Floating rings
  const rings = [];
  for (let i = 0; i < 5; i++) {
    const ringGeo = new THREE.TorusGeometry(3 + i * 1.5, 0.04, 8, 60);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.12 - i * 0.015 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(15, 0, -5);
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.y = Math.random() * Math.PI;
    scene.add(ring);
    rings.push(ring);
  }

  let mouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    particles.rotation.y += 0.0008;
    particles.rotation.x += 0.0003;

    gem.rotation.x += 0.003;
    gem.rotation.y += 0.005;
    gem.position.y = Math.sin(t * 0.8) * 1.5;
    gemWire.rotation.copy(gem.rotation);
    gemWire.position.copy(gem.position);

    rings.forEach((ring, i) => {
      ring.rotation.x += 0.002 + i * 0.001;
      ring.rotation.z += 0.001 + i * 0.001;
      ring.position.copy(gem.position);
    });

    // Parallax camera
    camera.position.x += (mouse.x * 4 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 2 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();

// --- ABOUT CANVAS: Floating hex particles ---
(function initAboutScene() {
  const canvas = document.getElementById('aboutCanvas');
  if (!canvas) return;
  const section = document.getElementById('about');

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  function resize() {
    const w = section.clientWidth;
    const h = section.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  camera.position.z = 20;
  resize();

  const count = 80;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 60;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xC9A84C, size: 0.08, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(geo, mat));

  // Lines connecting nearby points
  const lineMat = new THREE.LineBasicMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.06 });
  for (let i = 0; i < 30; i++) {
    const lineGeo = new THREE.BufferGeometry();
    const pts = [
      new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20),
      new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20),
    ];
    lineGeo.setFromPoints(pts);
    scene.add(new THREE.Line(lineGeo, lineMat));
  }

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.003;
    scene.rotation.y += 0.001;
    scene.rotation.x = Math.sin(t) * 0.05;
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', resize);
})();

// --- CARD CANVASES: Mini 3D shapes ---
document.querySelectorAll('.card-canvas').forEach((canvas) => {
  const shape = canvas.dataset.shape;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 5;

  const light1 = new THREE.DirectionalLight(0xFFE082, 1.5);
  light1.position.set(5, 5, 5);
  scene.add(light1);
  scene.add(new THREE.AmbientLight(0xC9A84C, 0.5));

  const mat = new THREE.MeshStandardMaterial({ color: 0xC9A84C, metalness: 0.9, roughness: 0.1 });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xFFE082, wireframe: true, transparent: true, opacity: 0.25 });

  let mesh, wireMesh;

  switch (shape) {
    case 'ring':
      mesh = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.4, 16, 60), mat);
      wireMesh = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.4, 16, 60), wireMat);
      break;
    case 'gem':
      mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.4, 0), mat);
      wireMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.4, 0), wireMat);
      break;
    case 'bangle':
      mesh = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.2, 8, 40), mat);
      wireMesh = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.2, 8, 40), wireMat);
      break;
    case 'star':
      mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 0), mat);
      wireMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 0), wireMat);
      break;
    case 'drop':
      mesh = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 6), mat);
      wireMesh = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 6), wireMat);
      break;
    case 'crystal':
      mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 0), mat);
      wireMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 0), wireMat);
      break;
    default:
      mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.3, 0), mat);
      wireMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.3, 0), wireMat);
  }

  scene.add(mesh);
  scene.add(wireMesh);

  // Particles around the shape
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(60 * 3);
  for (let i = 0; i < 60; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 6;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 4;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 3;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xC9A84C, size: 0.04, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })));

  let t = Math.random() * 100;
  let hovered = false;

  canvas.closest('.collection-card').addEventListener('mouseenter', () => { hovered = true; });
  canvas.closest('.collection-card').addEventListener('mouseleave', () => { hovered = false; });

  function animate() {
    requestAnimationFrame(animate);
    t += hovered ? 0.015 : 0.005;
    mesh.rotation.x += 0.008;
    mesh.rotation.y += 0.012;
    mesh.position.y = Math.sin(t) * 0.15;
    wireMesh.rotation.copy(mesh.rotation);
    wireMesh.position.copy(mesh.position);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
});

// --- SHOWCASE CANVAS: Galaxy of gems ---
(function initShowcaseScene() {
  const canvas = document.getElementById('showcaseCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x080503, 1);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
  camera.position.z = 20;

  // Starfield
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(2000 * 3);
  for (let i = 0; i < 2000; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 200;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.5 })));

  // Gold dust
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 60;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xC9A84C, size: 0.12, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })));

  // Orbiting gem clusters
  const gemGroup = new THREE.Group();
  const shapes = [THREE.OctahedronGeometry, THREE.IcosahedronGeometry, THREE.DodecahedronGeometry, THREE.TetrahedronGeometry];
  const gemMat = new THREE.MeshStandardMaterial({ color: 0xC9A84C, metalness: 1, roughness: 0.05 });

  for (let i = 0; i < 18; i++) {
    const ShapeGeo = shapes[i % shapes.length];
    const size = Math.random() * 0.8 + 0.3;
    const gemGeo = new ShapeGeo(size, 0);
    const gem = new THREE.Mesh(gemGeo, gemMat);
    const angle = (i / 18) * Math.PI * 2;
    const radius = 8 + Math.random() * 8;
    gem.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 8,
      Math.sin(angle) * radius
    );
    gem.userData = { angle, radius, speed: Math.random() * 0.003 + 0.001, initY: gem.position.y };
    gemGroup.add(gem);
  }
  scene.add(gemGroup);

  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const goldLight = new THREE.PointLight(0xC9A84C, 4, 40);
  goldLight.position.set(0, 0, 10);
  scene.add(goldLight);
  const blueLight = new THREE.PointLight(0x4499ff, 1, 60);
  blueLight.position.set(-20, 10, -10);
  scene.add(blueLight);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;
    gemGroup.rotation.y += 0.003;

    gemGroup.children.forEach((gem, i) => {
      gem.rotation.x += 0.01;
      gem.rotation.y += 0.015;
      gem.position.y = gem.userData.initY + Math.sin(t + i) * 0.5;
    });

    camera.position.x = Math.sin(t * 0.3) * 3;
    camera.position.y = Math.cos(t * 0.2) * 2;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();

// --- CONTACT CANVAS: Rotating torus knot ---
(function initContactScene() {
  const canvas = document.getElementById('contactCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 12;

  const geo = new THREE.TorusKnotGeometry(3, 0.8, 120, 16);
  const mat = new THREE.MeshStandardMaterial({ color: 0xC9A84C, metalness: 0.95, roughness: 0.05, wireframe: false });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const wireMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xFFE082, wireframe: true, transparent: true, opacity: 0.15 }));
  scene.add(wireMesh);

  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const pLight = new THREE.PointLight(0xFFE082, 3, 30);
  pLight.position.set(8, 8, 8);
  scene.add(pLight);

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.004;
    mesh.rotation.y += 0.006;
    wireMesh.rotation.copy(mesh.rotation);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();

// --- FOOTER CANVAS: Simple floating particles ---
(function initFooterScene() {
  const canvas = document.getElementById('footerCanvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(1);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 15;

  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(150 * 3);
  for (let i = 0; i < 150; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 50;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xC9A84C, size: 0.1, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })));

  function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.0005;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();

// ===== TESTIMONIAL SLIDER =====
let currentSlide = 0;
const totalSlides = 3;
const track = document.getElementById('testimonialTrack');
const dots = document.querySelectorAll('#sliderDots .dot');

function goToSlide(n) {
  currentSlide = (n + totalSlides) % totalSlides;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}

document.getElementById('nextBtn').addEventListener('click', () => goToSlide(currentSlide + 1));
document.getElementById('prevBtn').addEventListener('click', () => goToSlide(currentSlide - 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

// Auto-slide
setInterval(() => goToSlide(currentSlide + 1), 5000);

// ===== GSAP SCROLL ANIMATIONS =====
gsap.to('.showcase-content', {
  scrollTrigger: {
    trigger: '#showcase',
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',
  },
  opacity: 1,
  y: 0,
  duration: 1,
  ease: 'power3.out',
});

// Parallax on hero
gsap.to('#heroCanvas', {
  scrollTrigger: {
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
  },
  y: 150,
  ease: 'none',
});

// Process step animation
gsap.utils.toArray('.process-step').forEach((step, i) => {
  gsap.from(step, {
    scrollTrigger: {
      trigger: step,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 40,
    duration: 0.8,
    delay: i * 0.15,
    ease: 'power3.out',
  });
});

// ===== CONTACT FORM =====
const contactFormEl = document.getElementById('contactForm');
if (contactFormEl) {
  contactFormEl.addEventListener('submit', function (e) {
    e.preventDefault();
  });
}

// ===== SMOOTH ANCHOR SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
  });
});

// ===== FORM FLOATING LABELS =====
document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
  input.addEventListener('focus', () => {
    input.parentElement.classList.add('focused');
  });
  input.addEventListener('blur', () => {
    if (!input.value) input.parentElement.classList.remove('focused');
  });
});

// ===== RESIZE HANDLER =====
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});

console.log('%c✦ AABHUSHAN SALES ✦', 'color:#C9A84C;font-size:18px;font-family:serif;letter-spacing:4px;');
console.log('%cPremium Micro Imitation Jewellery', 'color:#888;font-size:12px;');
