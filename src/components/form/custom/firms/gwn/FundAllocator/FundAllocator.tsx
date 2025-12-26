import React, { createContext, useEffect, useState, useMemo } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Button, Stack, useMediaQuery, Theme, Card, Container , Box } from '@mui/material';
// @types
// sections
// components
// utils
import { PlatformAllocationMap } from './_@types';
import { calculateAllocation, getInitialAllocationMap } from './_utils';
import useUserFromStore from 'hooks/useUserFromStore';
import useForm from 'hooks/useForm';
import { roles } from 'constants/users';
import { UserRole } from '../../../../../../@types/user';
import { useSnackbar } from 'notistack';
import { useSelector } from 'redux/store';
import { updateClient } from 'redux/slices/clients';
import SummaryDialog from './components/SummaryDialog';
import AllocatorDialog from './components/AllocatorDialog';

export const NewOutlinedButton = styled(Button)(({ theme }) => ({
  color: theme.palette.secondary.contrastText,
  border: `1px solid rgba(0, 39, 63, 0.22)`,
  background: theme.palette.info.main,

  '&:hover': {
    color: '#1B4158',
    border: `1px solid rgba(0, 39, 63, 0.77)`,
    background: '#F9FAFC',
  },
}));

// ----------------------------------------------------------------------

const defaultContext = {
  platformAllocationMap: {},
  setPlatformAllocationMap: () => {},
  remainingFundsPercent: 100,
  formId: '',
};

export const FundAllocatorContext = createContext<{
  platformAllocationMap: PlatformAllocationMap;
  setPlatformAllocationMap: React.Dispatch<React.SetStateAction<PlatformAllocationMap>>;
  remainingFundsPercent: number;
  formId: string | undefined;
}>(defaultContext);

const FundAllocator = ({
  formId,
  onContinue,
}: {
  formId: string | undefined;
  onContinue: VoidFunction;
}) => {
  const [open, setOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const currentForm = useForm(formId);
  const { templateId, clientId, formTitle } = currentForm || ({} as any);
  const { isLoading: loadingClient } = useSelector((state) => state.clients);
  const currentClient = useUserFromStore(clientId, roles.CLIENT as UserRole.CLIENT);
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const [platformAllocationMap, setPlatformAllocationMap] = useState<PlatformAllocationMap>(
    getInitialAllocationMap(currentClient, templateId, formTitle)
  );

  const [totalAllocated, setTotalAllocated] = useState(0);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSummaryOpen = () => {
    setSummaryOpen(true);
  };

  const handleAddAnother = () => {
    setSummaryOpen(false);
    setOpen(true);
  };

  const sanitizedValues = useMemo(() => {
    const res: PlatformAllocationMap = {};

    for (const [key, val] of Object.entries(platformAllocationMap)) {
      for (const model of Object.values(val)) {
        if (model.percentage) {
          res[key] ||= {};
          res[key][model.name] = model;
        }
      }
    }

    return res;
  }, [platformAllocationMap]);

  const handleCompleteAllocation = async () => {
    try {
      // Missing current client id probably form missing
      if (!currentClient?.id) enqueueSnackbar('Client not found', { variant: 'error' });

      await updateClient(currentClient?.id, {
        custom: {
          ...currentClient.custom,
          gwn_funds_allocated: {
            [templateId]: {
              ...sanitizedValues,
            },
          },
        },
      });

      enqueueSnackbar('Client updated', { variant: 'success' });
      onContinue();
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Error updating client', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (platformAllocationMap) {
      const { totalAllocated } = calculateAllocation(platformAllocationMap);
      setTotalAllocated(totalAllocated);
    }
  }, [platformAllocationMap, templateId]);

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 600 },
        mx: 'auto',
        my: {
          xs: 'auto',
          md: 10,
        },
        minHeight: '170px',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 5 }}>
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ my: 3 }}
          >
            <NewOutlinedButton
              variant="outlined"
              size="large"
              color="info"
              onClick={handleOpen}
              sx={{
                textTransform: 'none',
                fontSize: '16px',
              }}
            >
              Build
            </NewOutlinedButton>
            <Button
              variant="contained"
              size="large"
              onClick={handleSummaryOpen}
              sx={{
                textTransform: 'none',
                fontSize: '16px',
              }}
            >
              Review & Continue
            </Button>
          </Stack>

          <AllocatorDialog
            open={open}
            handleClose={handleClose}
            platformAllocationMap={platformAllocationMap}
            setPlatformAllocationMap={setPlatformAllocationMap}
            totalAllocated={totalAllocated}
            formId={formId}
          />

          <SummaryDialog
            summaryOpen={summaryOpen}
            setSummaryOpen={setSummaryOpen}
            summaryFunds={sanitizedValues}
            totalAllocated={totalAllocated}
            handleAddAnother={handleAddAnother}
            handleCompleteAllocation={handleCompleteAllocation}
            loadingClient={loadingClient}
          />
        </Card>
      </Container>
    </Box>
  );
};

export default React.memo(FundAllocator);
