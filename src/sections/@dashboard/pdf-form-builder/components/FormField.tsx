import React, { useCallback, useEffect, useRef, useState } from 'react';
import { alpha, Box, Stack, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'redux/store';
import { setSelectedField, updateField } from 'redux/slices/formBuilder';
import { FormField } from '../../../../@types/formBuilder';
import Iconify from 'components/Iconify';
import { getSignerColor } from '../utils/getSignerColor';

interface FormFieldProps {
  field: FormField;
  onDragStart: (e: React.DragEvent, fieldId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

type EdgeType = 'corner';

export const FormFieldComponent: React.FC<FormFieldProps> = ({ field, onDragStart, onDragEnd }) => {
  const elementRef = useRef<any>(null);

  const dispatch = useDispatch();

  const { selectedFieldId, scale } = useSelector((state) => state.formBuilder);

  const [isResizing, setIsResizing] = useState(false);
  const [activeEdge, setActiveEdge] = useState<EdgeType | null>(null);

  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const [localWidth, setLocalWidth] = useState(field.overlay.width);
  const [localHeight, setLocalHeight] = useState(field.overlay.height);

  useEffect(() => {
    setLocalWidth(field.overlay.width);
    setLocalHeight(field.overlay.height);
  }, [field.overlay.width, field.overlay.height]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setActiveEdge('corner');
    setStartPos({
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      if (activeEdge === 'corner') {
        const deltaXRaw = (e.clientX - startPos.x) / scale;
        const deltaYRaw = (e.clientY - startPos.y) / scale;
        setLocalWidth((prev) => Math.round(prev + deltaXRaw));
        setLocalHeight((prev) => Math.round(prev + deltaYRaw));
        setStartPos({
          x: e.clientX,
          y: e.clientY,
        });
      }
    },
    [isResizing, scale, startPos, activeEdge]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setActiveEdge(null);
    dispatch(
      updateField({
        ...field,
        overlay: {
          ...field.overlay,
          x: field.overlay.x / scale,
          y: field.overlay.y / scale,
          width: localWidth / scale,
          height: localHeight / scale,
        },
      })
    );
  }, [dispatch, field, localWidth, scale, localHeight]);

  const handleDragStart = (e: React.DragEvent) => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    e.dataTransfer.setData('offset', JSON.stringify({ x: offsetX, y: offsetY }));
    e.dataTransfer.setDragImage(elementRef.current, offsetX, offsetY);
    e.dataTransfer.effectAllowed = 'move';

    onDragStart(e, field?.id);
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <Stack
      id={field.id}
      ref={elementRef}
      sx={{
        position: 'absolute',
        left: `${field.overlay.x}px`,
        top: `${field.overlay.y}px`,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: field.type === 'radio-button' ? '50%' : '0px',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: (theme) => alpha(theme.palette.primary.lighter, 0.8),
        zIndex: 10,
        cursor: 'move',
        width: `${localWidth}px`,
        height: `${localHeight}px`,
        ...(selectedFieldId === field.id && {
          borderColor: (theme) => theme.palette.primary.dark,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.8),
        }),
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={() => dispatch(setSelectedField(field.id))}
    >
      {selectedFieldId === field.id && (
        <Box
          sx={{
            cursor: 'nwse-resize',
            position: 'absolute',
            right: 0,
            bottom: 0,
            transform: 'translate(50%, 50%)',
            width: 4 * scale,
            height: 4 * scale,
            borderRadius: '50%',
            backgroundColor: (theme) => theme.palette.primary.dark,
          }}
          onMouseDown={handleMouseDown}
        />
      )}

      <FieldContent field={field} />
    </Stack>
  );
};

function FieldContent({ field }: { field: FormField }) {
  const { scale } = useSelector((state) => state.formBuilder);

  const fontSize = 10 * scale;

  if (field.type === 'checkbox') {
    return (
      <Box
        sx={{
          height: `${field.overlay.height}px`,
          width: `${field.overlay.width}px`,
          backgroundColor: 'white',
          m: 0.2 * scale,
        }}
      />
    );
  }

  if (field.type === 'radio-button') {
    return (
      <Box
        sx={{
          height: `${field.overlay.height}px`,
          width: `${field.overlay.width}px`,
          backgroundColor: 'white',
          m: 0.2 * scale,
          borderRadius: '50%',
        }}
      />
    );
  }

  if (field.type === 'signature' || field.type === 'initial') {
    return (
      <Box
        sx={{
          height: `${field.overlay.height}px`,
          width: `${field.overlay.width}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          p: 0.2 * scale,
          backgroundColor: getSignerColor(field.custom?.signer),
        }}
      >
        <Iconify fontSize={fontSize} icon="mdi:signature-freehand" />
        <Typography sx={{ fontSize }}>
          {field.type === 'initial' ? 'Initial' : 'Sign'} here
        </Typography>
      </Box>
    );
  }

  return (
    <Stack
      sx={{
        height: `${field.overlay.height}px`,
        width: `${field.overlay.width}px`,
        px: 0.5 * scale,
        py: 0.7 * scale,
        overflow: 'hidden',
        backgroundColor:
          field.type === 'date-signed' ? getSignerColor(field.custom?.signer) : 'inherit',
      }}
      spacing={1}
      direction="row"
      alignItems="center"
    >
      <Iconify
        fontSize={fontSize}
        sx={{
          flexShrink: 0,
        }}
        icon={field.type === 'date-signed' ? 'mdi:date-range' : 'mdi:format-text'}
      />
      <Typography
        sx={{
          fontSize,
          flexWrap: 'nowrap',
        }}
        noWrap
      >
        {field.fieldKey}
      </Typography>
    </Stack>
  );
}
