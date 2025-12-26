// ----------------------------------------------------------------------

export function calculatePercentChange(a: number, b: number) {
  let percent;

  if (b !== 0) {
    if (a !== 0) {
      percent = ((b - a) / a) * 100;
    } else {
      percent = b * 100;
    }
  } else {
    percent = -a * 100;
  }

  return Math.floor(percent);
}

export function maskPhoneNumber(value: string) {
  const formattedValue = value
    .replace(/\D/g, '')
    .replace(/^(\d{3})(\d)/, '($1) $2')
    .replace(/(\d{3})(\d)/, '$1-$2')
    .slice(0, 14);
  return formattedValue;
}
export function unmaskPhoneNumber(value: string) {
  const formattedValue = value.replace(/\D/g, '');
  return formattedValue;
}
