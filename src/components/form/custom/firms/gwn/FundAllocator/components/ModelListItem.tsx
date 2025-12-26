import { useContext } from 'react';
// @mui
import { InputAdornment, ListItem, ListItemText, OutlinedInput } from '@mui/material';
// @types
import { FundAllocatorContext } from '../FundAllocator';

// ----------------------------------------------------------------------

export default function ModelListItem({ platformName, model }: any) {
  const { setPlatformAllocationMap } = useContext(FundAllocatorContext);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mute prev state
    setPlatformAllocationMap((prev) => ({
      ...prev,
      [platformName]: {
        ...prev[platformName],
        [model.name]: {
          ...prev[platformName][model.name],
          percentage: parseInt(e.target.value) || 0,
        },
      },
    }));
  };

  return (
    <ListItem key={model.id} sx={{ py: 2 }} className="formio-form">
      <ListItemText
        primary={model.name}
        secondary={model.id}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          '& > *': {
            px: 1,
          },
          '& > .MuiListItemText-primary': {
            fontWeight: 'bold',
            flexGrow: 1,
          },
          '& > .MuiListItemText-secondary': {
            mb: 0,
          },
        }}
      />
      <OutlinedInput
        value={model.percentage || 0}
        onChange={handleChange}
        endAdornment={<InputAdornment position="end">%</InputAdornment>}
        inputProps={{
          inputMode: 'numeric',
          pattern: '[0-9]*',
          sx: { textAlign: 'center', p: 1 },
        }}
        sx={{ flexBasis: '15%', ml: 2 }}
      />
    </ListItem>
  );
}
