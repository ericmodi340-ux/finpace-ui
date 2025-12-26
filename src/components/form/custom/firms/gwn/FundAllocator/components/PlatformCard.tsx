import React, { useContext, useState } from 'react';
// @mui
import { Box, Card, SxProps } from '@mui/material';
// @types
import { Platform } from '../_@types';
// components
import Label from 'components/Label';
// sections
import PlatformModal from './PlatformModal';
// utils
import { FundAllocatorContext } from '../FundAllocator';

// ----------------------------------------------------------------------

type Props = {
  platform: Platform;
};

// ----------------------------------------------------------------------

const labelStyles: SxProps = {
  top: 16,
  right: 16,
  zIndex: 9,
  position: 'absolute',
  textTransform: 'uppercase',
};

const tierStyles: SxProps = {
  top: 16,
  left: 16,
  zIndex: 9,
  position: 'absolute',
  textTransform: 'uppercase',
  opacity: 0.8,
};

// ----------------------------------------------------------------------

const PlatformCard = ({ platform }: Props) => {
  const { name, logo, tier } = platform;
  const { platformAllocationMap } = useContext(FundAllocatorContext);

  const [openModal, setOpenModal] = useState(false);

  const models = Object.values(platformAllocationMap[name]);

  const hasFunds = models.some((model) => model.percentage !== 0);
  const fundsAllocated = models.reduce((a, b) => a + b.percentage, 0);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Card
        onClick={handleOpenModal}
        sx={{
          cursor: 'pointer',
          transition: '0.2s all',
          '&:hover': { marginTop: '-10px', marginBottom: '10px', transition: '0.2s all' },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1,
          }}
        >
          {hasFunds && fundsAllocated !== 0 && (
            <Label
              variant="filled"
              color={fundsAllocated < 0 || fundsAllocated > 100 ? 'error' : 'primary'}
              sx={labelStyles}
            >
              {fundsAllocated}%
            </Label>
          )}
          {tier && (
            <Label variant="filled" color={tier === 1 ? 'success' : 'warning'} sx={tierStyles}>
              Tier: {tier}
            </Label>
          )}
          <img src={logo} alt={name} style={{ maxHeight: '150px' }} />
        </Box>
      </Card>

      {openModal && <PlatformModal openModal handleClose={handleCloseModal} platform={platform} />}
    </>
  );
};

export default React.memo(PlatformCard);
