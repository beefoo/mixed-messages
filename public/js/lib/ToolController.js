export default class ToolController {
  constructor(options = {}) {
    const defaults = {
      debug: false,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.sequencer = this.options.sequencer;
    this.ui = this.options.ui;
  }

  move(pointer) {}

  moveStart(pointer) {
    const { ui, sequencer } = this;
    const charId = pointer.$target.id;
    if (!charId) return;
    const syllable = ui.getSyllableByCharId(charId);
    if (!syllable) return;
    console.log(syllable);
  }
}
