export default class CollectionHelper {
  static objectOmit(obj, keys) {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!keys.includes(key)) newObj[key] = value;
    }
    return newObj;
  }
  static pluck(obj, keys) {
    const newObj = {};
    keys.forEach((key) => {
      if (key in obj) newObj[key] = obj[key];
    });
    return newObj;
  }
}
