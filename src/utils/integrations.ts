import { IntegrationServiceId } from '../@types/integration';
import { services } from 'constants/integrations';

// ----------------------------------------------------------------------

export function getServiceName(serviceId: IntegrationServiceId) {
  if (!serviceId) return '';
  return services.find((service) => service.id === serviceId)?.name || '';
}
