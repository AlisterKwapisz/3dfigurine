import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

let scene, camera, renderer, robot, head, neck, leftEye, rightEye;
let mouse = new THREE.Vector2();
let targetRotation = new THREE.Euler();

const pulseEmitters = [];
const swayTargets = [];

function registerPulseEmitter(target, {
    baseIntensity = 1,
    amplitude = 0.4,
    speed = 1.2,
    offset = 0,
    type = 'light'
} = {}) {
    if (!target) return;
    if (type === 'light') {
        target.intensity = baseIntensity;
    } else if (type === 'material' && target.material?.emissiveIntensity !== undefined) {
        target.material.emissiveIntensity = baseIntensity;
    }
    pulseEmitters.push({ target, baseIntensity, amplitude, speed, offset, type });
}

function registerSwayTarget(target, {
    axis = 'x',
    amplitude = 0.05,
    speed = 1.2,
    offset = 0
} = {}) {
    if (!target) return;
    const baseRotation = target.rotation[axis];
    swayTargets.push({ target, axis, amplitude, speed, offset, baseRotation });
}

function addEdgeOutline(mesh, {
    color = 0xcfdcff,
    opacity = 0.35,
    threshold = 35
} = {}) {
    if (!mesh.geometry) return;
    const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry, threshold),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    );
    mesh.add(edges);
}

