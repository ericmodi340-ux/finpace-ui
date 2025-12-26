export function arrayInChunks(array: Array<any>, chunkSize: number) {
  const newArray = [];
  while (array.length > 0) {
    const chunk = array.splice(0, chunkSize);
    newArray.push(chunk);
  }
  return newArray;
}
