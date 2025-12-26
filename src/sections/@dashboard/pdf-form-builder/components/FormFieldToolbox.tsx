import { Stack, Typography } from '@mui/material';
import { DASHBOARD_HEADER_DESKTOP, DASHBOARD_NAVBAR_WIDTH } from 'config';
import { fieldTypes } from 'constants/fieldTypes';
import React from 'react';
import { DraggableFieldItem } from './DraggableFieldItem';
import Scrollbar from 'components/Scrollbar';
// import { useDispatch, useSelector } from 'redux/store';
// import { setSelectedField } from 'redux/slices/formBuilder';

export default function FormFieldToolbox() {
  //   const { fields, selectedFieldId } = useSelector((state) => state.formBuilder);

  //   const dispatch = useDispatch();

  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('fieldType', type);
    // Clear any existing selection
    e.dataTransfer.setData('fieldId', '');
  };

  return (
    <Stack
      sx={{
        width: DASHBOARD_NAVBAR_WIDTH,
        background: (theme) => theme.palette.background.paper,
        height: `calc(100vh - ${DASHBOARD_HEADER_DESKTOP}px)`,
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        px: 3,
        py: 2,
      }}
    >
      <Stack
        sx={{
          height: `100%`,
        }}
      >
        <Stack
          sx={{
            height: 30,
          }}
        >
          <Typography variant="subtitle2">Standard Fields</Typography>
        </Stack>
        <Stack
          sx={{
            height: `calc(100% - 30px)`,
          }}
        >
          <Scrollbar>
            <Stack mt={1} spacing={1.5}>
              {fieldTypes.map((fieldType) => (
                <DraggableFieldItem
                  key={fieldType.label}
                  icon={fieldType.icon}
                  label={fieldType.label}
                  type={fieldType.type}
                  onDragStart={onDragStart}
                />
              ))}
            </Stack>
          </Scrollbar>
        </Stack>
      </Stack>
      {/* Fields List */}
      {/* <Stack
        sx={{
          height: `50%`,
        }}
      >
        <Stack
          sx={{
            height: 30,
          }}
        >
          <Typography variant="subtitle2">Fields</Typography>
        </Stack>
        <Stack
          sx={{
            height: `calc(100% - 30px)`,
            overflow: 'auto',
          }}
        >
          <Scrollbar>
            <Stack mt={1} spacing={1}>
              {Object.keys(fields).map((fieldId) => (
                <Stack
                  key={fieldId}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  onClick={() => {
                    dispatch(setSelectedField(fieldId));
                  }}
                  sx={{
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    px: 2,
                    py: 0.5,
                    ...(selectedFieldId === fieldId && {
                      backgroundColor: (theme) => theme.palette.primary.lighter,
                    }),
                    ':hover': {
                      backgroundColor: (theme) => theme.palette.action.hover,
                    },
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    sx={{
                      height: 8,
                      width: 8,
                      backgroundColor: (theme) => theme.palette.primary.main,
                      borderRadius: '50%',
                    }}
                  />
                  <Typography variant="subtitle2">{fields[fieldId].fieldKey}</Typography>
                </Stack>
              ))}
            </Stack>
          </Scrollbar>
        </Stack>
      </Stack> */}
    </Stack>
  );
}
