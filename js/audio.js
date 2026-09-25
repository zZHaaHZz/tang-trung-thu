// =========================================================
// 🎵 AUDIO MANAGER (NHẠC NỀN & HIỆU ỨNG ÂM THANH)
// Tích hợp: MP3 Audio + Web Audio API Chime Synth Fallback
// =========================================================

export class AudioManager {
  constructor(config) {
    this.config = config.music;
    this.audioElement = document.getElementById('bgm-audio');
    this.toggleBtn = document.getElementById('btn-toggle-music');
    this.isPlaying = false;
    this.isMuted = false;
    this.synthPlaying = false;
    this.audioCtx = null;
    this.synthInterval = null;
    this.playlist = (this.config && this.config.playlist) ? this.config.playlist : [
      {
        title: (this.config && this.config.title) || "Chuyện Đôi Ta - Emcee L ft. Muộii",
        url: (this.config && this.config.audioUrl) || "assets/audio/chuyen-doi-ta.mp3"
      }
    ];
    this.currentTrackIndex = 0;
    this.hasShownFirstToast = false;

    this.init();
  }

  init() {
    if (this.audioElement) {
      this.loadTrack(0);

      // Tự động chuyển bài tiếp theo trong danh sách khi hết bài
      this.audioElement.addEventListener('ended', () => {
        this.nextTrack();
      });

      this.audioElement.addEventListener('error', (e) => {
        console.warn('Không tải được file mp3, kích hoạt Romantic Ambient Synthesizer tự động.', e);
        if (this.isPlaying) {
          this.startRomanticSynth();
        }
      });
    }

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
      // Nhấn đúp để đổi bài hát tiếp theo (Hỗ trợ cả Desktop dblclick và Mobile double-tap)
      this.toggleBtn.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.nextTrack();
      });

      let lastTouchTime = 0;
      this.toggleBtn.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchTime < 380) {
          e.preventDefault();
          e.stopPropagation();
          this.nextTrack();
        }
        lastTouchTime = now;
      }, { passive: false });
    }
  }

  loadTrack(index) {
    if (!this.playlist || this.playlist.length === 0) return;
    this.currentTrackIndex = index % this.playlist.length;
    const track = this.playlist[this.currentTrackIndex];
    if (this.audioElement && track) {
      this.audioElement.src = track.url;
      const targetVol = (this.config && typeof this.config.volume === 'number') ? this.config.volume : 0.25;
      this.audioElement.volume = targetVol;
      if (this.toggleBtn) {
        this.toggleBtn.title = this.playlist.length > 1
          ? `Nhạc: ${track.title} (Bấm: Bật/Tắt • Bấm đúp: Đổi bài)`
          : `Nhạc: ${track.title} (Bấm: Bật/Tắt nhạc)`;
      }
    }
  }

  nextTrack() {
    if (!this.playlist || this.playlist.length <= 1) {
      if (this.audioElement) {
        this.audioElement.currentTime = 0;
        this.audioElement.play().catch(() => {});
      }
      return;
    }
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    this.loadTrack(this.currentTrackIndex);
    if (this.isPlaying && this.audioElement) {
      this.audioElement.play().catch(err => {
        console.warn('Lỗi phát bài tiếp theo:', err);
      });
    }
    const track = this.playlist[this.currentTrackIndex];
    if (track && window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(`🎵 Đang phát: ${track.title}`);
    }
  }

  // Khởi tạo AudioContext khi có tương tác người dùng
  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Bộ tạo giai điệu Hộp Âm Nhạc / Piano Đêm Rằm lãng mạn (Pentatonic Scale)
  startRomanticSynth() {
    this.synthPlaying = true;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    // Các nốt nhạc thang âm ngũ cung êm dịu (D4, E4, G4, A4, B4, D5, E5, G5)
    const notes = [293.66, 329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 783.99];
    let noteIndex = 0;
    const melody = [0, 2, 3, 4, 3, 2, 4, 5, 4, 2, 0, 1, 2, 3, 2, 0];

    const playChime = (freq, duration = 1.8) => {
      if (!this.synthPlaying || this.isMuted) return;
      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        // Chuông ngân vang nhẹ nhàng
        gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, this.audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
      } catch (e) {
        // Fallback catch
      }
    };

    if (this.synthInterval) clearInterval(this.synthInterval);
    this.synthInterval = setInterval(() => {
      if (!this.synthPlaying || this.isMuted) return;
      const freq = notes[melody[noteIndex % melody.length]];
      playChime(freq, 2.0);
      noteIndex++;
    }, 650);
  }

  stopRomanticSynth() {
    this.synthPlaying = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  // Bật nhạc
  play() {
    this.ensureAudioContext();
    this.isPlaying = true;
    this.isMuted = false;
    if (this.toggleBtn) {
      this.toggleBtn.classList.remove('muted');
    }

    if (this.audioElement) {
      const targetVol = (this.config && typeof this.config.volume === 'number') ? this.config.volume : 0.25;
      this.audioElement.volume = targetVol;
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          const track = this.playlist[this.currentTrackIndex];
          if (track && window.app && typeof window.app.showToast === 'function' && !this.hasShownFirstToast) {
            this.hasShownFirstToast = true;
            window.app.showToast(`🎵 ${track.title}`);
          }
        }).catch(err => {
          console.warn('Lỗi autoplay trình duyệt, chuyển sang Synthesizer:', err);
          this.startRomanticSynth();
        });
      }
    } else {
      this.startRomanticSynth();
    }
  }

  // Tạm dừng nhạc
  pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopRomanticSynth();
    if (this.toggleBtn) {
      this.toggleBtn.classList.add('muted');
    }
  }

  // Chuyển đổi trạng thái Bật / Tắt
  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Âm thanh phụ: Tiếng chuông điều ước bay lên
  playWishChime() {
    this.ensureAudioContext();
    if (!this.audioCtx) return;
    try {
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
          gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.2);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start();
          osc.stop(this.audioCtx.currentTime + 1.2);
        }, idx * 120);
      });
    } catch (e) {}
  }
}
