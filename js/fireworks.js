// =========================================================
// 🎆 HỆ THỐNG PHÁO HOA CÁNH HOA LUNG LINH
// 3 chế độ nổ: cầu ngẫu nhiên | cánh hoa | thác rủ
// =========================================================

import * as THREE from 'three';
import { isMobileDevice } from './config.js';

// Tạo texture hạt tròn phát sáng
function makeSpark() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0,   'rgba(255,255,255,1)');
  g.addColorStop(0.25,'rgba(255,240,160,0.9)');
  g.addColorStop(0.6, 'rgba(255,120,40,0.35)');
  g.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

// Bảng màu pháo hoa cánh hoa lãng mạn
const PALETTES = [
  // Vàng kim & hổ phách
  [0xffd700, 0xffaa00, 0xff8800, 0xffe566],
  // Hồng đào & đỏ ruby
  [0xff6699, 0xff1155, 0xff99cc, 0xcc0044],
  // Xanh băng & tím mộng mơ
  [0x88ccff, 0x4499ff, 0xcc88ff, 0x9944ff],
  // Bạc trắng & xanh ngọc
  [0xffffff, 0xaaffee, 0x44ffcc, 0x00ddaa],
  // Cam rực & vàng chanh
  [0xff6600, 0xffcc00, 0xff3300, 0xffee44],
  // Hồng tím & lavender
  [0xff88cc, 0xdd44ff, 0xffccee, 0x9933cc],
];

export class FireworkManager {
  constructor(scene) {
    this.scene = scene;
    this.fireworks = [];
    this.sparkTex = makeSpark();
  }

  // ── Spawn một vụ nổ pháo hoa tại (x,y,z) ──────────────────
  spawn(x, y, z, customColor = null) {
    const mode = Math.floor(Math.random() * 3); // 0=sphere 1=flower 2=willow
    switch (mode) {
      case 0: this._spawnSphere(x, y, z, customColor); break;
      case 1: this._spawnFlower(x, y, z, customColor); break;
      case 2: this._spawnWillow(x, y, z, customColor); break;
    }
  }

  // Kiểu 0: 💥 Cầu nổ tỏa đều mọi hướng (classic)
  _spawnSphere(x, y, z, customColor) {
    const isMobile = isMobileDevice();
    const count = isMobile ? 120 : 240;
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vels = [];

    for (let i = 0; i < count; i++) {
      pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(THREE.MathUtils.randFloatSpread(2));
      const spd   = THREE.MathUtils.randFloat(1.2, 4.5);
      vels.push(new THREE.Vector3(
        spd * Math.sin(phi) * Math.cos(theta),
        spd * Math.sin(phi) * Math.sin(theta),
        spd * Math.cos(phi)
      ));
      const hex = palette[i % palette.length];
      const c = new THREE.Color(hex);
      c.offsetHSL(0, 0, THREE.MathUtils.randFloatSpread(0.2));
      col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
    }
    this._addParticles(x, y, z, pos, col, vels, 0.008, 0.028, palette[0]);
  }

  // Kiểu 1: 🌸 Cánh hoa bung tỏa (flower petal burst) — nhiều tầng vòng
  _spawnFlower(x, y, z, customColor) {
    const isMobile = isMobileDevice();
    const petalCount = isMobile ? 9 : 16;   // số cánh
    const rayCount   = isMobile ? 5 : 8;    // số lớp / cánh
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const total = petalCount * rayCount;
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    const vels = [];

    for (let p = 0; p < petalCount; p++) {
      const baseAngle = (p / petalCount) * Math.PI * 2;
      const hexA = palette[p % palette.length];
      const hexB = palette[(p + 1) % palette.length];
      for (let r = 0; r < rayCount; r++) {
        const idx = p * rayCount + r;
        pos[idx*3]=x; pos[idx*3+1]=y; pos[idx*3+2]=z;

        // Mỗi cánh = chùm tia nằm trong mặt phẳng góc cánh, loe ra hình chóp
        const spread = (r / rayCount) * 0.38; // độ xòe của cánh
        const angle  = baseAngle + THREE.MathUtils.randFloatSpread(spread);
        const tilt   = THREE.MathUtils.randFloat(-0.3, 0.3); // nghiêng nhẹ lên/xuống
        const spd    = THREE.MathUtils.randFloat(2.5, 5.5);

        vels.push(new THREE.Vector3(
          spd * Math.cos(angle) * Math.cos(tilt),
          spd * Math.sin(tilt) + THREE.MathUtils.randFloat(-0.4, 0.8),
          spd * Math.sin(angle) * Math.cos(tilt)
        ));

        // Gradient màu từ gốc cánh → đầu cánh
        const t = r / rayCount;
        const cA = new THREE.Color(hexA);
        const cB = new THREE.Color(hexB);
        cA.lerp(cB, t);
        col[idx*3]=cA.r; col[idx*3+1]=cA.g; col[idx*3+2]=cA.b;
      }
    }
    // Thêm lõi sáng bùng
    this._addParticles(x, y, z, pos, col, vels, 0.006, 0.022, palette[0]);

    // Vòng tia thứ 2 nhỏ hơn bùng ra sau ~80ms (hiệu ứng 2 lớp)
    setTimeout(() => {
      if (!this.scene) return;
      const count2 = isMobile ? 40 : 80;
      const pos2 = new Float32Array(count2 * 3);
      const col2 = new Float32Array(count2 * 3);
      const vels2 = [];
      for (let i = 0; i < count2; i++) {
        pos2[i*3]=x; pos2[i*3+1]=y; pos2[i*3+2]=z;
        const a = (i / count2) * Math.PI * 2;
        const spd = THREE.MathUtils.randFloat(1.2, 2.8);
        vels2.push(new THREE.Vector3(
          spd * Math.cos(a), THREE.MathUtils.randFloat(-0.3, 0.6), spd * Math.sin(a)
        ));
        const c = new THREE.Color(palette[(i*3) % palette.length]);
        col2[i*3]=c.r; col2[i*3+1]=c.g; col2[i*3+2]=c.b;
      }
      this._addParticles(x, y, z, pos2, col2, vels2, 0.009, 0.026, palette[1]);
    }, 80);
  }

