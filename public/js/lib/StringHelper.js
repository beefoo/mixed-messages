export default class StringHelper {
  static queryParams() {
    const searchString = window.location.search;
    if (searchString.length <= 0) return {};
    const searchParams = new URLSearchParams(searchString.substring(1));
    const parsed = {};
    for (const [key, value] of searchParams.entries()) {
      parsed[key] = Helper.parseNumber(value);
    }
    return parsed;
  }
}
