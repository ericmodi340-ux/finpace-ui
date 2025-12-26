import {
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import Iconify from 'components/Iconify';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';
import FormNewModal from './views/form-new-modal';
import { useBoolean } from 'hooks/useBoolean';

type Props = DialogProps & {
  onClose: () => void;
};

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.neutral,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function FormCreateModal({ onClose, ...props }: Props) {
  const navigate = useNavigate();

  const openCreateWithAIModal = useBoolean();

  const cards = [
    {
      icon: 'material-symbols:auto-awesome',
      title: 'Create with AI',
      description: 'Generate custom questions with AI in seconds',
      onClick: () => openCreateWithAIModal.onTrue(),
    },
    {
      icon: 'material-symbols:add',
      title: 'Start from scratch',
      description: 'Build from scratch with our intuitive form builder',
      onClick: () => navigate(PATH_DASHBOARD.dataCollection.formBuilder('123')),
    },
    {
      icon: 'material-symbols:layers',
      title: 'Select a template',
      description: 'Get started right away with Hand-crafted templates',
      onClick: () => null,
    },
  ];

  if (openCreateWithAIModal.value) {
    return (
      <FormNewModal
        open={openCreateWithAIModal.value}
        onClose={() => {
          openCreateWithAIModal.onFalse();
          onClose();
        }}
      />
    );
  }

  return (
    <Dialog fullWidth maxWidth="md" {...props} onClose={onClose}>
      <DialogTitle>Create a new form</DialogTitle>
      <DialogContent>
        <Stack
          sx={{
            py: 2,
            pt: 3,
          }}
        >
          <Grid container spacing={5}>
            {cards.map((card, index) => (
              <Grid item xs={12} md={4} key={index}>
                <StyledCard onClick={card.onClick}>
                  <Iconify
                    sx={{
                      height: 40,
                      width: 40,
                    }}
                    icon={card.icon}
                  />
                  <CardContent sx={{ textAlign: 'center', p: 0, mt: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: (theme) => theme.palette.text.secondary }}
                    >
                      {card.description}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
