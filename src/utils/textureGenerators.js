import * as THREE from 'three';

// Generate procedural carbon fiber texture with realistic twill weave
export function createCarbonTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f1115';
  ctx.fillRect(0, 0, 128, 128);

  for (let i = 0; i < 128; i += 16) {
    for (let j = 0; j < 128; j += 16) {
      const isAlt = ((i / 16 + j / 16) % 2 === 0);
      const grad = ctx.createLinearGradient(i, j, i + 16, j + 16);
      if (isAlt) {
        grad.addColorStop(0, '#22252a');
        grad.addColorStop(0.5, '#3b4049');
        grad.addColorStop(1, '#181a1f');
      } else {
        grad.addColorStop(0, '#16181d');
        grad.addColorStop(0.5, '#22252b');
        grad.addColorStop(1, '#111216');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(i, j, 16, 16);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

// Generate realistic cross-drilled & slotted sport brake rotor texture
export function createBrakeRotorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Radial brushed steel gradient
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  grad.addColorStop(0, '#334155');
  grad.addColorStop(0.3, '#94a3b8');
  grad.addColorStop(0.6, '#cbd5e1');
  grad.addColorStop(0.85, '#94a3b8');
  grad.addColorStop(1, '#475569');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Concentric friction rings
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1;
  for (let r = 40; r < 120; r += 4) {
    ctx.beginPath();
    ctx.arc(128, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Cross-drilled cooling holes
  ctx.fillStyle = '#090d16';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    for (let d = 55; d < 115; d += 18) {
      const x = 128 + Math.cos(a + d * 0.01) * d;
      const y = 128 + Math.sin(a + d * 0.01) * d;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Generate realistic tire sidewall texture with embossed lettering
export function createTireSidewallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep matte black tire rubber
  ctx.fillStyle = '#111215';
  ctx.fillRect(0, 0, 512, 512);

  // Sidewall serrations / grooves
  ctx.strokeStyle = '#1e2126';
  ctx.lineWidth = 2;
  for (let r = 180; r < 240; r += 5) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Embossed performance branding text along circle
  ctx.fillStyle = '#4b5563';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';

  ctx.save();
  ctx.translate(256, 256);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('PILOT SPORT 4S', 0, -210);
  ctx.font = '12px monospace';
  ctx.fillText('285/35 ZR 20 • TUBELESS EXTRA LOAD', 0, 215);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Generate high-tech cockpit dashboard screen texture
export function createDashboardScreenTexture(carName = 'M4 COMPETITION') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Dark OLED cluster background
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, 512, 256);

  // Speedometer circular digital dial
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(130, 130, 80, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('0', 130, 140);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('KM/H', 130, 165);

  // Tachometer / Power meter
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(382, 130, 80, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace';
  ctx.fillText('READY', 382, 140);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#f87171';
  ctx.fillText('SPORT PLUS', 382, 165);

  // Center car badge & navigation graphic
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(carName.toUpperCase().substring(0, 20), 256, 50);

  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.strokeRect(200, 75, 112, 120);
  ctx.fillStyle = '#10b981';
  ctx.font = '12px monospace';
  ctx.fillText('⚡ 100% AWD', 256, 140);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Generate procedural starlight headliner texture
export function createStarlightTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 320);
  grad.addColorStop(0, '#100b20');
  grad.addColorStop(0.5, '#05040a');
  grad.addColorStop(1, '#020204');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 450; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 1.5 + 0.5;
    const alpha = Math.random() * 0.8 + 0.2;

    const isCyan = Math.random() > 0.8;
    const isPurple = Math.random() > 0.85;

    ctx.fillStyle = isCyan
      ? `rgba(56, 189, 248, ${alpha})`
      : isPurple
      ? `rgba(192, 132, 252, ${alpha})`
      : `rgba(255, 255, 255, ${alpha})`;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Generate license plate texture with Ukrainian flag
export function createLicensePlateTexture(text = 'AA 7777 MI') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 64);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 58);

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(6, 6, 36, 26);
  ctx.fillStyle = '#eab308';
  ctx.fillRect(6, 32, 36, 26);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('UA', 24, 46);

  ctx.fillStyle = '#090d16';
  ctx.font = '900 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text.substring(0, 9), 146, 44);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Generate realistic HDR studio environment reflection map
export function createStudioEnvTexture(theme = 'neon') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (theme === 'sunset') {
    // Warm California Sunset Horizon
    const sky = ctx.createLinearGradient(0, 0, 0, 512);
    sky.addColorStop(0, '#1e1b4b');
    sky.addColorStop(0.3, '#701a75');
    sky.addColorStop(0.5, '#ea580c');
    sky.addColorStop(0.55, '#fef08a');
    sky.addColorStop(0.6, '#451a03');
    sky.addColorStop(1, '#0c0a09');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1024, 512);

    // Glowing sunset sun
    const sunGrad = ctx.createRadialGradient(512, 260, 10, 512, 260, 120);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.4, '#fed7aa');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(392, 140, 240, 240);
  } else if (theme === 'studio') {
    // Pure German Luxury Showroom
    const studio = ctx.createLinearGradient(0, 0, 0, 512);
    studio.addColorStop(0, '#ffffff');
    studio.addColorStop(0.2, '#94a3b8');
    studio.addColorStop(0.5, '#1e293b');
    studio.addColorStop(0.8, '#0f172a');
    studio.addColorStop(1, '#020617');
    ctx.fillStyle = studio;
    ctx.fillRect(0, 0, 1024, 512);

    // Twin overhead softboxes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(150, 40, 320, 80);
    ctx.fillRect(554, 40, 320, 80);

    // Side diffuser panels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(30, 200, 60, 140);
    ctx.fillRect(934, 200, 60, 140);
  } else {
    // Tokyo Cyberpunk Studio
    const cyber = ctx.createLinearGradient(0, 0, 0, 512);
    cyber.addColorStop(0, '#090d16');
    cyber.addColorStop(0.4, '#0f172a');
    cyber.addColorStop(0.55, '#020617');
    cyber.addColorStop(1, '#000000');
    ctx.fillStyle = cyber;
    ctx.fillRect(0, 0, 1024, 512);

    // Neon cyan & magenta light banks
    ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
    ctx.fillRect(100, 30, 380, 50);

    ctx.fillStyle = 'rgba(217, 70, 239, 0.9)';
    ctx.fillRect(544, 30, 380, 50);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.fillRect(20, 180, 70, 150);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
    ctx.fillRect(934, 180, 70, 150);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}
