function parseTable(table) {
  const { rows, cols } = table;
  return rows.map((row) => {
    const item = {};
    cols.forEach((col, i) => {
      item[col] = row[i];
    });
    return item;
  });
}

export default class AudioSelector {
  constructor(options = {}) {
    const defaults = {
      debug: false,
      itemEl: 'item-detail',
      onSelect: (item) => console.log(item),
      select: false, // pass in an ID; defaults to selecting the first item
      selectEl: 'source-select',
      src: 'audio/manifest.json',
    };
    this.options = Object.assign(defaults, options);
    this.init();
  }

  async init() {
    const { options } = this;
    const response = await fetch(options.src);
    const table = await response.json();
    this.items = parseTable(table);
    this.itemCount = this.items.length;
    this.$selector = document.getElementById(options.selectEl);
    this.$item = document.getElementById(options.itemEl);
    this.selectedId = options.select;
    this.selectIdIndex(this.selectedId);
    this.loadUI(this.index);
    this.select(this.index);
    this.loadListeners();
  }

  loadListeners() {
    const $next = document.getElementById('button-next');
    const $prev = document.getElementById('button-prev');
    const $reset = document.getElementById('button-reset');

    this.$selector.onchange = (_event) => this.onSelect();
    $next.addEventListener('click', (_event) => this.next());
    $prev.addEventListener('click', (_event) => this.prev());
    $reset.addEventListener('click', (_event) => this.reset());
  }

  loadUI(selectedIndex = 0) {
    let html = '';
    this.items.forEach((item, i) => {
      const selected = i === selectedIndex ? 'selected' : '';
      html += `<option value="${item.id}" ${selected}>"${item.text}"</option>`;
    });
    this.$selector.innerHTML = html;
  }

  next() {
    let newIndex = this.index + 1;
    if (newIndex >= this.itemCount) newIndex = 0;
    this.$selector.selectedIndex = newIndex;
    this.$selector.onchange();
  }

  onSelect() {
    this.selectedId = this.$selector.value;
    this.selectIdIndex(this.selectedId);
    this.select(this.index);
  }

  prev() {
    let newIndex = this.index - 1;
    if (newIndex < 0) newIndex = this.itemCount - 1;
    this.$selector.selectedIndex = newIndex;
    this.$selector.onchange();
  }

  reset() {
    this.select(this.index);
  }

  select(index) {
    this.index = index;
    const item = this.items[index];
    const html = `by ${item.speakers}, <a href="${item.url}" target="_blank"><em>${item.title}</em></a>`;
    this.$item.innerHTML = html;
    this.options.onSelect(item);
  }

  selectIdIndex(id) {
    const index = this.items.findIndex((item) => item.id === id);
    this.index = index >= 0 ? index : 0;
  }
}
