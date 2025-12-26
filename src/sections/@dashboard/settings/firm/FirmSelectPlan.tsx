import { Box, Button, Container, Dialog, Toolbar, Typography, styled } from '@mui/material';
import { PlanSelect } from 'sections/onboarding/FirmOnboardingStepper/pages';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  justifyContent: 'center',
}));

type FirmSelectPlanProps = {
  open: boolean;
  handleCancel: VoidFunction;
  hasActivePlan: boolean;
};

const FirmSelectPlan = ({ open, handleCancel, hasActivePlan }: FirmSelectPlanProps) => (
  <Dialog id="form-edit-dialog" fullScreen open={open}>
    <Toolbar sx={{ flex: 0, justifyContent: 'flex-end', mt: 2, mb: 2, zIndex: 2000 }}>
      <Box sx={{ ml: 2, flex: 0 }}>
        <Typography variant="subtitle1" component="div">
          {hasActivePlan && (
            <Button
              onClick={handleCancel}
              sx={{
                color: 'text.disabled',
                typography: 'body2',
                py: 1,
                px: 2,
                borderRadius: 1,
                m: 1,
              }}
            >
              Cancel
            </Button>
          )}
        </Typography>
      </Box>
    </Toolbar>
    <RootStyle>
      <Container
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PlanSelect />
      </Container>
    </RootStyle>
  </Dialog>
);

export default FirmSelectPlan;
