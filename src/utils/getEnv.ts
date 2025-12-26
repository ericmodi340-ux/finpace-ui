import { envs, envsShort } from 'constants/envs';

// ----------------------------------------------------------------------

export default function getEnv(short?: boolean) {
  let env;

  if (window.location.hostname.includes('dev') || window.location.hostname.includes('localhost')) {
    env = short ? envsShort.DEV : envs.DEV;
  } else if (window.location.hostname.includes('staging')) {
    env = short ? envsShort.STAGING : envs.STAGING;
  } else {
    env = short ? envsShort.PROD : envs.PROD;
  }

  return env;
}
