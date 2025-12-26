// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Tooltip } from '@mui/material';
// @types
import { EnvelopeDeliveryMethod } from '../../../../../@types/envelope';
// components
import Iconify from 'components/Iconify';
import { envelopeDeliveryMethods } from 'constants/envelopes';

// ----------------------------------------------------------------------

type Props = {
  deliveryMethod: EnvelopeDeliveryMethod;
};

export default function DeliveryMethodCell({ deliveryMethod }: Props) {
  const theme = useTheme();

  return (
    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <Tooltip
        title={
          (deliveryMethod === envelopeDeliveryMethods.EMAIL && 'Signing over email') ||
          (deliveryMethod === envelopeDeliveryMethods.EMBEDDED && 'In-person signing') ||
          ''
        }
      >
        <span>
          <Iconify
            icon={
              (deliveryMethod === envelopeDeliveryMethods.EMAIL && 'ic:round-email') ||
              (deliveryMethod === envelopeDeliveryMethods.EMBEDDED && 'fa6-solid:file-signature') ||
              ''
            }
            width={24}
            height={24}
            color={theme.palette.divider}
          />
        </span>
      </Tooltip>
    </Box>
  );
}
