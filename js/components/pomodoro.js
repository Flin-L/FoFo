// Pomodoro Focus Timer Component
class PomodoroTimer {
  constructor(options = {}) {
    this.onTick = options.onTick || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onModeChange = options.onModeChange || (() => {});
    
    this.modes = {
      focus: { name: '专注', duration: 25 * 60, tag: '🎓' },
      shortBreak: { name: '短休', duration: 5 * 60, tag: '☕' },
      longBreak: { name: '长休', duration: 15 * 60, tag: '🌴' }
    };

    this.currentMode = 'focus';
    this.remaining = this.modes.focus.duration;
    this.isRunning = false;
    this.targetEndTime = null;
    this.timerId = null;
    this.worker = null;
    this.linkedTask = null; // { id, text }

    this.initWorker();
    this.initVisibilityListener();
  }

  initWorker() {
    // Dedicated Web Worker thread is exempt from window occlusion & background tab throttling
    try {
      const workerCode = `
        let intervalId = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(function() {
              self.postMessage('tick');
            }, 1000);
          } else if (e.data === 'stop') {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      this.worker = new Worker(workerUrl);
      this.worker.onmessage = (e) => {
        if (e.data === 'tick' && this.isRunning) {
          this.step();
        }
      };
    } catch (err) {
      console.warn('[Pomodoro] Web Worker not supported or restricted, falling back to standard interval', err);
      this.worker = null;
    }
  }

  initVisibilityListener() {
    // Whenever the browser tab/window is switched back, uncovered, or focused, instantly calibrate with true wall clock
    const handleSync = () => {
      if (this.isRunning && this.targetEndTime) {
        this.step();
      }
    };
    document.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);
    window.addEventListener('pageshow', handleSync);
  }

  setMode(mode) {
    if (!this.modes[mode]) return;
    this.pause();
    this.currentMode = mode;
    this.remaining = this.modes[mode].duration;
    this.targetEndTime = null;
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
    
    // Exact wall-clock target timestamp avoids any drift or throttling loss
    this.targetEndTime = Date.now() + (this.remaining * 1000);

    if (this.worker) {
      this.worker.postMessage('start');
    }
    // Main thread fallback interval
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.step();
    }, 1000);

    this.onTick(this.getFormattedState());
    this.updateDocumentTitle();
  }

  step() {
    if (!this.isRunning || !this.targetEndTime) return;
    const now = Date.now();
    const diffSeconds = Math.max(0, Math.ceil((this.targetEndTime - now) / 1000));
    this.remaining = diffSeconds;

    if (this.remaining <= 0) {
      this.complete();
    } else {
      this.onTick(this.getFormattedState());
      this.updateDocumentTitle();
    }
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.targetEndTime) {
      const now = Date.now();
      this.remaining = Math.max(0, Math.ceil((this.targetEndTime - now) / 1000));
      this.targetEndTime = null;
    }

    if (this.worker) {
      this.worker.postMessage('stop');
    }
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.onTick(this.getFormattedState());
    this.resetDocumentTitle();
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
    this.targetEndTime = null;
    this.onTick(this.getFormattedState());
    this.resetDocumentTitle();
  }

  complete() {
    this.pause();
    // Silent mode by user request (commentV1.md): no sound played, triggers onComplete
    const completedState = this.getFormattedState();
    
    // Auto switch next mode suggestion
    const nextMode = this.currentMode === 'focus' ? 'shortBreak' : 'focus';
    this.remaining = this.modes[nextMode].duration;
    this.currentMode = nextMode;
    this.targetEndTime = null;

    this.onComplete(completedState);
    this.onTick(this.getFormattedState());
    this.updateCompletionTitle();
  }

  updateDocumentTitle() {
    try {
      const modeTag = this.modes[this.currentMode].tag || '🎓';
      document.title = `(${this.getFormattedTime()}) ${modeTag} 专注中 · FoFo 工作台`;
    } catch (e) {}
  }

  updateCompletionTitle() {
    try {
      document.title = `🎉 (达成!) 专注完成 · FoFo 工作台`;
      setTimeout(() => this.resetDocumentTitle(), 6000);
    } catch (e) {}
  }

  resetDocumentTitle() {
    try {
      document.title = 'FoFo 工作台';
    } catch (e) {}
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
