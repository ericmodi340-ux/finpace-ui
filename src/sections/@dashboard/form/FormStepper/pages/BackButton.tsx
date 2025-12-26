import { IconButton } from '@mui/material';
import Iconify from 'components/Iconify';

type BackButtonProps = {
  onBack: () => void;
  disabled?: boolean;
};

function BackButton({ onBack }: BackButtonProps) {
  return (
    <>
      <IconButton
        href=""
        target="_blank"
        size="large"
        onClick={onBack}
        className="backButton"
        sx={{
          width: 'fit-content',
          alignSelf: 'center',
          background: 'rgba(99, 115, 129, 0.08);',
          '&:hover': {
            // linear gradient to right #000007 #00273F
            background: 'linear-gradient(12deg, rgba(0,0,7,1) 0%, rgba(0,39,63,1) 100%)',
            color: '#ffffff',
          },
        }}
      >
        <Iconify icon={'eva:arrow-left-fill'} />
      </IconButton>
    </>
  );
}

export default BackButton;
