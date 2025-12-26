// @mui
import { Box, Card, Button, Avatar, Typography, Stack } from '@mui/material';
// components
import Iconify from 'components/Iconify';

type AutomationCardProps = {
  name: string;
  type: string;
  onClick: VoidFunction;
  icon: string;
};

export default function AutomationCard(props: AutomationCardProps) {
  const { name, onClick, type, icon } = props;

  return (
    <Card
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Avatar variant="rounded" sx={{ width: 48, height: 48 }}>
        <Iconify color={'black'} icon={icon} width={20} sx={{ flexShrink: 0 }} />
      </Avatar>
      <Box
        sx={{
          pl: 2,
          pr: 1,
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <Typography variant="subtitle2" noWrap>
          {name}
        </Typography>

        <Stack spacing={0.5} direction="row" alignItems="center" sx={{ color: 'text.secondary' }}>
          <Typography variant="body2" component="span" noWrap>
            {type}
          </Typography>
        </Stack>
      </Box>

      <Button
        size="small"
        onClick={onClick}
        variant={'outlined'}
        color={'inherit'}
        sx={{ flexShrink: 0 }}
      >
        Start
      </Button>
    </Card>
  );
}
