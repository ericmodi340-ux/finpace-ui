type WhiteLabelAssetsPaths = {
  [key: string]: {
    firmId: string;
    name: string;
    primaryPalette?: {
      lighter: string;
      light: string;
      main: string;
      dark: string;
      darker: string;
      //   contrastText: string;
    };
    secondaryPalette?: {
      lighter: string;
      light: string;
      main: string;
      dark: string;
      darker: string;
      //   contrastText: string;
    };
    background?: {
      paper: string;
      paperDark: string;
    };
  };
};

export const WHITE_LABEL_ASSETS_PATHS: WhiteLabelAssetsPaths = {
  'xypn.finpace.app': {
    firmId: 'xypn',
    name: 'XYPN Sapphire',
    primaryPalette: {
      lighter: '#B3D9F3',
      light: '#52ABFA',
      main: '#1F6DF4',
      dark: '#20399B',
      darker: '#0C044E',
      //   contrastText: '#FFFFFF',
    },
    secondaryPalette: {
      lighter: '#CBE698',
      light: '#9FCF6C',
      main: '#6DB454',
      dark: '#469946',
      darker: '#307D41',
      //   contrastText: '#FFFFFF',
    },
    background: {
      paper: '#FAF9F8',
      paperDark: '#333333',
    },
  },
  'forms.xypnsapphire.com': {
    firmId: 'xypn',
    name: 'XYPN Sapphire',
    primaryPalette: {
      lighter: '#B3D9F3',
      light: '#52ABFA',
      main: '#1F6DF4',
      dark: '#20399B',
      darker: '#0C044E',
      //   contrastText: '#FFFFFF',
    },
    secondaryPalette: {
      lighter: '#CBE698',
      light: '#9FCF6C',
      main: '#6DB454',
      dark: '#469946',
      darker: '#307D41',
      //   contrastText: '#FFFFFF',
    },
    background: {
      paper: '#FAF9F8',
      paperDark: '#333333',
    },
  },
  'data.atlanticwp.com': {
    firmId: 'atlanticwp',
    name: 'Atlantic Wealth Partners',
  },
  'forms.lentzadvisors.com': {
    firmId: 'lentzadvisors',
    name: 'Lentz Advisors',
    primaryPalette: {
      lighter: '#B3D9F3',
      light: '#52ABFA',
      main: '#1F6DF4',
      dark: '#20399B',
      darker: '#0C044E',
      //   contrastText: '#FFFFFF',
    },
    secondaryPalette: {
      lighter: '#CBE698',
      light: '#9FCF6C',
      main: '#6DB454',
      dark: '#469946',
      darker: '#307D41',
      //   contrastText: '#FFFFFF',
    },
    background: {
      paper: '#FAF9F8',
      paperDark: '#333333',
    },
  },
  'gwnforms.com': {
    firmId: 'GWN',
    name: 'GWN Forms',
    primaryPalette: {
      lighter: '#456993',
      light: '#243E7E',
      main: '#040E68',
      dark: '#0C025D',
      darker: '#240044',
      //   contrastText: '#FFFFFF',
    },
    secondaryPalette: {
      lighter: '#CBE698',
      light: '#9FCF6C',
      main: '#6DB454',
      dark: '#469946',
      darker: '#307D41',
      //   contrastText: '#FFFFFF',
    },
    background: {
      paper: '#FFFFFF',
      paperDark: '#333333',
    },
  },
};
