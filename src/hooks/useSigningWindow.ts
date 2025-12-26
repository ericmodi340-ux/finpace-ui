import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
// redux
import { getSigningUrl } from '../redux/slices/envelopes';
import { EnvelopeManager } from '../@types/envelope';
import { envelopeRecipientStatuses } from '../constants/envelopes';

const useSigningWindow = (
  envelope: EnvelopeManager | undefined
): {
  urlLoading: boolean;
  currentSigner: string;
  openSigningWindow: Promise<undefined>;
  signingWindows: any;
  currentRoleName: string;
} => {
  const { enqueueSnackbar } = useSnackbar();
  const [urlLoading, setUrlLoading] = useState<boolean>(false);
  const [currentSigner, setCurrentSigner] = useState<string>('');
  const [currentRoleName, setCurrentRoleName] = useState<string>('');
  const [signingWindows, setSigningWindow] = useState<any>({});

  // Handle closing of signing windows from PubSub
  useEffect(() => {
    Object.keys(signingWindows).forEach((signerId) => {
      if (
        envelope?.recipients?.[signerId]?.status === envelopeRecipientStatuses.SIGNED &&
        !signingWindows[signerId].closed
      ) {
        signingWindows[signerId].close();
        const newSigningWindows = signingWindows;
        delete newSigningWindows[signerId];
        setSigningWindow(newSigningWindows);
      }
    });
  }, [signingWindows, envelope]);

  const openSigningWindow = async (
    roleName: string = '',
    recipientId: string = ''
  ): Promise<undefined> => {
    if (!envelope) {
      enqueueSnackbar('Something went wrong - envelope not found', { variant: 'error' });
      return;
    }

    setUrlLoading(true);
    setCurrentSigner(recipientId);
    setCurrentRoleName(roleName);
    const { recipients } = envelope;
    const signer = recipients[roleName];
    const role = signer ? signer.roleName : '';

    try {
      const signingUrl = await getSigningUrl(envelope.id || '', role);
      if (signingUrl.url) {
        const currentWindow = window.open(
          signingUrl.url,
          roleName,
          'scrollbars,width=' + window.innerWidth * 0.8 + ',height=' + window.innerHeight * 0.8
        );

        setTimeout(function () {
          // Check if popup blocker is enabled
          if (!currentWindow || currentWindow.outerHeight === 0) {
            //First Checking Condition Works For IE & Firefox
            //Second Checking Condition Works For Chrome
            enqueueSnackbar(
              'Popup Blocker is enabled! Please add this site to your exception list.',
              {
                variant: 'error',
              }
            );
            setCurrentSigner('');
            setCurrentRoleName('');
            setUrlLoading(false);
          } else {
            setSigningWindow((oldSigningWindows: any) => ({
              ...oldSigningWindows,
              [roleName]: currentWindow,
            }));
          }
        }, 250);

        // Manage closing of window
        const timer = setInterval(function () {
          if (currentWindow && currentWindow.closed) {
            clearInterval(timer);
            setCurrentSigner('');
            setUrlLoading(false);
          }
        }, 1000);
      }
    } catch (err) {
      setCurrentRoleName('');
      setCurrentSigner('');
      setUrlLoading(false);
      console.error('Error obtaining signing link:', err);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };
  //@ts-ignore
  return { urlLoading, currentSigner, currentRoleName, openSigningWindow, signingWindows };
};

export default useSigningWindow;
