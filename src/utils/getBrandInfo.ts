interface BrandMap {
  [key: string]: {
    logo: string;
    name: string;
  };
}

const brandedMaps: BrandMap = {
  'gwnforms.com': {
    logo: '/logo/logo_gwn.png',
    name: 'GWN Forms',
  },
  'data.atlanticwp.com': {
    logo: '/logo/logo_athanticwp.png',
    name: 'Atlantic Wealth Partners',
  },
  'forms.lentzadvisors.com': {
    logo: '/logo/lentz.png',
    name: 'Atlantic Wealth Partners',
  },
  'xypn.finpace.app': {
    logo: '/logo/logo_XYPN.png',
    name: 'XYPN',
  },
  'forms.xypnsapphire.com': {
    logo: '/logo/logo_XYPN.png',
    name: 'XYPN',
  },
};

export function getBrandLogo() {
  if (brandedMaps[window.location.host]) {
    return brandedMaps[window.location.host].logo;
  }

  return '/logo/logo_full_finpace.png';
}

export function getBrandName() {
  if (brandedMaps[window.location.host]) {
    return brandedMaps[window.location.host].name;
  }

  return 'Finpace';
}
