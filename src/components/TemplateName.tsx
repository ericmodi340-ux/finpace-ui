// hooks
import { Tooltip, Typography } from '@mui/material';
import useTemplate from 'hooks/useTemplate';

// ----------------------------------------------------------------------

interface Props {
  templateId: string;
}

export default function TemplateName({ templateId }: Props) {
  const template = useTemplate(templateId);
  const title = template?.title || '';
  return (
    <Tooltip title={title}>
      <Typography whiteSpace={'nowrap'} overflow={'hidden'} textOverflow={'ellipsis'}>
        {title}
      </Typography>
    </Tooltip>
  );
}
