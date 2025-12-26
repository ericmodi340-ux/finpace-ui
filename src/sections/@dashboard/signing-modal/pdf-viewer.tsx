import { Stack, CircularProgress } from '@mui/material';
import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerProps {
  url: string;
  onLoadSuccess: (numPages: number) => void;
  onLoadError: (error: Error) => void;
  numPages: number;
  scale: number;
  children?: React.ReactNode;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PDFViewer: React.FC<PDFViewerProps> = ({
  url,
  onLoadSuccess,
  onLoadError,
  numPages,
  scale,
  children,
}) => (
  <Document
    file={url}
    onLoadSuccess={({ numPages }) => onLoadSuccess(numPages)}
    onLoadError={onLoadError}
    error={<div>Fail to load</div>}
    loading={
      <Stack>
        <CircularProgress />
      </Stack>
    }
  >
    {Array.from(new Array(numPages), (_, index) => (
      <Stack
        key={`page_${index + 1}`}
        sx={{
          position: 'relative',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          my: 2,
        }}
      >
        <Page renderAnnotationLayer={false} pageNumber={index + 1} scale={scale} />
        {React.Children.map(children, (child: any) => {
          if (child.props.component?.overlay?.page === index + 1) {
            return child;
          }
          return null;
        })}
      </Stack>
    ))}
  </Document>
);
