// =========================================================
// 🏝️ ĐẢO BAY TIÊN GIỚI — CÂY ĐA CỔ THỤ & CHÚ THỎ NGỌC 3D
// =========================================================

import * as THREE from 'three';
import { isMobileDevice } from './config.js';

export class FloatingIsland {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.config = config;
    this.isMobile = isMobileDevice();

    // Vị trí tâm đảo bay (Lơ lửng ở vị trí trung tâm, trước vầng trăng huyền ảo)
    this.basePosition = new THREE.Vector3(0, 4, -16);
    this.islandRadius = 15.5;

    // Nhóm gốc
    this.group = new THREE.Group();
    this.group.position.copy(this.basePosition);

    // Mảng quản lý các thành phần con động
    this.floatingMiniRocks = [];
    this.hangingRoots = [];
    this.lanterns = [];
    this.ribbons = [];
    this.foliageClusters = [];
    this.sparkleParticles = [];
    this.fireflies = null;

    // Khởi tạo toàn bộ thế giới
    this.init();
    this.scene.add(this.group);
  }

  init() {
    this.createIslandTerrain();
    this.createIslandUnderside();
    this.createFloatingMiniRocks();
    this.createAncientBanyanTree();
    this.createFairyFloraAndRocks();
    this.createJadeRabbit();
    this.createIslandFireflies();
    this.createIslandLighting();
  }

  // =========================================================
  // 1. MẶT BẰNG ĐẢO BAY (GRASSLAND PLATEAU)
  // =========================================================
  createIslandTerrain() {
    // 1.1 Tạo texture cỏ tiên procedural mượt mà
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Nền cỏ xanh ngọc bích gradient
    const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 256);
    grad.addColorStop(0, '#2e7d32');
    grad.addColorStop(0.45, '#1b5e20');
    grad.addColorStop(0.85, '#134e18');
    grad.addColorStop(1.0, '#0d3813');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Đốm hoa cỏ tiên giới li ti (hoa tuyết trắng, vàng ấm, tím nhạt)
    const flowerColors = ['#fff9c4', '#f8bbd0', '#e1bee7', '#b2dfdb', '#ffffff'];
    for (let i = 0; i < 400; i++) {
      const fx = Math.random() * 512;
      const fy = Math.random() * 512;
      const fr = Math.random() * 2.5 + 0.8;
      ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.fill();
    }

    const grassTex = new THREE.CanvasTexture(canvas);
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(3, 3);

    // 1.2 Bề mặt đĩa đảo uốn lượn tự nhiên
    const segments = this.isMobile ? 32 : 48;
    const topGeo = new THREE.CylinderGeometry(this.islandRadius, this.islandRadius * 1.05, 2.8, segments, 4);
    
    // Biến dạng các đỉnh để mặt cỏ nhấp nhô gò đồi tự nhiên
    const pos = topGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const dist = Math.hypot(x, z);

      if (y > 0.5) {
        // Mặt trên: gồ ghề mềm mại, thoải dần ra mép
        const mound = Math.sin(x * 0.25) * Math.cos(z * 0.25) * 0.65;
        const edgeDip = Math.max(0, (dist - this.islandRadius * 0.7) * 0.15);
        pos.setY(i, y + mound - edgeDip);
      } else {
        // Mép dưới hơi thót vào
        pos.setX(i, x * (1.0 + Math.sin(y * 4 + x) * 0.05));
        pos.setZ(i, z * (1.0 + Math.cos(y * 4 + z) * 0.05));
      }
    }
    topGeo.computeVertexNormals();

    const topMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.75,
      metalness: 0.05,
      emissive: new THREE.Color('#0d3314'),
      emissiveIntensity: 0.35,
      flatShading: false
    });

    this.terrainMesh = new THREE.Mesh(topGeo, topMat);
    this.terrainMesh.position.y = 0;
    this.terrainMesh.receiveShadow = true;
    this.group.add(this.terrainMesh);

    // Vành rêu xanh phát quang quanh mép đảo
    const rimGeo = new THREE.TorusGeometry(this.islandRadius * 0.98, 0.45, 12, segments);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0x55ff99,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 1.1;
    this.group.add(rimMesh);
  }

  // =========================================================
  // 2. CHÂN ĐÁ ĐẢO BAY (INVERTED FLOATING CRAGS)
  // =========================================================
  createIslandUnderside() {
    const segments = this.isMobile ? 18 : 28;
    const depth = 14.0;

    // Khối nón đá ngược gồ ghề chỉa xuống dưới
    const coneGeo = new THREE.ConeGeometry(this.islandRadius * 1.02, depth, segments, 6, true);
    coneGeo.rotateX(Math.PI); // Quay đầu nhọn chúc xuống
    coneGeo.translate(0, -depth * 0.5 - 1.2, 0);

    // Biến dạng các đỉnh tạo vách đá sắc cạnh, thạch nhũ tự nhiên
    const pos = coneGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const factor = (pos.count - i) % 7;
      const noise = (Math.sin(x * 0.8) + Math.cos(z * 0.8) + Math.sin(y * 0.5)) * 0.85;
      pos.setX(i, x + noise * 0.7);
      pos.setZ(i, z + noise * 0.7);
    }
    coneGeo.computeVertexNormals();

    // Canvas texture đá rêu phong
    const rockCanvas = document.createElement('canvas');
    rockCanvas.width = 256;
    rockCanvas.height = 256;
    const rCtx = rockCanvas.getContext('2d');
    rCtx.fillStyle = '#2b231d';
    rCtx.fillRect(0, 0, 256, 256);
    // Vết nứt đá và đốm rêu
    for (let i = 0; i < 60; i++) {
      rCtx.fillStyle = Math.random() > 0.4 ? '#3e352e' : '#1d3822';
      rCtx.beginPath();
      rCtx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 18 + 4, 0, Math.PI * 2);
      rCtx.fill();
    }
    const rockTex = new THREE.CanvasTexture(rockCanvas);

    const rockMat = new THREE.MeshStandardMaterial({
      map: rockTex,
      roughness: 0.88,
      metalness: 0.15,
      color: 0x4a3d35,
      flatShading: true
    });

    const undersideMesh = new THREE.Mesh(coneGeo, rockMat);
    this.group.add(undersideMesh);

    // Các rễ cây cổ thụ buông rủ từ chân đảo xuống không trung
    const rootCount = this.isMobile ? 10 : 18;
    const rootMat = new THREE.MeshStandardMaterial({
      color: 0x3d2719,
      roughness: 0.9,
      metalness: 0.05
    });

    for (let i = 0; i < rootCount; i++) {
      const angle = (i / rootCount) * Math.PI * 2 + Math.random() * 0.3;
      const r = THREE.MathUtils.randFloat(this.islandRadius * 0.3, this.islandRadius * 0.95);
      const startX = Math.cos(angle) * r;
      const startZ = Math.sin(angle) * r;
      const rootLength = THREE.MathUtils.randFloat(6, 16);

      // Đường cong rễ rủ xuống đung đưa
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(startX, -1.0, startZ),
        new THREE.Vector3(startX + Math.sin(i) * 1.5, -rootLength * 0.4, startZ + Math.cos(i) * 1.5),
        new THREE.Vector3(startX + Math.cos(i) * 2.5, -rootLength * 0.75, startZ - Math.sin(i) * 2.0),
        new THREE.Vector3(startX + Math.sin(i * 2) * 1.0, -rootLength, startZ + Math.cos(i * 2) * 1.0)
      ]);

      const rootGeo = new THREE.TubeGeometry(curve, 12, THREE.MathUtils.randFloat(0.12, 0.32), 6, false);
      const rootMesh = new THREE.Mesh(rootGeo, rootMat);
      rootMesh.userData = {
        baseRotZ: rootMesh.rotation.z,
        swaySpeed: THREE.MathUtils.randFloat(0.8, 1.6),
        phase: Math.random() * Math.PI * 2
      };
      this.hangingRoots.push(rootMesh);
      this.group.add(rootMesh);
    }
  }

  // =========================================================
  // 3. CÁC MẢNH ĐÁ TIÊN NHỎ LƠ LỬNG QUANH ĐẢO (ORBITING MINI ROCKS)
  // =========================================================
  createFloatingMiniRocks() {
    const count = this.isMobile ? 6 : 10;
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x5a4a3e,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true
    });

    for (let i = 0; i < count; i++) {
      const size = THREE.MathUtils.randFloat(0.8, 2.2);
      const geo = new THREE.DodecahedronGeometry(size, 0);
      const mesh = new THREE.Mesh(geo, rockMat);

      const orbitRadius = THREE.MathUtils.randFloat(this.islandRadius * 1.25, this.islandRadius * 1.8);
      const angle = (i / count) * Math.PI * 2;
      const height = THREE.MathUtils.randFloat(-8, 3);

      mesh.position.set(Math.cos(angle) * orbitRadius, height, Math.sin(angle) * orbitRadius);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      mesh.userData = {
        orbitRadius,
        angle,
        speed: THREE.MathUtils.randFloat(0.003, 0.009) * (Math.random() > 0.5 ? 1 : -1),
        bobSpeed: THREE.MathUtils.randFloat(1.0, 2.0),
        bobAmp: THREE.MathUtils.randFloat(0.3, 0.8),
        baseY: height,
        rotSpeedX: THREE.MathUtils.randFloat(0.005, 0.015),
        rotSpeedY: THREE.MathUtils.randFloat(0.005, 0.015)
      };

      this.floatingMiniRocks.push(mesh);
      this.group.add(mesh);
    }
  }

  // =========================================================
  // 4. CÂY ĐA CỔ THỤ CUNG TRĂNG (ANCIENT BANYAN TREE)
  // =========================================================
  createAncientBanyanTree() {
    this.treeGroup = new THREE.Group();
    // Đặt cây vững chãi hơi lệch tâm nhẹ để tạo bố cục nghệ thuật
    this.treeGroup.position.set(-1.2, 1.4, -0.8);

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x4a2e1b,
      roughness: 0.85,
      metalness: 0.05,
      bumpScale: 0.4
    });

    // 4.1 Thân cây chính uốn lượn cổ kính
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.5, 0),
      new THREE.Vector3(0.5, 3.5, 0.2),
      new THREE.Vector3(-0.6, 7.5, -0.3),
      new THREE.Vector3(0.2, 11.5, 0.4),
      new THREE.Vector3(0.0, 14.5, 0.0)
    ]);
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 20, 2.4, 12, false);
    const trunkMesh = new THREE.Mesh(trunkGeo, woodMat);
    this.treeGroup.add(trunkMesh);

    // Gốc bạnh to xòe ra mặt cỏ (Buttress roots)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const bCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(angle) * 0.8, 3.0, Math.sin(angle) * 0.8),
        new THREE.Vector3(Math.cos(angle) * 2.4, 0.8, Math.sin(angle) * 2.4),
        new THREE.Vector3(Math.cos(angle) * 4.5, -0.3, Math.sin(angle) * 4.5)
      ]);
      const bGeo = new THREE.TubeGeometry(bCurve, 10, 0.75, 8, false);
      const bMesh = new THREE.Mesh(bGeo, woodMat);
      this.treeGroup.add(bMesh);
    }

    // 4.2 Các cành lớn xòe ngang (Major spreading branches)
    const branchConfigs = [
      { start: new THREE.Vector3(0.2, 11.5, 0.4), end: new THREE.Vector3(7.5, 14.8, 3.5), radius: 1.1 },
      { start: new THREE.Vector3(0.2, 11.5, 0.4), end: new THREE.Vector3(-8.0, 15.2, 2.0), radius: 1.1 },
      { start: new THREE.Vector3(-0.6, 7.5, -0.3), end: new THREE.Vector3(4.8, 11.2, -6.5), radius: 0.95 },
      { start: new THREE.Vector3(-0.6, 7.5, -0.3), end: new THREE.Vector3(-6.2, 12.0, -5.0), radius: 0.95 },
      { start: new THREE.Vector3(0.0, 14.5, 0.0), end: new THREE.Vector3(1.5, 18.2, 1.2), radius: 1.0 },
      { start: new THREE.Vector3(0.0, 14.5, 0.0), end: new THREE.Vector3(-2.2, 17.5, -1.8), radius: 0.9 }
    ];

    branchConfigs.forEach((b, idx) => {
      const mid = new THREE.Vector3()
        .addVectors(b.start, b.end)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(Math.sin(idx) * 1.5, 1.2, Math.cos(idx) * 1.5));
      const bCurve = new THREE.CatmullRomCurve3([b.start, mid, b.end]);
      const bGeo = new THREE.TubeGeometry(bCurve, 12, b.radius, 8, false);
      const bMesh = new THREE.Mesh(bGeo, woodMat);
      this.treeGroup.add(bMesh);

      // 4.3 Rễ phụ cây đa rủ từ cành xuống cắm vào đất (Banyan Aerial Roots)
      if (idx < 4) {
        const rootDownCurve = new THREE.CatmullRomCurve3([
          mid,
          new THREE.Vector3(mid.x * 0.95, mid.y * 0.5, mid.z * 0.95),
          new THREE.Vector3(mid.x * 0.9, -0.2, mid.z * 0.9)
        ]);
        const downGeo = new THREE.TubeGeometry(rootDownCurve, 10, 0.28, 6, false);
        const downMesh = new THREE.Mesh(downGeo, woodMat);
        this.treeGroup.add(downMesh);
      }
    });

    // 4.4 Tán lá sum suê bồng bềnh (Volumetric Cloud Foliage)
    this.createTreeCanopy();

    // 4.5 Đèn lồng & Dải lụa đỏ may mắn treo trên cây đa
    this.createTreeOrnaments(branchConfigs);

    this.group.add(this.treeGroup);
  }

  // Tán lá cây đa mượt mà phong cách tiên giới (Lush Volumetric Cloud Canopy)
  createTreeCanopy() {
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x2e8b57,
      roughness: 0.45,
      metalness: 0.05,
      emissive: new THREE.Color('#16632e'),
      emissiveIntensity: 0.72,
      flatShading: false
    });

    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x4cd97b,
      roughness: 0.4,
      metalness: 0.02,
      emissive: new THREE.Color('#228b44'),
      emissiveIntensity: 0.82,
      flatShading: false
    });

    // Cụm tán lá xếp tầng phong cách mây bồng bềnh
    const clusterPositions = [
      // Đỉnh ngọn
      { pos: [0, 19.5, 0], scale: [7.2, 4.2, 7.2], mat: tipMat },
      { pos: [1.8, 18.2, 1.8], scale: [5.8, 3.8, 5.8], mat: tipMat },
      { pos: [-2.0, 17.8, -1.5], scale: [6.0, 3.8, 6.0], mat: tipMat },
      // Tầng giữa xòe rộng
      { pos: [7.2, 15.0, 3.2], scale: [6.5, 4.0, 6.5], mat: foliageMat },
      { pos: [9.0, 14.0, 2.0], scale: [5.2, 3.2, 5.2], mat: tipMat },
      { pos: [-7.8, 15.5, 1.8], scale: [6.8, 4.2, 6.8], mat: foliageMat },
      { pos: [-9.2, 14.5, 0.5], scale: [5.0, 3.0, 5.0], mat: tipMat },
      { pos: [4.5, 12.0, -6.5], scale: [6.0, 3.6, 6.0], mat: foliageMat },
      { pos: [-5.8, 12.5, -5.2], scale: [6.2, 3.8, 6.2], mat: foliageMat },
      // Tầng rủ nhẹ
      { pos: [5.0, 10.0, 4.5], scale: [4.5, 3.0, 4.5], mat: foliageMat },
      { pos: [-4.5, 10.5, 4.2], scale: [4.6, 3.0, 4.6], mat: foliageMat },
      { pos: [0.0, 13.5, 5.5], scale: [5.2, 3.2, 5.2], mat: tipMat }
    ];

    clusterPositions.forEach((c, i) => {
      const geo = new THREE.IcosahedronGeometry(1.0, 2);
      const mesh = new THREE.Mesh(geo, c.mat);
      mesh.position.set(c.pos[0], c.pos[1], c.pos[2]);
      mesh.scale.set(c.scale[0], c.scale[1], c.scale[2]);
      mesh.userData = {
        baseY: c.pos[1],
        phase: i * 0.6,
        swaySpeed: 1.2
      };
      this.foliageClusters.push(mesh);
      this.treeGroup.add(mesh);
    });
  }

  // Đèn lồng đỏ và dải lụa ước nguyện treo trên cành đa
  createTreeOrnaments(branches) {
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      emissive: new THREE.Color(0xff4500),
      emissiveIntensity: 0.85,
      roughness: 0.3
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2
    });
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xe62e2d,
      roughness: 0.4,
      side: THREE.DoubleSide
    });

    const hangingPoints = [
      new THREE.Vector3(5.5, 13.5, 2.5),
      new THREE.Vector3(-6.0, 13.8, 1.2),
      new THREE.Vector3(3.8, 10.5, -5.0),
      new THREE.Vector3(-4.8, 11.2, -4.0),
      new THREE.Vector3(1.2, 17.0, 1.0),
      new THREE.Vector3(-1.5, 16.5, -1.2)
    ];

    hangingPoints.forEach((pt, idx) => {
      // Dây treo
      const cordGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4);
      const cordMesh = new THREE.Mesh(cordGeo, goldMat);
      cordMesh.position.set(pt.x, pt.y - 0.6, pt.z);
      this.treeGroup.add(cordMesh);

      // Đèn lồng nhỏ
      const lanternGroup = new THREE.Group();
      lanternGroup.position.set(pt.x, pt.y - 1.5, pt.z);

      const bodyGeo = new THREE.SphereGeometry(0.55, 12, 12);
      bodyGeo.scale(1.0, 1.25, 1.0);
      const bodyMesh = new THREE.Mesh(bodyGeo, lanternMat);
      lanternGroup.add(bodyMesh);

      // Vành vàng trên & dưới
      const ringGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 12);
      const topRing = new THREE.Mesh(ringGeo, goldMat);
      topRing.position.y = 0.65;
      const btmRing = new THREE.Mesh(ringGeo, goldMat);
      btmRing.position.y = -0.65;
      lanternGroup.add(topRing);
      lanternGroup.add(btmRing);

      // Tua rua đỏ
      const tasselGeo = new THREE.CylinderGeometry(0.04, 0.12, 0.7, 6);
      const tassel = new THREE.Mesh(tasselGeo, lanternMat);
      tassel.position.y = -1.05;
      lanternGroup.add(tassel);

      // Nguồn sáng ấm dịu nhẹ từ đèn lồng
      const lanternLight = new THREE.PointLight(0xff7733, 0.8, 10, 1.5);
      lanternLight.position.set(0, 0, 0);
      lanternGroup.add(lanternLight);

      lanternGroup.userData = {
        baseRotZ: 0,
        phase: idx * 1.1,
        speed: 1.4
      };
      this.lanterns.push(lanternGroup);
      this.treeGroup.add(lanternGroup);

      // Dải lụa điều ước nguyện (Prayer wish ribbons)
      const ribbonGeo = new THREE.PlaneGeometry(0.22, 1.6, 1, 6);
      const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbonMesh.position.set(pt.x + 0.35, pt.y - 0.8, pt.z + 0.2);
      ribbonMesh.userData = { phase: idx * 0.9, speed: 2.0 };
      this.ribbons.push(ribbonMesh);
      this.treeGroup.add(ribbonMesh);
    });
  }

  // =========================================================
  // 5. TIỂU CẢNH: NẤM PHÁT SÁNG & TẢNG ĐÁ RÊU TIÊN CẢNH
  // =========================================================
  createFairyFloraAndRocks() {
    // 5.1 Nấm phát quang cổ tích (Glowing Fairy Mushrooms)
    const shroomCapGeo = new THREE.ConeGeometry(0.4, 0.45, 8);
    const shroomStemGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.5, 6);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0xfff0dd, roughness: 0.8 });

    const mushroomColors = [0x00ffcc, 0xff66cc, 0xffdd44, 0x66ffff];

    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.3;
      const r = THREE.MathUtils.randFloat(3.5, this.islandRadius * 0.85);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      const shroomGroup = new THREE.Group();
      shroomGroup.position.set(x, 1.2, z);

      const color = mushroomColors[i % mushroomColors.length];
      const capMat = new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.95,
        roughness: 0.3
      });

      const stem = new THREE.Mesh(shroomStemGeo, stemMat);
      stem.position.y = 0.25;
      const cap = new THREE.Mesh(shroomCapGeo, capMat);
      cap.position.y = 0.55;

      shroomGroup.add(stem);
      shroomGroup.add(cap);

      const scale = THREE.MathUtils.randFloat(0.7, 1.4);
      shroomGroup.scale.set(scale, scale, scale);
      shroomGroup.rotation.y = Math.random() * Math.PI * 2;
      shroomGroup.rotation.z = THREE.MathUtils.randFloat(-0.2, 0.2);

      this.group.add(shroomGroup);
    }

    // 5.2 Các tảng đá nhỏ phủ rêu xung quanh
    const boulderMat = new THREE.MeshStandardMaterial({
      color: 0x5c5042,
      roughness: 0.85,
      flatShading: true
    });

    for (let i = 0; i < 8; i++) {
      const bGeo = new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(0.6, 1.4), 0);
      const bMesh = new THREE.Mesh(bGeo, boulderMat);
      const angle = Math.random() * Math.PI * 2;
      const r = THREE.MathUtils.randFloat(4.0, this.islandRadius * 0.88);
      bMesh.position.set(Math.cos(angle) * r, 1.1, Math.sin(angle) * r);
      bMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      this.group.add(bMesh);
    }
  }

  // =========================================================
  // 6. CHÚ THỎ NGỌC 3D HOẠT HÌNH DỄ THƯƠNG (ANIMATED JADE RABBIT)
  // =========================================================
  createJadeRabbit() {
    this.rabbitGroup = new THREE.Group();
    this.rabbitGroup.name = 'JadeRabbit';

    // Chất liệu lông thỏ trắng ngọc thạch mượt mà
    const rabbitFurMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      metalness: 0.02,
      emissive: new THREE.Color(0xfff7e8),
      emissiveIntensity: 0.18
    });

    // Chất liệu lòng tai hồng phấn đáng yêu
    const pinkEarMat = new THREE.MeshStandardMaterial({
      color: 0xffb3ba,
      roughness: 0.7,
      metalness: 0.0
    });

    // Mắt ngọc ruby lấp lánh
    const rubyEyeMat = new THREE.MeshStandardMaterial({
      color: 0xe60039,
      emissive: new THREE.Color(0xb3002d),
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.2
    });

    // 6.1 Thân thỏ tròn múp míp
    const bodyGeo = new THREE.SphereGeometry(0.72, 16, 16);
    bodyGeo.scale(1.0, 0.95, 1.25);
    this.rabbitBody = new THREE.Mesh(bodyGeo, rabbitFurMat);
    this.rabbitBody.position.y = 0.65;
    this.rabbitGroup.add(this.rabbitBody);

    // 6.2 Đầu thỏ tròn xoe
    const headGeo = new THREE.SphereGeometry(0.52, 16, 16);
    this.rabbitHead = new THREE.Mesh(headGeo, rabbitFurMat);
    this.rabbitHead.position.set(0, 1.15, 0.55);
    this.rabbitGroup.add(this.rabbitHead);

    // 6.3 Đôi tai thỏ dài có thể cử động (Pivoted Ears)
    this.rabbitLeftEar = new THREE.Group();
    this.rabbitLeftEar.position.set(0.2, 1.55, 0.45);

    const earGeo = new THREE.ConeGeometry(0.16, 1.05, 8);
    earGeo.scale(0.85, 1.0, 0.35);
    earGeo.translate(0, 0.5, 0); // Đặt pivot ở gốc tai
    const leftEarMesh = new THREE.Mesh(earGeo, rabbitFurMat);
    this.rabbitLeftEar.add(leftEarMesh);

    // Lòng tai hồng
    const innerEarGeo = new THREE.ConeGeometry(0.11, 0.85, 8);
    innerEarGeo.scale(0.75, 1.0, 0.2);
    innerEarGeo.translate(0, 0.45, 0.06);
    const innerLeft = new THREE.Mesh(innerEarGeo, pinkEarMat);
    this.rabbitLeftEar.add(innerLeft);

    this.rabbitLeftEar.rotation.z = -0.15;
    this.rabbitLeftEar.rotation.x = -0.1;
    this.rabbitGroup.add(this.rabbitLeftEar);

    // Tai phải
    this.rabbitRightEar = new THREE.Group();
    this.rabbitRightEar.position.set(-0.2, 1.55, 0.45);

    const rightEarMesh = new THREE.Mesh(earGeo, rabbitFurMat);
    this.rabbitRightEar.add(rightEarMesh);
    const innerRight = new THREE.Mesh(innerEarGeo, pinkEarMat);
    this.rabbitRightEar.add(innerRight);

    this.rabbitRightEar.rotation.z = 0.15;
    this.rabbitRightEar.rotation.x = -0.1;
    this.rabbitGroup.add(this.rabbitRightEar);

    // 6.4 Mắt ngọc đỏ ruby kèm điểm sáng long lanh (catchlights)
    const eyeGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, rubyEyeMat);
    leftEye.position.set(0.32, 1.25, 0.85);
    const rightEye = new THREE.Mesh(eyeGeo, rubyEyeMat);
    rightEye.position.set(-0.32, 1.25, 0.85);
    this.rabbitGroup.add(leftEye);
    this.rabbitGroup.add(rightEye);

    // Điểm sáng mắt trắng li ti
    const catchlightGeo = new THREE.SphereGeometry(0.03, 6, 6);
    const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftCatch = new THREE.Mesh(catchlightGeo, catchlightMat);
    leftCatch.position.set(0.34, 1.27, 0.92);
    const rightCatch = new THREE.Mesh(catchlightGeo, catchlightMat);
    rightCatch.position.set(-0.30, 1.27, 0.92);
    this.rabbitGroup.add(leftCatch);
    this.rabbitGroup.add(rightCatch);

    // Mũi hồng chúm chím
    const noseGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const nose = new THREE.Mesh(noseGeo, pinkEarMat);
    nose.position.set(0, 1.08, 1.02);
    this.rabbitGroup.add(nose);

    // Má hồng ửng đào cực kỳ đáng yêu (Blushing Cheeks)
    const cheekMat = new THREE.MeshBasicMaterial({
      color: 0xff88a3,
      transparent: true,
      opacity: 0.55
    });
    const cheekGeo = new THREE.SphereGeometry(0.12, 8, 8);
    cheekGeo.scale(1.0, 0.6, 0.8);
    const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
    leftCheek.position.set(0.38, 1.06, 0.82);
    const rightCheek = new THREE.Mesh(cheekGeo, cheekMat);
    rightCheek.position.set(-0.38, 1.06, 0.82);
    this.rabbitGroup.add(leftCheek);
    this.rabbitGroup.add(rightCheek);

    // 6.5 Chân thỏ
    const pawGeo = new THREE.SphereGeometry(0.18, 8, 8);
    pawGeo.scale(0.8, 0.6, 1.4);

    // Chân trước
    this.frontLeftPaw = new THREE.Mesh(pawGeo, rabbitFurMat);
    this.frontLeftPaw.position.set(0.28, 0.18, 0.55);
    this.rabbitGroup.add(this.frontLeftPaw);

    this.frontRightPaw = new THREE.Mesh(pawGeo, rabbitFurMat);
    this.frontRightPaw.position.set(-0.28, 0.18, 0.55);
    this.rabbitGroup.add(this.frontRightPaw);

    // Chân sau (khỏe hơn để bật nhảy)
    const backPawGeo = new THREE.SphereGeometry(0.24, 8, 8);
    backPawGeo.scale(0.9, 0.7, 1.6);

    this.backLeftPaw = new THREE.Mesh(backPawGeo, rabbitFurMat);
    this.backLeftPaw.position.set(0.42, 0.22, -0.4);
    this.rabbitGroup.add(this.backLeftPaw);

    this.backRightPaw = new THREE.Mesh(backPawGeo, rabbitFurMat);
    this.backRightPaw.position.set(-0.42, 0.22, -0.4);
    this.rabbitGroup.add(this.backRightPaw);

    // 6.6 Đuôi bông tròn
    const tailGeo = new THREE.SphereGeometry(0.22, 8, 8);
    this.rabbitTail = new THREE.Mesh(tailGeo, rabbitFurMat);
    this.rabbitTail.position.set(0, 0.65, -0.9);
    this.rabbitGroup.add(this.rabbitTail);

    // Tỉ lệ thỏ vừa vặn, dễ thương
    this.rabbitGroup.scale.set(1.15, 1.15, 1.15);

    // Gán dữ liệu tương tác click cho Raycaster
    this.rabbitGroup.userData = {
      isRabbit: true,
      lastCheerTime: 0
    };

    // Đường đi tham số (Parametric Loop Path) cho thỏ chạy nhảy quanh gốc cây đa
    this.rabbitPathPoints = [
      new THREE.Vector3(5.5, 1.4, 3.5),
      new THREE.Vector3(7.2, 1.4, -2.0),
      new THREE.Vector3(4.0, 1.4, -6.5),
      new THREE.Vector3(-2.5, 1.4, -7.0),
      new THREE.Vector3(-6.8, 1.4, -3.2),
      new THREE.Vector3(-7.5, 1.4, 2.8),
      new THREE.Vector3(-3.0, 1.4, 6.2),
      new THREE.Vector3(2.5, 1.4, 6.8)
    ];
    this.rabbitCurve = new THREE.CatmullRomCurve3(this.rabbitPathPoints, true, 'centripetal');

    // Biến trạng thái chạy nhảy (Hop physics)
    this.rabbitProgress = 0;
    this.rabbitHopPhase = 0;
    this.rabbitState = 'running'; // 'running' hoặc 'idle'
    this.idleTimer = 0;
    this.hopCount = 0;
    this.isCheering = false;
    this.cheerProgress = 0;

    this.group.add(this.rabbitGroup);

    // Hệ thống hạt bụi sao lấp lánh dưới chân thỏ khi tiếp đất
    this.createRabbitSparkles();
  }

  // Hạt bụi sao khi thỏ chạm đất và bật nhảy
  createRabbitSparkles() {
    const pCount = 30;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);
    const colors = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;

      // Màu vàng trăng & xanh ngọc
      if (i % 2 === 0) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.4;
      } else {
        colors[i * 3] = 0.4; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 0.7;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.65,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.sparkleMesh = new THREE.Points(geo, mat);
    this.sparkleMesh.renderOrder = 4;
    this.group.add(this.sparkleMesh);

    this.sparkleData = [];
    for (let i = 0; i < pCount; i++) {
      this.sparkleData.push({
        active: false,
        x: 0, y: -100, z: 0,
        vx: 0, vy: 0, vz: 0,
        life: 0,
        maxLife: 1.0
      });
    }
  }

  // Kích hoạt hạt sáng khi thỏ chạm chân nhảy
  emitRabbitHopSparkles(pos) {
    let emitted = 0;
    for (let i = 0; i < this.sparkleData.length && emitted < 4; i++) {
      const p = this.sparkleData[i];
      if (!p.active) {
        p.active = true;
        p.x = pos.x + THREE.MathUtils.randFloat(-0.3, 0.3);
        p.y = pos.y + 0.15;
        p.z = pos.z + THREE.MathUtils.randFloat(-0.3, 0.3);
        p.vx = THREE.MathUtils.randFloat(-0.8, 0.8);
        p.vy = THREE.MathUtils.randFloat(0.8, 1.8);
        p.vz = THREE.MathUtils.randFloat(-0.8, 0.8);
        p.life = 0;
        p.maxLife = THREE.MathUtils.randFloat(0.4, 0.8);
        emitted++;
      }
    }
  }

  // =========================================================
  // 7. ĐOM ĐÓM TIÊN CẢNH TRÊN ĐẢO BAY (ISLAND FIREFLIES)
  // =========================================================
  createIslandFireflies() {
    const count = this.isMobile ? 35 : 65;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = THREE.MathUtils.randFloat(2.0, this.islandRadius * 1.05);
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = THREE.MathUtils.randFloat(1.2, 16.0);
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Texture hạt đom đóm tròn mềm
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 245, 170, 1.0)');
    grad.addColorStop(0.3, 'rgba(100, 255, 180, 0.7)');
    grad.addColorStop(0.7, 'rgba(40, 200, 120, 0.2)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const fTex = new THREE.CanvasTexture(canvas);
    const fMat = new THREE.PointsMaterial({
      size: 1.2,
      map: fTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.75
    });

    this.fireflies = new THREE.Points(geo, fMat);
    this.fireflies.renderOrder = 3;
    this.group.add(this.fireflies);
  }

  // =========================================================
  // 8. ÁNH SÁNG ẤM ÁP CHO ĐẢO TIÊN (LIGHTING)
  // =========================================================
  createIslandLighting() {
    // 1. Ánh sáng ngọc dịu tỏa ra từ thảm cỏ tiên đảo
    const islandGlow = new THREE.PointLight(0x77ffaa, 2.5, 60, 1.0);
    islandGlow.position.set(0, 5, 0);
    this.group.add(islandGlow);

    // 2. Ánh sáng vàng trăng ấm từ trung tâm cây đa
    const treeLight = new THREE.PointLight(0xffd27d, 3.2, 55, 1.0);
    treeLight.position.set(0, 13, 0);
    this.group.add(treeLight);

    // 3. Đèn chiếu sáng mặt trước thảm cỏ nơi thỏ ngọc và hoa cỏ sinh sống
    const lawnLight = new THREE.PointLight(0xfffae6, 2.2, 40, 1.0);
    lawnLight.position.set(0, 5, 10);
    this.group.add(lawnLight);

    // 4. Ánh sáng xanh băng thanh thoát chiếu từ dưới rễ cây
    const rootLight = new THREE.PointLight(0x64b5f6, 2.0, 45, 1.1);
    rootLight.position.set(0, -6, 0);
    this.group.add(rootLight);
  }

  // =========================================================
  // 9. ANIMATION LOOP CẬP NHẬT MỖI FRAME (UPDATE)
  // =========================================================
  update(delta) {
    if (!this._islandTime) this._islandTime = 0;
    if (!this._islandFrame) this._islandFrame = 0;
    this._islandTime += (delta || 0.016);
    this._islandFrame++;
    const time = this._islandTime;
    const isMobile = this.isMobile;

    // 9.1 Hiệu ứng bồng bềnh tổng thể của Đảo Bay
    const floatY = Math.sin(time * 0.85) * 0.75;
    this.group.position.y = this.basePosition.y + floatY;
    // Mobile: chỉ update rotation mỗi 2 frame
    if (!isMobile || this._islandFrame % 2 === 0) {
      this.group.rotation.z = Math.sin(time * 0.5) * 0.012;
      this.group.rotation.x = Math.cos(time * 0.45) * 0.008;
    }

    // 9.2 Rễ cây xõa đung đưa (mobile: mỗi 3 frame)
    if (!isMobile || this._islandFrame % 3 === 0) {
      this.hangingRoots.forEach(r => {
        const u = r.userData;
        r.rotation.z = Math.sin(time * u.swaySpeed + u.phase) * 0.06;
        r.rotation.x = Math.cos(time * u.swaySpeed * 0.8 + u.phase) * 0.04;
      });
    }

    // 9.3 Các mảnh đá nhỏ xoay quanh đảo
    this.floatingMiniRocks.forEach(rock => {
      const u = rock.userData;
      u.angle += u.speed;
      rock.position.x = Math.cos(u.angle) * u.orbitRadius;
      rock.position.z = Math.sin(u.angle) * u.orbitRadius;
      rock.position.y = u.baseY + Math.sin(time * u.bobSpeed) * u.bobAmp;
      if (!isMobile || this._islandFrame % 2 === 0) {
        rock.rotation.x += u.rotSpeedX;
        rock.rotation.y += u.rotSpeedY;
      }
    });

    // 9.4 Tán lá cây đa thở nhẹ theo gió thu (mobile: mỗi 3 frame)
    if (!isMobile || this._islandFrame % 3 === 0) {
      this.foliageClusters.forEach(f => {
        f.position.y = f.userData.baseY + Math.sin(time * f.userData.swaySpeed + f.userData.phase) * 0.12;
      });
    }

    // 9.5 Đèn lồng & dải lụa trên cây đung đưa (mobile: mỗi 2 frame)
    if (!isMobile || this._islandFrame % 2 === 0) {
      this.lanterns.forEach(l => {
        l.rotation.z = Math.sin(time * l.userData.speed + l.userData.phase) * 0.12;
        l.rotation.x = Math.cos(time * l.userData.speed * 0.9 + l.userData.phase) * 0.08;
      });
      this.ribbons.forEach(rib => {
        rib.rotation.y = Math.sin(time * rib.userData.speed + rib.userData.phase) * 0.35;
        rib.rotation.z = Math.cos(time * rib.userData.speed + rib.userData.phase) * 0.15;
      });
    }

    // 9.6 Đom đóm bay lượn (mobile: mỗi 3 frame)
    if (this.fireflies && (!isMobile || this._islandFrame % 3 === 0)) {
      const pos = this.fireflies.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + Math.sin(time * 2.0 + i) * 0.02;
        if (y > 18) y = 1.2;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      this.fireflies.rotation.y += 0.001;
    }

    // 9.7 Hoạt ảnh Chú Thỏ Ngọc chạy nhảy (Rabbit Animation)
    this.updateJadeRabbit(delta, time);

    // 9.8 Cập nhật hạt bụi sao (mobile: mỗi 2 frame)
    if (!isMobile || this._islandFrame % 2 === 0) {
      this.updateRabbitSparkles(delta);
    }
  }

  // Quản lý chuyển động chạy nhảy của Thỏ Ngọc
  updateJadeRabbit(delta, time) {
    if (!this.rabbitGroup || !this.rabbitCurve) return;

    // A. Xử lý hoạt ảnh nhảy cẫng lên khi người dùng tương tác (Cheer Flip)
    if (this.isCheering) {
      this.cheerProgress += delta * 2.2;
      if (this.cheerProgress >= 1.0) {
        this.isCheering = false;
        this.cheerProgress = 0;
      } else {
        const flipY = Math.sin(this.cheerProgress * Math.PI) * 3.5;
        this.rabbitGroup.position.y = 1.4 + flipY;
        this.rabbitGroup.rotation.x = this.cheerProgress * Math.PI * 2;
        this.rabbitLeftEar.rotation.x = Math.sin(time * 15) * 0.4;
        this.rabbitRightEar.rotation.x = Math.cos(time * 15) * 0.4;
        return;
      }
    }

    // B. Trạng thái nghỉ chân hóng chuyện (Idle)
    if (this.rabbitState === 'idle') {
      this.idleTimer -= delta;

      // Thỏ ngồi nhổm dậy ngắm trăng
      this.rabbitBody.rotation.x = -0.35;
      this.rabbitHead.position.y = 1.35;
      this.rabbitHead.rotation.y = Math.sin(time * 2.5) * 0.35; // Lắc đầu nhìn quanh

      // Vẫy tai độc lập
      this.rabbitLeftEar.rotation.x = -0.1 + Math.sin(time * 6) * 0.2;
      this.rabbitRightEar.rotation.x = -0.1 + Math.cos(time * 6 + 1.0) * 0.2;

      // Vẫy đuôi
      this.rabbitTail.rotation.y = Math.sin(time * 8) * 0.4;

      if (this.idleTimer <= 0) {
        this.rabbitState = 'running';
        this.rabbitHopPhase = 0;
        this.rabbitBody.rotation.x = 0;
        this.rabbitHead.position.y = 1.15;
      }
      return;
    }

    // C. Trạng thái chạy nhảy (Running / Hopping)
    const hopSpeed = 2.4; // Tần số bước nhảy
    this.rabbitHopPhase += delta * hopSpeed;

    if (this.rabbitHopPhase >= 1.0) {
      this.rabbitHopPhase -= 1.0;
      this.hopCount++;

      // Phát hạt bụi sao khi tiếp đất
      this.emitRabbitHopSparkles(this.rabbitGroup.position);

      // Thỉnh thoảng dừng lại nghỉ 2 giây ngắm trăng
      if (this.hopCount % 7 === 0 && Math.random() > 0.4) {
        this.rabbitState = 'idle';
        this.idleTimer = THREE.MathUtils.randFloat(2.0, 3.2);
        return;
      }
    }

    // Tịnh tiến theo đường cong trên mặt đảo
    this.rabbitProgress = (this.rabbitProgress + delta * 0.045) % 1.0;
    const pt = this.rabbitCurve.getPointAt(this.rabbitProgress);
    const tangent = this.rabbitCurve.getTangentAt(this.rabbitProgress).normalize();

    // Vật lý nhún nhảy hình cung Sin
    const hopHeight = 1.85;
    const jumpY = Math.sin(this.rabbitHopPhase * Math.PI) * hopHeight;

    this.rabbitGroup.position.set(pt.x, 1.3 + jumpY, pt.z);

    // Hướng nhìn luôn theo tiếp tuyến đường chạy
    const targetLook = new THREE.Vector3().addVectors(pt, tangent);
    this.rabbitGroup.lookAt(targetLook.x, 1.3 + jumpY, targetLook.z);

    // Biến dạng cơ thể nhún nén khi bật nhảy (Squash & Stretch)
    if (this.rabbitHopPhase < 0.25) {
      // Nhún lấy đà
      this.rabbitBody.scale.set(1.15, 0.85, 1.15);
      this.rabbitLeftEar.rotation.x = -0.2;
      this.rabbitRightEar.rotation.x = -0.2;
    } else if (this.rabbitHopPhase < 0.75) {
      // Vút lên cao trên không
      this.rabbitBody.scale.set(0.9, 1.18, 0.9);
      // Tai thỏ ngả về sau do sức cản không khí
      this.rabbitLeftEar.rotation.x = -0.55;
      this.rabbitRightEar.rotation.x = -0.55;
      this.backLeftPaw.position.y = 0.05;
      this.backRightPaw.position.y = 0.05;
    } else {
      // Tiếp đất êm ái
      this.rabbitBody.scale.set(1.1, 0.9, 1.1);
      this.rabbitLeftEar.rotation.x = 0.25;
      this.rabbitRightEar.rotation.x = 0.25;
      this.backLeftPaw.position.y = 0.22;
      this.backRightPaw.position.y = 0.22;
    }

    // Lắc đuôi vui vẻ
    this.rabbitTail.rotation.x = Math.sin(time * 12) * 0.25;
  }

  // Cập nhật các hạt bụi sao
  updateRabbitSparkles(delta) {
    if (!this.sparkleMesh) return;
    const pos = this.sparkleMesh.geometry.attributes.position;
    let anyActive = false;

    for (let i = 0; i < this.sparkleData.length; i++) {
      const p = this.sparkleData[i];
      if (p.active) {
        anyActive = true;
        p.life += delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        p.vy -= 1.8 * delta; // Trọng lực nhẹ

        if (p.life >= p.maxLife) {
          p.active = false;
          pos.setXYZ(i, 0, -100, 0);
        } else {
          pos.setXYZ(i, p.x, p.y, p.z);
        }
      }
    }
    if (anyActive) {
      pos.needsUpdate = true;
    }
  }

  // Hành động kích hoạt khi người dùng chạm vào thỏ ngọc
  cheerRabbit() {
    this.isCheering = true;
    this.cheerProgress = 0;
    this.rabbitState = 'running';

    // Bắn chùm sao lấp lánh quanh thỏ
    for (let i = 0; i < 15; i++) {
      this.emitRabbitHopSparkles(this.rabbitGroup.position);
    }
  }
}
