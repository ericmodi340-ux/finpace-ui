// ----------------------------------------------------------------------

export default function arrayFromObj(
  obj: { [key: string]: { [key: string]: any } },
  idArray?: string[],
  key = 'id'
) {
  const orderedIds = idArray || Object.keys(obj);
  return orderedIds.reduce(
    (accumulator, current) => {
      accumulator.push(obj[current]);
      return accumulator;
    },
    [] as { [key: string]: any }[]
  );
}
