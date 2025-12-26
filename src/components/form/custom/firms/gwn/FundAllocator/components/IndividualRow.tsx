import { useEffect, useState, useRef, useContext } from 'react';
import {
  Stack,
  OutlinedInput,
  InputAdornment,
  TextField,
  IconButton,
  Autocomplete,
} from '@mui/material';
import Iconify from 'components/Iconify';
import { IndividualAllocationMap, IndividualRowType } from '../_@types';
import { API_BASE } from 'config';
import useForm from 'hooks/useForm';
import { FundAllocatorContext } from '../FundAllocator';
import { getTemplateModel } from '../_utils';

type Props = {
  row: IndividualRowType;
  handleRowChange: (rowId: string, newProperties: Partial<IndividualAllocationMap>) => void;
  handleDelete: (rowId: string) => void;
};

const IndividualRow = ({ row, handleRowChange, handleDelete }: Props) => {
  const [val, setVal] = useState(row.name);
  const [options, setOptions] = useState<IndividualRowType[]>([]);
  const timeoutRef = useRef<number | undefined>(undefined);
  const { formId } = useContext(FundAllocatorContext);

  const currentForm = useForm(formId);
  const { formTitle } = currentForm as any;
  const searchModel = getTemplateModel(formTitle);

  const handleChange = (newValue: IndividualRowType | null) => {
    const updatedRow = {
      name: newValue?.fullName || '',
      type: newValue?.type || 'fund',
      id: newValue?.value || '',
    };
    handleRowChange(row.rowId!, updatedRow);
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedRow = { percentage: parseInt(e.target.value || '0') };
    handleRowChange(row.rowId!, updatedRow);
  };

  const handleRowDelete = (rowId: string) => {
    handleDelete(rowId);
  };

  // Fetch data
  useEffect(() => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
    }

    if (val === '') {
      setOptions([]);
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      // TODO: remove hard coding for mapShortKit and base URL
      fetch(`${API_BASE}/gwn-models?model=${searchModel}&filter=${val}`)
        .then((response) => response.json())
        .then((items) => {
          if (items) {
            setOptions(items);
          }
        });
    }, 500);

    return () => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [searchModel, val]);

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'stretch', width: '100%', pt: 3 }}>
        <Autocomplete
          // @ts-ignore
          value={row.name}
          onChange={(_event, newValue) => {
            handleChange(newValue);
          }}
          onInputChange={(_, newInputValue) => {
            setVal(newInputValue);
          }}
          options={options}
          // @ts-ignore
          getOptionLabel={(option) => option.fullName ?? option}
          loadingText="Search for fund/ETF..."
          renderInput={(params) => (
            <TextField {...params} label="Search Fund/ETF" variant="outlined" />
          )}
          sx={{ flexGrow: 1 }}
        />
        <OutlinedInput
          endAdornment={<InputAdornment position="end">%</InputAdornment>}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            sx: { textAlign: 'center', minWidth: 22 },
          }}
          value={row.percentage}
          onChange={handlePercentageChange}
          sx={{ flexBasis: '15%', ml: 2 }}
        />

        <IconButton onClick={() => handleRowDelete(row.rowId!)}>
          <Iconify icon="eva:trash-2-outline" sx={{}} />
        </IconButton>
      </Stack>
    </>
  );
};

export default IndividualRow;
