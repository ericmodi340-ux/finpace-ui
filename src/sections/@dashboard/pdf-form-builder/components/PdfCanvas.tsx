import { CircularProgress, Stack, Typography } from '@mui/material';
import { TemplateWithFieldsManager } from '../../../../@types/template';
import React, { useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  addField,
  setDraggedFieldId,
  setNumPages,
  setScale,
  setSelectedField,
  updateField,
} from 'redux/slices/formBuilder';
import { useDispatch, useSelector } from 'redux/store';
import { FieldType } from 'constants/fieldTypes';
import { FormFieldComponent } from './FormField';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { getDefaultFieldContent } from '../utils/getDefaultFieldContent';
import { CDN_PATH } from 'config';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfCanvas({ template }: { template: TemplateWithFieldsManager }) {
  const { numPages } = useSelector((state) => state.formBuilder);

  const dispatch = useDispatch();

  const fileSrc = CDN_PATH + template?.pdfFormSchema?.settings?.src;

  const handleLoadSuccess = (pages: number) => {
    dispatch(setNumPages(pages));
    // Adjust scale based on container width
    const container = document.querySelector('.pdf-container');
    if (container) {
      const newScale = container.clientWidth / 613;
      dispatch(setScale(Math.max(newScale, 1)));
    }
  };

  // useEffect(() => {
  //   if (selectedFieldId) {
  //     const element = document.getElementById(selectedFieldId);
  //     if (element) {
  //       element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //     }
  //   }
  // }, [selectedFieldId]);

  return (
    <Stack
      sx={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: (theme) => theme.palette.background.neutral,
        overflow: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <Stack
        className="pdf-container"
        sx={{
          width: {
            md: 713,
            xl: 1091,
          },
        }}
      >
        <Document
          file={fileSrc}
          onLoadSuccess={({ numPages }) => handleLoadSuccess(numPages)}
          onLoadError={(err) => console.error('error', err)}
          error={
            <Stack
              sx={{ height: '100%', width: '100%' }}
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h5">Fail to load</Typography>
            </Stack>
          }
          loading={
            <Stack
              sx={{ height: '100%', width: '100%', flexGrow: 1 }}
              alignItems="center"
              justifyContent="center"
            >
              <CircularProgress />
            </Stack>
          }
        >
          <Stack spacing={2}>
            {Array.from(new Array(numPages), (_, index) => (
              <PDFPage key={index} pageNumber={index + 1} />
            ))}
          </Stack>
        </Document>
      </Stack>
    </Stack>
  );
}

const PDFPage: React.FC<{
  pageNumber: number;
}> = ({ pageNumber }) => {
  const containerRef = useRef<any>(null);
  const dispatch = useDispatch();

  const { scale, draggedFieldId, fields } = useSelector((state) => state.formBuilder);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const dropPosition = calculateDropPosition(e, containerRef.current);
    const originalX = dropPosition.x / scale;
    const originalY = dropPosition.y / scale;

    if (draggedFieldId) {
      const field = fields[draggedFieldId];
      if (field) {
        dispatch(
          updateField({
            ...field,
            overlay: {
              ...field.overlay,
              x: originalX,
              y: originalY,
              page: pageNumber,
            },
          })
        );
      }

      dispatch(setDraggedFieldId(null));
    } else {
      const type = e.dataTransfer.getData('fieldType') as FieldType;
      if (!type) return;

      const newField = getDefaultFieldContent({
        pageNumber,
        type,
        x: originalX,
        y: originalY,
        scale,
      });

      dispatch(
        addField({
          ...newField,
          overlay: {
            ...newField.overlay,
            width: newField.overlay.width / scale,
            height: newField.overlay.height / scale,
          },
        })
      );
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <Stack
      key={`page_${pageNumber}`}
      sx={{
        position: 'relative',
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
      ref={containerRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Page renderAnnotationLayer={false} pageNumber={pageNumber} scale={scale} />
      {Object.keys(fields).map((fieldId) => {
        const field = fields[fieldId];

        if (field.overlay.page === pageNumber) {
          return (
            <FormFieldComponent
              key={field.id}
              field={{
                ...field,
                overlay: {
                  ...field.overlay,
                  x: field.overlay.x * scale,
                  y: field.overlay.y * scale,
                  width: field.overlay.width * scale,
                  height: field.overlay.height * scale,
                },
              }}
              onDragStart={() => {
                dispatch(setDraggedFieldId(field.id));
                dispatch(setSelectedField(field.id));
              }}
              onDragEnd={() => dispatch(setDraggedFieldId(null))}
            />
          );
        }
        return null;
      })}
    </Stack>
  );
};

interface DragOffset {
  x: number;
  y: number;
}

export const calculateDropPosition = (
  e: React.DragEvent,
  containerElement: HTMLElement
): { x: number; y: number } => {
  const rect = containerElement.getBoundingClientRect();
  const { scrollLeft } = containerElement;
  const { scrollTop } = containerElement;

  // Get the stored offset from the dataTransfer
  let offset: DragOffset = { x: 0, y: 0 };
  try {
    const offsetData = e.dataTransfer.getData('offset');
    if (offsetData) {
      offset = JSON.parse(offsetData);
    }
  } catch (error) {
    console.warn('Could not parse drag offset data');
  }

  // Calculate position relative to the container, accounting for scroll and offset
  const x = e.clientX - rect.left + scrollLeft - offset.x;
  const y = e.clientY - rect.top + scrollTop - offset.y;

  // Round to prevent sub-pixel positioning
  return {
    x: Math.round(x),
    y: Math.round(y),
  };
};
