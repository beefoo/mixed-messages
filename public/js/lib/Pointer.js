export default class Pointer {
  constructor(options = {}) {
    const defaults = {
      childSelector: false,
      debug: false,
      event: false,
      id: '0',
      tapThreshold: 500,
      $target: false,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    const { id, event } = this.options;

    this.id = id;
    this.isValid = false;
    this.started = false;
    this.posStart = false;
    this.posLast = false;
    this.data = {};
    this.onStart(event);
  }

  static getChildFromEvent(event, selector) {
    const $target = document.elementFromPoint(event.clientX, event.clientY);
    return $target.closest(selector);
  }

  static getPositionFromEvent(event) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  getGesture() {
    return this.gesture || 'tap';
  }

  onMove(event) {
    // assume any movement is a drag
    if (this.gesture !== 'drag') this.gesture = 'drag';
    const { posLast } = this;
    if (!posLast) return;
    const pos = this.constructor.getPositionFromEvent(event);
    this.delta = {
      x: pos.x - posLast.x,
      y: pos.y - posLast.y,
    };
    this.posLast = pos;
  }

  onStart(event) {
    this.isPrimary = false;
    this.gesture = false;
    this.started = Date.now();
    this.posStart = this.constructor.getPositionFromEvent(event);
    this.posLast = structuredClone(this.posStart);

    // check to see if it is primary pointer
    if (event && event.originalEvent) {
      this.isPrimary = event.originalEvent.isPrimary;
    }

    // check to see if there's a child selector
    const { childSelector } = this.options;
    this.$target = event.currentTarget;
    if (childSelector) {
      this.$target = this.constructor.getChildFromEvent(event, childSelector);
    }
    if (this.$target) this.isValid = true;
  }

  onEnd(_event) {
    if (!this.started || this.gesture !== false) return;

    const time = Date.now();

    // if passed the tap threshold, consider it a drag
    const elapsed = time - this.started;
    if (elapsed >= this.options.tapThreshold) this.gesture = 'drag';
  }

  setData(key, data) {
    if (key in this.data) {
      this.data[key] = Object.assign(this.data[key], data);
      return;
    }
    this.data[key] = data;
  }
}
