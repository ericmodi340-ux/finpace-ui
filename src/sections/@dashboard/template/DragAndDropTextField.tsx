import { TextField } from '@mui/material';
import React from 'react';
import { useDropzone } from 'react-dropzone';

const styles = {
  dropZone: {
    height: 200,
  },
};

interface Props {
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  label?: string;
  setValues: (values: any) => void;
}

const DragAndDropTextField: React.FC<Props> = ({
  fullWidth,
  multiline,
  rows,
  label,
  setValues,
  ...rest
}) => {
  const { getRootProps } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: (acceptedFiles, _, event) => {
      event.preventDefault();

      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.addEventListener('load', (event: ProgressEvent<FileReader>) => {
        const fileText = event?.target?.result;
        setValues({ json: fileText });
      });

      reader.readAsText(file);
    },
  });

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div style={styles.dropZone} onDragOver={handleDragOver} {...getRootProps()}>
      <TextField fullWidth={fullWidth} multiline={multiline} rows={rows} label={label} {...rest} />
    </div>
  );
};

export default DragAndDropTextField;
