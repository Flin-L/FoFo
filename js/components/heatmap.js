// GitHub-Style Activity Heatmap Component
class ActivityHeatmap {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = Object.assign({
      weeks: 20,
      onSelectDate: () => {},
      getDataForDate: () => ({ tasks: 0, pomodoros: 0 })
    }, options);

    this.tooltip = null;
    this.initTooltip();
  }

  initTooltip() {
    let el = document.getElementById('heatmap-tooltip');
    if (!el) {
      el = document.createElement('div');
      el.id = 'heatmap-tooltip';
      document.body.appendChild(el);
    }
    this.tooltip = el;
  }

  formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  calculateLevel(score) {
    if (!score || score <= 0) return 0;
    if (score <= 2) return 1;
    if (score <= 4) return 2;
    if (score <= 7) return 3;
    return 4;
  }

  render(activeDateStr) {
    if (!this.container) return;
    this.container.innerHTML = '';

    // Calculate start date: exactly `weeks` weeks ago from Sunday
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    // Align to ending at current week
    const endDate = new Date(today);
    
    // Start date = today minus (weeks * 7 days)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (this.options.weeks * 7) + (6 - dayOfWeek));

    const grid = document.createElement('div');
    grid.className = 'heatmap-grid';

    let cur = new Date(startDate);
    while (cur <= endDate) {
      const dateStr = this.formatDate(cur);
      const data = this.options.getDataForDate(dateStr) || { tasks: 0, pomodoros: 0 };
      const score = (data.tasks || 0) + (data.pomodoros || 0);
      const level = this.calculateLevel(score);

      const cell = document.createElement('div');
      cell.className = `heatmap-cell level-${level} ${dateStr === activeDateStr ? 'active-day' : ''}`;
      cell.dataset.date = dateStr;
      cell.dataset.tasks = data.tasks || 0;
      cell.dataset.pomodoros = data.pomodoros || 0;

      // Mouse events for tooltip
      cell.addEventListener('mouseenter', (e) => {
        const t = cell.dataset.tasks;
        const p = cell.dataset.pomodoros;
        const d = cell.dataset.date;
        this.tooltip.innerHTML = `<strong>${d}</strong><br/>完成待办: ${t} 个 · 专注番茄: ${p} 🍅`;
        this.tooltip.style.display = 'block';
        this.positionTooltip(e);
      });

      cell.addEventListener('mousemove', (e) => {
        this.positionTooltip(e);
      });

      cell.addEventListener('mouseleave', () => {
        this.tooltip.style.display = 'none';
      });

      cell.addEventListener('click', () => {
        this.options.onSelectDate(dateStr);
      });

      grid.appendChild(cell);
      cur.setDate(cur.getDate() + 1);
    }

    this.container.appendChild(grid);
  }

  positionTooltip(e) {
    if (!this.tooltip) return;
    const x = e.clientX + 10;
    const y = e.clientY - 35;
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
  }
}

window.ActivityHeatmap = ActivityHeatmap;
