// =========================================================
// 🏮 HỆ THỐNG ĐÈN LỒNG TRUNG THU: ĐÈN ÔNG SAO 3D & THIÊN ĐĂNG
// =========================================================

import * as THREE from 'three';
import { isMobileDevice } from './config.js';

// Chuẩn hóa tỷ lệ khung hình (object-fit: cover) và căn chỉnh tâm điểm nhân vật chính (focal point)
export function applyCoverCrop(texture, targetWidth, targetHeight, focalX = 0.5, focalY = 0.5) {
  if (!texture || !texture.image) return;
  const imgWidth = texture.image.width || texture.image.videoWidth;
  const imgHeight = texture.image.height || texture.image.videoHeight;
  if (!imgWidth || !imgHeight) return;

  const targetAspect = targetWidth / targetHeight;
  const imageAspect = imgWidth / imgHeight;

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  let repeatX = 1;
  let repeatY = 1;
  let offsetX = 0;
  let offsetY = 0;

  if (imageAspect > targetAspect) {
    // Ảnh rộng hơn khung (cần crop 2 bên sườn): giữ nguyên chiều cao, crop theo focalX
    repeatX = targetAspect / imageAspect;
    // Căn tâm điểm nhân vật: tâm vùng hiển thị (offsetX + repeatX * 0.5) trùng focalX
    offsetX = Math.max(0, Math.min(1 - repeatX, focalX - repeatX * 0.5));
    offsetY = 0;
  } else {
    // Ảnh cao hơn khung (cần crop trên/dưới): giữ nguyên chiều rộng, crop theo focalY
    repeatY = imageAspect / targetAspect;
    // Trong Three.js UV: V = 0 là đáy ảnh, V = 1 là đỉnh ảnh.
    // focalY quy ước: 0 là đỉnh ảnh, 1 là đáy ảnh => focalV = 1 - focalY
    const focalV = 1 - focalY;
    offsetY = Math.max(0, Math.min(1 - repeatY, focalV - repeatY * 0.5));
    offsetX = 0;
  }

  texture.repeat.set(repeatX, repeatY);
  texture.offset.set(offsetX, offsetY);
  texture.needsUpdate = true;
}

export class LanternManager {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.skyLanterns = [];
    this.wishLanterns = [];
    this.starLantern = null;
    this.memoryLantern = null;
    this.tassels = [];
    this.focusedPhotoIndex = -1;

