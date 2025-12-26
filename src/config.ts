import { Auth } from 'aws-amplify';
import { SettingsValueProps } from './components/settings/type';

// API
// ----------------------------------------------------------------------

export const HOST_API = import.meta.env.VITE_HOST_API_KEY || '';

export const stage = import.meta.env.VITE_STAGE || 'dev';

export const API_BASE =
  window.location.hostname === 'localhost' ? 'https://dev.finpace.app/dev/api' : `/${stage}/api`;

export const CDN_PATH =
  stage === 'dev' ? 'https://dev-cdn.finpace.com/public/' : 'https://cdn.finpace.app/public/';

export const API_BASE_FULL_URL =
  window.location.hostname === 'localhost'
    ? 'https://dev.finpace.app/dev/api'
    : `https://${window.location.host}/${stage}/api`;

export const BACKEND_URL =
  stage === 'dev' ? 'https://dev.finpace.app/dev/api' : 'https://finpace.app/prod/api';

export const AMPLIFY_CONFIG = {
  Auth: {
    identityPoolId: import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID,
    region: import.meta.env.VITE_AWS_PROJECT_REGION,
    identityPoolRegion: import.meta.env.VITE_AWS_COGNITO_REGION,
    userPoolId: import.meta.env.VITE_AWS_USER_POOLS_ID,
    userPoolWebClientId: import.meta.env.VITE_AWS_USER_POOLS_WEB_CLIENT_ID,
    authenticationFlowType: 'CUSTOM_AUTH',
    oauth: {
      domain: `bitsy-${stage}-v3.auth.us-east-1.amazoncognito.com`,
      scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
      // scope: ['email', 'profile', 'openid'],
      redirectSignIn: window.location.origin,
      redirectSignOut: window.location.origin,
      responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code
    },
  },
  API: {
    endpoints: [
      {
        name: 'bitsybackendv2',
        endpoint: API_BASE,
        region: import.meta.env.VITE_AWS_PROJECT_REGION,
        custom_header: async () => ({
          Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
        }),
      },
      {
        name: 'create-envelope',
        endpoint: import.meta.env.VITE_CREATE_ENVELOPE_API,
        region: import.meta.env.VITE_AWS_PROJECT_REGION,
        custom_header: async () => ({
          Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
        }),
        // service: 'lambda'
      },
    ],
  },
  Storage: {
    AWSS3: {
      bucket: `bitsy-storage-${stage}`,
      region: import.meta.env.VITE_AWS_PROJECT_REGION,
    },
  },
};

export const GOOGLE_ANALYTICS_API = import.meta.env.VITE_GA_MEASUREMENT_ID;

// ? Exposed key okay - see https://mui.com/components/data-grid/getting-started/#security
export const MUI_PRO_LICENSE_KEY =
  'd8d97a1d31596cb718ea196518070c6aT1JERVI6Mzc2MjYsRVhQSVJZPTE2NzYxMzI5MTQwMDAsS0VZVkVSU0lPTj0x';

// LAYOUT
// ----------------------------------------------------------------------

export const DRAWER_WIDTH = 260;

export const DASHBOARD_HEADER_MOBILE = 64;
export const DASHBOARD_HEADER_DESKTOP = 92;
export const DASHBOARD_NAVBAR_WIDTH = 280;
export const DASHBOARD_NAVBAR_COLLAPSE_WIDTH = 88;
export const HEADER_FREE_TRIAL = 50;

export const DASHBOARD_NAVBAR_ROOT_ITEM_HEIGHT = 48;
export const DASHBOARD_NAVBAR_SUB_ITEM_HEIGHT = 40;
export const DASHBOARD_NAVBAR_ICON_ITEM_SIZE = 22;

export const MAIN_HEADER_DESKTOP = 88;
export const MAIN_HEADER_MOBILE = 64;

// SETTINGS
// ----------------------------------------------------------------------

export const defaultSettings: SettingsValueProps = {
  themeMode: 'light',
  themeDirection: 'ltr',
  themeColorPresets: 'default',
  themeStretch: false,
};

// STORAGE
// ----------------------------------------------------------------------

export const AVATAR_MAX_SIZE = 3145728;
export const FILE_MAX_SIZE = 10145728;
export const FILE_MIN_SIZE = 1;
export const AVATAR_MIN_SIZE = 1;
export const LOGO_MAX_SIZE = 3145728;
export const ICON_MAX_SIZE = 3145728;

// FILES
// ----------------------------------------------------------------------
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.csv'];
export const MAX_FILE_NAME_LENGTH = 255;
