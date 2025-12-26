// ----------------------------------------------------------------------

export function getParams() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const entries = urlParams.entries();

  let params: {
    [key: string]: string;
  } = {};

  for (const entry of entries) {
    params[`${entry[0]}`] = `${entry[1]}`;
  }

  return params;
}

export function updateParams(param: string, newValue: string) {
  let url = new URL(window.location.href);
  let params = new URLSearchParams(url.search);

  const originalParam = params.get(param);
  if (originalParam !== newValue && window.history.pushState) {
    params.set(param, newValue);

    const newurl =
      window.location.protocol +
      '//' +
      window.location.host +
      window.location.pathname +
      `?${params.toString()}`;
    window.history.pushState({ path: newurl }, '', newurl);
  }
}

export function isTrueParam(param: string | undefined) {
  if (!param || (param && ('false' === param || param === 'undefined' || 0 === parseInt(param)))) {
    return false;
  }

  return true;
}
