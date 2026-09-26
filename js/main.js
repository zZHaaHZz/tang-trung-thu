// =========================================================
// 🚀 MAIN APPLICATION ENTRY POINT (THREE.JS ORCHESTRATION)
// =========================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import CONFIG, { isMobileDevice } from './config.js';
import { AudioManager } from './audio.js';
import { Starfield } from './stars.js';
import { Moon } from './moon.js';
import { FloatingIsland } from './island.js';
import { LanternManager } from './lanterns.js';
import { FireworkManager } from './fireworks.js';

class MidAutumnApp {
  constructor() {
    window.app = this;
    this.config = CONFIG || window.CONFIG || {};
    window.CONFIG = this.config;
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    // Giai đoạn 1: Preloader (luôn chạy)
    try {
      this.setupPreloader();
    } catch (err) {
      console.error('[1/5] Preloader error:', err);
    }

    // Giai đoạn 2: Khởi tạo 3D Engine (WebGL)
    try {
      this.initThree();
      this.initSubsystems();
    } catch (err) {
      console.error('[2/5] 3D Engine error:', err);
      const preloader = document.getElementById('app-preloader');
      if (preloader) preloader.style.display = 'none';
    }

    // Giai đoạn 3: UI & Timer (LUÔN chạy, không phụ thuộc WebGL)
    try {
      this.initUI();
    } catch (err) {
      console.error('[3/5] UI init error:', err);
    }

    // Giai đoạn 4: Sự kiện tương tác (LUÔN chạy)
    try {
      this.initEvents();
    } catch (err) {
      console.error('[4/5] Events init error:', err);
    }

    // Giai đoạn 5: Vòng lặp render
    try {
      this.animate();
    } catch (err) {
      console.error('[5/5] Animation loop error:', err);
    }
  }

