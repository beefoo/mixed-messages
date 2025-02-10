import Pointer from './Pointer.js';

class KeyboardVector {
  constructor() {
    this.init();
  }

  init() {
    this.vector = { x: 0, y: 0 };
  }

  isActive() {
    return Math.abs(this.vector.x) > 0 || Math.abs(this.vector.y) > 0;
  }

  update(event, deactivate) {
    const { code } = event;
    if (code === 'ArrowUp') this.vector.y = deactivate ? 0 : -1;
    else if (code === 'ArrowDown') this.vector.y = deactivate ? 0 : 1;
    else if (code === 'ArrowLeft') this.vector.x = deactivate ? 0 : -1;
    else if (code === 'ArrowRight') this.vector.x = deactivate ? 0 : 1;
  }
}

export default class KeyboardManager {
  constructor(options = {}) {
    const defaults = {
      childSelector: false,
      debug: false,
      onPressEnter: (_pointer) => {},
      onPressArrowStart: (_pointer) => {},
      onPressingArrow: (_pointer) => {},
      onPressArrowEnd: (_pointer) => {},
      pixelsPerSecond: 100,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.pointer = false;
    this.lastUpdated = false;
    this.vector = new KeyboardVector();
    this.isActive = false;
    this.loadListeners();
  }

  getActiveEl() {
    const { childSelector } = this.options;
    let $activeEl = document.activeElement;
    if (childSelector && !$activeEl.matches(childSelector)) $activeEl = false;
    return $activeEl;
  }

  loadListeners() {
    const $target = document;

    $target.addEventListener('keydown', (event) => this.onKeyDown(event));
    $target.addEventListener('keyup', (event) => this.onKeyUp(event));
  }

  onArrowEnd() {
    this.options.onPressArrowEnd(this.pointer);
  }

  onArrowKeyDown(event) {
    event.preventDefault();
    // check for active element
    this.$activeEl = this.getActiveEl();
    if (!this.$activeEl) return;

    // update vector
    const wasActive = this.isActive;
    this.vector.update(event);
    this.isActive = this.vector.isActive();
    if (!wasActive && this.isActive) this.onArrowStart();
    else if (this.isActive) this.updateArrow();
  }

  onArrowKeyUp(event) {
    event.preventDefault();
    const wasActive = this.isActive;
    this.vector.update(event, true);
    this.isActive = this.vector.isActive();
    if (wasActive && !this.isActive) this.onArrowEnd();
  }

  onArrowStart() {
    const $target = this.$activeEl;
    const rect = $target.getBoundingClientRect();
    this.pointer = new Pointer({
      event: {
        clientX: rect.x,
        clientY: rect.y,
        currentTarget: $target,
        isPrimary: true,
      },
    });
    this.lastUpdated = Date.now();
    this.options.onPressArrowStart(this.pointer);
  }

  onEnterKeyUp(event) {
    event.preventDefault();
    // check for active element
    this.$activeEl = this.getActiveEl();
    if (!this.$activeEl) return;

    const pointer = new Pointer({
      event: {
        clientX: 0,
        clientY: 0,
        currentTarget: this.$activeEl,
        isPrimary: true,
      },
    });
    this.options.onPressEnter(pointer);
  }

  onKeyDown(event) {
    const { code } = event;
    if (code.startsWith('Arrow')) this.onArrowKeyDown(event);
  }

  onKeyUp(event) {
    const { code } = event;
    if (code.startsWith('Arrow')) this.onArrowKeyUp(event);
    else if (code === 'Enter') this.onEnterKeyUp();
  }

  updateArrow() {
    if (!this.pointer || !this.isActive || !this.lastUpdated) return;

    // check to see if time has passed
    const now = Date.now();
    const elapsed = now - this.lastUpdated;
    if (elapsed <= 0) return;
    this.lastUpdated = now;

    // manually move the pointer
    const { posLast } = this.pointer;
    const { vector } = this.vector;
    const seconds = elapsed / 1000.0;
    const { pixelsPerSecond } = this.options;
    const pixels = Math.min(seconds * pixelsPerSecond, 10);
    const event = {
      clientX: posLast.x + pixels * vector.x,
      clientY: posLast.y + pixels * vector.y,
    };
    this.pointer.onMove(event);
    this.options.onPressingArrow(this.pointer);
  }
}
