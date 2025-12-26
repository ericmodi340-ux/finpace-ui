import {
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  useTheme,
} from '@mui/material';
import Iconify from 'components/Iconify';

type Props = {
  title: string;
  active: boolean;
  children: React.ReactNode;
  onExpand: () => void;
};

export default function AutomationSidebarItem({ active, title, children, onExpand }: Props) {
  const theme = useTheme();

  return (
    <>
      <ListItem>
        <ListItemIcon>
          <IconButton onClick={onExpand}>
            <Iconify
              icon="icon-park-outline:down"
              color={theme.palette.grey[500]}
              sx={{ height: 20, width: 20 }}
            />
          </IconButton>
        </ListItemIcon>
        <ListItemText
          primary={title}
          primaryTypographyProps={{
            variant: 'subtitle1',
          }}
        />
      </ListItem>
      {active && <Stack p={3}>{children}</Stack>}
      <Divider />
    </>
  );
}
