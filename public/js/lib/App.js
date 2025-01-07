import AudioLoader from './AudioLoader.js';
import AudioPlayer from './AudioPlayer.js';
import AudioSelector from './AudioSelector.js';
import PointerManager from './PointerManager.js';
import Sequencer from './Sequencer.js';
import TextInterface from './TextInterface.js';
import ToolController from './ToolController.js';
import ToolSelector from './ToolSelector.js';

export default class App {
  constructor(options = {}) {
    const defaults = {
      audioPath: 'audio/',
      el: 'app',
      debug: false,
      latency: 0.1, // schedule audio this far in advance (in seconds)
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    const { options } = this;
    this.$el = document.getElementById(options.el);
    this.ctx = new AudioContext();
    this.selector = new AudioSelector({
      onSelect: (item) => this.onSelectAudio(item),
    });
    this.loader = new AudioLoader({
      audioContext: this.ctx,
    });
    this.ui = new TextInterface();
    this.player = new AudioPlayer({
      audioContext: this.ctx,
    });
    this.sequencer = new Sequencer({
      audioContext: this.ctx,
    });
    this.tools = new ToolSelector({
      onSelect: (tool) => this.onSelectTool(tool),
    });
    this.pointers = new PointerManager({
      childSelector: '.syll',
      onDrag: (pointer) => {
        this.onPointerDrag(pointer);
      },
      onDragEnd: (pointer) => {
        this.onPointerDragEnd(pointer);
      },
      onStart: (pointer) => {
        this.onPointerStart(pointer);
      },
      onTap: (pointer) => {
        this.onPointerTap(pointer);
      },
      target: 'text-wrapper',
    });
    this.controller = new ToolController({
      app: this,
      player: this.player,
      sequencer: this.sequencer,
      ui: this.ui,
    });
    this.update();
  }

  getSequenceItems(syll) {
    const { latency } = this.options;
    const { id, start, end, $el } = syll;
    const playerItem = {
      id: `player-${id}`,
      group: id,
      start,
      latency,
      task: (when, options) => {
        this.player.play(start, end, when, options);
      },
    };
    const uiItem = {
      id: `ui-${id}`,
      group: id,
      start,
      latency: 0,
      task: (_when, _options) => {
        $el.classList.remove('playing');
        setTimeout(() => $el.classList.add('playing'), 1);
      },
    };
    return [playerItem, uiItem];
  }

  onPointerDrag(pointer) {
    const { selectedTool } = this.tools;

    if (selectedTool in this.controller) this.controller[selectedTool](pointer);
  }

  onPointerDragEnd(pointer) {
    const { selectedTool } = this.tools;
    const property = `${selectedTool}End`;
    if (property in this.controller) this.controller[property](pointer);
    if (pointer.$target) pointer.$target.classList.remove('active');
  }

  onPointerStart(pointer) {
    if (pointer.$target) pointer.$target.classList.add('active');
    this.ui.refreshBBox();
    const { selectedTool } = this.tools;
    const property = `${selectedTool}Start`;
    if (property in this.controller) this.controller[property](pointer);
  }

  onPointerTap(pointer) {
    const { selectedTool } = this.tools;
    const property = `${selectedTool}Once`;
    if (property in this.controller) this.controller[property](pointer);
    if (pointer.$target) pointer.$target.classList.remove('active');
  }

  async onSelectAudio(item) {
    const { audioPath } = this.options;
    const audioURL = `${audioPath}${item.id}.mp3`;
    const dataURL = `${audioPath}${item.id}.json`;
    const [audioResp, dataResp] = await Promise.all([
      this.loader.loadFromURL(audioURL),
      this.ui.loadFromURL(dataURL),
    ]);
    if (!audioResp || !dataResp) return;
    // set the audio buffer
    this.player.setBuffer(this.loader.buf);
    this.updateSequence();
    console.log(`Audio and data loaded for ${item.id}`);
  }

  onSelectTool(tool) {
    this.$el.setAttribute('data-tool', tool);
  }

  update() {
    window.requestAnimationFrame(() => this.update());
    this.sequencer.step();
  }

  updateSequence() {
    const { duration } = this.loader;
    const { words } = this.ui.data;
    // set the sequence
    this.sequencer.setDuration(duration);
    const sequence = [];
    words.forEach((word) => {
      word.syllables.forEach((syll) => {
        const items = this.getSequenceItems(syll);
        sequence.push(...items);
      });
    });

    // console.log(sequence);
    this.sequencer.setSequence(sequence);
  }
}
