import MathHelper from './MathHelper.js';

export default class ToolController {
  constructor(options = {}) {
    const defaults = {
      debug: false,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.app = this.options.app;
    this.sequencer = this.options.sequencer;
    this.ui = this.options.ui;
    this.player = this.options.player;
  }

  getSyllableFromPointer(pointer) {
    const syllable = this.ui.getSyllableFromEl(pointer.$target);
    if (!syllable) return false;
    return syllable;
  }

  bass(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;

    // get delta movement in percentage of bounding box
    const { bbox } = this.ui;
    const { delta } = pointer;
    if (!delta) return;
    const dy = -delta.y / bbox.height;

    // calculate new bass
    const { bass, wordIndex, index, $el } = syllable;
    const minBass = -2;
    const maxBass = 2;
    const newBass = MathHelper.clamp(bass + dy, minBass, maxBass);
    const i = wordIndex;
    const j = index;
    const n = MathHelper.norm(newBass, minBass, maxBass);
    const t = MathHelper.lerp(-1.0, 1.0, n);
    this.ui.data.words[i].syllables[j].bass = newBass;

    // update the UI
    // if greater than zero, make more transparent
    if (t >= 0) {
      const opacity = MathHelper.lerp(1.0, 0.25, t);
      $el.style.opacity = opacity;
      $el.style.filter = 'blue(0px)';
      // if less than zero, blur
    } else {
      const blur = MathHelper.lerp(0, 10.0, Math.abs(t));
      $el.style.opacity = 1;
      $el.style.filter = `blur(${blur}px)`;
    }

    // update the syllable in the sequencer
    const { sequencer } = this;
    const { sequence } = sequencer;
    const bassValue = t < 0 ? -t : 0;
    const trebleValue = t > 0 ? t : 0;
    sequence.forEach((item, index) => {
      if (item.group === syllable.id) {
        this.sequencer.sequence[index].bass = bassValue;
        this.sequencer.sequence[index].treble = trebleValue;
      }
    });
  }

  duplicate(pointer) {
    this.move(pointer);
  }

  duplicateEnd(pointer) {
    // if pointer has not moved, artificially move the duplicated syllable randomly
    if (pointer.hasMoved()) return;

    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;

    // define move range in pixels
    const { bbox } = this.ui;
    const minMoveX = bbox.width * 0.05;
    const maxMoveX = bbox.width * 0.2;
    const minMoveY = bbox.height * 0.5;
    const maxMoveY = bbox.height * 2.0;
    const moveX = MathHelper.randomBetween(minMoveX, maxMoveX);
    const moveY = MathHelper.randomBetween(minMoveY, maxMoveY);
    const directionX = Math.random() > 0.5 ? 1 : -1;
    const directionY = Math.random() > 0.5 ? 1 : -1;

    // move and animate
    const animate = 500;
    pointer.delta = {
      x: moveX * directionX,
      y: moveY * directionY,
    };
    this.move(pointer, animate);
  }

  duplicateOnce(pointer) {
    this.duplicateEnd(pointer);
  }

  duplicateStart(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;

    // clone the syllable in the UI
    const newSyll = this.ui.cloneSyllable(syllable);
    pointer.setTarget(newSyll.$el);

    // add new syllable to sequence
    const items = this.app.getSequenceItems(newSyll);
    this.sequencer.add(items);
  }

  loudness(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;

    // get delta movement in percentage of bounding box
    const { bbox } = this.ui;
    const { delta } = pointer;
    if (!delta) return;
    const dy = -(delta.y / bbox.height) * 100;

    // scale the syllable
    const { top, height, wordIndex, index, originalRect, $el } = syllable;
    const scaleRange = [0.25, 2.5];
    const i = wordIndex;
    const j = index;
    const minHeight = originalRect.height * scaleRange[0];
    const maxHeight = originalRect.height * scaleRange[1];
    const newHeight = MathHelper.clamp(height + dy, minHeight, maxHeight);
    const newTop = top + (height - newHeight) * 0.5;
    $el.style.top = `${newTop}%`;
    $el.style.height = `${newHeight}%`;
    this.ui.data.words[i].syllables[j].top = newTop;
    this.ui.data.words[i].syllables[j].height = newHeight;

    // update the syllable in the sequencer
    const { sequencer } = this;
    const { sequence } = sequencer;
    const volume = MathHelper.lerp(
      scaleRange[0],
      scaleRange[1],
      MathHelper.norm(newHeight, minHeight, maxHeight),
    );
    sequence.forEach((item, index) => {
      if (item.group === syllable.id) {
        this.sequencer.sequence[index].volume = volume;
      }
    });
  }

  move(pointer, animate = 0) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;

    // get delta movement in percentage of bounding box
    const { bbox } = this.ui;
    const { delta } = pointer;
    if (!delta) return;
    const nx = (delta.x / bbox.width) * 100;
    const ny = (delta.y / bbox.height) * 100;

    // move syllable elements in UI
    const { top, left, width, $el, wordIndex, index } = syllable;
    const i = wordIndex;
    const j = index;
    const isFlipped = width < 0;
    const minY = -200;
    const maxY = 200;
    const newLeft = left + nx;
    const adjustedLeft = isFlipped ? newLeft + width : newLeft;
    const newTop = MathHelper.clamp(top + ny, minY, maxY);

    // animate the movement if necessary
    if (animate > 0) {
      $el.classList.add('animating');
      setTimeout(() => {
        $el.classList.remove('animating');
      }, animate);
    }
    $el.style.left = `${adjustedLeft}%`;
    $el.style.top = `${newTop}%`;
    this.ui.data.words[i].syllables[j].left = newLeft;
    this.ui.data.words[i].syllables[j].top = newTop;

    // now update the syllable start time in the sequencer
    const { sequencer } = this;
    const { sequence } = sequencer;
    const syllLeft = adjustedLeft;
    let nStart = syllLeft / 100.0;
    if (nStart < 0 || nStart > 1.0) nStart = nStart % 1.0; // wrap it if out of bounds
    const newStart = sequencer.duration * nStart;
    const newEnd = newStart + syllable.duration;
    this.ui.data.words[i].syllables[j].start = newStart;
    this.ui.data.words[i].syllables[j].end = newEnd;
    sequence.forEach((item, index) => {
      if (item.group === syllable.id) {
        this.sequencer.sequence[index].start = newStart;
      }
    });
  }

