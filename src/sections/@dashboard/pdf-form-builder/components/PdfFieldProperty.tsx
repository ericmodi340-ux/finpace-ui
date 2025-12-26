import {
  Typography,
  Stack,
  TextField,
  Button,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Tooltip,
} from '@mui/material';
import Iconify from 'components/Iconify';
import { DASHBOARD_NAVBAR_WIDTH } from 'config';
import { addField, removeField, updateField } from 'redux/slices/formBuilder';
import { useDispatch, useSelector } from 'redux/store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getSignerColor } from '../utils/getSignerColor';
import { fieldTypes } from 'constants/fieldTypes';

// Helper function to get display name for signer
const getSignerDisplayName = (value: string): string => {
  switch (value) {
    case 'client_1':
      return 'Client 1';
    case 'client_2':
      return 'Client 2';
    case 'advisor':
      return 'Advisor';
    case 'firm':
      return 'Firm';
    default:
      return '';
  }
};

export default function PdfFieldProperty({ apiKeys }: { apiKeys: string[] }) {
  const { selectedFieldId, fields } = useSelector((state) => state.formBuilder);
  const componentRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  // Store copied field data
  const [copiedField, setCopiedField] = useState<any>(null);
  // Store api keys locally to ensure they're always available
  const [localApiKeys, setLocalApiKeys] = useState<string[]>([]);

  const selectedField = selectedFieldId ? fields[selectedFieldId] : null;

  // Update local API keys whenever apiKeys prop changes or on mount
  useEffect(() => {
    if (apiKeys && apiKeys.length > 0) {
      setLocalApiKeys(apiKeys);
    }
  }, [apiKeys]);

  // Keep a local state of current field key to ensure the autocomplete value is preserved
  const [currentFieldKey, setCurrentFieldKey] = useState<string>('');

  // Update the current field key whenever the selected field changes
  useEffect(() => {
    if (selectedField) {
      setCurrentFieldKey(selectedField.fieldKey || '');
    } else {
      setCurrentFieldKey('');
    }
  }, [selectedField]);

  // Local state for radio button value to prevent focus loss
  const [radioButtonValue, setRadioButtonValue] = useState<string>('');
  const radioButtonInputRef = useRef<HTMLInputElement>(null);

  // Update local radio button value when selected field changes
  useEffect(() => {
    if (selectedField?.type === 'radio-button') {
      setRadioButtonValue(selectedField?.custom?.radioButtonValue || '');
    }
  }, [selectedField]);

  const handleChangeProperties = (name: string, value: string) => {
    if (selectedField) {
      if (name === 'fieldKey') {
        setCurrentFieldKey(value);
      }
      dispatch(
        updateField({
          ...selectedField,
          id: selectedField?.id,
          [name]: value,
        })
      );
    }
  };

  const handleChangeOverlay = (name: string, value: number) => {
    if (selectedField) {
      dispatch(
        updateField({
          ...selectedField,
          id: selectedField?.id,
          overlay: {
            ...selectedField.overlay,
            [name]: value,
          },
        })
      );
    }
  };

  const handleChangeCustom = (name: string, value: string) => {
    if (selectedField) {
      // For radioButtonValue, we update local state first
      if (name === 'radioButtonValue') {
        setRadioButtonValue(value);
      }

      dispatch(
        updateField({
          ...selectedField,
          id: selectedField?.id,
          custom: {
            ...selectedField?.custom,
            [name]: value,
          },
        })
      );
    }
  };

  const handleChangeFieldType = (newType: string) => {
    if (selectedField) {
      dispatch(
        updateField({
          ...selectedField,
          id: selectedField?.id,
          type: newType as any,
        })
      );
    }
  };

  const handleDeleteField = useCallback(() => {
    if (selectedField) {
      dispatch(removeField(selectedField.id));
    }
  }, [dispatch, selectedField]);

  // Function to duplicate the current field
  const handleDuplicateField = useCallback(() => {
    if (selectedField) {
      const newField = {
        ...selectedField,
        id: `${selectedField.type}-${Date.now()}`,
        overlay: {
          ...selectedField.overlay,
          // Position the duplicated field slightly to the right and down
          x: selectedField.overlay.x + 20,
          y: selectedField.overlay.y + 20,
        },
      };
      dispatch(addField(newField));
    }
  }, [dispatch, selectedField]);

  // Function to copy field
  const handleCopyField = useCallback(() => {
    if (selectedField) {
      setCopiedField(selectedField);
    }
  }, [selectedField]);

  // Function to paste field
  const handlePasteField = useCallback(() => {
    if (copiedField) {
      const newField = {
        ...copiedField,
        id: `${copiedField.type}-${Date.now()}`,
        overlay: {
          ...copiedField.overlay,
          x: copiedField.overlay.x + 20,
          y: copiedField.overlay.y + 20,
        },
      };
      dispatch(addField(newField));
    }
  }, [dispatch, copiedField]);

  // Keyboard event handler with a ref to the component
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip processing keyboard shortcuts if focus is in a text input, textarea, or select
      const targetElement = e.target as HTMLElement;
      const isEditingText =
        targetElement.tagName === 'INPUT' ||
        targetElement.tagName === 'TEXTAREA' ||
        targetElement.tagName === 'SELECT' ||
        targetElement.isContentEditable;

      if (isEditingText) {
        // Don't interfere with normal text operations when user is editing
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedField) {
        // Prevent the default behavior and stop propagation for Delete or Backspace
        e.preventDefault();
        e.stopPropagation();
        handleDeleteField();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'c' && selectedField) {
        // Copy field (Ctrl+C or Cmd+C) only when not editing text
        e.preventDefault();
        handleCopyField();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'v' && copiedField) {
        // Paste field (Ctrl+V or Cmd+V) only when not editing text
        e.preventDefault();
        handlePasteField();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedField) {
        // Duplicate field (Ctrl+D or Cmd+D)
        e.preventDefault();
        handleDuplicateField();
      }
    },
    [
      handleDeleteField,
      handleCopyField,
      handlePasteField,
      handleDuplicateField,
      selectedField,
      copiedField,
    ]
  );

  // Add keyboard event listeners to the document
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true); // Use capture phase

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);

  // Focus trap to maintain focus on this component when field is selected
  useEffect(() => {
    if (selectedField && componentRef.current) {
      componentRef.current.focus();
    }
  }, [selectedField]);

  return (
    <Stack
      ref={componentRef}
      tabIndex={-1} // Makes the div focusable but not in the tab order
      onKeyDown={(e) => {
        // Handle keydown directly on the component, but skip if in text input
        const targetElement = e.target as HTMLElement;
        const isEditingText =
          targetElement.tagName === 'INPUT' ||
          targetElement.tagName === 'TEXTAREA' ||
          targetElement.tagName === 'SELECT' ||
          targetElement.isContentEditable;

        if (!isEditingText && (e.key === 'Delete' || e.key === 'Backspace') && selectedField) {
          e.preventDefault();
          e.stopPropagation();
          handleDeleteField();
        }
      }}
      sx={{
        width: DASHBOARD_NAVBAR_WIDTH,
        background: (theme) => theme.palette.background.paper,
        height: '100%',
        borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
        px: 3,
        py: 2,
        outline: 'none', // Remove the focus outline
      }}
    >
      {!selectedField ? (
        <Typography variant="subtitle2">No field selected</Typography>
      ) : (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2">Fields Property</Typography>
          </Stack>
          <Stack spacing={2}>
            <FormControl size="small">
              <InputLabel id="field-type-label">Field Type</InputLabel>
              <Select
                labelId="field-type-label"
                value={selectedField?.type}
                onChange={(e) => handleChangeFieldType(e.target.value)}
                size="small"
                label="Field Type"
              >
                {fieldTypes.map((fieldType) => (
                  <MenuItem key={fieldType.type} value={fieldType.type}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {fieldType.icon}
                      <span>{fieldType.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(selectedField.type === 'initial' ||
              selectedField.type === 'signature' ||
              selectedField.type === 'date-signed') && (
              <FormControl size="small">
                <InputLabel id={'signerLabel'}>Signer</InputLabel>
                <Select
                  labelId="signerLabel"
                  value={selectedField?.custom?.signer}
                  onChange={(e) => handleChangeCustom('signer', e.target.value)}
                  size="small"
                  label="Signer"
                  renderValue={(value) => (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: getSignerColor(value as string, 0.6),
                        }}
                      />
                      <Typography>{getSignerDisplayName(value as string)}</Typography>
                    </Stack>
                  )}
                >
                  <MenuItem value="client_1">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: getSignerColor('client_1', 0.6),
                        }}
                      />
                      <span>Client 1</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="client_2">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: getSignerColor('client_2', 0.6),
                        }}
                      />
                      <span>Client 2</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="advisor">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: getSignerColor('advisor', 0.6),
                        }}
                      />
                      <span>Advisor</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="firm">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: getSignerColor('firm', 0.6),
                        }}
                      />
                      <span>Firm</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
            )}

            <Autocomplete
              freeSolo
              options={localApiKeys.length > 0 ? localApiKeys : apiKeys || []}
              value={selectedField?.fieldKey || ''}
              disableClearable={false}
              blurOnSelect={false}
              onBlur={() => {
                if (currentFieldKey) {
                  handleChangeProperties('fieldKey', currentFieldKey);
                }
              }}
              openOnFocus
              onChange={(_, newValue) => {
                if (newValue) {
                  handleChangeProperties('fieldKey', newValue);
                }
              }}
              onInputChange={(_, newInputValue) => {
                setCurrentFieldKey(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Field Key"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    autoComplete: 'off', // Disable browser's autocomplete
                  }}
                  // inputProps={{
                  //   ...params.inputProps,
                  //   onFocus: (e) => {
                  //     setTimeout(() => {
                  //       e.target.select();
                  //     }, 0);
                  //   },
                  // }}
                />
              )}
            />
            {selectedField.type === 'date-signed' && (
              <TextField
                label="Date Format"
                value={selectedField?.custom?.dateFormat}
                size="small"
                fullWidth
                onChange={(e) => handleChangeCustom('dateFormat', e.target.value)}
              />
            )}
            {selectedField.type === 'radio-button' && (
              <TextField
                label="Radio Button Value"
                value={radioButtonValue}
                size="small"
                fullWidth
                inputRef={radioButtonInputRef}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setRadioButtonValue(newValue);
                }}
                onBlur={() => {
                  handleChangeCustom('radioButtonValue', radioButtonValue);
                }}
                inputProps={{
                  // Prevent re-render from causing focus loss
                  onKeyDown: (e) => {
                    if (e.key === 'Enter') {
                      handleChangeCustom('radioButtonValue', radioButtonValue);
                      radioButtonInputRef.current?.blur();
                    }
                  },
                }}
              />
            )}
          </Stack>
          <Typography variant="subtitle2">Fields Position</Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              <TextField
                label="x"
                value={Math.round(selectedField?.overlay.x)}
                size="small"
                fullWidth
                type="number"
                onChange={(e) => handleChangeOverlay('x', Number(e.target.value))}
              />
              <TextField
                label="y"
                value={Math.round(selectedField?.overlay.y)}
                size="small"
                fullWidth
                type="number"
                onChange={(e) => handleChangeOverlay('y', Number(e.target.value))}
              />
            </Stack>
            <TextField
              label="Page"
              value={selectedField?.overlay.page}
              size="small"
              fullWidth
              type="number"
              onChange={(e) => handleChangeOverlay('page', Number(e.target.value))}
            />
          </Stack>
          <Stack spacing={2}>
            <Typography variant="subtitle2">Field Size</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label="Width"
                value={Math.round(selectedField?.overlay.width)}
                size="small"
                fullWidth
                type="number"
                onChange={(e) => handleChangeOverlay('width', Number(e.target.value))}
              />
              <span>x</span>
              <TextField
                label="Height"
                value={Math.round(selectedField?.overlay.height)}
                size="small"
                fullWidth
                type="number"
                onChange={(e) => handleChangeOverlay('height', Number(e.target.value))}
              />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Duplicate field (Ctrl+D)">
              <Button
                variant="outlined"
                size="small"
                color="primary"
                onClick={handleDuplicateField}
              >
                <Iconify icon="mdi:content-duplicate" />
              </Button>
            </Tooltip>
            <Tooltip title="Delete field (Delete)">
              <Button variant="outlined" size="small" color="error" onClick={handleDeleteField}>
                <Iconify icon="eva:trash-2-outline" />
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
