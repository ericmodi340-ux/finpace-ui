import {
  MenuItem,
  Box,
  Select,
  FormControl,
  InputLabel,
  ListItemText,
  DialogContent,
} from '@mui/material';
// constants
import { useState } from 'react';
import ImportSingleClient from './ImportSingleClient';
import ImportMultipleClient from './ImportMultipleClient';

export default function CmsSelect({
  onContinue,
  handleSetOption,
  currentOptions,
  isProspect = false,
}: {
  onContinue: VoidFunction;
  handleSetOption: (updateOption: any) => void;
  currentOptions: any;
  isProspect?: boolean;
}) {
  const [importType, setImportType] = useState<'single' | 'multiple'>('single');

  return (
    <Box>
      <DialogContent>
        <FormControl fullWidth>
          <InputLabel id="import-type">Import Type</InputLabel>
          <Select
            labelId="import-type"
            value={importType}
            label="Import Type"
            onChange={(e) => setImportType(e.target.value as any)}
            variant="outlined"
          >
            <MenuItem value="single">
              <ListItemText>Single Client</ListItemText>
            </MenuItem>
            <MenuItem value="multiple">
              <ListItemText>Multiple Clients</ListItemText>
            </MenuItem>
          </Select>
        </FormControl>
        {importType === 'single' && (
          <ImportSingleClient
            onContinue={onContinue}
            handleSetOption={handleSetOption}
            currentOptions={currentOptions}
            isProspect={isProspect}
          />
        )}
        {importType === 'multiple' && (
          <ImportMultipleClient
            onContinue={onContinue}
            handleSetOption={handleSetOption}
            currentOptions={currentOptions}
            isProspect={isProspect}
          />
        )}
      </DialogContent>
    </Box>
  );
}
