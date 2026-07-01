import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js';

/* =====================================
   SCENE
===================================== */

const scene = new THREE.Scene();

/* =====================================
   CAMERA
===================================== */

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 0, 8);

/* =====================================
   RENDERER
===================================== */

const canvas = document.querySelector('#bg');

if (!canvas) {
    throw new Error('No existe el canvas #bg');
}

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

/* =====================================
   GEOMETRY
===================================== */

const geometry = new THREE.DodecahedronGeometry(2, 0);

/* =====================================
   MATERIAL
===================================== */

const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.35,
    transparent: true,
    roughness: 0.08,
    metalness: 0,
    ior: 2.2,
    thickness: 5,
    clearcoat: 1,
    clearcoatRoughness: 0,
    flatShading: true,
    iridescence: 1,
    iridescenceIOR: 1.4,
    reflectivity: 1,
    envMapIntensity: 1.5,
    iridescenceThicknessRange: [100, 1500]
});

/* =====================================
   OBJECTS
===================================== */

const dodecahedron = new THREE.Mesh(geometry, material);
dodecahedron.position.set(2.2, 0, 0);
scene.add(dodecahedron);

/* Wireframe */

const wireframe = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
        color: 0xE61F84,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    })
);

scene.add(wireframe);

/* Edges */

const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({
        color: 0xC3D104,
        transparent: true,
        opacity: 0.7
    })
);

scene.add(edges);

/* =====================================
   LIGHTS (OPTIMIZADOS)
===================================== */

const ambient = new THREE.AmbientLight(0xB8B1D8, 0.4);
scene.add(ambient);

const pinkLight = new THREE.PointLight(0xE61F84, 8);
pinkLight.position.set(5, 5, 5);
scene.add(pinkLight);

const greenLight = new THREE.PointLight(0xC3D104, 8);
greenLight.position.set(-5, -5, 5);
scene.add(greenLight);

const whiteLight = new THREE.PointLight(0xffffff, 15);
whiteLight.position.set(0, 0, 10);
scene.add(whiteLight);

const rimLight = new THREE.PointLight(0xE61F84, 5);
rimLight.position.set(-5, 0, -5);
scene.add(rimLight);

/* =====================================
   MOUSE
===================================== */

let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

/* =====================================
   ANIMATION
===================================== */

function animate(time = 0) {

    requestAnimationFrame(animate);

    const t = time * 0.001;

    /* ROTATION */
    dodecahedron.rotation.x += 0.003;
    dodecahedron.rotation.y += 0.004;
    dodecahedron.rotation.z = Math.sin(t * 0.5) * 0.15;

    /* FLOAT */
    dodecahedron.position.y = Math.sin(t) * 0.25;

    /* CURSOR FOLLOW */
    dodecahedron.position.x += (
        2.2 +
        mouseX * 0.5 -
        dodecahedron.position.x
    ) * 0.03;

    /* SCALE PULSE */
    const scale = 1 + Math.sin(t * 0.7) * 0.04;
    dodecahedron.scale.set(scale, scale, scale);

    /* SYNC WIREFRAME */
    wireframe.position.copy(dodecahedron.position);
    wireframe.rotation.copy(dodecahedron.rotation);
    wireframe.scale.copy(dodecahedron.scale);

    /* SYNC EDGES */
    edges.position.copy(dodecahedron.position);
    edges.rotation.copy(dodecahedron.rotation);
    edges.scale.copy(dodecahedron.scale);

    /* LIGHT FOLLOW */
    pinkLight.position.x += (mouseX * 8 - pinkLight.position.x) * 0.05;
    pinkLight.position.y += (mouseY * 6 - pinkLight.position.y) * 0.05;

    greenLight.position.x += (-mouseX * 8 - greenLight.position.x) * 0.05;
    greenLight.position.y += (-mouseY * 6 - greenLight.position.y) * 0.05;

    renderer.render(scene, camera);
}

requestAnimationFrame(animate);

/* =========================
   RESIZE
===================================== */

window.addEventListener('resize', () => {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

});
/* =========================
   PARALLAX MULTI-SECCIÓN (UPDATED)
========================= */

const parallaxSections = document.querySelectorAll('.parallax-section');

