import React from 'react';
import { Stack, Button, useMediaQuery, Theme } from '@mui/material';

type EnvelopeFinalizationProps = {
  setAllowEnvelopeFinalization: any;
  onContinue: VoidFunction;
};

const EnvelopeFinalization: React.FC<EnvelopeFinalizationProps> = ({
  setAllowEnvelopeFinalization,
  onContinue,
}) => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const handleAllowEnvelopeFinalization = () => {
    setAllowEnvelopeFinalization(true);
    onContinue();
  };

  const handleDisallowEnvelopeFinalization = () => {
    setAllowEnvelopeFinalization(false);
    onContinue();
  };

  return (
    <>
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ my: 3 }}
      >
        <Button
          variant="outlined"
          color="info"
          size="large"
          onClick={handleDisallowEnvelopeFinalization}
          sx={{ textTransform: 'none', fontSize: '16px', width: 'fit-content', minWidth: '277px' }}
          data-test="round-trip-form-envelope-finalization-option-disallow"
        >
          No, send to client for review
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleAllowEnvelopeFinalization}
          sx={{ textTransform: 'none', fontSize: '16px', width: 'fit-content', minWidth: '277px' }}
          data-test="round-trip-form-envelope-finalization-option-allow"
        >
          Yes, complete now
        </Button>
      </Stack>
    </>
  );
};

export default EnvelopeFinalization;
