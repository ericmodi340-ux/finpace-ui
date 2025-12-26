// ----------------------------------------------------------------------

import { types } from 'constants/disclosures';

export function getDisclosureName(key: string) {
  if (!key) return;
  const keySplit = key.split('/');
  return keySplit[keySplit.length - 1].split(':::')[1];
}

export function getDisclosureType(key: string) {
  if (!key) return;
  const keySplit = key.split('/')[2];
  if (keySplit === 'advisorsDisclosures') return types.ADVISOR;
  return types.FIRM;
}

export function getDisclosureUserId(key: string) {
  if (!key) return;
  const keySplit = key.split('/');
  return keySplit[keySplit.length - 1].split(':::')[0];
}
