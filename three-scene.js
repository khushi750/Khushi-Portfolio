// three-scene.js - Upgraded Three.js Interactive 3D Scenes
import * as THREE from 'https://unpkg.com/three@0.150.0/build/three.module.js';

// Helper: Generate high-quality circular glow texture programmatically
function createGlowTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.4, 'rgba(0, 242, 254, 0.35)');
    gradient.addColorStop(0.7, 'rgba(155, 81, 224, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
}

// Helper: Generate hologram texture (horizontal scan lines)
function createHologramTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Gradient fill
    const gradient = ctx.createRadialGradient(size/2, size/2, 10, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(0, 242, 254, 0.8)');
    gradient.addColorStop(0.5, 'rgba(155, 81, 224, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Overlay scanlines
    ctx.fillStyle = 'rgba(7, 7, 13, 0.4)';
    for(let y=0; y<size; y+=4) {
        ctx.fillRect(0, y, size, 2);
    }
    return new THREE.CanvasTexture(canvas);
}

/* =========================================================================
   1. MAIN BACKGROUND: WAVE GRID & FLOATING TORUS KNOT
   ========================================================================= */
export function initThreeScene() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020204, 0.002);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 45, 130);
    camera.lookAt(0, 0, 0);

    // Renderer (Disabled alpha for pure, solid dark background)
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020204, 1.0);

    // A. Organic Flowing Wave Grid
    const gridCols = 55;
    const gridRows = 55;
    const gridSpacing = 4.5;
    const particleCount = gridCols * gridRows;

    const waveGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Generate plane grid coordinates
    let index = 0;
    const halfWidth = (gridCols * gridSpacing) / 2;
    const halfHeight = (gridRows * gridSpacing) / 2;

    const colorTeal = new THREE.Color(0x00f2fe);
    const colorPurple = new THREE.Color(0x9b51e0);
    const colorMagenta = new THREE.Color(0xf43f5e);

    for (let x = 0; x < gridCols; x++) {
        for (let y = 0; y < gridRows; y++) {
            const posX = x * gridSpacing - halfWidth;
            const posY = y * gridSpacing - halfHeight;

            positions[index * 3] = posX;
            positions[index * 3 + 1] = 0; // Height adjusted in loop
            positions[index * 3 + 2] = posY;

            // Paint colors based on position relative to center
            const distFromCenter = Math.sqrt(posX * posX + posY * posY) / halfWidth;
            let finalColor = colorTeal.clone();
            if (distFromCenter > 0.4 && distFromCenter < 0.8) {
                finalColor.lerp(colorPurple, (distFromCenter - 0.4) / 0.4);
            } else if (distFromCenter >= 0.8) {
                finalColor.copy(colorPurple).lerp(colorMagenta, Math.min(1, (distFromCenter - 0.8) / 0.4));
            }

            colors[index * 3] = finalColor.r;
            colors[index * 3 + 1] = finalColor.g;
            colors[index * 3 + 2] = finalColor.b;

            index++;
        }
    }

    waveGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    waveGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const waveMaterial = new THREE.PointsMaterial({
        size: 2.2,
        map: createGlowTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const waveParticles = new THREE.Points(waveGeometry, waveMaterial);
    scene.add(waveParticles);

    // B. Hero Floating Torus Knot (Wireframe + Particles node mesh)
    const torusGroup = new THREE.Group();
    // Position it to the right on desktop, center on mobile
    const isMobile = width < 768;
    if (isMobile) {
        torusGroup.scale.set(0.6, 0.6, 0.6);
        torusGroup.position.set(0, -18, 45);
    } else {
        torusGroup.scale.set(1, 1, 1);
        torusGroup.position.set(38, 12, 45);
    }
    scene.add(torusGroup);

    // Torus Geometry
    const torusGeom = new THREE.TorusKnotGeometry(13, 3.8, 120, 16);
    
    // Wireframe Mesh Layer
    const wireframeMat = new THREE.MeshBasicMaterial({
        color: 0x9b51e0,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending
    });
    const torusWire = new THREE.Mesh(torusGeom, wireframeMat);
    torusGroup.add(torusWire);

    // Vertex points glow layer
    const torusPointsMat = new THREE.PointsMaterial({
        color: 0x00f2fe,
        size: 1.8,
        map: createGlowTexture(),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const torusNodes = new THREE.Points(torusGeom, torusPointsMat);
    torusGroup.add(torusNodes);

    // C. Deep Star Field Layer (Drifting stars)
    const starsCount = 450;
    const starsGeometry = new THREE.BufferGeometry();
    const starsPositions = new Float32Array(starsCount * 3);

    for(let i=0; i<starsCount; i++) {
        starsPositions[i*3] = (Math.random() - 0.5) * 500;
        starsPositions[i*3+1] = (Math.random() - 0.5) * 350;
        starsPositions[i*3+2] = (Math.random() - 0.5) * 500;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.2,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // Interaction Parameters
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - windowHalfX) * 0.08;
        mouseY = (e.clientY - windowHalfY) * 0.08;
    });

    let scrollY = 0;
    let targetScrollY = 0;
    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
    });

    // Resize handler
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        
        // Reposition and rescale torus based on device width
        const mobile = width < 768;
        if (mobile) {
            torusGroup.scale.set(0.6, 0.6, 0.6);
            torusGroup.position.set(0, -18, 45);
        } else {
            torusGroup.scale.set(1, 1, 1);
            torusGroup.position.set(38, 12, 45);
        }
    });

    // Clock
    const clock = new THREE.Clock();

    // Loop
    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Mouse Lerp
        targetX += (mouseX - targetX) * 0.04;
        targetY += (mouseY - targetY) * 0.04;

        // Scroll Lerp
        scrollY += (targetScrollY - scrollY) * 0.07;

        // 1. Morph Wave Grid vertices
        const positionAttr = waveGeometry.attributes.position;
        let pIdx = 0;
        for (let x = 0; x < gridCols; x++) {
            for (let y = 0; y < gridRows; y++) {
                const posX = positionAttr.getX(pIdx);
                const posY = positionAttr.getZ(pIdx);

                // Wave formulation (combines multiple spatial frequencies & time)
                const waveHeight = Math.sin(posX * 0.04 + elapsedTime * 1.2) * 6.5 + 
                                   Math.cos(posY * 0.04 + elapsedTime * 0.9) * 6.5 +
                                   Math.sin((posX + posY) * 0.02 + elapsedTime * 0.6) * 4;

                positionAttr.setY(pIdx, waveHeight);
                pIdx++;
            }
        }
        positionAttr.needsUpdate = true;

        // Rotate wave slightly
        waveParticles.rotation.y = elapsedTime * 0.008;

        // 2. Animate Torus Group (floating + rotating)
        torusGroup.rotation.y = elapsedTime * 0.18 + (targetX * 0.004);
        torusGroup.rotation.x = elapsedTime * 0.1 + (targetY * 0.004);
        torusGroup.position.y = (width < 768 ? -18 : 12) + Math.sin(elapsedTime * 1.5) * 2.5;

        // Adjust camera/scene depth relative to scroll
        scene.position.y = scrollY * 0.035;
        camera.position.z = 130 + scrollY * 0.04;

        // Drift star field
        starField.rotation.y = elapsedTime * -0.003;

        renderer.render(scene, camera);
    }

    animate();
}

