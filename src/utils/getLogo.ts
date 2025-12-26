export function getFullLogo(): string {
  return window.location.href.includes('bitsy')
    ? '/logo/logo_full.png'
    : '/logo/logo_full_finpace.png';
}

export function getAltLogo(): string {
  return window.location.href.includes('bitsy') ? 'Bitsy Advisor' : 'Finpace';
}

export function getLogoIcon(): string {
  return window.location.href.includes('bitsy')
    ? '/logo/logo_icon.png'
    : '/logo/logo_icon_finpace.png';
}
