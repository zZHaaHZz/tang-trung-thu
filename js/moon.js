// =========================================================
// 🌕 MẶT TRĂNG 3D (3D FULL MOON — CLEAN & ELEGANT)
// =========================================================

import * as THREE from 'three';
import { isMobileDevice } from './config.js';

export class Moon {
  constructor(scene) {
    this.scene = scene;
    this.radius = 12; // Thu nhỏ kích thước mặt trăng tinh tế
    this.position = new THREE.Vector3(0, 52, -240); // Đặt trăng lùi xa làm nền background cố định
    this.mesh = null;
    this.rimMesh = null;
    this.moonDust = null;
    this.moonLight = null;
    this.glowFactor = 0.85;

    this.init();
  }

  init() {
    this.createMoonTexture();
    this.createMoonMesh();
    this.createAtmosphericRim();
    this.createMoonDust();
    this.setupLighting();
  }

  // 1. Texture bề mặt trăng
  createMoonTexture() {
    const isMobile = isMobileDevice();
    const size = isMobile ? 512 : 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const baseGrad = ctx.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.5);
    baseGrad.addColorStop(0, '#fff8e8');
    baseGrad.addColorStop(0.35, '#ffefc4');
    baseGrad.addColorStop(0.65, '#ffe09a');
    baseGrad.addColorStop(0.88, '#ffc95c');
    baseGrad.addColorStop(1.0, '#f0a030');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, size, size);

    const maria = [
      { x: size * 0.37, y: size * 0.34, r: size * 0.18, alpha: 0.14 },
      { x: size * 0.54, y: size * 0.31, r: size * 0.21, alpha: 0.16 },
      { x: size * 0.66, y: size * 0.43, r: size * 0.16, alpha: 0.15 },
      { x: size * 0.31, y: size * 0.54, r: size * 0.15, alpha: 0.13 },
      { x: size * 0.47, y: size * 0.61, r: size * 0.23, alpha: 0.15 },
      { x: size * 0.61, y: size * 0.66, r: size * 0.17, alpha: 0.12 },
    ];
    maria.forEach(m => {
      const grad = ctx.createRadialGradient(m.x, m.y, m.r * 0.2, m.x, m.y, m.r);
      grad.addColorStop(0, `rgba(148, 128, 155, ${m.alpha})`);
      grad.addColorStop(0.5, `rgba(175, 155, 140, ${m.alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(255, 245, 220, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const craterCount = isMobile ? 80 : 180;
    for (let i = 0; i < craterCount; i++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const cr = (Math.random() * 12 + 2) * (size / 1024);
      ctx.strokeStyle = 'rgba(255, 255, 240, 0.35)';
      ctx.lineWidth = Math.max(1, cr * 0.2);
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.fillStyle = 'rgba(130, 110, 138, 0.12)';
    const scale = size / 1024;
    ctx.beginPath(); ctx.arc(440 * scale, 420 * scale, 45 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(425 * scale, 345 * scale, 16 * scale, 45 * scale, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(455 * scale, 350 * scale, 15 * scale, 42 * scale, 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(455 * scale, 510 * scale, 65 * scale, 80 * scale, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    this.moonTexture = new THREE.CanvasTexture(canvas);
    this.moonTexture.wrapS = THREE.RepeatWrapping;
    this.moonTexture.wrapT = THREE.ClampToEdgeWrapping;

    if (!isMobile) {
      const bumpCanvas = document.createElement('canvas');
      bumpCanvas.width = 512;
      bumpCanvas.height = 512;
      bumpCanvas.getContext('2d').drawImage(canvas, 0, 0, 512, 512);
      this.moonBumpMap = new THREE.CanvasTexture(bumpCanvas);
    }
  }

  // 2. Mặt trăng phát quang tự nhiên
  createMoonMesh() {
    const isMobile = isMobileDevice();
    const geometry = new THREE.SphereGeometry(this.radius, isMobile ? 36 : 64, isMobile ? 36 : 64);
    const material = isMobile
      ? new THREE.MeshLambertMaterial({
          map: this.moonTexture,
          emissive: new THREE.Color('#ffe299'),
          emissiveMap: this.moonTexture,
          emissiveIntensity: 1.25,
        })
      : new THREE.MeshStandardMaterial({
          map: this.moonTexture,
          bumpMap: this.moonBumpMap,
          bumpScale: 0.8,
          roughness: 0.82,
          metalness: 0.02,
          emissive: new THREE.Color('#ffe299'),
          emissiveMap: this.moonTexture,
          emissiveIntensity: 1.25,
        });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = -Math.PI / 2;
    this.scene.add(this.mesh);
  }

  // 3. Viền khí quyển Fresnel — hào quang vàng mỏng ôm quanh trăng (3D thực, không bị dẹt)
  createAtmosphericRim() {
    // Lớp 1: Rim sáng sát viền (FrontSide)
    const rimMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#ffe077') },
        uOpacity: { value: 0.88 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float rim = 1.0 - max(dot(viewDir, normal), 0.0);
          rim = pow(rim, 2.5);
          gl_FragColor = vec4(uColor, rim * uOpacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      depthWrite: false
    });

    this.rimMesh = new THREE.Mesh(new THREE.SphereGeometry(this.radius * 1.02, 36, 36), rimMat);
    this.rimMesh.position.copy(this.position);
    this.rimMesh.renderOrder = 2;
    this.scene.add(this.rimMesh);
  }

  // 4. Bụi sáng đom đóm quanh trăng
  createMoonDust() {
    const count = isMobileDevice() ? 30 : 60;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = THREE.MathUtils.randFloat(this.radius * 1.08, this.radius * 1.6);
      const sinPhi = Math.sin(phi);
      positions[i * 3] = r * sinPhi * Math.cos(theta);
      positions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 28);
    pGrad.addColorStop(0, 'rgba(255, 240, 190, 1.0)');
    pGrad.addColorStop(0.25, 'rgba(255, 215, 110, 0.7)');
    pGrad.addColorStop(0.6, 'rgba(255, 180, 60, 0.2)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);

    const dustTex = new THREE.CanvasTexture(pCanvas);
    const dustMat = new THREE.PointsMaterial({
      size: 2.2,
      map: dustTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.55,
      sizeAttenuation: true,
    });

    this.moonDust = new THREE.Points(geometry, dustMat);
    this.moonDust.position.copy(this.position);
    this.moonDust.renderOrder = 3;
    this.scene.add(this.moonDust);
  }

  // 5. Ánh sáng
  setupLighting() {
    // Ánh sáng trăng ấm áp từ xa chiếu về tâm thế giới
    this.moonLight = new THREE.DirectionalLight(0xfffae6, 2.2);
    this.moonLight.position.copy(this.position);
    this.scene.add(this.moonLight);

    // Điểm sáng hào quang tỏa ra từ trăng rằm
    const moonGlowLight = new THREE.PointLight(0xffeaad, 4.0, 500, 1.0);
    moonGlowLight.position.copy(this.position);
    this.scene.add(moonGlowLight);

    const dirLight = new THREE.DirectionalLight(0xfffae6, 1.4);
    dirLight.position.set(15, 45, 45);
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x7590dd, 0.8);
    fillLight.position.set(-25, -20, 30);
    this.scene.add(fillLight);
  }

  // Điều chỉnh glow
  setGlowIntensity(factor = 1.0) {
    this.glowFactor = factor;
    if (this.rimMesh && this.rimMesh.material.uniforms) {
      this.rimMesh.material.uniforms.uOpacity.value = Math.max(0.04, 0.6 * factor);
    }
    if (this.moonDust && this.moonDust.material) {
      this.moonDust.material.opacity = Math.max(0.04, 0.65 * factor);
    }
    if (this.moonLight) {
      this.moonLight.intensity = 3.5 * (0.15 + 0.85 * factor);
    }
  }

  update(delta) {
    const time = Date.now() * 0.001;

    if (this.mesh) {
      this.mesh.rotation.y += 0.0008;
    }

    // Rim thở nhẹ
    if (this.rimMesh && this.rimMesh.material.uniforms) {
      const rimPulse = Math.sin(time * 0.8) * 0.06 + 1.0;
      this.rimMesh.scale.set(rimPulse, rimPulse, rimPulse);
    }

    if (this.moonDust) {
      this.moonDust.rotation.y += 0.0005;
      this.moonDust.rotation.x += 0.00015;
    }

    if (this.moonLight) {
      this.moonLight.intensity = (3.3 + Math.sin(time * 1.0) * 0.3) * (0.15 + 0.85 * this.glowFactor);
    }
  }
}
