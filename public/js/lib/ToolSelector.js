export default class ToolSelector {
  constructor(options = {}) {
    const defaults = {
      buttonSelector: '.tool-button',
      debug: false,
      el: 'tools',
      onSelect: (tool) => console.log(tool),
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  init() {
    this.$el = document.getElementById(this.options.el);
    const $selected = document.querySelector(
      `${this.options.buttonSelector}.selected`,
    );
    this.selectedTool = $selected.getAttribute('data-tool');
    this.loadListeners();
  }

  loadListeners() {
    const { buttonSelector } = this.options;
    this.$el.onclick = (event) => {
      const $button = event.target.closest(buttonSelector);
      if ($button) this.onClickTool($button);
    };
  }

  onClickTool($el) {
    const toolName = $el.getAttribute('data-tool');
    document
      .querySelectorAll(this.options.buttonSelector)
      .forEach(($button) => {
        if ($button.getAttribute('data-tool') === toolName)
          $button.classList.add('selected');
        else $button.classList.remove('selected');
      });
    this.selectedTool = toolName;
    this.options.onSelect(toolName);
  }
}
