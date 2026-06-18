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
   CATAPULTAZO PARALLAX (FIX)
========================= */

const section = document.querySelector('#catapultazo');
const bg = document.querySelector('.catapultazo-bg');
const left = document.querySelector('.parallax-left');
const right = document.querySelector('.parallax-right');

/* suavizado */
let current = 0;
let target = 0;

function updateParallax() {

    if (!section) return;

    const rect = section.getBoundingClientRect();

    // distancia relativa al viewport
    target = rect.top * -0.3;

    // suavizado (evita saltos)
    current += (target - current) * 0.08;

    /* =========================
       FONDO LILA
    ========================= */
    if (bg) {
        bg.style.transform = `translateY(${current}px) scale(1.1)`;
    }

    /* =========================
       TEXTO IZQUIERDA
    ========================= */
    if (left) {
        left.style.transform = `translateY(${current * 0.4}px)`;
    }

    /* =========================
       TITULO DERECHA
    ========================= */
    if (right) {
        right.style.transform = `translateY(${current * -0.4}px)`;
    }

    requestAnimationFrame(updateParallax);
}

/* inicia loop */
updateParallax();

/* =====================================
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

document.addEventListener("DOMContentLoaded", () => {

    const container = document.getElementById("pix-container");
    const raw = document.getElementById("pix-data").textContent;

    const decoded = safeBase64Decode(raw);

    if (!decoded) {
        container.innerHTML = "<p>Error: Base64 inválido</p>";
        return;
    }

    try {

        const data = JSON.parse(decoded);

        container.innerHTML = "";

        const card = document.createElement("div");
        card.className = "pix-card";

        const title = document.createElement("h3");
        title.textContent = data.title;
        card.appendChild(title);

        const desc = document.createElement("p");
        desc.textContent = data.description;
        card.appendChild(desc);

        container.appendChild(card);

    } catch (err) {
        console.error("JSON ERROR:", err);
        container.innerHTML = "<p>Error: JSON inválido</p>";
    }

});