import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

//////////////////////////////////////////////////
// AUDIO 🌊 RELAJANTE (MAR + DRONE + RUIDO)
//////////////////////////////////////////////////

let audioCtx = null;
let masterGain;
let droneOsc;
let droneGain;

let noiseNode;
let noiseGain;
let noiseFilter;

function initAudio(){

    if(audioCtx) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;

    //////////////////////////////////////////////////
    // DRONE SUAVE (BASE)
    //////////////////////////////////////////////////

    droneOsc = audioCtx.createOscillator();
    droneOsc.type = "sine";
    droneOsc.frequency.value = 55;

    droneGain = audioCtx.createGain();
    droneGain.gain.value = 0.08;

    const droneFilter = audioCtx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.value = 500;

    droneOsc.connect(droneGain);
    droneGain.connect(droneFilter);
    droneFilter.connect(masterGain);

    droneOsc.start();

    //////////////////////////////////////////////////
    // RUIDO MARINO
    //////////////////////////////////////////////////

    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    for(let i=0;i<bufferSize;i++){
        output[i] = (Math.random()*2-1) * 0.1;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0.02;

    noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 800;

    noiseNode.connect(noiseGain);
    noiseGain.connect(noiseFilter);
    noiseFilter.connect(masterGain);

    noiseNode.start();

    masterGain.connect(audioCtx.destination);
}

window.addEventListener("click", async () => {

    if(!audioCtx){
        initAudio();
    }

    if(audioCtx.state !== "running"){
        await audioCtx.resume();
    }
});

//////////////////////////////////////////////////
// SCENE
//////////////////////////////////////////////////

const scene = new THREE.Scene();

//////////////////////////////////////////////////
// CAMERA
//////////////////////////////////////////////////

const frustum = 35;
let aspect = window.innerWidth / window.innerHeight;

const camera = new THREE.OrthographicCamera(
    (-frustum * aspect) / 2,
    (frustum * aspect) / 2,
    frustum / 2,
    -frustum / 2,
    0.1,
    1000
);

camera.position.set(30, 45, 30);
camera.lookAt(0, 0, 0);

//////////////////////////////////////////////////
// RENDERER
//////////////////////////////////////////////////

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

//////////////////////////////////////////////////
// LIGHTS
//////////////////////////////////////////////////

scene.add(new THREE.AmbientLight(0xffffff, 2.5));

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(50, 100, 50);
scene.add(sun);

//////////////////////////////////////////////////
// WORLD
//////////////////////////////////////////////////

const world = new THREE.Group();
scene.add(world);

//////////////////////////////////////////////////
// GRID
//////////////////////////////////////////////////

const palette = [
    new THREE.Color("#B8B1D8"),
    new THREE.Color("#E61F84"),
    new THREE.Color("#C3D104")
];

const SIZE = 34;
const geometry = new THREE.BoxGeometry(1.02, 1, 1.02);

const cubes = [];

for(let x=0; x<SIZE; x++){
for(let z=0; z<SIZE; z++){

    const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
            color: palette[Math.floor(Math.random()*palette.length)]
        })
    );

    mesh.position.set(x - SIZE/2, 0.5, z - SIZE/2);
    world.add(mesh);

    cubes.push({
        mesh,
        x,
        z,
        originX: x - SIZE/2,
        originZ: z - SIZE/2,
        height: 1,
        vx:0, vy:0, vz:0,
        shock:0,
        detached:false
    });

}}

//////////////////////////////////////////////////
// MOUSE
//////////////////////////////////////////////////

const mouse = { x:999, y:999 };

window.addEventListener("mousemove", e=>{
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
});

const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0,1,0),0);
const point = new THREE.Vector3();

//////////////////////////////////////////////////
// PROJECTILE
//////////////////////////////////////////////////

let projectile = null;
let projectileVelocity = 0;
let impactX = 0;
let impactZ = 0;

function launchDodecahedron(){

    if(projectile) return;

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, point);

    impactX = point.x;
    impactZ = point.z;

    projectile = new THREE.Mesh(
        new THREE.DodecahedronGeometry(5),
        new THREE.MeshStandardMaterial({
            color:"#E61F84",
            emissive:"#E61F84",
            emissiveIntensity:1
        })
    );

    projectile.add(new THREE.PointLight("#E61F84", 15, 40));
    projectile.position.set(impactX, 90, impactZ);

    projectileVelocity = 0;
    scene.add(projectile);
}

window.addEventListener("click", launchDodecahedron);

//////////////////////////////////////////////////
// RESET (ARREGLADO 100%)
//////////////////////////////////////////////////

