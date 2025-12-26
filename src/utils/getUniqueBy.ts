// ----------------------------------------------------------------------

export default function getUniqueBy(arr: Array<{ [key: string]: any }>, prop: string) {
  const set = new Set();
  return arr.filter((o) => !set.has(o[prop]) && set.add(o[prop]));
}