  // Kiểu 2: 🌿 Thác rủ (willow/chrysanthemum) — tia bay lên rồi rủ xuống
  _spawnWillow(x, y, z, customColor) {
    const isMobile = isMobileDevice();
    const streamCount = isMobile ? 16 : 28;   // số tia
    const dotPerStream = isMobile ? 8 : 14;   // hạt / tia
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const total = streamCount * dotPerStream;
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    const vels = [];

    for (let s = 0; s < streamCount; s++) {
      const angle = (s / streamCount) * Math.PI * 2 + THREE.MathUtils.randFloatSpread(0.2);
      const upTilt = THREE.MathUtils.randFloat(0.15, 0.65); // góc hướng lên
      const spd = THREE.MathUtils.randFloat(2.0, 4.8);
      const hex = palette[s % palette.length];

      for (let d = 0; d < dotPerStream; d++) {
        const idx = s * dotPerStream + d;
        pos[idx*3]=x; pos[idx*3+1]=y; pos[idx*3+2]=z;

        // Tốc độ dọc theo tia, có lag nhỏ giữa các hạt → tia dài
        const lagSpd = spd * (1 - d * 0.04);
        vels.push(new THREE.Vector3(
          lagSpd * Math.cos(angle) * Math.cos(upTilt),
          lagSpd * Math.sin(upTilt) + d * 0.05,
          lagSpd * Math.sin(angle) * Math.cos(upTilt)
        ));

        const t = d / dotPerStream;
        const c = new THREE.Color(hex);
        c.offsetHSL(0, 0, t * 0.3); // đầu tia sáng hơn
        col[idx*3]=c.r; col[idx*3+1]=c.g; col[idx*3+2]=c.b;
      }
    }
    // Gravity mạnh hơn để cánh thác cong xuống đẹp
    this._addParticles(x, y, z, pos, col, vels, 0.005, 0.020, palette[0], 0.055);
  }

  // Helper: tạo Points + đăng ký vào scene
  _addParticles(x, y, z, pos, col, vels, decayMin, decayMax, flashColor, gravity = 0.04) {
    const isMobile = isMobileDevice();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: isMobile ? 4.5 : 3.5,
      vertexColors: true,
      map: this.sparkTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 1.0,
      sizeAttenuation: true,
    });

    const pts = new THREE.Points(geo, mat);
    pts.userData = {
      velocities: vels,
      life: 1.0,
      decay: THREE.MathUtils.randFloat(decayMin, decayMax),
      gravity,
      drag: 0.968,
    };

    // Flash light
    let flash = null;
    if (!isMobile) {
      flash = new THREE.PointLight(flashColor, 5.0, 80);
      flash.position.set(x, y, z);
      this.scene.add(flash);
    }

    this.scene.add(pts);
    this.fireworks.push({ points: pts, flash, flashLife: 0.4 });
  }

  // ── Spawn từ click màn hình ────────────────────────────────
  spawnFromScreen(camera, screenX, screenY) {
    const vec = new THREE.Vector3(screenX, screenY, 0.5);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = THREE.MathUtils.randFloat(45, 90);
    const p = camera.position.clone().add(dir.multiplyScalar(dist));
    this.spawn(p.x, p.y, p.z);
  }

  // ── Update mỗi frame ───────────────────────────────────────
  update(delta) {
    for (let fi = this.fireworks.length - 1; fi >= 0; fi--) {
      const item = this.fireworks[fi];
      const { points, flash } = item;

      // Fade flash
      if (flash) {
        if (item.flashLife > 0) {
          item.flashLife -= delta * 2.0;
          flash.intensity = Math.max(0, item.flashLife * 10.0);
        } else if (flash.parent) {
          this.scene.remove(flash);
          flash.dispose();
        }
      }

      const pos  = points.geometry.attributes.position.array;
      const vels = points.userData.velocities;
      const { gravity, drag } = points.userData;

      for (let i = 0; i < vels.length; i++) {
        pos[i*3]   += vels[i].x;
        pos[i*3+1] += vels[i].y;
        pos[i*3+2] += vels[i].z;
        vels[i].y  -= gravity;
        vels[i].multiplyScalar(drag);
      }

      points.geometry.attributes.position.needsUpdate = true;
      points.userData.life -= points.userData.decay;

      // Fade opacity theo life²  → đuôi mờ đẹp hơn
      points.material.opacity = Math.max(0, points.userData.life * points.userData.life);

      if (points.userData.life <= 0) {
        this.scene.remove(points);
        points.geometry.dispose();
        points.material.dispose();
        if (flash && flash.parent) { this.scene.remove(flash); flash.dispose(); }
        this.fireworks.splice(fi, 1);
      }
    }
  }
}
