import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

let scene, camera, renderer, robot, head, neck, leftEye, rightEye;
let mouse = new THREE.Vector2();
let targetRotation = new THREE.Euler();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 7);
    camera.lookAt(0, 2, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Lighting setup for realistic rendering
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main directional light (sun-like)
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    // Fill light (blue tinted)
    const fillLight = new THREE.DirectionalLight(0x6ba3ff, 1.2);
    fillLight.position.set(-5, 5, -3);
    scene.add(fillLight);

    // Rim light (warm accent)
    const rimLight = new THREE.DirectionalLight(0xffb366, 0.8);
    rimLight.position.set(0, 3, -8);
    scene.add(rimLight);

    // Point lights for highlights
    const pointLight1 = new THREE.PointLight(0xffffff, 1.5, 25);
    pointLight1.position.set(4, 6, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x88ddff, 1, 20);
    pointLight2.position.set(-4, 4, -2);
    scene.add(pointLight2);

    // Add hemisphere light for better ambient
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Environment map for realistic reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // Enhanced silver PBR material with realistic properties
    const silverMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4d4d4,
        metalness: 0.95,
        roughness: 0.15,
        envMapIntensity: 2.0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
    });

    // Darker silver for accents
    const darkSilverMaterial = new THREE.MeshStandardMaterial({
        color: 0x909090,
        metalness: 0.9,
        roughness: 0.25,
        envMapIntensity: 1.5,
    });

    // LED eye material (glowing)
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ddff,
        emissiveIntensity: 2,
        metalness: 0.1,
        roughness: 0.2,
    });

    // Create robot
    robot = new THREE.Group();

    // ===== HEAD =====
    // Main head (rounded box shape)
    const headGeometry = new THREE.BoxGeometry(0.7, 0.6, 0.6, 32, 32, 32);
    head = new THREE.Mesh(headGeometry, silverMaterial);
    head.position.y = 2.8;
    head.castShadow = true;
    head.receiveShadow = true;
    robot.add(head);

    // Top of head (dome)
    const headTopGeometry = new THREE.SphereGeometry(0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const headTop = new THREE.Mesh(headTopGeometry, silverMaterial);
    headTop.position.y = 3.1;
    headTop.castShadow = true;
    robot.add(headTop);

    // Face plate (slightly darker)
    const faceGeometry = new THREE.BoxGeometry(0.65, 0.5, 0.05, 32, 32, 32);
    const facePlate = new THREE.Mesh(faceGeometry, darkSilverMaterial);
    facePlate.position.set(0, 2.8, 0.32);
    facePlate.castShadow = true;
    robot.add(facePlate);

    // Eyes (glowing cyan LEDs)
    const eyeGeometry = new THREE.SphereGeometry(0.08, 32, 32);
    leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 2.85, 0.35);
    leftEye.castShadow = false;
    robot.add(leftEye);

    rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 2.85, 0.35);
    rightEye.castShadow = false;
    robot.add(rightEye);

    // Add point lights to eyes for glow effect
    const leftEyeLight = new THREE.PointLight(0x00ffff, 0.8, 2);
    leftEye.add(leftEyeLight);
    const rightEyeLight = new THREE.PointLight(0x00ffff, 0.8, 2);
    rightEye.add(rightEyeLight);

    // Antenna
    const antennaBaseGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 16);
    const antennaBase = new THREE.Mesh(antennaBaseGeometry, darkSilverMaterial);
    antennaBase.position.y = 3.35;
    antennaBase.castShadow = true;
    robot.add(antennaBase);

    const antennaTipGeometry = new THREE.SphereGeometry(0.06, 32, 32);
    const antennaTip = new THREE.Mesh(antennaTipGeometry, eyeMaterial);
    antennaTip.position.y = 3.5;
    antennaTip.castShadow = true;
    robot.add(antennaTip);

    // ===== NECK =====
    neck = new THREE.Group();
    const neckGeometry = new THREE.CylinderGeometry(0.18, 0.22, 0.25, 32);
    const neckMesh = new THREE.Mesh(neckGeometry, darkSilverMaterial);
    neckMesh.castShadow = true;
    neckMesh.receiveShadow = true;
    neck.add(neckMesh);
    neck.position.y = 2.4;
    robot.add(neck);

    // ===== BODY =====
    // Main torso (rounded box)
    const torsoGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.7, 32, 32, 32);
    const torso = new THREE.Mesh(torsoGeometry, silverMaterial);
    torso.position.y = 1.7;
    torso.castShadow = true;
    torso.receiveShadow = true;
    robot.add(torso);

    // Chest panel (detail)
    const chestPanelGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.05);
    const chestPanel = new THREE.Mesh(chestPanelGeometry, darkSilverMaterial);
    chestPanel.position.set(0, 1.7, 0.36);
    chestPanel.castShadow = true;
    robot.add(chestPanel);

    // Chest light indicator
    const chestLightGeometry = new THREE.CircleGeometry(0.05, 32);
    const chestLightMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 1.5,
    });
    const chestLight = new THREE.Mesh(chestLightGeometry, chestLightMaterial);
    chestLight.position.set(0, 1.85, 0.39);
    robot.add(chestLight);

    // ===== ARMS =====
    // Left arm
    const shoulderGeometry = new THREE.SphereGeometry(0.18, 32, 32);
    const leftShoulder = new THREE.Mesh(shoulderGeometry, darkSilverMaterial);
    leftShoulder.position.set(-0.55, 1.9, 0);
    leftShoulder.castShadow = true;
    robot.add(leftShoulder);

    const armGeometry = new THREE.CapsuleGeometry(0.12, 0.6, 16, 32);
    const leftArm = new THREE.Mesh(armGeometry, silverMaterial);
    leftArm.position.set(-0.65, 1.5, 0);
    leftArm.rotation.z = 0.2;
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;
    robot.add(leftArm);

    const leftHandGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const leftHand = new THREE.Mesh(leftHandGeometry, silverMaterial);
    leftHand.position.set(-0.75, 1.1, 0);
    leftHand.castShadow = true;
    robot.add(leftHand);

    // Right arm
    const rightShoulder = new THREE.Mesh(shoulderGeometry, darkSilverMaterial);
    rightShoulder.position.set(0.55, 1.9, 0);
    rightShoulder.castShadow = true;
    robot.add(rightShoulder);

    const rightArm = new THREE.Mesh(armGeometry, silverMaterial);
    rightArm.position.set(0.65, 1.5, 0);
    rightArm.rotation.z = -0.2;
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;
    robot.add(rightArm);

    const rightHandGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const rightHand = new THREE.Mesh(rightHandGeometry, silverMaterial);
    rightHand.position.set(0.75, 1.1, 0);
    rightHand.castShadow = true;
    robot.add(rightHand);

    // ===== LOWER BODY =====
    const hipsGeometry = new THREE.BoxGeometry(0.7, 0.3, 0.6, 32, 32, 32);
    const hips = new THREE.Mesh(hipsGeometry, darkSilverMaterial);
    hips.position.y = 1.05;
    hips.castShadow = true;
    hips.receiveShadow = true;
    robot.add(hips);

    // ===== LEGS =====
    const legGeometry = new THREE.CapsuleGeometry(0.15, 0.7, 16, 32);
    
    const leftLeg = new THREE.Mesh(legGeometry, silverMaterial);
    leftLeg.position.set(-0.22, 0.5, 0);
    leftLeg.castShadow = true;
    leftLeg.receiveShadow = true;
    robot.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, silverMaterial);
    rightLeg.position.set(0.22, 0.5, 0);
    rightLeg.castShadow = true;
    rightLeg.receiveShadow = true;
    robot.add(rightLeg);

    // ===== FEET =====
    const footGeometry = new THREE.BoxGeometry(0.25, 0.15, 0.35, 32, 32, 32);
    
    const leftFoot = new THREE.Mesh(footGeometry, darkSilverMaterial);
    leftFoot.position.set(-0.22, 0.08, 0.05);
    leftFoot.castShadow = true;
    leftFoot.receiveShadow = true;
    robot.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeometry, darkSilverMaterial);
    rightFoot.position.set(0.22, 0.08, 0.05);
    rightFoot.castShadow = true;
    rightFoot.receiveShadow = true;
    robot.add(rightFoot);

    scene.add(robot);

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

    // Make robot head look at cursor
    const targetX = mouse.x * 2;
    const targetY = mouse.y * 2 + 2.8;
    
    // Calculate target rotation for head
    targetRotation.y = -mouse.x * 0.6;
    targetRotation.x = mouse.y * 0.4;
    
    // Smooth head rotation with lerping
    head.rotation.y += (targetRotation.y - head.rotation.y) * 0.08;
    head.rotation.x += (targetRotation.x - head.rotation.x) * 0.08;

    // Neck follows head slightly
    neck.rotation.y += (targetRotation.y * 0.3 - neck.rotation.y) * 0.06;
    neck.rotation.x += (targetRotation.x * 0.2 - neck.rotation.x) * 0.06;

    // Subtle body rotation following cursor
    robot.rotation.y += (-mouse.x * 0.15 - robot.rotation.y) * 0.03;

    // Animate eyes (subtle pulsing)
    const time = Date.now() * 0.001;
    const eyePulse = 1 + Math.sin(time * 2) * 0.15;
    leftEye.scale.set(eyePulse, eyePulse, eyePulse);
    rightEye.scale.set(eyePulse, eyePulse, eyePulse);

    // Idle animation - subtle breathing effect
    const breathe = Math.sin(time * 1.5) * 0.02;
    robot.position.y = breathe;

    renderer.render(scene, camera);
}

// Initialize the scene
init();

