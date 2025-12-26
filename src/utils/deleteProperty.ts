// ----------------------------------------------------------------------

export default function deleteProperty(obj: { [key: string]: { [key: string]: any } }, key = 'id') {
  return Object.keys(obj).reduce(
    (acc, cur) => (cur === key ? acc : { ...acc, [cur]: obj[cur] }),
    {}
  );
}
