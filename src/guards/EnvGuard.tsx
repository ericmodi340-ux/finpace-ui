import { ReactNode } from 'react';
// hooks
import getEnv from '../utils/getEnv';
// pages
import ComingSoon from '../pages/ComingSoon';
// constants
import { envs } from 'constants/envs';

// ----------------------------------------------------------------------

type EnvGuardProps = {
  children: ReactNode;
  allowedEnvs: string[];
};

export default function EnvGuard({
  children,
  allowedEnvs = [envs.PROD, envs.STAGING, envs.DEV],
}: EnvGuardProps) {
  const isAllowedEnv = allowedEnvs.includes(getEnv());

  if (!isAllowedEnv) {
    return <ComingSoon />;
  }

  return <>{children}</>;
}
