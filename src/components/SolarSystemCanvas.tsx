import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Sun, Lightbulb, Sparkles } from 'lucide-react';
import { CELESTIAL_BODIES } from '../data/celestialBodies';
import { CelestialBody, MoonData, LightingSettings } from '../types/solarSystem';
import {
  createSpaceSkybox,
  getCelestialTexture,
  getEarthCloudsTexture,
  getSaturnRingTexture,
  getMoonTexture,
} from '../utils/textureGenerator';
import { audioService } from '../utils/audioService';
import { InteractionDragMode } from './OrbitControlsHUD';

interface SolarSystemCanvasProps {
  selectedBodyId: string | null;
  onSelectBody: (body: CelestialBody) => void;
  onSelectMoon?: (moon: MoonData, parentBody: CelestialBody) => void;
  isPaused: boolean;
  timeSpeed: number;
  orbitalOffset: number; // in degrees
  onOrbitalOffsetChange: (offset: number) => void;
  showOrbits: boolean;
  showLabels: boolean;
  showMoons: boolean;
  showAsteroids: boolean;
  dragMode: InteractionDragMode;
  lightingSettings: LightingSettings;
  onUpdateLightingSettings?: (settings: Partial<LightingSettings>) => void;
  onResetView?: () => void;
}

interface PlanetMeshBundle {
  body: CelestialBody;
  mesh: THREE.Mesh;
  group: THREE.Group; // orbital position container
  spinPivot: THREE.Group; // axial tilt & spin container
  cloudsMesh?: THREE.Mesh;
  ringsMesh?: THREE.Mesh;
  orbitLine?: THREE.Line;
  moonMeshes: { moon: MoonData; mesh: THREE.Mesh; group: THREE.Group }[];
  currentOrbitAngle: number;
}

