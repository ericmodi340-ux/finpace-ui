export const firmIds = {
  GWN: 'GWN',
};

export const customDomains: { [domain: string]: { firmId?: string; hideSignUp?: boolean } } = {
  'gwnforms.com': { firmId: firmIds.GWN, hideSignUp: true },
  'forms.xypnsapphire.com': { firmId: firmIds.GWN, hideSignUp: true },
  'xypn.finpace.app': { firmId: firmIds.GWN, hideSignUp: true },
};
