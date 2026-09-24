// Interactive Calendar Component with Chinese Mainland Statutory Holidays & Lunar Calendar
(function() {
  'use strict';

  // --- 1. Chinese Mainland Statutory Holiday Schedule (国务院法定节假日及调休安排 2024-2027) ---
  const CN_HOLIDAY_SCHEDULE = {
    // 2024
    '2024-01-01': { name: '元旦', type: 'holiday' },
    '2024-02-04': { name: '春节调休', type: 'workday' },
    '2024-02-10': { name: '初一', type: 'holiday' },
    '2024-02-11': { name: '初二', type: 'holiday' },
    '2024-02-12': { name: '初三', type: 'holiday' },
    '2024-02-13': { name: '初四', type: 'holiday' },
    '2024-02-14': { name: '初五', type: 'holiday' },
    '2024-02-15': { name: '初六', type: 'holiday' },
    '2024-02-16': { name: '初七', type: 'holiday' },
    '2024-02-17': { name: '初八', type: 'holiday' },
    '2024-02-18': { name: '春节调休', type: 'workday' },
    '2024-04-04': { name: '清明节', type: 'holiday' },
    '2024-04-05': { name: '清明节', type: 'holiday' },
    '2024-04-06': { name: '清明节', type: 'holiday' },
    '2024-04-07': { name: '清明调休', type: 'workday' },
    '2024-04-28': { name: '劳动节调休', type: 'workday' },
    '2024-05-01': { name: '劳动节', type: 'holiday' },
    '2024-05-02': { name: '劳动节', type: 'holiday' },
    '2024-05-03': { name: '劳动节', type: 'holiday' },
    '2024-05-04': { name: '劳动节', type: 'holiday' },
    '2024-05-05': { name: '劳动节', type: 'holiday' },
    '2024-05-11': { name: '劳动节调休', type: 'workday' },
    '2024-06-10': { name: '端午节', type: 'holiday' },
    '2024-09-14': { name: '中秋节调休', type: 'workday' },
    '2024-09-15': { name: '中秋节', type: 'holiday' },
    '2024-09-16': { name: '中秋节', type: 'holiday' },
    '2024-09-17': { name: '中秋节', type: 'holiday' },
    '2024-09-29': { name: '国庆节调休', type: 'workday' },
    '2024-10-01': { name: '国庆节', type: 'holiday' },
    '2024-10-02': { name: '国庆节', type: 'holiday' },
    '2024-10-03': { name: '国庆节', type: 'holiday' },
    '2024-10-04': { name: '国庆节', type: 'holiday' },
    '2024-10-05': { name: '国庆节', type: 'holiday' },
    '2024-10-06': { name: '国庆节', type: 'holiday' },
    '2024-10-07': { name: '国庆节', type: 'holiday' },
    '2024-10-12': { name: '国庆节调休', type: 'workday' },

    // 2025 (国务院最新修订版：除夕放假、五一增假1天)
    '2025-01-01': { name: '元旦', type: 'holiday' },
    '2025-01-26': { name: '春节调休', type: 'workday' },
    '2025-01-28': { name: '除夕', type: 'holiday' },
    '2025-01-29': { name: '春节', type: 'holiday' },
    '2025-01-30': { name: '初二', type: 'holiday' },
    '2025-01-31': { name: '初三', type: 'holiday' },
    '2025-02-01': { name: '初四', type: 'holiday' },
    '2025-02-02': { name: '初五', type: 'holiday' },
    '2025-02-03': { name: '初六', type: 'holiday' },
    '2025-02-04': { name: '初七', type: 'holiday' },
    '2025-02-08': { name: '春节调休', type: 'workday' },
    '2025-04-04': { name: '清明节', type: 'holiday' },
    '2025-04-05': { name: '清明节', type: 'holiday' },
    '2025-04-06': { name: '清明节', type: 'holiday' },
    '2025-04-27': { name: '劳动节调休', type: 'workday' },
    '2025-05-01': { name: '劳动节', type: 'holiday' },
    '2025-05-02': { name: '劳动节', type: 'holiday' },
    '2025-05-03': { name: '劳动节', type: 'holiday' },
    '2025-05-04': { name: '劳动节', type: 'holiday' },
    '2025-05-05': { name: '劳动节', type: 'holiday' },
    '2025-05-31': { name: '端午节', type: 'holiday' },
    '2025-06-01': { name: '端午节', type: 'holiday' },
    '2025-06-02': { name: '端午节', type: 'holiday' },
    '2025-09-28': { name: '国庆节调休', type: 'workday' },
    '2025-10-01': { name: '国庆节', type: 'holiday' },
    '2025-10-02': { name: '国庆节', type: 'holiday' },
    '2025-10-03': { name: '国庆节', type: 'holiday' },
    '2025-10-04': { name: '国庆节', type: 'holiday' },
    '2025-10-05': { name: '国庆节', type: 'holiday' },
    '2025-10-06': { name: '中秋节', type: 'holiday' },
    '2025-10-07': { name: '国庆节', type: 'holiday' },
    '2025-10-08': { name: '国庆节', type: 'holiday' },
    '2025-10-11': { name: '国庆节调休', type: 'workday' },

    // 2026 (当前年份)
    '2026-01-01': { name: '元旦', type: 'holiday' },
    '2026-01-02': { name: '元旦', type: 'holiday' },
    '2026-01-03': { name: '元旦', type: 'holiday' },
    '2026-01-04': { name: '元旦调休', type: 'workday' },
    '2026-02-15': { name: '春节调休', type: 'workday' },
    '2026-02-16': { name: '除夕', type: 'holiday' },
    '2026-02-17': { name: '春节', type: 'holiday' },
    '2026-02-18': { name: '初二', type: 'holiday' },
    '2026-02-19': { name: '初三', type: 'holiday' },
    '2026-02-20': { name: '初四', type: 'holiday' },
    '2026-02-21': { name: '初五', type: 'holiday' },
    '2026-02-22': { name: '初六', type: 'holiday' },
    '2026-02-23': { name: '初七', type: 'holiday' },
    '2026-02-28': { name: '春节调休', type: 'workday' },
    '2026-04-04': { name: '清明节', type: 'holiday' },
    '2026-04-05': { name: '清明节', type: 'holiday' },
    '2026-04-06': { name: '清明节', type: 'holiday' },
    '2026-04-26': { name: '劳动节调休', type: 'workday' },
    '2026-05-01': { name: '劳动节', type: 'holiday' },
    '2026-05-02': { name: '劳动节', type: 'holiday' },
    '2026-05-03': { name: '劳动节', type: 'holiday' },
    '2026-05-04': { name: '劳动节', type: 'holiday' },
    '2026-05-05': { name: '劳动节', type: 'holiday' },
    '2026-05-09': { name: '劳动节调休', type: 'workday' },
    '2026-06-19': { name: '端午节', type: 'holiday' },
    '2026-06-20': { name: '端午节', type: 'holiday' },
    '2026-06-21': { name: '端午节', type: 'holiday' },
    '2026-09-20': { name: '国庆节调休', type: 'workday' },
    '2026-09-25': { name: '中秋节', type: 'holiday' },
    '2026-09-26': { name: '中秋节', type: 'holiday' },
    '2026-09-27': { name: '中秋节', type: 'holiday' },
    '2026-10-01': { name: '国庆节', type: 'holiday' },
    '2026-10-02': { name: '国庆节', type: 'holiday' },
    '2026-10-03': { name: '国庆节', type: 'holiday' },
    '2026-10-04': { name: '国庆节', type: 'holiday' },
    '2026-10-05': { name: '国庆节', type: 'holiday' },
    '2026-10-06': { name: '国庆节', type: 'holiday' },
    '2026-10-07': { name: '国庆节', type: 'holiday' },
    '2026-10-10': { name: '国庆节调休', type: 'workday' },

    // 2027
    '2027-01-01': { name: '元旦', type: 'holiday' },
    '2027-01-02': { name: '元旦', type: 'holiday' },
    '2027-01-03': { name: '元旦', type: 'holiday' },
    '2027-02-06': { name: '除夕', type: 'holiday' },
    '2027-02-07': { name: '春节', type: 'holiday' },
    '2027-02-08': { name: '初二', type: 'holiday' },
    '2027-02-09': { name: '初三', type: 'holiday' },
    '2027-02-10': { name: '初四', type: 'holiday' },
    '2027-02-11': { name: '初五', type: 'holiday' },
    '2027-02-12': { name: '初六', type: 'holiday' },
    '2027-02-13': { name: '初七', type: 'holiday' },
    '2027-04-04': { name: '清明节', type: 'holiday' },
    '2027-04-05': { name: '清明节', type: 'holiday' },
    '2027-04-06': { name: '清明节', type: 'holiday' },
    '2027-05-01': { name: '劳动节', type: 'holiday' },
    '2027-05-02': { name: '劳动节', type: 'holiday' },
    '2027-05-03': { name: '劳动节', type: 'holiday' },
    '2027-05-04': { name: '劳动节', type: 'holiday' },
    '2027-05-05': { name: '劳动节', type: 'holiday' },
    '2027-06-09': { name: '端午节', type: 'holiday' },
    '2027-09-15': { name: '中秋节', type: 'holiday' },
    '2027-10-01': { name: '国庆节', type: 'holiday' },
    '2027-10-02': { name: '国庆节', type: 'holiday' },
    '2027-10-03': { name: '国庆节', type: 'holiday' },
    '2027-10-04': { name: '国庆节', type: 'holiday' },
    '2027-10-05': { name: '国庆节', type: 'holiday' },
    '2027-10-06': { name: '国庆节', type: 'holiday' },
    '2027-10-07': { name: '国庆节', type: 'holiday' }
  };

  // --- 2. Solar & Lunar Festivals Dictionary ---
  const SOLAR_FESTIVALS = {
    '01-01': '元旦',
    '02-14': '情人节',
    '03-08': '妇女节',
    '03-12': '植树节',
    '04-01': '愚人节',
    '04-04': '清明节',
    '04-05': '清明节',
    '05-01': '劳动节',
    '05-04': '青年节',
    '06-01': '儿童节',
    '07-01': '建党节',
    '08-01': '建军节',
    '09-10': '教师节',
    '10-01': '国庆节',
    '10-24': '程序员节',
    '12-25': '圣诞节'
  };

  const LUNAR_FESTIVALS = {
    '1-1': '春节',
    '1-15': '元宵节',
    '2-2': '龙抬头',
    '5-5': '端午节',
    '7-7': '七夕节',
    '7-15': '中元节',
    '8-15': '中秋节',
    '9-9': '重阳节',
    '12-8': '腊八节',
    '12-23': '小年'
  };

  const LUNAR_INFO = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45
  ];

  const LUNAR_MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  const LUNAR_DAY_NAMES = [
    '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
    '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
  ];

  function getLunarDate(y, m, d) {
    let offset = (Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 31)) / 86400000;
    let i, temp = 0;
    for (i = 1900; i < 2040 && offset > 0; i++) {
      temp = lYearDays(i);
      offset -= temp;
    }
    if (offset < 0) {
      offset += temp;
      i--;
    }
    const year = i;
    const leap = leapMonth(i);
    let isLeap = false;
    for (i = 1; i < 13 && offset > 0; i++) {
      if (leap > 0 && i === (leap + 1) && !isLeap) {
        --i;
        isLeap = true;
        temp = leapDays(year);
      } else {
        temp = monthDays(year, i);
      }
      if (isLeap && i === (leap + 1)) isLeap = false;
      offset -= temp;
    }
    if (offset === 0 && leap > 0 && i === leap + 1) {
      if (isLeap) isLeap = false;
      else { isLeap = true; --i; }
    }
    if (offset < 0) {
      offset += temp;
      --i;
    }
    const month = i;
    const day = Math.floor(offset + 1);
    return { year, month, day, isLeap };
  }

  function lYearDays(y) {
    let sum = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
    return sum + leapDays(y);
  }
  function leapMonth(y) { return LUNAR_INFO[y - 1900] & 0xf; }
  function leapDays(y) {
    if (leapMonth(y)) return (LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29;
    return 0;
  }
  function monthDays(y, m) {
    return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29;
  }

  // --- Interactive Calendar Component ---
  class CalendarWidget {
    constructor(containerId, options = {}) {
      this.container = document.getElementById(containerId);
      this.options = Object.assign({
        onSelectDate: () => {},
        onAddMilestone: () => {},
        hasDataForDate: () => ({ hasTasks: false, milestones: [] })
      }, options);

      this.currentViewDate = new Date();
      this.selectedDateStr = this.formatDate(new Date());
    }

    formatDate(d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    static getHolidayInfo(dateStr) {
      if (!dateStr) return null;
      const parts = dateStr.split('-');
      if (parts.length !== 3) return null;
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]);
      const d = parseInt(parts[2]);
      const mmdd = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // 1. Official statutory holiday schedule (休 / 班)
      const official = CN_HOLIDAY_SCHEDULE[dateStr];

      // 2. Lunar calculation
      let lunarStr = '';
      let lunarFestival = '';
      let isEve = false;
      try {
        const lunar = getLunarDate(y, m, d);
        const mName = LUNAR_MONTH_NAMES[lunar.month - 1] || `${lunar.month}`;
        const dName = LUNAR_DAY_NAMES[lunar.day - 1] || `${lunar.day}`;
        lunarStr = `${lunar.isLeap ? '闰' : ''}${mName}月${dName}`;
        lunarFestival = LUNAR_FESTIVALS[`${lunar.month}-${lunar.day}`] || '';
        
        // Special: 除夕 (腊月最后一天)
        if (lunar.month === 12 && (lunar.day === 29 || lunar.day === 30)) {
          const nextDayLunar = getLunarDate(y, m, d + 1);
          if (nextDayLunar.month === 1 && nextDayLunar.day === 1) {
            isEve = true;
            lunarFestival = '除夕';
          }
        }
      } catch (e) {
        // ignore out-of-range years
      }

      // 3. Solar festival
      const solarFestival = SOLAR_FESTIVALS[mmdd] || '';

      const holidayName = official ? official.name : (lunarFestival || solarFestival || '');
      const type = official ? official.type : (holidayName && (mmdd === '01-01' || mmdd === '05-01' || mmdd === '10-01' || lunarFestival === '春节' || lunarFestival === '端午节' || lunarFestival === '中秋节' || lunarFestival === '清明节') ? 'holiday' : 'none');

      return {
        name: holidayName,
        type: type, // 'holiday' | 'workday' | 'none'
        isOfficial: !!official,
        isHoliday: type === 'holiday',
        isWorkday: type === 'workday',
        lunarStr: lunarStr,
        lunarFestival: lunarFestival,
        solarFestival: solarFestival
      };
    }

    prevMonth() {
      this.currentViewDate.setMonth(this.currentViewDate.getMonth() - 1);
      this.render();
    }

    nextMonth() {
      this.currentViewDate.setMonth(this.currentViewDate.getMonth() + 1);
      this.render();
    }

    jumpToToday() {
      this.currentViewDate = new Date();
      this.selectedDateStr = this.formatDate(new Date());
      this.options.onSelectDate(this.selectedDateStr);
      this.render();
    }

    setSelectedDate(dateStr) {
      this.selectedDateStr = dateStr;
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        this.currentViewDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      }
      this.render();
    }

    render() {
      if (!this.container) return;
      this.container.innerHTML = '';

      const year = this.currentViewDate.getFullYear();
      const month = this.currentViewDate.getMonth();
      const todayStr = this.formatDate(new Date());

      // Header
      const header = document.createElement('div');
      header.className = 'flex items-center justify-between mb-1.5 px-1 text-xs';
      header.innerHTML = `
        <div class="flex items-center space-x-1.5">
          <span class="font-bold text-slate-100 text-xs">${year} 年 ${month + 1} 月</span>
        </div>
        <div class="flex items-center space-x-1">
          <button class="cal-btn px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition" id="cal-prev" title="上一月">‹</button>
          <button class="cal-btn px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs transition" id="cal-today" title="回到本月今日">今</button>
          <button class="cal-btn px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition" id="cal-next" title="下一月">›</button>
        </div>
      `;
      this.container.appendChild(header);

      header.querySelector('#cal-prev').onclick = () => this.prevMonth();
      header.querySelector('#cal-next').onclick = () => this.nextMonth();
      header.querySelector('#cal-today').onclick = () => this.jumpToToday();

      // Legend Sub-header (休假 / 加班 / 补班指示)
      const legend = document.createElement('div');
      legend.className = 'flex items-center justify-between text-[10px] text-slate-500 mb-1 px-1';
      legend.innerHTML = `
        <span>法定假日 & 农历历表</span>
        <div class="flex items-center space-x-2">
          <span class="flex items-center space-x-0.5" title="法定假期与个人休假"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span class="text-emerald-400 font-medium">休假</span></span>
          <span class="flex items-center space-x-0.5" title="加班标记"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span><span class="text-rose-400 font-medium">加班</span></span>
          <span class="flex items-center space-x-0.5" title="调休补班"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span><span class="text-amber-400 font-medium">补班</span></span>
        </div>
      `;
      this.container.appendChild(legend);

      // Weekday names
      const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
      const weekHeader = document.createElement('div');
      weekHeader.className = 'grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 font-semibold mb-1 pb-0.5 border-b border-slate-800/60';
      weekdays.forEach((w, idx) => {
        const d = document.createElement('div');
        d.textContent = w;
        if (idx >= 5) d.className = 'text-slate-500';
        weekHeader.appendChild(d);
      });
      this.container.appendChild(weekHeader);

      // Days grid
      const daysGrid = document.createElement('div');
      daysGrid.className = 'grid grid-cols-7 gap-1 text-center text-xs';

      // First day of month
      const firstDay = new Date(year, month, 1);
      let startDayIdx = firstDay.getDay() - 1;
      if (startDayIdx === -1) startDayIdx = 6; // Sunday

      const totalDays = new Date(year, month + 1, 0).getDate();
      const prevMonthDays = new Date(year, month, 0).getDate();

      // Leading empty days (previous month)
      for (let i = startDayIdx - 1; i >= 0; i--) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'h-10 py-1 text-slate-600/70 text-[10px] flex flex-col items-center justify-center rounded select-none opacity-40';
        emptyDay.textContent = prevMonthDays - i;
        daysGrid.appendChild(emptyDay);
      }

      // Current month days
      for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayEl = document.createElement('div');
        
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === this.selectedDateStr;
        const dayData = this.options.hasDataForDate(dateStr);
        const milestones = dayData.milestones || [];
        const holiday = CalendarWidget.getHolidayInfo(dateStr);

        // Day of week (0: Sun, 6: Sat)
        const currentDow = new Date(year, month, d).getDay();
        const isWeekend = (currentDow === 0 || currentDow === 6);

        const hasVacationMilestone = milestones.some(m => m.type === 'vacation' || (m.text && (m.text.includes('休假') || m.text.includes('请假') || m.text.includes('年假'))));
        const hasOvertimeMilestone = milestones.some(m => m.type === 'overtime' || (m.text && m.text.includes('加班')));

        let classes = 'calendar-day-cell relative h-10 py-0.5 px-0.5 rounded cursor-pointer transition flex flex-col items-center justify-between select-none ';
        if (isSelected) classes += 'is-selected ';
        if (isToday) classes += 'is-today ';
        if (hasVacationMilestone || holiday.isHoliday) classes += 'is-holiday ';
        if (hasOvertimeMilestone) classes += 'is-overtime ';
        if (holiday.isWorkday) classes += 'is-workday ';
        if (isWeekend) classes += 'is-weekend ';
        
        if (isSelected) {
          classes += 'bg-emerald-600 text-white font-bold shadow-lg ring-2 ring-emerald-400/50 z-20 ';
        } else if (isToday) {
          classes += 'bg-slate-800/95 text-emerald-400 font-bold border border-emerald-500/60 shadow-sm ';
        } else if (hasVacationMilestone) {
          classes += 'bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/50 border border-emerald-600/40 ';
        } else if (hasOvertimeMilestone) {
          classes += 'bg-rose-950/40 text-rose-200 hover:bg-rose-900/50 border border-rose-600/40 ';
        } else if (holiday.isHoliday) {
          classes += 'bg-emerald-950/30 text-emerald-200 hover:bg-emerald-900/40 border border-emerald-700/30 ';
        } else if (holiday.isWorkday) {
          classes += 'bg-amber-950/20 text-slate-200 hover:bg-slate-800 border border-amber-900/30 ';
        } else if (isWeekend) {
          classes += 'text-slate-400 hover:bg-slate-800/80 ';
        } else {
          classes += 'text-slate-200 hover:bg-slate-800/80 ';
        }

        dayEl.className = classes;

        // Build Title Tooltip
        let fullTitle = `${dateStr}`;
        if (holiday.lunarStr) fullTitle += ` (农历${holiday.lunarStr})`;
        if (holiday.name) fullTitle += ` · ${holiday.name}`;
        if (holiday.isHoliday) fullTitle += ` 【法定放假】`;
        if (holiday.isWorkday) fullTitle += ` 【调休上班】`;
        if (milestones.length > 0) fullTitle += ` [共有 ${milestones.length} 条日程]`;
        dayEl.title = fullTitle;

        // 1. Top row: Day Number & Statutory Tag (休 / 班)
        const topRow = document.createElement('div');
        topRow.className = 'w-full flex items-center justify-between px-0.5 leading-none';
        
        const numSpan = document.createElement('span');
        numSpan.className = 'text-xs font-semibold';
        numSpan.textContent = d;
        topRow.appendChild(numSpan);

        if (hasVacationMilestone || holiday.isHoliday) {
          const restBadge = document.createElement('span');
          restBadge.className = isSelected
            ? 'calendar-corner-badge text-[9px] leading-none px-0.5 font-bold scale-90 origin-top-right text-slate-800'
            : 'calendar-corner-badge text-[9px] leading-none px-0.5 font-bold scale-90 origin-top-right text-slate-400';
          restBadge.textContent = '休';
          topRow.appendChild(restBadge);
        } else if (hasOvertimeMilestone || holiday.isWorkday) {
          const workBadge = document.createElement('span');
          workBadge.className = isSelected
            ? 'calendar-corner-badge text-[9px] leading-none px-0.5 font-bold scale-90 origin-top-right text-slate-800'
            : 'calendar-corner-badge text-[9px] leading-none px-0.5 font-bold scale-90 origin-top-right text-slate-400';
          workBadge.textContent = '班';
          topRow.appendChild(workBadge);
        }

        dayEl.appendChild(topRow);

        // 2. Bottom row: Lunar Date / Festival Name / Milestone Dots
        const botRow = document.createElement('div');
        botRow.className = 'w-full flex items-center justify-center text-[9px] leading-none overflow-hidden pb-0.5';

        // Festival or Lunar name
        let bottomText = '';
        let isFestivalText = false;
        if (holiday.name) {
          bottomText = holiday.name.replace('节', '').slice(0, 3);
          isFestivalText = true;
        } else if (holiday.lunarStr) {
          const lDay = holiday.lunarStr.slice(-2);
          bottomText = (lDay === '初一') ? holiday.lunarStr.slice(0, 2) : lDay;
        }

        const labelSpan = document.createElement('span');
        let labelColor = 'truncate text-slate-500 text-[8px] scale-90 font-normal';
        if (isSelected) {
          labelColor = 'truncate text-white font-normal text-[8px] scale-95';
        } else if (hasVacationMilestone || holiday.isHoliday) {
          // 法定节假日与休假，全部使用翠绿色展示，避免混淆
          labelColor = 'truncate text-emerald-400 font-normal text-[8px] scale-95';
        } else if (hasOvertimeMilestone) {
          // 加班使用醒目红色展示
          labelColor = 'truncate text-rose-400 font-normal text-[8px] scale-95';
        } else if (holiday.isWorkday) {
          // 调休上班保持黄色
          labelColor = 'truncate text-amber-300 font-normal text-[8px] scale-95';
        } else if (isFestivalText) {
          // 常规没放假的节日（如教师节、七夕、中元节等），使用纯净白色展示，不与补班的黄色混淆
          labelColor = 'truncate text-slate-100 font-normal text-[8px] scale-95';
        }

        labelSpan.className = labelColor;
        labelSpan.textContent = bottomText;
        botRow.appendChild(labelSpan);

        const hasCourseMilestone = milestones.some(m => m.type === 'course');

        // Indicator dots for user milestones
        if (milestones.length > 0) {
          const dot = document.createElement('span');
          let dotColorClass = 'bg-amber-400';
          let dotSelectedColorClass = 'bg-amber-300';
          if (hasVacationMilestone) {
            dotColorClass = 'bg-emerald-400';
            dotSelectedColorClass = 'bg-emerald-200';
          } else if (hasOvertimeMilestone) {
            dotColorClass = 'bg-rose-500';
            dotSelectedColorClass = 'bg-rose-200';
          } else if (hasCourseMilestone) {
            const courseItem = milestones.find(m => m.type === 'course');
            const cColor = courseItem?.color || 'indigo';
            const colorMap = {
              indigo: 'bg-indigo-400',
              purple: 'bg-purple-400',
              sky: 'bg-sky-400',
              teal: 'bg-teal-400',
              pink: 'bg-pink-400'
            };
            dotColorClass = colorMap[cColor] || 'bg-indigo-400';
            dotSelectedColorClass = 'bg-indigo-200';
          }

          if (milestones.length === 1) {
            dot.className = isSelected
              ? `w-1.5 h-1.5 rounded-full ${dotSelectedColorClass} ml-0.5 flex-shrink-0`
              : `w-1.5 h-1.5 rounded-full ${dotColorClass} ml-0.5 flex-shrink-0 shadow-sm`;
          } else {
            dot.className = isSelected
              ? `px-0.5 py-0 text-[7px] leading-none ${dotSelectedColorClass} text-slate-950 font-black rounded-xs ml-0.5 flex-shrink-0`
              : `px-0.5 py-0 text-[7px] leading-none ${dotColorClass} text-slate-950 font-black rounded-xs ml-0.5 flex-shrink-0`;
            dot.textContent = milestones.length;
          }
          botRow.appendChild(dot);
        } else if (dayData.hasTasks && !isFestivalText) {
          const dot = document.createElement('span');
          dot.className = isSelected ? 'w-1 h-1 rounded-full bg-white ml-0.5' : 'w-1 h-1 rounded-full bg-slate-500 ml-0.5';
          botRow.appendChild(dot);
        }

        dayEl.appendChild(botRow);

        dayEl.onclick = () => {
          this.selectedDateStr = dateStr;
          this.options.onSelectDate(dateStr);
          this.render();
        };

        daysGrid.appendChild(dayEl);
      }

      this.container.appendChild(daysGrid);
    }
  }

  window.CalendarWidget = CalendarWidget;
})();
