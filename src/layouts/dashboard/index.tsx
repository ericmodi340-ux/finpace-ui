import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
// @mui
import { styled, useTheme } from '@mui/material/styles';
// hooks
import useCollapseDrawer from 'hooks/useCollapseDrawer';
// config
import {
  DASHBOARD_NAVBAR_WIDTH,
  DASHBOARD_HEADER_MOBILE,
  DASHBOARD_HEADER_DESKTOP,
  DASHBOARD_NAVBAR_COLLAPSE_WIDTH,
  HEADER_FREE_TRIAL,
} from 'config';
// sections
import OnboardingModal from 'sections/onboarding/OnboardingModal';
//
import { FreeTrialBanner } from './header/FreeTrialBanner';
import DashboardHeader from './header';
import DashboardNavbar from './navbar';
import shouldShowBanner from 'utils/showBanner';
import { FirmSelectPlan } from 'sections/@dashboard/settings/firm';
import { dispatch, useSelector } from 'redux/store';
import { setShowBilling } from 'redux/slices/firm';
import { hasActivePlan } from 'utils/firm';
import StripeCheckoutSuccess from 'sections/pricing/StripeCheckoutSuccess';
import ContactSalesModal from 'sections/onboarding/ContactSalesModal';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    display: 'flex',
    minHeight: '100%',
  },
}));

type MainStyleProps = {
  collapseClick: boolean;
};

const MainStyle = styled('main', {
  shouldForwardProp: (prop) => prop !== 'collapseClick',
})<MainStyleProps>(({ collapseClick, theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.neutral,
  paddingTop: DASHBOARD_HEADER_MOBILE + HEADER_FREE_TRIAL + 10,
  paddingBottom: DASHBOARD_HEADER_MOBILE + 24,
  [theme.breakpoints.up('lg')]: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: DASHBOARD_HEADER_DESKTOP + 24,
    width: `calc(100% - ${DASHBOARD_NAVBAR_WIDTH}px)`,
    transition: theme.transitions.create('margin-left', {
      duration: theme.transitions.duration.shorter,
    }),
    ...(collapseClick && {
      marginLeft: DASHBOARD_NAVBAR_COLLAPSE_WIDTH,
    }),
  },
}));

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  // Variables
  const { collapseClick } = useCollapseDrawer();
  const theme = useTheme();
  const { firm } = useSelector((state) => state.firm);
  const isLoading = useSelector((state) => state.firm.isLoading);

  // States
  const [open, setOpen] = useState(false);

  // Selectors
  const openFirmSelectPlan = useSelector((state) => state.firm.showBillingModal);
  const firmHasActivePlan = hasActivePlan(firm);
  const bannerActive = shouldShowBanner();

  const handleCancel = () => {
    dispatch(setShowBilling(false));
  };

  useEffect(() => {
    if (!firmHasActivePlan) dispatch(setShowBilling(true));
    else dispatch(setShowBilling(false));
  }, [firmHasActivePlan]);
  const showPlans = !isLoading && !firmHasActivePlan && !openFirmSelectPlan;

  return (
    <RootStyle>
      {bannerActive ? <FreeTrialBanner /> : null}

      <DashboardHeader onOpenSidebar={() => setOpen(true)} />

      <DashboardNavbar isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />

      <MainStyle
        collapseClick={collapseClick}
        sx={{
          [theme.breakpoints.up('lg')]: {
            paddingTop: `calc(${DASHBOARD_HEADER_DESKTOP}px + 24px + ${
              bannerActive ? HEADER_FREE_TRIAL : ''
            }px)`,
          },
        }}
      >
        <Outlet />
      </MainStyle>

      <OnboardingModal />
      <ContactSalesModal />
      {/* {authUser?.role === roles.CLIENT && <ClientWelcomeModal />} */}

      {showPlans && (
        <FirmSelectPlan
          open={openFirmSelectPlan}
          handleCancel={handleCancel}
          hasActivePlan={firmHasActivePlan}
        />
      )}
      <StripeCheckoutSuccess />
    </RootStyle>
  );
}