function init() {
    pulseEmitters.length = 0;
    swayTargets.length = 0;
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

    // Enhanced lighting system for detailed robot
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Main directional light (soft sunlight)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(5, 12, 8);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -12;
    mainLight.shadow.camera.right = 12;
    mainLight.shadow.camera.top = 12;
    mainLight.shadow.camera.bottom = -12;
    mainLight.shadow.bias = -0.00005;
    mainLight.shadow.radius = 4;
    scene.add(mainLight);

    // Fill light (cool blue)
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.8);
    fillLight.position.set(-6, 8, -4);
    fillLight.castShadow = true;
    fillLight.shadow.mapSize.width = 2048;
    fillLight.shadow.mapSize.height = 2048;
    scene.add(fillLight);

    // Rim light (warm orange)
    const rimLight = new THREE.DirectionalLight(0xffa500, 0.6);
    rimLight.position.set(0, 4, -10);
    scene.add(rimLight);

    // Accent point lights for robot details
    const pointLight1 = new THREE.PointLight(0xffffff, 1.2, 30);
    pointLight1.position.set(6, 8, 6);
    pointLight1.decay = 2;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xaaddff, 0.8, 25);
    pointLight2.position.set(-5, 6, -3);
    pointLight2.decay = 2;
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffddaa, 0.6, 20);
    pointLight3.position.set(3, 10, -2);
    pointLight3.decay = 2;
    scene.add(pointLight3);

    // Hemisphere light for better ambient
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x333333, 0.4);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    // Spotlight for dramatic effect
    const spotLight = new THREE.SpotLight(0xffffff, 0.8, 40, Math.PI / 6, 0.5, 2);
    spotLight.position.set(0, 15, 10);
    spotLight.target.position.set(0, 2, 0);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.bias = -0.0001;
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Environment map for realistic reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // Enhanced white polished material with better lighting response
    const whiteMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.05,
        roughness: 0.08,
        envMapIntensity: 1.3,
        clearcoat: 0.5,
        clearcoatRoughness: 0.12,
        sheen: 0.25,
        sheenColor: new THREE.Color(0xf0f8ff),
        sheenRoughness: 0.65,
        reflectivity: 0.4,
    });

    // Darker accent material for details
    const darkAccentMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe0e0e0,
        metalness: 0.12,
        roughness: 0.22,
        envMapIntensity: 1.0,
        clearcoat: 0.25,
        clearcoatRoughness: 0.2,
        reflectivity: 0.35,
    });

    // LED eye material (glowing cyan with better intensity)
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00aaff,
        emissiveIntensity: 3.0,
    });

    // Glowing accent material for indicators
    const glowMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 2.0,
    });

    // Create robot
    robot = new THREE.Group();

    // ===== HEAD GROUP =====
    head = new THREE.Group();

    // Main head (hexagonal prism with more segments for softer edges)
    const headGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.6, 12);
    const headMesh = new THREE.Mesh(headGeometry, whiteMaterial);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    head.add(headMesh);
    addEdgeOutline(headMesh);

    // Head crown/detail ring
    const crownGeometry = new THREE.TorusGeometry(0.36, 0.02, 8, 12);
    const crown = new THREE.Mesh(crownGeometry, darkAccentMaterial);
    crown.position.y = 0.1;
    crown.castShadow = true;
    head.add(crown);
    addEdgeOutline(crown, { opacity: 0.25, threshold: 15 });

    // Top of head (smooth cone with more segments)
    const headTopGeometry = new THREE.ConeGeometry(0.35, 0.3, 12);
    const headTop = new THREE.Mesh(headTopGeometry, whiteMaterial);
    headTop.position.y = 0.45;
    headTop.castShadow = true;
    head.add(headTop);
    addEdgeOutline(headTop, { opacity: 0.3 });

    // Face plate (smooth hexagon with more detail)
    const facePlateGeometry = new THREE.CircleGeometry(0.3, 12);
    const facePlate = new THREE.Mesh(facePlateGeometry, whiteMaterial);
    facePlate.position.set(0, 0, 0.36);
    facePlate.castShadow = true;
    head.add(facePlate);
    addEdgeOutline(facePlate, { opacity: 0.25, threshold: 10 });

    // Face panel details (horizontal lines)
    for (let i = 0; i < 3; i++) {
        const panelGeometry = new THREE.BoxGeometry(0.55, 0.02, 0.01);
        const panel = new THREE.Mesh(panelGeometry, darkAccentMaterial);
        panel.position.set(0, -0.08 + i * 0.08, 0.35);
        panel.castShadow = true;
        head.add(panel);
        addEdgeOutline(panel, { opacity: 0.2, threshold: 12 });
    }

    // Eyes (smooth spheres with more segments)
    const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial.clone());
    leftEye.position.set(-0.12, 0.05, 0.38);
    leftEye.castShadow = false;
    head.add(leftEye);
    registerPulseEmitter(leftEye, { type: 'material', baseIntensity: 2.4, amplitude: 0.7, speed: 1.65, offset: 0.2 });

    rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial.clone());
    rightEye.position.set(0.12, 0.05, 0.38);
    rightEye.castShadow = false;
    head.add(rightEye);
    registerPulseEmitter(rightEye, { type: 'material', baseIntensity: 2.4, amplitude: 0.7, speed: 1.65, offset: 1.0 });

    // Add point lights to eyes for glow effect
    const leftEyeLight = new THREE.PointLight(0x00ffff, 1.2, 3);
    leftEye.add(leftEyeLight);
    registerPulseEmitter(leftEyeLight, { baseIntensity: 1.15, amplitude: 0.35, speed: 1.6, offset: 0.4 });
    const rightEyeLight = new THREE.PointLight(0x00ffff, 1.2, 3);
    rightEye.add(rightEyeLight);
    registerPulseEmitter(rightEyeLight, { baseIntensity: 1.15, amplitude: 0.35, speed: 1.6, offset: 1.2 });

    // Enhanced antenna system
    const antennaBaseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
    const antennaBase = new THREE.Mesh(antennaBaseGeometry, darkAccentMaterial);
    antennaBase.position.y = 0.7;
    antennaBase.castShadow = true;
    head.add(antennaBase);
    addEdgeOutline(antennaBase, { opacity: 0.25, threshold: 15 });

    // Antenna mid section
    const antennaMidGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.15, 6);
    const antennaMid = new THREE.Mesh(antennaMidGeometry, darkAccentMaterial);
    antennaMid.position.y = 0.87;
    antennaMid.castShadow = true;
    head.add(antennaMid);
    addEdgeOutline(antennaMid, { opacity: 0.25, threshold: 15 });

    // Antenna tip (glowing sphere)
    const antennaTipGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const antennaTip = new THREE.Mesh(antennaTipGeometry, eyeMaterial.clone());
    antennaTip.position.y = 0.98;
    antennaTip.castShadow = true;
    head.add(antennaTip);
    addEdgeOutline(antennaTip, { opacity: 0.2, threshold: 30 });

    // Small antenna lights
    const antennaLight = new THREE.PointLight(0x00ffff, 0.8, 2);
    antennaTip.add(antennaLight);
    registerPulseEmitter(antennaTip, { type: 'material', baseIntensity: 2.5, amplitude: 0.8, speed: 1.8, offset: 0.6 });
    registerPulseEmitter(antennaLight, { baseIntensity: 0.9, amplitude: 0.35, speed: 1.8, offset: 1.5 });

    // Position head and add to robot
    head.position.y = 2.8;
    robot.add(head);

    // ===== NECK =====
    neck = new THREE.Group();
    const neckGeometry = new THREE.CylinderGeometry(0.18, 0.22, 0.3, 12);
    const neckMesh = new THREE.Mesh(neckGeometry, whiteMaterial);
    neckMesh.castShadow = true;
    neckMesh.receiveShadow = true;
    neck.add(neckMesh);
    addEdgeOutline(neckMesh, { opacity: 0.3, threshold: 20 });

    // Neck collar/detail ring
    const collarGeometry = new THREE.TorusGeometry(0.23, 0.03, 6, 12);
    const collar = new THREE.Mesh(collarGeometry, darkAccentMaterial);
    collar.position.y = -0.12;
    collar.castShadow = true;
    neck.add(collar);
    addEdgeOutline(collar, { opacity: 0.25, threshold: 12 });

    neck.position.y = 2.35;
    robot.add(neck);

    // ===== BODY =====
    // Main torso (hexagonal prism with more segments)
    const torsoGeometry = new THREE.CylinderGeometry(0.45, 0.5, 1.0, 12);
    const torso = new THREE.Mesh(torsoGeometry, whiteMaterial);
    torso.position.y = 1.7;
    torso.castShadow = true;
    torso.receiveShadow = true;
    robot.add(torso);
    addEdgeOutline(torso, { opacity: 0.3, threshold: 25 });

    // Torso belt/detail ring
    const beltGeometry = new THREE.TorusGeometry(0.48, 0.02, 8, 12);
    const belt = new THREE.Mesh(beltGeometry, darkAccentMaterial);
    belt.position.y = 1.7;
    belt.castShadow = true;
    robot.add(belt);
    addEdgeOutline(belt, { opacity: 0.25, threshold: 18 });

    // Chest panel (detailed hexagon with vents)
    const chestPanelGeometry = new THREE.CircleGeometry(0.28, 12);
    const chestPanel = new THREE.Mesh(chestPanelGeometry, whiteMaterial);
    chestPanel.position.set(0, 1.8, 0.46);
    chestPanel.castShadow = true;
    robot.add(chestPanel);
    addEdgeOutline(chestPanel, { opacity: 0.28, threshold: 15 });

    // Chest vents (small circular details)
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const ventGeometry = new THREE.CircleGeometry(0.02, 8);
        const vent = new THREE.Mesh(ventGeometry, darkAccentMaterial);
        vent.position.set(
            Math.cos(angle) * 0.15,
            1.75 + Math.sin(angle) * 0.05,
            0.47
        );
        vent.castShadow = true;
        robot.add(vent);
        addEdgeOutline(vent, { opacity: 0.18, threshold: 20 });
    }

    // Chest light indicators (multiple glowing lights)
    const lightPositions = [
        { x: 0, y: 1.85, z: 0.48 },
        { x: -0.08, y: 1.78, z: 0.48 },
        { x: 0.08, y: 1.78, z: 0.48 }
    ];

    lightPositions.forEach((pos, index) => {
        const lightGeometry = new THREE.CircleGeometry(0.04, 10);
        const lightMaterial = glowMaterial.clone();
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(pos.x, pos.y, pos.z);
        robot.add(light);
        addEdgeOutline(light, { opacity: 0.2, threshold: 25 });
        registerPulseEmitter(light, {
            type: 'material',
            baseIntensity: 1.8,
            amplitude: 0.6,
            speed: 1.1 + index * 0.4,
            offset: index * Math.PI * 0.33
        });

        // Add point light for each indicator
        const pointLight = new THREE.PointLight(0x00ff88, 0.6, 4);
        light.add(pointLight);
        registerPulseEmitter(pointLight, {
            baseIntensity: 0.7,
            amplitude: 0.3,
            speed: 1.4 + index * 0.25,
            offset: index * 0.6
        });
    });

    // Spine detail made of stacked rounded plates
    const spineGroup = new THREE.Group();
    for (let i = 0; i < 5; i++) {
        const spineSegment = new RoundedBoxGeometry(0.22, 0.08, 0.32, 3, 0.04);
        const segmentMesh = new THREE.Mesh(spineSegment, darkAccentMaterial);
        segmentMesh.position.set(0, 1.95 - i * 0.18, -0.28);
        segmentMesh.castShadow = true;
        spineGroup.add(segmentMesh);
        addEdgeOutline(segmentMesh, { opacity: 0.18, threshold: 20 });
    }
    robot.add(spineGroup);

    // Backpack / power unit
    const backpackGeometry = new RoundedBoxGeometry(0.65, 0.9, 0.32, 5, 0.08);
    const backpack = new THREE.Mesh(backpackGeometry, whiteMaterial);
    backpack.position.set(0, 1.65, -0.32);
    backpack.castShadow = true;
    robot.add(backpack);
    addEdgeOutline(backpack, { opacity: 0.3, threshold: 15 });
    registerSwayTarget(backpack, { axis: 'y', amplitude: 0.015, speed: 1.6, offset: 0.8 });

    // Backpack glow panels
    for (let i = 0; i < 2; i++) {
        const panelGeometry = new RoundedBoxGeometry(0.18, 0.28, 0.02, 2, 0.02);
        const panelMaterial = glowMaterial.clone();
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(i === 0 ? -0.18 : 0.18, 1.65, -0.49);
        panel.castShadow = true;
        robot.add(panel);
        addEdgeOutline(panel, { opacity: 0.2, threshold: 15 });
        registerPulseEmitter(panel, {
            type: 'material',
            baseIntensity: 1.5,
            amplitude: 0.5,
            speed: 1.3,
            offset: i * Math.PI
        });
    }

    // Shoulder thrusters / vents
    for (let i = 0; i < 2; i++) {
        const thruster = new THREE.Group();
        const housingGeometry = new RoundedBoxGeometry(0.22, 0.3, 0.22, 3, 0.04);
        const housing = new THREE.Mesh(housingGeometry, whiteMaterial);
        housing.castShadow = true;
        thruster.add(housing);
        addEdgeOutline(housing, { opacity: 0.25, threshold: 18 });

        const nozzleGeometry = new THREE.CylinderGeometry(0.06, 0.1, 0.18, 16);
        const nozzle = new THREE.Mesh(nozzleGeometry, darkAccentMaterial);
        nozzle.position.z = -0.18;
        nozzle.rotation.x = Math.PI / 2;
        nozzle.castShadow = true;
        thruster.add(nozzle);
        addEdgeOutline(nozzle, { opacity: 0.2, threshold: 20 });

        const thrusterLight = new THREE.PointLight(0x7fdfff, 0.5, 3);
        thrusterLight.position.set(0, 0, -0.15);
        thruster.add(thrusterLight);
        registerPulseEmitter(thrusterLight, {
            baseIntensity: 0.6,
            amplitude: 0.25,
            speed: 1.7,
            offset: i * 0.7
        });

        thruster.position.set(i === 0 ? -0.82 : 0.82, 1.95, -0.05);
        robot.add(thruster);
        registerSwayTarget(thruster, { axis: 'y', amplitude: 0.02, speed: 1.5, offset: i * 0.9 });
    }

    // Decorative hip cables
    const cableCurveLeft = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.35, 1.1, 0.2),
        new THREE.Vector3(-0.6, 0.9, -0.1),
        new THREE.Vector3(-0.3, 0.75, -0.25)
    ]);
    const cableGeometryLeft = new THREE.TubeGeometry(cableCurveLeft, 20, 0.02, 8, false);
    const cableLeft = new THREE.Mesh(cableGeometryLeft, darkAccentMaterial);
    cableLeft.castShadow = true;
    robot.add(cableLeft);

    const cableCurveRight = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.35, 1.1, 0.2),
        new THREE.Vector3(0.6, 0.9, -0.1),
        new THREE.Vector3(0.3, 0.75, -0.25)
    ]);
    const cableGeometryRight = new THREE.TubeGeometry(cableCurveRight, 20, 0.02, 8, false);
    const cableRight = new THREE.Mesh(cableGeometryRight, darkAccentMaterial);
    cableRight.castShadow = true;
    robot.add(cableRight);

    // Shoulder pads
    const shoulderPadGeometry = new THREE.SphereGeometry(0.25, 12, 12);
    const leftShoulderPad = new THREE.Mesh(shoulderPadGeometry, whiteMaterial);
    leftShoulderPad.position.set(-0.65, 2.1, 0);
    leftShoulderPad.castShadow = true;
    robot.add(leftShoulderPad);
    addEdgeOutline(leftShoulderPad, { opacity: 0.25, threshold: 25 });

    const rightShoulderPad = new THREE.Mesh(shoulderPadGeometry, whiteMaterial);
    rightShoulderPad.position.set(0.65, 2.1, 0);
    rightShoulderPad.castShadow = true;
    robot.add(rightShoulderPad);
    addEdgeOutline(rightShoulderPad, { opacity: 0.25, threshold: 25 });

    // ===== ARMS =====
    // Left arm assembly
    const leftArmGroup = new THREE.Group();

    // Left shoulder joint (detailed sphere)
    const shoulderGeometry = new THREE.SphereGeometry(0.18, 12, 12);
    const leftShoulder = new THREE.Mesh(shoulderGeometry, whiteMaterial);
    leftShoulder.castShadow = true;
    leftArmGroup.add(leftShoulder);
    addEdgeOutline(leftShoulder, { opacity: 0.22, threshold: 25 });

    // Upper arm (hexagonal with more segments)
    const upperArmGeometry = new THREE.CylinderGeometry(0.13, 0.13, 0.5, 8);
    const leftUpperArm = new THREE.Mesh(upperArmGeometry, whiteMaterial);
    leftUpperArm.position.set(-0.1, -0.35, 0);
    leftUpperArm.castShadow = true;
    leftUpperArm.receiveShadow = true;
    leftArmGroup.add(leftUpperArm);
    addEdgeOutline(leftUpperArm, { opacity: 0.25, threshold: 20 });

    // Elbow joint
    const elbowGeometry = new THREE.SphereGeometry(0.15, 10, 10);
    const leftElbow = new THREE.Mesh(elbowGeometry, darkAccentMaterial);
    leftElbow.position.set(-0.1, -0.7, 0);
    leftElbow.castShadow = true;
    leftArmGroup.add(leftElbow);
    addEdgeOutline(leftElbow, { opacity: 0.2, threshold: 25 });

    // Lower arm
    const lowerArmGeometry = new THREE.CylinderGeometry(0.11, 0.11, 0.4, 8);
    const leftLowerArm = new THREE.Mesh(lowerArmGeometry, whiteMaterial);
    leftLowerArm.position.set(-0.1, -0.95, 0);
    leftLowerArm.castShadow = true;
    leftLowerArm.receiveShadow = true;
    leftArmGroup.add(leftLowerArm);
    addEdgeOutline(leftLowerArm, { opacity: 0.25, threshold: 20 });

    // Wrist joint
    const wristGeometry = new THREE.SphereGeometry(0.12, 10, 10);
    const leftWrist = new THREE.Mesh(wristGeometry, darkAccentMaterial);
    leftWrist.position.set(-0.1, -1.2, 0);
    leftWrist.castShadow = true;
    leftArmGroup.add(leftWrist);
    addEdgeOutline(leftWrist, { opacity: 0.2, threshold: 25 });

    // Hand (detailed sphere)
    const leftHandGeometry = new THREE.SphereGeometry(0.14, 12, 12);
    const leftHand = new THREE.Mesh(leftHandGeometry, whiteMaterial);
    leftHand.position.set(-0.1, -1.4, 0);
    leftHand.castShadow = true;
    leftArmGroup.add(leftHand);
    addEdgeOutline(leftHand, { opacity: 0.22, threshold: 30 });

    // Finger details (small protrusions)
    for (let i = 0; i < 3; i++) {
        const fingerGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.08, 6);
        const finger = new THREE.Mesh(fingerGeometry, darkAccentMaterial);
        const angle = (i - 1) * 0.3;
        finger.position.set(
            -0.1 + Math.sin(angle) * 0.1,
            -1.48,
            Math.cos(angle) * 0.1
        );
        finger.rotation.z = angle;
        finger.castShadow = true;
        leftArmGroup.add(finger);
    }

    leftArmGroup.position.set(-0.55, 2.0, 0);
    leftArmGroup.rotation.z = 0.2;
    robot.add(leftArmGroup);
    registerSwayTarget(leftArmGroup, { axis: 'x', amplitude: 0.06, speed: 1.45, offset: 0.5 });
    registerSwayTarget(leftArmGroup, { axis: 'z', amplitude: 0.04, speed: 1.1, offset: 0.2 });

    // Right arm assembly (mirrored)
    const rightArmGroup = new THREE.Group();

    const rightShoulder = new THREE.Mesh(shoulderGeometry, whiteMaterial);
    rightShoulder.castShadow = true;
    rightArmGroup.add(rightShoulder);
    addEdgeOutline(rightShoulder, { opacity: 0.22, threshold: 25 });

    const rightUpperArm = new THREE.Mesh(upperArmGeometry, whiteMaterial);
    rightUpperArm.position.set(0.1, -0.35, 0);
    rightUpperArm.castShadow = true;
    rightUpperArm.receiveShadow = true;
    rightArmGroup.add(rightUpperArm);
    addEdgeOutline(rightUpperArm, { opacity: 0.25, threshold: 20 });

    const rightElbow = new THREE.Mesh(elbowGeometry, darkAccentMaterial);
    rightElbow.position.set(0.1, -0.7, 0);
    rightElbow.castShadow = true;
    rightArmGroup.add(rightElbow);
    addEdgeOutline(rightElbow, { opacity: 0.2, threshold: 25 });

    const rightLowerArm = new THREE.Mesh(lowerArmGeometry, whiteMaterial);
    rightLowerArm.position.set(0.1, -0.95, 0);
    rightLowerArm.castShadow = true;
    rightLowerArm.receiveShadow = true;
    rightArmGroup.add(rightLowerArm);
    addEdgeOutline(rightLowerArm, { opacity: 0.25, threshold: 20 });

    const rightWrist = new THREE.Mesh(wristGeometry, darkAccentMaterial);
    rightWrist.position.set(0.1, -1.2, 0);
    rightWrist.castShadow = true;
    rightArmGroup.add(rightWrist);
    addEdgeOutline(rightWrist, { opacity: 0.2, threshold: 25 });

    const rightHand = new THREE.Mesh(leftHandGeometry, whiteMaterial);
    rightHand.position.set(0.1, -1.4, 0);
    rightHand.castShadow = true;
    rightArmGroup.add(rightHand);
    addEdgeOutline(rightHand, { opacity: 0.22, threshold: 30 });

    // Right hand fingers
    for (let i = 0; i < 3; i++) {
        const fingerGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.08, 6);
        const finger = new THREE.Mesh(fingerGeometry, darkAccentMaterial);
        const angle = (i - 1) * 0.3;
        finger.position.set(
            0.1 + Math.sin(angle) * 0.1,
            -1.48,
            Math.cos(angle) * 0.1
        );
        finger.rotation.z = angle;
        finger.castShadow = true;
        rightArmGroup.add(finger);
    }

    rightArmGroup.position.set(0.55, 2.0, 0);
    rightArmGroup.rotation.z = -0.2;
    robot.add(rightArmGroup);
    registerSwayTarget(rightArmGroup, { axis: 'x', amplitude: 0.06, speed: 1.45, offset: 1.3 });
    registerSwayTarget(rightArmGroup, { axis: 'z', amplitude: 0.04, speed: 1.1, offset: 1.0 });

    // ===== LOWER BODY =====
    // Hips (detailed hexagonal with more segments)
    const hipsGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.4, 12);
    const hips = new THREE.Mesh(hipsGeometry, whiteMaterial);
    hips.position.y = 1.0;
    hips.castShadow = true;
    hips.receiveShadow = true;
    robot.add(hips);

    // Hip detail panels
    const hipPanelGeometry = new THREE.CircleGeometry(0.15, 8);
    const leftHipPanel = new THREE.Mesh(hipPanelGeometry, darkAccentMaterial);
    leftHipPanel.position.set(-0.25, 1.0, 0.36);
    leftHipPanel.castShadow = true;
    robot.add(leftHipPanel);
    addEdgeOutline(leftHipPanel, { opacity: 0.2, threshold: 20 });

    const rightHipPanel = new THREE.Mesh(hipPanelGeometry, darkAccentMaterial);
    rightHipPanel.position.set(0.25, 1.0, 0.36);
    rightHipPanel.castShadow = true;
    robot.add(rightHipPanel);
    addEdgeOutline(rightHipPanel, { opacity: 0.2, threshold: 20 });

    // ===== LEGS =====
    // Left leg assembly
    const leftLegGroup = new THREE.Group();

    // Hip joint
    const hipJointGeometry = new THREE.SphereGeometry(0.18, 10, 10);
    const leftHipJoint = new THREE.Mesh(hipJointGeometry, darkAccentMaterial);
    leftHipJoint.castShadow = true;
    leftLegGroup.add(leftHipJoint);
    addEdgeOutline(leftHipJoint, { opacity: 0.2, threshold: 25 });

    // Upper leg (thigh)
    const thighGeometry = new THREE.CylinderGeometry(0.16, 0.14, 0.5, 8);
    const leftThigh = new THREE.Mesh(thighGeometry, whiteMaterial);
    leftThigh.position.set(0, -0.35, 0);
    leftThigh.castShadow = true;
    leftThigh.receiveShadow = true;
    leftLegGroup.add(leftThigh);
    addEdgeOutline(leftThigh, { opacity: 0.25, threshold: 20 });

    // Knee joint
    const kneeGeometry = new THREE.SphereGeometry(0.15, 10, 10);
    const leftKnee = new THREE.Mesh(kneeGeometry, darkAccentMaterial);
    leftKnee.position.set(0, -0.7, 0);
    leftKnee.castShadow = true;
    leftLegGroup.add(leftKnee);
    addEdgeOutline(leftKnee, { opacity: 0.2, threshold: 25 });

    // Lower leg (calf)
    const calfGeometry = new THREE.CylinderGeometry(0.13, 0.12, 0.45, 8);
    const leftCalf = new THREE.Mesh(calfGeometry, whiteMaterial);
    leftCalf.position.set(0, -1.0, 0);
    leftCalf.castShadow = true;
    leftCalf.receiveShadow = true;
    leftLegGroup.add(leftCalf);
    addEdgeOutline(leftCalf, { opacity: 0.25, threshold: 20 });

    // Ankle joint
    const ankleGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const leftAnkle = new THREE.Mesh(ankleGeometry, darkAccentMaterial);
    leftAnkle.position.set(0, -1.25, 0);
    leftAnkle.castShadow = true;
    leftLegGroup.add(leftAnkle);
    addEdgeOutline(leftAnkle, { opacity: 0.2, threshold: 25 });

    leftLegGroup.position.set(-0.18, 1.15, 0);
    robot.add(leftLegGroup);
    registerSwayTarget(leftLegGroup, { axis: 'x', amplitude: 0.03, speed: 1.2, offset: 0.6 });

    // Right leg assembly (mirrored)
    const rightLegGroup = new THREE.Group();

    const rightHipJoint = new THREE.Mesh(hipJointGeometry, darkAccentMaterial);
    rightHipJoint.castShadow = true;
    rightLegGroup.add(rightHipJoint);
    addEdgeOutline(rightHipJoint, { opacity: 0.2, threshold: 25 });

    const rightThigh = new THREE.Mesh(thighGeometry, whiteMaterial);
    rightThigh.position.set(0, -0.35, 0);
    rightThigh.castShadow = true;
    rightThigh.receiveShadow = true;
    rightLegGroup.add(rightThigh);
    addEdgeOutline(rightThigh, { opacity: 0.25, threshold: 20 });

    const rightKnee = new THREE.Mesh(kneeGeometry, darkAccentMaterial);
    rightKnee.position.set(0, -0.7, 0);
    rightKnee.castShadow = true;
    rightLegGroup.add(rightKnee);
    addEdgeOutline(rightKnee, { opacity: 0.2, threshold: 25 });

    const rightCalf = new THREE.Mesh(calfGeometry, whiteMaterial);
    rightCalf.position.set(0, -1.0, 0);
    rightCalf.castShadow = true;
    rightCalf.receiveShadow = true;
    rightLegGroup.add(rightCalf);
    addEdgeOutline(rightCalf, { opacity: 0.25, threshold: 20 });

    const rightAnkle = new THREE.Mesh(ankleGeometry, darkAccentMaterial);
    rightAnkle.position.set(0, -1.25, 0);
    rightAnkle.castShadow = true;
    rightLegGroup.add(rightAnkle);
    addEdgeOutline(rightAnkle, { opacity: 0.2, threshold: 25 });

    rightLegGroup.position.set(0.18, 1.15, 0);
    robot.add(rightLegGroup);
    registerSwayTarget(rightLegGroup, { axis: 'x', amplitude: 0.03, speed: 1.2, offset: 1.4 });

    // ===== FEET =====
    // Left foot assembly
    const leftFootGroup = new THREE.Group();

    // Main foot (detailed with more segments)
    const footGeometry = new THREE.BoxGeometry(0.25, 0.15, 0.4, 8, 8, 8);
    const leftFoot = new THREE.Mesh(footGeometry, whiteMaterial);
    leftFoot.castShadow = true;
    leftFoot.receiveShadow = true;
    leftFootGroup.add(leftFoot);
    addEdgeOutline(leftFoot, { opacity: 0.25, threshold: 12 });

    // Foot sole detail
    const soleGeometry = new THREE.BoxGeometry(0.22, 0.02, 0.35);
    const leftSole = new THREE.Mesh(soleGeometry, darkAccentMaterial);
    leftSole.position.set(0, -0.07, 0);
    leftSole.castShadow = true;
    leftFootGroup.add(leftSole);
    addEdgeOutline(leftSole, { opacity: 0.2, threshold: 12 });

    // Toe details (small protrusions)
    for (let i = 0; i < 4; i++) {
        const toeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6);
        const toe = new THREE.Mesh(toeGeometry, darkAccentMaterial);
        toe.position.set(-0.08 + i * 0.05, -0.1, 0.18);
        toe.castShadow = true;
        leftFootGroup.add(toe);
        addEdgeOutline(toe, { opacity: 0.18, threshold: 10 });
    }

    leftFootGroup.position.set(-0.18, 0.06, 0.08);
    robot.add(leftFootGroup);

    // Right foot assembly (mirrored)
    const rightFootGroup = new THREE.Group();

    const rightFoot = new THREE.Mesh(footGeometry, whiteMaterial);
    rightFoot.castShadow = true;
    rightFoot.receiveShadow = true;
    rightFootGroup.add(rightFoot);
    addEdgeOutline(rightFoot, { opacity: 0.25, threshold: 12 });

    const rightSole = new THREE.Mesh(soleGeometry, darkAccentMaterial);
    rightSole.position.set(0, -0.07, 0);
    rightSole.castShadow = true;
    rightFootGroup.add(rightSole);
    addEdgeOutline(rightSole, { opacity: 0.2, threshold: 12 });

    // Right foot toes
    for (let i = 0; i < 4; i++) {
        const toeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6);
        const toe = new THREE.Mesh(toeGeometry, darkAccentMaterial);
        toe.position.set(-0.08 + i * 0.05, -0.1, 0.18);
        toe.castShadow = true;
        rightFootGroup.add(toe);
        addEdgeOutline(toe, { opacity: 0.18, threshold: 10 });
    }

    rightFootGroup.position.set(0.18, 0.06, 0.08);
    robot.add(rightFootGroup);
    registerSwayTarget(rightFootGroup, { axis: 'x', amplitude: 0.015, speed: 1.3, offset: 1.2 });
    registerSwayTarget(leftFootGroup, { axis: 'x', amplitude: 0.015, speed: 1.3, offset: 0.2 });

    scene.add(robot);

    // Ground plane with shadow
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x141c32,
        metalness: 0.15,
        roughness: 0.85,
        reflectivity: 0.15,
        clearcoat: 0.05,
        clearcoatRoughness: 0.6,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    const floorGlowGeometry = new THREE.CircleGeometry(3.8, 64);
    const floorGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x63fff1,
        transparent: true,
        opacity: 0.08
    });
    const floorGlow = new THREE.Mesh(floorGlowGeometry, floorGlowMaterial);
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = 0.001;
    scene.add(floorGlow);

    const floorRingGeometry = new THREE.RingGeometry(2.4, 3.4, 60, 1, 0, Math.PI * 2);
    const floorRingMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffdd,
        emissive: 0x00ffee,
        emissiveIntensity: 0.6,
        metalness: 0.2,
        roughness: 0.8,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const floorRing = new THREE.Mesh(floorRingGeometry, floorRingMaterial);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = 0.0015;
    scene.add(floorRing);
    registerPulseEmitter(floorRing, { type: 'material', baseIntensity: 0.9, amplitude: 0.3, speed: 0.8, offset: 0.5 });

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

    // Animate emissive materials and supporting lights
    pulseEmitters.forEach(({ target, baseIntensity, amplitude, speed, offset, type }) => {
        const pulse = baseIntensity + Math.sin(time * speed + offset) * amplitude;
        if (type === 'light') {
            target.intensity = pulse;
        } else if (type === 'material' && target.material?.emissiveIntensity !== undefined) {
            target.material.emissiveIntensity = pulse;
        }
    });

    // Apply subtle sway to secondary components
    swayTargets.forEach(({ target, axis, amplitude, speed, offset, baseRotation }) => {
        target.rotation[axis] = baseRotation + Math.sin(time * speed + offset) * amplitude;
    });

    renderer.render(scene, camera);
}

// Initialize the scene
init();

