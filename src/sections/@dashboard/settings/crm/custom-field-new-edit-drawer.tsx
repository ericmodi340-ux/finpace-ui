import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray, useFormContext } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Drawer,
  Button,
  MenuItem,
  IconButton,
  Typography,
  DrawerProps,
} from '@mui/material';

import Iconify from 'components/Iconify';
import FormProvider, { RHFSelect, RHFSwitch, RHFTextField } from 'components/hook-form';
import { CustomField } from '../../../../@types/custom-fields';

type Props = DrawerProps & {
  onClose: () => void;
  fieldData?: CustomField;
  onSave: (data: CustomField) => void;
};

export default function CustomFieldNewEditDrawer({ fieldData, onClose, onSave, ...props }: Props) {
  const schema = Yup.object().shape({
    inputType: Yup.string()
      .oneOf(['textfield', 'select', 'checkbox', 'email', 'phone', 'currency', 'date', 'heading'])
      .required('Input Type is required'),
    fieldName: Yup.string().required('Field Name is required'),
    fieldKey: Yup.string().required('Field Key is required'),
    isRequired: Yup.boolean(),
    column: Yup.number().required(),
    helpText: Yup.string(),
    tooltipText: Yup.string(),
    defaultValue: Yup.string(),
    isHidden: Yup.boolean(),
    options: Yup.array().of(Yup.object().shape({ value: Yup.string() })),
  });

  const defaultValues = useMemo(
    () => ({
      inputType: fieldData?.inputType || 'textfield',
      fieldName: fieldData?.fieldName || '',
      fieldKey: fieldData?.key || '',
      isRequired: fieldData?.isRequired || false,
      column: fieldData?.column || 12,
      defaultValue: fieldData?.defaultValue || '',
      helpText: fieldData?.helpText || '',
      tooltipText: fieldData?.tooltipText || '',
      isHidden: fieldData?.isHidden || false,
      options: fieldData?.options || [
        {
          value: '',
        },
      ],
    }),
    [fieldData]
  );

  const methods = useForm({
    defaultValues,
    // @ts-ignore
    resolver: yupResolver(schema),
  });

  const {
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isDirty },
  } = methods;

  // Generate a random key for heading type
  const inputType = watch('inputType');
  useEffect(() => {
    if (inputType === 'heading' && !fieldData) {
      setValue('fieldKey', `heading_${uuid().substring(0, 8)}`, { shouldDirty: true });
      setValue('isRequired', false, { shouldDirty: true });
      setValue('defaultValue', '', { shouldDirty: true });
    }
  }, [inputType, setValue, fieldData]);

  const onSubmit = handleSubmit(async (data) => {
    onSave({
      key: data.fieldKey,
      ...data,
    });
    reset();
  });

  return (
    <Drawer
      anchor="right"
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
        },
      }}
      onClose={() => {
        if (isDirty) {
          if (window.confirm('Are you sure you want to discard this field?')) {
            onClose();
            reset();
          }
        }
        reset();
        onClose();
      }}
      {...props}
    >
      <Stack mt={1} p={2}>
        <Stack pb={1} flexDirection="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1">
            <span>{fieldData ? 'Edit Field' : 'Add Field'} </span>
          </Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Stack mt={1}>
            <RHFTextField
              name="fieldName"
              label={watch('inputType') === 'heading' ? 'Title' : 'Field Name'}
            />
            {watch('inputType') !== 'heading' && (
              <RHFTextField
                sx={{
                  mt: 2,
                }}
                name="fieldKey"
                label="Field Key"
              />
            )}
            <RHFSelect
              sx={{
                mt: 2,
              }}
              name="inputType"
              label="Input Type"
            >
              <MenuItem value="textfield">Textfield</MenuItem>
              <MenuItem value="phone">Phone Number</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="select">Select</MenuItem>
              <MenuItem value="checkbox">Checkbox</MenuItem>
              <MenuItem value="currency">Currency</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="heading">Heading</MenuItem>
            </RHFSelect>
            {watch('inputType') === 'select' && <ExpendableOptions />}
            {watch('inputType') === 'textfield' && (
              <RHFTextField
                sx={{
                  mt: 2,
                }}
                name="defaultValue"
                label="Default Value"
              />
            )}
            {watch('inputType') !== 'heading' && (
              <RHFTextField
                sx={{
                  mt: 2,
                }}
                name="helpText"
                label="Help Text"
              />
            )}
            {watch('inputType') !== 'heading' && (
              <RHFTextField
                sx={{
                  mt: 2,
                }}
                name="tooltipText"
                label="Tooltip Text"
                placeholder="Text to show in tooltip when hovering info icon"
              />
            )}
            <RHFSelect
              sx={{
                mt: 3,
              }}
              name="column"
              label="Column"
            >
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={6}>6</MenuItem>
              <MenuItem value={4}>4</MenuItem>
            </RHFSelect>
            {watch('inputType') !== 'heading' && (
              <RHFSwitch
                sx={{
                  mt: 1,
                }}
                name="isRequired"
                label="Is Required"
              />
            )}
            <RHFSwitch
              sx={{
                mt: 1,
              }}
              name="isHidden"
              label="Keep this field hidden from client"
            />
            <Stack flexDirection="row" justifyContent="flex-end" mt={3} spacing={1}>
              <LoadingButton
                onClick={onSubmit}
                sx={{
                  width: 150,
                }}
                variant="contained"
              >
                {fieldData ? 'Update Field' : 'Add Field'}
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>
      </Stack>
    </Drawer>
  );
}

function ExpendableOptions() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  return (
    <Stack mt={3} spacing={3}>
      {fields.map((item, index) => (
        <Stack alignItems="center" flexDirection="row" key={item.id || index} spacing={2}>
          <RHFTextField fullWidth name={`options.${index}.value`} label={`Option ${index + 1}`} />
          {fields.length > 1 && (
            <IconButton onClick={() => remove(index)}>
              <Iconify icon="mdi:close" />
            </IconButton>
          )}
        </Stack>
      ))}
      <Stack flexDirection="row" justifyContent="flex-end" spacing={1}>
        <Button
          variant="outlined"
          onClick={() =>
            append({
              value: '',
            })
          }
        >
          Add Option
        </Button>
      </Stack>
    </Stack>
  );
}