  pitch(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;

    // get delta movement in percentage of bounding box
    const { bbox } = this.ui;
    const { delta } = pointer;
    if (!delta) return;
    const dx = (delta.x / bbox.width) * 100;

    // scale the syllable
    const { left, width, wordIndex, index, originalRect, $el } = syllable;
    const scaleRange = [-3.0, 3.0];
    const i = wordIndex;
    const j = index;
    const minWidth = originalRect.width * scaleRange[0];
    const maxWidth = originalRect.width * scaleRange[1];
    let newWidth = MathHelper.clamp(width + dx, minWidth, maxWidth);
    if (newWidth >= 0 && newWidth < 1.0) newWidth = 1.0;
    else if (newWidth < 0 && newWidth > -1.0) newWidth = -1.0;
    const isFlipped = newWidth < 0;
    const adjustedLeft = isFlipped ? left + newWidth : left;
    if (isFlipped) $el.classList.add('flip-x');
    else $el.classList.remove('flip-x');
    $el.style.left = `${adjustedLeft}%`;
    $el.style.width = `${Math.abs(newWidth)}%`;
    this.ui.data.words[i].syllables[j].width = newWidth;

    // update the syllable in the sequencer
    const { sequencer } = this;
    const { sequence } = sequencer;
    // adjust start time if flipped
    const syllLeft = adjustedLeft;
    let nStart = syllLeft / 100.0;
    if (nStart < 0 || nStart > 1.0) nStart = nStart % 1.0; // wrap it if out of bounds
    const newStart = sequencer.duration * nStart;
    const newEnd = newStart + syllable.duration;
    this.ui.data.words[i].syllables[j].start = newStart;
    this.ui.data.words[i].syllables[j].end = newEnd;
    const scale = MathHelper.lerp(
      scaleRange[0],
      scaleRange[1],
      MathHelper.norm(newWidth, minWidth, maxWidth),
    );
    const playbackRate = 1.0 / Math.abs(scale);
    sequence.forEach((item, index) => {
      if (item.group === syllable.id) {
        this.sequencer.sequence[index].start = newStart;
        this.sequencer.sequence[index].reverse = isFlipped;
        this.sequencer.sequence[index].playbackRate = playbackRate;
      }
    });
  }

  trim(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;

    // get delta movement in percentage of syllable width
    const { bbox } = this.ui;
    const { delta } = pointer;
    const { trim, width, $el, wordIndex, index } = syllable;
    if (!delta) return;
    let nx = -(delta.x / bbox.width) * (100 / width) * 100;

    // clip syllable elements in UI
    const i = wordIndex;
    const j = index;
    const minTrim = 0;
    const maxTrim = 80;
    const trimAmount = MathHelper.clamp(trim + nx, minTrim, maxTrim);
    $el.style.clipPath = `inset(0 ${trimAmount}% 0 0)`;
    this.ui.data.words[i].syllables[j].trim = trimAmount;

    // update the syllable in the sequencer
    const { sequencer } = this;
    const { sequence } = sequencer;
    const trimSeconds = syllable.duration * (trimAmount / 100.0);
    sequence.forEach((item, index) => {
      if (item.group === syllable.id) {
        this.sequencer.sequence[index].trim = trimSeconds;
      }
    });
  }
}
