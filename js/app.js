// FoFo Personal WorkStation - Main Application Controller
(function () {
  'use strict';

  // --- Utility Functions ---
  const pad = (n) => String(n).padStart(2, '0');
  const formatDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

  // --- Seed Demo Data ---
  function getSeedData() {
    const today = new Date();
    const todayStr = formatDateStr(today);
    const monthStr = getMonthStr(today);
    const weekStr = getWeekStr(today);

    return {
      currentDate: todayStr,
      theme: 'midnight',
      bgOpacity: 82,
      bgBlur: 6,
      userAvatar: '',
      customBgImage: '',
      monthlyGoals: [
        { id: 'mg-1', month: monthStr, text: '完成 FoFo 工作台优化与升级', progress: 100, done: true },
        { id: 'mg-2', month: monthStr, text: '建立每日待阅与健康饮水习惯 (≥1.5L)', progress: 60, done: false },
        { id: 'mg-3', month: monthStr, text: '推进重点项目核心主线交付', progress: 30, done: false }
      ],
      weeklyGoals: [
        { id: 'wg-1', week: weekStr, weekTitle: `第 ${getWeekNumber(today)} 周攻坚`, text: '熟练使用番茄钟与今日待阅联动', done: true, summary: '' },
        { id: 'wg-2', week: weekStr, weekTitle: `第 ${getWeekNumber(today)} 周攻坚`, text: '整理当月工作纪要并导出 Markdown', done: false, summary: '' }
      ],
      bulletin: [
        { id: 'b-1', text: '每日饮水目标：保持在 1500ml 以上，专注之余记得起身活动！', createdAt: todayStr },
        { id: 'b-2', text: '要事第一：优先处理 P0 待办与今日待阅核心文档。', createdAt: todayStr }
      ],
      dailyData: {
        [todayStr]: {
          waterIntake: 600,
          readingList: [
            { id: 'r-1', title: 'FoFo 实施指南 README.md', type: 'doc', path: 'F:\\FoFo\\README.md' },
            { id: 'r-2', title: '用户建议清单 commentV1.md', type: 'doc', path: 'F:\\FoFo\\user_comment\\commentV1.md' }
          ],
          tasks: [
            { id: 't-1', text: '处理紧急核心交付任务', done: false, priority: 'P0', pomodoros: 1 },
            { id: 't-2', text: '审阅今日待阅文档', done: false, priority: 'P1', pomodoros: 0 },
            { id: 't-3', text: '日常事务性跟进', done: false, priority: 'P2', pomodoros: 0 }
          ],
          notes: '### 💡 FoFo 体验记录\n\n- 左上角标题更清晰，支持自定义圆形头像。\n- 全局支持 iOS 5 款经典配色与自定义背景壁纸（带防干扰毛玻璃遮罩）。\n- 待阅与待办均已按优先级和分类规整，专注工作更加舒适！',
          milestones: [
            { id: 'm-1', text: 'FoFo 体验版测试' },
            { id: 'm-2', text: '下午 16:00 项目同步会' }
          ]
        }
      },
      scratchpad: [
        { id: 'sp-1', text: '备忘：周五下午通过顶部【周复盘】回顾本周产出与反思', createdAt: todayStr }
      ]
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
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
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

  // --- Data Persistence Layer ---
  async function initData() {
    try {
      const resp = await fetch('/api/data');
      if (resp.ok) {
        const remoteData = await resp.json();
        if (remoteData && Object.keys(remoteData).length > 0) {
          state = remoteData;
          hasBackend = true;
        }
      }
    } catch (e) {
      hasBackend = false;
    }

    if (!state) {
      const local = localStorage.getItem('fofo_workspace_v1');
      if (local) {
        try {
          state = JSON.parse(local);
        } catch (e) {
          state = null;
        }
      }
    }

    if (!state) {
      state = getSeedData();
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
      item.className = 'p-2 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition';
      
      item.innerHTML = `
        <label class="flex items-center space-x-2 flex-1 cursor-pointer min-w-0 mr-1.5">
          <input type="checkbox" class="task-checkbox" ${goal.done ? 'checked' : ''} />
          <span class="text-xs truncate ${goal.done ? 'task-completed' : 'text-slate-200'}">${goal.text}</span>
        </label>
        
        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
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
      
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <label class="flex items-center space-x-2 flex-1 cursor-pointer min-w-0 mr-1.5">
            <input type="checkbox" class="task-checkbox" ${goal.done ? 'checked' : ''} />
            <span class="text-xs truncate ${goal.done ? 'task-completed' : 'text-slate-200'}">${goal.text}</span>
          </label>
          <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
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
          <button class="btn-del text-slate-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition p-1">✕</button>
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
        hCard.className = 'mb-1.5 px-2.5 py-1.5 bg-rose-950/60 border border-rose-800/60 rounded flex items-center justify-between text-xs text-rose-300';
        hCard.innerHTML = `
          <div class="flex items-center space-x-1.5 font-medium truncate">
            <span>🇨🇳</span>
            <span>法定节假日 · <strong>${holiday.name}</strong></span>
            ${holiday.lunarStr ? `<span class="text-[10px] text-rose-400/80 font-normal">(${holiday.lunarStr})</span>` : ''}
          </div>
          <span class="px-1.5 py-0.2 bg-rose-600 text-white font-bold text-[10px] rounded flex-shrink-0 shadow-xs">休假</span>
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
      item.className = 'flex items-center justify-between text-slate-300 bg-slate-800/80 px-2 py-1 rounded text-[11px] mb-1';
      item.innerHTML = `
        <span class="truncate flex-1 mr-1">🚩 ${m.text}</span>
        <button class="btn-del text-slate-500 hover:text-red-400">✕</button>
      `;
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

    document.getElementById('btn-open-add-reading').onclick = () => {
      activeReadingType = 'doc';
      btnTypeDoc.className = 'py-2 px-3 rounded-lg border border-cyan-500/60 bg-cyan-950/40 text-cyan-300 font-semibold flex items-center justify-center space-x-1.5 transition';
      btnTypeUrl.className = 'py-2 px-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold flex items-center justify-center space-x-1.5 transition';
      secDoc.classList.remove('hidden');
      secUrl.classList.add('hidden');
      inputDocPath.value = '';
      inputUrl.value = '';
      inputTitle.value = '';
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

      saveState();
      renderReadingList();
      modalReading.classList.add('hidden');
      showToast(`已添加待阅事项: ${title}`, 'info');
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
        item.className = 'flex items-center justify-between text-slate-300 bg-slate-800/80 px-2 py-1 rounded text-xs';
        item.innerHTML = `
          <span class="truncate flex-1 mr-1">🚩 ${m.text}</span>
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

    document.getElementById('btn-set-milestone').onclick = () => {
      refreshModalMilestones();
      inputMilestone.value = '';
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
        text: val
      });
      saveState();
      inputMilestone.value = '';
      refreshModalMilestones();
      renderMilestones();
      calendar.render();
      showToast(`已标记新日程: ${val}`, 'info');
    };

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
        saveState();
        showToast('自定义背景壁纸已应用！', 'theme');
      });
    };

    document.getElementById('btn-remove-bg-image').onclick = () => {
      state.customBgImage = '';
      bgFileInput.value = '';
      applyTheme();
      saveState();
      showToast('已清除自定义壁纸，恢复经典配色', 'info');
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
    document.getElementById('btn-trigger-avatar').onclick = () => {
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
        saveState();
        showToast('个人头像更新成功！', 'info');
      });
    };

    document.getElementById('btn-remove-avatar').onclick = () => {
      state.userAvatar = '';
      avatarFileInput.value = '';
      applyAvatar();
      saveState();
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
        showToast(`🍅 专注周期结束！已完成一次专注，稍作休息吧～`, 'success', 6000);

        if (s.mode === 'focus') {
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
    confetti = new ConfettiCelebration('confetti-canvas');
    await initData();
    initPomodoro();
    initHeatmap();
    initCalendar();
    initEvents();

    switchGoalsTab('weekly');
    switchActiveDate(state.currentDate);
    console.log('[FoFo WorkStation] Initialized with UI aesthetic optimizations.');
  }

  window.addEventListener('DOMContentLoaded', startApp);
})();