/* =========================================================================
   2. ABOUT SECTION: spinning hologram globe
   ========================================================================= */
export function initAboutHologram() {
    const canvas = document.getElementById('about-hologram-canvas');
    if (!canvas) return;

    const parent = canvas.parentElement;
    let size = parent.clientWidth || 200;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 45;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Glow sphere
    const sphereGeom = new THREE.SphereGeometry(15, 24, 24);
    
    // Wireframe Material
    const mat = new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
    });
    const sphere = new THREE.Mesh(sphereGeom, mat);
    scene.add(sphere);

    // Inner glowing core
    const coreGeom = new THREE.SphereGeometry(12, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
        color: 0x9b51e0,
        map: createHologramTexture(),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    scene.add(core);

    // Outer Node Rings
    const ringGeom = new THREE.RingGeometry(18, 18.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
            size = entry.contentRect.width || size;
            renderer.setSize(size, size);
        }
    });
    resizeObserver.observe(parent);

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        // Rotation
        sphere.rotation.y = elapsed * 0.25;
        sphere.rotation.x = elapsed * 0.1;

        core.rotation.y = -elapsed * 0.15;

        ring.rotation.y = elapsed * 0.4;
        
        // Glitch scaling effect
        const scaleVal = 1 + Math.sin(elapsed * 12) * 0.015 * (Math.random() > 0.85 ? 1.5 : 0.2);
        sphere.scale.set(scaleVal, scaleVal, scaleVal);

        renderer.render(scene, camera);
    }
    animate();
}
