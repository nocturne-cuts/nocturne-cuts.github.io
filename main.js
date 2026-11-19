import * as THREE from 'three';

// ===== Typewriter title =====
const title = document.getElementById('title');
const text = title.dataset.text;
text.split('').forEach((c, i) => {
  const s = document.createElement('span');
  s.className = 'ch';
  s.textContent = c === ' ' ? '\u00A0' : c;
  s.style.animationDelay = (0.4 + i * 0.045) + 's';
  title.appendChild(s);
});

// ===== Custom cursor =====
const cursor = document.getElementById('cursor');
window.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, .card, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('big'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
});

// ===== Scroll reveal =====
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ===== Card 3D tilt =====
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  card.addEventListener('click', () => {
    document.getElementById('player').src = card.dataset.video + '?autoplay=1';
    document.getElementById('modal').classList.add('open');
  });
});
const closeModal = () => {
  document.getElementById('modal').classList.remove('open');
  document.getElementById('player').src = '';
};
document.getElementById('close').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e => {
  if (e.target.id === 'modal') closeModal();
});

// ===== 3D background: rotating film strip =====
const canvas = document.getElementById('bg3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07070c, 0.035);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.set(0, 0, 14);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const pl = new THREE.PointLight(0xa78bfa, 60, 60);
pl.position.set(6, 4, 8);
scene.add(pl);
const pl2 = new THREE.PointLight(0xe8c47c, 40, 60);
pl2.position.set(-8, -3, 6);
scene.add(pl2);

const strip = new THREE.Group();
const frameGeo = new THREE.BoxGeometry(2.4, 1.6, 0.08);
const baseMat = new THREE.MeshStandardMaterial({ color: 0x12121c, metalness: 0.6, roughness: 0.35 });
const glowMat = new THREE.MeshStandardMaterial({ color: 0x1b1630, emissive: 0x5b3fd0, emissiveIntensity: 0.55, metalness: 0.3, roughness: 0.5 });
const holeGeo = new THREE.BoxGeometry(0.16, 0.16, 0.1);
const holeMat = new THREE.MeshStandardMaterial({ color: 0xe8c47c, emissive: 0xe8c47c, emissiveIntensity: 0.4 });

const COUNT = 18, RADIUS = 7.5;
for (let i = 0; i < COUNT; i++) {
  const a = (i / COUNT) * Math.PI * 2;
  const f = new THREE.Group();
  f.add(new THREE.Mesh(frameGeo, baseMat));
  const inner = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 0.1), i % 3 === 0 ? glowMat : baseMat);
  f.add(inner);
  for (let k = 0; k < 6; k++) {
    const x = -1.0 + k * 0.4;
    [0.72, -0.72].forEach(y => {
      const h = new THREE.Mesh(holeGeo, holeMat);
      h.position.set(x, y, 0);
      f.add(h);
    });
  }
  f.position.set(Math.cos(a) * RADIUS, Math.sin(a) * RADIUS * 0.45, Math.sin(a) * RADIUS);
  f.rotation.y = -a + Math.PI / 2;
  strip.add(f);
}
strip.rotation.x = 0.35;
strip.rotation.z = -0.15;
scene.add(strip);

// floating particles
const pGeo = new THREE.BufferGeometry();
const pos = new Float32Array(600 * 3);
for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - 0.5) * 50;
pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xe8c47c, size: 0.06, transparent: true, opacity: 0.6 }));
scene.add(particles);

let mx = 0, my = 0, scrollY = 0;
window.addEventListener('mousemove', e => {
  mx = e.clientX / innerWidth - 0.5;
  my = e.clientY / innerHeight - 0.5;
});
window.addEventListener('scroll', () => { scrollY = window.scrollY; });

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  strip.rotation.y = t * 0.12 + scrollY * 0.0012;
  camera.position.x += (mx * 3 - camera.position.x) * 0.04;
  camera.position.y += (-my * 2 - camera.position.y) * 0.04;
  camera.lookAt(0, 0, 0);
  particles.rotation.y = t * 0.02;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
