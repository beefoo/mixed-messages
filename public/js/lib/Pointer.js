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
    this.started = false;
    this.onStart(event);
  }

  static getChildFromEvent(event, selector) {
    const $target = document.elementFromPoint(event.clientX, event.clientY);
    return $target.closest(selector);
  }

  getGesture() {
    return this.gesture || 'tap';
  }

  onMove(event) {
    // assume any movement is a drag
    if (this.gesture !== 'drag') this.gesture = 'drag';
  }

  onStart(event) {
    this.isPrimary = false;
    this.gesture = false;
    this.started = Date.now();

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
  }

  onEnd(_event) {
    if (!this.started || this.gesture !== false) return;

    const time = Date.now();

    // if passed the tap threshold, consider it a drag
    const elapsed = time - this.started;
    if (elapsed >= this.options.tapThreshold) this.gesture = 'drag';
  }
}
