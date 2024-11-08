export default class AudioLoader {
  constructor(options = {}) {
    const defaults = {
      debug: false,
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.buffer = false;
    this.ctx = new AudioContext();
  }

  async loadFromURL(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Response status: ${response.status}`);
        return false;
      }

      const audioData = await response.arrayBuffer();
      const buffer = await this.ctx.decodeAudioData(audioData);
      const mono = buffer.getChannelData(0);
      const length = mono.length / buffer.sampleRate;
      this.buffer = buffer;
      this.duration = length;
      console.log(`Loaded ${url} with duration: ${length}s.`);
      return true;
    } catch (error) {
      this.buffer = false;
      console.error(error.message);
      return false;
    }
  }
}
