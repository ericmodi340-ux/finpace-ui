// ----------------------------------------------------------------------

export function firstWord(string: string) {
  return string.split(' ')[0];
}

export function titleCase(string: string) {
  return string[0].toUpperCase() + string.slice(1).toLowerCase();
}
