import { useRef, useState } from 'react';
// @mui
import { Menu, MenuItem, IconButton } from '@mui/material';
// components
import Iconify from 'components/Iconify';

// ----------------------------------------------------------------------

type Props = {
  onDelete: VoidFunction;
};

export default function DisclosureMoreMenu({ onDelete }: Props) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

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
          sx: { px: 1, width: 200, color: 'text.secondary' },
        }}
      >
        <MenuItem onClick={onDelete} sx={{ borderRadius: 1, typography: 'body2' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2, width: 24, height: 24 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
