import React from 'react';
import { InputAdornment, MenuItem, Typography, Tooltip, Stack, IconButton } from '@mui/material';

import { RHFSelect, RHFTextField, RHFCheckbox } from 'components/hook-form';

import { CustomField } from '../../../../@types/custom-fields';
import RHFDatePicker from 'components/hook-form/RHFDatePicker';
import { useFormContext } from 'react-hook-form';
import { currencyMask, phoneMask } from 'utils/masks';
import Iconify from 'components/Iconify';

export default function DynamicCustomField({
  data,
  keyPrefix,
}: {
  data: CustomField;
  keyPrefix?: string;
}) {
  const key = keyPrefix ? `${keyPrefix}.${data.key}` : data.key;

  const fieldName = data.isRequired ? `${data.fieldName}*` : data.fieldName;

  const { watch } = useFormContext();

  if (data.isHidden) return null;

  if (data.inputType === 'heading') {
    return <Typography variant="subtitle1">{data.fieldName}</Typography>;
  }

  // Helper function to render tooltip icon
  const renderTooltipIcon = () => {
    if (!data.tooltipText) return null;

    return (
      <Tooltip title={data.tooltipText} arrow>
        <IconButton
          size="small"
          sx={{
            p: 0.25,
            ml: 0.5,
            color: 'text.secondary',
          }}
          disableRipple
        >
          <Iconify
            icon="mdi:information-outline"
            sx={{
              fontSize: 16,
            }}
          />
        </IconButton>
      </Tooltip>
    );
  };

  // Helper function to wrap field with custom label that includes tooltip
  const wrapFieldWithTooltip = (field: React.ReactElement) => {
    if (!data.tooltipText) return field;

    return (
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center">
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
              fontWeight: 400,
            }}
          >
            {fieldName}
          </Typography>
          {renderTooltipIcon()}
        </Stack>
        {React.cloneElement(field, { label: undefined })}
      </Stack>
    );
  };

  if (data.inputType === 'textfield' || data.inputType === 'email') {
    const textField = (
      <RHFTextField name={key} label={fieldName} helperText={data?.helpText || ''} />
    );
    return wrapFieldWithTooltip(textField);
  }

  if (data.inputType === 'phone') {
    const phoneField = (
      <RHFTextField
        mask={phoneMask}
        name={key}
        label={fieldName}
        helperText={data?.helpText || ''}
      />
    );
    return wrapFieldWithTooltip(phoneField);
  }

  if (data.inputType === 'currency') {
    const currencyField = (
      <RHFTextField
        name={key}
        value={currencyMask(watch(key))}
        label={fieldName}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="mdi:dollar" />
            </InputAdornment>
          ),
        }}
        helperText={data?.helpText || ''}
      />
    );
    return wrapFieldWithTooltip(currencyField);
  }

  if (data.inputType === 'date') {
    const dateComponent = <RHFDatePicker name={key} label={fieldName} />;
    return wrapFieldWithTooltip(dateComponent);
  }

  if (data.inputType === 'select') {
    const selectField = (
      <RHFSelect name={key} label={fieldName} helperText={data?.helpText || ''}>
        {data?.options?.map((option, i) => (
          <MenuItem key={i} value={option.value}>
            {option.value}
          </MenuItem>
        ))}
      </RHFSelect>
    );
    return wrapFieldWithTooltip(selectField);
  }

  if (data.inputType === 'checkbox') {
    const checkboxComponent = <RHFCheckbox name={key} label={fieldName} />;
    return wrapFieldWithTooltip(checkboxComponent);
  }

  return null;
}
