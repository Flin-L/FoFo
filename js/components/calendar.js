// Interactive Calendar Component
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
    header.className = 'flex items-center justify-between mb-2.5 px-1 text-xs';
    header.innerHTML = `
      <span class="font-bold text-slate-200">${year} 年 ${month + 1} 月</span>
      <div class="flex items-center space-x-1">
        <button class="cal-btn px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition" id="cal-prev">‹</button>
        <button class="cal-btn px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs transition" id="cal-today">今</button>
        <button class="cal-btn px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition" id="cal-next">›</button>
      </div>
    `;
    this.container.appendChild(header);

    header.querySelector('#cal-prev').onclick = () => this.prevMonth();
    header.querySelector('#cal-next').onclick = () => this.nextMonth();
    header.querySelector('#cal-today').onclick = () => this.jumpToToday();

    // Weekday names
    const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
    const weekHeader = document.createElement('div');
    weekHeader.className = 'grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500 font-medium mb-1';
    weekdays.forEach(w => {
      const d = document.createElement('div');
      d.textContent = w;
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

    // Leading empty days
    for (let i = startDayIdx - 1; i >= 0; i--) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'py-1 text-slate-600 text-[11px]';
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

      let classes = 'relative py-1 rounded cursor-pointer transition flex flex-col items-center justify-center ';
      if (isSelected) {
        classes += 'bg-emerald-600 text-white font-bold shadow ';
      } else if (isToday) {
        classes += 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/40 ';
      } else {
        classes += 'text-slate-300 hover:bg-slate-800/80 ';
      }

      dayEl.className = classes;
      dayEl.textContent = d;

      // Indicator dots / badges for milestones
      if (milestones.length > 0) {
        const dot = document.createElement('span');
        if (milestones.length === 1) {
          dot.className = 'w-1.5 h-1.5 rounded-full bg-amber-400 absolute bottom-0.5';
          dot.title = `日程: ${milestones[0].text}`;
        } else {
          dot.className = 'w-2 h-1.5 rounded-sm bg-amber-400 text-[8px] leading-none text-slate-950 font-black absolute bottom-0.5 flex items-center justify-center';
          dot.title = `当天共有 ${milestones.length} 项日程节点`;
        }
        dayEl.appendChild(dot);
      } else if (dayData.hasTasks) {
        const dot = document.createElement('span');
        dot.className = 'w-1 h-1 rounded-full bg-slate-500 absolute bottom-0.5';
        dayEl.appendChild(dot);
      }

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
