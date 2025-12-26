import { ClientManager } from '../@types/client';

export function getTotalAumFromCLients(clients: ClientManager[]): number {
  return clients.reduce((acc, client) => acc + Number(client.aum || 0), 0);
}
