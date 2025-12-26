import { useState, useRef, useEffect, memo, useCallback } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Tooltip,
  Stack,
} from '@mui/material';
import Markdown from 'react-markdown';
import { esignTerms } from './esign-terms';
import LogoIcon from 'components/LogoIcon';
import { useSelector } from 'redux/store';
import './signing-modal.css';
import { useRouter } from 'routes/use-router';

const SignatureDisclosersModal = ({
  isOpen,
  onAgree,
}: {
  isOpen: boolean;
  onAgree: () => void;
}) => {
  const { firm } = useSelector((state) => state.firm);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const contentRef = useRef(null);
  const { back } = useRouter();

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setIsButtonEnabled(true);
      }
    }
  };

  useEffect(() => {
    setIsButtonEnabled(false);
  }, [isOpen]);

  const replacePlaceholders = useCallback(
    (inputString: string) => {
      // Replace all occurrences of {{data.firmName}} with firm.name
      let resultString = inputString.replace(/{{data\.firmName}}/g, firm.name);

      // Replace all occurrences of {{data.firmEmail}} with firm.email
      resultString = resultString.replace(/{{data\.firmEmail}}/g, firm.email);

      return resultString;
    },
    [firm]
  );

  return (
    <Dialog
      open={isOpen}
      maxWidth="md"
      scroll="paper"
      sx={{
        maxHeight: 700,
      }}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <DialogTitle
          sx={{
            position: 'relative',
          }}
          id="scroll-dialog-title"
        >
          Electronic Signature Consent and Disclosure
        </DialogTitle>
        <LogoIcon
          height={35}
          sx={{
            mr: 3,
          }}
        />
      </Stack>

      <DialogContent
        sx={{
          background: (theme) => theme.palette.background.neutral,
          px: 3,
          mt: 2,
        }}
        dividers={true}
        ref={contentRef}
        onScroll={handleScroll}
      >
        <Markdown className="line-break markdown">
          {/* find and replace all {{data.firmName}} with firm.name and {{data.firmEmail}} with firm.email */}
          {replacePlaceholders(esignTerms)}
        </Markdown>
      </DialogContent>
      <DialogActions>
        <Button variant={'outlined'} onClick={back}>
          Cancel
        </Button>
        <Tooltip title={!isButtonEnabled ? 'Scroll to bottom to agree' : 'Agree and Continue'}>
          <span>
            <Button
              variant={!isButtonEnabled ? 'outlined' : 'contained'}
              onClick={onAgree}
              disabled={!isButtonEnabled}
            >
              Agree and Continue
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default memo(SignatureDisclosersModal);