  // Romantic Preloader: Tối ưu tải nhanh, hiển thị mượt mà trên Vercel & Mobile
  setupPreloader() {
    const preloader = document.getElementById('app-preloader');
    const bar = document.getElementById('preloader-bar');
    const percent = document.getElementById('preloader-percent');

    if (!preloader) return;

    let progress = 0;
    let finished = false;
    const startTime = performance.now();
    const minDisplayTime = 800; // Đảm bảo người dùng kịp nhìn thấy thông điệp ấm áp

    // Preload trước các ảnh kỷ niệm dung lượng cao
    const imagesToPreload = [
      this.config.handPhotoUrl || 'assets/images/couple.jpg',
      this.config.photoUrl || 'assets/images/bennhau.jpg'
    ];

    const checkImageLoad = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      });
    };

    const imagePromises = imagesToPreload.map(src => checkImageLoad(src));

    // Hiệu ứng tăng tiến trình mượt mà lên tới 85%
    const timer = setInterval(() => {
      if (progress < 85) {
        progress += Math.floor(Math.random() * 8) + 4;
        if (progress > 85) progress = 85;
        if (bar) bar.style.width = `${progress}%`;
        if (percent) percent.innerText = `${progress}%`;
      }
    }, 60);

    const finishPreloader = () => {
      if (finished) return;
      finished = true;
      clearInterval(timer);

      const elapsed = performance.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        if (bar) bar.style.width = '100%';
        if (percent) percent.innerText = '100%';

        setTimeout(() => {
          preloader.classList.add('fade-out');
          setTimeout(() => {
            preloader.style.display = 'none';
          }, 600);
        }, 280);
      }, remainingTime);
    };

    Promise.all(imagePromises)
      .then(() => finishPreloader())
      .catch(() => finishPreloader());

    // Fallback bảo vệ: tối đa 3 giây tự động hoàn tất
    setTimeout(() => {
      finishPreloader();
    }, 3000);
  }

  // Khởi tạo Scene, Camera, WebGL Renderer tối ưu hóa cao cho Mobile & Desktop
  initThree() {
    const isMobile = isMobileDevice();
    this.isMobile = isMobile;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a102c);
    if (!isMobile) {
      this.scene.fog = new THREE.FogExp2(0x0a102c, 0.0010);
    }

    const isPortrait = window.innerWidth < window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(
      isPortrait ? 60 : 55,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    // Vị trí camera ban đầu: Hướng trực diện vào Đảo Bay Cây Đa, phía sau là Vầng Trăng rằm lung linh
    this.camera.position.set(0, 15, isPortrait ? 58 : 42);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !isMobile, // Desktop: bật antialias. Mobile: tắt để tăng FPS đáng kể
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
      alpha: false,
      stencil: false,
      depth: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Mobile: dùng pixelRatio tối đa 1.2 để giảm fill-rate trên GPU yếu
    // Desktop Retina: dùng tối đa 2.0
    const pixelRatio = isMobile
      ? Math.min(window.devicePixelRatio || 1, 1.2)
      : Math.min(window.devicePixelRatio || 1, 2.0);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.42;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls: Trục xoay đặt tại tâm Đảo Bay Cây Đa (0, 10, -16)
    // Tự động xoay chậm nhẹ nhàng (autoRotate) để không gian luôn sống động, lung linh
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = isMobile ? 0.12 : 0.08;
    this.controls.rotateSpeed = isMobile ? 1.25 : 0.95;
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = isMobile ? 1.8 : 1.35; // Zoom pinch mượt mà trên mobile
    this.controls.enablePan = false; // Khóa di chuyển camera lệch trục để luôn giữ bố cục trung tâm
    this.controls.autoRotate = true; // Tự động trôi góc nhìn điện ảnh khi không chạm
    this.controls.autoRotateSpeed = isMobile ? 0.9 : 0.65;
    this.controls.minDistance = 2.0; // Cho phép camera áp sát chi tiết không bao giờ bị giới hạn khoảng cách
    this.controls.maxDistance = 3500; // Cho phép zoom xa tít tắp bao quát toàn bộ vũ trụ ngàn sao
    this.controls.minPolarAngle = 0.01; // Xoay tự do toàn diện từ đỉnh
    this.controls.maxPolarAngle = Math.PI - 0.01; // Xoay tự do 360 độ toàn cảnh mọi hướng
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN // Pinch zoom chuẩn mực mượt mà trên mobile
    };
    this.controls.target.set(0, 10, -16);
    this.controls.update();

    // Tự động tạm dừng trôi khi người dùng vuốt/chạm xoay màn hình, và tiếp tục trôi tự nhiên sau 2.5s buông tay
    let userInteractTimer = null;
    const pauseOrbit = () => {
      if (this.camAnimId) {
        cancelAnimationFrame(this.camAnimId);
        this.camAnimId = null;
      }
      if (this.camSafetyTimeout) {
        clearTimeout(this.camSafetyTimeout);
        this.camSafetyTimeout = null;
      }
      this.isCinematicMoving = false;
      if (userInteractTimer) clearTimeout(userInteractTimer);
      this.controls.autoRotate = false;
    };
    const resumeOrbit = () => {
      if (this.isPhotoTourActive) return; // Giữ yên tĩnh khi đang xem ảnh của Linh Đan
      if (userInteractTimer) clearTimeout(userInteractTimer);
      userInteractTimer = setTimeout(() => {
        if (!this.isPhotoTourActive) {
          this.controls.autoRotate = true;
        }
      }, 2500);
    };

    this.renderer.domElement.addEventListener('pointerdown', pauseOrbit, { passive: true });
    this.renderer.domElement.addEventListener('touchstart', pauseOrbit, { passive: true });
    window.addEventListener('pointerup', resumeOrbit, { passive: true });
    window.addEventListener('touchend', resumeOrbit, { passive: true });
    window.addEventListener('pointercancel', resumeOrbit, { passive: true });
    window.addEventListener('touchcancel', resumeOrbit, { passive: true });

    // HỆ THỐNG ÁNH SÁNG RỰC RỠ, ẤM ÁP & TRONG TRẺO
    // 1. Ánh sáng môi trường tổng thể
    const ambientLight = new THREE.AmbientLight(0x7a8ab8, 1.25);
    this.scene.add(ambientLight);

    // 2. Ánh sáng vòm trời Hemisphere: Đỉnh vàng trăng, đáy xanh huyền ảo
    const hemiLight = new THREE.HemisphereLight(0xfffae8, 0x1a264e, 1.2);
    this.scene.add(hemiLight);

    // 3. Đèn chính chiếu diện mạo cây đa & các bức ảnh của Linh Đan sáng rõ
    const frontKeyLight = new THREE.DirectionalLight(0xfff5e4, 1.55);
    frontKeyLight.position.set(0, 32, 55);
    this.scene.add(frontKeyLight);

    // 4. Đèn bù sáng góc nghiêng
    const fillLight = new THREE.DirectionalLight(0x94b4ff, 0.95);
    fillLight.position.set(-35, 22, 25);
    this.scene.add(fillLight);

    // 5. Đèn viền phản quang phía sau tạo khối điện ảnh
    const rimLight = new THREE.DirectionalLight(0xffdfa4, 1.1);
    rimLight.position.set(30, 25, -40);
    this.scene.add(rimLight);
  }

  // Khởi tạo các hệ thống 3D chuyên biệt
  initSubsystems() {
    this.audio = new AudioManager(this.config);
    // Mobile: giảm số sao để giải phóng GPU fill rate
    const starCount = isMobileDevice()
      ? Math.min(this.config.effects?.starCount || 1800, 1200)
      : (this.config.effects?.starCount || 1800);
    this.stars = new Starfield(this.scene, starCount);
    this.moon = new Moon(this.scene);
    this.floatingIsland = new FloatingIsland(this.scene, this.config);
    this.lanterns = new LanternManager(this.scene, this.config);
    this.fireworks = new FireworkManager(this.scene);

    // Định kỳ sinh sao băng (môbile: tần suất thấp hơn)
    const freq = isMobileDevice()
      ? (this.config.effects?.shootingStarFrequency || 4500)
      : (this.config.effects?.shootingStarFrequency || 3500);
    setInterval(() => {
      this.stars.spawnShootingStar();
    }, freq);
  }

  // Khởi tạo giao diện DOM & Cấu hình người dùng
  initUI() {
    // 1. Cập nhật thông tin tiêu đề và tên từ config.js
    const welcomeNames = document.getElementById('welcome-names');
    const welcomeSubtitle = document.getElementById('welcome-subtitle');
    const mainTitle = document.getElementById('main-title');
    const anniversaryContent = document.getElementById('anniversary-content');

    if (welcomeNames) {
      welcomeNames.textContent = `Dành Tặng ${this.config.receiverName || 'Em'}`;
    }
    if (welcomeSubtitle && this.config.subtitle) {
      welcomeSubtitle.textContent = this.config.subtitle;
    }
    if (mainTitle && this.config.title) {
      mainTitle.textContent = this.config.title;
    }

    // 2. Kích hoạt bộ đếm thời gian yêu nhau Live Real-time (Từng giây từ 03-09 đến Date.now())
    this.startLiveLoveTimer();

    // 3. Khởi tạo danh sách Phiếu Hẹn Ước Tình Yêu (Dạng thẻ hàng ngang đầy đủ thông tin)
    const vouchersList = document.getElementById('vouchers-list');
    this.selectedVoucher = this.config.vouchers ? this.config.vouchers[0] : null;

    if (vouchersList && this.config.vouchers) {
      vouchersList.innerHTML = '';
      this.config.vouchers.forEach((v, index) => {
        const item = document.createElement('div');
        item.className = `voucher-row-card ${index === 0 ? 'selected' : ''}`;
        item.innerHTML = `
          <div class="voucher-emoji-badge">${v.icon}</div>
          <div class="voucher-text-col">
            <div class="voucher-row-title">${v.title}</div>
            <div class="voucher-row-desc">${v.desc}</div>
            <span class="voucher-row-tag">${v.tag}</span>
          </div>
          <div class="voucher-check-circle">${index === 0 ? '✓' : ''}</div>
        `;

        item.addEventListener('click', () => {
          document.querySelectorAll('.voucher-row-card').forEach(el => {
            el.classList.remove('selected');
            const check = el.querySelector('.voucher-check-circle');
            if (check) check.textContent = '';
          });
          item.classList.add('selected');
          const check = item.querySelector('.voucher-check-circle');
          if (check) check.textContent = '✓';
          this.selectedVoucher = v;
        });

        vouchersList.appendChild(item);
      });
    }

    // 4. Khởi tạo danh sách các điều ước gợi ý
    const presetContainer = document.getElementById('preset-wishes-container');
    if (presetContainer && this.config.wishPresets) {
      presetContainer.innerHTML = '';
      this.config.wishPresets.forEach(wish => {
        const chip = document.createElement('button');
        chip.className = 'preset-chip';
        chip.textContent = wish;
        chip.addEventListener('click', () => {
          const customTextarea = document.getElementById('custom-wish-text');
          if (customTextarea) {
            customTextarea.value = wish;
            customTextarea.focus();
            presetContainer.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active-chip'));
            chip.classList.add('active-chip');
          }
        });
        presetContainer.appendChild(chip);
      });
    }

    // 4. Cập nhật bức thư tình
    const letterTitle = document.getElementById('letter-title');
    const letterSignature = document.getElementById('letter-signature');
    if (letterTitle && this.config.letter?.header) {
      letterTitle.textContent = this.config.letter.header;
    }
    if (letterSignature && this.config.letter?.closing) {
      letterSignature.textContent = this.config.letter.closing;
    }

    // 5. Khởi tạo Album ảnh kỷ niệm & ảnh của Linh Đan
    this.initPhotoAlbum();
  }

  // Trợ thủ bắt sự kiện Chạm/Click tức thì không có độ trễ trên cả Mobile lẫn Desktop
  bindTapEvent(element, callback) {
    if (!element) return;
    let lastTriggerTime = 0;
    const trigger = (e) => {
      const now = Date.now();
      if (now - lastTriggerTime < 280) return; // Chống kích hoạt kép (double tap)
      lastTriggerTime = now;
      try {
        callback(e);
      } catch (err) {
        console.error('Lỗi thực thi tương tác tap/click:', err);
      }
    };

    let startX = 0, startY = 0, moved = false;
    element.addEventListener('touchstart', (e) => {
      moved = false;
      if (e.touches && e.touches.length > 0) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    }, { passive: true });

    element.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        if (Math.hypot(e.touches[0].clientX - startX, e.touches[0].clientY - startY) > 24) {
          moved = true;
        }
      }
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
      if (!moved) {
        trigger(e);
      }
    }, { passive: true });

    element.addEventListener('click', (e) => {
      trigger(e);
    });
  }

  // Khởi tạo các sự kiện tương tác
  initEvents() {
    window.addEventListener('resize', () => {
      try { this.onWindowResize(); } catch(e) {}
    }, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => { try { this.onWindowResize(); } catch(e) {} }, 180);
    });

    // Mở khóa Web Audio Context trên iOS Safari ngay cú chạm đầu tiên
    const unlockAudio = () => {
      if (this.audio) this.audio.ensureAudioContext();
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('touchend', unlockAudio);
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('touchend', unlockAudio, { passive: true });

    // Nút Bắt đầu trải nghiệm (Welcome screen)
    const btnStart = document.getElementById('btn-start-experience');
    const welcomeModal = document.getElementById('welcome-modal');
    const letterModal = document.getElementById('letter-modal');

    if (btnStart && welcomeModal) {
      const handleStart = () => {
        try {
          welcomeModal.classList.add('fade-out');
          welcomeModal.style.pointerEvents = 'none';
          setTimeout(() => {
            welcomeModal.style.display = 'none';
          }, 600);

          // Phát nhạc nền du dương lãng mạn
          try {
            if (this.audio) this.audio.play();
          } catch (audioErr) {
            console.warn('Audio play notice:', audioErr);
          }

          // Hiệu ứng di chuyển camera mở màn điện ảnh tiến vào ngắm Trăng & Khung ảnh
          try {
            if (this.camera && this.controls) this.animateCameraIntro();
          } catch (camErr) {
            console.warn('Camera intro notice:', camErr);
          }

          // Mở thư tình ngay sau khi bắt đầu
          setTimeout(() => {
            try {
              if (letterModal) {
                letterModal.classList.remove('hidden');
                this.startTypewriterEffect();
              }
            } catch (ltErr) {
              console.warn('Letter open notice:', ltErr);
            }
          }, 800);

          // Báo tin ngầm về Telegram khi Linh Đan bắt đầu trải nghiệm (1 lần / phiên)
          if (!this.hasNotifiedVisit) {
            this.hasNotifiedVisit = true;
            const now = new Date();
            const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + now.toLocaleDateString('vi-VN');
            this.sendTelegramMessage(`💌 <b>LINH ĐAN ĐANG VÀO XEM CUNG TRĂNG!</b> ✨\nLúc ${timeStr}, Linh Đan vừa bấm 'Cùng Anh Ngắm Trăng' để cùng anh ngắm trăng nè! ❤️`);
          }
        } catch (err) {
          console.error('Lỗi khi bấm Bắt đầu trải nghiệm:', err);
          if (welcomeModal) welcomeModal.style.display = 'none';
        }
      };
      this.startExperience = handleStart;
      this.bindTapEvent(btnStart, handleStart);
      btnStart.addEventListener('click', handleStart);
    }

    // Click/Chạm vào Canvas để tương tác với Khung Ảnh 3D của Linh Đan hoặc bắn pháo hoa
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.addEventListener('pointerdown', (e) => {
        this.pointerStartX = e.clientX;
        this.pointerStartY = e.clientY;
      }, { passive: true });

      this.renderer.domElement.addEventListener('pointerup', (e) => {
        const dist = Math.hypot(e.clientX - this.pointerStartX, e.clientY - this.pointerStartY);
        if (dist < 15) {
          // Kiểm tra xem người dùng có bấm trúng khung ảnh 3D nào của Linh Đan không
          const raycaster = new THREE.Raycaster();
          const mouse = new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
          );
          raycaster.setFromCamera(mouse, this.camera);

          // 1. Kiểm tra tương tác với Chú Thỏ Ngọc trên Đảo Bay
          if (this.floatingIsland && this.floatingIsland.rabbitGroup) {
            const rabbitHits = raycaster.intersectObjects([this.floatingIsland.rabbitGroup], true);
            if (rabbitHits.length > 0) {
              this.floatingIsland.cheerRabbit();
              if (this.audio) this.audio.playWishChime();
              this.showToast('🐇 Thỏ Ngọc: Chúc Linh Đan Trung Thu luôn vui tươi, rạng rỡ và hạnh phúc! ✨');
              return;
            }
          }

          if (this.lanterns && this.lanterns.photoLanterns && this.lanterns.photoLanterns.length > 0) {
            const intersects = raycaster.intersectObjects(this.lanterns.photoLanterns, true);
            if (intersects.length > 0) {
              let hitObj = intersects[0].object;
              while (hitObj && hitObj.userData.photoIndex === undefined && hitObj.parent) {
                hitObj = hitObj.parent;
              }
              if (hitObj && hitObj.userData.photoIndex !== undefined) {
                this.startPhotoTour(hitObj.userData.photoIndex);
                return;
              }
            }
          }
        }
      });
    }

    // Nút Mở Thư Tình Cung Trăng
    const btnOpenLetter = document.getElementById('btn-open-letter');
    const btnCloseLetter = document.getElementById('btn-close-letter');
    if (btnOpenLetter && letterModal) {
      this.bindTapEvent(btnOpenLetter, () => {
        letterModal.classList.remove('hidden');
        this.startTypewriterEffect();
      });
    }
    if (btnCloseLetter && letterModal) {
      this.bindTapEvent(btnCloseLetter, () => {
        letterModal.classList.add('hidden');
      });
      letterModal.addEventListener('click', (e) => {
        if (e.target === letterModal) {
          letterModal.classList.add('hidden');
        }
      });
    }

    // Chuyển đổi qua lại giữa ảnh Bên Nhau và ảnh Nắm Tay trong thư tình
    const tabTogether = document.getElementById('tab-photo-together');
    const tabHands = document.getElementById('tab-photo-hands');
    const polaroidImg = document.getElementById('polaroid-img-element');
    const polaroidCaption = document.getElementById('polaroid-caption');

    if (tabTogether && tabHands && polaroidImg) {
      this.bindTapEvent(tabTogether, () => {
        tabTogether.classList.add('active');
        tabHands.classList.remove('active');
        polaroidImg.style.opacity = '0';
        setTimeout(() => {
          polaroidImg.src = 'assets/images/bennhau.jpg';
          if (polaroidCaption) polaroidCaption.textContent = 'Bên nhau bình yên như thế này thôi ❤️';
          polaroidImg.style.opacity = '1';
        }, 150);
      });

      this.bindTapEvent(tabHands, () => {
        tabHands.classList.add('active');
        tabTogether.classList.remove('active');
        polaroidImg.style.opacity = '0';
        setTimeout(() => {
          polaroidImg.src = 'assets/images/couple.jpg';
          if (polaroidCaption) polaroidCaption.textContent = 'Mỗi ngày đều nắm chặt tay nhau như này em nhé! 🤝❤️';
          polaroidImg.style.opacity = '1';
        }, 150);
      });
    }

    // Nút Thả Đèn Trời Ước Nguyện & Phiếu Hẹn Ước Tình Yêu
    const btnWishLantern = document.getElementById('btn-wish-lantern');
    const btnCloseWish = document.getElementById('btn-close-wish');
    const wishModal = document.getElementById('wish-modal');
    const customWishText = document.getElementById('custom-wish-text');

    // Modal Vé Hẹn Ước Tình Yêu
    const voucherModal = document.getElementById('voucher-modal');
    const btnCloseVoucherX = document.getElementById('btn-close-voucher-x');
    const btnCloseVoucher = document.getElementById('btn-close-voucher');
    const btnClaimVoucher = document.getElementById('btn-claim-voucher');

    if (btnWishLantern && wishModal) {
      this.bindTapEvent(btnWishLantern, () => {
        wishModal.classList.remove('hidden');
      });
    }
    if (btnCloseWish && wishModal) {
      this.bindTapEvent(btnCloseWish, () => {
        wishModal.classList.add('hidden');
      });
    }

    if (btnCloseVoucherX && voucherModal) {
      this.bindTapEvent(btnCloseVoucherX, () => {
        voucherModal.classList.add('hidden');
      });
    }
    if (btnCloseVoucher && voucherModal) {
      this.bindTapEvent(btnCloseVoucher, () => {
        voucherModal.classList.add('hidden');
      });
    }

    if (btnClaimVoucher) {
      this.bindTapEvent(btnClaimVoucher, () => {
        const msg = this.currentVoucherMsg || "Anh ơi! Em vừa thả đèn Cung Trăng chọn phiếu hẹn ước, anh nhớ thực hiện cho em nhé! ❤️";
        this.copyToClipboard(msg, "Đã sao chép lời nhắn! Hãy gửi ngay cho Anh để đòi nợ nhé 💋");
      });
    }

    // Chuyển Tab trong Wish Modal (Phiếu Hẹn Ước vs Tự Viết Ước)
    const tabBtnVoucher = document.getElementById('tab-btn-voucher');
    const tabBtnCustom = document.getElementById('tab-btn-custom');
    const tabPanelVoucher = document.getElementById('tab-panel-voucher');
    const tabPanelCustom = document.getElementById('tab-panel-custom');

    if (tabBtnVoucher && tabBtnCustom && tabPanelVoucher && tabPanelCustom) {
      tabBtnVoucher.addEventListener('click', () => {
        tabBtnVoucher.classList.add('active');
        tabBtnCustom.classList.remove('active');
        tabPanelVoucher.classList.add('active');
        tabPanelCustom.classList.remove('active');
      });

      tabBtnCustom.addEventListener('click', () => {
        tabBtnCustom.classList.add('active');
        tabBtnVoucher.classList.remove('active');
        tabPanelCustom.classList.add('active');
        tabPanelVoucher.classList.remove('active');
      });
    }

    // Nút Thả Đèn Tab 1: Phiếu Hẹn Ước Tình Yêu
    const btnSendVoucherWish = document.getElementById('btn-send-voucher-wish');
    const voucherCustomNote = document.getElementById('voucher-custom-note');

    if (btnSendVoucherWish && wishModal) {
      btnSendVoucherWish.addEventListener('click', () => {
        const selected = this.selectedVoucher || (this.config.vouchers ? this.config.vouchers[0] : null);
        const note = voucherCustomNote ? voucherCustomNote.value.trim() : '';

        wishModal.classList.add('hidden');
        if (voucherCustomNote) voucherCustomNote.value = '';

        const lanternText = selected ? `${selected.icon} ${selected.title}` : "Nguyện ước Cung Trăng ❤️";
        this.lanterns.spawnWishLantern(lanternText);
        this.audio.playWishChime();

        setTimeout(() => {
          this.fireworks.spawn(0, 18, 0);
          this.fireworks.spawn(-15, 26, -10);
        }, 600);

        setTimeout(() => {
          this.showLoveVoucherModal(selected, note);
        }, 850);
      });
    }

    // Nút Thả Đèn Tab 2: Tự Viết Điều Ước
    const btnSendCustomWish = document.getElementById('btn-send-custom-wish');
    if (btnSendCustomWish && wishModal) {
      btnSendCustomWish.addEventListener('click', () => {
        const text = (customWishText ? customWishText.value.trim() : '') || "Nguyện cầu hai đứa mình luôn bình an, hạnh phúc bên nhau 💕";

        wishModal.classList.add('hidden');
        if (customWishText) customWishText.value = '';

        this.lanterns.spawnWishLantern(text);
        this.audio.playWishChime();

        setTimeout(() => {
          this.fireworks.spawn(0, 18, 0);
          this.fireworks.spawn(-15, 26, -10);
        }, 600);

        setTimeout(() => {
          this.showLoveVoucherModal(null, text);
        }, 850);
      });
    }

    // 1. Thanh 4 Góc Nhìn Điện Ảnh Cung Trăng (Cinematic Camera Angles)
    document.querySelectorAll('.angle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const angle = e.currentTarget.dataset.angle;
        if (angle) {
          this.switchCameraAngle(angle);
        }
      });
    });

    // 2. Nút Gửi Nụ Hôn Nhanh 💋 trên thanh điều khiển chính
    const btnQuickKiss = document.getElementById('btn-quick-kiss');
    if (btnQuickKiss) {
      this.bindTapEvent(btnQuickKiss, () => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight * 0.45;
        this.spawnKissFlowerBurst(centerX, centerY);
        try {
          this.fireworks.spawn(0, 26, -35, new THREE.Color('#ff4d6d'));
        } catch (e) {}
        if (this.audio) {
          this.audio.playWishChime();
        }
        this.showToast('😘 Anh gửi ngàn nụ hôn và tình yêu đến Linh Đan! ❤️');
      });
    }

    // 3. Nút Ngắm Ảnh Của Linh Đan trong không gian 3D
    const btnDaoPhotos = document.getElementById('btn-dao-photos') || document.getElementById('btn-photo-gallery');
    if (btnDaoPhotos) {
      this.bindTapEvent(btnDaoPhotos, () => {
        this.startPhotoTour(0);
      });
    }

    // Các sự kiện điều khiển Floating 3D Photo Tour HUD
    const btnTourPrev = document.getElementById('btn-tour-prev');
    const btnTourNext = document.getElementById('btn-tour-next');
    const btnTourPlay = document.getElementById('btn-tour-play');
    const btnExitTour = document.getElementById('btn-exit-tour');

    if (btnTourPrev) {
      this.bindTapEvent(btnTourPrev, () => {
        this.focusPhotoLantern((this.currentPhotoIndex || 0) - 1, false);
      });
    }

    if (btnTourNext) {
      this.bindTapEvent(btnTourNext, () => {
        this.focusPhotoLantern((this.currentPhotoIndex || 0) + 1, false);
      });
    }

    if (btnTourPlay) {
      this.bindTapEvent(btnTourPlay, () => {
        this.togglePhotoTourAutoplay();
      });
    }

    if (btnExitTour) {
      this.bindTapEvent(btnExitTour, () => {
        this.exitPhotoTour();
      });
    }

    // Các sự kiện cho Photo Album Modal
    const btnClosePhoto = document.getElementById('btn-close-photo');
    const photoModal = document.getElementById('photo-modal');
    if (btnClosePhoto && photoModal) {
      this.bindTapEvent(btnClosePhoto, () => {
        photoModal.classList.add('hidden');
      });
      photoModal.addEventListener('click', (e) => {
        if (e.target === photoModal) {
          photoModal.classList.add('hidden');
        }
      });
    }

    const btnPrevPhoto = document.getElementById('btn-prev-photo');
    const btnNextPhoto = document.getElementById('btn-next-photo');
    if (btnPrevPhoto) {
      this.bindTapEvent(btnPrevPhoto, () => this.navigatePhoto(-1));
    }
    if (btnNextPhoto) {
      this.bindTapEvent(btnNextPhoto, () => this.navigatePhoto(1));
    }

    const btnAlbumKiss = document.getElementById('btn-album-kiss');
    if (btnAlbumKiss) {
      this.bindTapEvent(btnAlbumKiss, () => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight * 0.45;
        this.spawnKissFlowerBurst(centerX, centerY);
        if (this.audio) {
          this.audio.playWishChime();
        }
        this.showToast('❤️ Anh yêu Linh Đan nhiều lắm! Chúc em luôn hạnh phúc! ✨');
      });
    }

    // Hỗ trợ vuốt tay chuyển ảnh trên Mobile
    const mainImgEl = document.getElementById('album-main-img');
    if (mainImgEl) {
      let touchStartX = 0;
      mainImgEl.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      mainImgEl.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchEndX - touchStartX > 45) {
          this.navigatePhoto(-1);
        } else if (touchStartX - touchEndX > 45) {
          this.navigatePhoto(1);
        }
      }, { passive: true });
    }

    // Nút Bắn Pháo Hoa: Thu camera ra xa toàn cảnh rồi bắn đại tiệc pháo hoa rực rỡ
    const btnFireworks = document.getElementById('btn-fireworks');
    if (btnFireworks) {
      this.bindTapEvent(btnFireworks, () => {
        const isPortrait = window.innerWidth < window.innerHeight;
        const wideCamPos = new THREE.Vector3(0, 30, isPortrait ? 140 : 120);
        const skyTarget  = new THREE.Vector3(0, 22, -60);
        const BARRAGE_DURATION = 2800;

        const launchFireworksBarrage = () => {
          // Giảm xuống 7 quả pháo hoa để tối ưu hiệu năng mobile
          const sequence = [
            { x:  -50, y: 28, z: -55, delay:    0 },
            { x:   50, y: 32, z: -55, delay:  400 },
            { x:    0, y: 55, z: -60, delay:  800 },
            { x:  -30, y: 40, z: -50, delay: 1200 },
            { x:   30, y: 42, z: -50, delay: 1600 },
            { x:    0, y: 48, z: -58, delay: 2000 },
            { x:    0, y: 35, z: -45, delay: 2400 },
          ];

          sequence.forEach(fw => {
            setTimeout(() => { this.fireworks.spawn(fw.x, fw.y, fw.z); }, fw.delay);
          });

          // Bật lại autoRotate sau khi bắt cầu kết thúc
          setTimeout(() => {
            if (!this.isPhotoTourActive) this.controls.autoRotate = true;
          }, BARRAGE_DURATION);
        };

        // Tắt autoRotate NGAY từ đầu để camera không bị kéo về
        this.controls.autoRotate = false;
        this.smoothMoveCamera(wideCamPos, skyTarget, 1100, () => {
          // smoothMoveCamera sẽ bật lại autoRotate — tắt lại ngay trong callback
          this.controls.autoRotate = false;
          launchFireworksBarrage();
        });
      });
    }

    // Nút Gửi Ngàn Nụ Hôn trong thư tình: Bắn đóa hoa nụ hôn bung tỏa ngay chính giữa màn hình
    const btnLetterKiss = document.getElementById('btn-letter-kiss');
    if (btnLetterKiss) {
      this.bindTapEvent(btnLetterKiss, () => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        this.spawnKissFlowerBurst(centerX, centerY);
        this.fireworks.spawn(0, 25, -15);
      });
    }

    // Nút Toàn màn hình
    const btnFullscreen = document.getElementById('btn-toggle-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Nút Hướng dẫn
    const btnHelp = document.getElementById('btn-help');
    const helpModal = document.getElementById('help-modal');
    const btnCloseHelp = document.getElementById('btn-close-help');
    const btnHelpOk = document.getElementById('btn-help-ok');
    if (btnHelp && helpModal) {
      btnHelp.addEventListener('click', () => helpModal.classList.remove('hidden'));
    }
    if (btnCloseHelp && helpModal) {
      btnCloseHelp.addEventListener('click', () => helpModal.classList.add('hidden'));
    }
    if (btnHelpOk && helpModal) {
      btnHelpOk.addEventListener('click', () => helpModal.classList.add('hidden'));
    }
  }

  // Hoạt ảnh gõ chữ (Typewriter effect) cho bức thư tình
  startTypewriterEffect() {
    const container = document.getElementById('typewriter-body');
    if (!container) return;

    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
    container.innerHTML = '<span class="typewriter-cursor"></span>';

    const paragraphs = this.config.letter?.paragraphs || [];
    const fullText = paragraphs.join('\n\n');
    let charIdx = 0;

    this.typewriterInterval = setInterval(() => {
      if (charIdx < fullText.length) {
        const currentSlice = fullText.slice(0, charIdx + 1);
        container.innerHTML = currentSlice.replace(/\n/g, '<br>') + '<span class="typewriter-cursor"></span>';
        charIdx++;
      } else {
        clearInterval(this.typewriterInterval);
        this.typewriterInterval = null;
      }
    }, 38);
  }

  // Bung tỏa ngàn nụ hôn 💋 bung xòe tròn như một đóa hoa rực rỡ mượt mà 60fps
  spawnKissFlowerBurst(originX, originY) {
    const x = originX || window.innerWidth / 2;
    const y = originY || window.innerHeight / 2;
    const isMobile = isMobileDevice();

    // Tối ưu số lượng cánh hoa theo thiết bị để chuyển động mượt như nhung, không bao giờ khựng
    const layers = isMobile
      ? [
          { count: 6, radiusMin: 50, radiusMax: 80, size: '1.4rem', duration: 1.6 },
          { count: 8, radiusMin: 95, radiusMax: 140, size: '1.7rem', duration: 1.8 },
          { count: 10, radiusMin: 150, radiusMax: 210, size: '1.9rem', duration: 2.0 }
        ]
      : [
          { count: 8, radiusMin: 55, radiusMax: 90, size: '1.5rem', duration: 1.7 },
          { count: 12, radiusMin: 105, radiusMax: 160, size: '1.9rem', duration: 2.0 },
          { count: 14, radiusMin: 175, radiusMax: 240, size: '2.2rem', duration: 2.2 }
        ];

    const fragment = document.createDocumentFragment();
    const createdElements = [];

    layers.forEach((layer, layerIdx) => {
      for (let i = 0; i < layer.count; i++) {
        const baseAngle = (i / layer.count) * (Math.PI * 2);
        const jitter = (Math.random() - 0.5) * 0.25;
        const angle = baseAngle + jitter;
        const distance = THREE.MathUtils.randFloat(layer.radiusMin, layer.radiusMax);

        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const rot = THREE.MathUtils.randFloat(-25, 25);

        const kissEl = document.createElement('div');
        kissEl.className = 'kiss-flower-particle';
        kissEl.textContent = '😘';
        kissEl.style.left = `${x}px`;
        kissEl.style.top = `${y}px`;
        kissEl.style.fontSize = layer.size;
        kissEl.style.setProperty('--tx', `${tx.toFixed(1)}px`);
        kissEl.style.setProperty('--ty', `${ty.toFixed(1)}px`);
        kissEl.style.setProperty('--rot', `${rot.toFixed(1)}deg`);
        kissEl.style.setProperty('--duration', `${layer.duration}s`);
        kissEl.style.animationDelay = `${(layerIdx * 0.035).toFixed(3)}s`;

        fragment.appendChild(kissEl);
        createdElements.push(kissEl);
      }
    });

    // 1 icon 💋 lớn nở êm ái ở tâm
    const centerKiss = document.createElement('div');
    centerKiss.className = 'kiss-flower-center';
    centerKiss.textContent = '😘';
    centerKiss.style.left = `${x}px`;
    centerKiss.style.top = `${y}px`;
    fragment.appendChild(centerKiss);
    createdElements.push(centerKiss);

    // Chèn nguyên cụm vào DOM chỉ trong 1 lần duy nhất (Zero layout thrashing)
    document.body.appendChild(fragment);

    // Tự động dọn dẹp bộ nhớ sau khi bay xong
    setTimeout(() => {
      createdElements.forEach(el => el.remove());
    }, 2400);
  }

  // Alias tương thích ngược
  spawnHeartBurst(x, y) {
    this.spawnKissFlowerBurst(x, y);
  }

  // =========================================================
  // BỘ ĐẾM THỜI GIAN YÊU NHAU (TỪ 03-09 ĐẾN DATE.NOW() TỪNG GIÂY)
  // =========================================================
  startLiveLoveTimer() {
    const anniversaryContent = document.getElementById('anniversary-content');
    const tDays = document.getElementById('t-days');
    const tHours = document.getElementById('t-hours');
    const tMinutes = document.getElementById('t-minutes');
    const tSeconds = document.getElementById('t-seconds');

    if (!this.config.anniversaryDate) return;

    const startDate = new Date(this.config.anniversaryDate).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, now - startDate);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const pad = (n) => String(n).padStart(2, '0');

      if (tDays) tDays.textContent = days;
      if (tHours) tHours.textContent = pad(hours);
      if (tMinutes) tMinutes.textContent = pad(minutes);
      if (tSeconds) tSeconds.textContent = pad(seconds);

      if (anniversaryContent) {
        anniversaryContent.innerHTML = `Bên nhau: <strong>${days}</strong> ngày <strong>${pad(hours)}:${pad(minutes)}:${pad(seconds)}</strong>`;
      }
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // =========================================================
  // 🎟️ PHIẾU HẸN ƯỚC TÌNH YÊU (LOVE VOUCHER TICKET MODAL)
  // =========================================================
  showLoveVoucherModal(voucher, customNote) {
    const voucherModal = document.getElementById('voucher-modal');
    if (!voucherModal) return;

    const ticketTitle = document.getElementById('ticket-title');
    const ticketTag = document.getElementById('ticket-tag');
    const ticketIcon = document.getElementById('ticket-icon');
    const ticketDesc = document.getElementById('ticket-desc');
    const ticketCommitment = document.getElementById('ticket-commitment');
    const ticketCode = document.getElementById('ticket-code');

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const finalCode = `${voucher ? voucher.code : 'LDR-LOVE'}-${randomSuffix}`;

    if (voucher) {
      if (ticketTitle) ticketTitle.textContent = voucher.title;
      if (ticketTag) ticketTag.textContent = voucher.tag;
      if (ticketIcon) ticketIcon.textContent = voucher.icon;
      if (ticketDesc) {
        ticketDesc.textContent = customNote ? `"${customNote}"` : voucher.desc;
      }
      if (ticketCommitment) ticketCommitment.textContent = voucher.commitment;
      if (ticketCode) ticketCode.textContent = finalCode;

      this.currentVoucherMsg = customNote
        ? `Anh ơi! Em vừa thả đèn Cung Trăng và chọn '${voucher.title}': "${customNote}". Anh chuẩn bị thực hiện cho em nhé! 💋`
        : voucher.msgTemplate;
    } else {
      if (ticketTitle) ticketTitle.textContent = "Điều Ước Cung Trăng Tình Yêu";
      if (ticketTag) ticketTag.textContent = "Hiệu lực vĩnh viễn";
      if (ticketIcon) ticketIcon.textContent = "🏮";
      if (ticketDesc) ticketDesc.textContent = customNote || "Mong hai đứa mình mãi hạnh phúc bền lâu!";
      if (ticketCommitment) ticketCommitment.textContent = "Anh cam kết sẽ luôn lắng nghe, chở che và đồng hành cùng Linh Đan mỗi ngày!";
      if (ticketCode) ticketCode.textContent = finalCode;

      this.currentVoucherMsg = `Anh ơi! Em vừa gửi điều ước lên Cung Trăng: "${customNote || 'Mong hai đứa mình mãi bình yên bên nhau'}". Anh nhớ thực hiện cho em nha! ❤️`;
    }

    // Gửi thông báo ngầm về Telegram Bot của Anh (Bí mật 100%)
    this.sendTelegramNotification(voucher, customNote, finalCode);

    voucherModal.classList.remove('hidden');
    this.audio.playWishChime();
  }

  // Lấy thông tin IP & vị trí địa lý của người truy cập (cache kết quả)
  async getVisitorGeoInfo() {
    if (this._geoInfo) return this._geoInfo;
    try {
      const res = await fetch('https://ipapi.co/json/', { cache: 'force-cache' });
      if (res.ok) {
        const data = await res.json();
        this._geoInfo = {
          ip: data.ip || '?',
          city: data.city || '?',
          region: data.region || '?',
          country: data.country_name || '?',
          org: data.org || '?',
          timezone: data.timezone || '?'
        };
        return this._geoInfo;
      }
    } catch (e) {
      // Không ảnh hưởng trải nghiệm
    }
    return null;
  }

  // Gửi thông báo ngầm qua Vercel Serverless Function bảo mật (.env)
  async sendTelegramMessage(textHtml) {
    const teleConfig = this.config.telegram;
    if (!teleConfig || !teleConfig.enabled) {
      return;
    }

    const endpoint = teleConfig.apiEndpoint || '/api/telegram';

    // Lấy thông tin vị trí người truy cập (nền, không chặn)
    let geoTag = '';
    try {
      const geo = await this.getVisitorGeoInfo();
      if (geo) {
        geoTag = `\n\n📍 <b>Vị trí:</b> ${geo.city}, ${geo.region}, ${geo.country}` +
                 `\n🌐 <b>IP:</b> <code>${geo.ip}</code>` +
                 `\n🕐 <b>Timezone:</b> ${geo.timezone}` +
                 `\n🏢 <b>ISP:</b> ${geo.org}`;
      }
    } catch (e) {
      // Không ảnh hưởng
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: textHtml + geoTag
      })
    }).then(res => res.json())
      .then(data => {
        if (data && data.error) {
          console.warn('Telegram notification status:', data.error);
        }
      })
      .catch(err => {
        // Yên lặng trên client để không làm gián đoạn trải nghiệm của Linh Đan
        console.warn('Telegram API status:', err);
      });
  }

  // Gửi thông báo ngầm khi Linh Đan thả đèn trời / chọn phiếu hẹn ước
  sendTelegramNotification(voucher, customNote, code) {
    const escapeHtml = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };

    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + now.toLocaleDateString('vi-VN');

    let message = '';

    if (voucher) {
      // Trường hợp 1: Linh Đan rút Phiếu Hẹn Ước Tình Yêu (Tab 1)
      const customText = customNote ? `"${escapeHtml(customNote)}"` : '(Linh Đan không ghi chú thêm)';
      message = `🌕 <b>CUNG TRĂNG BÁO TIN TỪ LINH ĐAN</b> 🏮\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 <b>Người gửi:</b> Linh Đan (Ốc Thượng Thổ 🏡)\n` +
        `🎟️ <b>Phiếu đã rút:</b> ${escapeHtml(voucher.icon)} <b>${escapeHtml(voucher.title)}</b>\n` +
        `🏷️ <b>Hiệu lực:</b> ${escapeHtml(voucher.tag)}\n` +
        `💌 <b>Lời nhắn của Linh Đan:</b> ${customText}\n` +
        `🤝 <b>Cam kết của Anh:</b> ${escapeHtml(voucher.commitment)}\n` +
        `🔢 <b>Mã bảo chứng:</b> <code>${escapeHtml(code)}</code>\n` +
        `⏰ <b>Thời gian:</b> ${timeStr}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👉 <i>Mau chuẩn bị thực hiện cam kết cho Linh Đan ngay thôi anh ơi! ❤️</i>`;
    } else {
      // Trường hợp 2: Linh Đan thả Thiên Đăng / Tự Viết Lời Ước (Tab 2)
      const wishContent = customNote ? escapeHtml(customNote) : 'Nguyện cầu hai đứa mình luôn bình an, hạnh phúc bên nhau 💕';
      message = `🏮 <b>LINH ĐAN VỪA THẢ THIÊN ĐĂNG LÊN CUNG TRĂNG!</b> ✨\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 <b>Người gửi:</b> Linh Đan (Ốc Thượng Thổ 🏡)\n` +
        `💌 <b>LỜI ƯỚC NGUYỆN CỦA LINH ĐAN:</b>\n` +
        `<i>“${wishContent}”</i>\n\n` +
        `🔢 <b>Mã thiên đăng:</b> <code>${escapeHtml(code)}</code>\n` +
        `⏰ <b>Thời gian gửi:</b> ${timeStr}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👉 <i>Linh Đan vừa gửi gắm lời ước nguyện từ tận đáy lòng, anh mau đọc và nhắn tin cho em nhé! ❤️</i>`;
    }

    this.sendTelegramMessage(message);
  }

  // Sao chép tin nhắn kèm toast thông báo
  copyToClipboard(text, successToast = "Đã sao chép thành công!") {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(successToast);
      }).catch(() => {
        this.fallbackCopyText(text, successToast);
      });
    } else {
      this.fallbackCopyText(text, successToast);
    }
  }

  fallbackCopyText(text, successToast) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      this.showToast(successToast);
    } catch (err) {
      this.showToast("Đã chọn vé! Hãy nhắn ngay cho Anh nhé!");
    }
    document.body.removeChild(textArea);
  }

  showToast(message) {
    const toastBox = document.getElementById('toast-box');
    const toastText = document.getElementById('toast-text');
    if (!toastBox) return;

    if (toastText) toastText.textContent = message;
    toastBox.classList.remove('hidden');
    toastBox.classList.add('show');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toastBox.classList.remove('show');
      setTimeout(() => toastBox.classList.add('hidden'), 350);
    }, 3200);
  }

  // Di chuyển camera mượt mà (Cinematic Camera Animation)
  smoothMoveCamera(targetPos, targetLookAt, duration = 1400, onComplete = null) {
    if (this.camAnimId) {
      cancelAnimationFrame(this.camAnimId);
      this.camAnimId = null;
    }
    if (this.camSafetyTimeout) {
      clearTimeout(this.camSafetyTimeout);
      this.camSafetyTimeout = null;
    }
    this.isCinematicMoving = true;
    this.controls.autoRotate = false;
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const startTime = performance.now();

    const finishCamera = () => {
      if (this.camAnimId) {
        cancelAnimationFrame(this.camAnimId);
        this.camAnimId = null;
      }
      if (this.camSafetyTimeout) {
        clearTimeout(this.camSafetyTimeout);
        this.camSafetyTimeout = null;
      }
      // Snap chính xác về đích — tránh OrbitControls tính lại offset gây giật
      this.camera.position.copy(targetPos);
      this.controls.target.copy(targetLookAt);
      this.camera.lookAt(targetLookAt);
      this.controls.update();

      this.isCinematicMoving = false;

      if (!this.isPhotoTourActive) {
        this.controls.autoRotate = true;
      }
      if (typeof onComplete === 'function') {
        onComplete();
      }
    };

    const animateCam = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      // Easing cubic easeInOut
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      this.controls.target.lerpVectors(startTarget, targetLookAt, ease);
      this.camera.lookAt(this.controls.target);

      if (progress < 1.0) {
        this.camAnimId = requestAnimationFrame(animateCam);
      } else {
        finishCamera();
      }
    };

    this.camAnimId = requestAnimationFrame(animateCam);
    // Watchdog dự phòng: đảm bảo giải phóng điều khiển sau duration + 250ms
    this.camSafetyTimeout = setTimeout(() => {
      if (this.isCinematicMoving) {
        finishCamera();
      }
    }, duration + 250);
  }

  // Chuyển đổi linh hoạt giữa các góc nhìn điện ảnh
  switchCameraAngle(angle) {
    const isMobile = isMobileDevice();
    const isPortrait = window.innerWidth < window.innerHeight;
    this.currentAngle = angle;

    document.querySelectorAll('.angle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.angle === angle);
    });

    if (angle === 'photo') {
      this.startPhotoTour(this.currentPhotoIndex || 0);
      return;
    } else {
      this.isPhotoTourActive = false;
      this.stopPhotoTourAutoplay();
      if (this.moon && typeof this.moon.setGlowIntensity === 'function') {
        this.moon.setGlowIntensity(1.0);
      }
      const tourBar = document.getElementById('photo-tour-bar');
      if (tourBar) tourBar.classList.add('hidden');
    }

    let targetPos, targetLookAt, toastMsg;

    switch (angle) {
      case 'lanterns': // 🏮 Góc Rừng Thiên Đăng (góc nhìn thấp hướng lên bầu trời trăng)
        targetLookAt = new THREE.Vector3(0, 42, -50);
        targetPos = new THREE.Vector3(
          isMobile ? 12 : 25,
          -12,
          isMobile ? 65 : 55
        );
        toastMsg = '🏮 Góc Quay: Rừng Thiên Đăng Bay Lên Cung Trăng ✨';
        break;

      case 'star': // ⭐ Góc Đèn Ông Sao
        const starX = isMobile ? 14 : 22;
        const starY = isMobile ? 3 : 5;
        const starZ = isMobile ? -10 : -15;
        targetLookAt = new THREE.Vector3(starX, starY, starZ);
        targetPos = new THREE.Vector3(
          starX - (isMobile ? 2.5 : 4),
          starY + 1.2,
          starZ + (isMobile ? 18 : 22)
        );
        toastMsg = '⭐ Góc Quay: Đèn Ông Sao Rực Rỡ 🌟';
        break;

      case 'island': // 🏝️ Góc Cây Đa Trên Đảo Bay (Chủ thể chính)
        targetLookAt = new THREE.Vector3(0, 10, -16);
        targetPos = new THREE.Vector3(0, 15, isPortrait ? 58 : 42);
        toastMsg = '🏝️ Góc Quay: Toàn Cảnh Cây Đa Trên Đảo Bay & Cung Trăng ✨';
        break;

      case 'rabbit': // 🐇 Góc Cận Cảnh Chú Thỏ Ngọc
        targetLookAt = new THREE.Vector3(0, 5, -16);
        targetPos = new THREE.Vector3(isMobile ? 5 : 8, 8, -2);
        toastMsg = '🐇 Góc Quay: Chú Thỏ Ngọc Chạy Nhảy Tung Tăng Trên Đảo 🌸';
        break;

      case 'moon': // 🌕 Góc Cung Trăng
      default:
        targetLookAt = new THREE.Vector3(0, 10, -16);
        targetPos = new THREE.Vector3(0, 15, isPortrait ? 58 : 42);
        toastMsg = '🌕 Góc Quay: Toàn Cảnh Cây Đa Trên Đảo Bay & Cung Trăng ✨';
        break;
    }

    this.smoothMoveCamera(targetPos, targetLookAt, 1600);

    if (this.audio) {
      this.audio.playWishChime();
    }
    this.showToast(toastMsg);
  }

  // =========================================================
  // 🌸 GÓC ẢNH CỦA LINH ĐAN TRONG KHÔNG GIAN 3D (3D PHOTO TOUR)
  // Tự động lướt và focus qua từng khung ảnh quanh Mặt Trăng
  // =========================================================
  startPhotoTour(startIndex = 0) {
    this.isPhotoTourActive = true;
    if (this.moon && typeof this.moon.setGlowIntensity === 'function') {
      this.moon.setGlowIntensity(0.08);
    }

    // Kiểm tra nếu khung ảnh 3D chưa được tạo
    if (!this.lanterns || !this.lanterns.photoLanterns || this.lanterns.photoLanterns.length === 0) {
      console.warn('Photo Tour: Chưa có khung ảnh 3D, đang thử khởi tạo lại...');
      // Thử tạo lại khung ảnh nếu lanterns tồn tại nhưng photoLanterns rỗng
      if (this.lanterns && typeof this.lanterns.createDaoPhotoLanterns === 'function') {
        try {
          this.lanterns.createDaoPhotoLanterns();
        } catch (e) {
          console.error('Photo Tour: Lỗi khi tạo lại khung ảnh:', e);
        }
      }
      // Kiểm tra lại sau khi thử tạo
      if (!this.lanterns || !this.lanterns.photoLanterns || this.lanterns.photoLanterns.length === 0) {
        this.showToast('⚠️ Khung ảnh 3D chưa sẵn sàng, vui lòng tải lại trang');
        this.isPhotoTourActive = false;
        return;
      }
    }

    // Hiện tất cả khung ảnh 3D
    this.lanterns.photoLanterns.forEach(l => { l.visible = true; });

    document.body.classList.add('photo-tour-active');
    this.focusPhotoLantern(startIndex);
    this.startPhotoTourAutoplay();
    this.showToast('🌸 Đang ngắm góc ảnh của Linh Đan & tự động chuyển ảnh ✨');
  }

  focusPhotoLantern(index, isAuto = false) {
    if (!this.lanterns || !this.lanterns.photoLanterns || this.lanterns.photoLanterns.length === 0) {
      console.warn('focusPhotoLantern: photoLanterns rỗng hoặc chưa khởi tạo');
      return;
    }
    const total = this.lanterns.photoLanterns.length;
    this.currentPhotoIndex = ((index % total) + total) % total;
    const lantern = this.lanterns.photoLanterns[this.currentPhotoIndex];
    if (!lantern) return;

    // Đánh dấu ảnh đang ngắm → animation loop kéo frame về anchor
    if (this.lanterns) {
      this.lanterns.focusedPhotoIndex = this.currentPhotoIndex;
    }

    const isMobile = isMobileDevice();
    const lx = Number.isFinite(lantern.position.x) ? lantern.position.x : 0;
    const ly = Number.isFinite(lantern.position.y) ? lantern.position.y : 14;
    const lz = Number.isFinite(lantern.position.z) ? lantern.position.z : 10;

    // Hướng camera nhìn thẳng vào mặt trước của ảnh từ phía ngoài
    const cx = lantern.userData.MOON_CX ?? 0;
    const cz = lantern.userData.MOON_CZ ?? -16;
    let dirX = lx - cx;
    let dirZ = lz - cz;
    const len = Math.hypot(dirX, dirZ) || 1;
    dirX /= len;
    dirZ /= len;

    const camDist = isMobile ? 13.0 : 10.5;
    const yOffset = isMobile ? 1.6 : 0.5;
    const targetPos = new THREE.Vector3(
      lx + dirX * camDist,
      ly + yOffset,
      lz + dirZ * camDist
    );
    const targetLookAt = new THREE.Vector3(lx, ly + (isMobile ? 1.2 : 0.3), lz);

    this.smoothMoveCamera(targetPos, targetLookAt, 1000);

    const photoInfo = lantern.userData.photoInfo;
    this.updatePhotoTourHUD(photoInfo, this.currentPhotoIndex, total);

    // Nếu người dùng bấm tay (không phải autoplay), đặt lại timer
    if (!isAuto && this.photoTourAutoplayTimer) {
      this.resetPhotoTourAutoplayTimer();
    }
  }

  updatePhotoTourHUD(photoInfo, index, total) {
    const tourBar = document.getElementById('photo-tour-bar');
    const tourCounter = document.getElementById('tour-counter');
    const tourCaption = document.getElementById('tour-caption');

    if (tourBar) tourBar.classList.remove('hidden');
    if (tourCounter) tourCounter.textContent = `${index + 1} / ${total}`;
    if (tourCaption && photoInfo) {
      const titleTag = photoInfo.frameTitle ? `${photoInfo.frameTitle} • ` : '';
      tourCaption.textContent = `${titleTag}${photoInfo.caption || 'Khoảnh khắc bình yên bên Linh Đan ❤️'}`;
    }

    document.querySelectorAll('.angle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.angle === 'photo');
    });
  }

  togglePhotoTourAutoplay() {
    if (this.photoTourAutoplayTimer) {
      this.stopPhotoTourAutoplay();
      this.showToast('⏸ Đã tạm dừng trình chiếu ảnh');
    } else {
      this.startPhotoTourAutoplay();
      this.showToast('▶ Tiếp tục tự động chuyển ảnh của Linh Đan ❤️');
    }
  }

  startPhotoTourAutoplay() {
    this.stopPhotoTourAutoplay();
    const playBtn = document.getElementById('btn-tour-play');
    const playIcon = document.getElementById('tour-play-icon');
    const playText = document.getElementById('tour-play-text');
    if (playBtn) playBtn.classList.add('active');
    if (playIcon) playIcon.className = 'fa-solid fa-pause';
    if (playText) playText.textContent = 'Tạm Dừng';

    this.photoTourAutoplayTimer = setInterval(() => {
      this.focusPhotoLantern((this.currentPhotoIndex || 0) + 1, true);
    }, 4200);
  }

  resetPhotoTourAutoplayTimer() {
    if (this.photoTourAutoplayTimer) {
      clearInterval(this.photoTourAutoplayTimer);
      this.photoTourAutoplayTimer = setInterval(() => {
        this.focusPhotoLantern((this.currentPhotoIndex || 0) + 1, true);
      }, 4200);
    }
  }

  stopPhotoTourAutoplay() {
    if (this.photoTourAutoplayTimer) {
      clearInterval(this.photoTourAutoplayTimer);
      this.photoTourAutoplayTimer = null;
    }
    const playBtn = document.getElementById('btn-tour-play');
    const playIcon = document.getElementById('tour-play-icon');
    const playText = document.getElementById('tour-play-text');
    if (playBtn) playBtn.classList.remove('active');
    if (playIcon) playIcon.className = 'fa-solid fa-play';
    if (playText) playText.textContent = 'Tiếp Tục';
  }

  exitPhotoTour() {
    this.isPhotoTourActive = false;
    this.stopPhotoTourAutoplay();
    if (this.moon && typeof this.moon.setGlowIntensity === 'function') {
      this.moon.setGlowIntensity(1.0);
    }
    // Bỏ focus để tất cả khung ảnh tiếp tục bay lượn bồng bềnh
    if (this.lanterns) {
      this.lanterns.focusedPhotoIndex = -1;
    }
    document.body.classList.remove('photo-tour-active');
    const tourBar = document.getElementById('photo-tour-bar');
    if (tourBar) tourBar.classList.add('hidden');
    this.switchCameraAngle('moon');
  }

  // =========================================================
  // 📸 BỘ QUẢN LÝ ALBUM ẢNH CỦA LINH ĐAN & KỶ NIỆM (assets/images/anh-dao/)
  // =========================================================
  initPhotoAlbum() {
    const candidates = this.config.daoPhotos || [
      { url: "assets/images/anh-dao/1.png", caption: "Em bé Linh Đan xinh xắn đáng yêu của anh ❤️", frameStyle: "palace" },
      { url: "assets/images/anh-dao/2.jpg", caption: "Nụ cười làm tan chảy trái tim anh ✨", frameStyle: "moon_gate" },
      { url: "assets/images/anh-dao/3.jpeg", caption: "Em luôn là ánh trăng sáng nhất trong lòng anh 🌙", frameStyle: "star" },
      { url: "assets/images/anh-dao/4.png", caption: "Cô gái dịu dàng khiến anh thương nhất đời 💕", frameStyle: "lotus" },
      { url: "assets/images/anh-dao/5.png", caption: "Bên nhau bình yên như thế này thôi 💖", frameStyle: "heart" }
    ];

    // Khởi tạo danh sách ảnh ngay lập tức để không bao giờ bị rỗng hay delay khi mở modal
    this.photoList = [...candidates];
    this.currentPhotoIndex = 0;

    // Hiển thị và vẽ thumbnail sẵn sàng
    this.renderAlbumThumbnails();
    this.updateAlbumDisplay();

    // Tải trước ảnh ngầm trong bộ nhớ đệm trình duyệt
    candidates.forEach((item) => {
      const img = new Image();
      img.src = item.url;
    });
  }

  openPhotoAlbum() {
    // 1. Mở modal Album ảnh của Linh Đan ngay lập tức
    const photoModal = document.getElementById('photo-modal');
    if (photoModal) {
      photoModal.classList.remove('hidden');
      this.updateAlbumDisplay();
    }

    // 2. Chuyển hướng camera ngắm nhìn đèn lồng kỷ niệm 3D
    try {
      this.switchCameraAngle('photo');
    } catch (err) {
      console.warn('Camera transition note:', err);
    }

    if (this.audio) {
      this.audio.playWishChime();
    }
    this.showToast('📸 Đang mở Album ảnh của Linh Đan ❤️');
  }

  navigatePhoto(direction) {
    if (!this.photoList || this.photoList.length <= 1) return;
    this.currentPhotoIndex = (this.currentPhotoIndex + direction + this.photoList.length) % this.photoList.length;
    this.updateAlbumDisplay();

    // Đồng bộ ảnh lên mặt đèn lồng 3D trong không gian
    const cur = this.photoList[this.currentPhotoIndex];
    if (cur && this.lanterns && typeof this.lanterns.updateLanternPhoto === 'function') {
      this.lanterns.updateLanternPhoto(cur.url);
    }
  }

  updateAlbumDisplay() {
    if (!this.photoList || this.photoList.length === 0) return;
    const current = this.photoList[this.currentPhotoIndex];
    if (!current) return;

    const imgA = document.getElementById('album-main-img');
    const imgB = document.getElementById('album-main-img-b');
    const captionEl = document.getElementById('album-photo-caption');
    const counterEl = document.getElementById('album-counter');

    // Cross-fade: xác định layer nào đang active
    const useLayerSystem = imgA && imgB;

    if (useLayerSystem) {
      const aIsActive = imgA.classList.contains('active');
      const incoming = aIsActive ? imgB : imgA;
      const outgoing = aIsActive ? imgA : imgB;

      // Load ảnh mới vào layer đang ẩn
      incoming.src = current.url;
      incoming.onload = () => {
        // Khi ảnh mới load xong: fade in incoming, fade out outgoing
        incoming.classList.add('active');
        outgoing.classList.remove('active');
      };
      // Fallback nếu ảnh đã cache (onload không trigger)
      if (incoming.complete && incoming.naturalWidth > 0) {
        incoming.classList.add('active');
        outgoing.classList.remove('active');
      }
    } else if (imgA) {
      // Fallback: opacity fade đơn giản
      imgA.style.opacity = '0';
      setTimeout(() => {
        imgA.src = current.url;
        imgA.style.opacity = '1';
      }, 200);
    }

    // Caption và counter fade nhẹ
    if (captionEl) {
      captionEl.style.opacity = '0';
      captionEl.style.transform = 'translateY(4px)';
      setTimeout(() => {
        captionEl.textContent = current.caption || 'Khoảnh khắc bình yên bên em ❤️';
        captionEl.style.opacity = '1';
        captionEl.style.transform = 'translateY(0)';
      }, 180);
    }
    if (counterEl) {
      counterEl.textContent = `${this.currentPhotoIndex + 1} / ${this.photoList.length}`;
    }

    // Đổi trạng thái viền sáng thumbnail đang chọn
    document.querySelectorAll('.album-thumb-item').forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === this.currentPhotoIndex);
    });
  }

  renderAlbumThumbnails() {
    const container = document.getElementById('album-thumbnails');
    if (!container) return;
    container.innerHTML = '';

    this.photoList.forEach((item, idx) => {
      const thumb = document.createElement('img');
      thumb.className = `album-thumb-item ${idx === this.currentPhotoIndex ? 'active' : ''}`;
      thumb.src = item.url;
      thumb.alt = `Ảnh ${idx + 1}`;
      thumb.addEventListener('click', () => {
        this.currentPhotoIndex = idx;
        this.updateAlbumDisplay();
        if (this.lanterns && typeof this.lanterns.updateLanternPhoto === 'function') {
          this.lanterns.updateLanternPhoto(item.url);
        }
      });
      container.appendChild(thumb);
    });
  }

  // Cinematic intro khi người dùng nhấn bắt đầu: hạ góc nhìn điện ảnh về Đảo Bay Cây Đa
  animateCameraIntro() {
    const isPortrait = window.innerWidth < window.innerHeight;
    this.camera.position.set(0, 32, isPortrait ? 90 : 70);
    this.smoothMoveCamera(
      new THREE.Vector3(0, 15, isPortrait ? 58 : 42),
      new THREE.Vector3(0, 10, -16),
      2200
    );
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    const isMobile = isMobileDevice();
    const isPortrait = window.innerWidth < window.innerHeight;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.fov = isPortrait ? 60 : 55;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const newPixelRatio = isMobile
      ? Math.min(window.devicePixelRatio || 1, 1.2)
      : Math.min(window.devicePixelRatio || 1, 2.0);
    this.renderer.setPixelRatio(newPixelRatio);
  }

  // Vòng lặp render chính — tối ưu mobile: 30fps throttle + dừng khi tab ẩn
  animate() {
    if (!this.renderer || !this.scene || !this.camera) return;

    // Page Visibility API: dừng render khi tab bị ẩn để tiết kiệm pin
    if (document.hidden) {
      this._rafId = requestAnimationFrame(() => this.animate());
      return;
    }

    // Mobile frame throttle: giới hạn 30fps để giảm tải GPU/CPU
    if (this.isMobile) {
      const now = performance.now();
      if (!this._lastFrameTime) this._lastFrameTime = now;
      const elapsed = now - this._lastFrameTime;
      if (elapsed < 33.3) { // ~30fps = 33.3ms mỗi frame
        this._rafId = requestAnimationFrame(() => this.animate());
        return;
      }
      this._lastFrameTime = now - (elapsed % 33.3);
    }

    this._rafId = requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();

    try {
      if (this.controls && !this.isCinematicMoving) {
        this.controls.update();
      }
      if (this.stars) this.stars.update(delta);
      if (this.moon) this.moon.update(delta);
      if (this.floatingIsland) this.floatingIsland.update(delta);
      if (this.lanterns) this.lanterns.update(delta, this.camera);
      if (this.fireworks) this.fireworks.update(delta);
    } catch (err) {
      console.warn('Animation subsystem tick notice:', err);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Khởi chạy ứng dụng an toàn khi DOM sẵn sàng (hỗ trợ cả khi DOMContentLoaded đã kích hoạt)
function startApp() {
  if (window.__midAutumnAppStarted) return;
  window.__midAutumnAppStarted = true;
  try {
    new MidAutumnApp();
  } catch (e) {
    console.error('Error starting MidAutumnApp:', e);
    const preloader = document.getElementById('app-preloader');
    if (preloader) preloader.style.display = 'none';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