    this.init();
  }

  init() {
    const isMobile = isMobileDevice();
    this.createDaoPhotoLanterns();
    const count = isMobile ? 28 : (this.config.effects?.floatingLanterns || 55);
    this.createSkyLanterns(count);
  }

  // =========================================================
  // 1. TẠO ĐÈN ÔNG SAO 3D TRUYỀN THỐNG VIỆT NAM (5 CÁNH)
  // =========================================================
  createStarLantern() {
    const group = new THREE.Group();

    // Tạo hình ngôi sao 5 cánh 3D bằng ExtrudeGeometry
    const starShape = new THREE.Shape();
    const outerRadius = 8;
    const innerRadius = 3.6;
    const numPoints = 5;

    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / numPoints - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 2.2,
      bevelEnabled: true,
      bevelThickness: 0.6,
      bevelSize: 0.5,
      bevelSegments: 3,
    };

    const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    starGeo.center();

    // Giấy kính đỏ vàng rực rỡ truyền thống
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      emissive: 0xff4d4d,
      emissiveIntensity: 0.6,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide
    });

    const starMesh = new THREE.Mesh(starGeo, starMat);
    group.add(starMesh);

    // Vành tròn tre bao quanh các cánh sao
    const ringGeo = new THREE.TorusGeometry(outerRadius * 0.95, 0.22, 12, 48);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      roughness: 0.4,
      metalness: 0.6,
      emissive: 0xb58900,
      emissiveIntensity: 0.3
    });
    const ringMesh = new THREE.Mesh(ringGeo, frameMat);
    group.add(ringMesh);

    // Tâm ngôi sao hình tròn màu vàng phát sáng
    const centerGeo = new THREE.CylinderGeometry(2.4, 2.4, 2.5, 32);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0xffbe0b,
      emissive: 0xffd166,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    centerMesh.rotation.x = Math.PI / 2;
    group.add(centerMesh);

    // Ngọn nến lung linh ở giữa đèn ông sao
    this.candleLight = new THREE.PointLight(0xffbe0b, 2.5, 30);
    this.candleLight.position.set(0, 0, 0);
    group.add(this.candleLight);

    // Cán cầm tre & Tua rua ngũ sắc đuôi đèn
    const handleGeo = new THREE.CylinderGeometry(0.18, 0.18, 14, 12);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.8 });
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    handleMesh.position.set(0, -11, 0);
    group.add(handleMesh);

    // Các dải tua rua rủ xuống lấp lánh
    const tasselColors = [0xff4b5c, 0xffbe0b, 0x48cae4, 0x06d6a0, 0xff70a6];
    for (let i = 0; i < 5; i++) {
      const tGeo = new THREE.CylinderGeometry(0.08, 0.2, 5, 8);
      const tMat = new THREE.MeshBasicMaterial({ color: tasselColors[i] });
      const tassel = new THREE.Mesh(tGeo, tMat);
      const angle = (i * Math.PI) / 2.5;
      tassel.position.set(Math.cos(angle) * 1.6, -7, Math.sin(angle) * 1.6);
      tassel.userData = { initialX: tassel.position.x, speed: 2 + i * 0.5 };
      group.add(tassel);
      this.tassels.push(tassel);
    }

    // Tọa độ thông minh: Trên mobile co gần vào giữa để không bị khuất viền màn hình
    const isMobile = isMobileDevice();
    const starX = isMobile ? 14 : 22;
    const starY = isMobile ? 3 : 5;
    const starZ = isMobile ? -10 : -15;

    group.position.set(starX, starY, starZ);
    group.rotation.y = -0.35;
    group.rotation.z = 0.08;

    this.scene.add(group);
    this.starLantern = group;
  }

  // =========================================================
  // 1B. TẠO CÁC KHUNG ĐÈN ẢNH 3D CỦA LINH ĐAN TRONG KHÔNG GIAN
  // =========================================================
  createDaoPhotoLanterns() {
    const isMobile = isMobileDevice();
    const loader = new THREE.TextureLoader();
    this.photoLanterns = [];

    const defaultPhotos = [
      { url: "assets/images/anh-dao/1.png", caption: "Em bé Linh Đan xinh xắn đáng yêu của anh ❤️", title: "Linh Đan Xinh Đẹp", frameStyle: "palace" },
      { url: "assets/images/anh-dao/2.jpg", caption: "Nụ cười làm tan chảy trái tim anh ✨", title: "Nụ Cười Tỏa Nắng", frameStyle: "moon_gate" },
      { url: "assets/images/anh-dao/3.jpeg", caption: "Em luôn là ánh trăng sáng nhất trong lòng anh 🌙", title: "Ánh Trăng Của Anh", frameStyle: "star" },
      { url: "assets/images/bennhau.jpeg", caption: "Bên nhau bình yên như thế này thôi ❤️", title: "Bình Yên Bên Em", frameStyle: "heart" },
      { url: "assets/images/anh-dao/4.png", caption: "Cô gái dịu dàng khiến anh thương nhất đời 💕", title: "Nàng Thơ Dịu Dàng", frameStyle: "lotus" },
      { url: "assets/images/couple.jpg", caption: "Nắm chặt tay nhau đi qua ngàn mùa trăng sáng 🤝", title: "Nắm Tay Đi Tiếp", frameStyle: "crown" }
    ];

    const photoList = (this.config.daoPhotos && this.config.daoPhotos.length > 0)
      ? this.config.daoPhotos
      : defaultPhotos;

    // =========================================================
    // KHUNG ẢNH BAY BỔNG BỀNH QUANH ĐẢO BAY CÂY ĐA
    // Tâm quỹ đạo = vị trí Đảo Bay (0, 14, -16)
    // =========================================================
    const MOON_CX = 0, MOON_CY = 14, MOON_CZ = -16;
    const n = photoList.length || 7;

    const makeOrbitFlight = (idx) => {
      const baseR  = isMobile ? 22 : 28;
      const rVar   = isMobile ?  4 : 6;
      return {
        // Quỹ đạo tròn XZ
        orbitR:     baseR + (idx % 3) * (rVar / 2) + THREE.MathUtils.randFloat(-2, 2),
        orbitSpeed: THREE.MathUtils.randFloat(0.08, 0.16) * (Math.random() > 0.5 ? 1 : -1),
        orbitAngle: (idx / n) * Math.PI * 2,   // trải đều xung quanh ngay từ đầu
        // Dao động lên xuống Y
        bobAmp:   isMobile ? THREE.MathUtils.randFloat(4, 7) : THREE.MathUtils.randFloat(5, 9),
        bobSpeed: THREE.MathUtils.randFloat(0.25, 0.55),
        bobPhase: Math.random() * Math.PI * 2,
      };
    };

    const frameWidth  = isMobile ? 4.8 : 5.6;
    const frameHeight = isMobile ? 6.2 : 7.2;

    photoList.forEach((photoItem, idx) => {
      const rf = makeOrbitFlight(idx);
      const group = new THREE.Group();

      // Map frameStyle từ config → chính xác 1-1, mỗi ảnh 1 kiểu khung riêng
      const STYLE_MAP = { palace: 0, moon_gate: 1, star: 2, heart: 3, lotus: 4, crown: 5 };
      let styleIdx = STYLE_MAP[photoItem.frameStyle] ?? (idx % 6);

      this.buildPhotoFrame(group, styleIdx, photoItem, idx, frameWidth, frameHeight, loader);

      // Vị trí ban đầu trên quỹ đạo tròn
      const initX = MOON_CX + rf.orbitR * Math.cos(rf.orbitAngle);
      const initZ = MOON_CZ + rf.orbitR * Math.sin(rf.orbitAngle);
      group.position.set(initX, MOON_CY, initZ);

      group.userData = {
        index: idx,
        photoIndex: idx,
        photoInfo: photoItem,
        orbit: rf,          // orbit physics
        baseX: initX,
        baseY: MOON_CY,     // tâm Y để bob xung quanh
        baseZ: initZ,
        MOON_CX, MOON_CY, MOON_CZ,
      };

      group.visible = true;
      this.scene.add(group);
      this.photoLanterns.push(group);
    });

    if (this.photoLanterns.length > 0) {
      this.memoryLantern = this.photoLanterns[0];
    }
  }

  // =========================================================
  // 🎨 BỘ SƯU TẬP 6 MẪU KHUNG ẢNH 3D ĐỘC BẢN LỘNG LẪY
  // =========================================================
  buildPhotoFrame(group, styleIdx, photoItem, idx, frameWidth, frameHeight, loader) {
    // Bản đồ tâm điểm nhân vật chính mặc định theo tên file ảnh
    const defaultFocalMap = {
      'IMG_4421_web.jpg': { x: 0.50, y: 0.38 },
      'IMG_7750.JPG': { x: 0.58, y: 0.35 },
      'IMG_4336.JPG': { x: 0.50, y: 0.45 },
      'IMG_7875.JPG': { x: 0.55, y: 0.45 },
      'IMG_7092.JPG': { x: 0.50, y: 0.50 },
      'IMG_7882_clean.jpg': { x: 0.50, y: 0.45 },
      'IMG_8927_web.jpg': { x: 0.50, y: 0.40 },
      'couple.jpg': { x: 0.50, y: 0.45 },
      'bennhau.jpg': { x: 0.50, y: 0.38 }
    };

    const fileName = photoItem.url ? photoItem.url.split('/').pop() : '';
    const fallbackFocal = defaultFocalMap[fileName] || { x: 0.5, y: 0.5 };
    const fx = (photoItem.focalPoint && typeof photoItem.focalPoint.x === 'number')
      ? photoItem.focalPoint.x
      : fallbackFocal.x;
    const fy = (photoItem.focalPoint && typeof photoItem.focalPoint.y === 'number')
      ? photoItem.focalPoint.y
      : fallbackFocal.y;

    const mountPhoto = (geo, w, h) => {
      loader.load(
        photoItem.url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          // Bật mipmaps và LinearMipmapLinearFilter để khử hoàn toàn răng cưa và nhấp nháy, tối ưu GPU mobile
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.anisotropy = 4;
          applyCoverCrop(tex, w, h, fx, fy);
          const mat = new THREE.MeshBasicMaterial({
            map: tex,
            side: THREE.FrontSide,
            depthTest: true,
            depthWrite: true
          });

          // Mặt trước: Z = 0.08, renderOrder = 30
          const front = new THREE.Mesh(geo, mat);
          front.position.set(0, 0, 0.08);
          front.renderOrder = 30;
          front.userData = { photoIndex: idx, isPhotoLantern: true };
          group.add(front);

          // Mặt sau đối xứng: Z = -0.08, quay 180 độ
          const back = new THREE.Mesh(geo, mat);
          back.position.set(0, 0, -0.08);
          back.rotation.y = Math.PI;
          back.renderOrder = 30;
          back.userData = { photoIndex: idx, isPhotoLantern: true };
          group.add(back);
        },
        undefined,
        (err) => {
          console.warn(`Lỗi nạp ảnh ${photoItem.url}:`, err);
          loader.load('assets/images/bennhau.jpeg', (fallbackTex) => {
            fallbackTex.colorSpace = THREE.SRGBColorSpace;
            applyCoverCrop(fallbackTex, w, h, fx, fy);
            const mat = new THREE.MeshBasicMaterial({ map: fallbackTex, side: THREE.FrontSide });
            const front = new THREE.Mesh(geo, mat);
            front.position.set(0, 0, 0.08);
            front.renderOrder = 30;
            group.add(front);
          });
        }
      );
    };

    switch (styleIdx % 6) {
      // ---------------------------------------------------------
      // MẪU 0: 🏮 ĐÈN CUNG ĐÌNH HOÀNG GIA (MÁI LẦU CÁC 2 TẦNG CONG)
      // ---------------------------------------------------------
      case 0: {
        photoItem.frameTitle = '📸 Khung Polaroid Lãng Mạn';
        const pw = frameWidth;
        const ph = frameHeight;
        const pGeo = new THREE.PlaneGeometry(pw, ph);
        mountPhoto(pGeo, pw, ph);

        // Khung Polaroid trắng ngà mềm mại
        const frameMat = new THREE.MeshStandardMaterial({
          color: 0xfaf5ef,
          roughness: 0.7,
          metalness: 0.05,
          emissive: 0xfff0db,
          emissiveIntensity: 0.15
        });
        // Viền trên, trái, phải mỏng
        const sideW = 0.35;
        const topBorder = new THREE.Mesh(new THREE.BoxGeometry(pw + sideW * 2, sideW, 0.10), frameMat);
        topBorder.position.set(0, ph / 2 + sideW / 2, 0);
        topBorder.renderOrder = 28;
        group.add(topBorder);

        const leftBorder = new THREE.Mesh(new THREE.BoxGeometry(sideW, ph, 0.10), frameMat);
        leftBorder.position.set(-pw / 2 - sideW / 2, 0, 0);
        leftBorder.renderOrder = 28;
        group.add(leftBorder);

        const rightBorder = new THREE.Mesh(new THREE.BoxGeometry(sideW, ph, 0.10), frameMat);
        rightBorder.position.set(pw / 2 + sideW / 2, 0, 0);
        rightBorder.renderOrder = 28;
        group.add(rightBorder);

        // Đáy Polaroid dày hơn (chỗ để caption)
        const bottomH = 1.6;
        const bottomBorder = new THREE.Mesh(new THREE.BoxGeometry(pw + sideW * 2, bottomH, 0.10), frameMat);
        bottomBorder.position.set(0, -ph / 2 - bottomH / 2, 0);
        bottomBorder.renderOrder = 28;
        group.add(bottomBorder);

        // Viền neon hồng mờ nhẹ phát quang quanh khung
        const neonMat = new THREE.MeshBasicMaterial({
          color: 0xff69b4,
          transparent: true,
          opacity: 0.25,
        });
        const neonOuter = new THREE.Mesh(
          new THREE.BoxGeometry(pw + sideW * 2 + 0.3, ph + sideW + bottomH + 0.3, 0.04),
          neonMat
        );
        neonOuter.position.set(0, -(bottomH - sideW) / 2, -0.02);
        neonOuter.renderOrder = 27;
        group.add(neonOuter);

        // Trái tim nhỏ xinh ở góc trên phải
        const heartMat = new THREE.MeshStandardMaterial({
          color: 0xff6b81,
          emissive: 0xff4757,
          emissiveIntensity: 0.5,
          roughness: 0.4
        });
        const heartGeo = new THREE.SphereGeometry(0.28, 12, 12);
        const heart = new THREE.Mesh(heartGeo, heartMat);
        heart.position.set(pw / 2 + 0.1, ph / 2 + 0.1, 0.12);
        heart.scale.set(1, 1.2, 0.6);
        heart.renderOrder = 29;
        group.add(heart);

        // Ánh sáng dịu nhẹ
        const light = new THREE.PointLight(0xfff0f5, 1.35, 16);
        light.position.set(0, 0, 1.2);
        group.add(light);
        break;
      }

      // ---------------------------------------------------------
      // MẪU 1: 🌕 NGUYỆT MÔN NGỌC BÍCH CUNG TRĂNG (CIRCULAR JADE MOON GATE)
      // ---------------------------------------------------------
      case 1: {
        photoItem.frameTitle = '🌕 Nguyệt Môn Ngọc Bích Cung Trăng';
        const radius = frameWidth * 0.52;
        const pGeo = new THREE.CircleGeometry(radius, 48);
        mountPhoto(pGeo, radius * 2, radius * 2);

        // Tấm nền tròn gỗ mun
        const backPlateMat = new THREE.MeshStandardMaterial({
          color: 0x221811,
          roughness: 0.5,
          metalness: 0.3
        });
        const backPlate = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.05, radius * 1.05, 0.12, 48), backPlateMat);
        backPlate.rotation.x = Math.PI / 2;
        backPlate.renderOrder = 28;
        group.add(backPlate);

        // Vành Ngọc Bích Phỉ Thúy (Imperial Jade Torus)
        const jadeMat = new THREE.MeshStandardMaterial({
          color: 0x1dd1a1,
          roughness: 0.2,
          metalness: 0.25,
          emissive: 0x0f4c5c,
          emissiveIntensity: 0.35
        });
        const jadeRing = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.02, 0.26, 16, 48), jadeMat);
        jadeRing.renderOrder = 28;
        group.add(jadeRing);

        // Vành vàng hoàng gia bao ngoài
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xf6d365,
          roughness: 0.3,
          metalness: 0.85,
          emissive: 0x996515,
          emissiveIntensity: 0.3
        });
        const goldRing = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.14, 0.10, 16, 48), goldMat);
        goldRing.renderOrder = 28;
        group.add(goldRing);

        // Nút thắt Cát Tường hoa sen đỏ trên đỉnh
        const knotMat = new THREE.MeshStandardMaterial({
          color: 0xd90429,
          roughness: 0.3,
          emissive: 0x7f0000,
          emissiveIntensity: 0.4
        });
        const knot = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.14, 8, 24), knotMat);
        knot.position.set(0, radius * 1.25, 0);
        knot.renderOrder = 28;
        group.add(knot);

        // Chuỗi ngọc và tua rua ngọc rủ dài
        const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), jadeMat);
        b1.position.set(0, -radius * 1.15, 0);
        b1.renderOrder = 28;
        group.add(b1);

        const tasselMat = new THREE.MeshStandardMaterial({
          color: 0x1dd1a1,
          emissive: 0x0f4c5c,
          emissiveIntensity: 0.25
        });
        const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.24, 2.2, 8), tasselMat);
        tassel.position.set(0, -radius * 1.15 - 1.2, 0);
        tassel.renderOrder = 28;
        group.add(tassel);

        const light = new THREE.PointLight(0xd4f1f4, 1.45, 18);
        light.position.set(0, radius * 1.1, 0.8);
        group.add(light);
        break;
      }

      // ---------------------------------------------------------
      // MẪU 2: ⭐ ĐÈN ÔNG SAO TRUNG THU TRUYỀN THỐNG (STAR LANTERN)
      // ---------------------------------------------------------
      case 2: {
        photoItem.frameTitle = '⭐ Đèn Ông Sao Truyền Thống';
        const starRadius = frameWidth * 0.42;
        const pGeo = new THREE.CircleGeometry(starRadius, 40);
        mountPhoto(pGeo, starRadius * 2, starRadius * 2);

        // Dựng Ngôi Sao 5 Cánh 3D bằng Shape
        const starShape = new THREE.Shape();
        const points = 5;
        const outerR = frameWidth * 0.88;
        const innerR = starRadius * 1.05;

        for (let i = 0; i < points * 2; i++) {
          const r = (i % 2 === 0) ? outerR : innerR;
          const a = (i * Math.PI) / points - Math.PI / 2;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) starShape.moveTo(px, py);
          else starShape.lineTo(px, py);
        }
        starShape.closePath();

        // Tấm nền sao màu đỏ son truyền thống
        const starMat = new THREE.MeshStandardMaterial({
          color: 0xd90429,
          roughness: 0.35,
          emissive: 0x9e1a1a,
          emissiveIntensity: 0.35,
          side: THREE.DoubleSide
        });
        const starMesh = new THREE.Mesh(new THREE.ShapeGeometry(starShape), starMat);
        starMesh.renderOrder = 28;
        group.add(starMesh);

        // Vòng tròn tre truyền thống trợ lực bao quanh 5 cánh
        const hoopMat = new THREE.MeshStandardMaterial({
          color: 0xf4a261,
          roughness: 0.4,
          metalness: 0.4,
          emissive: 0xe76f51,
          emissiveIntensity: 0.25
        });
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(frameWidth * 0.58, 0.12, 12, 48), hoopMat);
        hoop.renderOrder = 28;
        group.add(hoop);

        // Viền vàng kim ôm sát tâm ảnh tròn
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xffd166,
          roughness: 0.25,
          metalness: 0.85,
          emissive: 0xffaa00,
          emissiveIntensity: 0.3
        });
        const hubRing = new THREE.Mesh(new THREE.TorusGeometry(starRadius * 1.05, 0.14, 12, 40), goldMat);
        hubRing.renderOrder = 28;
        group.add(hubRing);

        // Tua rua giấy vàng ở đỉnh đáy
        const tMat = new THREE.MeshStandardMaterial({
          color: 0xffd166,
          metalness: 0.6,
          emissive: 0xffaa00,
          emissiveIntensity: 0.25
        });
        const bottomTassel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.20, 1.8, 8), tMat);
        bottomTassel.position.set(0, -outerR - 0.9, 0);
        bottomTassel.renderOrder = 28;
        group.add(bottomTassel);

        const light = new THREE.PointLight(0xffa834, 1.5, 18);
        light.position.set(0, 0, 1.0);
        group.add(light);
        break;
      }

      // ---------------------------------------------------------
      // MẪU 3: 💖 TRÁI TIM TÌNH YÊU VĨNH CỬU (ROMANTIC ROSE-GOLD HEART)
      // ---------------------------------------------------------
      case 3: {
        photoItem.frameTitle = '💖 Trái Tim Tình Yêu Vĩnh Cửu';
        const pw = frameWidth * 0.92;
        const ph = frameHeight * 0.88;
        const pGeo = new THREE.PlaneGeometry(pw, ph);
        mountPhoto(pGeo, pw, ph);

        // Tấm nền nhung đỏ rượu vang hình Trái Tim bao bọc
        const heartShape = new THREE.Shape();
        const s = frameWidth * 0.24;
        heartShape.moveTo(0, s * 1.6);
        heartShape.bezierCurveTo(0, s * 3.0, -s * 3.0, s * 3.0, -s * 3.0, s * 0.9);
        heartShape.bezierCurveTo(-s * 3.0, -s * 1.0, -s * 1.4, -s * 2.3, 0, -s * 3.6);
        heartShape.bezierCurveTo(s * 1.4, -s * 2.3, s * 3.0, -s * 1.0, s * 3.0, s * 0.9);
        heartShape.bezierCurveTo(s * 3.0, s * 3.0, 0, s * 3.0, 0, s * 1.6);

        const heartPlateMat = new THREE.MeshStandardMaterial({
          color: 0x590d22,
          roughness: 0.6,
          emissive: 0x800f2f,
          emissiveIntensity: 0.35,
          side: THREE.DoubleSide
        });
        const heartPlate = new THREE.Mesh(new THREE.ShapeGeometry(heartShape), heartPlateMat);
        heartPlate.position.set(0, 0, -0.02);
        heartPlate.renderOrder = 28;
        group.add(heartPlate);

        // Viền Trái Tim Vàng Hồng (Rose Gold) bao trọn bên ngoài
        const roseGoldMat = new THREE.MeshStandardMaterial({
          color: 0xf4a0b0,
          roughness: 0.25,
          metalness: 0.85,
          emissive: 0xd4637a,
          emissiveIntensity: 0.3,
          side: THREE.DoubleSide
        });
        const heartOuterShape = new THREE.Shape();
        const s2 = s * 1.12;
        heartOuterShape.moveTo(0, s2 * 1.6);
        heartOuterShape.bezierCurveTo(0, s2 * 3.0, -s2 * 3.0, s2 * 3.0, -s2 * 3.0, s2 * 0.9);
        heartOuterShape.bezierCurveTo(-s2 * 3.0, -s2 * 1.0, -s2 * 1.4, -s2 * 2.3, 0, -s2 * 3.6);
        heartOuterShape.bezierCurveTo(s2 * 1.4, -s2 * 2.3, s2 * 3.0, -s2 * 1.0, s2 * 3.0, s2 * 0.9);
        heartOuterShape.bezierCurveTo(s2 * 3.0, s2 * 3.0, 0, s2 * 3.0, 0, s2 * 1.6);

        const heartRim = new THREE.Mesh(new THREE.ShapeGeometry(heartOuterShape), roseGoldMat);
        heartRim.position.set(0, 0, -0.04);
        heartRim.renderOrder = 27;
        group.add(heartRim);

        // Khung viền thanh nhã ôm khít tấm ảnh
        const border = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.3, ph + 0.3, 0.10), roseGoldMat);
        border.position.set(0, 0, 0);
        border.renderOrder = 28;
        group.add(border);

        // Đôi cánh thiên thần trắng ngọc trên đỉnh
        const wingMat = new THREE.MeshStandardMaterial({
          color: 0xffccd5,
          roughness: 0.3,
          metalness: 0.6,
          emissive: 0xff758f,
          emissiveIntensity: 0.3
        });
        const wingGeo = new THREE.ConeGeometry(0.7, 2.2, 4);
        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(-pw * 0.38, ph / 2 + 0.6, 0);
        leftWing.rotation.z = Math.PI / 3.5;
        leftWing.renderOrder = 28;
        group.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(pw * 0.38, ph / 2 + 0.6, 0);
        rightWing.rotation.z = -Math.PI / 3.5;
        rightWing.renderOrder = 28;
        group.add(rightWing);

        // Đính 2 viên ngọc trai phát quang ở 2 góc trên
        const pearlMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.15,
          emissive: 0xffb3c1,
          emissiveIntensity: 0.4
        });
        const pearlGeo = new THREE.SphereGeometry(0.18, 12, 12);
        [-1, 1].forEach(dir => {
          const p = new THREE.Mesh(pearlGeo, pearlMat);
          p.position.set(dir * (pw / 2 + 0.2), ph / 2 + 0.2, 0.08);
          p.renderOrder = 28;
          group.add(p);
        });

        // Tua rua lụa hồng pastel đung đưa
        const tasselMat = new THREE.MeshStandardMaterial({
          color: 0xff758f,
          emissive: 0xa4133c,
          emissiveIntensity: 0.25
        });
        const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.24, 2.0, 8), tasselMat);
        tassel.position.set(0, -ph / 2 - 1.1, 0);
        tassel.renderOrder = 28;
        group.add(tassel);

        const light = new THREE.PointLight(0xffb3c1, 1.4, 18);
        light.position.set(0, ph / 2 + 0.8, 0.8);
        group.add(light);
        break;
      }

      // ---------------------------------------------------------
      // MẪU 4: 🪷 ĐÈN LỤC GIÁC HOA SEN PHỐ CỔ (HEXAGONAL LOTUS PAVILION)
      // ---------------------------------------------------------
      case 4: {
        photoItem.frameTitle = '🌈 Khung Mây Mộng Mơ';
        const pw = frameWidth * 0.92;
        const ph = frameHeight * 0.92;
        const pGeo = new THREE.PlaneGeometry(pw, ph);
        mountPhoto(pGeo, pw, ph);

        // Khung bo tròn pastel gradient (tím hồng → xanh dương nhạt)
        const frameMat = new THREE.MeshStandardMaterial({
          color: 0xc9b1ff,
          roughness: 0.6,
          metalness: 0.15,
          emissive: 0x9b59b6,
          emissiveIntensity: 0.2
        });
        // Viền khung bo tròn mềm mại
        const border = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.5, ph + 0.5, 0.10), frameMat);
        border.renderOrder = 28;
        group.add(border);

        // Viền ngoài pastel xanh dương nhạt
        const outerMat = new THREE.MeshStandardMaterial({
          color: 0xa8d8ea,
          roughness: 0.5,
          metalness: 0.1,
          emissive: 0x74b9ff,
          emissiveIntensity: 0.15
        });
        const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.9, ph + 0.9, 0.06), outerMat);
        outerFrame.position.z = -0.02;
        outerFrame.renderOrder = 27;
        group.add(outerFrame);

        // Đám mây nhỏ xinh trên đỉnh
        const cloudMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.9,
          metalness: 0.0,
          emissive: 0xf8e8ff,
          emissiveIntensity: 0.3
        });
        const cloudGroup = new THREE.Group();
        cloudGroup.position.set(0, ph / 2 + 0.6, 0.08);

        const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), cloudMat);
        c1.position.set(-0.3, 0, 0);
        c1.scale.set(1.2, 0.7, 0.5);
        cloudGroup.add(c1);

        const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), cloudMat);
        c2.position.set(0.2, 0.1, 0);
        c2.scale.set(1.3, 0.8, 0.5);
        cloudGroup.add(c2);

        const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), cloudMat);
        c3.position.set(0.7, -0.05, 0);
        c3.scale.set(1.0, 0.6, 0.5);
        cloudGroup.add(c3);

        cloudGroup.renderOrder = 29;
        group.add(cloudGroup);

        // 3 ngôi sao nhỏ lấp lánh rải quanh
        const sparkMat = new THREE.MeshStandardMaterial({
          color: 0xffeaa7,
          emissive: 0xfdcb6e,
          emissiveIntensity: 0.7,
          roughness: 0.3
        });
        const sparkGeo = new THREE.OctahedronGeometry(0.18, 0);
        [
          { x: -pw / 2 - 0.2, y: ph / 2 - 0.5 },
          { x: pw / 2 + 0.25, y: -0.3 },
          { x: -pw / 2 + 0.8, y: -ph / 2 - 0.15 }
        ].forEach(pos => {
          const spark = new THREE.Mesh(sparkGeo, sparkMat);
          spark.position.set(pos.x, pos.y, 0.12);
          spark.rotation.z = Math.PI / 4;
          spark.renderOrder = 29;
          group.add(spark);
        });

        // Ánh sáng mộng mơ
        const light = new THREE.PointLight(0xe8d5f5, 1.3, 16);
        light.position.set(0, 0, 1.2);
        group.add(light);
        break;
      }

      // ---------------------------------------------------------
      // MẪU 5: 👑 KHUNG GƯƠNG VƯƠNG MIỆN CÔNG CHÚA (PRINCESS CROWN MIRROR)
      // ---------------------------------------------------------
      case 5:
      default: {
        photoItem.frameTitle = '👑 Khung Gương Vương Miện Công Chúa';
        const pw = frameWidth * 0.94;
        const ph = frameHeight * 0.94;
        const pGeo = new THREE.PlaneGeometry(pw, ph);
        mountPhoto(pGeo, pw, ph);

        // Khung gương mạ vàng Baroque hoàng gia
        const borderMat = new THREE.MeshStandardMaterial({
          color: 0xf39c12,
          roughness: 0.25,
          metalness: 0.85,
          emissive: 0xb7791f,
          emissiveIntensity: 0.25
        });
        const border = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.6, ph + 0.6, 0.12), borderMat);
        border.renderOrder = 28;
        group.add(border);

        // Vương Miện Công Chúa (Princess Tiara / Crown) trên đỉnh
        const crownGroup = new THREE.Group();
        crownGroup.position.set(0, ph / 2 + 0.3, 0);

        // Vòng cung chân vương miện
        const crownBase = new THREE.Mesh(new THREE.BoxGeometry(pw * 0.8, 0.2, 0.15), borderMat);
        crownGroup.add(crownBase);

        // 5 đỉnh chóp vương miện
        const peakGeo = new THREE.ConeGeometry(0.18, 0.8, 4);
        const peakOffsets = [-pw * 0.32, -pw * 0.16, 0, pw * 0.16, pw * 0.32];
        const peakHeights = [0.6, 0.9, 1.25, 0.9, 0.6];

        peakOffsets.forEach((xOff, pIdx) => {
          const peak = new THREE.Mesh(peakGeo, borderMat);
          peak.scale.set(1, peakHeights[pIdx], 1);
          peak.position.set(xOff, 0.45 * peakHeights[pIdx], 0);
          crownGroup.add(peak);
        });

        // Viên Hồng Ngọc (Heart Ruby) tỏa sáng rực rỡ ngay chính giữa
        const rubyMat = new THREE.MeshStandardMaterial({
          color: 0xe63946,
          roughness: 0.15,
          metalness: 0.6,
          emissive: 0xff0054,
          emissiveIntensity: 0.65
        });
        const ruby = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), rubyMat);
        ruby.position.set(0, 0.7, 0.08);
        crownGroup.add(ruby);

        crownGroup.renderOrder = 28;
        group.add(crownGroup);

        // 4 viên Lam Ngọc (Sapphire) ở 4 góc khung ảnh
        const sapphireMat = new THREE.MeshStandardMaterial({
          color: 0x0077b6,
          roughness: 0.2,
          metalness: 0.6,
          emissive: 0x03045e,
          emissiveIntensity: 0.5
        });
        const sapphireGeo = new THREE.OctahedronGeometry(0.22);
        [
          [-pw / 2 - 0.15, -ph / 2 - 0.15],
          [pw / 2 + 0.15, -ph / 2 - 0.15],
          [-pw / 2 - 0.15, ph / 2 + 0.15],
          [pw / 2 + 0.15, ph / 2 + 0.15]
        ].forEach(([x, y]) => {
          const s = new THREE.Mesh(sapphireGeo, sapphireMat);
          s.position.set(x, y, 0.08);
          s.renderOrder = 28;
          group.add(s);
        });

        // Tua rua chuỗi hạt óng ánh bên dưới
        const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.22, 2.0, 8), borderMat);
        tassel.position.set(0, -ph / 2 - 1.1, 0);
        tassel.renderOrder = 28;
        group.add(tassel);

        const light = new THREE.PointLight(0xfff0f6, 1.45, 18);
        light.position.set(0, ph / 2 + 0.8, 0.8);
        group.add(light);
        break;
      }
    }
  }

  // Cập nhật ảnh hiển thị trên đèn lồng 3D khi cần thiết
  updateLanternPhoto(url) {
    if (!this.photoLanterns || this.photoLanterns.length === 0) return;
    const loader = new THREE.TextureLoader();
    loader.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const targetGroup = this.photoLanterns[0];
      if (targetGroup) {
        targetGroup.traverse(child => {
          if (child.isMesh && child.material && child.material.map) {
            child.material.map = texture;
            child.material.emissiveMap = texture;
            child.material.needsUpdate = true;
          }
        });
      }
    });
  }

  // =========================================================
  // 2. TẠO HÀNG CHỤC ĐÈN TRỜI (THIÊN ĐĂNG) BAY LÊN CUNG TRĂNG
  // =========================================================
  createSkyLanterns(count) {
    for (let i = 0; i < count; i++) {
      const lantern = this.buildSingleSkyLantern(THREE.MathUtils.randFloat(1.5, 2.2));
      // Phân bố độ cao và vị trí ngẫu nhiên
      lantern.position.set(
        THREE.MathUtils.randFloatSpread(180),
        THREE.MathUtils.randFloat(-60, 100),
        THREE.MathUtils.randFloat(-180, 20)
      );
      this.scene.add(lantern);
      this.skyLanterns.push(lantern);
    }
  }

  buildSingleSkyLantern(scale = 1.0) {
    const style = Math.floor(Math.random() * 8);
    switch (style) {
      case 0: return this._buildClassicLantern(scale);
      case 1: return this._buildRedSilkLantern(scale);
      case 2: return this._buildPinkHeartLantern(scale);
      case 3: return this._buildJadeLantern(scale);
      case 4: return this._buildGoldenStarLantern(scale);
      case 5: return this._buildCrystalLantern(scale);
      case 6: return this._buildClusterLantern(scale);
      case 7: return this._buildPaperBallLantern(scale);
      default: return this._buildClassicLantern(scale);
    }
  }

  // Kiểu 0: 🏮 Đèn lồng truyền thống cam ấm
  _buildClassicLantern(scale = 1.0) {
    const group = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(1.6 * scale, 1.2 * scale, 3.2 * scale, 16, 1, true);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffaa33, emissive: 0xff7700, emissiveIntensity: 0.85,
      roughness: 0.35, side: THREE.DoubleSide, transparent: true, opacity: 0.95
    });
    group.add(new THREE.Mesh(bodyGeo, bodyMat));

    const ringGeo = new THREE.TorusGeometry(1.2 * scale, 0.08 * scale, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x8b5a2b });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.6 * scale;
    group.add(ring);

    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.35 * scale, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfff3cc }));
    flame.position.y = -1.1 * scale;
    group.add(flame);

    this._addLanternPhysics(group, scale);
    return group;
  }

  // Kiểu 1: 🔴 Đèn lồng lụa đỏ tròn (Chinese style)
  _buildRedSilkLantern(scale = 1.0) {
    const group = new THREE.Group();
    const s = scale * 1.1;

    // Thân tròn bầu dục
    const bodyGeo = new THREE.SphereGeometry(1.8 * s, 16, 12);
    bodyGeo.scale(1, 1.3, 1);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xcc2222, emissive: 0xaa0000, emissiveIntensity: 0.75,
      roughness: 0.4, side: THREE.DoubleSide, transparent: true, opacity: 0.92
    });
    group.add(new THREE.Mesh(bodyGeo, bodyMat));

    // Vành vàng trên dưới
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, metalness: 0.7, roughness: 0.3
    });
    const ringGeo = new THREE.TorusGeometry(1.0 * s, 0.1 * s, 8, 24);
    [1.8, -1.8].forEach(yOff => {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = yOff * s;
      group.add(ring);
    });

    // Tua rua vàng bên dưới
    const tasselGeo = new THREE.CylinderGeometry(0.04 * s, 0.12 * s, 1.2 * s, 6);
    const tassel = new THREE.Mesh(tasselGeo, ringMat);
    tassel.position.y = -2.6 * s;
    group.add(tassel);

    // Ánh lửa bên trong
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.5 * s, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffeecc }));
    group.add(flame);

    this._addLanternPhysics(group, scale);
    return group;
  }

  // Kiểu 2: 💗 Đèn lồng trái tim hồng
  _buildPinkHeartLantern(scale = 1.0) {
    const group = new THREE.Group();
    const s = scale * 0.9;

    // Thân hình trứng hồng
    const bodyGeo = new THREE.SphereGeometry(1.5 * s, 12, 10);
    bodyGeo.scale(1.1, 1.4, 0.9);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff69b4, emissive: 0xff1493, emissiveIntensity: 0.7,
      roughness: 0.45, side: THREE.DoubleSide, transparent: true, opacity: 0.9
    });
    group.add(new THREE.Mesh(bodyGeo, bodyMat));

    // Trái tim nhỏ trên đỉnh
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xff4081, emissive: 0xff0050, emissiveIntensity: 0.8, roughness: 0.3
    });
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.4 * s, 8, 8), heartMat);
    heart.position.y = 2.0 * s;
    heart.scale.set(1.2, 1, 0.6);
    group.add(heart);

    // Viền trắng ngọc
    const pearlRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.2 * s, 0.06 * s, 8, 20),
      new THREE.MeshBasicMaterial({ color: 0xfff0f5 })
    );
    pearlRing.rotation.x = Math.PI / 2;
    pearlRing.position.y = -1.5 * s;
    group.add(pearlRing);

    // Lửa hồng nhẹ
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.35 * s, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe0ec }));
    flame.position.y = -0.5 * s;
    group.add(flame);

    this._addLanternPhysics(group, scale);
    return group;
  }

  // Kiểu 3: 🟢 Đèn lồng ngọc bích xanh (Jade Lantern)
  _buildJadeLantern(scale = 1.0) {
    const group = new THREE.Group();
    const s = scale;

    // Thân lục giác
    const bodyGeo = new THREE.CylinderGeometry(1.4 * s, 1.4 * s, 3.0 * s, 6, 1, true);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2ecc71, emissive: 0x0a8f4f, emissiveIntensity: 0.65,
      roughness: 0.3, side: THREE.DoubleSide, transparent: true, opacity: 0.88
    });
    group.add(new THREE.Mesh(bodyGeo, bodyMat));

    // Nắp đỉnh vàng
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xf0c040, metalness: 0.7, roughness: 0.3
    });
    const topCap = new THREE.Mesh(new THREE.ConeGeometry(1.0 * s, 0.8 * s, 6), capMat);
    topCap.position.y = 1.9 * s;
    group.add(topCap);

    // Đế dưới vàng
    const bottomCap = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5 * s, 1.2 * s, 0.3 * s, 6), capMat);
    bottomCap.position.y = -1.65 * s;
    group.add(bottomCap);

    // Lửa xanh lục nhạt
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.3 * s, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xccffcc }));
    flame.position.y = -0.8 * s;
    group.add(flame);

    this._addLanternPhysics(group, scale);
    return group;
  }

  // Kiểu 4: ⭐ Đèn lồng ngôi sao vàng
  _buildGoldenStarLantern(scale = 1.0) {
    const group = new THREE.Group();
    const s = scale * 0.95;

    // Thân hình bát giác
    const bodyGeo = new THREE.CylinderGeometry(1.3 * s, 1.6 * s, 2.8 * s, 8, 1, true);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffc800, emissive: 0xff9500, emissiveIntensity: 0.8,
      roughness: 0.35, side: THREE.DoubleSide, transparent: true, opacity: 0.93
    });
    group.add(new THREE.Mesh(bodyGeo, bodyMat));

    // Ngôi sao trên đỉnh
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfff000, emissive: 0xffcc00, emissiveIntensity: 1.0,
      roughness: 0.2, metalness: 0.5
    });
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.5 * s, 0), starMat);
    star.position.y = 2.0 * s;
    star.rotation.z = Math.PI / 4;
    group.add(star);

    // Viền bạc 2 đầu
    const silverMat = new THREE.MeshBasicMaterial({ color: 0xe0e0e0 });
    const ringGeo = new THREE.TorusGeometry(1.1 * s, 0.06 * s, 8, 20);
    [1.4, -1.4].forEach(y => {
      const ring = new THREE.Mesh(ringGeo, silverMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y * s;
      group.add(ring);
    });

    // Lửa vàng sáng
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.4 * s, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfff8dc }));
    flame.position.y = -0.8 * s;
    group.add(flame);

    this._addLanternPhysics(group, scale);
    return group;
  }

  // Kiểu 5: 💠 Đèn lồng pha lê giọt nước xanh băng
  _buildCrystalLantern(scale = 1.0) {
    const group = new THREE.Group();
    const s = scale * 0.9;

    // Thân hình giọt nước
    const bodyGeo = new THREE.SphereGeometry(1.4 * s, 12, 10);
    bodyGeo.scale(0.85, 1.4, 0.85);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x88ddff, emissive: 0x0088cc, emissiveIntensity: 0.6,
      metalness: 0.2, roughness: 0.1,
      transparent: true, opacity: 0.82, side: THREE.DoubleSide
    });
    group.add(new THREE.Mesh(bodyGeo, bodyMat));

    // Vành pha lê trên
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.05 });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.9 * s, 0.07 * s, 8, 20), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.5 * s;
    group.add(rim);

    // Tua rua băng dưới
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const icicle = new THREE.Mesh(
        new THREE.ConeGeometry(0.08 * s, THREE.MathUtils.randFloat(0.6, 1.2) * s, 4),
        new THREE.MeshBasicMaterial({ color: 0xaaeeff, transparent: true, opacity: 0.75 })
      );
      icicle.position.set(Math.cos(angle) * 0.7 * s, -1.8 * s, Math.sin(angle) * 0.7 * s);
      group.add(icicle);
    }

    const light = new THREE.PointLight(0x44ccff, 0.5, 10);
    light.position.set(0, 0, 0);
    group.add(light);

    this._addLanternPhysics(group, scale);
    return group;
  }

  // Kiểu 6: 🍇 Đèn lồng chùm (3 quả cầu nhỏ)
  _buildClusterLantern(scale = 1.0) {
    const group = new THREE.Group();
    const s = scale * 0.85;
    const colors = [0xff66aa, 0xffaa33, 0x88ffcc];
    const emissives = [0xcc0066, 0xff6600, 0x00bb88];
    const offsets = [
      { x: 0, y: 0 }, { x: -1.4, y: -1.6 }, { x: 1.4, y: -1.6 }
    ];

    offsets.forEach((off, i) => {
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.9 * s, 12, 10),
        new THREE.MeshStandardMaterial({
          color: colors[i], emissive: emissives[i], emissiveIntensity: 0.8,
          roughness: 0.3, transparent: true, opacity: 0.9
        })
      );
      ball.position.set(off.x * s, off.y * s, 0);
      group.add(ball);

      // Dây nối giữa các quả
      if (i > 0) {
        const from = new THREE.Vector3(0, 0, 0);
        const to = new THREE.Vector3(off.x * s, off.y * s, 0);
        const len = from.distanceTo(to);
        const cord = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04 * s, 0.04 * s, len, 4),
          new THREE.MeshBasicMaterial({ color: 0xffd700 })
        );
        cord.position.copy(from.clone().lerp(to, 0.5));
        cord.lookAt(to);
        cord.rotateX(Math.PI / 2);
        group.add(cord);
      }

      const light = new THREE.PointLight(colors[i], 0.35, 8);
      light.position.set(off.x * s, off.y * s, 0);
      group.add(light);
    });

    this._addLanternPhysics(group, scale);
    return group;
  }

  // Kiểu 7: ⚪ Đèn lồng giấy xếp hình cầu (origami ball)
  _buildPaperBallLantern(scale = 1.0) {
    const group = new THREE.Group();
    const s = scale * 1.0;
    const colors = [0xffccdd, 0xffeebb, 0xddffee, 0xddccff];
    const panelCount = 8;

    for (let i = 0; i < panelCount; i++) {
      const angle = (i / panelCount) * Math.PI * 2;
      const col = colors[i % colors.length];
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.1 * s, 2.2 * s),
        new THREE.MeshStandardMaterial({
          color: col, emissive: col, emissiveIntensity: 0.4,
          roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.88
        })
      );
      panel.rotation.y = angle;
      panel.position.set(Math.cos(angle) * 0.8 * s, 0, Math.sin(angle) * 0.8 * s);
      group.add(panel);
    }

    // Vành giấy trên dưới
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xffccaa });
    [1.1, -1.1].forEach(yy => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.85 * s, 0.07 * s, 6, 18), rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = yy * s;
      group.add(rim);
    });

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.4 * s, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfff2cc })
    );
    flame.position.y = -0.8 * s;
    group.add(flame);

    const light = new THREE.PointLight(0xffeecc, 0.55, 10);
    group.add(light);

    this._addLanternPhysics(group, scale);
    return group;
  }

  // Helper: thêm physics metadata cho đèn lồng bay
  _addLanternPhysics(group, scale) {
    group.userData = {
      speedY: THREE.MathUtils.randFloat(0.08, 0.18),
      swaySpeed: THREE.MathUtils.randFloat(0.8, 1.6),
      swayOffset: Math.random() * Math.PI * 2,
      rotSpeed: THREE.MathUtils.randFloat(0.003, 0.008),
      scale: scale
    };
  }

  // =========================================================
  // 3. THẢ ĐÈN TRỜI ƯỚC NGUYỆN CÁ NHÂN HÓA (WISH LANTERN)
  // =========================================================
  spawnWishLantern(wishText) {
    const scale = 1.6;
    const group = new THREE.Group();

    // Tạo texture chữ viết điều ước in trực tiếp lên thân đèn
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Nền giấy đèn lồng hoàng kim
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
    bgGrad.addColorStop(0, '#ff9e00');
    bgGrad.addColorStop(0.5, '#ff6000');
    bgGrad.addColorStop(1, '#ff3c00');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 256);

    // Khung họa tiết hoa văn truyền thống
    ctx.strokeStyle = '#ffeaa7';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, 488, 232);

    // Chữ điều ước
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Quicksand", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;

    // Ngắt dòng tự động
    const words = wishText.split(' ');
    let line = '';
    const lines = [];
    const maxChars = 22;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      if (testLine.length > maxChars && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const startY = 128 - ((lines.length - 1) * 30) / 2;
    lines.forEach((l, idx) => {
      ctx.fillText(l.trim(), 256, startY + idx * 30);
    });

    const wishTex = new THREE.CanvasTexture(canvas);
    wishTex.wrapS = THREE.RepeatWrapping;

    const lanternGeo = new THREE.CylinderGeometry(2.0 * scale, 1.5 * scale, 4.2 * scale, 24, 1, true);
    const lanternMat = new THREE.MeshStandardMaterial({
      map: wishTex,
      emissive: 0xff6600,
      emissiveIntensity: 0.9,
      emissiveMap: wishTex,
      side: THREE.DoubleSide,
      roughness: 0.3
    });

    const bodyMesh = new THREE.Mesh(lanternGeo, lanternMat);
    group.add(bodyMesh);

    // Vành đáy
    const bottomRingGeo = new THREE.TorusGeometry(1.5 * scale, 0.1 * scale, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
    const bottomRing = new THREE.Mesh(bottomRingGeo, ringMat);
    bottomRing.rotation.x = Math.PI / 2;
    bottomRing.position.y = -2.1 * scale;
    group.add(bottomRing);

    // Ánh sáng rực rỡ đặc biệt cho đèn điều ước
    const light = new THREE.PointLight(0xffbe0b, 3.5, 35);
    group.add(light);

    // Hào quang vàng bao bọc đèn điều ước
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 128;
    haloCanvas.height = 128;
    const hCtx = haloCanvas.getContext('2d');
    const hGrad = hCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
    hGrad.addColorStop(0, 'rgba(255, 220, 100, 0.8)');
    hGrad.addColorStop(0.5, 'rgba(255, 140, 0, 0.3)');
    hGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    hCtx.fillStyle = hGrad;
    hCtx.fillRect(0, 0, 128, 128);

    const haloTex = new THREE.CanvasTexture(haloCanvas);
    const haloSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTex,
      blending: THREE.AdditiveBlending,
      transparent: true
    }));
    haloSprite.scale.set(10, 10, 1);
    group.add(haloSprite);

    // Xuất phát từ phía trước người nhìn (dưới góc nhìn camera)
    group.position.set(
      THREE.MathUtils.randFloatSpread(10),
      -14,
      THREE.MathUtils.randFloat(5, 15)
    );

    group.userData = {
      speedY: 0.22,
      targetY: 140,
      swaySpeed: 1.2,
      swayOffset: Math.random() * Math.PI,
      rotSpeed: 0.006,
      isWish: true
    };

    this.scene.add(group);
    this.wishLanterns.push(group);

    return group;
  }

  // =========================================================
  // CẬP NHẬT HOẠT ẢNH MỖI FRAME
  // =========================================================
  update(delta, camera) {
    const time = Date.now() * 0.001;

    // 1. Hoạt ảnh Đèn Ông Sao
    if (this.starLantern) {
      // Đèn ông sao xoay nhẹ nhàng trong gió
      this.starLantern.rotation.y += 0.004;
      this.starLantern.position.y += Math.sin(time * 1.5) * 0.02;

      // Ánh nến bên trong lập lòe chân thực
      if (this.candleLight) {
        this.candleLight.intensity = 2.5 + Math.sin(time * 12) * 0.4 + Math.cos(time * 19) * 0.2;
      }

      // Tua rua đuôi đèn đung đưa theo gió
      this.tassels.forEach(t => {
        t.rotation.z = Math.sin(time * t.userData.speed) * 0.18;
      });
    }

    // 1C. Khung ảnh xoay vòng quanh mặt trăng + lên xuống
    if (this.photoLanterns && this.photoLanterns.length > 0) {
      this.photoLanterns.forEach((pl, idx) => {
        const orb = pl.userData.orbit;
        if (!orb) return;

        const cx = pl.userData.MOON_CX;
        const cy = pl.userData.MOON_CY;
        const cz = pl.userData.MOON_CZ;

        if (this.focusedPhotoIndex === idx) {
          // Khi đang được focus ngắm nhìn: khóa X, Z và lơ lửng nhẹ nhàng Y, không bị trôi giật
          if (pl.userData.lockedPos === undefined) {
            pl.userData.lockedPos = { x: pl.position.x, y: pl.position.y, z: pl.position.z };
          }
          const hoverY = Math.sin(time * 1.5) * 0.12;
          pl.position.set(
            pl.userData.lockedPos.x,
            pl.userData.lockedPos.y + hoverY,
            pl.userData.lockedPos.z
          );
        } else {
          pl.userData.lockedPos = undefined;
          // Tiến góc quỹ đạo
          orb.orbitAngle += orb.orbitSpeed * 0.016; // ~60fps

          // Vị trí trên vòng tròn XZ quanh tâm trăng
          pl.position.x = cx + orb.orbitR * Math.cos(orb.orbitAngle);
          pl.position.z = cz + orb.orbitR * Math.sin(orb.orbitAngle);

          // Lên xuống theo sin — mỗi khung pha riêng
          pl.position.y = cy + Math.sin(time * orb.bobSpeed + orb.bobPhase) * orb.bobAmp;
        }

        // Billboard: luôn quay mặt về phía camera
        if (camera) pl.lookAt(camera.position);
      });
    }

    // 2. Hoạt ảnh đàn Thiên Đăng tự do bay lên trời
    this.skyLanterns.forEach(lantern => {
      lantern.position.y += lantern.userData.speedY;
      lantern.position.x += Math.sin(time * lantern.userData.swaySpeed + lantern.userData.swayOffset) * 0.04;
      lantern.rotation.y += lantern.userData.rotSpeed;

      // Khi bay lên quá cao, đưa về phía dưới để bay lên tiếp tạo dòng liên tục
      if (lantern.position.y > 150) {
        lantern.position.y = -65;
        lantern.position.x = THREE.MathUtils.randFloatSpread(180);
      }
    });

    // 3. Hoạt ảnh Đèn Ước Nguyện bay vút lên Cung Trăng
    for (let i = this.wishLanterns.length - 1; i >= 0; i--) {
      const wish = this.wishLanterns[i];
      wish.position.y += wish.userData.speedY;
      // Nhẹ nhàng hướng về phía Cung Trăng (tâm [0, 35, -70])
      wish.position.x += (0 - wish.position.x) * 0.002;
      wish.position.z += (-70 - wish.position.z) * 0.002;
      wish.rotation.y += wish.userData.rotSpeed;

      // Khi đã bay rất xa lên Cung Trăng
      if (wish.position.y > wish.userData.targetY) {
        // Giữ lại hoặc để nó lơ lửng quanh cung trăng
        wish.userData.speedY = 0.02;
      }
    }
  }
}
