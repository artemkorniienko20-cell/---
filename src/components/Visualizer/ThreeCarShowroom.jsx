import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThreeCarBuilder } from './ThreeCarBuilder';
import { Rotate3d, Sparkles } from 'lucide-react';
import { playClickSound } from '../../utils/audioSynthesizer';

export default function ThreeCarShowroom({
  carConfig,
  showroomTheme = 'neon',
  isRevving = false
}) {
  const mountRef = useRef(null);
  const builderRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const lightsGroupRef = useRef(null);
  const floorRef = useRef(null);

  const [autoRotate, setAutoRotate] = useState(false);
  const [activeCameraView, setActiveCameraView] = useState('frontQuarter');

  // Target camera coordinates for smooth lerping
  const targetCamPos = useRef(new THREE.Vector3(4.2, 1.8, 4.8));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.65, 0));

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x05070e, 0.035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.copy(targetCamPos.current);
    cameraRef.current = camera;

    // 3. Renderer with high-end post-processing tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Keep camera above floor
    controls.minDistance = 1.6;
    controls.maxDistance = 15;
    controls.target.copy(targetLookAt.current);
    controlsRef.current = controls;

    // 5. Studio Lighting
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;
    setupShowroomLighting(lightsGroup, showroomTheme);

    // 6. Polished Mirror Showroom Floor
    const floorGeo = new THREE.CircleGeometry(24, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x05070e,
      roughness: 0.18,
      metalness: 0.88
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    floorRef.current = floor;

    // Contact Ambient Occlusion Shadow Plane directly under car
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext('2d');
    const shadowGrad = sCtx.createRadialGradient(256, 256, 40, 256, 256, 256);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
    shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.6)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = shadowGrad;
    sCtx.fillRect(0, 0, 512, 512);

    const contactShadowTex = new THREE.CanvasTexture(shadowCanvas);
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 5.4),
      new THREE.MeshBasicMaterial({ map: contactShadowTex, transparent: true, opacity: 0.85 })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.01;
    scene.add(contactShadow);

    // Overhead Light Fixture Panel (Reflects across hood & roof)
    const ceilingFixture = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.08, 6.0),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    ceilingFixture.position.set(0, 5.5, 0);
    scene.add(ceilingFixture);

    // 7. Car Builder
    const builder = new ThreeCarBuilder(scene);
    builder.setTheme(showroomTheme);
    builder.buildCar(carConfig);
    builderRef.current = builder;

    // 8. Render & Animation Loop with Smooth Camera Lerp
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera interpolation toward target view
      if (cameraRef.current && controlsRef.current && !controlsRef.current.state === -1) {
        camera.position.lerp(targetCamPos.current, 0.05);
        controls.target.lerp(targetLookAt.current, 0.05);
      }

      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.autoRotateSpeed = 1.4;
        controlsRef.current.update();
      }

      // Car stays perfectly still and stable
      if (builderRef.current) {
        builderRef.current.carGroup.position.y = 0;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Car when configuration changes
  useEffect(() => {
    if (builderRef.current) {
      builderRef.current.buildCar(carConfig);
    }
  }, [
    carConfig.modelId,
    carConfig.roofId,
    carConfig.wheelId,
    carConfig.doorId,
    carConfig.doorsOpen,
    carConfig.headlightsOn,
    carConfig.tintId,
    carConfig.underglowId,
    carConfig.colorHex,
    carConfig.colorFinish,
    carConfig.secondaryColorHex,
    carConfig.licensePlate
  ]);

  // Update lighting & environment map when theme changes
  useEffect(() => {
    if (builderRef.current) {
      builderRef.current.setTheme(showroomTheme);
    }
    if (lightsGroupRef.current) {
      setupShowroomLighting(lightsGroupRef.current, showroomTheme);
    }
    if (floorRef.current) {
      if (showroomTheme === 'studio') {
        floorRef.current.material.color.setHex(0x181e2b);
        floorRef.current.material.roughness = 0.12;
      } else if (showroomTheme === 'sunset') {
        floorRef.current.material.color.setHex(0x1a0f1d);
        floorRef.current.material.roughness = 0.22;
      } else {
        floorRef.current.material.color.setHex(0x05070e);
        floorRef.current.material.roughness = 0.16;
      }
    }
    if (sceneRef.current) {
      sceneRef.current.fog.color.setHex(
        showroomTheme === 'sunset' ? 0x2e1022 : showroomTheme === 'studio' ? 0x0f172a : 0x05070e
      );
    }
  }, [showroomTheme]);

  // Camera preset switcher with smooth lerp
  const setCameraView = (viewName) => {
    playClickSound();
    setActiveCameraView(viewName);

    switch (viewName) {
      case 'frontQuarter':
        targetCamPos.current.set(4.2, 1.8, 4.8);
        targetLookAt.current.set(0, 0.65, 0);
        break;
      case 'side':
        targetCamPos.current.set(-6.2, 1.1, 0);
        targetLookAt.current.set(0, 0.65, 0);
        break;
      case 'front':
        targetCamPos.current.set(0, 1.0, 5.6);
        targetLookAt.current.set(0, 0.55, 0);
        break;
      case 'rear':
        targetCamPos.current.set(0, 1.2, -5.6);
        targetLookAt.current.set(0, 0.55, 0);
        break;
      case 'top':
        targetCamPos.current.set(0.1, 7.8, 0.1);
        targetLookAt.current.set(0, 0.65, 0);
        break;
      case 'interior':
        // Driver's seat looking at steering wheel & windshield
        targetCamPos.current.set(-0.38, 1.25, -0.2);
        targetLookAt.current.set(-0.38, 1.0, 1.2);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-[#05070e] select-none">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Photorealistic 3D Showroom Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/50 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-cyan-300">
            3D ФОТОРЕАЛІСТИЧНИЙ ШОУРУМ
          </span>
        </div>
      </div>

      {/* Top Right: Turntable Auto-rotate */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => {
            playClickSound();
            setAutoRotate(!autoRotate);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
            autoRotate
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] font-black'
              : 'bg-slate-950/85 text-slate-300 border-slate-700 hover:text-white backdrop-blur-md'
          }`}
          title="Подіум, що плавно обертає автомобіль"
        >
          <Rotate3d size={15} />
          {autoRotate ? 'Обертання ON' : 'Авто-обертання 360°'}
        </button>
      </div>

      {/* Bottom Center: Camera Angles Presets Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-slate-800 shadow-xl max-w-[95%] overflow-x-auto">
        <span className="text-[11px] text-slate-500 font-mono px-2 hidden sm:inline">
          Ракурс:
        </span>

        <button
          onClick={() => setCameraView('frontQuarter')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
            activeCameraView === 'frontQuarter'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3/4 Ракурс
        </button>

        <button
          onClick={() => setCameraView('side')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
            activeCameraView === 'side'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Профіль
        </button>

        <button
          onClick={() => setCameraView('front')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
            activeCameraView === 'front'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Спереду
        </button>

        <button
          onClick={() => setCameraView('rear')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
            activeCameraView === 'rear'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Ззаду
        </button>

        <button
          onClick={() => setCameraView('top')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
            activeCameraView === 'top'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Дах / Стеля
        </button>

        <button
          onClick={() => setCameraView('interior')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            activeCameraView === 'interior'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md font-black'
              : 'text-cyan-400 hover:text-white'
          }`}
        >
          <Sparkles size={12} />
          Салон (Руль)
        </button>
      </div>

      {/* Floating 360 Drag Interaction Hint */}
      <div className="absolute bottom-16 right-4 pointer-events-none text-[11px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg hidden md:block">
        🖱️ Затисніть мишку для вільного огляду 360° • Коліщатко для зуму
      </div>
    </div>
  );
}

// Showroom lighting setup helper
function setupShowroomLighting(group, theme) {
  while (group.children.length > 0) {
    group.remove(group.children[0]);
  }

  // 1. Ambient Fill Light
  const ambient = new THREE.AmbientLight(0xffffff, theme === 'studio' ? 1.6 : 1.1);
  group.add(ambient);

  // 2. Main Key Overhead Light (Large Softbox)
  const mainSoftbox = new THREE.DirectionalLight(0xffffff, 3.2);
  mainSoftbox.position.set(0, 9, 1);
  mainSoftbox.castShadow = true;
  mainSoftbox.shadow.mapSize.width = 2048;
  mainSoftbox.shadow.mapSize.height = 2048;
  mainSoftbox.shadow.camera.near = 0.5;
  mainSoftbox.shadow.camera.far = 25;
  mainSoftbox.shadow.camera.left = -5.5;
  mainSoftbox.shadow.camera.right = 5.5;
  mainSoftbox.shadow.camera.top = 5.5;
  mainSoftbox.shadow.camera.bottom = -5.5;
  mainSoftbox.shadow.bias = -0.0004;
  group.add(mainSoftbox);

  // 3. Side Rim Lights for metallic highlights
  if (theme === 'neon') {
    const rimCyan = new THREE.DirectionalLight(0x06b6d4, 2.6);
    rimCyan.position.set(-7, 3.5, -4);
    group.add(rimCyan);

    const rimPurple = new THREE.DirectionalLight(0xc026d3, 2.6);
    rimPurple.position.set(7, 3.5, -4);
    group.add(rimPurple);

    const frontFill = new THREE.DirectionalLight(0x38bdf8, 1.4);
    frontFill.position.set(0, 2.5, 6);
    group.add(frontFill);
  } else if (theme === 'sunset') {
    const rimOrange = new THREE.DirectionalLight(0xf97316, 3.4);
    rimOrange.position.set(-7, 3.5, -3);
    group.add(rimOrange);

    const rimPink = new THREE.DirectionalLight(0xec4899, 2.2);
    rimPink.position.set(7, 2.5, 4);
    group.add(rimPink);
  } else {
    // Pure studio white lights
    const rimLeft = new THREE.DirectionalLight(0xffffff, 2.4);
    rimLeft.position.set(-7, 3.5, -2);
    group.add(rimLeft);

    const rimRight = new THREE.DirectionalLight(0xffffff, 2.4);
    rimRight.position.set(7, 3.5, -2);
    group.add(rimRight);
  }
}
