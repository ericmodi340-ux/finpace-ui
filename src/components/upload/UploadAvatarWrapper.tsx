import { AVATAR_MAX_SIZE } from '../../config';
import { fData } from '../../utils/formatNumber';
import { UploadAvatar } from './index';
import { Typography } from '@mui/material';

type Props = {
  handleDropSingleFile: (fieldId: any, acceptedFiles: any) => void;
  handleDeleteSingleFile: (fieldId: string, path: string | undefined) => Promise<void>;
  avatarPath: string | undefined;
  avatarUrl: string;
  hasTitle: boolean;
};

export default function UploadAvatarWrapper({
  handleDropSingleFile,
  handleDeleteSingleFile,
  avatarPath,
  avatarUrl,
  hasTitle,
}: Props) {
  return (
    <UploadAvatar
      hasTitle={hasTitle}
      accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.gif'] }}
      file={avatarUrl}
      maxFiles={1}
      maxSize={AVATAR_MAX_SIZE}
      onDrop={(files) => handleDropSingleFile('avatar', files)}
      onDelete={() => handleDeleteSingleFile('avatar', avatarPath)}
      caption={
        <Typography
          variant="caption"
          sx={{
            mt: 2,
            mx: 'auto',
            display: 'block',
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          Allowed *.jpeg, *.jpg, *.png, *.gif
          <br /> max size of {fData(AVATAR_MAX_SIZE)}
        </Typography>
      }
    />
  );
}