if (parallaxSections.length) {

    const stateMap = new Map();

    parallaxSections.forEach(section => {
        stateMap.set(section, {
            current: 0,
            target: 0
        });
    });

    function updateMultiParallax() {

        parallaxSections.forEach(section => {

            const state = stateMap.get(section);
            const rect = section.getBoundingClientRect();

            // efecto base (puedes ajustar intensidad)
            state.target = rect.top * -0.3;

            // suavizado
            state.current += (state.target - state.current) * 0.08;

            /* =========================
               ELEMENTOS DEL PARALLAX
            ========================= */

            const bg =
                section.querySelector('.catapultazo-bg') ||
                section.querySelector('.parallax-bg') ||
                section.querySelector('.fondo');

            const left = section.querySelector('.parallax-left');
            const right = section.querySelector('.parallax-right');

            /* BACKGROUND */
            if (bg) {
                bg.style.transform =
                    `translateY(${state.current}px) scale(1.1)`;
            }

            /* LEFT TEXT */
            if (left) {
                left.style.transform =
                    `translateY(${state.current * 0.4}px)`;
            }

            /* RIGHT TEXT */
            if (right) {
                right.style.transform =
                    `translateY(${state.current * -0.4}px)`;
            }
        });

        requestAnimationFrame(updateMultiParallax);
    }

    updateMultiParallax();
}


/* =========================
   REVEAL CARDS (SCROLL)
========================= */

const cards = document.querySelectorAll('.concepto-card');

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }

    });

}, {
    threshold: 0.2
});

cards.forEach(card => observer.observe(card));


/* =========================
   GLOW FOLLOW MOUSE
========================= */

document.querySelectorAll('.concepto-card').forEach(card => {

    card.addEventListener('mousemove', (e) => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);

        card.style.setProperty('--glow-opacity', '1');
    });

    card.addEventListener('mouseenter', () => {
        card.style.setProperty('--glow-opacity', '1');
    });

    card.addEventListener('mouseleave', () => {
        card.style.setProperty('--glow-opacity', '0');
    });

});

const conceptos =
document.querySelectorAll('.concepto-card');

conceptos.forEach(card => {

    card.addEventListener('click', () => {

        conceptos.forEach(c => {

            if(c !== card){
                c.classList.remove('activa');
            }

        });

        card.classList.toggle('activa');

    });

});

/* =========================
   GALERÍA (SLIDER)
========================= */

const track = document.querySelector('.galeria-track');
const images = document.querySelectorAll('.galeria-img');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const dotsContainer = document.querySelector('.galeria-dots');

let index = 0;
let dots = [];

function updateSlide(){
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach((dot, i) => {
        dot.classList.toggle('activo', i === index);
    });
}

function goToSlide(n){
    index = (n + images.length) % images.length;
    updateSlide();
}

