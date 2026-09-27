import * as THREE from 'three';

// Cache generated textures to avoid regenerating
const textureCache = new Map<string, THREE.Texture>();

// Helper to create an HTML Canvas of specified dimensions
function create2DCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

// Pseudo-random noise helper
function pseudoNoise(x: number, y: number, seed = 42): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

// Smooth noise generator for planetary bands and terrain
function smoothNoise(x: number, y: number, scale = 10, seed = 42): number {
  const sx = x * scale;
  const sy = y * scale;
  const x0 = Math.floor(sx);
  const x1 = x0 + 1;
  const y0 = Math.floor(sy);
  const y1 = y0 + 1;

  const dx = sx - x0;
  const dy = sy - y0;

  // Cosine interpolation
  const fx = (1 - Math.cos(dx * Math.PI)) * 0.5;
  const fy = (1 - Math.cos(dy * Math.PI)) * 0.5;

  const n00 = pseudoNoise(x0, y0, seed);
  const n10 = pseudoNoise(x1, y0, seed);
  const n01 = pseudoNoise(x0, y1, seed);
  const n11 = pseudoNoise(x1, y1, seed);

  const top = n00 * (1 - fx) + n10 * fx;
  const bot = n01 * (1 - fx) + n11 * fx;

  return top * (1 - fy) + bot * fy;
}

// Fractional Brownian Motion for natural planetary continents and clouds
function fbm(x: number, y: number, octaves = 4, seed = 42): number {
  let val = 0;
  let freq = 1;
  let amp = 0.5;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    val += smoothNoise(x * freq, y * freq, 8, seed + i * 17) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val / max;
}

