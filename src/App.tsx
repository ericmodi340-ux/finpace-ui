import { useEffect } from 'react';
// redux
import { useDispatch } from './redux/store';
import { registerUser } from './redux/slices/pubsub';
import { getFirm } from './redux/slices/firm';
import { getAdvisor } from './redux/slices/advisor';
import { getClient } from './redux/slices/client';
import { getFirmAdmins } from 'redux/slices/firmAdmins';
import { getAdvisors } from 'redux/slices/advisors';
import { getClients } from 'redux/slices/clients';
import { getUser } from 'redux/slices/user';
// routes
import Router from './routes';
// hooks
import useAuth from 'hooks/useAuth';
import usePubSub from 'hooks/usePubSub';
// components
import Settings from './components/settings';
import RtlLayout from './components/RtlLayout';
import ScrollToTop from './components/ScrollToTop';
import GoogleAnalytics from './components/GoogleAnalytics';
import { ProgressBarStyle } from './components/ProgressBar';
import NotistackProvider from './components/NotistackProvider';
import ThemeColorPresets from './components/ThemeColorPresets';
import ThemeLocalization from './components/ThemeLocalization';
import MotionLazyContainer from './components/animate/MotionLazyContainer';
// utils
import { setCustomComponents } from './utils/formio';
// constants
import { roles } from 'constants/users';
import { getNotifications } from 'redux/slices/notifications';
import { AppTourContextProvider } from 'contexts/AppTourContextProvider';
import { Helmet } from 'react-helmet-async';

// ----------------------------------------------------------------------

function App() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  setCustomComponents();

  useEffect(() => {
    if (!user) {
      return;
    }

    dispatch(registerUser());
    dispatch(getNotifications());

    if (user.sub && user.role) {
      dispatch(getUser(user.role, user.sub));
    }

    const firmId = user.firmId || '';
    if (firmId) {
      dispatch(getFirm(firmId));
    }

    let advisorId;
    if (user.role === roles.ADVISOR) {
      advisorId = user.sub || '';
    }
    if (user.role === roles.CLIENT) {
      advisorId = user.advisorId || '';
    }
    if (advisorId) {
      dispatch(getAdvisor(advisorId));
    }

    let clientId;
    if (user.role === roles.CLIENT) {
      clientId = user.sub || '';
    }
    if (clientId) {
      dispatch(getClient(clientId));
    }

    if (user.role === roles.FIRM_ADMIN) {
      dispatch(getFirmAdmins());
      dispatch(getAdvisors());
    }

    if (user.role !== roles.CLIENT) {
      dispatch(getClients());
    }
  }, [dispatch, user]);

  usePubSub();

  return (
    <ThemeColorPresets>
      <ThemeLocalization>
        <RtlLayout>
          <NotistackProvider>
            <MotionLazyContainer>
              <AppTourContextProvider>
                <Helmet>
                  {window.location.hostname === 'forms.xypnsapphire.com' && (
                    <>
                      <link
                        rel="apple-touch-icon"
                        sizes="180x180"
                        href="/xypn-favicon/apple-touch-icon.png"
                      />
                      <link
                        rel="icon"
                        type="image/png"
                        sizes="32x32"
                        href="/xypn-favicon/favicon-32x32.png"
                      />
                      <link
                        rel="icon"
                        type="image/png"
                        sizes="16x16"
                        href="/xypn-favicon/favicon-16x16.png"
                      />
                      <link
                        rel="mask-icon"
                        href="/xypn-favicon/safari-pinned-tab.svg"
                        color="#5bbad5"
                      />
                    </>
                  )}
                  {window.location.hostname === 'data.atlanticwp.com' && (
                    <>
                      <link
                        rel="apple-touch-icon"
                        sizes="180x180"
                        href="/favicon_athanticwp/apple-touch-icon.png"
                      />
                      <link
                        rel="icon"
                        type="image/png"
                        sizes="32x32"
                        href="/favicon_athanticwp/favicon-32x32.png"
                      />
                      <link
                        rel="icon"
                        type="image/png"
                        sizes="16x16"
                        href="/favicon_athanticwp/favicon-16x16.png"
                      />
                      <link
                        rel="mask-icon"
                        href="/favicon_athanticwp/safari-pinned-tab.svg"
                        color="#5bbad5"
                      />
                    </>
                  )}

                  {window.location.hostname === 'gwnforms.com' && (
                    <>
                      <link
                        rel="apple-touch-icon"
                        sizes="180x180"
                        href="/favicon_gwn/apple-touch-icon.png"
                      />
                      <link
                        rel="icon"
                        type="image/png"
                        sizes="32x32"
                        href="/favicon_gwn/favicon-32x32.png"
                      />
                      <link
                        rel="icon"
                        type="image/png"
                        sizes="16x16"
                        href="/favicon_gwn/favicon-16x16.png"
                      />
                      <link
                        rel="mask-icon"
                        href="/favicon_gwn/safari-pinned-tab.svg"
                        color="#5bbad5"
                      />
                    </>
                  )}
                </Helmet>
                <ProgressBarStyle />
                <Settings />
                <ScrollToTop />
                <GoogleAnalytics />
                <Router />
              </AppTourContextProvider>
            </MotionLazyContainer>
          </NotistackProvider>
        </RtlLayout>
      </ThemeLocalization>
    </ThemeColorPresets>
  );
}

export default App;
