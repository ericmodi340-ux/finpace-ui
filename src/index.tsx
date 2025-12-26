// i18n
import './locales/i18n';

import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
// @mui
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
// redux
import { store, persistor } from './redux/store';
// contexts
import { BrandProvider } from './contexts/BrandContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { CollapseDrawerProvider } from './contexts/CollapseDrawerContext';
import { AuthProvider } from './contexts/amplify';
import { EditingIntegrationsProvider } from './contexts/EditingIntegrationsContext';
// theme
import ThemeProvider from './theme';
import GlobalStyles from './theme/globalStyles';
import FirmStyles from './theme/firmStyles';
// components
import LoadingScreen from './components/LoadingScreen';
// utils
import getEnv from './utils/getEnv';

// Check the dashboard template docs
// https://docs-minimals.vercel.app/authentication/ts-version

import App from './App';
import './index.css';

Sentry.init({
  dsn: 'https://0f0ba9c606ad499fb9c03b7f5642afa3@o333425.ingest.sentry.io/6134991',
  integrations: [new Sentry.BrowserTracing({})],
  tracesSampleRate: 0.2, // Adjust this value between 0 - 1 to capture % of transactions for performance monitoring
  environment: getEnv(),
  beforeSend(event) {
    // @ts-ignore
    if (event?.message?.length && event?.message[0]?.component) {
      return null;
    }
    return event;
  },
});

// ----------------------------------------------------------------------
const domNode = document.getElementById('root');
const root = createRoot(domNode!);

root.render(
  <HelmetProvider>
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <BrandProvider>
            <SettingsProvider>
              <CollapseDrawerProvider>
                <BrowserRouter>
                  <ThemeProvider>
                    <AuthProvider>
                      <EditingIntegrationsProvider>
                        <GlobalStyles />
                        <FirmStyles />
                        <App />
                      </EditingIntegrationsProvider>
                    </AuthProvider>
                  </ThemeProvider>
                </BrowserRouter>
              </CollapseDrawerProvider>
            </SettingsProvider>
          </BrandProvider>
        </LocalizationProvider>
      </PersistGate>
    </ReduxProvider>
  </HelmetProvider>
);