export const SolarSystemCanvas: React.FC<SolarSystemCanvasProps> = ({
  selectedBodyId,
  onSelectBody,
  onSelectMoon,
  isPaused,
  timeSpeed,
  orbitalOffset,
  onOrbitalOffsetChange,
  showOrbits,
  showLabels,
  showMoons,
  showAsteroids,
  dragMode,
  lightingSettings,
  onUpdateLightingSettings,
  onResetView,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const bundlesRef = useRef<Map<string, PlanetMeshBundle>>(new Map());
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Camera focus / target in world space (allows panning and zooming to any solar system region)
  const overviewLookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const pointerButtonRef = useRef<number>(0);

  // Lights refs for dynamic adjustment
  const sunLightRef = useRef<THREE.PointLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const cameraLightRef = useRef<THREE.DirectionalLight | null>(null);
  const planetFillLightRef = useRef<THREE.PointLight | null>(null);

  // Quick lighting dropdown popup state
  const [showQuickLighting, setShowQuickLighting] = useState(false);

  // Keep a live ref to all incoming props so the animation loop NEVER reads stale closures
  const propsRef = useRef({
    selectedBodyId,
    isPaused,
    timeSpeed,
    orbitalOffset,
    showOrbits,
    showLabels,
    showMoons,
    showAsteroids,
    dragMode,
    lightingSettings,
  });

  useEffect(() => {
    propsRef.current = {
      selectedBodyId,
      isPaused,
      timeSpeed,
      orbitalOffset,
      showOrbits,
      showLabels,
      showMoons,
      showAsteroids,
      dragMode,
      lightingSettings,
    };
  }, [
    selectedBodyId,
    isPaused,
    timeSpeed,
    orbitalOffset,
    showOrbits,
    showLabels,
    showMoons,
    showAsteroids,
    dragMode,
    lightingSettings,
  ]);

  // Screen-space 2D positions for DOM labels
  const [screenLabels, setScreenLabels] = useState<
    { id: string; name: string; x: number; y: number; color: string }[]
  >([]);

  // Dragging states
  const isPointerDownRef = useRef(false);
  const lastPointerPosRef = useRef({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);

  // Global overview camera spherical coords (distance from Sun)
  const overviewSpherical = useRef({
    radius: 260,
    theta: Math.PI / 4,
    phi: Math.PI / 3.4,
  });

  // Focused planet camera relative distance & spherical angle
  const planetZoomFactor = useRef(1.0); // 0.25 (close) to 5.5 (far out)
  const planetSpherical = useRef({
    theta: 0.3,
    phi: Math.PI / 2.8,
  });

  // Camera targets for smooth cinematic lerp
  const cameraTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 120, 240));
  const cameraTargetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraCurrentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Global orbital timeline
  const globalOrbitTimeRef = useRef(0);

  // Track dragging on a specific planet
  const draggedPlanetIdRef = useRef<string | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 4000);
    camera.position.set(0, 120, 240);
    cameraRef.current = camera;
    scene.add(camera); // Essential for camera children (headlight) to transform properly

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Photorealistic Space Skybox
    const skybox = createSpaceSkybox();
    scene.add(skybox);

    // 5. Lighting Setup
    // Warm Sun point light at center
    const sunLight = new THREE.PointLight(0xfffaea, 4.2, 1800, 0.2);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Bright ambient light so shadow sides are vivid and educational for kids
    const ambientLight = new THREE.AmbientLight(0xb5c8e2, 1.6);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Hemisphere light for soft environmental space bounce
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x223344, 1.0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Camera Probe Headlamp: shines forward from camera view, eliminating dark planet view angles
    const cameraLight = new THREE.DirectionalLight(0xffffff, 2.5);
    cameraLight.position.set(0, 0, 1);
    camera.add(cameraLight);
    cameraLightRef.current = cameraLight;

    // Local target fill light for inspected planet/moon
    const planetFillLight = new THREE.PointLight(0xffffff, 1.8, 300, 0.3);
    scene.add(planetFillLight);
    planetFillLightRef.current = planetFillLight;

    // 6. Build Celestial Bodies
    const bundles = new Map<string, PlanetMeshBundle>();

    CELESTIAL_BODIES.forEach((body) => {
      // Orbital group: rotates around Sun (0, 0, 0)
      const orbitGroup = new THREE.Group();
      orbitGroup.name = `orbit_${body.id}`;
      scene.add(orbitGroup);

      // Independent initial orbital phase distributed naturally around orbit
      const initialOrbitAngle =
        body.orbitalRadius > 0
          ? ((body.orderFromSun * 1.85 + (body.orbitalRadius % 6.28)) % (Math.PI * 2))
          : 0;

      if (body.orbitalRadius > 0) {
        orbitGroup.position.set(
          Math.cos(initialOrbitAngle) * body.orbitalRadius,
          0,
          Math.sin(initialOrbitAngle) * body.orbitalRadius
        );
      }

      // Spin pivot: handles axial tilt
      const spinPivot = new THREE.Group();
      spinPivot.rotation.z = (body.axialTilt * Math.PI) / 180;
      orbitGroup.add(spinPivot);

      // Planet Mesh
      const geometry =
        body.id === 'haumea'
          ? new THREE.SphereGeometry(body.radius, 48, 48)
          : new THREE.SphereGeometry(body.radius, 64, 64);

      if (body.id === 'haumea') {
        // Haumea's football shape
        geometry.scale(1.4, 0.9, 0.7);
      }

      const texture = getCelestialTexture(body.id);
      let material: THREE.Material;

      if (body.type === 'star') {
        material = new THREE.MeshBasicMaterial({ map: texture });
      } else {
        material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: body.type.includes('gas') || body.type.includes('ice') ? 0.4 : 0.65,
          metalness: 0.04,
        });
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = body.id;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      spinPivot.add(mesh);

      // Earth Cloud Layer
      let cloudsMesh: THREE.Mesh | undefined;
      if (body.hasClouds) {
        const cloudsGeo = new THREE.SphereGeometry(body.radius * 1.018, 64, 64);
        const cloudsTexture = getEarthCloudsTexture();
        const cloudsMat = new THREE.MeshStandardMaterial({
          map: cloudsTexture,
          transparent: true,
          opacity: 0.85,
          blending: THREE.NormalBlending,
          roughness: 0.9,
        });
        cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
        cloudsMesh.name = `${body.id}_clouds`;
        spinPivot.add(cloudsMesh);
      }

      // Saturn / Uranus Rings
      let ringsMesh: THREE.Mesh | undefined;
      if (body.hasRings && body.ringInnerRadius && body.ringOuterRadius) {
        const ringGeo = new THREE.RingGeometry(
          body.ringInnerRadius,
          body.ringOuterRadius,
          96
        );
        // Align ring to planet equator (plane geometry is XY, so rotate X by 90 deg)
        ringGeo.rotateX(Math.PI / 2);

        const ringTexture = getSaturnRingTexture();
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.92,
          roughness: 0.4,
        });
        ringsMesh = new THREE.Mesh(ringGeo, ringMat);
        ringsMesh.name = `${body.id}_rings`;
        spinPivot.add(ringsMesh);
      }

      // Orbit Line (concentric circles)
      let orbitLine: THREE.Line | undefined;
      if (body.orbitalRadius > 0) {
        const points: THREE.Vector3[] = [];
        const segments = 128;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          points.push(
            new THREE.Vector3(
              Math.cos(theta) * body.orbitalRadius,
              0,
              Math.sin(theta) * body.orbitalRadius
            )
          );
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
        const orbitMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(body.color),
          transparent: true,
          opacity: body.type === 'dwarf-planet' ? 0.28 : 0.42,
          linewidth: 1,
        });
        orbitLine = new THREE.Line(orbitGeo, orbitMat);
        scene.add(orbitLine);
      }

      // Earth Atmosphere Blue Glow
      if (body.id === 'earth') {
        const atmoGeo = new THREE.SphereGeometry(body.radius * 1.026, 64, 64);
        const atmoMat = new THREE.MeshBasicMaterial({
          color: 0x4fa6ff,
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          depthWrite: false,
        });
        const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
        atmoMesh.name = `${body.id}_atmosphere`;
        spinPivot.add(atmoMesh);
      }

      // Moons
      const moonMeshes: { moon: MoonData; mesh: THREE.Mesh; group: THREE.Group }[] = [];
      if (body.moons && body.moons.length > 0) {
        body.moons.forEach((m) => {
          const moonGroup = new THREE.Group();
          orbitGroup.add(moonGroup);

          const isEarthMoon = m.id === 'moon' || m.id === 'luna';
          const moonRadius = isEarthMoon ? 0.9 : m.radius;
          const moonDistance = isEarthMoon ? 7.2 : m.distance;

          const moonGeo = new THREE.SphereGeometry(moonRadius, 48, 48);
          const moonTex = getMoonTexture(m.id);
          const moonMat = new THREE.MeshStandardMaterial({
            map: moonTex,
            roughness: isEarthMoon ? 0.82 : 0.65,
            emissive: isEarthMoon ? new THREE.Color(0x363d4a) : new THREE.Color(0x181c24),
            metalness: 0.02,
          });
          const mMesh = new THREE.Mesh(moonGeo, moonMat);
          mMesh.name = `moon_${m.id}`;
          mMesh.position.set(moonDistance, 0, 0);
          moonGroup.add(mMesh);

          // Subtle moon orbit ring
          const mPoints: THREE.Vector3[] = [];
          for (let i = 0; i <= 64; i++) {
            const th = (i / 64) * Math.PI * 2;
            mPoints.push(new THREE.Vector3(Math.cos(th) * moonDistance, 0, Math.sin(th) * moonDistance));
          }
          const mOrbitGeo = new THREE.BufferGeometry().setFromPoints(mPoints);
          const mOrbitMat = new THREE.LineBasicMaterial({
            color: 0x8899aa,
            transparent: true,
            opacity: 0.25,
          });
          const mOrbitLine = new THREE.Line(mOrbitGeo, mOrbitMat);
          moonGroup.add(mOrbitLine);

          moonMeshes.push({ moon: m, mesh: mMesh, group: moonGroup });
        });
      }

      bundles.set(body.id, {
        body,
        mesh,
        group: orbitGroup,
        spinPivot,
        cloudsMesh,
        ringsMesh,
        orbitLine,
        moonMeshes,
        currentOrbitAngle: initialOrbitAngle,
      });
    });

    bundlesRef.current = bundles;

    // 7. Asteroid Belt Particles (between Mars r=105 and Jupiter r=185)
    const asteroidCount = 1200;
    const asteroidGeo = new THREE.BufferGeometry();
    const asteroidPositions = new Float32Array(asteroidCount * 3);
    const asteroidColors = new Float32Array(asteroidCount * 3);

    for (let i = 0; i < asteroidCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 135 + (Math.random() - 0.5) * 45;
      const height = (Math.random() - 0.5) * 10;

      asteroidPositions[i * 3] = Math.cos(angle) * dist;
      asteroidPositions[i * 3 + 1] = height;
      asteroidPositions[i * 3 + 2] = Math.sin(angle) * dist;

      // Color variation: grey/brown tones
      const c = 0.6 + Math.random() * 0.35;
      asteroidColors[i * 3] = c;
      asteroidColors[i * 3 + 1] = c * 0.9;
      asteroidColors[i * 3 + 2] = c * 0.8;
    }

    asteroidGeo.setAttribute('position', new THREE.BufferAttribute(asteroidPositions, 3));
    asteroidGeo.setAttribute('color', new THREE.BufferAttribute(asteroidColors, 3));

    const asteroidMat = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const asteroidBelt = new THREE.Points(asteroidGeo, asteroidMat);
    scene.add(asteroidBelt);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Trackpad Pinch and Mouse Wheel Zooming - Zooms directly into the area cursor is pointing at
    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current || !container) return;

      const zoomSensitivity = e.ctrlKey ? 0.005 : 0.0018;
      const delta = e.deltaY;
      const factor = Math.exp(delta * zoomSensitivity);

      if (propsRef.current.selectedBodyId) {
        planetZoomFactor.current = Math.min(5.5, Math.max(0.25, planetZoomFactor.current * factor));
      } else {
        const prevRadius = overviewSpherical.current.radius;
        const newRadius = Math.min(950, Math.max(16, prevRadius * factor));
        overviewSpherical.current.radius = newRadius;

        // Smart Zoom to Cursor Area:
        // When zooming in, find where the mouse is pointing on the solar plane
        // and nudge the look-at target towards that position!
        if (factor < 0.999) {
          const rect = container.getBoundingClientRect();
          const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

          const planeY = overviewLookAtTarget.current.y;
          const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
          const hitPoint = new THREE.Vector3();

          if (raycaster.ray.intersectPlane(plane, hitPoint)) {
            hitPoint.clampLength(0, 430);
            const zoomAmount = Math.min(0.42, (1 - factor) * 1.9);
            overviewLookAtTarget.current.lerp(hitPoint, zoomAmount);
          }
        } else if (newRadius > 450) {
          // When zooming far out, gently ease back towards center
          const pullBack = Math.min(0.08, (factor - 1) * 0.4);
          overviewLookAtTarget.current.lerp(new THREE.Vector3(0, 0, 0), pullBack);
        }
      }
    };
    container.addEventListener('wheel', onNativeWheel, { passive: false });

    // Multi-touch gestures for tablets / touch screens
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistRef.current = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDistRef.current !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scale = touchStartDistRef.current / dist;
        touchStartDistRef.current = dist;

        if (propsRef.current.selectedBodyId) {
          planetZoomFactor.current = Math.min(5.5, Math.max(0.25, planetZoomFactor.current * scale));
        } else {
          overviewSpherical.current.radius = Math.min(
            850,
            Math.max(25, overviewSpherical.current.radius * scale)
          );
        }
      }
    };

    const onTouchEnd = () => {
      touchStartDistRef.current = null;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    // 8. Master Animation Loop
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      const currentProps = propsRef.current;
      const {
        isPaused: simPaused,
        timeSpeed: currentSpeed,
        orbitalOffset: liveOrbitalOffset,
        showOrbits: orbitsVis,
        showLabels: labelsVis,
        showMoons: moonsVis,
        showAsteroids: astVis,
        selectedBodyId: activeBodyId,
        lightingSettings: currentLighting,
      } = currentProps;

      // Real-time Dynamic Lighting Adjustment
      const { brightness, lightingMode, probeHeadlight } = currentLighting;
      renderer.toneMappingExposure = Math.max(0.6, brightness * 1.25);

      if (ambientLightRef.current && hemiLightRef.current && cameraLightRef.current && sunLightRef.current) {
        if (lightingMode === 'bright') {
          ambientLightRef.current.color.setHex(0xb5c8e2);
          ambientLightRef.current.intensity = 1.65 * brightness;
          hemiLightRef.current.intensity = 1.1 * brightness;
          cameraLightRef.current.intensity = probeHeadlight ? 2.5 * brightness : 0;
          sunLightRef.current.intensity = 4.2 * brightness;
        } else if (lightingMode === 'balanced') {
          ambientLightRef.current.color.setHex(0x7e8da2);
          ambientLightRef.current.intensity = 1.15 * brightness;
          hemiLightRef.current.intensity = 0.7 * brightness;
          cameraLightRef.current.intensity = probeHeadlight ? 1.6 * brightness : 0;
          sunLightRef.current.intensity = 4.6 * brightness;
        } else {
          // realistic
          ambientLightRef.current.color.setHex(0x303848);
          ambientLightRef.current.intensity = 0.45 * brightness;
          hemiLightRef.current.intensity = 0.25 * brightness;
          cameraLightRef.current.intensity = probeHeadlight ? 0.7 * brightness : 0;
          sunLightRef.current.intensity = 5.2 * brightness;
        }
      }

      // Position planetFillLight if a planet is selected, making sure its surface details are brilliant
      if (activeBodyId && planetFillLightRef.current) {
        const selectedBundle = bundlesRef.current.get(activeBodyId);
        if (selectedBundle) {
          const targetWorldPos = new THREE.Vector3();
          selectedBundle.mesh.getWorldPosition(targetWorldPos);
          const dir = new THREE.Vector3().subVectors(camera.position, targetWorldPos).normalize();
          planetFillLightRef.current.position.copy(targetWorldPos).addScaledVector(dir, selectedBundle.body.radius * 2.2);
          planetFillLightRef.current.intensity = probeHeadlight ? (2.0 * brightness) : (0.6 * brightness);
          planetFillLightRef.current.distance = Math.max(selectedBundle.body.radius * 14, 60);
        }
      } else if (planetFillLightRef.current) {
        planetFillLightRef.current.intensity = 0;
      }

      // Rotate asteroid belt
      if (asteroidBelt) {
        asteroidBelt.visible = astVis;
        if (!simPaused) {
          asteroidBelt.rotation.y += deltaSeconds * currentSpeed * 0.02;
        }
      }

      const manualOffsetRad = (liveOrbitalOffset * Math.PI) / 180;

      // Update Celestial Bodies - All orbits and rotations are completely INDEPENDENT of each other
      const updatedLabels: { id: string; name: string; x: number; y: number; color: string }[] = [];

      bundlesRef.current.forEach((bundle) => {
        const { body, mesh, group, spinPivot, cloudsMesh, orbitLine, moonMeshes } = bundle;

        // Toggle orbit line visibility
        if (orbitLine) {
          orbitLine.visible = orbitsVis;
        }

        // Orbital Motion around Sun - INDEPENDENT FOR EACH PLANET
        if (body.orbitalRadius > 0) {
          if (!simPaused) {
            // Each planet advances independently at its own physical Keplerian orbital speed
            bundle.currentOrbitAngle += deltaSeconds * currentSpeed * (body.orbitalSpeed * 1.5);
          }
          const effectiveAngle = bundle.currentOrbitAngle + manualOffsetRad;
          const px = Math.cos(effectiveAngle) * body.orbitalRadius;
          const pz = Math.sin(effectiveAngle) * body.orbitalRadius;
          group.position.set(px, 0, pz);
        }

        // Axial Rotation on own axis - INDEPENDENT FOR EACH PLANET
        if (!simPaused) {
          mesh.rotation.y += deltaSeconds * currentSpeed * (body.rotationSpeed * 0.8);
          if (cloudsMesh) {
            cloudsMesh.rotation.y += deltaSeconds * currentSpeed * (body.rotationSpeed * 0.95);
          }
        }

        // Moons orbit around planet
        if (moonMeshes.length > 0) {
          moonMeshes.forEach((mm) => {
            mm.group.visible = moonsVis;
            if (!simPaused) {
              mm.group.rotation.y += deltaSeconds * currentSpeed * (mm.moon.orbitalSpeed * 0.5);
              mm.mesh.rotation.y += deltaSeconds * 0.4;
            }
          });
        }

        // Calculate 2D Screen-space labels
        if (labelsVis && container) {
          const worldPos = new THREE.Vector3();
          mesh.getWorldPosition(worldPos);
          worldPos.y += body.radius * 1.25 + 1.2;

          const screenPos = worldPos.clone().project(camera);
          const isBehind = screenPos.z > 1;

          if (!isBehind) {
            const x = ((screenPos.x + 1) * container.clientWidth) / 2;
            const y = ((-screenPos.y + 1) * container.clientHeight) / 2;

            updatedLabels.push({
              id: body.id,
              name: body.name,
              x,
              y,
              color: body.color,
            });
          }
        }
      });

      if (labelsVis) {
        setScreenLabels(updatedLabels);
      } else {
        setScreenLabels([]);
      }

      // Camera Target Positioning & Smooth Lerp
      if (activeBodyId) {
        const selectedBundle = bundlesRef.current.get(activeBodyId);
        if (selectedBundle) {
          const targetWorldPos = new THREE.Vector3();
          selectedBundle.mesh.getWorldPosition(targetWorldPos);

          cameraTargetLookAt.current.copy(targetWorldPos);

          // Distance from planet scaled by zoom factor
          const baseDist = Math.max(selectedBundle.body.radius * 3.6, 12);
          const actualDist = baseDist * planetZoomFactor.current;

          const { theta: pTheta, phi: pPhi } = planetSpherical.current;
          cameraTargetPos.current.set(
            targetWorldPos.x + actualDist * Math.sin(pPhi) * Math.sin(pTheta),
            targetWorldPos.y + actualDist * Math.cos(pPhi),
            targetWorldPos.z + actualDist * Math.sin(pPhi) * Math.cos(pTheta)
          );
        }
      } else {
        // Solar system overview mode with dynamic area focus (not locked to Sun!)
        const { radius, theta, phi } = overviewSpherical.current;
        cameraTargetLookAt.current.copy(overviewLookAtTarget.current);
        cameraTargetPos.current.set(
          overviewLookAtTarget.current.x + radius * Math.sin(phi) * Math.sin(theta),
          overviewLookAtTarget.current.y + radius * Math.cos(phi),
          overviewLookAtTarget.current.z + radius * Math.sin(phi) * Math.cos(theta)
        );
      }

      // Smooth camera interpolation
      camera.position.lerp(cameraTargetPos.current, 0.08);
      cameraCurrentLookAt.current.lerp(cameraTargetLookAt.current, 0.09);
      camera.lookAt(cameraCurrentLookAt.current);

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('wheel', onNativeWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Pointer Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    pointerButtonRef.current = e.button;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

    // Check if dragging on a planet mesh directly (primary left click)
    if (cameraRef.current && sceneRef.current && mountRef.current && e.button === 0) {
      const rect = mountRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const meshes: THREE.Mesh[] = [];
      bundlesRef.current.forEach((b) => meshes.push(b.mesh));

      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        draggedPlanetIdRef.current = intersects[0].object.name;
      } else {
        draggedPlanetIdRef.current = null;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;

    const deltaX = e.clientX - lastPointerPosRef.current.x;
    const deltaY = e.clientY - lastPointerPosRef.current.y;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

    const currentDragMode = propsRef.current.dragMode;
    const activeBodyId = propsRef.current.selectedBodyId;

    // A. Panning Support: Right-click drag, Middle-click drag, Shift+drag, or dragMode === 'pan'
    const isPanning =
      pointerButtonRef.current === 2 ||
      pointerButtonRef.current === 1 ||
      e.shiftKey ||
      currentDragMode === 'pan';

    if (isPanning && !activeBodyId && cameraRef.current) {
      const cam = cameraRef.current;
      const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
      const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
      const panSpeed = (overviewSpherical.current.radius / 600) * 0.65;
      overviewLookAtTarget.current.addScaledVector(camRight, -deltaX * panSpeed);
      overviewLookAtTarget.current.addScaledVector(camUp, deltaY * panSpeed);
      overviewLookAtTarget.current.y = Math.max(-100, Math.min(100, overviewLookAtTarget.current.y));
      return;
    }

    // B. If user chooses "Orbit View" drag mode or drags left/right
    if (currentDragMode === 'orbit') {
      const angleDeltaDeg = deltaX * 0.45;
      const newOffset = ((propsRef.current.orbitalOffset + angleDeltaDeg) % 360 + 360) % 360;
      onOrbitalOffsetChange(newOffset);
      return;
    }

    // C. If a specific planet was grabbed or focused in "spin" mode:
    const targetPlanetId = draggedPlanetIdRef.current || activeBodyId;
    if (targetPlanetId && currentDragMode === 'spin') {
      const bundle = bundlesRef.current.get(targetPlanetId);
      if (bundle) {
        bundle.mesh.rotation.y += deltaX * 0.012;
        if (bundle.cloudsMesh) {
          bundle.cloudsMesh.rotation.y += deltaX * 0.012;
        }

        // Also allow vertical tilt adjustment around the inspected planet
        if (activeBodyId) {
          planetSpherical.current.phi = Math.max(
            0.15,
            Math.min(Math.PI - 0.15, planetSpherical.current.phi - deltaY * 0.008)
          );
        }
        return;
      }
    }

    // D. Default: Rotate Overview Camera Spherical Orbit
    if (activeBodyId) {
      planetSpherical.current.theta -= deltaX * 0.008;
      planetSpherical.current.phi = Math.max(
        0.15,
        Math.min(Math.PI - 0.15, planetSpherical.current.phi - deltaY * 0.008)
      );
    } else {
      overviewSpherical.current.theta -= deltaX * 0.006;
      overviewSpherical.current.phi = Math.max(
        0.15,
        Math.min(Math.PI / 2.05, overviewSpherical.current.phi - deltaY * 0.006)
      );
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    draggedPlanetIdRef.current = null;
    pointerButtonRef.current = 0;
  };

  // Double click anywhere on solar plane to focus that specific area
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!cameraRef.current || !mountRef.current || propsRef.current.selectedBodyId) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -overviewLookAtTarget.current.y);
    const hitPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, hitPoint)) {
      hitPoint.clampLength(0, 430);
      overviewLookAtTarget.current.copy(hitPoint);
      overviewSpherical.current.radius = Math.max(30, overviewSpherical.current.radius * 0.65);
    }
  };

  // Click on Planet to Select
  const handleClick = (e: React.MouseEvent) => {
    if (!cameraRef.current || !mountRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Collect all planet and moon meshes
    const candidates: THREE.Mesh[] = [];
    bundlesRef.current.forEach((b) => {
      candidates.push(b.mesh);
      b.moonMeshes.forEach((mm) => candidates.push(mm.mesh));
    });

    const intersects = raycaster.intersectObjects(candidates, false);

    if (intersects.length > 0) {
      const hitName = intersects[0].object.name;

      if (hitName.startsWith('moon_')) {
        const moonId = hitName.replace('moon_', '');
        // Find parent body
        for (const b of CELESTIAL_BODIES) {
          const m = b.moons?.find((x) => x.id === moonId);
          if (m && onSelectMoon) {
            audioService.playPlanetSelect();
            planetZoomFactor.current = 0.65;
            onSelectMoon(m, b);
            return;
          }
        }
      } else {
        const body = CELESTIAL_BODIES.find((b) => b.id === hitName);
        if (body) {
          audioService.playPlanetSelect();
          planetZoomFactor.current = 1.0;
          onSelectBody(body);
        }
      }
    }
  };

  // Dedicated Zoom Buttons
  const handleZoomIn = () => {
    audioService.playClick();
    if (propsRef.current.selectedBodyId) {
      planetZoomFactor.current = Math.max(0.25, planetZoomFactor.current * 0.75);
    } else {
      overviewSpherical.current.radius = Math.max(25, overviewSpherical.current.radius * 0.75);
    }
  };

  const handleZoomOut = () => {
    audioService.playClick();
    if (propsRef.current.selectedBodyId) {
      planetZoomFactor.current = Math.min(5.5, planetZoomFactor.current * 1.35);
    } else {
      overviewSpherical.current.radius = Math.min(850, overviewSpherical.current.radius * 1.35);
    }
  };

  const handleResetCamera = () => {
    audioService.playClick();
    planetZoomFactor.current = 1.0;
    overviewLookAtTarget.current.set(0, 0, 0);
    overviewSpherical.current = {
      radius: 260,
      theta: Math.PI / 4,
      phi: Math.PI / 3.4,
    };
    if (onResetView) {
      onResetView();
    }
  };

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden bg-black select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 2D Clickable Screen Labels */}
      {propsRef.current.showLabels && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {screenLabels.map((lbl) => (
            <button
              key={lbl.id}
              onClick={(e) => {
                e.stopPropagation();
                const body = CELESTIAL_BODIES.find((b) => b.id === lbl.id);
                if (body) {
                  audioService.playPlanetSelect();
                  planetZoomFactor.current = 1.0;
                  onSelectBody(body);
                }
              }}
              style={{
                transform: `translate(${lbl.x}px, ${lbl.y}px) translate(-50%, -50%)`,
              }}
              className={`absolute pointer-events-auto px-2.5 py-0.5 text-xs font-bold rounded-full border transition-all cursor-pointer shadow-md ${
                selectedBodyId === lbl.id
                  ? 'bg-amber-400 text-black border-amber-300 ring-2 ring-amber-400/50 scale-110'
                  : 'bg-slate-900/85 text-white border-white/20 hover:border-white/60 hover:bg-slate-800 backdrop-blur-xs'
              }`}
            >
              {lbl.name}
            </button>
          ))}
        </div>
      )}

      {/* Floating Zoom & Lighting Controls HUD on Right Side */}
      <div className="absolute right-6 bottom-24 flex flex-col gap-2 z-10 pointer-events-auto">
        <div className="p-1.5 bg-slate-950/85 backdrop-blur-md border border-white/15 rounded-2xl flex flex-col gap-1.5 shadow-xl">
          {/* Quick Lighting Popout Button */}
          <div className="relative">
            {showQuickLighting && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-12 bottom-0 w-64 p-3 bg-slate-950/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col gap-2.5 text-xs select-none z-30 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Planet Lighting</span>
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    {Math.round(lightingSettings.brightness * 100)}%
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Dim</span>
                    <span className="text-white font-medium">Brightness Slider</span>
                    <span>Ultra Bright</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="2.2"
                    step="0.1"
                    value={lightingSettings.brightness}
                    onChange={(e) => {
                      onUpdateLightingSettings?.({ brightness: parseFloat(e.target.value) });
                    }}
                    className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Preset Modes */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Lighting Style</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => onUpdateLightingSettings?.({ lightingMode: 'bright', probeHeadlight: true })}
                      className={`px-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        lightingSettings.lightingMode === 'bright'
                          ? 'bg-amber-400 text-black border-amber-300'
                          : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      Kids Bright
                    </button>
                    <button
                      onClick={() => onUpdateLightingSettings?.({ lightingMode: 'balanced', probeHeadlight: true })}
                      className={`px-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        lightingSettings.lightingMode === 'balanced'
                          ? 'bg-amber-400 text-black border-amber-300'
                          : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      Probe
                    </button>
                    <button
                      onClick={() => onUpdateLightingSettings?.({ lightingMode: 'realistic', probeHeadlight: false })}
                      className={`px-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        lightingSettings.lightingMode === 'realistic'
                          ? 'bg-amber-400 text-black border-amber-300'
                          : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      Realistic
                    </button>
                  </div>
                </div>

                {/* Spacecraft Headlamp toggle */}
                <button
                  onClick={() => {
                    audioService.playClick();
                    onUpdateLightingSettings?.({ probeHeadlight: !lightingSettings.probeHeadlight });
                  }}
                  className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold border flex items-center justify-between transition-all cursor-pointer ${
                    lightingSettings.probeHeadlight
                      ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                      : 'bg-slate-900 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Camera Probe Light</span>
                  </span>
                  <span className="font-mono text-[10px]">{lightingSettings.probeHeadlight ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                audioService.playClick();
                setShowQuickLighting((prev) => !prev);
              }}
              className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center shadow-md transition-all cursor-pointer ${
                showQuickLighting || lightingSettings.brightness > 1.3
                  ? 'bg-amber-400 text-black border-amber-300 shadow-amber-400/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-white/15'
              }`}
              title="Adjust Planet Lighting & Brightness"
              aria-label="Adjust Planet Lighting"
            >
              <Sun className="w-4 h-4" />
              <span className="text-[8px] font-bold font-mono leading-none">
                {Math.round(lightingSettings.brightness * 100)}%
              </span>
            </button>
          </div>

          <div className="w-full h-px bg-white/10 my-0.5" />

          {/* Zoom In */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white border border-white/15 flex items-center justify-center font-extrabold text-xl shadow-md transition-all cursor-pointer hover:border-amber-400/50"
            title="Zoom In (or trackpad pinch / scroll)"
            aria-label="Zoom In"
          >
            +
          </button>
          {/* Zoom Out */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white border border-white/15 flex items-center justify-center font-extrabold text-xl shadow-md transition-all cursor-pointer hover:border-amber-400/50"
            title="Zoom Out (or trackpad pinch / scroll)"
            aria-label="Zoom Out"
          >
            −
          </button>
          {/* Reset View */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetCamera();
            }}
            className="w-10 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white border border-white/15 flex items-center justify-center text-[10px] font-bold shadow-md transition-all cursor-pointer"
            title="Reset Zoom & Camera View"
          >
            Reset
          </button>
        </div>
        <div className="text-[10px] text-center text-slate-400 font-medium bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
          Pinch or click to zoom
        </div>
      </div>
    </div>
  );
};
