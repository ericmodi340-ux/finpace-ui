// @mui
import { AppBar, Button, Typography } from '@mui/material';
import TimeLeft from 'components/TimeLeft';
import useResponsive from 'hooks/useResponsive';
import { setShowBilling } from 'redux/slices/firm';
import { dispatch } from 'redux/store';

export function FreeTrialBanner() {
  const isDesktop = useResponsive('up', 'lg');

  const handleShowBilling = () => {
    dispatch(setShowBilling(true));
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        p: 1,
        //Add one (1) if you want it over the MUI drawer (drawer: 1200)
        zIndex: '1201',
      }}
    >
      <Typography
        variant="body1"
        component="header"
        sx={{
          flexGrow: 1,
          textAlign: 'center',
        }}
      >
        {isDesktop ? (
          <>
            <strong>
              <TimeLeft />
            </strong>
            left of free trial. Upgrade today to get an additional 10% off
          </>
        ) : (
          <>Get 10% off!</>
        )}

        <Button variant="contained" color="info" sx={{ ml: 3 }} onClick={handleShowBilling}>
          Upgrade Now!
        </Button>
      </Typography>
    </AppBar>
  );
}
