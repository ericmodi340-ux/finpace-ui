import React, { useState, useCallback } from 'react';
import { Box, Typography, Tooltip, Popover, MenuItem, Stack } from '@mui/material';
import Iconify from 'components/Iconify';
import SignatureImage from './signature-image';

const SignatureSigner = ({
  preview,
  signature,
  onSignatureSelectOpen,
  isInitials = false,
  hideId,
  width = 130,
  height = 60,
}: {
  preview: boolean;
  signature: string;
  onSignatureSelectOpen: () => void;
  isInitials?: boolean;
  hideId?: boolean;
  width?: number;
  height?: number;
}) => {
  const [showSignature, setShowSignature] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const onSign = useCallback(() => {
    if (!signature) {
      onSignatureSelectOpen();
      return;
    }
    setShowSignature(true);
  }, [onSignatureSelectOpen, signature]);

  if (showSignature) {
    return (
      <>
        {/* @ts-ignore */}
        <Stack
          sx={{
            width: 'fit-content',
            borderRadius: 1,
            position: 'relative',
            ':hover': {
              outline: '2px dashed #000',
              cursor: 'pointer',
              '& .pencil-icon': {
                display: 'block',
              },
            },
            '& .pencil-icon': {
              display: 'none',
            },
          }}
          onClick={handleClick}
        >
          <Box component="a">
            <SignatureImage signature={signature} />
          </Box>
          <Iconify
            icon="mdi:pencil"
            className="pencil-icon"
            sx={{
              position: 'absolute',
              right: 5,
              top: 5,
            }}
          />
        </Stack>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <MenuItem onClick={onSignatureSelectOpen}>
            <Iconify icon="mdi:pencil-outline" sx={{ mr: 2 }} />
            Change Signature
          </MenuItem>
        </Popover>
      </>
    );
  }

  return (
    <Tooltip
      title={preview ? `User will sign here` : `Click to ${isInitials ? 'Initial' : 'Sign'}`}
    >
      <Box
        id="sign-now-button"
        component="button"
        onClick={onSign}
        disabled={preview}
        sx={{
          background: 'linear-gradient(to right, #2a9988, #005f84 )',
          color: '#fff',
          border: 'none',
          display: 'inline-flex',
          flexDirection: 'column',
          width,
          height,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 1,
          cursor: 'pointer',
          fontStyle: 'italic',
        }}
      >
        <Typography variant="h6">{isInitials ? 'Initial' : 'Sign'} Here</Typography>
      </Box>
    </Tooltip>
  );
};

export default React.memo(SignatureSigner);
