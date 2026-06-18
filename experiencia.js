import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

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

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    window.devicePixelRatio
);

document.body.appendChild(
    renderer.domElement
);

//////////////////////////////////////////////////
// LIGHTS
//////////////////////////////////////////////////

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        2.5
    )
);

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

sun.position.set(
    50,
    100,
    50
);

scene.add(sun);

//////////////////////////////////////////////////
// COLORS
//////////////////////////////////////////////////

const palette = [

    new THREE.Color("#B8B1D8"),
    new THREE.Color("#E61F84"),
    new THREE.Color("#C3D104")

];

//////////////////////////////////////////////////
// WORLD
//////////////////////////////////////////////////

const world = new THREE.Group();
scene.add(world);

//////////////////////////////////////////////////
// GRID
//////////////////////////////////////////////////

const SIZE = 34;

const geometry =
    new THREE.BoxGeometry(
        1.02,
        1,
        1.02
    );

const cubes = [];

for(let x=0;x<SIZE;x++){

    for(let z=0;z<SIZE;z++){

        const cube =
            new THREE.Mesh(

                geometry,

                new THREE.MeshStandardMaterial({

                    color:
                        palette[
                            Math.floor(
                                Math.random() *
                                palette.length
                            )
                        ]

                })

            );

        cube.position.set(
            x - SIZE/2,
            0.5,
            z - SIZE/2
        );

        world.add(cube);

        cubes.push({

            mesh:cube,

            x,
            z,

            originX:
                x - SIZE/2,

            originZ:
                z - SIZE/2,

            height:1,

vx:0,
vy:0,
vz:0,

shock:0,

detached:false 

        });

    }

}

//////////////////////////////////////////////////
// CURSOR
//////////////////////////////////////////////////

const mouse = {
    x:999,
    y:999
};

window.addEventListener(
    "mousemove",
    e=>{

        mouse.x =
            (e.clientX /
            window.innerWidth) * 2 - 1;

        mouse.y =
            -(e.clientY /
            window.innerHeight) * 2 + 1;

        const cursor =
            document.querySelector(
                ".cursor"
            );

        if(cursor){

            cursor.style.left =
                e.clientX + "px";

            cursor.style.top =
                e.clientY + "px";

        }

    }
);

//////////////////////////////////////////////////
// RAYCAST
//////////////////////////////////////////////////

const raycaster =
    new THREE.Raycaster();

const plane =
    new THREE.Plane(
        new THREE.Vector3(0,1,0),
        0
    );

const point =
    new THREE.Vector3();

//////////////////////////////////////////////////
// DODECAHEDRON
//////////////////////////////////////////////////

let projectile = null;
let projectileVelocity = 0;

let impactX = 0;
let impactZ = 0;

function launchDodecahedron(){

    if(projectile) return;

    raycaster.setFromCamera(
        mouse,
        camera
    );

    raycaster.ray.intersectPlane(
        plane,
        point
    );

    impactX = point.x;
    impactZ = point.z;

    projectile =
        new THREE.Mesh(

            new THREE.DodecahedronGeometry(
                5
            ),

            new THREE.MeshStandardMaterial({

                color:"#E61F84",

                emissive:"#E61F84",

                emissiveIntensity:1

            })

        );

    const glow =
        new THREE.PointLight(
            "#E61F84",
            15,
            40
        );

    projectile.add(glow);

    projectile.position.set(
        impactX,
        90,
        impactZ
    );

    projectileVelocity = 0;

    scene.add(projectile);

}

window.addEventListener(
    "click",
    launchDodecahedron
);

//////////////////////////////////////////////////
// RESET
//////////////////////////////////////////////////

function resetWorld(){

    cubes.forEach(cube=>{

        if(!cube.mesh.parent){

            world.add(cube.mesh);

        }

        cube.detached = false;

        cube.vx = 0;
        cube.vy = 0;
        cube.vz = 0;

        cube.height = 1;

        cube.mesh.rotation.set(
            0,
            0,
            0
        );

        cube.mesh.scale.set(
            1,
            1,
            1
        );

        cube.mesh.position.set(

            cube.originX,

            0.5,

            cube.originZ

        );

    });

    if(projectile){

        camera.lookAt(
    projectile.position.x,
    0,
    projectile.position.z
);

        scene.remove(
            projectile
        );

        projectile = null;

    }

}

