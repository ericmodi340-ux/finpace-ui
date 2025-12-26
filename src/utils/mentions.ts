// ----------------------------------------------------------------------

export const parseMentions = (values: string): string => {
  //@ts-ignore
  const parseString = values.replaceAll('{{', '<mention>').replaceAll('}}', '</mention>');
  return parseString;
};

export const unparseMentions = (values: string): string => {
  //@ts-ignore
  const unparseString = values.replaceAll('<mention>', '{{').replaceAll('</mention>', '}}');
  return unparseString;
};
