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
    this.$selector = document.getElementById(options.selectEl);
    this.$item = document.getElementById(options.itemEl);
    this.index = 0;
    this.loadUI(this.index);
    this.select(this.index);
    this.loadListeners();
  }

  loadListeners() {
    this.$selector.onchange = (_event) => this.onSelect();
  }

  loadUI(selectedIndex = 0) {
    let html = '';
    this.items.forEach((item, i) => {
      const selected = i === selectedIndex ? 'selected' : '';
      html += `<option value="${i}" ${selected}>"${item.text}"</option>`;
    });
    this.$selector.innerHTML = html;
  }

  onSelect() {
    const index = parseInt(this.$selector.value, 10);
    this.select(index);
  }

  select(index) {
    const item = this.items[index];
    const html = `by <a href="${item.url}" target="_blank">${item.speakers}</a>`;
    this.$item.innerHTML = html;
    this.options.onSelect(item);
  }
}
