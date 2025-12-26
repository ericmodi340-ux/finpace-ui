// @mui
import { Box } from '@mui/material';
// @types
import { IntegrationService } from '../../../../@types/integration';
// sections
import IntegrationCard from './Card';
// hooks
import useEditingIntegrations from 'hooks/useEditingIntegrations';
// constants
import { roles } from 'constants/users';

type Props = {
  list: IntegrationService[];
  isAdvisorTab?: boolean;
};

export default function IntegrationsList({ list, isAdvisorTab = false }: Props) {
  const { type } = useEditingIntegrations();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        alignItems: 'stretch',
        gridAutoRows: '1fr',
      }}
    >
      {list.map((service) => (
        <IntegrationCard key={service.id} service={service} isAdvisorTab={isAdvisorTab} />
      ))}
      {type === roles.ADVISOR && (
        <IntegrationCard
          service={{
            id: 'request-integration',
            name: 'Request an integration',
            image: '',
            imageWhite: '',
            isAvailable: true,
          }}
        />
      )}
    </Box>
  );
}
