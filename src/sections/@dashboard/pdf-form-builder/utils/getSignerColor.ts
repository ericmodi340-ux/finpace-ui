import { alpha } from '@mui/material';

type SignerType = 'client_1' | 'client_2' | 'advisor' | 'firm' | string | undefined;

export const getSignerColor = (signer: SignerType, opacity: number = 0.2) => {
  switch (signer) {
    case 'client_1':
      return alpha('#2196f3', opacity); // Blue for client 1
    case 'client_2':
      return alpha('#4caf50', opacity); // Green for client 2
    case 'advisor':
      return alpha('#e91e63', opacity); // Pink/Magenta for advisor
    case 'firm':
      return alpha('#ff5722', opacity); // Deep Orange for firm
    default:
      return 'transparent';
  }
};