function resetWorld(){

    console.log("RESET OK");

    cubes.forEach(c=>{

        c.mesh.position.set(c.originX, 0.5, c.originZ);
        c.mesh.scale.set(1,1,1);
        c.mesh.rotation.set(0,0,0);

        c.vx = 0;
        c.vy = 0;
        c.vz = 0;

        c.height = 1;
        c.shock = 0;
        c.detached = false;
    });

    if(projectile){
        scene.remove(projectile);
        projectile = null;
    }
}

//////////////////////////////////////////////////
// AUDIO UPDATE 🌊
//////////////////////////////////////////////////

function updateAudio(){

    if(!audioCtx) return;

    let energy = 0;

    for(const c of cubes){
        energy += Math.max(c.height - 1, 0);
    }

    energy /= cubes.length;

    energy = Math.pow(energy * 3, 1.1);

    const freq = 40 + energy * 25;
    const amp = Math.min(energy * 0.2, 0.15);

    droneOsc.frequency.setTargetAtTime(
        freq,
        audioCtx.currentTime,
        0.3
    );

    droneGain.gain.setTargetAtTime(
        amp,
        audioCtx.currentTime,
        0.4
    );

    if(noiseGain){
        noiseGain.gain.setTargetAtTime(
            0.02 + energy * 0.06,
            audioCtx.currentTime,
            0.5
        );
    }
}

//////////////////////////////////////////////////
// HELP
//////////////////////////////////////////////////

function lerpColor(a,b,t){
    return a.clone().lerp(b,t);
}

//////////////////////////////////////////////////
// ANIMATE
//////////////////////////////////////////////////

function animate(time=0){

    requestAnimationFrame(animate);

    const t = time * 0.001;

    const radius = 34;

    camera.position.x = Math.cos(t*0.12)*radius;
    camera.position.z = Math.sin(t*0.12)*radius;
    camera.position.y = 45;
    camera.lookAt(0,0,0);

    raycaster.setFromCamera(mouse,camera);
    raycaster.ray.intersectPlane(plane,point);

    if(projectile){

        projectileVelocity += 0.02;
        projectile.position.y -= projectileVelocity;

        projectile.rotation.x += 0.15;
        projectile.rotation.y += 0.12;
        projectile.rotation.z += 0.1;

        if(projectile.position.y <= 4){

            cubes.forEach(c=>{

                const dx = c.mesh.position.x - impactX;
                const dz = c.mesh.position.z - impactZ;

                const dist = Math.sqrt(dx*dx + dz*dz);

                if(dist < 14){

                    const force = (14 - dist) * 0.45;

                    c.vx = dx * force * 0.25;
                    c.vz = dz * force * 0.25;
                    c.vy = 2 + Math.random() * 4;
                    c.shock = force * 6;

                    if(Math.random() > 0.7) c.detached = true;
                }
            });

            scene.remove(projectile);
            projectile = null;
        }
    }

    cubes.forEach(c=>{

        const m = c.mesh;

        if(c.detached){

            c.vy -= 0.08;

            m.position.x += c.vx;
            m.position.y += c.vy;
            m.position.z += c.vz;

            m.rotation.x += 0.05;
            m.rotation.y += 0.05;
            return;
        }

        const dx = m.position.x - point.x;
        const dz = m.position.z - point.z;

        const dist = Math.sqrt(dx*dx + dz*dz);

        let target = Math.max(1, 12 - dist);
        target += Math.sin(t*2 + c.x*0.3 + c.z*0.3)*2;

        c.height += (target - c.height)*0.08;
        c.shock *= 0.92;

        const h = c.height + c.shock;

        m.scale.y = h;
        m.position.y = h/2;

        const n = Math.min(c.height/12,1);

        const col =
            n < 0.5
            ? lerpColor(palette[0],palette[1],n*2)
            : lerpColor(palette[1],palette[2],(n-0.5)*2);

        m.material.color.copy(col);
    });

    updateAudio();

    world.rotation.y += 0.0006;
    renderer.render(scene,camera);
}

animate();

//////////////////////////////////////////////////
// RESET BUTTON SAFE
//////////////////////////////////////////////////

window.addEventListener("load", () => {

    const btn = document.getElementById("resetBtn");

    if(btn){
        btn.addEventListener("click", resetWorld);
    } else {
        console.warn("No existe resetBtn en HTML");
    }
});

//////////////////////////////////////////////////
// RESIZE
//////////////////////////////////////////////////

window.addEventListener("resize",()=>{
    aspect = innerWidth/innerHeight;

    camera.left = (-frustum*aspect)/2;
    camera.right = (frustum*aspect)/2;
    camera.top = frustum/2;
    camera.bottom = -frustum/2;

    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
});