import React, { useContext } from 'react';
// @mui
import { Box } from '@mui/material';
// @types
// sections
import PlatformCard from './PlatformCard';
// constants
import { ALLOWED_ADVISORS, HUTTO_DEAN, PLATFORMS } from '../_constants';
import IndividualCard from './IndividualCard';
import useForm from 'hooks/useForm';
import { FundAllocatorContext } from '../FundAllocator';
import useUser from 'hooks/useUser';
import { firmIds } from 'constants/firms';
import { getPlatforms } from '../_utils';

// ----------------------------------------------------------------------

const PlatformList = () => {
  const { user: currentUser } = useUser();
  const { formId } = useContext(FundAllocatorContext);
  const currentForm = useForm(formId);
  const { formTitle } = currentForm as any;

  switch (currentUser?.firmId) {
    case firmIds.GWN:
    case '2a12159d-d50b-4f07-a651-ab501f1ce094':
      // Add models on specific advisor
      switch (currentUser.id) {
        case ALLOWED_ADVISORS.HUTTO_DEAN:
        case ALLOWED_ADVISORS.MICHAEL_ZACKA:
        case ALLOWED_ADVISORS.DEV_TEST:
          // Check if model is already added
          const modelExist = PLATFORMS.findIndex((model) => model.name === HUTTO_DEAN.name);
          if (modelExist === -1) {
            PLATFORMS.push(HUTTO_DEAN);
          }
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        alignItems: 'stretch',
        gridAutoRows: '1fr',
      }}
    >
      {getPlatforms(formTitle).map((platform, idx) => (
        <PlatformCard key={idx} platform={platform} />
      ))}
      <IndividualCard />
    </Box>
  );
};

export default React.memo(PlatformList);
