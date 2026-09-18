// Pomodoro Focus Timer Component
class PomodoroTimer {
  constructor(options = {}) {
    this.onTick = options.onTick || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onModeChange = options.onModeChange || (() => {});
    
    this.modes = {
      focus: { name: '专注', duration: 25 * 60, tag: '🍅' },
      shortBreak: { name: '短休', duration: 5 * 60, tag: '☕' },
      longBreak: { name: '长休', duration: 15 * 60, tag: '🌴' }
    };

    this.currentMode = 'focus';
    this.remaining = this.modes.focus.duration;
    this.isRunning = false;
    this.timerId = null;
    this.linkedTask = null; // { id, text }
  }

  setMode(mode) {
    if (!this.modes[mode]) return;
    this.pause();
    this.currentMode = mode;
    this.remaining = this.modes[mode].duration;
    this.onModeChange(this.getFormattedState());
  }

  setLinkedTask(task) {
    this.linkedTask = task;
    // If not already focus, switch to focus
    if (this.currentMode !== 'focus') {
      this.setMode('focus');
    }
    this.onTick(this.getFormattedState());
  }

  clearLinkedTask() {
    this.linkedTask = null;
    this.onTick(this.getFormattedState());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timerId = setInterval(() => {
      this.remaining--;
      if (this.remaining <= 0) {
        this.complete();
      } else {
        this.onTick(this.getFormattedState());
      }
    }, 1000);
    this.onTick(this.getFormattedState());
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timerId);
    this.timerId = null;
    this.onTick(this.getFormattedState());
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  reset() {
    this.pause();
    this.remaining = this.modes[this.currentMode].duration;
    this.onTick(this.getFormattedState());
  }

  complete() {
    this.pause();
    // Silent mode by user request (commentV1.md): no sound played, triggers onComplete
    const completedState = this.getFormattedState();
    
    // Auto switch next mode suggestion
    const nextMode = this.currentMode === 'focus' ? 'shortBreak' : 'focus';
    this.remaining = this.modes[nextMode].duration;
    this.currentMode = nextMode;

    this.onComplete(completedState);
    this.onTick(this.getFormattedState());
  }

  getFormattedTime() {
    const mins = Math.floor(this.remaining / 60);
    const secs = this.remaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  getFormattedState() {
    return {
      formattedTime: this.getFormattedTime(),
      remaining: this.remaining,
      totalDuration: this.modes[this.currentMode].duration,
      isRunning: this.isRunning,
      mode: this.currentMode,
      modeConfig: this.modes[this.currentMode],
      linkedTask: this.linkedTask
    };
  }
}

window.PomodoroTimer = PomodoroTimer;
