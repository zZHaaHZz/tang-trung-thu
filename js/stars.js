// =========================================================
// ⭐ BẦU TRỜI SAO & SAO BĂNG 3D (STARS & METEORS)
// =========================================================

import * as THREE from 'three';
import { isMobileDevice } from './config.js';

export class Starfield {
  constructor(scene, count = 2200) {
    this.scene = scene;
    const isMobile = isMobileDevice();
    this.starCount = isMobile ? 1000 : count;
    this.shootingStars = [];

    this.createStars();
  }

  // Tạo hàng nghìn hạt sao lấp lánh
  createStars() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.starCount * 3);
    const colors = new Float32Array(this.starCount * 3);
    const sizes = new Float32Array(this.starCount);

    const colorPalette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#fff4cc'),
      new THREE.Color('#ffe6ee'),
      new THREE.Color('#cbe3fb'),
      new THREE.Color('#ffd166'),
    ];

    for (let i = 0; i < this.starCount; i++) {
      const radius = THREE.MathUtils.randFloat(350, 700);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = THREE.MathUtils.randFloat(1.5, 4.5);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(255, 240, 200, 0.8)');
    grad.addColorStop(0.6, 'rgba(255, 215, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const starTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.starPoints = new THREE.Points(geometry, material);
    this.scene.add(this.starPoints);
  }

  // Sao băng
  spawnShootingStar() {
    const startX = THREE.MathUtils.randFloat(-200, 200);
    const startY = THREE.MathUtils.randFloat(150, 300);
    const startZ = THREE.MathUtils.randFloat(-250, -50);

    const length = THREE.MathUtils.randFloat(40, 80);
    const dir = new THREE.Vector3(-1.2, -0.8, 0.2).normalize();

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      startX, startY, startZ,
      startX + dir.x * length, startY + dir.y * length, startZ + dir.z * length
    ]);

    const colors = new Float32Array([
      1.0, 0.95, 0.8,
      1.0, 1.0, 1.0
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      linewidth: 2
    });

    const line = new THREE.Line(geometry, material);
    line.userData = {
      velocity: dir.clone().multiplyScalar(THREE.MathUtils.randFloat(4.5, 7.5)),
      life: 1.0,
      decay: THREE.MathUtils.randFloat(0.015, 0.025)
    };

    this.scene.add(line);
    this.shootingStars.push(line);
  }

  update(delta) {
    if (this.starPoints) {
      this.starPoints.rotation.y += 0.00015;
    }

    // Sao băng
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      star.position.add(star.userData.velocity);
      star.userData.life -= star.userData.decay;
      star.material.opacity = Math.max(0, star.userData.life);

      if (star.userData.life <= 0) {
        this.scene.remove(star);
        star.geometry.dispose();
        star.material.dispose();
        this.shootingStars.splice(i, 1);
      }
    }
  }
}
