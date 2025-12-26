export function phoneMask(v: string): string {
  v = v.replace(/\D/g, '');
  v = v.slice(0, 10);
  if (v.length === 0) {
    return '';
  } else if (v.length <= 3) {
    return v;
  } else if (v.length <= 6) {
    return `(${v.slice(0, 3)}) ${v.slice(3)}`;
  } else {
    return `(${v.slice(0, 3)}) ${v.slice(3, 6)}-${v.slice(6)}`;
  }
}

export function ssnMask(v: string): string {
  v = v.replace(/\D/g, '');
  v = v.slice(0, 9);
  if (v.length === 0) {
    return '';
  } else if (v.length <= 3) {
    return v;
  } else if (v.length <= 5) {
    return `${v.slice(0, 3)}-${v.slice(3)}`;
  } else {
    return `${v.slice(0, 3)}-${v.slice(3, 5)}-${v.slice(5)}`;
  }
}

export function currencyMask(v: string): string {
  if (!v) {
    return '';
  }
  if (typeof v === 'string' && v.includes('-')) {
    const arr = v.split('-');
    return arr.map((item) => currencyMask(item)).join('-');
  }
  let num = parseInt(String(v).replace(/\D/g, ''), 10);
  if (isNaN(num)) return '';
  let result = num.toLocaleString('en-US');
  return result;
}

export function percentageMask(v: string): string {
  if (!v) {
    return '';
  }
  if (v.endsWith('%')) {
    return v;
  }
  return `${v}%`;
}
