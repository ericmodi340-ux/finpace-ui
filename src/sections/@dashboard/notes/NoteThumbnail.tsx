import { Theme } from '@mui/material/styles';
import { Box, Stack, SxProps, Typography } from '@mui/material';
import Iconify from 'components/Iconify';
import { getStorageItem } from 'redux/slices/storage';

// ----------------------------------------------------------------------

type FileIconProps = {
  file: File | string | any;
  sx?: SxProps<Theme>;
  showDetails?: boolean;
};

// Define more types here
const FILE_FORMATS = {
  pdf: ['pdf'],
  txt: ['txt'],
  psd: ['psd'],
  word: ['doc', 'docx'],
  excel: ['xls', 'xlsx'],
  zip: ['zip', 'rar', 'iso'],
  illustrator: ['ai', 'esp'],
  powerpoint: ['ppt', 'pptx'],
  audio: ['wav', 'aif', 'mp3', 'aac'],
  image: ['jpg', 'jpeg', 'gif', 'bmp', 'png', 'svg'],
  video: ['m4v', 'avi', 'mpg', 'mp4', 'webm'],
};

const iconUrl = (icon: string) => `/icons/${icon}.svg`;

// ----------------------------------------------------------------------

function getFileExtension(fileUrl: string) {
  return fileUrl.split('.').pop()?.toLowerCase() || '';
}

function getFileFormat(fileUrl: string | undefined) {
  const fileExtension = getFileExtension(fileUrl || '');
  for (const [format, extensions] of Object.entries(FILE_FORMATS)) {
    if (extensions.includes(fileExtension)) {
      return format;
    }
  }
  return fileExtension;
} // ----------------------------------------------------------------------

function getFileThumb(fileUrl: string) {
  const fileFormat = getFileFormat(fileUrl);
  switch (fileFormat) {
    case 'folder':
      return iconUrl('ic_folder');
    case 'txt':
      return iconUrl('ic_txt');
    case 'zip':
      return iconUrl('ic_zip');
    case 'audio':
      return iconUrl('ic_audio');
    case 'video':
      return iconUrl('ic_video');
    case 'word':
      return iconUrl('ic_word');
    case 'excel':
      return iconUrl('ic_excel');
    case 'powerpoint':
      return iconUrl('ic_power_point');
    case 'pdf':
      return iconUrl('ic_pdf');
    case 'psd':
      return iconUrl('ic_pts');
    case 'illustrator':
      return iconUrl('ic_ai');
    case 'image':
      return iconUrl('ic_img');
    default:
      return iconUrl('ic_txt');
  }
}

export default function NoteThumbnail({ file, sx, showDetails = false }: FileIconProps) {
  const getIconUrl = () => getFileThumb(file?.attachmentUrl || file?.note);

  const splitedFile = file?.attachmentUrl ? String(file?.attachmentUrl).split('/') : [];

  const handleDownload = async () => {
    if (file?.attachmentUrl) {
      const resp = await getStorageItem({ path: file?.attachmentUrl, isPublic: true });
      window.open(resp);
    }
  };

  const renderContent = (
    <Stack sx={{ flexDirection: 'row' }}>
      <Box
        component="img"
        src={getIconUrl()}
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          ...sx,
        }}
      />
      {file?.attachmentUrl && showDetails && (
        <Stack ml={2}>
          <Typography>{splitedFile.length > 0 && splitedFile[splitedFile.length - 1]}</Typography>
          <Iconify
            onClick={handleDownload}
            sx={{
              width: 30,
              height: 30,
              mt: 0.5,
              color: 'primary.main',
              cursor: 'pointer',
              ':hover': {
                opacity: 0.6,
              },
            }}
            icon="material-symbols:download"
          />
        </Stack>
      )}
    </Stack>
  );

  return <>{renderContent}</>;
}
