// FoFo Personal WorkStation - Main Application Controller
(function () {
  'use strict';

  // --- Utility Functions ---
  const pad = (n) => String(n).padStart(2, '0');
  const formatDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const getNextDateStr = (dateStr) => {
    if (!dateStr) dateStr = formatDateStr(new Date());
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + 1);
    return formatDateStr(dt);
  };
  const getMonthStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  
  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function getWeekStr(date) {
    return `${date.getFullYear()}-W${pad(getWeekNumber(date))}`;
  }

  function getWeekdayName(date) {
    return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()];
  }

  function renderMarkdown(md) {
    if (window.marked && typeof window.marked.parse === 'function') {
      return window.marked.parse(md);
    }
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br/>');
  }

  // --- Toast Floating Notifications ---
  function showToast(message, type = 'success', duration = 4500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item flex items-center justify-between space-x-3 text-xs';
    
    let icon = '🍅';
    if (type === 'info') icon = 'ℹ️';
    if (type === 'warn') icon = '⚠️';
    if (type === 'water') icon = '🥤';
    if (type === 'theme') icon = '🎨';

    toast.innerHTML = `
      <div class="flex items-center space-x-2.5">
        <span class="text-base">${icon}</span>
        <span class="font-medium text-slate-100">${message}</span>
      </div>
      <button class="text-slate-400 hover:text-white text-sm transition">✕</button>
    `;

    toast.querySelector('button').onclick = () => {
      toast.style.animation = 'fadeOut 0.25s forwards';
      setTimeout(() => toast.remove(), 250);
    };

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'fadeOut 0.25s forwards';
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  }

  // --- Confetti Particle System ---
  class ConfettiCelebration {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.animating = false;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    fire(x = window.innerWidth / 2, y = window.innerHeight / 2) {
      if (!this.ctx) return;
      const colors = ['#10b981', '#34d399', '#38bdf8', '#f59e0b', '#ec4899', '#a855f7'];
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.8) * 14,
          size: Math.random() * 6 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          rotation: Math.random() * 360,
          vrot: (Math.random() - 0.5) * 10
        });
      }
      if (!this.animating) {
        this.animating = true;
        this.loop();
      }
    }

    loop() {
      if (!this.animating) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4;
        p.rotation += p.vrot;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        requestAnimationFrame(() => this.loop());
      } else {
        this.animating = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  // --- Seed Demo Data (Sanitized Empty Initial State for v2.0.1) ---
  function getSeedData() {
    const today = new Date();
    const todayStr = formatDateStr(today);

    return {
      currentDate: todayStr,
      theme: 'midnight',
      bgOpacity: 82,
      bgBlur: 6,
      userAvatar: '',
      customBgImage: '',
      appTitle: 'FoFo 工作台',
      heroBannerImage: '',
      heroBannerSlogan: '请添加个性心情',
      monthlyGoals: [],
      weeklyGoals: [],
      bulletin: [],
      dailyData: {
        [todayStr]: {
          waterIntake: 0,
          readingList: [],
          tasks: [],
          notes: '',
          milestones: []
        }
      },
      scratchpad: []
    };
  }

  // --- Main Application State ---
  let state = null;
  let hasBackend = false;
  let saveTimeout = null;
  let confetti = null;
  let pomodoro = null;
  let heatmap = null;
  let calendar = null;
  let taskFilter = 'all';
  let activeGoalsTab = 'weekly';
  let activeReadingType = 'doc';

  // --- Theme & Image Helpers ---
  const THEME_GRADIENTS = {
    'midnight': 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 50%, #070a13 100%)',
    'pacific': 'radial-gradient(ellipse at 25% 0%, #1d4ed8 0%, #0f2b5c 40%, #071326 80%, #030712 100%)',
    'deep-purple': 'radial-gradient(ellipse at 25% 0%, #7e22ce 0%, #3b0764 45%, #180728 80%, #05020a 100%)',
    'alpine-green': 'radial-gradient(ellipse at 25% 0%, #047857 0%, #064e3b 45%, #03251c 80%, #010d0a 100%)',
    'space-gray': 'radial-gradient(ellipse at 25% 0%, #52525b 0%, #27272a 45%, #141417 80%, #09090b 100%)'
  };

  function compressImageFile(file, maxWidth, maxHeight, quality, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxHeight) {
          const ratio = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        const mimeType = (file && file.type === 'image/png') ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality || 0.9);
        callback(dataUrl);
      };
      img.onerror = () => callback(e.target.result);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- Theme & Avatar Application ---
  function applyTheme() {
    const curTheme = state.theme || 'midnight';
    
    // 1. Remove all old theme-* classes on body
    document.body.className = document.body.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .join(' ');
    
    document.body.classList.add(`theme-${curTheme}`);

    // 2. Custom Background Image Layer
    const bgLayer = document.getElementById('custom-bg-layer');
    const bgOverlay = document.getElementById('custom-bg-overlay');
    const btnRemoveBg = document.getElementById('btn-remove-bg-image');
    const controlsBox = document.getElementById('bg-controls-box');

    const opacity = state.bgOpacity !== undefined ? state.bgOpacity : 82;
    const blur = state.bgBlur !== undefined ? state.bgBlur : 6;

    if (state.customBgImage) {
      if (bgLayer) {
        bgLayer.style.display = 'block';
        bgLayer.style.backgroundImage = `url("${state.customBgImage}")`;
        bgLayer.style.opacity = '1';
      }
      if (bgOverlay) {
        bgOverlay.style.display = 'block';
        bgOverlay.style.backgroundColor = `rgba(11, 15, 25, ${opacity / 100})`;
        bgOverlay.style.backdropFilter = `blur(${blur}px)`;
        bgOverlay.style.webkitBackdropFilter = `blur(${blur}px)`;
      }
      document.body.style.background = '#0b0f19';
      if (btnRemoveBg) btnRemoveBg.classList.remove('hidden');
      if (controlsBox) controlsBox.classList.remove('hidden');
    } else {
      if (bgLayer) {
        bgLayer.style.display = 'none';
        bgLayer.style.backgroundImage = 'none';
        bgLayer.style.opacity = '0';
      }
      if (bgOverlay) {
        bgOverlay.style.display = 'none';
      }
      const gradient = THEME_GRADIENTS[curTheme] || THEME_GRADIENTS['midnight'];
      document.body.style.background = gradient;
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundColor = '#070a13';

      if (btnRemoveBg) btnRemoveBg.classList.add('hidden');
      if (controlsBox) controlsBox.classList.add('hidden');
    }

    // 3. Update Theme Modal elements
    const opacitySlider = document.getElementById('bg-opacity-slider');
    const blurSlider = document.getElementById('bg-blur-slider');
    const opacityVal = document.getElementById('bg-opacity-val');
    const blurVal = document.getElementById('bg-blur-val');

    if (opacitySlider) opacitySlider.value = opacity;
    if (blurSlider) blurSlider.value = blur;
    if (opacityVal) opacityVal.textContent = `${opacity}%`;
    if (blurVal) blurVal.textContent = `${blur}px`;

    // Highlight active preset swatch
    document.querySelectorAll('.theme-preset-btn').forEach(btn => {
      const swatch = btn.querySelector('.theme-swatch');
      if (swatch) {
        if (!state.customBgImage && btn.dataset.theme === curTheme) {
          swatch.classList.add('active');
        } else {
          swatch.classList.remove('active');
        }
      }
    });

    // Highlight active system wallpaper button
    document.querySelectorAll('.system-wallpaper-btn').forEach(btn => {
      const wp = btn.dataset.wallpaper;
      if (state.customBgImage && state.customBgImage === wp) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update custom background status text
    const customBgStatus = document.getElementById('custom-bg-status');
    if (customBgStatus) {
      if (!state.customBgImage) {
        customBgStatus.textContent = '未启用';
        customBgStatus.className = 'text-[10px] text-slate-500';
      } else if (state.customBgImage.startsWith('data:')) {
        customBgStatus.textContent = '已启用自定义壁纸';
        customBgStatus.className = 'text-[10px] text-emerald-400 font-medium';
      } else {
        customBgStatus.textContent = '使用系统壁纸';
        customBgStatus.className = 'text-[10px] text-emerald-400 font-medium';
      }
    }
  }

  function applyAvatar() {
    const img = document.getElementById('user-avatar-img');
    const placeholder = document.getElementById('default-avatar-placeholder');
    const btnRemove = document.getElementById('btn-remove-avatar');

    if (state.userAvatar) {
      if (img) {
        img.src = state.userAvatar;
        img.classList.remove('hidden');
      }
      if (placeholder) placeholder.classList.add('hidden');
      if (btnRemove) btnRemove.classList.remove('hidden');
    } else {
      if (img) {
        img.src = '';
        img.classList.add('hidden');
      }
      if (placeholder) placeholder.classList.remove('hidden');
      if (btnRemove) btnRemove.classList.add('hidden');
    }
  }

  function applyHeroBanner() {
    const bannerImg = document.getElementById('hero-banner-img');
    const sloganText = document.getElementById('hero-slogan-text');
    const modalPreviewImg = document.getElementById('modal-banner-preview-img');
    const modalPreviewText = document.getElementById('modal-banner-preview-text');
    const btnRemove = document.getElementById('btn-remove-banner-img');

    const slogan = (state.heroBannerSlogan && state.heroBannerSlogan.trim())
      ? state.heroBannerSlogan
      : '保持热爱，奔赴山海！';
    const bgUrl = state.heroBannerImage || '';
    const bgImage = bgUrl ? `url("${bgUrl}")` : 'none';

    if (sloganText) sloganText.textContent = slogan;
    if (modalPreviewText) modalPreviewText.textContent = slogan;

    if (bannerImg) {
      bannerImg.style.backgroundImage = bgImage;
    }
    if (modalPreviewImg) {
      modalPreviewImg.style.backgroundImage = bgImage;
    }

    if (btnRemove) {
      if (state.heroBannerImage) {
        btnRemove.classList.remove('hidden');
      } else {
        btnRemove.classList.add('hidden');
      }
    }
  }

  function applyAppTitle() {
    const title = (state.appTitle && state.appTitle.trim()) ? state.appTitle.trim() : 'FoFo 工作台';
    const titleEl = document.getElementById('app-title-text');
    if (titleEl) {
      titleEl.textContent = title;
    }
    // Synchronize to browser webpage title tab
    document.title = `${title} - Personal WorkStation`;
  }

  // --- Data Persistence Layer ---
  const PERSONALIZATION_KEYS = [
    'theme',
    'bgOpacity',
    'bgBlur',
    'userAvatar',
    'customBgImage',
    'appTitle',
    'heroBannerImage',
    'heroBannerSlogan'
  ];
  const PERSONALIZATION_DEFAULTS = {
    theme: 'midnight',
    bgOpacity: 82,
    bgBlur: 6,
    appTitle: 'FoFo 工作台',
    heroBannerSlogan: '请添加个性心情'
  };

  function readLocalWorkspaceState() {
    try {
      const raw = localStorage.getItem('fofo_workspace_v1');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('本地工作台数据读取失败，将继续使用服务端数据或默认数据。', e);
      return null;
    }
  }

  function mergeLocalPersonalization(remoteState, localState) {
    if (!remoteState || !localState) return remoteState;
    PERSONALIZATION_KEYS.forEach(key => {
      const localValue = localState[key];
      const remoteValue = remoteState[key];
      if (localValue === undefined || localValue === null || localValue === '') return;
      const remoteMissing = remoteValue === undefined || remoteValue === null || remoteValue === '';
      const remoteIsDefault = Object.prototype.hasOwnProperty.call(PERSONALIZATION_DEFAULTS, key)
        && remoteValue === PERSONALIZATION_DEFAULTS[key]
        && localValue !== PERSONALIZATION_DEFAULTS[key];
      if (remoteMissing || remoteIsDefault) remoteState[key] = localValue;
    });
    return remoteState;
  }

  async function initData() {
    const localState = readLocalWorkspaceState();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const resp = await fetch('/api/data', { signal: controller.signal });
      clearTimeout(timer);
      if (resp.ok) {
        // A successful response means the local server is active and managing storage
        hasBackend = true;
        const remoteData = await resp.json();
        if (remoteData && Object.keys(remoteData).length > 0) {
          state = remoteData;
        } else {
          // Brand new directory / first installation: initialize pure default seed,
          // never pollute from old localhost:3210 browser localStorage!
          state = getSeedData();
        }
      }
    } catch (e) {
      console.warn('[FoFo] Backend fetch timed out or unavailable, fallback to local/seed:', e);
      hasBackend = false;
    }

    if (!state) {
      // Standalone static file mode (e.g. file:///): fall back to browser localStorage
      state = localState || getSeedData();
    }

    const todayStr = formatDateStr(new Date());
    if (!state.currentDate) state.currentDate = todayStr;
    if (!state.dailyData) state.dailyData = {};
    if (!state.bulletin) state.bulletin = [];
    if (!state.theme) state.theme = 'midnight';
    if (state.bgOpacity === undefined) state.bgOpacity = 82;
    if (state.bgBlur === undefined) state.bgBlur = 6;
    
    ensureCurrentDayExists();

    saveState(true);
    applyTheme();
    applyAvatar();
    applyAppTitle();
    applyHeroBanner();
    updateBackendStatus();
  }

  function ensureCurrentDayExists(targetDate = state.currentDate) {
    if (!state.dailyData[targetDate]) {
      state.dailyData[targetDate] = {
        waterIntake: 0,
        readingList: [],
        tasks: [],
        notes: '',
        milestones: []
      };
    }
    const day = state.dailyData[targetDate];
    if (day.waterIntake === undefined) day.waterIntake = 0;
    if (!day.readingList) day.readingList = [];
    if (!day.tasks) day.tasks = [];
    if (day.notes === undefined) day.notes = '';
    
    if (!day.milestones) {
      day.milestones = [];
      if (day.milestone) {
        day.milestones.push({ id: 'm-' + Date.now(), text: day.milestone });
      }
    }
  }

  function saveState(immediate = false) {
    if (saveTimeout) clearTimeout(saveTimeout);

    const executeSave = async () => {
      let jsonStr = '';
      try {
        jsonStr = JSON.stringify(state);
        localStorage.setItem('fofo_workspace_v1', jsonStr);
      } catch (storageErr) {
        console.warn('LocalStorage quota or serialization error:', storageErr);
      }

      if (hasBackend && jsonStr) {
        try {
          await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: jsonStr
          });
        } catch (e) {
          console.warn('Backend save failed, saved to localStorage');
        }

        try {
          const day = state.dailyData[state.currentDate];
          if (day && day.readingList) {
            await fetch('/api/reading', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                date: state.currentDate,
                items: day.readingList
              })
            });
          }
        } catch (e) {
          // ignore
        }
      }

      const statusEl = document.getElementById('note-save-status');
      if (statusEl) {
        statusEl.textContent = '已自动保存';
        statusEl.className = 'text-[10px] text-emerald-400';
      }
    };

    if (immediate) {
      executeSave();
    } else {
      const statusEl = document.getElementById('note-save-status');
      if (statusEl) {
        statusEl.textContent = '保存中...';
        statusEl.className = 'text-[10px] text-amber-400';
      }
      saveTimeout = setTimeout(executeSave, 400);
    }
  }

  function updateBackendStatus() {
    const el = document.getElementById('backend-status-text');
    if (el) {
      if (hasBackend) {
        el.textContent = '🟢 Python 本地服务端运行中 (已支持本地文档直接唤起打开)';
        el.className = 'text-emerald-400 font-medium';
      } else {
        el.textContent = '🟡 浏览器独立模式 (数据保存在 LocalStorage)';
        el.className = 'text-amber-400 font-medium';
      }
    }
  }

  // --- UI Renderers ---

  function updateHeaderInfo() {
    const today = new Date();
    const curDate = new Date(state.currentDate);
    const month = curDate.getMonth() + 1;
    const year = curDate.getFullYear();
    const weekNum = getWeekNumber(curDate);
    const weekday = getWeekdayName(curDate);

    // Header date (Larger size)
    const headerSub = document.getElementById('header-date-sub');
    if (headerSub) {
      headerSub.textContent = `${year}年${month}月 · 第${weekNum}周 · ${weekday}`;
    }

    // Month progress calculation
    const daysInMonth = new Date(year, month, 0).getDate();
    const curDay = curDate.getDate();
    const percent = Math.min(100, Math.round((curDay / daysInMonth) * 100));
    
    const progText = document.getElementById('month-progress-text');
    const progBar = document.getElementById('month-progress-bar');
    if (progText) progText.textContent = `${month}月进度: ${percent}% (${curDay}/${daysInMonth}天)`;
    if (progBar) progBar.style.width = `${percent}%`;

    // Active day title
    const activeTitle = document.getElementById('active-day-title');
    const activeBadge = document.getElementById('active-day-badge');
    const holidayBadge = document.getElementById('active-day-holiday-badge');
    const isToday = state.currentDate === formatDateStr(today);
    
    if (activeTitle) activeTitle.textContent = `${state.currentDate} ${weekday}`;
    if (activeBadge) {
      activeBadge.textContent = isToday ? '今日' : '查看历史';
      activeBadge.className = isToday 
        ? 'px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60'
        : 'px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700';
    }

    if (holidayBadge) {
      const holiday = window.CalendarWidget ? window.CalendarWidget.getHolidayInfo(state.currentDate) : null;
      if (holiday && holiday.isHoliday) {
        holidayBadge.classList.remove('hidden');
        holidayBadge.className = 'px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 flex items-center space-x-1';
        holidayBadge.innerHTML = `<span>🇨🇳</span><span>${holiday.name} · 休</span>`;
      } else if (holiday && holiday.isWorkday) {
        holidayBadge.classList.remove('hidden');
        holidayBadge.className = 'px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 flex items-center space-x-1';
        holidayBadge.innerHTML = `<span>💼</span><span>${holiday.name} · 班</span>`;
      } else if (holiday && holiday.name) {
        holidayBadge.classList.remove('hidden');
        holidayBadge.className = 'px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-800 text-emerald-300 border border-slate-700';
        holidayBadge.textContent = holiday.name;
      } else {
        holidayBadge.classList.add('hidden');
      }
    }

    const weekLabel = document.getElementById('current-week-label');
    if (weekLabel) weekLabel.textContent = `W${weekNum}`;
  }

  // Water Intake Component
  function renderWaterIntake() {
    ensureCurrentDayExists();
    const day = state.dailyData[state.currentDate];
    const water = day.waterIntake || 0;
    const target = 1500;
    const percent = Math.min(100, Math.round((water / target) * 100));

    const textEl = document.getElementById('water-intake-text');
    const barEl = document.getElementById('water-progress-bar');
    const percentEl = document.getElementById('water-percent-text');

    if (textEl) textEl.textContent = `${water}ml`;
    if (barEl) {
      barEl.style.width = `${percent}%`;
      barEl.className = percent >= 100 ? 'bg-emerald-400 h-1.5 rounded-full' : 'bg-cyan-400 h-1.5 rounded-full';
    }
    if (percentEl) percentEl.textContent = `${percent}%`;
  }

  function addWater(amount) {
    ensureCurrentDayExists();
    const day = state.dailyData[state.currentDate];
    const prev = day.waterIntake || 0;
    day.waterIntake = prev + amount;
    saveState();
    renderWaterIntake();

    if (prev < 1500 && day.waterIntake >= 1500) {
      confetti.fire();
      showToast('🎉 恭喜！今日 1.5L 健康饮水目标已达成！', 'water');
    } else {
      showToast(`已记录饮水 +${amount}ml (今日: ${day.waterIntake}ml)`, 'water', 2000);
    }
  }

  function resetWater() {
    ensureCurrentDayExists();
    state.dailyData[state.currentDate].waterIntake = 0;
    saveState();
    renderWaterIntake();
  }

  // Main Goals Switcher (Weekly vs Monthly)
  function switchGoalsTab(tab) {
    activeGoalsTab = tab;
    const btnWeekly = document.getElementById('tab-btn-weekly');
    const btnMonthly = document.getElementById('tab-btn-monthly');
    const viewWeekly = document.getElementById('view-weekly-goals');
    const viewMonthly = document.getElementById('view-monthly-goals');

    if (tab === 'weekly') {
      btnWeekly.className = 'px-2.5 py-1 rounded-md font-semibold bg-emerald-600 text-white transition flex items-center space-x-1';
      btnMonthly.className = 'px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200 transition flex items-center space-x-1';
      viewWeekly.classList.remove('hidden');
      viewMonthly.classList.add('hidden');
    } else {
      btnMonthly.className = 'px-2.5 py-1 rounded-md font-semibold bg-emerald-600 text-white transition flex items-center space-x-1';
      btnWeekly.className = 'px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200 transition flex items-center space-x-1';
      viewMonthly.classList.remove('hidden');
      viewWeekly.classList.add('hidden');
    }

    updateGoalsProgressBadge();
  }

  function updateGoalsProgressBadge() {
    const badge = document.getElementById('goals-progress-badge');
    if (!badge) return;

    if (activeGoalsTab === 'weekly') {
      const curWeek = getWeekStr(new Date(state.currentDate));
      const goals = (state.weeklyGoals || []).filter(w => w.week === curWeek);
      const done = goals.filter(w => w.done).length;
      const p = goals.length > 0 ? Math.round((done / goals.length) * 100) : 0;
      badge.textContent = `${p}% 达成 (${done}/${goals.length})`;
    } else {
      const curMonth = getMonthStr(new Date(state.currentDate));
      const goals = (state.monthlyGoals || []).filter(g => g.month === curMonth);
      const done = goals.filter(g => g.done).length;
      const p = goals.length > 0 ? Math.round((done / goals.length) * 100) : 0;
      badge.textContent = `${p}% 达成 (${done}/${goals.length})`;
    }
  }

  function renderWeeklyGoals() {
    const list = document.getElementById('weekly-goals-list');
    if (!list) return;
    list.innerHTML = '';

    const curWeek = getWeekStr(new Date(state.currentDate));
    const weekGoals = (state.weeklyGoals || []).filter(w => w.week === curWeek);

    updateGoalsProgressBadge();

    if (weekGoals.length === 0) {
      list.innerHTML = `<div class="text-slate-500 py-3 text-center">本周暂无重点，点击上方 + 添加</div>`;
      return;
    }

    weekGoals.forEach((goal) => {
      const item = document.createElement('div');
      item.className = 'p-2 rounded bg-slate-900/90 border border-slate-800 flex items-start justify-between group hover:border-slate-700 transition';
      const safeTitle = (goal.text || '').replace(/"/g, '&quot;');
      
      item.innerHTML = `
        <label class="flex items-start space-x-2 flex-1 cursor-pointer min-w-0 mr-1.5" title="${safeTitle}">
          <input type="checkbox" class="task-checkbox mt-0.5" ${goal.done ? 'checked' : ''} />
          <span class="text-xs break-words whitespace-normal leading-relaxed ${goal.done ? 'task-completed' : 'text-slate-200'}">${goal.text}</span>
        </label>
        
        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0 mt-0.5">
          <button class="btn-up text-[10px] px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" title="上移">↑</button>
          <button class="btn-down text-[10px] px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" title="下移">↓</button>
          <button class="btn-del text-slate-500 hover:text-red-400 text-xs px-1" title="删除">✕</button>
        </div>
      `;

      item.querySelector('.task-checkbox').onchange = (e) => {
        goal.done = e.target.checked;
        if (goal.done) confetti.fire();
        saveState();
        renderWeeklyGoals();
      };

      item.querySelector('.btn-up').onclick = () => {
        const fullIdx = state.weeklyGoals.indexOf(goal);
        if (fullIdx > 0) {
          const temp = state.weeklyGoals[fullIdx];
          state.weeklyGoals[fullIdx] = state.weeklyGoals[fullIdx - 1];
          state.weeklyGoals[fullIdx - 1] = temp;
          saveState();
          renderWeeklyGoals();
        }
      };

      item.querySelector('.btn-down').onclick = () => {
        const fullIdx = state.weeklyGoals.indexOf(goal);
        if (fullIdx < state.weeklyGoals.length - 1) {
          const temp = state.weeklyGoals[fullIdx];
          state.weeklyGoals[fullIdx] = state.weeklyGoals[fullIdx + 1];
          state.weeklyGoals[fullIdx + 1] = temp;
          saveState();
          renderWeeklyGoals();
        }
      };

      item.querySelector('.btn-del').onclick = () => {
        state.weeklyGoals = state.weeklyGoals.filter(w => w.id !== goal.id);
        saveState();
        renderWeeklyGoals();
      };

      list.appendChild(item);
    });
  }

  function renderMonthlyGoals() {
    const list = document.getElementById('monthly-goals-list');
    if (!list) return;
    list.innerHTML = '';

    const curMonth = getMonthStr(new Date(state.currentDate));
    const monthGoals = (state.monthlyGoals || []).filter(g => g.month === curMonth);

    updateGoalsProgressBadge();

    if (monthGoals.length === 0) {
      list.innerHTML = `<div class="text-slate-500 py-3 text-center">本月暂无目标，点击上方 + 添加</div>`;
      return;
    }

    monthGoals.forEach((goal) => {
      const item = document.createElement('div');
      item.className = 'p-2 rounded bg-slate-900/90 border border-slate-800 flex flex-col space-y-1.5 group hover:border-slate-700 transition';
      const safeTitle = (goal.text || '').replace(/"/g, '&quot;');
      
      item.innerHTML = `
        <div class="flex items-start justify-between">
          <label class="flex items-start space-x-2 flex-1 cursor-pointer min-w-0 mr-1.5" title="${safeTitle}">
            <input type="checkbox" class="task-checkbox mt-0.5" ${goal.done ? 'checked' : ''} />
            <span class="text-xs break-words whitespace-normal leading-relaxed ${goal.done ? 'task-completed' : 'text-slate-200'}">${goal.text}</span>
          </label>
          <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0 mt-0.5">
            <button class="btn-up text-[10px] px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" title="上移">↑</button>
            <button class="btn-down text-[10px] px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" title="下移">↓</button>
            <button class="btn-del text-slate-500 hover:text-red-400 text-xs px-1" title="删除">✕</button>
          </div>
        </div>
        <div class="flex items-center space-x-2 pt-1 border-t border-slate-800/60">
          <input type="range" min="0" max="100" value="${goal.progress || (goal.done ? 100 : 0)}" class="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 goal-slider" />
          <span class="text-[10px] text-slate-400 w-8 text-right font-mono">${goal.progress || (goal.done ? 100 : 0)}%</span>
        </div>
      `;

      item.querySelector('.task-checkbox').onchange = (e) => {
        goal.done = e.target.checked;
        if (goal.done) {
          goal.progress = 100;
          confetti.fire();
        }
        saveState();
        renderMonthlyGoals();
      };

      const slider = item.querySelector('.goal-slider');
      slider.oninput = (e) => {
        goal.progress = parseInt(e.target.value);
        if (goal.progress === 100) goal.done = true;
        else if (goal.done && goal.progress < 100) goal.done = false;
        item.querySelector('span.font-mono').textContent = `${goal.progress}%`;
        saveState();
      };
      slider.onchange = () => renderMonthlyGoals();

      item.querySelector('.btn-up').onclick = () => {
        const fullIdx = state.monthlyGoals.indexOf(goal);
        if (fullIdx > 0) {
          const temp = state.monthlyGoals[fullIdx];
          state.monthlyGoals[fullIdx] = state.monthlyGoals[fullIdx - 1];
          state.monthlyGoals[fullIdx - 1] = temp;
          saveState();
          renderMonthlyGoals();
        }
      };

      item.querySelector('.btn-down').onclick = () => {
        const fullIdx = state.monthlyGoals.indexOf(goal);
        if (fullIdx < state.monthlyGoals.length - 1) {
          const temp = state.monthlyGoals[fullIdx];
          state.monthlyGoals[fullIdx] = state.monthlyGoals[fullIdx + 1];
          state.monthlyGoals[fullIdx + 1] = temp;
          saveState();
          renderMonthlyGoals();
        }
      };

      item.querySelector('.btn-del').onclick = () => {
        state.monthlyGoals = state.monthlyGoals.filter(g => g.id !== goal.id);
        saveState();
        renderMonthlyGoals();
      };

      list.appendChild(item);
    });
  }

  // Today's Reading
  function renderReadingList() {
    ensureCurrentDayExists();
    const day = state.dailyData[state.currentDate];
    const items = day.readingList || [];

    const badge = document.getElementById('reading-count-badge');
    if (badge) badge.textContent = items.length;

    const container = document.getElementById('reading-items-container');
    if (!container) return;
    container.innerHTML = '';

    if (items.length === 0) {
      container.innerHTML = `
        <div class="py-3 text-center text-slate-500 text-xs">
          暂无待阅文档或链接，点击上方「+ 新增待阅」添加
        </div>
      `;
      return;
    }

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'reading-card flex items-center justify-between group text-xs';
      
      const isDoc = item.type === 'doc';
      const icon = isDoc ? '📄' : '🌐';
      const typeBadge = isDoc ? '<span class="text-[10px] px-1 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">本地文档</span>' : '<span class="text-[10px] px-1 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60">网页</span>';

      card.innerHTML = `
        <div class="flex items-center space-x-2.5 flex-1 min-w-0 mr-2 cursor-pointer btn-open">
          <span class="text-sm">${icon}</span>
          <div class="flex flex-col min-w-0">
            <span class="font-semibold text-slate-200 truncate">${item.title}</span>
            <span class="text-[10px] text-slate-500 truncate" title="${item.path}">${item.path}</span>
          </div>
        </div>

        <div class="flex items-center space-x-1.5">
          ${typeBadge}
          <div class="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition">
            <button class="btn-up text-[10px] px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" title="上移">↑</button>
            <button class="btn-down text-[10px] px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300" title="下移">↓</button>
            <button class="btn-del text-slate-500 hover:text-red-400 text-xs px-1" title="删除">✕</button>
          </div>
        </div>
      `;

      card.querySelector('.btn-open').onclick = async () => {
        if (hasBackend) {
          try {
            const resp = await fetch('/api/open', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: item.type, path: item.path })
            });
            const res = await resp.json();
            if (res.status === 'ok') {
              showToast(res.message, 'info', 2500);
            } else {
              showToast(res.message, 'warn', 3500);
            }
          } catch (e) {
            window.open(item.path, '_blank');
          }
        } else {
          if (item.type === 'url') {
            window.open(item.path, '_blank');
          } else {
            showToast(`本地文档路径已复制: ${item.path}`, 'info', 3000);
            navigator.clipboard.writeText(item.path);
          }
        }
      };

      card.querySelector('.btn-up').onclick = (e) => {
        e.stopPropagation();
        if (idx > 0) {
          const temp = items[idx];
          items[idx] = items[idx - 1];
          items[idx - 1] = temp;
          saveState();
          renderReadingList();
        }
      };

      card.querySelector('.btn-down').onclick = (e) => {
        e.stopPropagation();
        if (idx < items.length - 1) {
          const temp = items[idx];
          items[idx] = items[idx + 1];
          items[idx + 1] = temp;
          saveState();
          renderReadingList();
        }
      };

      card.querySelector('.btn-del').onclick = (e) => {
        e.stopPropagation();
        day.readingList = items.filter(r => r.id !== item.id);
        saveState();
        renderReadingList();
      };

      container.appendChild(card);
    });
  }

  // Daily Tasks with Priority Auto-Sorting
  function sortTasks(tasks) {
    const priorityWeight = { 'P0': 0, 'P1': 1, 'P2': 2 };
    return [...tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const wa = priorityWeight[a.priority] !== undefined ? priorityWeight[a.priority] : 1;
      const wb = priorityWeight[b.priority] !== undefined ? priorityWeight[b.priority] : 1;
      return wa - wb;
    });
  }

  function renderTasks() {
    const list = document.getElementById('daily-task-list');
    if (!list) return;
    list.innerHTML = '';

    ensureCurrentDayExists();
    const day = state.dailyData[state.currentDate];
    let tasks = day.tasks || [];

    tasks = sortTasks(tasks);
    day.tasks = tasks;

    const filtered = tasks.filter(t => {
      if (taskFilter === 'active') return !t.done;
      if (taskFilter === 'done') return t.done;
      return true;
    });

    const badge = document.getElementById('task-stat-badge');
    const doneCount = tasks.filter(t => t.done).length;
    if (badge) badge.textContent = `${doneCount}/${tasks.length}`;

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="h-32 flex flex-col items-center justify-center text-slate-500 text-xs">
          <span>暂无${taskFilter === 'active' ? '进行中' : (taskFilter === 'done' ? '已完成' : '')}任务</span>
          <span class="text-[11px] text-slate-600 mt-1">在上方输入框键入待办即可添加 (支持 P0 优先排布)</span>
        </div>
      `;
      return;
    }

    filtered.forEach(task => {
      const item = document.createElement('div');
      item.className = 'p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition';
      
      const prioClass = task.priority === 'P0' ? 'badge-p0' : (task.priority === 'P1' ? 'badge-p1' : 'badge-p2');
      const pomoCount = task.pomodoros || 0;

      item.innerHTML = `
        <div class="flex items-center space-x-2.5 flex-1 min-w-0">
          <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} />
          <span class="px-1.5 py-0.5 text-[10px] font-bold rounded ${prioClass}">${task.priority || 'P1'}</span>
          <span class="text-xs truncate flex-1 ${task.done ? 'task-completed' : 'text-slate-200'}">${task.text}</span>
        </div>
        
        <div class="flex items-center space-x-2 ml-2">
          <div class="flex items-center space-x-1">
            ${pomoCount > 0 ? `<span class="text-[11px] text-amber-400 font-mono font-bold" title="已完成 ${pomoCount} 个番茄钟">🍅 x${pomoCount}</span>` : ''}
            <button class="btn-focus px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-900/60 hover:text-emerald-300 text-slate-400 text-[11px] font-medium transition" title="以此任务开启专注">
              🍅 专注
            </button>
          </div>
          ${!task.done ? `
            <button class="btn-defer px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-amber-950/60 hover:text-amber-300 text-slate-400 text-[11px] font-medium transition border border-slate-700/60 hover:border-amber-700/60" title="推至次日">
              推至次日
            </button>
          ` : ''}
          <button class="btn-del text-slate-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition p-1" title="删除待办">✕</button>
        </div>
      `;

      item.querySelector('.task-checkbox').onchange = (e) => {
        task.done = e.target.checked;
        if (task.done) confetti.fire();
        saveState();
        renderTasks();
        refreshHeatmap();
        calendar.render();
      };

      item.querySelector('.btn-focus').onclick = () => {
        pomodoro.setLinkedTask(task);
        pomodoro.start();
        document.getElementById('pomo-task-tag').textContent = `🎯 ${task.text}`;
        document.getElementById('pomo-task-tag').className = 'max-w-[130px] truncate text-[11px] text-emerald-400 font-semibold';
      };

      const btnDefer = item.querySelector('.btn-defer');
      if (btnDefer) {
        btnDefer.onclick = () => {
          const nextDate = getNextDateStr(state.currentDate);
          ensureCurrentDayExists(nextDate);
          day.tasks = day.tasks.filter(t => t.id !== task.id);
          state.dailyData[nextDate].tasks.push({ ...task, done: false });
          saveState();
          renderTasks();
          refreshHeatmap();
          calendar.render();
          showToast(`已将待办「${task.text}」推至次日 (${nextDate})`, 'info');
        };
      }

      item.querySelector('.btn-del').onclick = () => {
        day.tasks = day.tasks.filter(t => t.id !== task.id);
        saveState();
        renderTasks();
        refreshHeatmap();
        calendar.render();
      };

      list.appendChild(item);
    });
  }

  // Milestones & Selected Date Details
  function renderMilestones() {
    ensureCurrentDayExists();
    const day = state.dailyData[state.currentDate];
    const milestones = day.milestones || [];

    const countText = document.getElementById('milestone-count-text');
    if (countText) countText.textContent = milestones.length;

    const list = document.getElementById('selected-day-milestones-list');
    if (!list) return;
    list.innerHTML = '';

    // Check Chinese statutory holiday or festival
    const holiday = window.CalendarWidget ? window.CalendarWidget.getHolidayInfo(state.currentDate) : null;
    if (holiday && (holiday.name || holiday.isHoliday || holiday.isWorkday)) {
      const hCard = document.createElement('div');
      if (holiday.isHoliday) {
        hCard.className = 'mb-1.5 px-2.5 py-1.5 bg-emerald-950/60 border border-emerald-800/60 rounded flex items-center justify-between text-xs text-emerald-300';
        hCard.innerHTML = `
          <div class="flex items-center space-x-1.5 font-medium truncate">
            <span>🇨🇳</span>
            <span>法定节假日 · <strong>${holiday.name}</strong></span>
            ${holiday.lunarStr ? `<span class="text-[10px] text-emerald-400/80 font-normal">(${holiday.lunarStr})</span>` : ''}
          </div>
          <span class="px-1.5 py-0.2 bg-emerald-600 text-white font-bold text-[10px] rounded flex-shrink-0 shadow-xs">休假</span>
        `;
      } else if (holiday.isWorkday) {
        hCard.className = 'mb-1.5 px-2.5 py-1.5 bg-amber-950/60 border border-amber-800/60 rounded flex items-center justify-between text-xs text-amber-300';
        hCard.innerHTML = `
          <div class="flex items-center space-x-1.5 font-medium truncate">
            <span>💼</span>
            <span>调休补班日 · <strong>${holiday.name}</strong></span>
            ${holiday.lunarStr ? `<span class="text-[10px] text-amber-400/80 font-normal">(${holiday.lunarStr})</span>` : ''}
          </div>
          <span class="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[10px] rounded flex-shrink-0">补班</span>
        `;
      } else if (holiday.name) {
        hCard.className = 'mb-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/80 rounded flex items-center justify-between text-xs text-emerald-300';
        hCard.innerHTML = `
          <div class="flex items-center space-x-1.5 font-medium truncate">
            <span>🎉</span>
            <span>节日 · <strong>${holiday.name}</strong></span>
            ${holiday.lunarStr ? `<span class="text-[10px] text-slate-400 font-normal">(${holiday.lunarStr})</span>` : ''}
          </div>
        `;
      }
      list.appendChild(hCard);
    }

    if (milestones.length === 0 && (!holiday || (!holiday.name && !holiday.isHoliday && !holiday.isWorkday))) {
      list.innerHTML = `<div class="text-slate-500 text-[11px]">当日无特殊节点标记</div>`;
      return;
    }

    milestones.forEach(m => {
      const item = document.createElement('div');
      const isVacation = m.type === 'vacation' || (m.text && (m.text.includes('休假') || m.text.includes('请假') || m.text.includes('年假')));
      const isOvertime = m.type === 'overtime' || (m.text && m.text.includes('加班'));

      if (isVacation) {
        item.className = 'flex items-center justify-between bg-emerald-950/50 border border-emerald-800/50 text-emerald-200 px-2.5 py-1.5 rounded text-[11px] mb-1.5';
        item.innerHTML = `
          <div class="flex items-center space-x-1.5 truncate flex-1 mr-1">
            <span>🌴</span>
            <span class="font-medium">${m.text}</span>
          </div>
          <div class="flex items-center space-x-1.5 flex-shrink-0">
            <span class="px-1.5 py-0.2 bg-emerald-600 text-white font-bold text-[10px] rounded shadow-xs">休假</span>
            <button class="btn-del text-emerald-400/60 hover:text-red-400">✕</button>
          </div>
        `;
      } else if (isOvertime) {
        item.className = 'flex items-center justify-between bg-rose-950/50 border border-rose-800/50 text-rose-200 px-2.5 py-1.5 rounded text-[11px] mb-1.5';
        item.innerHTML = `
          <div class="flex items-center space-x-1.5 truncate flex-1 mr-1">
            <span>💼</span>
            <span class="font-medium">${m.text}</span>
          </div>
          <div class="flex items-center space-x-1.5 flex-shrink-0">
            <span class="px-1.5 py-0.2 bg-rose-600 text-white font-bold text-[10px] rounded shadow-xs">加班</span>
            <button class="btn-del text-rose-400/60 hover:text-red-400">✕</button>
          </div>
        `;
      } else {
        item.className = 'flex items-center justify-between text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded text-[11px] mb-1';
        item.innerHTML = `
          <span class="truncate flex-1 mr-1">🚩 ${m.text}</span>
          <button class="btn-del text-slate-500 hover:text-red-400">✕</button>
        `;
      }

      item.querySelector('.btn-del').onclick = () => {
        day.milestones = day.milestones.filter(x => x.id !== m.id);
        saveState();
        renderMilestones();
        calendar.render();
      };
      list.appendChild(item);
    });
  }

  // Bulletin & Scratchpad
  function renderBulletin() {
    const list = document.getElementById('bulletin-list');
    if (!list) return;
    list.innerHTML = '';

    const items = state.bulletin || [];
    if (items.length === 0) {
      list.innerHTML = `<div class="text-slate-500 py-3 text-center text-xs">暂无置顶公告，在此添加长期原则或重要通知</div>`;
      return;
    }

    items.forEach(b => {
      const card = document.createElement('div');
      card.className = 'bulletin-card text-xs flex items-start justify-between group';
      card.innerHTML = `
        <div class="flex-1 mr-2">
          <p class="text-amber-200/90 leading-relaxed font-medium">${b.text}</p>
          <span class="text-[9px] text-amber-500/70 mt-0.5 block">${b.createdAt || ''}</span>
        </div>
        <button class="btn-del text-slate-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
      `;

      card.querySelector('.btn-del').onclick = () => {
        state.bulletin = state.bulletin.filter(x => x.id !== b.id);
        saveState();
        renderBulletin();
      };

      list.appendChild(card);
    });
  }

  function renderScratchpad() {
    const list = document.getElementById('scratchpad-list');
    if (!list) return;
    list.innerHTML = '';

    const items = state.scratchpad || [];
    if (items.length === 0) {
      list.innerHTML = `<div class="text-slate-500 py-4 text-center text-xs">暂无灵感备忘，随手写一条吧！</div>`;
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'p-2 rounded bg-slate-900 border border-slate-800 text-xs flex flex-col space-y-1 group hover:border-slate-700 transition';
      
      card.innerHTML = `
        <div class="flex items-start justify-between">
          <p class="text-slate-200 leading-relaxed whitespace-pre-wrap flex-1">${item.text}</p>
          <button class="btn-del text-slate-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition ml-2">✕</button>
        </div>
        <div class="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
          <span>${item.createdAt || ''}</span>
          <button class="btn-to-task text-emerald-400 hover:text-emerald-300 font-medium transition">⚡ 转为今日待办</button>
        </div>
      `;

      card.querySelector('.btn-del').onclick = () => {
        state.scratchpad = state.scratchpad.filter(s => s.id !== item.id);
        saveState();
        renderScratchpad();
      };

      card.querySelector('.btn-to-task').onclick = () => {
        ensureCurrentDayExists();
        state.dailyData[state.currentDate].tasks.push({
          id: 't-' + Date.now(),
          text: item.text,
          done: false,
          priority: 'P1',
          pomodoros: 0
        });
        state.scratchpad = state.scratchpad.filter(s => s.id !== item.id);
        saveState();
        renderScratchpad();
        renderTasks();
        refreshHeatmap();
        calendar.render();
      };

      list.appendChild(card);
    });
  }

  function renderNotes() {
    ensureCurrentDayExists();
    const day = state.dailyData[state.currentDate];
    const editor = document.getElementById('note-editor');
    const preview = document.getElementById('note-preview');

    if (editor) editor.value = day.notes || '';
    if (preview) preview.innerHTML = renderMarkdown(day.notes || '*暂无纪要内容*');
  }

  function refreshHeatmap() {
    if (heatmap) {
      heatmap.render(state.currentDate);
    }
  }

  function switchActiveDate(dateStr) {
    state.currentDate = dateStr;
    ensureCurrentDayExists();
    saveState();

    updateHeaderInfo();
    renderWaterIntake();
    renderWeeklyGoals();
    renderMonthlyGoals();
    renderReadingList();
    renderTasks();
    renderNotes();
    renderBulletin();
    renderScratchpad();
    renderMilestones();
    refreshHeatmap();
    calendar.setSelectedDate(dateStr);
  }

  // --- FoFo AI Workflow Secretary ---
  function getAiWorkspaceContext() {
    const dateStr = state.currentDate;
    const day = state.dailyData[dateStr] || { tasks: [], milestones: [] };
    const date = new Date(`${dateStr}T12:00:00`);
    const weekStr = getWeekStr(date);
    const monthStr = getMonthStr(date);
    return {
      date: dateStr,
      weekday: getWeekdayName(date),
      week: weekStr,
      month: monthStr,
      monthlyGoals: (state.monthlyGoals || []).filter(g => !g.month || g.month === monthStr).map(g => ({
        text: g.text,
        done: !!g.done
      })),
      weeklyGoals: (state.weeklyGoals || []).filter(g => !g.week || g.week === weekStr).map(g => ({
        text: g.text,
        done: !!g.done
      })),
      tasks: (day.tasks || []).map(t => ({
        text: t.text,
        done: !!t.done,
        priority: t.priority || 'P1'
      })),
      schedules: (day.milestones || []).map(m => ({
        text: m.text,
        type: m.type || 'event'
      }))
    };
  }

  function buildAiPrompt(action, userInput) {
    const actionText = {
      plan: '请根据目标、日程和待办，给出今天最重要的 1-3 件事、建议顺序和番茄钟安排。',
      organize: '请把用户补充的这段记录整理成简洁的工作日志，并提取可执行的目标、待办或日程。',
      review: '请根据今日记录进行简短复盘：完成了什么、卡点是什么、明天或后续最值得延续的一件事是什么。',
      tomorrow: '请根据当前目标、未完成任务和日程，给出明天的工作安排草案。'
    }[action] || '请帮助我处理当前工作上下文。';
    const dateStr = state.currentDate;
    const curDate = new Date(dateStr + 'T12:00:00');
    const weekStr = getWeekStr(curDate);
    const monthStr = getMonthStr(curDate);
    return `你是 FoFo 的工作流秘书，不是泛泛聊天助手。只基于提供的工作上下文进行判断，避免空泛鼓励；优先给出可执行、可确认的建议。不要擅自声称已经修改了 FoFo 数据。\n\n任务：${actionText}\n用户补充：${userInput || '无'}\n\n当前 FoFo 工作上下文（JSON）：\n${JSON.stringify(getAiWorkspaceContext(), null, 2)}\n\n请用中文回答，正文不超过 10 行，给出简洁建议。若建议中显式包含月目标、周目标、待办或日程节点，请在回答末尾追加以下机器可读区块（不要放在 markdown 代码块中），没有可写入项时对应数组留空：\n<FOFO_ACTIONS>\n{\n  "monthGoals": [{"text": "月目标内容", "month": "${monthStr}"}],\n  "weekGoals": [{"text": "周目标内容", "week": "${weekStr}"}],\n  "tasks": [{"text": "今日/指定日待办内容", "priority": "P1", "date": "${dateStr}"}],\n  "schedules": [{"text": "日程节点内容", "date": "${dateStr}", "type": "event"}]\n}\n</FOFO_ACTIONS>\n说明：priority 只能使用 P0/P1/P2，type 只能使用 event/vacation/overtime；若涉及未来的具体日期节点，请在 schedules 的 date 中填写具体日期（YYYY-MM-DD）；写入前必须等待用户在 FoFo 中确认。`;
  }

  async function copyTextToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      const copied = document.execCommand('copy');
      temp.remove();
      return copied;
    } catch (e) {
      return false;
    }
  }

  function getAiPromptFromUi() {
    const active = document.querySelector('.ai-action-btn.bg-emerald-950\\/40');
    const action = active ? active.dataset.aiAction : 'plan';
    const input = document.getElementById('ai-assistant-input');
    return buildAiPrompt(action, input ? input.value.trim() : '');
  }

  const AI_CONFIG_STORAGE_KEY = 'fofo_ai_config_v1';
  const AI_PROVIDERS = {
    openai: {
      label: 'OpenAI',
      model: 'gpt-5-mini',
      envKey: 'OPENAI_API_KEY',
      endpoint: 'https://api.openai.com/v1/responses'
    },
    deepseek: {
      label: 'DeepSeek',
      model: 'deepseek-flash',
      envKey: 'DEEPSEEK_API_KEY',
      endpoint: 'https://api.deepseek.com/responses'
    }
  };

  function getAiProviderConfig(provider) {
    return AI_PROVIDERS[provider] || AI_PROVIDERS.openai;
  }

  function getAiModeHelp(mode, provider) {
    const providerConfig = getAiProviderConfig(provider);
    if (mode === 'chatgpt-web') {
      return '新手推荐｜步骤：①保存此模式 ②点击“复制并打开 ChatGPT” ③在 ChatGPT 中粘贴并发送。无需 API Key，也不需要 Python。';
    }
    if (mode === 'direct-api') {
      return `个人电脑模式（${providerConfig.label}）｜步骤：①在下方填写 ${providerConfig.label} API Key ②确认模型名称 ③保存并测试连接 ④点击“生成秘书建议”。无需 Python，但 Key 会保存在本机浏览器中；若提示 Failed to fetch，通常是浏览器跨域限制，请改用本地服务模式。`;
    }
    return `安全模式（${providerConfig.label}）｜Windows 配置步骤：