if (nextBtn && prevBtn && track && images.length) {

    // Crear indicadores (dots) dinámicamente, uno por imagen
    if (dotsContainer) {
        images.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('galeria-dot');
            dot.setAttribute('aria-label', `Ir a la imagen ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
        dots = Array.from(dotsContainer.querySelectorAll('.galeria-dot'));
    }

    nextBtn.addEventListener('click', () => goToSlide(index + 1));
    prevBtn.addEventListener('click', () => goToSlide(index - 1));

    // Soporte para deslizar (swipe) en móvil
    let touchStartX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 40) {
            diff > 0 ? goToSlide(index + 1) : goToSlide(index - 1);
        }
    }, { passive: true });

    updateSlide();
}

/* =========================
   STEPPER — CÓMO FUNCIONA
========================= */

const stepperBtns   = document.querySelectorAll('.stepper-btn');
const stepperPanels = document.querySelectorAll('.stepper-panel');

function goToStep(n) {
    stepperBtns.forEach((btn, i) => {
        btn.classList.remove('active', 'done');
        if (i < n)  btn.classList.add('done');
        if (i === n) btn.classList.add('active');
    });
    stepperPanels.forEach((panel, i) => {
        panel.classList.toggle('active', i === n);
    });
}

stepperBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        goToStep(Number(btn.dataset.step));
    });
});

document.querySelectorAll('.stepper-next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const activePanel = document.querySelector('.stepper-panel.active');
        const current = Number(activePanel?.dataset.panel ?? 0);
        const next = (current + 1) % stepperPanels.length;
        goToStep(next);
    });
});
/* =========================
   TRANSICIÓN HACIA EXPERIENCIA.HTML
========================= */

const pageTransition = document.querySelector('#pageTransition');
const transitionLinks = document.querySelectorAll('a[href="experiencia.html"]');

if (pageTransition && transitionLinks.length) {

    transitionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const destino = link.getAttribute('href');

            pageTransition.classList.add('active');

            setTimeout(() => {
                window.location.href = destino;
            }, 550);
        });
    });
}

/* =========================
   MICROINTERACCIONES — CURSOR PERSONALIZADO
========================= */

const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing && matchMedia('(hover: hover) and (pointer: fine)').matches) {

    let ringX = 0, ringY = 0;
    let mouseXc = 0, mouseYc = 0;

    window.addEventListener('mousemove', (e) => {
        mouseXc = e.clientX;
        mouseYc = e.clientY;

        cursorDot.style.left = `${mouseXc}px`;
        cursorDot.style.top  = `${mouseYc}px`;
    });

    function animateRing(){
        ringX += (mouseXc - ringX) * 0.18;
        ringY += (mouseYc - ringY) * 0.18;

        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top  = `${ringY}px`;

        requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverables = document.querySelectorAll(
        'a, button, .concepto-card, .galeria-img, input, textarea, [data-cursor-hover]'
    );

    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
    });

    document.addEventListener('mousedown', () => {
        cursorDot.style.opacity = '0.4';
    });
    document.addEventListener('mouseup', () => {
        cursorDot.style.opacity = '1';
    });
}

/* =========================
   MICROINTERACCIONES — BARRA DE PROGRESO
========================= */

const scrollProgress = document.querySelector('.scroll-progress');

if (scrollProgress) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = `${pct}%`;
    });
}

/* =========================
   MICROINTERACCIONES — BOTONES MAGNÉTICOS
========================= */

const magneticButtons = document.querySelectorAll('.primary, .secondary, .btn-experimental, .stepper-next-btn');

magneticButtons.forEach(btn => {

    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
    });

    /* RIPPLE AL HACER CLICK */
    btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);

        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top  = `${e.clientY - rect.top - size / 2}px`;

        btn.appendChild(ripple);

        setTimeout(() => ripple.remove(), 650);
    });
});

/* =========================
   MICROINTERACCIONES — TILT EN TARJETAS
========================= */

document.querySelectorAll('.concepto-card').forEach(card => {

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateX = ((y / rect.height) - 0.5) * -6;
        const rotateY = ((x / rect.width) - 0.5) * 6;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

/* =========================
   MICROINTERACCIONES — REVEAL DE TÍTULOS EN SCROLL
========================= */

const revealTargets = document.querySelectorAll(
    '.titulo-seccion, .bajada-seccion, .pix-titulo, .pix-texto, .titulo-experimental, .texto-experimental'
);

if (revealTargets.length) {

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.25 });

    revealTargets.forEach(el => revealObserver.observe(el));
}

/* =========================
   MICROINTERACCIONES — NAV LINK ACTIVO SEGÚN SCROLL
========================= */

const navLinks = document.querySelectorAll('header nav a[href^="#"]');
const navSections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

if (navLinks.length && navSections.length) {

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = `#${entry.target.id}`;
            const link = Array.from(navLinks).find(a => a.getAttribute('href') === id);
            if (!link) return;

            if (entry.isIntersecting) {
                navLinks.forEach(a => a.classList.remove('nav-active'));
                link.classList.add('nav-active');
            }
        });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    navSections.forEach(section => navObserver.observe(section));
}

/* =========================
   MICROINTERACCIONES — BOTÓN VOLVER ARRIBA
========================= */

const backToTop = document.querySelector('.back-to-top');

if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 700);
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* =========================
   MICROINTERACCIONES — PULSO EN STEPPER BTN AL CLICK
========================= */

document.querySelectorAll('.stepper-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.remove('pulse');
        void btn.offsetWidth;
        btn.classList.add('pulse');
    });
});

/* =========================
   MICROINTERACCIONES — PARALLAX SUTIL DEL HERO
========================= */

const heroContent = document.querySelector('.hero-content');

if (heroContent) {
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 14;
        const y = (e.clientY / window.innerHeight - 0.5) * 10;
        heroContent.style.transform = `translate(${x}px, ${y}px)`;
    });
}