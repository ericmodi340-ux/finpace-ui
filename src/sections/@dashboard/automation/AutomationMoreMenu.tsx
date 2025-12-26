import { useRef, useState } from 'react';
// @mui
import { Menu, MenuItem, IconButton } from '@mui/material';
// components
import Iconify from 'components/Iconify';
import { AutomationConfig } from '../../../@types/automation';
import { getStorageItem } from 'redux/slices/storage';

// ----------------------------------------------------------------------

type Props = {
  automation: AutomationConfig;
  isLoading: boolean;
};

export default function AutomationMoreMenu(props: Props) {
  //   const { enqueueSnackbar } = useSnackbar();
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  //   const [loading, setLoading] = useState(false);

  const handleAutomationDownload = async () => {
    const response = await getStorageItem({
      path: `firms/${props.automation?.firmId}/automation-dumps/${props.automation?.id}.json`,
    });
    // download file
    if (response) {
      const link = document.createElement('a');
      link.href = response;
      link.setAttribute('download', `${props.automation?.id}.json`);
      document.body.appendChild(link);
      link.click();
    }
  };

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Iconify icon={'eva:more-vertical-fill'} width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { px: 1, width: '250', color: 'text.secondary' },
        }}
      >
        <MenuItem
          onClick={() => handleAutomationDownload()}
          sx={{ borderRadius: 1, typography: 'body2' }}
        >
          <Iconify icon={'eva:download-outline'} sx={{ mr: 2, width: 24, height: 24 }} />
          Download Results
        </MenuItem>

        <MenuItem disabled sx={{ borderRadius: 1, typography: 'body2' }}>
          <Iconify icon={'eva:close-outline'} sx={{ mr: 2, width: 24, height: 24 }} />
          Cancel Automation
        </MenuItem>
      </Menu>
    </>
  );
}
