import { FirmManager } from '../@types/firm';
import getEnv from './getEnv';
import { envs, envUrls } from 'constants/envs';

// ----------------------------------------------------------------------

export default function getEnvUrl(firm?: FirmManager) {
  const env = getEnv();

  let envUrl;
  switch (env) {
    case envs.DEV:
      envUrl = envUrls.DEV;
      break;
    case envs.STAGING:
      envUrl = envUrls.STAGING;
      break;
    default:
      envUrl = envUrls.PROD;
      break;
  }

  if (firm?.whiteLabel && firm?.customDomainUrl) {
    envUrl = firm?.customDomainUrl;
  }

  return envUrl;
}