①先关闭正在运行的 FoFo 服务；
②打开开始菜单，搜索并进入“编辑系统环境变量”→“环境变量”；
③在“用户变量”区域点击“新建”，变量名填写 ${providerConfig.envKey}，变量值粘贴你的 ${providerConfig.label} API Key；
④连续点击“确定”，重新打开 FoFo 的 start.bat（已打开的终端不会自动读到新变量）；
⑤回到这里选择“${providerConfig.label}”并保存配置，再点击“测试连接”。
也可以在 PowerShell 临时运行：$env:${providerConfig.envKey}="你的Key"；然后在同一个窗口启动 server.py。Key 只由本地 server.py 读取，不会进入浏览器或项目文件。`;
  }

  function getAiConfig() {
    const defaults = { mode: 'chatgpt-web', provider: 'openai', apiKey: '', model: 'gpt-5-mini' };
    try {
      const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
      if (!raw) return defaults;
      const saved = JSON.parse(raw);
      const provider = AI_PROVIDERS[saved.provider] ? saved.provider : defaults.provider;
      return { ...defaults, ...saved, provider, model: saved.model || getAiProviderConfig(provider).model };
    } catch (e) {
      return defaults;
    }
  }

  function saveAiConfig(config) {
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify({
      mode: config.mode || 'chatgpt-web',
      provider: config.provider || 'openai',
      apiKey: config.apiKey || '',
      model: config.model || getAiProviderConfig(config.provider).model
    }));
  }

  function updateAiConfigUi(config = getAiConfig()) {
    const providerSelect = document.getElementById('ai-provider-select');
    const modeSelect = document.getElementById('ai-mode-select');
    const keyRow = document.getElementById('ai-api-key-row');
    const modelRow = document.getElementById('ai-model-row');
    const keyInput = document.getElementById('ai-api-key-input');
    const keyLabel = document.getElementById('ai-api-key-label');
    const modelInput = document.getElementById('ai-model-input');
    const help = document.getElementById('ai-mode-help');
    const provider = getAiProviderConfig(config.provider);
    if (providerSelect) providerSelect.value = AI_PROVIDERS[config.provider] ? config.provider : 'openai';
    if (modeSelect) modeSelect.value = config.mode;
    if (keyInput) keyInput.value = config.apiKey || '';
    if (keyLabel) keyLabel.textContent = `${provider.label} API Key`;
    if (modelInput) modelInput.value = config.model || provider.model;
    if (help) help.textContent = getAiModeHelp(config.mode, config.provider);
    const providerRow = document.getElementById('ai-provider-row');
    if (providerRow) providerRow.classList.toggle('hidden', config.mode === 'chatgpt-web');
    if (keyRow) keyRow.classList.toggle('hidden', config.mode !== 'direct-api');
    if (modelRow) modelRow.classList.toggle('hidden', config.mode === 'chatgpt-web');
  }

  function readAiConfigFromUi() {
    return {
      mode: document.getElementById('ai-mode-select')?.value || 'chatgpt-web',
      provider: document.getElementById('ai-provider-select')?.value || 'openai',
      apiKey: document.getElementById('ai-api-key-input')?.value.trim() || '',
      model: document.getElementById('ai-model-input')?.value.trim() || getAiProviderConfig(document.getElementById('ai-provider-select')?.value).model
    };
  }

  function collectAiText(value) {
    if (!value) return [];
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.flatMap(collectAiText);
    if (typeof value !== 'object') return [];
    if (value.type === 'reasoning_text' || value.type === 'reasoning') return [];
    if (value.type === 'output_text' && typeof value.text === 'string') return [value.text];
    if (typeof value.output_text === 'string') return [value.output_text];
    if (typeof value.text === 'string') return [value.text];
    if (typeof value.content === 'string') return [value.content];
    if (value.content) return collectAiText(value.content);
    if (value.message) return collectAiText(value.message);
    return [];
  }

  function extractAiOutput(result) {
    const parts = [
      ...collectAiText(result.output_text),
      ...collectAiText(result.output),
      ...collectAiText(result.choices),
      ...collectAiText(result.message)
    ].filter(Boolean);
    return [...new Set(parts)].join('\n').trim();
  }

  async function callDirectAi(prompt, config) {
    if (!config.apiKey) throw new Error('请先在 AI 配置中填写 API Key。');
    const provider = getAiProviderConfig(config.provider);
    const model = config.model || provider.model;
    const requestBody = {
      model,
      instructions: '你是 FoFo 的工作流秘书。只基于用户提供的工作上下文回答，给出可执行、可确认的建议，不要声称已经修改本地数据。',
      input: prompt,
      max_output_tokens: 1200
    };
    if (config.provider === 'deepseek') {
      requestBody.reasoning = { effort: 'none' };
    }
    let response;
    try {
      response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
    } catch (error) {
      throw new Error(`${provider.label} 请求未到达接口，浏览器可能拦截了跨域请求（${error.message || 'Failed to fetch'}）。可改用本地服务模式。`);
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || `${provider.label} API 请求失败`);
    const output = extractAiOutput(result);
    if (!output) throw new Error(`${provider.label} 已返回响应，但未提取到文本内容，请重试或检查模型设置。`);
    return { output, model, provider: provider.label };
  }

  async function callLocalAi(prompt, config) {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, provider: config.provider, model: config.model })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || '本地 AI 服务暂不可用');
    if (!result.output) throw new Error(`${result.provider || 'AI'} 已返回响应，但未提取到文本内容，请重试或检查模型设置。`);
    return result;
  }

  let pendingAiActions = [];
  let lastChatSuggestion = '';
  const AI_CHAT_STORAGE_KEY = 'fofo_ai_chat_sessions_v1';
  const AI_CHAT_FILE_ENDPOINT = '/api/ai/sessions';
  let aiChatStateCache = null;
  let aiChatFileSync = false;

  const AI_SKIN_STORAGE_KEY = 'fofo_ai_skin_config_v1';
  const DEFAULT_AI_AVATAR = 'assets/fofo-ai-pet-linabell.png';
  const DEFAULT_USER_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

  function getAiSkinConfig() {
    const defaults = { skin: 'classic', aiAvatar: DEFAULT_AI_AVATAR };
    try {
      const raw = localStorage.getItem(AI_SKIN_STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        skin: parsed.skin === 'wechat' ? 'wechat' : 'classic',
        aiAvatar: parsed.aiAvatar || DEFAULT_AI_AVATAR
      };
    } catch (e) {
      return defaults;
    }
  }

  function saveAiSkinConfig(config) {
    try {
      localStorage.setItem(AI_SKIN_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('保存皮肤配置失败', e);
    }
  }

  function applyAiSkin(config = getAiSkinConfig()) {
    const sidebar = document.getElementById('ai-chat-sidebar');
    if (!sidebar) return;
    if (config.skin === 'wechat') {
      sidebar.classList.add('skin-wechat');
      sidebar.classList.remove('skin-classic');
    } else {
      sidebar.classList.add('skin-classic');
      sidebar.classList.remove('skin-wechat');
    }
  }

  function formatWeChatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (isToday) {
      return timeStr;
    } else if (isYesterday) {
      return `昨天 ${timeStr}`;
    } else if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1}月${date.getDate()}日 ${timeStr}`;
    } else {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${timeStr}`;
    }
  }

  function initAiSkinModal() {
    const modal = document.getElementById('modal-ai-skin');
    const btnOpen = document.getElementById('btn-ai-skin-config');
    const btnClose = document.getElementById('modal-ai-skin-close');
    const btnCancel = document.getElementById('btn-cancel-ai-skin');
    const btnSave = document.getElementById('btn-save-ai-skin');
    const btnResetAvatar = document.getElementById('btn-reset-ai-avatar');
    const avatarInput = document.getElementById('ai-avatar-file-input');
    const avatarPreview = document.getElementById('ai-avatar-preview');
    const skinRadios = document.querySelectorAll('input[name="ai-skin-choice"]');

    if (!modal) return;

    let tempAvatar = '';

    const syncModalUi = () => {
      const config = getAiSkinConfig();
      skinRadios.forEach(radio => {
        radio.checked = radio.value === config.skin;
      });
      tempAvatar = config.aiAvatar || DEFAULT_AI_AVATAR;
      if (avatarPreview) avatarPreview.src = tempAvatar;
    };

    if (btnOpen) {
      btnOpen.onclick = () => {
        syncModalUi();
        modal.classList.remove('hidden');
      };
    }

    const closeModal = () => modal.classList.add('hidden');
    if (btnClose) btnClose.onclick = closeModal;
    if (btnCancel) btnCancel.onclick = closeModal;

    if (avatarInput) {
      avatarInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          showToast('请选择有效的图片文件', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 160;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            tempAvatar = canvas.toDataURL('image/png', 0.85);
            if (avatarPreview) avatarPreview.src = tempAvatar;
            showToast('AI 头像已加载，点击“保存并应用”生效', 'info');
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      };
    }

    if (btnResetAvatar) {
      btnResetAvatar.onclick = () => {
        tempAvatar = DEFAULT_AI_AVATAR;
        if (avatarPreview) avatarPreview.src = tempAvatar;
        if (avatarInput) avatarInput.value = '';
        showToast('已恢复默认 AI 头像', 'info');
      };
    }

    if (btnSave) {
      btnSave.onclick = () => {
        let chosenSkin = 'classic';
        skinRadios.forEach(radio => {
          if (radio.checked) chosenSkin = radio.value;
        });
        const config = {
          skin: chosenSkin,
          aiAvatar: tempAvatar || DEFAULT_AI_AVATAR
        };
        saveAiSkinConfig(config);
        applyAiSkin(config);
        renderAiChatMessages();
        closeModal();
        showToast(`皮肤设置已保存，已切换为【${chosenSkin === 'wechat' ? '微信风格' : '系统经典'}】`, 'success');
      };
    }

    applyAiSkin();
  }

  function cleanAiSuggestionText(text) {
    return String(text || '').replace(/<FOFO_ACTIONS>[\s\S]*?<\/FOFO_ACTIONS>/gi, '').trim();
  }

  function parseAiActions(text) {
    const raw = String(text || '');
    const blockMatch = raw.match(/<FOFO_ACTIONS>\s*([\s\S]*?)\s*<\/FOFO_ACTIONS>/i);
    let parsed = null;
    if (blockMatch) {
      try { parsed = JSON.parse(blockMatch[1]); } catch (e) { parsed = null; }
    }
    if (!parsed) {
      const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/i);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[1]); } catch (e) { parsed = null; }
      }
    }
    const listFrom = (value) => Array.isArray(value) ? value : (value ? [value] : []);
    const textOf = (item) => typeof item === 'string' ? item.trim() : String(item?.text || item?.title || item?.content || item?.name || '').trim();
    const opOf = (item) => (typeof item === 'object' && item && (item.op === 'delete' || item.action === 'delete' || item.type === 'delete' || item.remove === true || item.deleted === true)) ? 'delete' : 'add';
    const dateOf = (item) => /^\d{4}-\d{2}-\d{2}$/.test(item?.date || '') ? item.date : state.currentDate;
    const curDate = new Date(state.currentDate + 'T12:00:00');
    const monthOf = (item) => /^\d{4}-\d{2}$/.test(item?.month || '') ? item.month : getMonthStr(curDate);
    const weekOf = (item) => /^\d{4}-W\d{2}$/.test(item?.week || '') ? item.week : getWeekStr(curDate);

    const actions = [];
    const source = Array.isArray(parsed) ? { tasks: parsed } : (parsed || {});

    // 1. 月目标 (monthGoals)
    const rawMonthGoals = [
      ...listFrom(source.monthGoals),
      ...listFrom(source.monthlyGoals),
      ...listFrom(source.month_goals),
      ...listFrom(source.monthly_goals),
      ...listFrom(source.monthGoal),
      ...listFrom(source.monthlyGoal)
    ];
    rawMonthGoals.forEach(item => {
      const textValue = textOf(item);
      if (textValue) actions.push({ kind: 'monthGoal', text: textValue, month: monthOf(item), op: opOf(item) });
    });

    // 2. 周目标 (weekGoals)
    const rawWeekGoals = [
      ...listFrom(source.weekGoals),
      ...listFrom(source.weeklyGoals),
      ...listFrom(source.week_goals),
      ...listFrom(source.weekly_goals),
      ...listFrom(source.weekGoal),
      ...listFrom(source.weeklyGoal)
    ];
    rawWeekGoals.forEach(item => {
      const textValue = textOf(item);
      if (textValue) actions.push({ kind: 'weekGoal', text: textValue, week: weekOf(item), op: opOf(item) });
    });

    // 3. 待办 (tasks)
    const rawTasks = [
      ...listFrom(source.tasks),
      ...listFrom(source.todos),
      ...listFrom(source.todo),
      ...listFrom(source.task)
    ];
    rawTasks.forEach(item => {
      const textValue = textOf(item);
      if (textValue) {
        actions.push({
          kind: 'task',
          text: textValue,
          date: dateOf(item),
          priority: ['P0', 'P1', 'P2'].includes(item?.priority) ? item.priority : 'P1',
          op: opOf(item)
        });
      }
    });

    // 4. 日程节点 (schedules / milestones)
    const rawSchedules = [
      ...listFrom(source.schedules),
      ...listFrom(source.schedule),
      ...listFrom(source.events),
      ...listFrom(source.milestones),
      ...listFrom(source.milestone),
      ...listFrom(source.event)
    ];
    rawSchedules.forEach(item => {
      const textValue = textOf(item);
      if (textValue) {
        actions.push({
          kind: 'schedule',
          text: textValue,
          date: dateOf(item),
          type: ['event', 'vacation', 'overtime'].includes(item?.type) ? item.type : 'event',
          op: opOf(item)
        });
      }
    });

    // 5. 自然语言降级匹配（若没有提取到 actions 且没有解析到块）
    if (!actions.length && !blockMatch) {
      raw.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // 匹配行内可能携带的日期（如 2026-09-25 或 9月25日）
        let extractedDate = state.currentDate;
        const dateMatch = trimmed.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
        if (dateMatch) {
          extractedDate = `${dateMatch[1]}-${String(dateMatch[2]).padStart(2, '0')}-${String(dateMatch[3]).padStart(2, '0')}`;
        } else {
          const cnDateMatch = trimmed.match(/(\d{1,2})月(\d{1,2})日/);
          if (cnDateMatch) {
            const curYear = new Date(state.currentDate).getFullYear();
            extractedDate = `${curYear}-${String(cnDateMatch[1]).padStart(2, '0')}-${String(cnDateMatch[2]).padStart(2, '0')}`;
          }
        }

        // 删除待办
        const delTaskMatch = trimmed.match(/^\s*(?:[-*•\d.]\s*)?(?:删除(?:今日)?待办|删除待办事项|删除任务|移除待办|移除任务)[：:]\s*(.+)$/i);
        if (delTaskMatch) {
          actions.push({ kind: 'task', text: delTaskMatch[1].trim(), date: extractedDate, priority: 'P1', op: 'delete' });
          return;
        }

        // 删除月目标
        const delMonthMatch = trimmed.match(/^\s*(?:[-*•\d.]\s*)?(?:删除(?:本月)?(?:度)?目标|删除月目标|移除月目标)[：:]\s*(.+)$/i);
        if (delMonthMatch) {
          actions.push({ kind: 'monthGoal', text: delMonthMatch[1].trim(), month: getMonthStr(curDate), op: 'delete' });
          return;
        }

        // 删除周目标
        const delWeekMatch = trimmed.match(/^\s*(?:[-*•\d.]\s*)?(?:删除(?:本周)?(?:周度)?(?:重点|目标)|删除周目标|移除周目标)[：:]\s*(.+)$/i);
        if (delWeekMatch) {
          actions.push({ kind: 'weekGoal', text: delWeekMatch[1].trim(), week: getWeekStr(curDate), op: 'delete' });
          return;
        }

        // 删除日程节点
        const delScheduleMatch = trimmed.match(/^\s*(?:[-*•\d.]\s*)?(?:删除(?:日程|节点|里程碑)|移除(?:日程|节点))[：:]\s*(.+)$/i);
        if (delScheduleMatch) {
          actions.push({ kind: 'schedule', text: delScheduleMatch[1].trim(), date: extractedDate, type: 'event', op: 'delete' });
          return;
        }

        // 月目标 (新增)
        const monthMatch = trimmed.match(/^\s*(?:[-*•\d.]\s*)?(?:月[度度]?目标|月度重点|月度计划)[：:]\s*(.+)$/i);
        if (monthMatch) {
          actions.push({ kind: 'monthGoal', text: monthMatch[1].trim(), month: getMonthStr(curDate), op: 'add' });
          return;
        }

        // 周目标 (新增)
        const weekMatch = trimmed.match(/^\s*(?:[-*•\d.]\s*)?(?:周[度度]?目标|本周重点|周重点|周度计划)[：:]\s*(.+)$/i);
        if (weekMatch) {
          actions.push({ kind: 'weekGoal', text: weekMatch[1].trim(), week: getWeekStr(curDate), op: 'add' });
          return;
        }

        // 待办 (新增)
        const taskMatch = trimmed.match(/^\s*(?:[-*•\d.]\s*)?(?:今日待办|待办事项|待办任务|工作待办|待办|任务)[：:]\s*(.+)$/i);
        if (taskMatch) {
          actions.push({ kind: 'task', text: taskMatch[1].trim(), date: extractedDate, priority: 'P1', op: 'add' });
          return;
        }

        // 日程节点 (新增)
        const scheduleMatch = trimmed.match(/^\s*(?:[-*•\d.]\s*)?(?:日程节点|关键节点|日程安排|节点|日程|里程碑)[：:]\s*(.+)$/i);
        if (scheduleMatch) {
          actions.push({ kind: 'schedule', text: scheduleMatch[1].trim(), date: extractedDate, type: 'event', op: 'add' });
          return;
        }
      });
    }

    return actions;
  }

  function renderAiSuggestedActions(actions) {
    const panel = document.getElementById('ai-suggested-actions');
    if (!panel) return;
    pendingAiActions = actions || [];
    panel.innerHTML = '';
    if (!pendingAiActions.length) {
      panel.classList.add('hidden');
      return;
    }
    panel.classList.remove('hidden');
    const title = document.createElement('div');
    title.className = 'flex items-center justify-between pb-1';
    title.innerHTML = `
      <span class="text-xs font-semibold text-emerald-300 flex items-center space-x-1.5">
        <span>✨ 可更新工作区建议</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono">${pendingAiActions.length}</span>
      </span>
      <div class="flex items-center space-x-2.5">
        <label class="flex items-center space-x-1 text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer select-none" title="勾选后更新将清空当前周期未完成项并写入新建议">
          <input type="checkbox" id="check-ai-modal-overwrite-mode" class="accent-amber-500 rounded cursor-pointer" />
          <span>⚡ 覆写未完成项</span>
        </label>
        <button type="button" id="btn-ai-toggle-all-actions" class="text-[10px] text-slate-400 hover:text-emerald-400 transition cursor-pointer">全选 / 反选</button>
      </div>
    `;
    panel.appendChild(title);

    const list = document.createElement('div');
    list.className = 'space-y-1.5 max-h-56 overflow-y-auto pr-0.5';
    pendingAiActions.forEach((action, index) => {
      const isDelete = action.op === 'delete';
      const label = document.createElement('label');
      label.className = `flex items-start space-x-2 rounded border px-2.5 py-2 cursor-pointer transition ${isDelete ? 'border-rose-900/60 bg-rose-950/20 hover:border-rose-700/70' : 'border-slate-800 bg-slate-950/60 hover:border-emerald-800/70'}`;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.aiActionIndex = String(index);
      checkbox.checked = true;
      checkbox.className = `mt-0.5 flex-shrink-0 ${isDelete ? 'accent-rose-500' : 'accent-emerald-500'}`;

      const contentWrap = document.createElement('div');
      contentWrap.className = 'flex-1 min-w-0';

      let badgeHtml = '';
      let metaText = '';
      if (action.kind === 'monthGoal') {
        badgeHtml = isDelete
          ? '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800/60 mr-1.5 flex-shrink-0">删除月目标</span>'
          : '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-purple-950 text-purple-300 border border-purple-800/60 mr-1.5 flex-shrink-0">月目标</span>';
        metaText = `${action.month || '当月'}`;
      } else if (action.kind === 'weekGoal') {
        badgeHtml = isDelete
          ? '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800/60 mr-1.5 flex-shrink-0">删除周目标</span>'
          : '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-950 text-amber-300 border border-amber-800/60 mr-1.5 flex-shrink-0">周目标</span>';
        metaText = `${action.week || '本周'}`;
      } else if (action.kind === 'schedule') {
        badgeHtml = isDelete
          ? '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800/60 mr-1.5 flex-shrink-0">删除日程</span>'
          : '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-sky-950 text-sky-300 border border-sky-800/60 mr-1.5 flex-shrink-0">日程节点</span>';
        metaText = `${action.date || '当日'}${action.type && action.type !== 'event' ? ` · ${action.type === 'vacation' ? '休假' : '加班'}` : ''}`;
      } else {
        badgeHtml = isDelete
          ? '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800/60 mr-1.5 flex-shrink-0">删除待办</span>'
          : `<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 mr-1.5 flex-shrink-0">待办 · ${action.priority || 'P1'}</span>`;
        metaText = `${action.date || '今日'}`;
      }

      contentWrap.innerHTML = `
        <div class="flex items-center flex-wrap gap-y-0.5 leading-relaxed">
          ${badgeHtml}
          <span class="text-[11px] ${isDelete ? 'text-rose-200 line-through' : 'text-slate-200'} break-words font-medium">${action.text}</span>
        </div>
        <div class="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-1">
          <span>📅 ${metaText}</span>
        </div>
      `;

      label.append(checkbox, contentWrap);
      list.appendChild(label);
    });
    panel.appendChild(list);

    const actionsBar = document.createElement('div');
    actionsBar.className = 'flex items-center justify-between pt-2 border-t border-slate-800/70 mt-1';
    actionsBar.innerHTML = `
      <span class="text-[10px] text-slate-500">勾选后点击确认即更新</span>
      <div class="flex items-center space-x-2">
        <button id="btn-ai-dismiss-actions" class="px-2.5 py-1.5 rounded text-slate-400 hover:text-slate-200 text-[11px] transition">暂不写入</button>
        <button id="btn-ai-confirm-actions" class="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition shadow-xs">确认更新选中项</button>
      </div>
    `;
    panel.appendChild(actionsBar);

    document.getElementById('btn-ai-confirm-actions').onclick = confirmSelectedAiActions;
    document.getElementById('btn-ai-dismiss-actions').onclick = () => renderAiSuggestedActions([]);
    document.getElementById('btn-ai-toggle-all-actions').onclick = () => {
      const checkboxes = panel.querySelectorAll('input[data-ai-action-index]');
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      checkboxes.forEach(cb => cb.checked = !allChecked);
    };
  }

  function setAiSuggestion(rawOutput) {
    const output = cleanAiSuggestionText(rawOutput);
    const outputEl = document.getElementById('ai-assistant-output');
    if (outputEl) {
      outputEl.classList.add('markdown-preview');
      outputEl.innerHTML = renderMarkdown(output || 'AI 没有返回可显示的建议。');
    }
    renderAiSuggestedActions(parseAiActions(rawOutput));
  }

  function writeAiActions(selected, overwriteMode = false) {
    let addedMonthCount = 0;
    let addedWeekCount = 0;
    let addedTaskCount = 0;
    let addedScheduleCount = 0;
    let deletedMonthCount = 0;
    let deletedWeekCount = 0;
    let deletedTaskCount = 0;
    let deletedScheduleCount = 0;

    const curDate = new Date(state.currentDate + 'T12:00:00');
    const defaultMonth = getMonthStr(curDate);
    const defaultWeek = getWeekStr(curDate);

    // If overwriteMode is active, clear uncompleted items for current month/week/day
    if (overwriteMode) {
      if (state.monthlyGoals) {
        state.monthlyGoals = state.monthlyGoals.filter(g => g.done);
      }
      if (state.weeklyGoals) {
        state.weeklyGoals = state.weeklyGoals.filter(w => w.done);
      }
      ensureCurrentDayExists();
      const todayData = state.dailyData[state.currentDate];
      if (todayData && todayData.tasks) {
        todayData.tasks = todayData.tasks.filter(t => t.done);
      }
    }

    selected.forEach(action => {
      const isDelete = action.op === 'delete';
      if (action.kind === 'monthGoal') {
        const targetMonth = /^\d{4}-\d{2}$/.test(action.month) ? action.month : defaultMonth;
        if (!state.monthlyGoals) state.monthlyGoals = [];
        if (isDelete) {
          const beforeLen = state.monthlyGoals.length;
          state.monthlyGoals = state.monthlyGoals.filter(g => !(g.month === targetMonth && (g.text.includes(action.text) || action.text.includes(g.text))));
          if (state.monthlyGoals.length < beforeLen) deletedMonthCount += (beforeLen - state.monthlyGoals.length);
        } else {
          if (!state.monthlyGoals.some(g => g.month === targetMonth && g.text === action.text)) {
            state.monthlyGoals.push({
              id: `g-ai-${Date.now()}-${addedMonthCount}`,
              month: targetMonth,
              text: action.text,
              done: false,
              progress: 0
            });
            addedMonthCount += 1;
          }
        }
      } else if (action.kind === 'weekGoal') {
        const targetWeek = /^\d{4}-W\d{2}$/.test(action.week) ? action.week : defaultWeek;
        if (!state.weeklyGoals) state.weeklyGoals = [];
        if (isDelete) {
          const beforeLen = state.weeklyGoals.length;
          state.weeklyGoals = state.weeklyGoals.filter(w => !(w.week === targetWeek && (w.text.includes(action.text) || action.text.includes(w.text))));
          if (state.weeklyGoals.length < beforeLen) deletedWeekCount += (beforeLen - state.weeklyGoals.length);
        } else {
          if (!state.weeklyGoals.some(w => w.week === targetWeek && w.text === action.text)) {
            state.weeklyGoals.push({
              id: `w-ai-${Date.now()}-${addedWeekCount}`,
              week: targetWeek,
              text: action.text,
              done: false
            });
            addedWeekCount += 1;
          }
        }
      } else if (action.kind === 'task') {
        const targetDate = /^\d{4}-\d{2}-\d{2}$/.test(action.date) ? action.date : state.currentDate;
        ensureCurrentDayExists(targetDate);
        const day = state.dailyData[targetDate];
        if (!day.tasks) day.tasks = [];
        if (isDelete) {
          const beforeLen = day.tasks.length;
          day.tasks = day.tasks.filter(task => !(task.text.includes(action.text) || action.text.includes(task.text)));
          if (day.tasks.length < beforeLen) deletedTaskCount += (beforeLen - day.tasks.length);
        } else {
          if (!day.tasks.some(task => task.text === action.text)) {
            day.tasks.push({
              id: `t-ai-${Date.now()}-${addedTaskCount}`,
              text: action.text,
              done: false,
              priority: action.priority || 'P1',
              pomodoros: 0
            });
            addedTaskCount += 1;
          }
        }
      } else if (action.kind === 'schedule') {
        const targetDate = /^\d{4}-\d{2}-\d{2}$/.test(action.date) ? action.date : state.currentDate;
        ensureCurrentDayExists(targetDate);
        const day = state.dailyData[targetDate];
        if (!day.milestones) day.milestones = [];
        if (isDelete) {
          const beforeLen = day.milestones.length;
          day.milestones = day.milestones.filter(m => !(m.text.includes(action.text) || action.text.includes(m.text)));
          if (day.milestones.length < beforeLen) deletedScheduleCount += (beforeLen - day.milestones.length);
        } else {
          if (!day.milestones.some(milestone => milestone.text === action.text)) {
            day.milestones.push({
              id: `m-ai-${Date.now()}-${addedScheduleCount}`,
              text: action.text,
              type: action.type || 'event'
            });
            addedScheduleCount += 1;
          }
        }
      }
    });

    saveState(true);
    renderTasks();
    renderMilestones();
    renderWeeklyGoals();
    renderMonthlyGoals();
    updateGoalsProgressBadge();
    refreshHeatmap();
    calendar.render();
    pendingAiActions = [];

    const addParts = [];
    if (addedMonthCount) addParts.push(`${addedMonthCount} 项月目标`);
    if (addedWeekCount) addParts.push(`${addedWeekCount} 项周目标`);
    if (addedTaskCount) addParts.push(`${addedTaskCount} 项待办`);
    if (addedScheduleCount) addParts.push(`${addedScheduleCount} 项日程节点`);

    const delParts = [];
    if (deletedMonthCount) delParts.push(`${deletedMonthCount} 项月目标`);
    if (deletedWeekCount) delParts.push(`${deletedWeekCount} 项周目标`);
    if (deletedTaskCount) delParts.push(`${deletedTaskCount} 项待办`);
    if (deletedScheduleCount) delParts.push(`${deletedScheduleCount} 项日程`);

    let summary = '';
    if (overwriteMode) summary += '【覆写模式】';
    if (addParts.length) summary += `新增写入 ${addParts.join('、')}；`;
    if (delParts.length) summary += `删除移除 ${delParts.join('、')}；`;

    if (summary) {
      showToast(`已成功更新至工作区：${summary}`, 'success');
    } else {
      showToast('操作已执行，工作区未发生变动。', 'info');
    }
  }

  function confirmSelectedAiActions() {
    const selected = [...document.querySelectorAll('#ai-suggested-actions input[data-ai-action-index]:checked')]
      .map(input => pendingAiActions[Number(input.dataset.aiActionIndex)])
      .filter(Boolean);
    if (!selected.length) {
      showToast('请至少勾选一项建议后再写入。', 'info');
      return;
    }
    const overwriteMode = !!document.getElementById('check-ai-modal-overwrite-mode')?.checked;
    if (overwriteMode) {
      if (!window.confirm('确认以【覆写模式】更新吗？当前月/周/日尚未完成的目标与待办将被清空并替换。已完成的历史项会保留。')) {
        return;
      }
    }
    writeAiActions(selected, overwriteMode);
  }

  async function requestAiSecretary() {
    const statusEl = document.getElementById('ai-assistant-status');
    const outputEl = document.getElementById('ai-assistant-output');
    if (!statusEl || !outputEl) return;
    statusEl.textContent = '正在整理工作上下文并请求 AI…';
    outputEl.textContent = 'FoFo AI 正在思考…';
    renderAiSuggestedActions([]);
    const config = readAiConfigFromUi();
    const provider = getAiProviderConfig(config.provider);
    try {
      if (config.mode === 'chatgpt-web') throw new Error('当前为 ChatGPT 网页协同模式，请点击“复制并打开 ChatGPT”。');
      const result = config.mode === 'direct-api'
        ? await callDirectAi(getAiPromptFromUi(), config)
        : await callLocalAi(getAiPromptFromUi(), config);
      setAiSuggestion(result.output);
      statusEl.textContent = `已生成建议 · ${result.provider ? `${result.provider} · ` : ''}${result.model || 'FoFo AI'}`;
    } catch (e) {
      const detail = e.message || 'AI 服务暂不可用';
      outputEl.textContent = `${provider.label} 请求失败：${detail}\n\n如果你刚修改了服务商或 API Key，请先点击“保存配置”；如果错误是 Failed to fetch，通常是浏览器跨域限制，可改用本地服务模式。`;
      statusEl.textContent = `${provider.label}：${detail}`;
    }
  }

  function newAiChatSession() {
    return { id: `chat-${Date.now()}`, title: '新会话', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [] };
  }

  function normalizeAiChatState(rawState) {
    const rawSessions = Array.isArray(rawState?.sessions) ? rawState.sessions : [];
    const sessions = rawSessions.map(session => ({
      ...session,
      id: String(session.id || `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`),
      title: String(session.title || '新会话'),
      messages: Array.isArray(session.messages) ? session.messages : []
    }));
    if (!sessions.length) {
      const session = newAiChatSession();
      return { currentId: session.id, sessions: [session] };
    }
    const currentId = sessions.some(session => session.id === rawState?.currentId)
      ? rawState.currentId
      : sessions[0].id;
    return { currentId, sessions };
  }

  function getLocalAiChatState() {
    try {
      const saved = JSON.parse(localStorage.getItem(AI_CHAT_STORAGE_KEY) || '{}');
      return normalizeAiChatState(saved);
    } catch (e) { /* use a clean session */ }
    return normalizeAiChatState(null);
  }

  function getAiChatState() {
    if (!aiChatStateCache) aiChatStateCache = getLocalAiChatState();
    return aiChatStateCache;
  }

  function saveAiChatState(chatState) {
    aiChatStateCache = normalizeAiChatState(chatState);
    try { localStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(aiChatStateCache)); } catch (e) { console.warn('AI 会话浏览器缓存失败', e); }
    if (aiChatFileSync) {
      fetch(AI_CHAT_FILE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiChatStateCache)
      }).catch(error => {
        aiChatFileSync = false;
        updateAiChatPersistenceStatus();
        console.warn('AI 会话文件保存失败', error);
      });
    }
  }

  function isMeaningfulAiChatState(chatState) {
    return chatState.sessions.length > 1
      || chatState.sessions.some(session => session.messages.length || session.title !== '新会话');
  }

  function updateAiChatPersistenceStatus() {
    const status = document.getElementById('ai-chat-status');
    if (!status) return;
    status.textContent = aiChatFileSync
      ? '会话记录保存在 FoFo/.FoFoAI'
      : '会话记录保存在当前浏览器（本地服务未连接时使用）';
  }

  async function loadAiChatStateFromServer() {
    try {
      const response = await fetch(AI_CHAT_FILE_ENDPOINT, { headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const serverState = normalizeAiChatState(payload);
      const localState = getLocalAiChatState();
      aiChatFileSync = true;
      if (payload.persisted || isMeaningfulAiChatState(serverState)) {
        aiChatStateCache = serverState;
        localStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(serverState));
      } else {
        aiChatStateCache = localState;
        await fetch(AI_CHAT_FILE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localState)
        });
      }
      updateAiChatPersistenceStatus();
      renderAiChatSessions();
      renderAiChatMessages();
    } catch (error) {
      aiChatFileSync = false;
      updateAiChatPersistenceStatus();
      console.info('FoFo 本地会话文件不可用，继续使用浏览器存储', error);
    }
  }

  function getCurrentAiChatSession(chatState = getAiChatState()) {
    return chatState.sessions.find(session => session.id === chatState.currentId) || chatState.sessions[0];
  }

  function renderAiChatSessions() {
    const select = document.getElementById('ai-chat-session-select');
    if (!select) return;
    const chatState = getAiChatState();
    select.innerHTML = '';
    chatState.sessions.forEach(session => {
      const option = document.createElement('option');
      option.value = session.id;
      option.textContent = session.title || '新会话';
      option.selected = session.id === chatState.currentId;
      select.appendChild(option);
    });
  }

  function renameCurrentAiChatSession() {
    const chatState = getAiChatState();
    const session = getCurrentAiChatSession(chatState);
    if (!session) return;
    const nextTitle = window.prompt('请输入新的会话名称：', session.title || '新会话');
    if (nextTitle === null) return;
    const title = nextTitle.trim();
    if (!title) {
      showToast('会话名称不能为空。', 'info');
      return;
    }
    session.title = title.slice(0, 40);
    session.updatedAt = new Date().toISOString();
    saveAiChatState(chatState);
    renderAiChatSessions();
    showToast('会话名称已更新。', 'success');
  }

  function deleteCurrentAiChatSession() {
    const chatState = getAiChatState();
    const index = chatState.sessions.findIndex(session => session.id === chatState.currentId);
    if (index < 0) return;
    const session = chatState.sessions[index];
    if (!window.confirm(`确认删除会话“${session.title || '新会话'}”吗？删除后无法恢复。`)) return;
    chatState.sessions.splice(index, 1);
    if (!chatState.sessions.length) {
      const fresh = newAiChatSession();
      chatState.sessions.push(fresh);
      chatState.currentId = fresh.id;
    } else {
      chatState.currentId = chatState.sessions[Math.max(0, index - 1)].id;
    }
    saveAiChatState(chatState);
    renderAiChatSessions();
    renderAiChatMessages();
    showToast('会话已删除。', 'success');
  }

  function renderAiChatMessages() {
    const list = document.getElementById('ai-chat-messages');
    if (!list) return;
    const chatState = getAiChatState();
    const session = getCurrentAiChatSession(chatState);
    const skinConfig = getAiSkinConfig();
    const isWechat = skinConfig.skin === 'wechat';

    list.innerHTML = '';
    if (!session.messages.length) {
      list.innerHTML = `<div class="h-full flex items-center justify-center text-center text-xs ${isWechat ? 'text-stone-400' : 'text-slate-500'} px-8">这是一个持续会话。FoFo AI 会结合当前工作台目标、待办和日程回答。</div>`;
    }

    let lastTimestampMs = 0;
    const userAvatarSrc = state.userAvatar || DEFAULT_USER_AVATAR;
    const aiAvatarSrc = skinConfig.aiAvatar || DEFAULT_AI_AVATAR;

    session.messages.forEach(message => {
      const msgTimeMs = message.createdAt ? new Date(message.createdAt).getTime() : 0;
      // In WeChat skin: Render centered discrete timestamp if >= 5 minutes apart or first message
      if (isWechat && msgTimeMs) {
        if (!lastTimestampMs || (msgTimeMs - lastTimestampMs >= 5 * 60 * 1000)) {
          const timeDiv = document.createElement('div');
          timeDiv.className = 'flex justify-center my-2';
          timeDiv.innerHTML = `<span class="wechat-timestamp">${formatWeChatTime(message.createdAt)}</span>`;
          list.appendChild(timeDiv);
          lastTimestampMs = msgTimeMs;
        }
      }

      if (isWechat) {
        const row = document.createElement('div');
        row.className = `chat-msg-row ${message.role === 'user' ? 'user' : 'assistant'}`;

        if (message.role === 'user') {
          const bubble = document.createElement('div');
          bubble.className = 'chat-bubble whitespace-pre-wrap';
          bubble.textContent = message.content;

          const avatar = document.createElement('img');
          avatar.className = 'chat-avatar';
          avatar.src = userAvatarSrc;
          avatar.alt = 'User';

          row.append(bubble, avatar);
        } else {
          const avatar = document.createElement('img');
          avatar.className = 'chat-avatar';
          avatar.src = aiAvatarSrc;
          avatar.alt = 'FoFo AI';

          const bubble = document.createElement('div');
          bubble.className = 'chat-bubble markdown-preview';
          bubble.innerHTML = renderMarkdown(cleanAiSuggestionText(message.content) || '已生成可写入工作台的建议。');

          row.append(avatar, bubble);
        }
        list.appendChild(row);
      } else {
        // Classic style
        const wrapper = document.createElement('div');
        wrapper.className = `flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`;
        const bubble = document.createElement('div');
        bubble.className = `max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed ${message.role === 'user' ? 'bg-emerald-900/70 text-emerald-100 whitespace-pre-wrap' : 'bg-slate-900 border border-slate-800 text-slate-300'}`;
        const role = document.createElement('div');
        role.className = 'text-[10px] opacity-60 mb-1';
        role.textContent = message.role === 'user' ? '你' : 'FoFo AI';
        const text = document.createElement('div');
        if (message.role === 'assistant') {
          text.className = 'markdown-preview text-xs text-slate-200 leading-relaxed';
          text.innerHTML = renderMarkdown(cleanAiSuggestionText(message.content) || '已生成可写入工作台的建议。');
        } else {
          text.className = 'text-xs text-emerald-100 leading-relaxed whitespace-pre-wrap';
          text.textContent = message.content;
        }
        bubble.append(role, text);
        wrapper.appendChild(bubble);
        list.appendChild(wrapper);
      }
    });

    list.scrollTop = list.scrollHeight;
    const lastAssistant = [...session.messages].reverse().find(message => message.role === 'assistant');
    let actionsToShow = [];
    if (lastAssistant && !lastAssistant.actionsHandled) {
      const parsed = parseAiActions(lastAssistant.content);
      // If all parsed additions are already in current workspace, auto-mark as handled to avoid repetitive prompts
      const isAlreadyApplied = parsed.length > 0 && parsed.every(a => {
        if (a.op === 'delete') return false;
        if (a.kind === 'monthGoal') return state.monthlyGoals?.some(g => g.month === a.month && g.text === a.text);
        if (a.kind === 'weekGoal') return state.weeklyGoals?.some(w => w.week === a.week && w.text === a.text);
        if (a.kind === 'task') return state.dailyData[a.date || state.currentDate]?.tasks?.some(t => t.text === a.text);
        if (a.kind === 'schedule') return state.dailyData[a.date || state.currentDate]?.milestones?.some(m => m.text === a.text);
        return false;
      });
      if (isAlreadyApplied) {
        lastAssistant.actionsHandled = true;
        saveAiChatState(chatState);
      } else {
        actionsToShow = parsed;
      }
    }
    renderAiChatSuggestedActions(actionsToShow, lastAssistant);
  }

  let pendingChatActions = [];

  function renderAiChatSuggestedActions(actions, targetMessage = null) {
    const panel = document.getElementById('ai-chat-last-actions');
    if (!panel) return;
    pendingChatActions = actions || [];
    panel.innerHTML = '';
    if (!pendingChatActions.length) {
      panel.classList.add('hidden');
      return;
    }
    panel.classList.remove('hidden');

    const card = document.createElement('div');
    card.className = 'rounded-lg border border-emerald-800/70 bg-slate-900/95 shadow-lg p-2.5 space-y-2';

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between pb-1 border-b border-slate-800';
    header.innerHTML = `
      <span class="text-xs font-semibold text-emerald-300 flex items-center space-x-1.5">
        <span>✨ 识别到 ${pendingChatActions.length} 项可更新建议</span>
      </span>
      <div class="flex items-center space-x-2">
        <label class="flex items-center space-x-1 text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer select-none" title="勾选后更新将清空当前周期未完成项并写入新建议">
          <input type="checkbox" id="check-chat-overwrite-mode" class="accent-amber-500 rounded cursor-pointer" />
          <span>⚡ 覆写未完成项</span>
        </label>
        <button type="button" id="btn-chat-toggle-all" class="text-[10px] text-slate-400 hover:text-emerald-400 transition cursor-pointer">全选 / 反选</button>
      </div>
    `;
    card.appendChild(header);

    const list = document.createElement('div');
    list.className = 'space-y-1.5 max-h-48 overflow-y-auto pr-0.5';

    pendingChatActions.forEach((action, index) => {
      const isDelete = action.op === 'delete';
      const label = document.createElement('label');
      label.className = `flex items-start space-x-2 rounded border px-2 py-1.5 cursor-pointer transition ${isDelete ? 'border-rose-900/60 bg-rose-950/20 hover:border-rose-700/60' : 'border-slate-800 bg-slate-950/70 hover:border-emerald-700/60'}`;
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.chatActionIndex = String(index);
      checkbox.checked = true;
      checkbox.className = `mt-0.5 flex-shrink-0 ${isDelete ? 'accent-rose-500' : 'accent-emerald-500'}`;

      const content = document.createElement('div');
      content.className = 'flex-1 min-w-0';

      let badgeHtml = '';
      let metaText = '';
      if (action.kind === 'monthGoal') {
        badgeHtml = isDelete
          ? '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800/60 mr-1.5 flex-shrink-0">删除月目标</span>'
          : '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-purple-950 text-purple-300 border border-purple-800/60 mr-1.5 flex-shrink-0">月目标</span>';
        metaText = `${action.month || '当月'}`;
      } else if (action.kind === 'weekGoal') {
        badgeHtml = isDelete
          ? '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800/60 mr-1.5 flex-shrink-0">删除周目标</span>'
          : '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-950 text-amber-300 border border-amber-800/60 mr-1.5 flex-shrink-0">周目标</span>';
        metaText = `${action.week || '本周'}`;
      } else if (action.kind === 'schedule') {
        badgeHtml = isDelete
          ? '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800/60 mr-1.5 flex-shrink-0">删除日程</span>'
          : '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-sky-950 text-sky-300 border border-sky-800/60 mr-1.5 flex-shrink-0">日程节点</span>';
        metaText = `${action.date || '当日'}${action.type && action.type !== 'event' ? ` · ${action.type === 'vacation' ? '休假' : '加班'}` : ''}`;
      } else {
        badgeHtml = isDelete
          ? '<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800/60 mr-1.5 flex-shrink-0">删除待办</span>'
          : `<span class="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 mr-1.5 flex-shrink-0">待办 · ${action.priority || 'P1'}</span>`;
        metaText = `${action.date || '今日'}`;
      }

      content.innerHTML = `
        <div class="flex items-center flex-wrap gap-y-0.5 leading-snug">
          ${badgeHtml}
          <span class="text-[11px] ${isDelete ? 'text-rose-200 line-through' : 'text-slate-200'} break-words font-medium">${action.text}</span>
        </div>
        <div class="text-[10px] text-slate-500 mt-0.5">📅 ${metaText}</div>
      `;

      label.append(checkbox, content);
      list.appendChild(label);
    });
    card.appendChild(list);

    const footer = document.createElement('div');
    footer.className = 'flex items-center justify-between pt-1.5 border-t border-slate-800';
    footer.innerHTML = `
      <span class="text-[10px] text-slate-500">可勾选部分或全部更新</span>
      <div class="flex items-center space-x-2">
        <button type="button" id="btn-chat-dismiss-actions" class="px-2 py-1 rounded text-slate-400 hover:text-slate-200 text-[10px] transition">暂不更新</button>
        <button type="button" id="btn-chat-confirm-actions" class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold transition">确认更新选中项</button>
      </div>
    `;
    card.appendChild(footer);
    panel.appendChild(card);

    document.getElementById('btn-chat-toggle-all').onclick = () => {
      const checkboxes = panel.querySelectorAll('input[data-chat-action-index]');
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      checkboxes.forEach(cb => cb.checked = !allChecked);
    };

    document.getElementById('btn-chat-dismiss-actions').onclick = () => {
      if (targetMessage) {
        targetMessage.actionsHandled = true;
        saveAiChatState(getAiChatState());
      }
      renderAiChatSuggestedActions([]);
    };

    document.getElementById('btn-chat-confirm-actions').onclick = () => {
      const selected = [...panel.querySelectorAll('input[data-chat-action-index]:checked')]
        .map(input => pendingChatActions[Number(input.dataset.chatActionIndex)])
        .filter(Boolean);
      if (!selected.length) {
        showToast('请至少勾选一项建议后再更新写入。', 'info');
        return;
      }
      const overwriteMode = !!document.getElementById('check-chat-overwrite-mode')?.checked;
      if (overwriteMode) {
        if (!window.confirm('确认以【覆写模式】更新吗？当前月/周/日尚未完成的目标与待办将被清空并替换。已完成的历史项会保留。')) {
          return;
        }
      }
      writeAiActions(selected, overwriteMode);
      if (targetMessage) {
        targetMessage.actionsHandled = true;
        saveAiChatState(getAiChatState());
      }
      renderAiChatSuggestedActions([]);
    };
  }

  function buildAiChatPrompt(session, userText, attachWorkspace = false) {
    const history = session.messages.slice(-12).map(message => `${message.role === 'user' ? '用户' : 'FoFo AI'}：${message.content}`).join('\n\n');
    const dateStr = state.currentDate;
    const curDate = new Date(dateStr + 'T12:00:00');
    const weekStr = getWeekStr(curDate);
    const monthStr = getMonthStr(curDate);

    let workspaceContextPart = '';
    if (attachWorkspace) {
      workspaceContextPart = `\n\n【用户附带的工作台状态附件（JSON）】：\n${JSON.stringify(getAiWorkspaceContext(), null, 2)}\n请重点结合用户附带的工作台状态进行分析、对齐与规划。若发现当前已有目标或待办不再合适，可建议删除过时项或提出全新替代建议。`;
    } else {
      workspaceContextPart = '\n\n【说明】：用户本次提问未附带工作台状态附件，请直接围绕用户的输入内容和多轮历史进行沟通解答。';
    }

    return `你是 FoFo 的工作流秘书，正在进行多轮工作协作。请给出简洁、务实、可执行的回答，不要泛泛空谈，也不要擅自声称已经修改了本地数据。${workspaceContextPart}\n\n会话历史：\n${history || '无'}\n\n用户最新消息：\n${userText}\n\n请用中文给出简洁、排版清晰的回答（支持 Markdown 语法如加粗、列表），正文不超过 10 行。若建议中显式包含新增或删除月目标、周目标、待办或日程节点，请在末尾追加机器可读区块（不要放在 markdown 代码块中）：\n<FOFO_ACTIONS>\n{\n  "monthGoals": [{"text": "月目标内容", "month": "${monthStr}", "op": "add"}],\n  "weekGoals": [{"text": "周目标内容", "week": "${weekStr}", "op": "add"}],\n  "tasks": [{"text": "待办内容", "priority": "P1", "date": "${dateStr}", "op": "add"}],\n  "schedules": [{"text": "日程节点内容", "date": "${dateStr}", "type": "event", "op": "add"}]\n}\n</FOFO_ACTIONS>\n说明：\n1. 若为删除或清理已有过时项，请将对应条目的 "op" 设为 "delete"（例如 {"text": "已废弃的目标或待办", "op": "delete"}）；新增项 "op" 为 "add"（或省略）。\n2. 若用户希望全面重新规划或推翻重来，可明确建议用户使用“⚡ 覆写模式”一键清空未完成项并写入新规划。\n3. 若建议规划了整月重点请放入 monthGoals；本周重点放入 weekGoals；具体待办放入 tasks；关键节点/会议/休假放入 schedules 并指定具体 date（YYYY-MM-DD）；没有变更的数组留空；所有操作必须经用户在界面勾选确认后更新到工作区。`;
  }

  async function sendAiChatMessage(presetText = '') {
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('btn-ai-chat-send');
    const attachCheckbox = document.getElementById('check-ai-attach-workspace');
    const text = String(presetText || (input ? input.value : '')).trim();
    if (!text) return;
    const chatState = getAiChatState();
    const session = getCurrentAiChatSession(chatState);
    const config = getAiConfig();
    if (config.mode === 'chatgpt-web') {
      showToast('多轮会话需要先在 AI 配置中选择直连 API 或本地服务模式。', 'info');
      return;
    }

    const attachWorkspace = !!(attachCheckbox && attachCheckbox.checked);

    session.messages.push({ role: 'user', content: text, createdAt: new Date().toISOString() });
    if (session.title === '新会话') session.title = text.slice(0, 22);
    session.updatedAt = new Date().toISOString();
    if (input) input.value = '';
    if (attachCheckbox) attachCheckbox.checked = false; // 每次发送后自动重置为未勾选

    saveAiChatState(chatState);
    renderAiChatSessions();
    renderAiChatMessages();
    if (sendBtn) sendBtn.disabled = true;
    try {
      const prompt = buildAiChatPrompt(session, text, attachWorkspace);
      const result = config.mode === 'direct-api' ? await callDirectAi(prompt, config) : await callLocalAi(prompt, config);
      session.messages.push({ role: 'assistant', content: result.output || 'AI 没有返回文本。', createdAt: new Date().toISOString(), actionsHandled: false });
    } catch (e) {
      session.messages.push({ role: 'assistant', content: `请求失败：${e.message || 'AI 服务暂不可用'}`, createdAt: new Date().toISOString(), actionsHandled: true });
    } finally {
      session.updatedAt = new Date().toISOString();
      saveAiChatState(chatState);
      renderAiChatSessions();
      renderAiChatMessages();
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  function openAiChatSidebar() {
    const sidebar = document.getElementById('ai-chat-sidebar');
    if (!sidebar) return;
    sidebar.classList.remove('hidden');
    renderAiChatSessions();
    renderAiChatMessages();
    document.getElementById('ai-chat-input')?.focus();
  }

  function openAiConfigModal() {
    const modal = document.getElementById('modal-ai-assistant');
    if (!modal) return;
    document.getElementById('ai-chat-sidebar')?.classList.add('hidden');
    modal.classList.remove('hidden');
    updateAiConfigUi();
    document.getElementById('ai-provider-select')?.focus();
  }

  function initAiPetInteraction() {
    const pet = document.getElementById('btn-ai-chat-sidebar');
    if (!pet || pet.dataset.petBound === 'true') return;
    pet.dataset.petBound = 'true';
    const bubble = pet.querySelector('.fofo-ai-pet-bubble');
    const lines = ['今天也要轻轻松松完成一件大事！', '嘿，看到我就说明该休息一下啦～', 'AI 助理已就位，随时听你安排！', '小声说：先做最重要的那一件。', '来碰一下，我给你打打气！'];
    const interactions = ['jump', 'squash', 'shake'];
    const PET_KEY = 'fofo_ai_pet_layout_v2';
    const MIN_SCALE = 0.8;
    const MAX_SCALE = 2;
    // Clear legacy corrupted layout if exists
    try { localStorage.removeItem('fofo_ai_pet_layout_v1'); } catch (e) {}
    let petLayout = { scale: 1, left: 0, top: 0 };
    try { petLayout = { ...petLayout, ...(JSON.parse(localStorage.getItem(PET_KEY) || '{}')) }; } catch (e) { /* defaults */ }
    const applyLayout = () => {
      pet.style.setProperty('--pet-scale', String(Math.max(MIN_SCALE, Math.min(MAX_SCALE, Number(petLayout.scale) || 1))));
      pet.style.setProperty('--pet-left', `${Number(petLayout.left) || 0}px`);
      pet.style.setProperty('--pet-top', `${Number(petLayout.top) || 0}px`);
    };
    const saveLayout = () => localStorage.setItem(PET_KEY, JSON.stringify(petLayout));
    applyLayout();
    let interactionIndex = 0;
    let bubbleTimer = null;
    let animationTimer = null;
    let petAlertTimer = null;
    let petAlertActive = false;

    window.triggerPetPomodoroAlert = (mode) => {
      petAlertActive = true;
      window.clearTimeout(bubbleTimer);
      window.clearTimeout(animationTimer);
      if (petAlertTimer) {
        clearInterval(petAlertTimer);
        petAlertTimer = null;
      }

      const isWorkEnding = (mode === 'focus');
      const title = isWorkEnding ? '⏰ 专注时间到啦！' : '🔔 休息时间结束啦！';
      const desc = isWorkEnding ? '太棒了，快让眼睛和大脑休息一下吧～🍵' : '元气满满，准备开始下一轮专注吧～💪';
      
      if (bubble) {
        bubble.innerHTML = `
          <div class="font-bold text-[11px] mb-0.5 text-amber-900">${title}</div>
          <div class="text-[10px] leading-tight mb-1 text-slate-700">${desc}</div>
          <div class="text-[9px] font-semibold text-amber-800 bg-amber-200/90 rounded py-0.5 px-2 inline-block">👆 点击确认关闭</div>
        `;
        bubble.classList.add('is-visible', 'is-alert');
      }

      const animList = ['jump', 'squash', 'shake'];
      let step = 0;
      const playAlertAnim = () => {
        if (!petAlertActive) return;
        pet.dataset.interaction = animList[step % animList.length];
        step++;
        window.setTimeout(() => {
          if (petAlertActive) pet.removeAttribute('data-interaction');
        }, 700);
      };

      playAlertAnim();
      petAlertTimer = setInterval(playAlertAnim, 1600);
    };

    window.dismissPetPomodoroAlert = () => {
      if (!petAlertActive) return;
      petAlertActive = false;
      if (petAlertTimer) {
        clearInterval(petAlertTimer);
        petAlertTimer = null;
      }
      pet.removeAttribute('data-interaction');
      if (bubble) {
        bubble.classList.remove('is-alert');
        bubble.classList.remove('is-visible');
        bubble.innerHTML = '';
      }
    };

    if (bubble) {
      bubble.addEventListener('click', (event) => {
        if (petAlertActive) {
          event.preventDefault();
          event.stopPropagation();
          window.dismissPetPomodoroAlert();
          showToast('收到番茄钟提醒，继续加油！', 'info', 2000);
        }
      });
    }

    const toggleEditing = (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (petAlertActive) {
        window.dismissPetPomodoroAlert();
      }
      pet.classList.toggle('is-editing');
      if (bubble) {
        bubble.textContent = pet.classList.contains('is-editing') ? '拖动我调整位置，按＋−缩放' : '调整完成！';
        bubble.classList.add('is-visible');
        window.clearTimeout(bubbleTimer);
        bubbleTimer = window.setTimeout(() => bubble.classList.remove('is-visible'), 2000);
      }
    };

    pet.addEventListener('dblclick', toggleEditing);
    pet.addEventListener('contextmenu', toggleEditing);

    pet.querySelectorAll('[data-pet-action]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        const action = button.dataset.petAction;
        if (action === 'larger') petLayout.scale = Math.min(MAX_SCALE, (Number(petLayout.scale) || 1) + 0.1);
        if (action === 'smaller') petLayout.scale = Math.max(MIN_SCALE, (Number(petLayout.scale) || 1) - 0.1);
        if (action === 'reset') petLayout = { scale: 1, left: 0, top: 0 };
        applyLayout();
        saveLayout();
      });
    });

    let drag = null;
    pet.addEventListener('pointerdown', event => {
      if (!pet.classList.contains('is-editing') || event.button !== 0 || event.target.closest('[data-pet-action]')) return;
      event.preventDefault();
      drag = { x: event.clientX, y: event.clientY, left: Number(petLayout.left) || 0, top: Number(petLayout.top) || 0 };
      pet.classList.add('is-dragging');
      try { pet.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
    });
    pet.addEventListener('pointermove', event => {
      if (!drag) return;
      petLayout.left = Math.round(drag.left + event.clientX - drag.x);
      petLayout.top = Math.round(drag.top + event.clientY - drag.y);
      applyLayout();
    });
    pet.addEventListener('pointerup', event => {
      if (!drag) return;
      drag = null;
      pet.classList.remove('is-dragging');
      try { pet.releasePointerCapture(event.pointerId); } catch (e) { /* ignore */ }
      saveLayout();
    });

    const triggerInteraction = () => {
      if (pet.classList.contains('is-editing') || petAlertActive) return;
      const interaction = interactions[interactionIndex % interactions.length];
      interactionIndex += 1;
      pet.dataset.interaction = interaction;
      if (bubble) {
        window.clearTimeout(bubbleTimer);
        bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
        bubble.classList.add('is-visible');
        bubbleTimer = window.setTimeout(() => bubble.classList.remove('is-visible'), 2400);
      }
      window.clearTimeout(animationTimer);
      animationTimer = window.setTimeout(() => {
        pet.removeAttribute('data-interaction');
      }, 780);
    };

    pet.addEventListener('pointerenter', triggerInteraction);
    pet.addEventListener('focus', triggerInteraction);
    pet.addEventListener('pointerleave', () => {
      if (bubble && !pet.classList.contains('is-editing') && !petAlertActive) bubble.classList.remove('is-visible');
    });
    pet.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        if (!pet.classList.contains('is-editing')) {
          event.preventDefault();
          if (petAlertActive) {
            window.dismissPetPomodoroAlert();
            showToast('收到番茄钟提醒，继续加油！', 'info', 2000);
            return;
          }
          openAiChatSidebar();
        }
      }
    });
  }

  function initAiSecretary() {
    const modal = document.getElementById('modal-ai-assistant');
    const closeBtn = document.getElementById('modal-ai-close');
    const providerSelect = document.getElementById('ai-provider-select');
    const modeSelect = document.getElementById('ai-mode-select');
    const saveConfigBtn = document.getElementById('btn-ai-save-config');
    const testConfigBtn = document.getElementById('btn-ai-test-config');
    const clearConfigBtn = document.getElementById('btn-ai-clear-config');
    const statusEl = document.getElementById('ai-config-status');
    if (!modal) return;

    document.getElementById('btn-ai-chat-sidebar')?.addEventListener('click', (e) => {
      if (window.dismissPetPomodoroAlert && typeof window.dismissPetPomodoroAlert === 'function') {
        const pet = document.getElementById('btn-ai-chat-sidebar');
        const bubble = pet ? pet.querySelector('.fofo-ai-pet-bubble') : null;
        if (bubble && bubble.classList.contains('is-alert')) {
          e.preventDefault();
          e.stopPropagation();
          window.dismissPetPomodoroAlert();
          showToast('收到番茄钟提醒，继续加油！', 'info', 2000);
          return;
        }
      }
      openAiChatSidebar();
    });
    initAiPetInteraction();
    document.getElementById('btn-ai-chat-config')?.addEventListener('click', openAiConfigModal);
    document.getElementById('btn-ai-chat-close')?.addEventListener('click', () => document.getElementById('ai-chat-sidebar')?.classList.add('hidden'));
    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
    if (modeSelect) modeSelect.onchange = () => updateAiConfigUi(readAiConfigFromUi());
    if (providerSelect) providerSelect.onchange = () => {
      const modelInput = document.getElementById('ai-model-input');
      const knownDefaultModels = Object.values(AI_PROVIDERS).map(provider => provider.model);
      if (modelInput && knownDefaultModels.includes(modelInput.value.trim())) modelInput.value = getAiProviderConfig(providerSelect.value).model;
      updateAiConfigUi(readAiConfigFromUi());
    };
    if (saveConfigBtn) saveConfigBtn.onclick = () => {
      const config = readAiConfigFromUi();
      saveAiConfig(config);
      updateAiConfigUi(config);
      if (statusEl) statusEl.textContent = `AI 配置已保存：${getAiProviderConfig(config.provider).label} · ${config.mode}`;
    };
    if (clearConfigBtn) clearConfigBtn.onclick = () => {
      localStorage.removeItem(AI_CONFIG_STORAGE_KEY);
      updateAiConfigUi();
      if (statusEl) statusEl.textContent = 'AI 配置已清除，已恢复 ChatGPT 网页协同模式。';
    };
    if (testConfigBtn) testConfigBtn.onclick = async () => {
      const config = readAiConfigFromUi();
      if (config.mode === 'chatgpt-web') {
        if (statusEl) statusEl.textContent = '网页协同模式无需测试连接，请复制上下文并打开 ChatGPT。';
        return;
      }
      if (statusEl) statusEl.textContent = '正在测试 AI 连接…';
      try {
        const result = config.mode === 'direct-api' ? await callDirectAi('请只回复：FoFo AI 连接正常。', config) : await callLocalAi('请只回复：FoFo AI 连接正常。', config);
        if (statusEl) statusEl.textContent = `连接成功 · ${result.provider ? `${result.provider} · ` : ''}${result.model || config.model}`;
      } catch (e) {
        if (statusEl) statusEl.textContent = e.message || '连接测试失败';
      }
    };
    document.getElementById('ai-chat-session-select')?.addEventListener('change', (event) => {
      const chatState = getAiChatState();
      chatState.currentId = event.target.value;
      saveAiChatState(chatState);
      renderAiChatMessages();
    });
    document.getElementById('btn-ai-chat-new')?.addEventListener('click', () => {
      const chatState = getAiChatState();
      const session = newAiChatSession();
      chatState.sessions.unshift(session);
      chatState.currentId = session.id;
      saveAiChatState(chatState);
      renderAiChatSessions();
      renderAiChatMessages();
    });
    document.getElementById('btn-ai-chat-rename')?.addEventListener('click', renameCurrentAiChatSession);
    document.getElementById('btn-ai-chat-delete')?.addEventListener('click', deleteCurrentAiChatSession);
    document.getElementById('btn-ai-chat-send')?.addEventListener('click', () => sendAiChatMessage());
    document.getElementById('ai-chat-input')?.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        if (event.isComposing) return; // 避免中文输入法敲回车选词时误发送
        event.preventDefault();
        sendAiChatMessage();
      }
    });
    initAiSkinModal();
    updateAiConfigUi();
    renderAiChatSessions();
    renderAiChatMessages();
    updateAiChatPersistenceStatus();
    loadAiChatStateFromServer();
  }

  // --- Event Binding ---
  function initEvents() {
    // Prev / Next / Today
    document.getElementById('btn-prev-day').onclick = () => {
      const d = new Date(state.currentDate);
      d.setDate(d.getDate() - 1);
      switchActiveDate(formatDateStr(d));
    };

    document.getElementById('btn-next-day').onclick = () => {
      const d = new Date(state.currentDate);
      d.setDate(d.getDate() + 1);
      switchActiveDate(formatDateStr(d));
    };

    document.getElementById('btn-jump-today').onclick = () => {
      switchActiveDate(formatDateStr(new Date()));
    };

    // Water Intake
    document.getElementById('btn-water-150').onclick = () => addWater(150);
    document.getElementById('btn-water-250').onclick = () => addWater(250);
    document.getElementById('btn-water-350').onclick = () => addWater(350);
    document.getElementById('btn-water-reset').onclick = () => resetWater();

    // Goals Tab Switcher
    document.getElementById('tab-btn-weekly').onclick = () => switchGoalsTab('weekly');
    document.getElementById('tab-btn-monthly').onclick = () => switchGoalsTab('monthly');

    // Add Weekly Goal
    const addWeeklyGoal = () => {
      const input = document.getElementById('input-weekly-goal');
      const val = input.value.trim();
      if (!val) return;
      const d = new Date(state.currentDate);
      state.weeklyGoals.push({
        id: 'wg-' + Date.now(),
        week: getWeekStr(d),
        weekTitle: `第 ${getWeekNumber(d)} 周攻坚`,
        text: val,
        done: false,
        summary: ''
      });
      input.value = '';
      saveState();
      renderWeeklyGoals();
    };
    document.getElementById('btn-add-weekly-goal').onclick = addWeeklyGoal;
    document.getElementById('input-weekly-goal').onkeydown = (e) => {
      if (e.key === 'Enter') addWeeklyGoal();
    };

    // Add Monthly Goal
    const addMonthlyGoal = () => {
      const input = document.getElementById('input-monthly-goal');
      const val = input.value.trim();
      if (!val) return;
      state.monthlyGoals.push({
        id: 'mg-' + Date.now(),
        month: getMonthStr(new Date(state.currentDate)),
        text: val,
        progress: 0,
        done: false
      });
      input.value = '';
      saveState();
      renderMonthlyGoals();
    };
    document.getElementById('btn-add-monthly-goal').onclick = addMonthlyGoal;
    document.getElementById('input-monthly-goal').onkeydown = (e) => {
      if (e.key === 'Enter') addMonthlyGoal();
    };

    // Add Task
    const addTask = () => {
      const input = document.getElementById('task-input-text');
      const prio = document.getElementById('task-priority-select').value;
      const val = input.value.trim();
      if (!val) return;

      ensureCurrentDayExists();
      state.dailyData[state.currentDate].tasks.push({
        id: 't-' + Date.now(),
        text: val,
        done: false,
        priority: prio,
        pomodoros: 0
      });
      input.value = '';
      saveState();
      renderTasks();
      refreshHeatmap();
      calendar.render();
    };
    document.getElementById('btn-add-task').onclick = addTask;
    document.getElementById('task-input-text').onkeydown = (e) => {
      if (e.key === 'Enter') addTask();
    };

    // Task Filter Tabs
    const setFilter = (f) => {
      taskFilter = f;
      const allBtn = document.getElementById('task-filter-all');
      const actBtn = document.getElementById('task-filter-active');
      const donBtn = document.getElementById('task-filter-done');

      [allBtn, actBtn, donBtn].forEach(b => b.className = 'px-2 py-0.5 rounded text-slate-400 hover:text-slate-200');
      if (f === 'all') allBtn.className = 'px-2 py-0.5 rounded font-medium bg-emerald-600/30 text-emerald-400';
      if (f === 'active') actBtn.className = 'px-2 py-0.5 rounded font-medium bg-emerald-600/30 text-emerald-400';
      if (f === 'done') donBtn.className = 'px-2 py-0.5 rounded font-medium bg-emerald-600/30 text-emerald-400';
      renderTasks();
    };
    document.getElementById('task-filter-all').onclick = () => setFilter('all');
    document.getElementById('task-filter-active').onclick = () => setFilter('active');
    document.getElementById('task-filter-done').onclick = () => setFilter('done');

    // Clear completed tasks
    document.getElementById('btn-clear-completed').onclick = () => {
      ensureCurrentDayExists();
      state.dailyData[state.currentDate].tasks = state.dailyData[state.currentDate].tasks.filter(t => !t.done);
      saveState();
      renderTasks();
      refreshHeatmap();
      calendar.render();
    };

    // Defer all uncompleted tasks to next day
    const btnDeferAll = document.getElementById('btn-defer-uncompleted');
    if (btnDeferAll) {
      btnDeferAll.onclick = () => {
        ensureCurrentDayExists();
        const day = state.dailyData[state.currentDate];
        const uncompleted = (day.tasks || []).filter(t => !t.done);
        if (uncompleted.length === 0) {
          showToast('今日没有未完成的待办事项', 'info');
          return;
        }
        const nextDate = getNextDateStr(state.currentDate);
        ensureCurrentDayExists(nextDate);
        state.dailyData[nextDate].tasks.push(...uncompleted.map(t => ({ ...t, done: false })));
        day.tasks = (day.tasks || []).filter(t => t.done);
        saveState();
        renderTasks();
        refreshHeatmap();
        calendar.render();
        showToast(`已将 ${uncompleted.length} 项未完成待办一键延期至次日 (${nextDate})`, 'success');
      };
    }

    // Add Reading Modal
    const modalReading = document.getElementById('modal-add-reading');
    const btnTypeDoc = document.getElementById('btn-type-doc');
    const btnTypeUrl = document.getElementById('btn-type-url');
    const secDoc = document.getElementById('reading-doc-section');
    const secUrl = document.getElementById('reading-url-section');
    const inputDocPath = document.getElementById('input-reading-doc-path');
    const inputUrl = document.getElementById('input-reading-url');
    const inputTitle = document.getElementById('input-reading-title');
    const filePicker = document.getElementById('file-picker-reading');
    const checkSyncReadingTask = document.getElementById('check-sync-reading-task');
    const selectSyncPriority = document.getElementById('select-sync-reading-priority');
    const previewSyncTaskName = document.getElementById('preview-sync-task-name');

    const updateSyncTaskPreview = () => {
      const titleVal = inputTitle.value.trim();
      if (previewSyncTaskName) {
        previewSyncTaskName.textContent = titleVal ? `待办名：审阅${titleVal}` : '待办名：审阅...';
      }
    };

    if (inputTitle) {
      inputTitle.oninput = updateSyncTaskPreview;
    }

    document.getElementById('btn-open-add-reading').onclick = () => {
      activeReadingType = 'doc';
      btnTypeDoc.className = 'py-2 px-3 rounded-lg border border-cyan-500/60 bg-cyan-950/40 text-cyan-300 font-semibold flex items-center justify-center space-x-1.5 transition';
      btnTypeUrl.className = 'py-2 px-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold flex items-center justify-center space-x-1.5 transition';
      secDoc.classList.remove('hidden');
      secUrl.classList.add('hidden');
      inputDocPath.value = '';
      inputUrl.value = '';
      inputTitle.value = '';
      if (checkSyncReadingTask) checkSyncReadingTask.checked = true;
      if (selectSyncPriority) selectSyncPriority.value = 'P1';
      updateSyncTaskPreview();
      modalReading.classList.remove('hidden');
    };

    document.getElementById('modal-reading-close').onclick = () => modalReading.classList.add('hidden');
    document.getElementById('btn-cancel-add-reading').onclick = () => modalReading.classList.add('hidden');

    btnTypeDoc.onclick = () => {
      activeReadingType = 'doc';
      btnTypeDoc.className = 'py-2 px-3 rounded-lg border border-cyan-500/60 bg-cyan-950/40 text-cyan-300 font-semibold flex items-center justify-center space-x-1.5 transition';
      btnTypeUrl.className = 'py-2 px-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold flex items-center justify-center space-x-1.5 transition';
      secDoc.classList.remove('hidden');
      secUrl.classList.add('hidden');
    };

    btnTypeUrl.onclick = () => {
      activeReadingType = 'url';
      btnTypeUrl.className = 'py-2 px-3 rounded-lg border border-cyan-500/60 bg-cyan-950/40 text-cyan-300 font-semibold flex items-center justify-center space-x-1.5 transition';
      btnTypeDoc.className = 'py-2 px-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold flex items-center justify-center space-x-1.5 transition';
      secUrl.classList.remove('hidden');
      secDoc.classList.add('hidden');
    };

    filePicker.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!inputTitle.value) {
          inputTitle.value = file.name.replace(/\.[^/.]+$/, '');
          updateSyncTaskPreview();
        }
        if (!inputDocPath.value) {
          inputDocPath.value = file.name;
        }
      }
    };

    document.getElementById('btn-confirm-add-reading').onclick = () => {
      const title = inputTitle.value.trim();
      const path = (activeReadingType === 'doc' ? inputDocPath.value : inputUrl.value).trim();

      if (!title || !path) {
        alert('请填写待阅事项名称与路径/网址');
        return;
      }

      ensureCurrentDayExists();
      state.dailyData[state.currentDate].readingList.push({
        id: 'r-' + Date.now(),
        title: title,
        type: activeReadingType,
        path: path
      });

      let syncCreated = false;
      if (checkSyncReadingTask && checkSyncReadingTask.checked) {
        const priority = selectSyncPriority ? selectSyncPriority.value : 'P1';
        const taskText = `审阅${title}`;
        state.dailyData[state.currentDate].tasks.push({
          id: 't-' + Date.now(),
          text: taskText,
          priority: priority,
          done: false,
          pomodoros: 0,
          createdAt: new Date().toISOString()
        });
        syncCreated = true;
        renderTasks();
      }

      saveState();
      renderReadingList();
      modalReading.classList.add('hidden');
      const syncNote = syncCreated ? '，并已同步创建工作待办' : '';
      showToast(`已添加待阅事项: ${title}${syncNote}`, 'info');
    };

    // Notes Editor
    const noteEditor = document.getElementById('note-editor');
    const notePreview = document.getElementById('note-preview');
    const btnEdit = document.getElementById('btn-note-edit');
    const btnPreview = document.getElementById('btn-note-preview');

    btnEdit.onclick = () => {
      noteEditor.classList.remove('hidden');
      notePreview.classList.add('hidden');
      btnEdit.className = 'px-2 py-0.5 rounded bg-slate-700 text-white font-medium';
      btnPreview.className = 'px-2 py-0.5 rounded text-slate-400 hover:text-white';
    };

    btnPreview.onclick = () => {
      notePreview.innerHTML = renderMarkdown(noteEditor.value || '*暂无内容*');
      noteEditor.classList.add('hidden');
      notePreview.classList.remove('hidden');
      btnPreview.className = 'px-2 py-0.5 rounded bg-slate-700 text-white font-medium';
      btnEdit.className = 'px-2 py-0.5 rounded text-slate-400 hover:text-white';
    };

    noteEditor.oninput = (e) => {
      ensureCurrentDayExists();
      state.dailyData[state.currentDate].notes = e.target.value;
      saveState();
    };

    document.getElementById('btn-note-timestamp').onclick = () => {
      const now = new Date();
      const timeStr = `\n\n#### ⏱️ ${pad(now.getHours())}:${pad(now.getMinutes())}\n- `;
      noteEditor.value += timeStr;
      noteEditor.focus();
      ensureCurrentDayExists();
      state.dailyData[state.currentDate].notes = noteEditor.value;
      saveState();
    };

    // Right Panel Tabs
    const tabNotes = document.getElementById('tab-btn-notes');
    const tabScratch = document.getElementById('tab-btn-scratchpad');
    const contentNotes = document.getElementById('tab-content-notes');
    const contentScratch = document.getElementById('tab-content-scratchpad');

    tabNotes.onclick = () => {
      contentNotes.classList.remove('hidden');
      contentScratch.classList.add('hidden');
      tabNotes.className = 'flex-1 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white transition flex items-center justify-center space-x-1.5';
      tabScratch.className = 'flex-1 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition flex items-center justify-center space-x-1.5';
    };

    tabScratch.onclick = () => {
      contentNotes.classList.add('hidden');
      contentScratch.classList.remove('hidden');
      tabScratch.className = 'flex-1 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white transition flex items-center justify-center space-x-1.5';
      tabNotes.className = 'flex-1 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition flex items-center justify-center space-x-1.5';
    };

    // Add Bulletin item
    const addBulletin = () => {
      const input = document.getElementById('input-bulletin');
      const val = input.value.trim();
      if (!val) return;
      state.bulletin.unshift({
        id: 'b-' + Date.now(),
        text: val,
        createdAt: formatDateStr(new Date())
      });
      input.value = '';
      saveState();
      renderBulletin();
    };
    document.getElementById('btn-add-bulletin').onclick = addBulletin;
    document.getElementById('input-bulletin').onkeydown = (e) => {
      if (e.key === 'Enter') addBulletin();
    };

    // Add Scratchpad item
    const addScratchpad = () => {
      const input = document.getElementById('scratchpad-input');
      const val = input.value.trim();
      if (!val) return;
      state.scratchpad.unshift({
        id: 'sp-' + Date.now(),
        text: val,
        createdAt: formatDateStr(new Date())
      });
      input.value = '';
      saveState();
      renderScratchpad();
    };
    document.getElementById('btn-add-scratchpad').onclick = addScratchpad;
    document.getElementById('scratchpad-input').onkeydown = (e) => {
      if (e.key === 'Enter') addScratchpad();
    };

    // Milestones Modal
    const modalMilestone = document.getElementById('modal-milestone-prompt');
    const inputMilestone = document.getElementById('input-milestone-text');
    const modalMilestoneList = document.getElementById('modal-milestone-list');

    const refreshModalMilestones = () => {
      ensureCurrentDayExists();
      const day = state.dailyData[state.currentDate];
      const milestones = day.milestones || [];
      document.getElementById('milestone-modal-date-title').textContent = `${state.currentDate} 日程事件`;
      modalMilestoneList.innerHTML = '';

      if (milestones.length === 0) {
        modalMilestoneList.innerHTML = `<div class="text-slate-500 text-[11px]">暂无已标记事件</div>`;
        return;
      }

      milestones.forEach(m => {
        const item = document.createElement('div');
        const isVacation = m.type === 'vacation' || (m.text && (m.text.includes('休假') || m.text.includes('请假') || m.text.includes('年假')));
        const isOvertime = m.type === 'overtime' || (m.text && m.text.includes('加班'));

        let badgeHtml = '<span class="text-amber-400">🚩</span>';
        if (isVacation) {
          badgeHtml = '<span class="px-1.5 py-0.2 bg-emerald-600 text-white font-bold text-[10px] rounded">休假</span>';
        } else if (isOvertime) {
          badgeHtml = '<span class="px-1.5 py-0.2 bg-rose-600 text-white font-bold text-[10px] rounded">加班</span>';
        }

        item.className = 'flex items-center justify-between text-slate-300 bg-slate-800/80 px-2 py-1 rounded text-xs';
        item.innerHTML = `
          <div class="flex items-center space-x-1.5 truncate flex-1 mr-1">
            ${badgeHtml}
            <span class="truncate">${m.text}</span>
          </div>
          <button class="btn-del text-slate-500 hover:text-red-400 text-xs">✕</button>
        `;
        item.querySelector('.btn-del').onclick = () => {
          day.milestones = day.milestones.filter(x => x.id !== m.id);
          saveState();
          refreshModalMilestones();
          renderMilestones();
          calendar.render();
        };
        modalMilestoneList.appendChild(item);
      });
    };

    // Milestone type state
    let currentMilestoneType = 'event';
    const milestoneTypeBtns = document.querySelectorAll('.milestone-type-btn');
    milestoneTypeBtns.forEach(btn => {
      btn.onclick = () => {
        currentMilestoneType = btn.dataset.type;
        milestoneTypeBtns.forEach(b => {
          b.classList.remove('active', 'border-amber-500/60', 'bg-amber-950/40', 'text-amber-300', 'border-emerald-500/60', 'bg-emerald-950/40', 'text-emerald-300', 'border-rose-500/60', 'bg-rose-950/40', 'text-rose-300');
          b.classList.add('border-slate-700', 'bg-slate-800/80', 'text-slate-400');
        });
        btn.classList.remove('border-slate-700', 'bg-slate-800/80', 'text-slate-400');
        if (currentMilestoneType === 'vacation') {
          btn.classList.add('active', 'border-emerald-500/60', 'bg-emerald-950/40', 'text-emerald-300');
        } else if (currentMilestoneType === 'overtime') {
          btn.classList.add('active', 'border-rose-500/60', 'bg-rose-950/40', 'text-rose-300');
        } else {
          btn.classList.add('active', 'border-amber-500/60', 'bg-amber-950/40', 'text-amber-300');
        }
      };
    });

    document.getElementById('btn-set-milestone').onclick = () => {
      refreshModalMilestones();
      inputMilestone.value = '';
      currentMilestoneType = 'event';
      const eventBtn = document.getElementById('milestone-type-event');
      if (eventBtn) eventBtn.click();
      modalMilestone.classList.remove('hidden');
      inputMilestone.focus();
    };

    document.getElementById('btn-cancel-milestone').onclick = () => {
      modalMilestone.classList.add('hidden');
    };

    document.getElementById('btn-confirm-milestone').onclick = () => {
      const val = inputMilestone.value.trim();
      if (!val) return;
      ensureCurrentDayExists();
      state.dailyData[state.currentDate].milestones.push({
        id: 'm-' + Date.now(),
        text: val,
        type: currentMilestoneType
      });
      saveState();
      inputMilestone.value = '';
      refreshModalMilestones();
      renderMilestones();
      calendar.render();
      const typeLabel = currentMilestoneType === 'vacation' ? '休假' : (currentMilestoneType === 'overtime' ? '加班' : '日程');
      showToast(`已添加${typeLabel}: ${val}`, 'info');
    };

    // Consolidated header utility menu
    const headerActionsBtn = document.getElementById('btn-header-actions');
    const headerActionsMenu = document.getElementById('header-actions-menu');
    if (headerActionsBtn && headerActionsMenu) {
      const closeHeaderActions = () => {
        headerActionsMenu.classList.add('hidden');
        headerActionsBtn.setAttribute('aria-expanded', 'false');
      };
      headerActionsBtn.onclick = (event) => {
        event.stopPropagation();
        const isHidden = headerActionsMenu.classList.toggle('hidden');
        headerActionsBtn.setAttribute('aria-expanded', String(!isHidden));
      };
      headerActionsMenu.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', closeHeaderActions);
      });
      document.addEventListener('click', (event) => {
        if (!headerActionsMenu.contains(event.target) && event.target !== headerActionsBtn) {
          closeHeaderActions();
        }
      });
    }

    // Hero Banner Showcase & Mood Slogan Modal Binding
    const modalBanner = document.getElementById('modal-banner-settings');
    const heroCard = document.getElementById('hero-banner-card');
    const inputBannerSlogan = document.getElementById('input-banner-slogan');
    const bannerFileInput = document.getElementById('banner-file-input');

    if (heroCard) {
      heroCard.onclick = () => {
        if (inputBannerSlogan) {
          inputBannerSlogan.value = state.heroBannerSlogan || '保持热爱，奔赴山海！';
        }
        applyHeroBanner();
        if (modalBanner) modalBanner.classList.remove('hidden');
      };
    }

    const modalBannerClose = document.getElementById('modal-banner-close');
    if (modalBannerClose) {
      modalBannerClose.onclick = () => {
        if (modalBanner) modalBanner.classList.add('hidden');
      };
    }

    const btnUploadBannerImg = document.getElementById('btn-upload-banner-img');
    if (btnUploadBannerImg && bannerFileInput) {
      btnUploadBannerImg.onclick = () => {
        bannerFileInput.click();
      };
    }

    if (bannerFileInput) {
      bannerFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        compressImageFile(file, 1920, 1080, 0.92, (compressedDataUrl) => {
          state.heroBannerImage = compressedDataUrl;
          applyHeroBanner();
          saveState(true);
          showToast('已更新动态展板背景图！', 'theme');
        });
      };
    }

    const btnRemoveBannerImg = document.getElementById('btn-remove-banner-img');
    if (btnRemoveBannerImg) {
      btnRemoveBannerImg.onclick = () => {
        state.heroBannerImage = '';
        if (bannerFileInput) bannerFileInput.value = '';
        applyHeroBanner();
        saveState(true);
        showToast('已恢复展板默认背景', 'info');
      };
    }

    if (inputBannerSlogan) {
      inputBannerSlogan.oninput = (e) => {
        const previewText = document.getElementById('modal-banner-preview-text');
        if (previewText) previewText.textContent = e.target.value || '保持热爱，奔赴山海！';
      };
    }

    const btnSaveBanner = document.getElementById('btn-save-banner');
    if (btnSaveBanner) {
      btnSaveBanner.onclick = () => {
        if (inputBannerSlogan) {
          state.heroBannerSlogan = inputBannerSlogan.value.trim() || '保持热爱，奔赴山海！';
        }
        applyHeroBanner();
        saveState(true);
        if (modalBanner) modalBanner.classList.add('hidden');
        showToast('动态心情标语与展板已更新！', 'success');
      };
    }

    // Editable Workspace Name (Syncs with browser document title)
    const handleEditAppTitle = (e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      const current = state.appTitle || 'FoFo 工作台';
      const newTitle = prompt('请输入新的工作台名称（将同步至网页标题）：', current);
      if (newTitle !== null) {
        const trimmed = newTitle.trim();
        state.appTitle = trimmed || 'FoFo 工作台';
        applyAppTitle();
        saveState();
        showToast(`工作台名称已更新为: ${state.appTitle}`, 'success');
      }
    };

    const titleEl = document.getElementById('app-title-text');
    if (titleEl) titleEl.onclick = handleEditAppTitle;
    const btnEditTitle = document.getElementById('btn-edit-app-title');
    if (btnEditTitle) btnEditTitle.onclick = handleEditAppTitle;

    // Theme & Background Modal
    const modalTheme = document.getElementById('modal-theme-settings');
    document.getElementById('btn-theme-modal').onclick = () => {
      applyTheme();
      modalTheme.classList.remove('hidden');
    };
    document.getElementById('modal-theme-close').onclick = () => {
      modalTheme.classList.add('hidden');
    };

    // Theme preset buttons
    document.querySelectorAll('.theme-preset-btn').forEach(btn => {
      btn.onclick = () => {
        state.theme = btn.dataset.theme;
        state.customBgImage = ''; // Clear custom wallpaper so preset theme takes immediate effect!
        const bgInput = document.getElementById('bg-file-input');
        if (bgInput) bgInput.value = '';
        applyTheme();
        saveState();
        const themeName = btn.querySelector('span') ? btn.querySelector('span').textContent.trim() : btn.dataset.theme;
        showToast(`已切换配色方案: ${themeName}`, 'theme', 1800);
      };
    });

    // System wallpaper preset buttons
    document.querySelectorAll('.system-wallpaper-btn').forEach(btn => {
      btn.onclick = () => {
        const wp = btn.dataset.wallpaper;
        state.customBgImage = wp;
        const bgInput = document.getElementById('bg-file-input');
        if (bgInput) bgInput.value = '';
        applyTheme();
        saveState(true);
        const wpName = btn.querySelector('span') ? btn.querySelector('span').textContent.trim() : '系统壁纸';
        showToast(`已应用系统壁纸: ${wpName}`, 'theme', 2000);
      };
    });

    // Custom Background Upload
    const bgFileInput = document.getElementById('bg-file-input');
    document.getElementById('btn-choose-bg-image').onclick = () => {
      bgFileInput.click();
    };

    bgFileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      compressImageFile(file, 1920, 1080, 0.82, (compressedDataUrl) => {
        state.customBgImage = compressedDataUrl;
        applyTheme();
        saveState(true);
        showToast('自定义背景壁纸已应用！', 'theme');
      });
    };

    document.getElementById('btn-remove-bg-image').onclick = () => {
      state.customBgImage = '';
      const bgInput = document.getElementById('bg-file-input');
      if (bgInput) bgInput.value = '';
      applyTheme();
      saveState(true);
      showToast('已清除背景壁纸，恢复纯色配色', 'info');
    };

    // Background Opacity & Blur Sliders
    const opacitySlider = document.getElementById('bg-opacity-slider');
    opacitySlider.oninput = (e) => {
      state.bgOpacity = parseInt(e.target.value);
      document.getElementById('bg-opacity-val').textContent = `${state.bgOpacity}%`;
      applyTheme();
    };
    opacitySlider.onchange = () => saveState();

    const blurSlider = document.getElementById('bg-blur-slider');
    blurSlider.oninput = (e) => {
      state.bgBlur = parseInt(e.target.value);
      document.getElementById('bg-blur-val').textContent = `${state.bgBlur}px`;
      applyTheme();
    };
    blurSlider.onchange = () => saveState();

    // Avatar Upload
    const avatarFileInput = document.getElementById('avatar-file-input');
    document.getElementById('btn-trigger-avatar').onclick = (e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      avatarFileInput.click();
    };
    document.getElementById('btn-upload-avatar-modal').onclick = () => {
      avatarFileInput.click();
    };

    avatarFileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      compressImageFile(file, 256, 256, 0.88, (compressedDataUrl) => {
        state.userAvatar = compressedDataUrl;
        applyAvatar();
        saveState(true);
        showToast('个人头像更新成功！', 'info');
      });
    };

    document.getElementById('btn-remove-avatar').onclick = () => {
      state.userAvatar = '';
      avatarFileInput.value = '';
      applyAvatar();
      saveState(true);
      showToast('已恢复默认头像', 'info');
    };

    // Markdown Export Modal
    const exportModal = document.getElementById('modal-export');
    document.getElementById('btn-export-markdown').onclick = () => {
      const monthInput = document.getElementById('export-month-select');
      const curMonth = getMonthStr(new Date(state.currentDate));
      monthInput.value = curMonth;

      const refreshExportPreview = () => {
        const targetMonth = monthInput.value || curMonth;
        const md = MarkdownExporter.generateMonthlyMarkdown(state, targetMonth);
        document.getElementById('export-preview-textarea').value = md;
      };

      monthInput.onchange = refreshExportPreview;
      refreshExportPreview();
      exportModal.classList.remove('hidden');
    };

    document.getElementById('modal-export-close').onclick = () => {
      exportModal.classList.add('hidden');
    };

    document.getElementById('btn-copy-export-md').onclick = () => {
      const text = document.getElementById('export-preview-textarea').value;
      navigator.clipboard.writeText(text);
      const btn = document.getElementById('btn-copy-export-md');
      btn.textContent = '已复制！';
      setTimeout(() => btn.textContent = '复制文本', 2000);
    };

    document.getElementById('btn-save-export-file').onclick = async () => {
      const targetMonth = document.getElementById('export-month-select').value || getMonthStr(new Date(state.currentDate));
      const content = document.getElementById('export-preview-textarea').value;
      const filename = `FoFo_Work_Report_${targetMonth}.md`;

      const res = await MarkdownExporter.saveToDiskViaServer(filename, content);
      const statusEl = document.getElementById('export-disk-status');
      statusEl.classList.remove('hidden');
      if (res && res.success) {
        statusEl.textContent = `✓ 已直接导出保存至本地磁盘: ${res.filepath}`;
      } else {
        MarkdownExporter.downloadMarkdownFile(filename, content);
        statusEl.textContent = `✓ 已通过浏览器下载保存为: ${filename}`;
      }
    };

    // Weekly Review Modal
    const weeklyModal = document.getElementById('modal-weekly-review');
    document.getElementById('btn-weekly-review').onclick = () => {
      const curWeek = getWeekStr(new Date(state.currentDate));
      let doneTasks = 0;
      let totalPomos = 0;

      Object.keys(state.dailyData || {}).forEach(dStr => {
        const d = new Date(dStr);
        if (getWeekStr(d) === curWeek) {
          const day = state.dailyData[dStr];
          if (day.tasks) {
            day.tasks.forEach(t => {
              if (t.done) doneTasks++;
              totalPomos += (t.pomodoros || 0);
            });
          }
        }
      });

      document.getElementById('weekly-stat-done-tasks').textContent = doneTasks;
      document.getElementById('weekly-stat-pomos').textContent = totalPomos;
      document.getElementById('weekly-stat-focus-time').textContent = `${(totalPomos * 25 / 60).toFixed(1)}h`;

      const existing = (state.weeklyGoals || []).find(w => w.week === curWeek);
      document.getElementById('weekly-summary-input').value = existing ? existing.summary || '' : '';

      weeklyModal.classList.remove('hidden');
    };

    document.getElementById('modal-weekly-close').onclick = () => {
      weeklyModal.classList.add('hidden');
    };

    document.getElementById('btn-save-weekly-summary').onclick = () => {
      const curWeek = getWeekStr(new Date(state.currentDate));
      const text = document.getElementById('weekly-summary-input').value;
      let existing = (state.weeklyGoals || []).find(w => w.week === curWeek);
      if (existing) {
        existing.summary = text;
      } else {
        const d = new Date(state.currentDate);
        state.weeklyGoals.push({
          id: 'wg-' + Date.now(),
          week: curWeek,
          weekTitle: `第 ${getWeekNumber(d)} 周攻坚`,
          text: '本周工作复盘',
          done: true,
          summary: text
        });
      }
      saveState();
      weeklyModal.classList.add('hidden');
      confetti.fire();
      showToast('本周复盘已成功归档！', 'info');
    };

    // Data Backup / Restore Modal
    const dataModal = document.getElementById('modal-data-settings');
    document.getElementById('btn-data-modal').onclick = () => {
      dataModal.classList.remove('hidden');
      updateBackendStatus();
    };
    document.getElementById('modal-data-close').onclick = () => {
      dataModal.classList.add('hidden');
    };

    document.getElementById('btn-backup-json').onclick = () => {
      const json = JSON.stringify(state, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fofo_backup_${formatDateStr(new Date())}.json`;
      a.click();
      URL.revokeObjectURL(a);
    };

    document.getElementById('input-restore-json').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const loaded = JSON.parse(ev.target.result);
          if (loaded && loaded.dailyData) {
            state = loaded;
            saveState(true);
            applyTheme();
            applyAvatar();
            switchActiveDate(state.currentDate || formatDateStr(new Date()));
            dataModal.classList.add('hidden');
            showToast('数据备份恢复成功！', 'info');
          } else {
            alert('无效的数据备份文件格式');
          }
        } catch (err) {
          alert('解析备份文件失败');
        }
      };
      reader.readAsText(file);
    };

    // Keyboard shortcut: Alt + Space for Pomodoro
    window.addEventListener('keydown', (e) => {
      if (e.altKey && e.code === 'Space') {
        e.preventDefault();
        pomodoro.toggle();
      }
    });
  }

  // --- Pomodoro Initialization ---
  function initPomodoro() {
    const display = document.getElementById('pomo-display');
    const toggleBtn = document.getElementById('pomo-btn-toggle');
    const resetBtn = document.getElementById('pomo-btn-reset');
    const taskTag = document.getElementById('pomo-task-tag');
    const todayCountBadge = document.getElementById('pomo-today-count');

    const getTodayPomodoroCount = () => {
      const cur = state.dailyData[state.currentDate];
      if (!cur || !cur.tasks) return 0;
      return cur.tasks.reduce((sum, t) => sum + (t.pomodoros || 0), 0);
    };

    pomodoro = new PomodoroTimer({
      onTick: (s) => {
        display.textContent = s.formattedTime;
        toggleBtn.textContent = s.isRunning ? '暂停' : '开始';
        toggleBtn.className = s.isRunning
          ? 'px-2.5 py-0.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded shadow transition active:scale-95'
          : 'px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow transition active:scale-95';
        
        if (s.linkedTask) {
          taskTag.textContent = `🎯 ${s.linkedTask.text}`;
          taskTag.className = 'max-w-[130px] truncate text-[11px] text-emerald-400 font-semibold';
        } else {
          taskTag.textContent = '未绑定任务';
          taskTag.className = 'max-w-[130px] truncate text-[11px] text-slate-400';
        }
      },
      onComplete: (s) => {
        confetti.fire();
        if (s.mode === 'focus') {
          showToast(`🍅 专注周期结束！已完成一次专注，稍作休息吧～`, 'success', 6000);
          if (s.linkedTask) {
            ensureCurrentDayExists();
            const task = state.dailyData[state.currentDate].tasks.find(t => t.id === s.linkedTask.id);
            if (task) {
              task.pomodoros = (task.pomodoros || 0) + 1;
            }
          }
          saveState();
          renderTasks();
          refreshHeatmap();
          todayCountBadge.textContent = getTodayPomodoroCount();
        } else {
          showToast(`☕ 休息结束！开始新一轮专注吧～`, 'info', 6000);
        }

        // Trigger LinaBell Desk Pet Alert (works until user clicks bubble)
        if (window.triggerPetPomodoroAlert && typeof window.triggerPetPomodoroAlert === 'function') {
          window.triggerPetPomodoroAlert(s.mode);
        }
      },
      onModeChange: (s) => {
        const fBtn = document.getElementById('pomo-mode-focus');
        const sBtn = document.getElementById('pomo-mode-short');
        const lBtn = document.getElementById('pomo-mode-long');
        [fBtn, sBtn, lBtn].forEach(b => b.className = 'px-2 py-0.5 rounded text-slate-400 hover:text-white transition');

        if (s.mode === 'focus') fBtn.className = 'px-2 py-0.5 rounded font-medium bg-emerald-600 text-white transition';
        if (s.mode === 'shortBreak') sBtn.className = 'px-2 py-0.5 rounded font-medium bg-cyan-600 text-white transition';
        if (s.mode === 'longBreak') lBtn.className = 'px-2 py-0.5 rounded font-medium bg-indigo-600 text-white transition';
      }
    });

    toggleBtn.onclick = () => pomodoro.toggle();
    resetBtn.onclick = () => pomodoro.reset();

    document.getElementById('pomo-mode-focus').onclick = () => pomodoro.setMode('focus');
    document.getElementById('pomo-mode-short').onclick = () => pomodoro.setMode('shortBreak');
    document.getElementById('pomo-mode-long').onclick = () => pomodoro.setMode('longBreak');

    todayCountBadge.textContent = getTodayPomodoroCount();
  }

  // --- Heatmap Initialization ---
  function initHeatmap() {
    heatmap = new ActivityHeatmap('heatmap-container', {
      weeks: 18,
      getDataForDate: (dateStr) => {
        const day = state.dailyData ? state.dailyData[dateStr] : null;
        if (!day) return { tasks: 0, pomodoros: 0 };
        const doneTasks = (day.tasks || []).filter(t => t.done).length;
        const pomos = (day.tasks || []).reduce((acc, t) => acc + (t.pomodoros || 0), 0);
        return { tasks: doneTasks, pomodoros: pomos };
      },
      onSelectDate: (dateStr) => {
        switchActiveDate(dateStr);
      }
    });
    heatmap.render(state.currentDate);
  }

  // --- Calendar Initialization ---
  function initCalendar() {
    calendar = new CalendarWidget('calendar-widget-container', {
      onSelectDate: (dateStr) => {
        switchActiveDate(dateStr);
      },
      hasDataForDate: (dateStr) => {
        const day = state.dailyData ? state.dailyData[dateStr] : null;
        if (!day) return { hasTasks: false, milestones: [] };
        return {
          hasTasks: (day.tasks && day.tasks.length > 0),
          milestones: day.milestones || []
        };
      }
    });
    calendar.render();
  }

  // --- App Bootstrap ---
  async function startApp() {
    try {
      confetti = new ConfettiCelebration('confetti-canvas');
    } catch (e) {
      console.warn('[FoFo] Confetti init skipped:', e);
    }
    try {
      await initData();
    } catch (e) {
      console.error('[FoFo] initData failure:', e);
    }
    try {
      initPomodoro();
      initHeatmap();
      initCalendar();
      initEvents();
      initAiSecretary();

      switchGoalsTab('weekly');
      switchActiveDate(state ? state.currentDate : formatDateStr(new Date()));
      console.log('[FoFo WorkStation] Initialized with UI aesthetic optimizations.');
    } catch (e) {
      console.error('[FoFo] UI sub-component init error:', e);
    }
  }

  window.addEventListener('DOMContentLoaded', startApp);
})();