document
    .getElementById(
        "resetBtn"
    )
    .addEventListener(
        "click",
        resetWorld
    );

//////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////

function lerpColor(a,b,t){

    return a.clone().lerp(
        b,
        t
    );

}

//////////////////////////////////////////////////
// ANIMATE
//////////////////////////////////////////////////

function animate(time=0){

    requestAnimationFrame(
        animate
    );

    const t =
        time * 0.001;

    //////////////////////////////////////////////////
    // CAMERA ORBIT
    //////////////////////////////////////////////////

    const radius = 34;

    camera.position.x =
        Math.cos(
            t * 0.12
        ) * radius;

    camera.position.z =
        Math.sin(
            t * 0.12
        ) * radius;

    camera.position.y = 45;

    camera.lookAt(0,0,0);

    //////////////////////////////////////////////////
    // CURSOR POINT
    //////////////////////////////////////////////////

    raycaster.setFromCamera(
        mouse,
        camera
    );

    raycaster.ray.intersectPlane(
        plane,
        point
    );

    //////////////////////////////////////////////////
    // PROJECTILE
    //////////////////////////////////////////////////

    if(projectile){

        projectileVelocity += 0.02;

        projectile.position.y -=
            projectileVelocity;

        projectile.rotation.x +=
    0.15;

projectile.rotation.y +=
    0.12;

projectile.rotation.z +=
    0.10;

        if(
            projectile.position.y <= 4
        ){

            cubes.forEach(cube=>{

                const dx =
                    cube.mesh.position.x -
                    impactX;

                const dz =
                    cube.mesh.position.z -
                    impactZ;

                const dist =
                    Math.sqrt(
                        dx*dx +
                        dz*dz
                    );

                if(dist < 14){

    const force =
        (14 - dist) * 0.45;

    cube.vx =
        dx * force * 0.25;

    cube.vz =
        dz * force * 0.25;

    cube.vy =
        2 +
        Math.random() * 4;

    cube.shock = force * 6;

    if(Math.random() > 0.7){

        cube.detached = true;

    }

}

            });

            scene.remove(
                projectile
            );

            projectile = null;

        }

    }

    //////////////////////////////////////////////////
    // CUBES
    //////////////////////////////////////////////////

    cubes.forEach(cube=>{

        const mesh =
            cube.mesh;

        if(cube.detached){

            cube.vy -= 0.08;

            mesh.position.x +=
                cube.vx;

            mesh.position.y +=
                cube.vy;

            mesh.position.z +=
                cube.vz;

            mesh.rotation.x +=
                0.05;

            mesh.rotation.y +=
                0.05;

            return;

        }

        const dx =
            mesh.position.x -
            point.x;

        const dz =
            mesh.position.z -
            point.z;

        const dist =
            Math.sqrt(
                dx*dx +
                dz*dz
            );

        let target =
            Math.max(
                1,
                12 - dist
            );

        target +=
            Math.sin(
                t*2 +
                cube.x*0.3 +
                cube.z*0.3
            ) * 2;

        cube.height +=
            (
                target -
                cube.height
            ) * 0.08;

            cube.shock *= 0.92;

const fractureHeight =
    cube.height +
    cube.shock;

mesh.scale.y =
    fractureHeight;

mesh.position.y =
    fractureHeight / 2;

        const normalized =
            Math.min(
                cube.height / 12,
                1
            );

        let color;

        if(normalized < 0.5){

            color =
                lerpColor(
                    palette[0],
                    palette[1],
                    normalized * 2
                );

        }else{

            color =
                lerpColor(
                    palette[1],
                    palette[2],
                    (normalized - 0.5) * 2
                );

        }

        mesh.material.color.copy(
            color
        );

    });

    //////////////////////////////////////////////////
    // WORLD ROTATION
    //////////////////////////////////////////////////

    world.rotation.y +=
        0.0006;

    renderer.render(
        scene,
        camera
    );

}

animate();

//////////////////////////////////////////////////
// RESIZE
//////////////////////////////////////////////////

window.addEventListener(
    "resize",
    ()=>{

        aspect =
            window.innerWidth /
            window.innerHeight;

        camera.left =
            (-frustum * aspect) / 2;

        camera.right =
            (frustum * aspect) / 2;

        camera.top =
            frustum / 2;

        camera.bottom =
            -frustum / 2;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);