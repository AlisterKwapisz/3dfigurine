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
    const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.05,
        roughness: 0.08,
        envMapIntensity: 1.2,
        clearcoat: 0.1,
        clearcoatRoughness: 0.1,
    });

    // Darker accent material for details
    const darkAccentMaterial = new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        metalness: 0.1,
        roughness: 0.2,
        envMapIntensity: 0.8,
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

    // Head crown/detail ring
    const crownGeometry = new THREE.TorusGeometry(0.36, 0.02, 8, 12);
    const crown = new THREE.Mesh(crownGeometry, darkAccentMaterial);
    crown.position.y = 0.1;
    crown.castShadow = true;
    head.add(crown);

    // Top of head (smooth cone with more segments)
    const headTopGeometry = new THREE.ConeGeometry(0.35, 0.3, 12);
    const headTop = new THREE.Mesh(headTopGeometry, whiteMaterial);
    headTop.position.y = 0.45;
    headTop.castShadow = true;
    head.add(headTop);

    // Face plate (smooth hexagon with more detail)
    const facePlateGeometry = new THREE.CircleGeometry(0.3, 12);
    const facePlate = new THREE.Mesh(facePlateGeometry, whiteMaterial);
    facePlate.position.set(0, 0, 0.36);
    facePlate.castShadow = true;
    head.add(facePlate);

    // Face panel details (horizontal lines)
    for (let i = 0; i < 3; i++) {
        const panelGeometry = new THREE.BoxGeometry(0.55, 0.02, 0.01);
        const panel = new THREE.Mesh(panelGeometry, darkAccentMaterial);
        panel.position.set(0, -0.08 + i * 0.08, 0.35);
        panel.castShadow = true;
        head.add(panel);
    }

    // Eyes (smooth spheres with more segments)
    const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 0.05, 0.38);
    leftEye.castShadow = false;
    head.add(leftEye);

    rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.12, 0.05, 0.38);
    rightEye.castShadow = false;
    head.add(rightEye);

    // Add point lights to eyes for glow effect
    const leftEyeLight = new THREE.PointLight(0x00ffff, 1.2, 3);
    leftEye.add(leftEyeLight);
    const rightEyeLight = new THREE.PointLight(0x00ffff, 1.2, 3);
    rightEye.add(rightEyeLight);

    // Enhanced antenna system
    const antennaBaseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
    const antennaBase = new THREE.Mesh(antennaBaseGeometry, darkAccentMaterial);
    antennaBase.position.y = 0.7;
    antennaBase.castShadow = true;
    head.add(antennaBase);

    // Antenna mid section
    const antennaMidGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.15, 6);
    const antennaMid = new THREE.Mesh(antennaMidGeometry, darkAccentMaterial);
    antennaMid.position.y = 0.87;
    antennaMid.castShadow = true;
    head.add(antennaMid);

    // Antenna tip (glowing sphere)
    const antennaTipGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const antennaTip = new THREE.Mesh(antennaTipGeometry, eyeMaterial);
    antennaTip.position.y = 0.98;
    antennaTip.castShadow = true;
    head.add(antennaTip);

    // Small antenna lights
    const antennaLight = new THREE.PointLight(0x00ffff, 0.8, 2);
    antennaTip.add(antennaLight);

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

    // Neck collar/detail ring
    const collarGeometry = new THREE.TorusGeometry(0.23, 0.03, 6, 12);
    const collar = new THREE.Mesh(collarGeometry, darkAccentMaterial);
    collar.position.y = -0.12;
    collar.castShadow = true;
    neck.add(collar);

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

    // Torso belt/detail ring
    const beltGeometry = new THREE.TorusGeometry(0.48, 0.02, 8, 12);
    const belt = new THREE.Mesh(beltGeometry, darkAccentMaterial);
    belt.position.y = 1.7;
    belt.castShadow = true;
    robot.add(belt);

    // Chest panel (detailed hexagon with vents)
    const chestPanelGeometry = new THREE.CircleGeometry(0.28, 12);
    const chestPanel = new THREE.Mesh(chestPanelGeometry, whiteMaterial);
    chestPanel.position.set(0, 1.8, 0.46);
    chestPanel.castShadow = true;
    robot.add(chestPanel);

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
    }

    // Chest light indicators (multiple glowing lights)
    const lightPositions = [
        { x: 0, y: 1.85, z: 0.48 },
        { x: -0.08, y: 1.78, z: 0.48 },
        { x: 0.08, y: 1.78, z: 0.48 }
    ];

    lightPositions.forEach((pos, index) => {
        const lightGeometry = new THREE.CircleGeometry(0.04, 8);
        const light = new THREE.Mesh(lightGeometry, glowMaterial);
        light.position.set(pos.x, pos.y, pos.z);
        robot.add(light);

        // Add point light for each indicator
        const pointLight = new THREE.PointLight(0x00ff88, 0.5, 4);
        light.add(pointLight);
    });

    // Shoulder pads
    const shoulderPadGeometry = new THREE.SphereGeometry(0.25, 12, 12);
    const leftShoulderPad = new THREE.Mesh(shoulderPadGeometry, whiteMaterial);
    leftShoulderPad.position.set(-0.65, 2.1, 0);
    leftShoulderPad.castShadow = true;
    robot.add(leftShoulderPad);

    const rightShoulderPad = new THREE.Mesh(shoulderPadGeometry, whiteMaterial);
    rightShoulderPad.position.set(0.65, 2.1, 0);
    rightShoulderPad.castShadow = true;
    robot.add(rightShoulderPad);

    // ===== ARMS =====
    // Left arm assembly
    const leftArmGroup = new THREE.Group();

    // Left shoulder joint (detailed sphere)
    const shoulderGeometry = new THREE.SphereGeometry(0.18, 12, 12);
    const leftShoulder = new THREE.Mesh(shoulderGeometry, whiteMaterial);
    leftShoulder.castShadow = true;
    leftArmGroup.add(leftShoulder);

    // Upper arm (hexagonal with more segments)
    const upperArmGeometry = new THREE.CylinderGeometry(0.13, 0.13, 0.5, 8);
    const leftUpperArm = new THREE.Mesh(upperArmGeometry, whiteMaterial);
    leftUpperArm.position.set(-0.1, -0.35, 0);
    leftUpperArm.castShadow = true;
    leftUpperArm.receiveShadow = true;
    leftArmGroup.add(leftUpperArm);

    // Elbow joint
    const elbowGeometry = new THREE.SphereGeometry(0.15, 10, 10);
    const leftElbow = new THREE.Mesh(elbowGeometry, darkAccentMaterial);
    leftElbow.position.set(-0.1, -0.7, 0);
    leftElbow.castShadow = true;
    leftArmGroup.add(leftElbow);

    // Lower arm
    const lowerArmGeometry = new THREE.CylinderGeometry(0.11, 0.11, 0.4, 8);
    const leftLowerArm = new THREE.Mesh(lowerArmGeometry, whiteMaterial);
    leftLowerArm.position.set(-0.1, -0.95, 0);
    leftLowerArm.castShadow = true;
    leftLowerArm.receiveShadow = true;
    leftArmGroup.add(leftLowerArm);

    // Wrist joint
    const wristGeometry = new THREE.SphereGeometry(0.12, 10, 10);
    const leftWrist = new THREE.Mesh(wristGeometry, darkAccentMaterial);
    leftWrist.position.set(-0.1, -1.2, 0);
    leftWrist.castShadow = true;
    leftArmGroup.add(leftWrist);

    // Hand (detailed sphere)
    const leftHandGeometry = new THREE.SphereGeometry(0.14, 12, 12);
    const leftHand = new THREE.Mesh(leftHandGeometry, whiteMaterial);
    leftHand.position.set(-0.1, -1.4, 0);
    leftHand.castShadow = true;
    leftArmGroup.add(leftHand);

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

    // Right arm assembly (mirrored)
    const rightArmGroup = new THREE.Group();

    const rightShoulder = new THREE.Mesh(shoulderGeometry, whiteMaterial);
    rightShoulder.castShadow = true;
    rightArmGroup.add(rightShoulder);

    const rightUpperArm = new THREE.Mesh(upperArmGeometry, whiteMaterial);
    rightUpperArm.position.set(0.1, -0.35, 0);
    rightUpperArm.castShadow = true;
    rightUpperArm.receiveShadow = true;
    rightArmGroup.add(rightUpperArm);

    const rightElbow = new THREE.Mesh(elbowGeometry, darkAccentMaterial);
    rightElbow.position.set(0.1, -0.7, 0);
    rightElbow.castShadow = true;
    rightArmGroup.add(rightElbow);

    const rightLowerArm = new THREE.Mesh(lowerArmGeometry, whiteMaterial);
    rightLowerArm.position.set(0.1, -0.95, 0);
    rightLowerArm.castShadow = true;
    rightLowerArm.receiveShadow = true;
    rightArmGroup.add(rightLowerArm);

    const rightWrist = new THREE.Mesh(wristGeometry, darkAccentMaterial);
    rightWrist.position.set(0.1, -1.2, 0);
    rightWrist.castShadow = true;
    rightArmGroup.add(rightWrist);

    const rightHand = new THREE.Mesh(leftHandGeometry, whiteMaterial);
    rightHand.position.set(0.1, -1.4, 0);
    rightHand.castShadow = true;
    rightArmGroup.add(rightHand);

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

    const rightHipPanel = new THREE.Mesh(hipPanelGeometry, darkAccentMaterial);
    rightHipPanel.position.set(0.25, 1.0, 0.36);
    rightHipPanel.castShadow = true;
    robot.add(rightHipPanel);

    // ===== LEGS =====
    // Left leg assembly
    const leftLegGroup = new THREE.Group();

    // Hip joint
    const hipJointGeometry = new THREE.SphereGeometry(0.18, 10, 10);
    const leftHipJoint = new THREE.Mesh(hipJointGeometry, darkAccentMaterial);
    leftHipJoint.castShadow = true;
    leftLegGroup.add(leftHipJoint);

    // Upper leg (thigh)
    const thighGeometry = new THREE.CylinderGeometry(0.16, 0.14, 0.5, 8);
    const leftThigh = new THREE.Mesh(thighGeometry, whiteMaterial);
    leftThigh.position.set(0, -0.35, 0);
    leftThigh.castShadow = true;
    leftThigh.receiveShadow = true;
    leftLegGroup.add(leftThigh);

    // Knee joint
    const kneeGeometry = new THREE.SphereGeometry(0.15, 10, 10);
    const leftKnee = new THREE.Mesh(kneeGeometry, darkAccentMaterial);
    leftKnee.position.set(0, -0.7, 0);
    leftKnee.castShadow = true;
    leftLegGroup.add(leftKnee);

    // Lower leg (calf)
    const calfGeometry = new THREE.CylinderGeometry(0.13, 0.12, 0.45, 8);
    const leftCalf = new THREE.Mesh(calfGeometry, whiteMaterial);
    leftCalf.position.set(0, -1.0, 0);
    leftCalf.castShadow = true;
    leftCalf.receiveShadow = true;
    leftLegGroup.add(leftCalf);

    // Ankle joint
    const ankleGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const leftAnkle = new THREE.Mesh(ankleGeometry, darkAccentMaterial);
    leftAnkle.position.set(0, -1.25, 0);
    leftAnkle.castShadow = true;
    leftLegGroup.add(leftAnkle);

    leftLegGroup.position.set(-0.18, 1.15, 0);
    robot.add(leftLegGroup);

    // Right leg assembly (mirrored)
    const rightLegGroup = new THREE.Group();

    const rightHipJoint = new THREE.Mesh(hipJointGeometry, darkAccentMaterial);
    rightHipJoint.castShadow = true;
    rightLegGroup.add(rightHipJoint);

    const rightThigh = new THREE.Mesh(thighGeometry, whiteMaterial);
    rightThigh.position.set(0, -0.35, 0);
    rightThigh.castShadow = true;
    rightThigh.receiveShadow = true;
    rightLegGroup.add(rightThigh);

    const rightKnee = new THREE.Mesh(kneeGeometry, darkAccentMaterial);
    rightKnee.position.set(0, -0.7, 0);
    rightKnee.castShadow = true;
    rightLegGroup.add(rightKnee);

    const rightCalf = new THREE.Mesh(calfGeometry, whiteMaterial);
    rightCalf.position.set(0, -1.0, 0);
    rightCalf.castShadow = true;
    rightCalf.receiveShadow = true;
    rightLegGroup.add(rightCalf);

    const rightAnkle = new THREE.Mesh(ankleGeometry, darkAccentMaterial);
    rightAnkle.position.set(0, -1.25, 0);
    rightAnkle.castShadow = true;
    rightLegGroup.add(rightAnkle);

    rightLegGroup.position.set(0.18, 1.15, 0);
    robot.add(rightLegGroup);

    // ===== FEET =====
    // Left foot assembly
    const leftFootGroup = new THREE.Group();

    // Main foot (detailed with more segments)
    const footGeometry = new THREE.BoxGeometry(0.25, 0.15, 0.4, 8, 8, 8);
    const leftFoot = new THREE.Mesh(footGeometry, whiteMaterial);
    leftFoot.castShadow = true;
    leftFoot.receiveShadow = true;
    leftFootGroup.add(leftFoot);

    // Foot sole detail
    const soleGeometry = new THREE.BoxGeometry(0.22, 0.02, 0.35);
    const leftSole = new THREE.Mesh(soleGeometry, darkAccentMaterial);
    leftSole.position.set(0, -0.07, 0);
    leftSole.castShadow = true;
    leftFootGroup.add(leftSole);

    // Toe details (small protrusions)
    for (let i = 0; i < 4; i++) {
        const toeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6);
        const toe = new THREE.Mesh(toeGeometry, darkAccentMaterial);
        toe.position.set(-0.08 + i * 0.05, -0.1, 0.18);
        toe.castShadow = true;
        leftFootGroup.add(toe);
    }

    leftFootGroup.position.set(-0.18, 0.06, 0.08);
    robot.add(leftFootGroup);

    // Right foot assembly (mirrored)
    const rightFootGroup = new THREE.Group();

    const rightFoot = new THREE.Mesh(footGeometry, whiteMaterial);
    rightFoot.castShadow = true;
    rightFoot.receiveShadow = true;
    rightFootGroup.add(rightFoot);

    const rightSole = new THREE.Mesh(soleGeometry, darkAccentMaterial);
    rightSole.position.set(0, -0.07, 0);
    rightSole.castShadow = true;
    rightFootGroup.add(rightSole);

    // Right foot toes
    for (let i = 0; i < 4; i++) {
        const toeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6);
        const toe = new THREE.Mesh(toeGeometry, darkAccentMaterial);
        toe.position.set(-0.08 + i * 0.05, -0.1, 0.18);
        toe.castShadow = true;
        rightFootGroup.add(toe);
    }

    rightFootGroup.position.set(0.18, 0.06, 0.08);
    robot.add(rightFootGroup);

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

