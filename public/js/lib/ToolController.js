import CollectionHelper from './CollectionHelper.js';
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

  bass(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;

    // get delta movement in percentage of bounding box
    const { bbox } = this.ui;
    const { delta } = pointer;
    if (!delta) return;
    const dy = -(delta.y / bbox.height) * 8;

    // calculate new bass
    const { bass, wordIndex, index, $el, $wrapper } = syllable;
    const minBass = -2;
    const maxBass = 2;
    const newBass = MathHelper.clamp(bass + dy, minBass, maxBass);
    const i = wordIndex;
    const j = index;
    const n = MathHelper.norm(newBass, minBass, maxBass);
    const t = MathHelper.lerp(-1.0, 1.0, n);
    this.ui.data.words[i].syllables[j].bass = newBass;

    // update the UI
    const $els = [$el, $wrapper];
    $els.forEach(($e) => {
      // if greater than zero, make more transparent
      if (t >= 0) {
        const opacity = MathHelper.lerp(1.0, 0.25, t);
        $e.style.opacity = opacity;
        $e.style.filter = 'blue(0px)';
        // if less than zero, blur
      } else {
        const blur = MathHelper.lerp(0, 10.0, Math.abs(t));
        $e.style.opacity = 1;
        $e.style.filter = `blur(${blur}px)`;
      }
    });

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

  // check if the syllable is off-screen and should be wrapped
  checkForWrappedSyllable(syllable) {
    const { top, left, width, height, $el, $wrapper, wordIndex, index } =
      syllable;
    const $els = [$el, $wrapper];
    const i = wordIndex;
    const j = index;
    const isFlipped = width < 0;
    const abWidth = Math.abs(width);

    // First, let's check if it's completely inside bounds
    const isInsideY = top >= 0 && top <= 100 - height;
    let isInsideX = left >= 0 && left <= 100 - width;
    if (isFlipped) isInsideX = left >= abWidth && left <= 100;
    const isInside = isInsideX && isInsideY;
    // If so, hide the wrapper
    if (isInside) {
      $wrapper.classList.remove('visible');
      return;
    }

    // Next check if it's partially or completely outside of bounds
    let newTop = top;
    let newLeft = left;
    const isOutsideY = top <= -height || top >= 100;
    let isOutsideX = left <= -width || left >= 100;
    if (isFlipped) isOutsideX = left <= 0 || left >= 100 + abWidth;
    const isPartialX = !isInsideX && !isOutsideX;
    const isPartialY = !isInsideY && !isOutsideY;
    const isOutside = isOutsideY || isOutsideX;
    const isPartial = isPartialX || isPartialY;

    // check for positions completely outside of bounding box
    if (isOutsideY) newTop = MathHelper.mod(top, 100);
    if (isOutsideX)
      newLeft = isFlipped
        ? MathHelper.wrap(left, abWidth, 100 + abWidth)
        : MathHelper.mod(left, 100);
    if (isOutside) {
      const adjustedLeft = isFlipped ? newLeft + width : newLeft;
      $els.forEach(($e) => {
        $e.style.top = `${newTop}%`;
        $e.style.left = `${adjustedLeft}%`;
      });
      this.ui.data.words[i].syllables[j].top = newTop;
      this.ui.data.words[i].syllables[j].left = newLeft;
    }

    // if there's no partial, hide wrapper
    if (!isPartial) {
      $wrapper.classList.remove('visible');
      return;
    }

    // set the wrapped position to the wrapper element
    let wrapperTop = newTop;
    let wrapperLeft = isFlipped ? newLeft + width : newLeft;
    if (isPartialY)
      wrapperTop = wrapperTop < 0 ? wrapperTop + 100 : wrapperTop - 100;
    if (isPartialX)
      wrapperLeft = wrapperLeft < 0 ? wrapperLeft + 100 : wrapperLeft - 100;
    $wrapper.style.top = `${wrapperTop}%`;
    $wrapper.style.left = `${wrapperLeft}%`;

    // finally, make wrapper visible
    $wrapper.classList.add('visible');
  }

  deleteOnce(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;

    // remove the element from the UI
    const { $el, $wrapper, wordIndex, index } = syllable;
    const i = wordIndex;
    const j = index;
    const $els = [$el, $wrapper];
    $els.forEach(($e) => {
      // animate out
      $e.classList.add('disappear');
      setTimeout(() => $e.remove(), 500);
    });
    this.ui.data.words[i].syllables[j].deleted = true;

    // remove from sequence
    this.sequencer.removeGroup(syllable.id);
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

    // get existing sequence item's audio properties
    const { sequence } = this.sequencer;
    const foundItem = sequence.find((item) => item.group === syllable.id);
    let audioOptions = {};
    if (foundItem) {
      const audioProperties = [
        'bass',
        'playbackRate',
        'reverse',
        'start',
        'treble',
        'trim',
        'volume',
      ];
      audioOptions = CollectionHelper.pluck(foundItem, audioProperties);
    }

    // add new syllable to sequence
    const items = this.app.getSequenceItems(newSyll, audioOptions);
    this.sequencer.add(items);
  }

  getSyllableFromPointer(pointer) {
    const syllable = this.ui.getSyllableFromEl(pointer.$target);
    if (!syllable) return false;
    return syllable;
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
    const { top, height, wordIndex, index, originalRect, $el, $wrapper } =
      syllable;
    const scaleRange = [0.25, 2.5];
    const i = wordIndex;
    const j = index;
    const minHeight = originalRect.height * scaleRange[0];
    const maxHeight = originalRect.height * scaleRange[1];
    const newHeight = MathHelper.clamp(height + dy, minHeight, maxHeight);
    const newTop = top + (height - newHeight) * 0.5;
    const $els = [$el, $wrapper];
    $els.forEach(($e) => {
      $e.style.top = `${newTop}%`;
      $e.style.height = `${newHeight}%`;
    });
    this.ui.data.words[i].syllables[j].top = newTop;
    this.ui.data.words[i].syllables[j].height = newHeight;
    this.checkForWrappedSyllable(this.ui.data.words[i].syllables[j]);

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
    const { top, left, width, $el, $wrapper, wordIndex, index } = syllable;
    const i = wordIndex;
    const j = index;
    const isFlipped = width < 0;
    const newLeft = left + nx;
    const adjustedLeft = isFlipped ? newLeft + width : newLeft;
    const newTop = top + ny;
    const $els = [$el, $wrapper];
    $els.forEach(($e) => {
      // animate the movement if necessary
      if (animate > 0) {
        $e.classList.add('animating');
        setTimeout(() => {
          $e.classList.remove('animating');
        }, animate);
      }
      $e.style.left = `${adjustedLeft}%`;
      $e.style.top = `${newTop}%`;
    });
    this.ui.data.words[i].syllables[j].left = newLeft;
    this.ui.data.words[i].syllables[j].top = newTop;
    this.checkForWrappedSyllable(this.ui.data.words[i].syllables[j]);

    // now update the syllable start time in the sequencer
    const { sequencer } = this;
    const { sequence } = sequencer;
    const syllLeft = adjustedLeft;
    let nStart = syllLeft / 100.0;
    if (nStart < 0 || nStart > 1.0) nStart = MathHelper.mod(nStart, 1.0); // wrap it if out of bounds
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
    const { left, width, wordIndex, index, originalRect, $el, $wrapper } =
      syllable;
    const scaleRange = [-3.0, 3.0];
    const i = wordIndex;
    const j = index;
    const minWidth = originalRect.width * scaleRange[0];
    const maxWidth = originalRect.width * scaleRange[1];
    const newWidth = MathHelper.clamp(width + dx, minWidth, maxWidth);
    // ensure visible width is not zero
    let visibleWidth = newWidth;
    if (visibleWidth >= 0 && visibleWidth < 1.0) visibleWidth = 1.0;
    else if (visibleWidth < 0 && visibleWidth > -1.0) visibleWidth = -1.0;
    const isFlipped = newWidth < 0;
    const adjustedLeft = isFlipped ? left + newWidth : left;
    const $els = [$el, $wrapper];
    $els.forEach(($e) => {
      if (isFlipped) $e.classList.add('flip-x');
      else $e.classList.remove('flip-x');
      $e.style.left = `${adjustedLeft}%`;
      $e.style.width = `${Math.abs(visibleWidth)}%`;
    });
    this.ui.data.words[i].syllables[j].width = newWidth;
    this.checkForWrappedSyllable(this.ui.data.words[i].syllables[j]);

    // update the syllable in the sequencer
    const { sequencer } = this;
    const { sequence } = sequencer;
    // adjust start time if flipped
    const syllLeft = adjustedLeft;
    let nStart = syllLeft / 100.0;
    if (nStart < 0 || nStart > 1.0) nStart = MathHelper.mod(nStart, 1.0); // wrap it if out of bounds
    const newStart = sequencer.duration * nStart;
    const newEnd = newStart + syllable.duration;
    this.ui.data.words[i].syllables[j].start = newStart;
    this.ui.data.words[i].syllables[j].end = newEnd;
    const scale = MathHelper.lerp(
      scaleRange[0],
      scaleRange[1],
      MathHelper.norm(visibleWidth, minWidth, maxWidth),
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

  shuffle(pointer) {
    if (!pointer.isPrimary) return;
    this.move(pointer);

    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;

    // get the delta from the main pointer
    const { delta } = pointer;
    if (!delta) return;

    // move all the syllables around this one
    const sylls = this.ui.getSyllablesWhere((syll) => syll.id !== syllable.id);
    sylls.forEach((syll) => {
      const syllDelta = structuredClone(delta);
      if (syll.order % 2 !== syllable.order % 2) {
        syllDelta.x = -syllDelta.x;
        syllDelta.y = -syllDelta.y;
      }
      const pointer = {
        $target: syll.$el,
        delta: syllDelta,
      };
      this.move(pointer);
    });
  }

  trim(pointer) {
    // retrieve the syllable from the pointer
    const syllable = this.getSyllableFromPointer(pointer);
    if (!syllable) return;

    // get delta movement in percentage of syllable width
    const { bbox } = this.ui;
    const { delta } = pointer;
    const { trim, width, $el, $wrapper, wordIndex, index } = syllable;
    if (!delta) return;
    let nx = -(delta.x / bbox.width) * (100 / width) * 100;

    // clip syllable elements in UI
    const i = wordIndex;
    const j = index;
    const minTrim = 0;
    const maxTrim = 80;
    const trimAmount = MathHelper.clamp(trim + nx, minTrim, maxTrim);
    const $els = [$el, $wrapper];
    $els.forEach(($e) => {
      const trimLineId = `${$e.id}-trim-line`;
      const $trimLine = document.getElementById(trimLineId);
      $e.style.clipPath = `inset(-100% ${trimAmount}% -100% -100%)`;
      if (trimAmount <= minTrim) $e.classList.remove('trimmed');
      else $e.classList.add('trimmed');
      $trimLine.style.right = `${trimAmount}%`;
    });
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
