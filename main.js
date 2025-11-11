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

    // White polished material for low-poly robot
    const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.1,
        envMapIntensity: 1.0,
        flatShading: true, // For that low-poly look
    });

    // LED eye material (glowing cyan)
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ddff,
        emissiveIntensity: 2.5,
        flatShading: true,
    });

    // Create robot
    robot = new THREE.Group();

    // ===== HEAD GROUP =====
    head = new THREE.Group();
    
    // Main head (hexagonal prism for low-poly look)
    const headGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.6, 6);
    const headMesh = new THREE.Mesh(headGeometry, whiteMaterial);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    head.add(headMesh);

    // Top of head (low-poly pyramid/cone)
    const headTopGeometry = new THREE.ConeGeometry(0.35, 0.3, 6);
    const headTop = new THREE.Mesh(headTopGeometry, whiteMaterial);
    headTop.position.y = 0.45;
    headTop.castShadow = true;
    head.add(headTop);

    // Face plate (flat hexagon)
    const facePlateGeometry = new THREE.CircleGeometry(0.3, 6);
    const facePlate = new THREE.Mesh(facePlateGeometry, whiteMaterial);
    facePlate.position.set(0, 0, 0.36);
    facePlate.castShadow = true;
    head.add(facePlate);

    // Eyes (glowing cyan - low poly spheres)
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 0.05, 0.38);
    leftEye.castShadow = false;
    head.add(leftEye);

    rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.12, 0.05, 0.38);
    rightEye.castShadow = false;
    head.add(rightEye);

    // Add point lights to eyes for glow effect
    const leftEyeLight = new THREE.PointLight(0x00ffff, 1, 2);
    leftEye.add(leftEyeLight);
    const rightEyeLight = new THREE.PointLight(0x00ffff, 1, 2);
    rightEye.add(rightEyeLight);

    // Antenna (hexagonal prism)
    const antennaBaseGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 6);
    const antennaBase = new THREE.Mesh(antennaBaseGeometry, whiteMaterial);
    antennaBase.position.y = 0.68;
    antennaBase.castShadow = true;
    head.add(antennaBase);

    const antennaTipGeometry = new THREE.SphereGeometry(0.06, 6, 6);
    const antennaTip = new THREE.Mesh(antennaTipGeometry, eyeMaterial);
    antennaTip.position.y = 0.85;
    antennaTip.castShadow = true;
    head.add(antennaTip);

    // Position head and add to robot
    head.position.y = 2.8;
    robot.add(head);

    // ===== NECK =====
    neck = new THREE.Group();
    const neckGeometry = new THREE.CylinderGeometry(0.18, 0.22, 0.3, 6);
    const neckMesh = new THREE.Mesh(neckGeometry, whiteMaterial);
    neckMesh.castShadow = true;
    neckMesh.receiveShadow = true;
    neck.add(neckMesh);
    neck.position.y = 2.35;
    robot.add(neck);

    // ===== BODY =====
    // Main torso (hexagonal prism)
    const torsoGeometry = new THREE.CylinderGeometry(0.45, 0.5, 1.0, 6);
    const torso = new THREE.Mesh(torsoGeometry, whiteMaterial);
    torso.position.y = 1.7;
    torso.castShadow = true;
    torso.receiveShadow = true;
    robot.add(torso);

    // Chest panel (flat hexagon detail)
    const chestPanelGeometry = new THREE.CircleGeometry(0.25, 6);
    const chestPanel = new THREE.Mesh(chestPanelGeometry, whiteMaterial);
    chestPanel.position.set(0, 1.8, 0.46);
    chestPanel.castShadow = true;
    robot.add(chestPanel);

    // Chest light indicator (triangular)
    const chestLightGeometry = new THREE.CircleGeometry(0.06, 3);
    const chestLightMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 2,
        flatShading: true,
    });
    const chestLight = new THREE.Mesh(chestLightGeometry, chestLightMaterial);
    chestLight.position.set(0, 1.8, 0.48);
    robot.add(chestLight);

    // ===== ARMS =====
    // Left shoulder (low-poly sphere/icosahedron)
    const shoulderGeometry = new THREE.SphereGeometry(0.18, 8, 6);
    const leftShoulder = new THREE.Mesh(shoulderGeometry, whiteMaterial);
    leftShoulder.position.set(-0.55, 2.0, 0);
    leftShoulder.castShadow = true;
    robot.add(leftShoulder);

    // Left arm (hexagonal prism)
    const armGeometry = new THREE.CylinderGeometry(0.11, 0.11, 0.7, 6);
    const leftArm = new THREE.Mesh(armGeometry, whiteMaterial);
    leftArm.position.set(-0.65, 1.5, 0);
    leftArm.rotation.z = 0.2;
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;
    robot.add(leftArm);

    // Left hand (low-poly sphere)
    const leftHandGeometry = new THREE.SphereGeometry(0.14, 8, 6);
    const leftHand = new THREE.Mesh(leftHandGeometry, whiteMaterial);
    leftHand.position.set(-0.75, 1.1, 0);
    leftHand.castShadow = true;
    robot.add(leftHand);

    // Right shoulder
    const rightShoulder = new THREE.Mesh(shoulderGeometry, whiteMaterial);
    rightShoulder.position.set(0.55, 2.0, 0);
    rightShoulder.castShadow = true;
    robot.add(rightShoulder);

    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, whiteMaterial);
    rightArm.position.set(0.65, 1.5, 0);
    rightArm.rotation.z = -0.2;
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;
    robot.add(rightArm);

    // Right hand
    const rightHandGeometry = new THREE.SphereGeometry(0.14, 8, 6);
    const rightHand = new THREE.Mesh(rightHandGeometry, whiteMaterial);
    rightHand.position.set(0.75, 1.1, 0);
    rightHand.castShadow = true;
    robot.add(rightHand);

    // ===== LOWER BODY =====
    // Hips (triangular prism / low-poly trapezoid)
    const hipsGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.35, 6);
    const hips = new THREE.Mesh(hipsGeometry, whiteMaterial);
    hips.position.y = 1.0;
    hips.castShadow = true;
    hips.receiveShadow = true;
    robot.add(hips);

    // ===== LEGS =====
    // Left leg (hexagonal prism)
    const legGeometry = new THREE.CylinderGeometry(0.14, 0.12, 0.8, 6);
    const leftLeg = new THREE.Mesh(legGeometry, whiteMaterial);
    leftLeg.position.set(-0.18, 0.45, 0);
    leftLeg.castShadow = true;
    leftLeg.receiveShadow = true;
    robot.add(leftLeg);

    // Right leg
    const rightLeg = new THREE.Mesh(legGeometry, whiteMaterial);
    rightLeg.position.set(0.18, 0.45, 0);
    rightLeg.castShadow = true;
    rightLeg.receiveShadow = true;
    robot.add(rightLeg);

    // ===== FEET =====
    // Left foot (flat triangular prism)
    const footGeometry = new THREE.BoxGeometry(0.22, 0.12, 0.35);
    const leftFoot = new THREE.Mesh(footGeometry, whiteMaterial);
    leftFoot.position.set(-0.18, 0.06, 0.08);
    leftFoot.castShadow = true;
    leftFoot.receiveShadow = true;
    robot.add(leftFoot);

    // Right foot
    const rightFoot = new THREE.Mesh(footGeometry, whiteMaterial);
    rightFoot.position.set(0.18, 0.06, 0.08);
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

    // Make robot head look at cursor (FIXED DIRECTION)
    // Calculate target rotation for head
    targetRotation.y = mouse.x * 0.6;  // REMOVED the negative sign to fix reversed looking
    targetRotation.x = -mouse.y * 0.4;  // ADDED negative to fix vertical inversion
    
    // Smooth head rotation with lerping
    head.rotation.y += (targetRotation.y - head.rotation.y) * 0.08;
    head.rotation.x += (targetRotation.x - head.rotation.x) * 0.08;

    // Neck follows head slightly
    neck.rotation.y += (targetRotation.y * 0.3 - neck.rotation.y) * 0.06;
    neck.rotation.x += (targetRotation.x * 0.2 - neck.rotation.x) * 0.06;

    // Subtle body rotation following cursor
    robot.rotation.y += (mouse.x * 0.15 - robot.rotation.y) * 0.03;

    // Animate eyes (subtle pulsing)
    const time = Date.now() * 0.001;
    const eyePulse = 1 + Math.sin(time * 2) * 0.12;
    leftEye.scale.set(eyePulse, eyePulse, eyePulse);
    rightEye.scale.set(eyePulse, eyePulse, eyePulse);

    // Idle animation - subtle breathing effect
    const breathe = Math.sin(time * 1.5) * 0.02;
    robot.position.y = breathe;

    renderer.render(scene, camera);
}

// Initialize the scene
init();

