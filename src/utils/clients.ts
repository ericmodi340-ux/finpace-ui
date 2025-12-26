import { ClientManager } from '../@types/client';
import { IntegrationServiceId, IntegrationOwner } from '../@types/integration';

// ----------------------------------------------------------------------

export function getClientName({
  first,
  middle,
  last,
}: {
  first?: string;
  middle?: string;
  last?: string;
}) {
  let name = '';

  if (first) {
    name += `${first} `;
  }

  if (middle) {
    name += `${middle} `;
  }

  if (last) {
    name += `${last} `;
  }

  return name.trim();
}

export function getClientCompositeName(client: ClientManager) {
  if (!client) return;

  let clientName = '';

  //Check if the name isn't white spaces
  if (client.name && client.name?.trim().length) {
    clientName += client.name;
  } else if (client.custom?.name) {
    clientName += client.custom?.name;
  }

  if (client.includeSecondInvestor && client.second_investor_name) {
    clientName += ` & ${client.second_investor_name}`;
  } else if (client.includeSecondInvestor && client.custom?.second_investor_name) {
    clientName += ` & ${client.custom?.second_investor_name}`;
  }

  return clientName;
}

export function getClientTypeName(client: ClientManager) {
  if (!client) return;
  return client.isProspect ? 'Prospect' : 'Client';
}

export function getIntegrationLastPushedAt(
  client: ClientManager,
  serviceId: IntegrationServiceId,
  integrationOwner: IntegrationOwner
) {
  return client?.integrationPushedAt?.[serviceId]?.[integrationOwner] || null;
}
