import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

let scene, camera, renderer, figurine, head, leftArm, rightArm, controls;
let mouse = new THREE.Vector2();
let targetRotation = new THREE.Euler();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.5, 5);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.target.set(0, 1.5, 0);

    // Lighting setup for realistic silver rendering
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x4a9eff, 0.8);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffa500, 0.6);
    rimLight.position.set(0, 2, -8);
    scene.add(rimLight);

    // Point lights for additional highlights
    const pointLight1 = new THREE.PointLight(0xffffff, 1, 20);
    pointLight1.position.set(3, 5, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x88ccff, 0.8, 20);
    pointLight2.position.set(-3, 3, -2);
    scene.add(pointLight2);

    // Environment map for realistic reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // Silver PBR material with realistic properties
    const silverMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 1.0,
        roughness: 0.2,
        envMapIntensity: 1.5,
    });

    // Create figurine
    figurine = new THREE.Group();

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    head = new THREE.Mesh(headGeometry, silverMaterial);
    head.position.y = 2.5;
    head.castShadow = true;
    head.receiveShadow = true;
    figurine.add(head);

    // Eyes
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.9,
        roughness: 0.1,
    });
    
    const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 2.55, 0.25);
    figurine.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.1, 2.55, 0.25);
    figurine.add(rightEye);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 16);
    const neck = new THREE.Mesh(neckGeometry, silverMaterial);
    neck.position.y = 2.15;
    neck.castShadow = true;
    neck.receiveShadow = true;
    figurine.add(neck);

    // Torso
    const torsoGeometry = new THREE.CapsuleGeometry(0.4, 1.0, 16, 32);
    const torso = new THREE.Mesh(torsoGeometry, silverMaterial);
    torso.position.y = 1.5;
    torso.castShadow = true;
    torso.receiveShadow = true;
    figurine.add(torso);

    // Arms
    const armGeometry = new THREE.CapsuleGeometry(0.12, 0.8, 8, 16);
    
    leftArm = new THREE.Mesh(armGeometry, silverMaterial);
    leftArm.position.set(-0.55, 1.7, 0);
    leftArm.rotation.z = Math.PI / 6;
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;
    figurine.add(leftArm);
    
    rightArm = new THREE.Mesh(armGeometry, silverMaterial);
    rightArm.position.set(0.55, 1.7, 0);
    rightArm.rotation.z = -Math.PI / 6;
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;
    figurine.add(rightArm);

    // Hands
    const handGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    
    const leftHand = new THREE.Mesh(handGeometry, silverMaterial);
    leftHand.position.set(-0.75, 1.2, 0);
    leftHand.castShadow = true;
    figurine.add(leftHand);
    
    const rightHand = new THREE.Mesh(handGeometry, silverMaterial);
    rightHand.position.set(0.75, 1.2, 0);
    rightHand.castShadow = true;
    figurine.add(rightHand);

    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.15, 0.9, 8, 16);
    
    const leftLeg = new THREE.Mesh(legGeometry, silverMaterial);
    leftLeg.position.set(-0.25, 0.5, 0);
    leftLeg.castShadow = true;
    leftLeg.receiveShadow = true;
    figurine.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, silverMaterial);
    rightLeg.position.set(0.25, 0.5, 0);
    rightLeg.castShadow = true;
    rightLeg.receiveShadow = true;
    figurine.add(rightLeg);

    // Feet
    const footGeometry = new THREE.CapsuleGeometry(0.12, 0.25, 8, 16);
    footGeometry.rotateX(Math.PI / 2);
    
    const leftFoot = new THREE.Mesh(footGeometry, silverMaterial);
    leftFoot.position.set(-0.25, 0.05, 0.1);
    leftFoot.castShadow = true;
    figurine.add(leftFoot);
    
    const rightFoot = new THREE.Mesh(footGeometry, silverMaterial);
    rightFoot.position.set(0.25, 0.05, 0.1);
    rightFoot.castShadow = true;
    figurine.add(rightFoot);

    scene.add(figurine);

    // Ground plane with shadow
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x16213e,
        metalness: 0.3,
        roughness: 0.7,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Event listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);

    // Start animation
    animate();
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Make figurine look at cursor
    const targetX = mouse.x * 2;
    const targetY = mouse.y * 2 + 2.5;
    
    // Smooth rotation for head
    targetRotation.y = -mouse.x * 0.5;
    targetRotation.x = mouse.y * 0.3;
    
    head.rotation.y += (targetRotation.y - head.rotation.y) * 0.1;
    head.rotation.x += (targetRotation.x - head.rotation.x) * 0.1;

    // Subtle body follow
    figurine.rotation.y += (-mouse.x * 0.2 - figurine.rotation.y) * 0.05;

    // Animate arms slightly
    const time = Date.now() * 0.001;
    leftArm.rotation.z = Math.PI / 6 + Math.sin(time) * 0.1;
    rightArm.rotation.z = -Math.PI / 6 - Math.sin(time) * 0.1;

    renderer.render(scene, camera);
}

// Initialize the scene
init();