// ==================== 1. EARTH TEXTURE ====================
// Realistic map with recognizable continents, oceans, deserts, ice caps
export function getEarthTexture(): THREE.Texture {
  if (textureCache.has('earth')) return textureCache.get('earth')!;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = create2DCanvas(width, height);

  // 1. Ocean base gradient (deep ocean to coastal waters)
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#103758');
  oceanGrad.addColorStop(0.5, '#0E4975');
  oceanGrad.addColorStop(1, '#0C2D4A');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ocean bathymetry / currents
  ctx.fillStyle = 'rgba(28, 100, 160, 0.15)';
  for (let y = 0; y < height; y += 4) {
    const shift = Math.sin(y * 0.05) * 20;
    ctx.fillRect(shift, y, width, 2);
  }

  // Helper to map longitude/latitude (-180..180, -90..90) to canvas (x, y)
  const toXY = (lon: number, lat: number) => ({
    x: ((lon + 180) / 360) * width,
    y: ((90 - lat) / 180) * height,
  });

  // Helper to draw realistic landmass
  const drawLandmass = (
    coords: [number, number][],
    fillColor: string,
    strokeColor: string,
    vegetationColor?: string,
    desertColor?: string,
    desertBounds?: [number, number, number, number] // [minLon, maxLon, minLat, maxLat]
  ) => {
    ctx.beginPath();
    const start = toXY(coords[0][0], coords[0][1]);
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < coords.length; i++) {
      const p = toXY(coords[i][0], coords[i][1]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();

    // Shallow continental shelf glow
    ctx.strokeStyle = '#2BB5D8';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = fillColor;
    ctx.fill();

    // Land border
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Vegetated interior
    if (vegetationColor) {
      ctx.save();
      ctx.clip();
      ctx.fillStyle = vegetationColor;
      for (let i = 0; i < coords.length; i += 2) {
        const p = toXY(coords[i][0], coords[i][1]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Desert regions (e.g. Sahara, Australian outback, Gobi)
    if (desertColor && desertBounds) {
      ctx.save();
      ctx.clip();
      const p1 = toXY(desertBounds[0], desertBounds[3]);
      const p2 = toXY(desertBounds[1], desertBounds[2]);
      const dGrad = ctx.createRadialGradient(
        (p1.x + p2.x) / 2, (p1.y + p2.y) / 2, 5,
        (p1.x + p2.x) / 2, (p1.y + p2.y) / 2, Math.abs(p2.x - p1.x) / 2
      );
      dGrad.addColorStop(0, desertColor);
      dGrad.addColorStop(0.8, 'rgba(194, 154, 88, 0.7)');
      dGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = dGrad;
      ctx.fillRect(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y));
      ctx.restore();
    }
  };

  // 1. North America
  drawLandmass([
    [-168, 65], [-160, 71], [-130, 70], [-95, 74], [-82, 60], [-60, 52],
    [-65, 44], [-75, 35], [-81, 25], [-85, 20], [-98, 19], [-105, 23],
    [-118, 32], [-124, 48], [-135, 58], [-168, 65]
  ], '#3F6E36', '#264821', '#2C5A24', '#D4B26F', [-115, -100, 25, 40]);

  // Greenland
  drawLandmass([
    [-55, 60], [-40, 60], [-20, 70], [-25, 82], [-50, 83], [-55, 75], [-55, 60]
  ], '#E2ECF5', '#CAD8E6');

  // 2. South America
  drawLandmass([
    [-77, 8], [-60, 10], [-48, 0], [-35, -5], [-37, -15], [-45, -23],
    [-55, -35], [-68, -55], [-75, -50], [-72, -38], [-80, -5], [-77, 8]
  ], '#2E6930', '#1C451E', '#1B5320', '#C29B58', [-70, -65, -30, -18]);

  // 3. Africa
  drawLandmass([
    [-17, 32], [-5, 36], [10, 37], [25, 32], [32, 31], [43, 12], [51, 12],
    [41, -5], [35, -25], [20, -35], [17, -33], [12, -15], [9, 4],
    [-5, 5], [-15, 12], [-17, 22], [-17, 32]
  ], '#2E6130', '#1F4221', '#205124', '#DEB86B', [-15, 35, 15, 32]);

  // 4. Eurasia (Europe & Asia)
  drawLandmass([
    [-9, 36], [-9, 43], [2, 51], [8, 55], [10, 60], [25, 71], [40, 68],
    [70, 73], [105, 77], [140, 75], [170, 68], [145, 45], [130, 32],
    [120, 22], [108, 13], [100, 3], [80, 8], [75, 20], [68, 25],
    [50, 25], [44, 15], [35, 30], [28, 41], [15, 40], [0, 44], [-9, 36]
  ], '#3B6834', '#264A20', '#2C5A26', '#D6B475', [40, 90, 20, 42]);

  // 5. Australia
  drawLandmass([
    [114, -22], [125, -15], [135, -12], [142, -11], [153, -28], [150, -37],
    [138, -35], [130, -32], [115, -34], [113, -25], [114, -22]
  ], '#B58750', '#8F6636', '#3D6B35', '#C97A3E', [120, 140, -30, -18]);

  // 6. Antarctica
  ctx.beginPath();
  const antStart = toXY(-180, -70);
  ctx.moveTo(antStart.x, antStart.y);
  for (let lon = -180; lon <= 180; lon += 10) {
    const lat = -70 - Math.sin(lon * 0.05) * 8 - (pseudoNoise(lon, 88) * 4);
    const p = toXY(lon, lat);
    ctx.lineTo(p.x, p.y);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = '#E8F1F8';
  ctx.fill();

  // Arctic ice cap
  ctx.beginPath();
  const arcStart = toXY(-180, 80);
  ctx.moveTo(arcStart.x, arcStart.y);
  for (let lon = -180; lon <= 180; lon += 15) {
    const lat = 82 + Math.sin(lon * 0.08) * 4;
    const p = toXY(lon, lat);
    ctx.lineTo(p.x, p.y);
  }
  ctx.lineTo(width, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fillStyle = '#EEF5FB';
  ctx.fill();

  // Fine terrain textures using FBM noise overlay
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // If it's land (not deep blue)
      if (data[idx] > 40 || data[idx + 1] > 70) {
        const n = fbm(x / width, y / height, 3, 101);
        const factor = 0.85 + n * 0.3;
        data[idx] = Math.min(255, data[idx] * factor);
        data[idx + 1] = Math.min(255, data[idx + 1] * factor);
        data[idx + 2] = Math.min(255, data[idx + 2] * factor);
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('earth', texture);
  return texture;
}

// ==================== 2. EARTH CLOUD TEXTURE ====================
export function getEarthCloudsTexture(): THREE.Texture {
  if (textureCache.has('earth_clouds')) return textureCache.get('earth_clouds')!;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = create2DCanvas(width, height);

  ctx.clearRect(0, 0, width, height);
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    // Cloud density bands (higher at equator and mid-latitudes)
    const latWeight = Math.sin(ny * Math.PI) * 0.7 + Math.sin(ny * Math.PI * 3) * 0.3;

    for (let x = 0; x < width; x++) {
      const nx = x / width;
      // Swirling vortices and cloud fronts
      const swirl = Math.sin(ny * 8 + nx * 6) * 0.05;
      const cloudNoise = fbm(nx + swirl, ny, 4, 77);

      if (cloudNoise > 0.52) {
        const intensity = Math.min(1, (cloudNoise - 0.52) * 3.5 * latWeight);
        const idx = (y * width + x) * 4;
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = Math.floor(intensity * 210); // Alpha transparency
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('earth_clouds', texture);
  return texture;
}

// ==================== 3. SUN TEXTURE ====================
export function getSunTexture(): THREE.Texture {
  if (textureCache.has('sun')) return textureCache.get('sun')!;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = create2DCanvas(width, height);

  // Boiling convective plasma cells & solar granules
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const plasma = fbm(nx * 3, ny * 3, 4, 303);
      const detail = fbm(nx * 12, ny * 12, 3, 404);
      const val = plasma * 0.7 + detail * 0.3;

      const idx = (y * width + x) * 4;
      // Brilliant golden orange to white-hot
      data[idx] = 255; // R
      data[idx + 1] = Math.floor(150 + val * 105); // G: 150..255
      data[idx + 2] = Math.floor(val * 90); // B: 0..90
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Add solar magnetic sunspots with dark umbra & penumbra
  const sunspots = [
    { x: width * 0.35, y: height * 0.42, r: 16 },
    { x: width * 0.38, y: height * 0.45, r: 9 },
    { x: width * 0.68, y: height * 0.58, r: 20 },
    { x: width * 0.72, y: height * 0.55, r: 12 },
    { x: width * 0.15, y: height * 0.52, r: 14 },
  ];

  for (const s of sunspots) {
    // Penumbra (brownish orange)
    const penGrad = ctx.createRadialGradient(s.x, s.y, s.r * 0.2, s.x, s.y, s.r);
    penGrad.addColorStop(0, '#5A1E04');
    penGrad.addColorStop(0.7, '#A84B05');
    penGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = penGrad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();

    // Umbra (dark center)
    ctx.fillStyle = '#260B02';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('sun', texture);
  return texture;
}

// ==================== 4. JUPITER TEXTURE ====================
export function getJupiterTexture(): THREE.Texture {
  if (textureCache.has('jupiter')) return textureCache.get('jupiter')!;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = create2DCanvas(width, height);

  // Jupiter cloud belts and zones
  const bands = [
    { y: 0.05, color: '#CDB194' }, // North Polar
    { y: 0.15, color: '#9E6746' }, // NNTB
    { y: 0.25, color: '#DFCCA8' }, // NTrZ
    { y: 0.35, color: '#884D2B' }, // NEB (North Equatorial Belt)
    { y: 0.48, color: '#EBE0CA' }, // EZ (Equatorial Zone)
    { y: 0.60, color: '#7E3F1F' }, // SEB (South Equatorial Belt)
    { y: 0.72, color: '#D5BE9E' }, // STrZ
    { y: 0.85, color: '#9C6947' }, // SSTB
    { y: 0.95, color: '#BCA488' }, // South Polar
  ];

  // Draw base bands with wavy transitions
  for (let y = 0; y < height; y++) {
    const ny = y / height;
    // Find closest bands and interpolate
    let bandColor = '#CDB194';
    for (let i = 0; i < bands.length - 1; i++) {
      if (ny >= bands[i].y && ny <= bands[i + 1].y) {
        const t = (ny - bands[i].y) / (bands[i + 1].y - bands[i].y);
        bandColor = t < 0.5 ? bands[i].color : bands[i + 1].color;
        break;
      }
    }
    ctx.fillStyle = bandColor;
    ctx.fillRect(0, y, width, 1);
  }

  // Add shear vortices and turbulence along belt edges
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      // Wavy shear turbulence
      const turb = Math.sin(nx * 30 + ny * 20) * 0.15 + fbm(nx * 6, ny * 4, 3, 88) * 0.25;
      const idx = (y * width + x) * 4;
      const factor = 0.88 + turb * 0.25;
      data[idx] = Math.min(255, data[idx] * factor);
      data[idx + 1] = Math.min(255, data[idx + 1] * factor);
      data[idx + 2] = Math.min(255, data[idx + 2] * factor);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // The Iconic Great Red Spot (in the South Equatorial Belt ~62% down)
  const grsX = width * 0.62;
  const grsY = height * 0.65;
  const grsW = 60;
  const grsH = 34;

  ctx.save();
  ctx.translate(grsX, grsY);
  ctx.rotate(-0.06);

  // Storm halo turbulence
  const haloGrad = ctx.createRadialGradient(0, 0, grsH * 0.3, 0, 0, grsW);
  haloGrad.addColorStop(0, '#B83216');
  haloGrad.addColorStop(0.5, '#D64E24');
  haloGrad.addColorStop(0.8, '#DF7D52');
  haloGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, grsW, grsH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner core swirl
  ctx.fillStyle = '#8F1E0B';
  ctx.beginPath();
  ctx.ellipse(0, 0, grsW * 0.55, grsH * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // White inner vortex ring
  ctx.strokeStyle = '#F0D4C5';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, grsW * 0.35, grsH * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('jupiter', texture);
  return texture;
}

// ==================== 5. MARS TEXTURE ====================
export function getMarsTexture(): THREE.Texture {
  if (textureCache.has('mars')) return textureCache.get('mars')!;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = create2DCanvas(width, height);

  // Rusty red/orange base
  const marsGrad = ctx.createLinearGradient(0, 0, 0, height);
  marsGrad.addColorStop(0, '#B85228');
  marsGrad.addColorStop(0.5, '#C65624');
  marsGrad.addColorStop(1, '#9B3F1B');
  ctx.fillStyle = marsGrad;
  ctx.fillRect(0, 0, width, height);

  // Dark volcanic plains (Syrtis Major, Acidalia Planitia)
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const n = fbm(nx * 4, ny * 3, 4, 555);
      const craterNoise = smoothNoise(nx * 30, ny * 30, 4, 12);
      const isDarkRegion = n < 0.42;

      const idx = (y * width + x) * 4;
      if (isDarkRegion) {
        // Dark volcanic basalt
        data[idx] = Math.floor(data[idx] * 0.6);
        data[idx + 1] = Math.floor(data[idx + 1] * 0.5);
        data[idx + 2] = Math.floor(data[idx + 2] * 0.45);
      } else {
        // Rust dust variations
        data[idx] = Math.min(255, data[idx] + Math.floor(n * 25));
        data[idx + 1] = Math.min(255, data[idx + 1] + Math.floor(n * 15));
      }
      // Crater craters highlights
      if (craterNoise > 0.88) {
        data[idx] = Math.min(255, data[idx] + 30);
        data[idx + 1] = Math.min(255, data[idx + 1] + 20);
        data[idx + 2] = Math.min(255, data[idx + 2] + 20);
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Valles Marineris canyon (giant canyon rift near equator)
  ctx.strokeStyle = '#4A1D0B';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(width * 0.38, height * 0.54);
  ctx.bezierCurveTo(
    width * 0.45, height * 0.52,
    width * 0.52, height * 0.56,
    width * 0.58, height * 0.53
  );
  ctx.stroke();

  // Olympus Mons volcano caldera & shield
  const omX = width * 0.28;
  const omY = height * 0.44;
  const omGrad = ctx.createRadialGradient(omX, omY, 4, omX, omY, 26);
  omGrad.addColorStop(0, '#562512');
  omGrad.addColorStop(0.3, '#E08055');
  omGrad.addColorStop(0.7, '#A84820');
  omGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = omGrad;
  ctx.beginPath();
  ctx.arc(omX, omY, 26, 0, Math.PI * 2);
  ctx.fill();

  // White polar ice caps (North & South)
  // North polar cap
  const northGrad = ctx.createLinearGradient(0, 0, 0, height * 0.12);
  northGrad.addColorStop(0, '#F5FBFF');
  northGrad.addColorStop(0.7, '#DCEBF5');
  northGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = northGrad;
  ctx.fillRect(0, 0, width, height * 0.12);

  // South polar cap
  const southGrad = ctx.createLinearGradient(0, height * 0.88, 0, height);
  southGrad.addColorStop(0, 'transparent');
  southGrad.addColorStop(0.4, '#DCEBF5');
  southGrad.addColorStop(1, '#F5FBFF');
  ctx.fillStyle = southGrad;
  ctx.fillRect(0, height * 0.88, width, height * 0.12);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('mars', texture);
  return texture;
}

// ==================== 6. SATURN TEXTURE & RINGS ====================
export function getSaturnTexture(): THREE.Texture {
  if (textureCache.has('saturn')) return textureCache.get('saturn')!;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = create2DCanvas(width, height);

  // Golden ochre / creamy pastel bands
  const bands = [
    { y: 0.05, color: '#7E8B82' }, // North Polar Hexagon area
    { y: 0.18, color: '#C8B08A' },
    { y: 0.32, color: '#DECB9F' },
    { y: 0.45, color: '#E8DDBB' }, // Equatorial bright
    { y: 0.58, color: '#DECB9F' },
    { y: 0.72, color: '#C8AF87' },
    { y: 0.88, color: '#A6967A' },
    { y: 0.98, color: '#74776E' },
  ];

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    let color = '#DECB9F';
    for (let i = 0; i < bands.length - 1; i++) {
      if (ny >= bands[i].y && ny <= bands[i + 1].y) {
        color = bands[i].color;
        break;
      }
    }
    ctx.fillStyle = color;
    ctx.fillRect(0, y, width, 1);
  }

  // Subtle atmospheric noise
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const n = smoothNoise(x / 30, y / 10, 2, 77);
      const idx = (y * width + x) * 4;
      const factor = 0.95 + n * 0.1;
      data[idx] = Math.min(255, data[idx] * factor);
      data[idx + 1] = Math.min(255, data[idx + 1] * factor);
      data[idx + 2] = Math.min(255, data[idx + 2] * factor);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('saturn', texture);
  return texture;
}

// Photorealistic Saturn Rings Radial Texture with Cassini Division and alpha transparency
export function getSaturnRingTexture(): THREE.Texture {
  if (textureCache.has('saturn_rings')) return textureCache.get('saturn_rings')!;

  const width = 1024;
  const height = 64;
  const { canvas, ctx } = create2DCanvas(width, height);

  ctx.clearRect(0, 0, width, height);

  // Gradient across radius (from inner D-ring to outer F-ring)
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0.00, 'rgba(0, 0, 0, 0)'); // Inner gap
  grad.addColorStop(0.08, 'rgba(120, 100, 75, 0.25)'); // D Ring
  grad.addColorStop(0.20, 'rgba(170, 145, 115, 0.6)'); // C Ring
  grad.addColorStop(0.35, 'rgba(235, 215, 180, 0.95)'); // B Ring (Brightest, dense)
  grad.addColorStop(0.62, 'rgba(220, 200, 165, 0.92)'); // B Ring outer
  grad.addColorStop(0.63, 'rgba(0, 0, 0, 0.05)'); // Cassini Division! (Sharp dark gap)
  grad.addColorStop(0.69, 'rgba(0, 0, 0, 0.05)');
  grad.addColorStop(0.70, 'rgba(205, 185, 150, 0.85)'); // A Ring
  grad.addColorStop(0.88, 'rgba(180, 160, 130, 0.7)'); // Encke Gap area
  grad.addColorStop(0.89, 'rgba(10, 10, 10, 0.1)'); // Encke gap
  grad.addColorStop(0.91, 'rgba(185, 165, 135, 0.75)');
  grad.addColorStop(0.98, 'rgba(150, 130, 105, 0.3)'); // F Ring
  grad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Fine concentric ringlets using 1D noise lines
  for (let x = 0; x < width; x++) {
    if (Math.random() < 0.25) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(x, 0, 1, height);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('saturn_rings', texture);
  return texture;
}

// ==================== 7. MERCURY TEXTURE ====================
export function getMercuryTexture(): THREE.Texture {
  if (textureCache.has('mercury')) return textureCache.get('mercury')!;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = create2DCanvas(width, height);

  ctx.fillStyle = '#6E6B68';
  ctx.fillRect(0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Heavily cratered lunar-like gray terrain
  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const base = fbm(nx * 5, ny * 5, 4, 101);
      const crater = smoothNoise(nx * 25, ny * 25, 4, 99);
      const idx = (y * width + x) * 4;

      const val = 90 + base * 70 + (crater > 0.85 ? 40 : 0);
      data[idx] = val;
      data[idx + 1] = val * 0.98;
      data[idx + 2] = val * 0.96;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Draw distinct impact crater rays (Caloris Basin style)
  for (let i = 0; i < 24; i++) {
    const cx = pseudoNoise(i, 1) * width;
    const cy = pseudoNoise(i, 2) * height;
    const r = 5 + pseudoNoise(i, 3) * 16;

    // Dark crater bowl
    ctx.fillStyle = '#423F3C';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Bright crater rim
    ctx.strokeStyle = '#B3B0AD';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ejecta rays
    ctx.strokeStyle = 'rgba(210, 205, 200, 0.4)';
    ctx.lineWidth = 1;
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2 + (pseudoNoise(i, a) - 0.5);
      const rayLen = r * (2 + pseudoNoise(i + a, 4) * 4);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('mercury', texture);
  return texture;
}

// ==================== 8. VENUS TEXTURE ====================
export function getVenusTexture(): THREE.Texture {
  if (textureCache.has('venus')) return textureCache.get('venus')!;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = create2DCanvas(width, height);

  // Swirling creamy sulfuric acid clouds
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      // V-shaped global cloud chevron
      const chevron = Math.abs(ny - 0.5) * 1.5;
      const swirl = fbm(nx * 3 + chevron, ny * 2, 4, 333);
      const idx = (y * width + x) * 4;

      // Creamy butterscotch to pale yellow
      data[idx] = Math.floor(220 + swirl * 35); // R
      data[idx + 1] = Math.floor(190 + swirl * 40); // G
      data[idx + 2] = Math.floor(120 + swirl * 45); // B
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('venus', texture);
  return texture;
}

// ==================== 9. URANUS TEXTURE ====================
export function getUranusTexture(): THREE.Texture {
  if (textureCache.has('uranus')) return textureCache.get('uranus')!;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = create2DCanvas(width, height);

  // Soft aquamarine cyan ice giant with gentle bands
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#5EC6DE');
  grad.addColorStop(0.3, '#78D9ED');
  grad.addColorStop(0.5, '#8CE5F5');
  grad.addColorStop(0.7, '#78D9ED');
  grad.addColorStop(1, '#5EC6DE');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Soft atmospheric banding
  for (let y = 0; y < height; y += 8) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.04 + Math.sin(y * 0.1) * 0.03})`;
    ctx.fillRect(0, y, width, 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('uranus', texture);
  return texture;
}

// ==================== 10. NEPTUNE TEXTURE ====================
export function getNeptuneTexture(): THREE.Texture {
  if (textureCache.has('neptune')) return textureCache.get('neptune')!;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = create2DCanvas(width, height);

  // Deep azure cobalt blue
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#1531A6');
  grad.addColorStop(0.3, '#2149C9');
  grad.addColorStop(0.5, '#2B57E5');
  grad.addColorStop(0.7, '#2149C9');
  grad.addColorStop(1, '#1531A6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Atmospheric bands and turbulence
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const n = fbm(x / 100, y / 50, 3, 444);
      const idx = (y * width + x) * 4;
      const factor = 0.9 + n * 0.2;
      data[idx] = Math.min(255, data[idx] * factor);
      data[idx + 1] = Math.min(255, data[idx + 1] * factor);
      data[idx + 2] = Math.min(255, data[idx + 2] * factor);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Great Dark Spot (oval storm)
  const spotX = width * 0.45;
  const spotY = height * 0.42;
  const spotGrad = ctx.createRadialGradient(spotX, spotY, 5, spotX, spotY, 35);
  spotGrad.addColorStop(0, '#0D1E6B');
  spotGrad.addColorStop(0.7, '#152C8F');
  spotGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = spotGrad;
  ctx.beginPath();
  ctx.ellipse(spotX, spotY, 40, 22, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // High altitude bright white methane cirrus cloud streaks
  ctx.strokeStyle = 'rgba(235, 245, 255, 0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(spotX - 45, spotY + 16);
  ctx.lineTo(spotX + 50, spotY + 20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width * 0.7, height * 0.65);
  ctx.lineTo(width * 0.85, height * 0.67);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('neptune', texture);
  return texture;
}

// ==================== 11. PLUTO TEXTURE ====================
export function getPlutoTexture(): THREE.Texture {
  if (textureCache.has('pluto')) return textureCache.get('pluto')!;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = create2DCanvas(width, height);

  // Reddish-tan tholins base terrain
  ctx.fillStyle = '#9C7A5E';
  ctx.fillRect(0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const n = fbm(x / 80, y / 80, 4, 912);
      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, data[idx] * (0.8 + n * 0.4));
      data[idx + 1] = Math.min(255, data[idx + 1] * (0.75 + n * 0.4));
      data[idx + 2] = Math.min(255, data[idx + 2] * (0.7 + n * 0.4));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Dark equatorial belt (Cthulhu Macula)
  ctx.fillStyle = 'rgba(56, 30, 18, 0.75)';
  ctx.fillRect(width * 0.1, height * 0.45, width * 0.35, height * 0.22);

  // Famous Heart-Shaped Glacier: Tombaugh Regio / Sputnik Planitia
  const hX = width * 0.58;
  const hY = height * 0.48;
  ctx.save();
  ctx.translate(hX, hY);

  // Left lobe (Sputnik Planitia - bright nitrogen ice plain)
  const lobeGrad = ctx.createRadialGradient(-20, -10, 5, -20, -10, 45);
  lobeGrad.addColorStop(0, '#FFFFFF');
  lobeGrad.addColorStop(0.7, '#F2E8DC');
  lobeGrad.addColorStop(1, 'rgba(235, 220, 205, 0.4)');
  ctx.fillStyle = lobeGrad;
  ctx.beginPath();
  ctx.arc(-20, -10, 36, 0, Math.PI * 2);
  ctx.fill();

  // Right lobe
  ctx.beginPath();
  ctx.arc(22, -10, 32, 0, Math.PI * 2);
  ctx.fill();

  // Heart bottom point
  ctx.beginPath();
  ctx.moveTo(-45, -5);
  ctx.lineTo(0, 45);
  ctx.lineTo(45, -5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('pluto', texture);
  return texture;
}

// ==================== 12. DWARF PLANET TEXTURES (Ceres, Eris, Haumea, Makemake) ====================
export function getDwarfPlanetTexture(type: 'ceres' | 'eris' | 'haumea' | 'makemake'): THREE.Texture {
  if (textureCache.has(type)) return textureCache.get(type)!;

  const width = 512;
  const height = 256;
  const { canvas, ctx } = create2DCanvas(width, height);

  if (type === 'ceres') {
    // Dark gray carbonaceous rock with bright Occator crater spots
    ctx.fillStyle = '#5A5652';
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 30; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      ctx.fillStyle = 'rgba(40, 38, 35, 0.5)';
      ctx.beginPath();
      ctx.arc(cx, cy, 3 + Math.random() * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Bright white spot (Occator Crater)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(width * 0.45, height * 0.5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(width * 0.45, height * 0.5, 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'eris') {
    // Dazzling pure white/pale ice frost
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#EAE9F2');
    grad.addColorStop(0.5, '#F8F8FC');
    grad.addColorStop(1, '#E2E1EC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (type === 'haumea') {
    // Crystalline ice with dark reddish spot
    ctx.fillStyle = '#CED8E2';
    ctx.fillRect(0, 0, width, height);
    // Dark reddish mineral patch
    ctx.fillStyle = 'rgba(180, 85, 60, 0.4)';
    ctx.beginPath();
    ctx.ellipse(width * 0.6, height * 0.5, 30, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'makemake') {
    // Reddish frozen methane frost
    ctx.fillStyle = '#B86548';
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = 'rgba(235, 150, 120, 0.25)';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 15 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(type, texture);
  return texture;
}

// ==================== 13. REALISTIC EARTH MOON (LUNA) TEXTURE ====================
export function getEarthMoonTexture(): THREE.Texture {
  if (textureCache.has('earth_moon_luna')) return textureCache.get('earth_moon_luna')!;

  const width = 1024;
  const height = 512;
  const { canvas, ctx } = create2DCanvas(width, height);

  // 1. Base Luminous Pearl/Silver Lunar Regolith (bright, natural, glowing)
  const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
  baseGrad.addColorStop(0, '#F8FAFC');
  baseGrad.addColorStop(0.5, '#EEF2F6');
  baseGrad.addColorStop(1, '#F8FAFC');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // Surface fine regolith micro-craters & highlands noise
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const n1 = fbm(x / 30, y / 30, 4, 119);
      const n2 = smoothNoise(x / 6, y / 6, 6, 228);
      // Keep values very bright: 0.92 to 1.15 multiplier
      const val = 0.93 + n1 * 0.18 + n2 * 0.08;
      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, Math.floor(data[idx] * val));
      data[idx + 1] = Math.min(255, Math.floor(data[idx + 1] * val));
      data[idx + 2] = Math.min(255, Math.floor(data[idx + 2] * val));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // 2. Realistic Lunar Maria (Nearside Basaltic Plains) in soft, elegant slate-gray
  const drawMare = (cx: number, cy: number, rx: number, ry: number, color = 'rgba(110, 120, 138, 0.48)') => {
    const mareGrad = ctx.createRadialGradient(cx, cy, rx * 0.1, cx, cy, rx);
    mareGrad.addColorStop(0, color);
    mareGrad.addColorStop(0.7, 'rgba(135, 145, 162, 0.32)');
    mareGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = mareGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, Math.random() * 0.3 - 0.15, 0, Math.PI * 2);
    ctx.fill();
  };

  // Nearside Lunar Maria (positioned accurately relative to standard lunar projection)
  // Oceanus Procellarum (Ocean of Storms)
  drawMare(width * 0.35, height * 0.42, 105, 120, 'rgba(105, 116, 134, 0.52)');
  drawMare(width * 0.32, height * 0.54, 75, 90, 'rgba(112, 122, 140, 0.46)');
  // Mare Imbrium (Sea of Rains)
  drawMare(width * 0.43, height * 0.33, 70, 64, 'rgba(100, 110, 128, 0.55)');
  // Mare Serenitatis & Mare Tranquillitatis (Apollo 11 landing site!)
  drawMare(width * 0.53, height * 0.38, 52, 48, 'rgba(108, 118, 136, 0.52)');
  drawMare(width * 0.57, height * 0.48, 58, 54, 'rgba(104, 114, 132, 0.56)');
  // Mare Crisium (isolated eastern oval)
  drawMare(width * 0.69, height * 0.40, 36, 28, 'rgba(98, 108, 126, 0.58)');
  // Mare Fecunditatis & Nectaris
  drawMare(width * 0.64, height * 0.58, 44, 38, 'rgba(112, 122, 140, 0.48)');
  drawMare(width * 0.58, height * 0.64, 32, 26, 'rgba(115, 125, 142, 0.45)');
  // Mare Nubium & Humorum
  drawMare(width * 0.42, height * 0.65, 42, 36, 'rgba(118, 128, 145, 0.46)');
  drawMare(width * 0.33, height * 0.67, 30, 26, 'rgba(120, 130, 148, 0.44)');

  // 3. Tycho Crater with Brilliant Radiating White Ejecta Rays across the Moon!
  const tychoX = width * 0.45;
  const tychoY = height * 0.77;

  // Luminous white rays streaming hundreds of miles
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.8;
  for (let angle = 0; angle < Math.PI * 2; angle += 0.14) {
    ctx.beginPath();
    ctx.moveTo(tychoX, tychoY);
    const length = 110 + Math.sin(angle * 7) * 95;
    ctx.lineTo(
      tychoX + Math.cos(angle) * length,
      tychoY + Math.sin(angle) * length
    );
    ctx.stroke();
  }

  // Tycho Crater Rim, Interior & Central Mountain Peak
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(tychoX, tychoY, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8B97A8';
  ctx.beginPath();
  ctx.arc(tychoX, tychoY, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(tychoX, tychoY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 4. Copernicus Crater (terraced bright rim and splash halo)
  const copX = width * 0.38;
  const copY = height * 0.43;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.beginPath();
  ctx.arc(copX, copY, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7C889B';
  ctx.beginPath();
  ctx.arc(copX, copY, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(copX, copY, 2.8, 0, Math.PI * 2);
  ctx.fill();

  // 5. Kepler Crater (smaller bright ray system)
  const kepX = width * 0.28;
  const kepY = height * 0.44;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(kepX, kepY, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8A96A8';
  ctx.beginPath();
  ctx.arc(kepX, kepY, 5, 0, Math.PI * 2);
  ctx.fill();

  // 6. Distinct Impact Craters with Bright Sunlit Rims & Soft Terraces
  for (let i = 0; i < 110; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = 2 + Math.random() * 7;

    // Shadowed floor
    ctx.fillStyle = 'rgba(80, 90, 105, 0.35)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Bright sunlit rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI * 0.85, Math.PI * 0.25);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set('earth_moon_luna', texture);
  return texture;
}

// Master Moon Texture Resolver for any Moon ID or Color
export function getMoonTexture(idOrColor = 'moon', fallbackColor = '#E2E8F0'): THREE.Texture {
  const normalized = idOrColor.toLowerCase();
  const key = `moon_tex_${normalized}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  // Earth's Moon: use dedicated photorealistic Luna texture
  if (normalized === 'moon' || normalized === 'luna') {
    return getEarthMoonTexture();
  }

  const width = 512;
  const height = 256;
  const { canvas, ctx } = create2DCanvas(width, height);

  // Io: Volcanic sulfur yellow & orange with dark caldera pits
  if (normalized === 'io') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#F59E0B');
    grad.addColorStop(0.5, '#FBBF24');
    grad.addColorStop(1, '#D97706');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Sulfur patches & calderas (Loki Patera, Pele)
    for (let i = 0; i < 25; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 4 + Math.random() * 12;
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  // Europa: Smooth reflective icy crust with reddish-brown cracks (lineae)
  else if (normalized === 'europa') {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, width, height);

    // Reddish-brown fracture lines crisscrossing the ice
    ctx.strokeStyle = 'rgba(153, 67, 39, 0.65)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.stroke();
    }
  }
  // Titan: Dense golden-orange atmospheric haze with dark methane lakes
  else if (normalized === 'titan') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#D97706');
    grad.addColorStop(0.5, '#F59E0B');
    grad.addColorStop(1, '#B45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Dark polar methane seas (Kraken Mare)
    ctx.fillStyle = 'rgba(40, 25, 10, 0.4)';
    ctx.beginPath();
    ctx.ellipse(width * 0.4, height * 0.18, 50, 25, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Enceladus: Pure dazzling reflective snow-white ice with blue tiger stripes
  else if (normalized === 'enceladus') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // South polar blue tiger stripes (cryovolcanic geyser fissures)
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(width * 0.35 + i * 25, height * 0.85);
      ctx.lineTo(width * 0.45 + i * 25, height * 0.95);
      ctx.stroke();
    }
  }
  // Ganymede & Callisto: Icy cratered crusts
  else if (normalized === 'ganymede' || normalized === 'callisto') {
    ctx.fillStyle = normalized === 'ganymede' ? '#94A3B8' : '#64748B';
    ctx.fillRect(0, 0, width, height);

    // Impact craters and bright ejecta rings
    for (let i = 0; i < 45; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 3 + Math.random() * 10;
      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  // Phobos & Deimos / Default
  else {
    const baseColor = idOrColor.startsWith('#') ? idOrColor : fallbackColor;
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    // Craters
    for (let i = 0; i < 35; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = 2 + Math.random() * 8;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(key, texture);
  return texture;
}

// Clean Sun Corona Texture with zero square-edge clipping
export function createSunCoronaTexture(): THREE.Texture {
  if (textureCache.has('sun_corona_radial')) return textureCache.get('sun_corona_radial')!;

  const width = 256;
  const height = 256;
  const { canvas, ctx } = create2DCanvas(width, height);

  // Clear canvas completely so edges are 100% transparent
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = width * 0.42;

  // Ultra-smooth exponential falloff reaching pure 0 opacity well before outer boundary
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  grad.addColorStop(0, 'rgba(255, 240, 160, 0.95)');
  grad.addColorStop(0.25, 'rgba(255, 170, 40, 0.65)');
  grad.addColorStop(0.5, 'rgba(255, 100, 15, 0.25)');
  grad.addColorStop(0.75, 'rgba(255, 50, 0, 0.05)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)'); // Strictly 0 at 42% radius, 58% outer border is totally empty

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  textureCache.set('sun_corona_radial', texture);
  return texture;
}

// ==================== 14. PHOTOREALISTIC DEEP SPACE SKYBOX ====================
export function createSpaceSkybox(): THREE.Mesh {
  const sphereGeo = new THREE.SphereGeometry(600, 32, 32);
  const { canvas, ctx } = create2DCanvas(2048, 1024);

  // Pitch black deep space
  ctx.fillStyle = '#020408';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Milky Way Galactic Dust Lane (diagonal soft nebula glow)
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-0.35);

  const mwGrad = ctx.createLinearGradient(0, -180, 0, 180);
  mwGrad.addColorStop(0, 'transparent');
  mwGrad.addColorStop(0.3, 'rgba(38, 25, 68, 0.35)');
  mwGrad.addColorStop(0.5, 'rgba(78, 45, 110, 0.55)');
  mwGrad.addColorStop(0.7, 'rgba(40, 28, 72, 0.35)');
  mwGrad.addColorStop(1, 'transparent');

  ctx.fillStyle = mwGrad;
  ctx.fillRect(-canvas.width, -180, canvas.width * 2, 360);

  // Stellar core bright dust
  const coreGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 320);
  coreGrad.addColorStop(0, 'rgba(180, 160, 220, 0.4)');
  coreGrad.addColorStop(0.5, 'rgba(95, 65, 140, 0.25)');
  coreGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(-canvas.width, -180, canvas.width * 2, 360);

  ctx.restore();

  // Draw 2,500 varied stars (blue, white, yellow, red)
  const starColors = ['#FFFFFF', '#FFFFFF', '#D8E8FF', '#FFF0D0', '#FFD2B8', '#99CCFF'];
  for (let i = 0; i < 2500; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() < 0.95 ? Math.random() * 1.2 : 1.5 + Math.random() * 1.8;
    const color = starColors[Math.floor(Math.random() * starColors.length)];

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Occasional bright star halo
    if (r > 2.0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
  });

  return new THREE.Mesh(sphereGeo, material);
}

// Master texture resolver for any body ID
export function getCelestialTexture(id: string): THREE.Texture {
  switch (id) {
    case 'sun':
      return getSunTexture();
    case 'mercury':
      return getMercuryTexture();
    case 'venus':
      return getVenusTexture();
    case 'earth':
      return getEarthTexture();
    case 'mars':
      return getMarsTexture();
    case 'jupiter':
      return getJupiterTexture();
    case 'saturn':
      return getSaturnTexture();
    case 'uranus':
      return getUranusTexture();
    case 'neptune':
      return getNeptuneTexture();
    case 'pluto':
      return getPlutoTexture();
    case 'ceres':
    case 'eris':
    case 'haumea':
    case 'makemake':
      return getDwarfPlanetTexture(id);
    default:
      return getMoonTexture();
  }
}
