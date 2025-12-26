import { InputAdornment, Stack, TextField, IconButton, Tooltip } from '@mui/material';
import Iconify from 'components/Iconify';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'redux/store';

export default function ZapierForm() {
  const { firm } = useSelector((state) => state.firm);
  const { user } = useSelector((state) => state.user);

  const base64String = useMemo(() => btoa(`${firm.id}::${user?.id}`), [firm, user]);

  const onClick = useCallback(() => {
    navigator.clipboard.writeText(base64String);
  }, [base64String]);

  return (
    <Stack>
      <TextField
        label="Finpace Api Key"
        value={base64String}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Copy to clipboard">
                <IconButton onClick={onClick}>
                  <Iconify icon="mdi:clipboard-outline" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  );
}
