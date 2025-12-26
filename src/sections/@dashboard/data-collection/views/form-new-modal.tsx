import {
  Button,
  Card,
  Container,
  Dialog,
  DialogProps,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Iconify from 'components/Iconify';
import { MAIN_HEADER_MOBILE } from 'config';
import { useState } from 'react';
import {
  GenerateFormFromDescription,
  GenerateFormFromPDF,
  GenerateFormFromQuestions,
} from '../form-generation';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';

type Props = DialogProps & {
  onClose: () => void;
};

export default function FormNewModal({ onClose, ...props }: Props) {
  const [currentTab, setCurrentTab] = useState('describe');

  return (
    <Dialog fullWidth fullScreen {...props}>
      <Stack
        sx={{
          height: '100vh',
          backgroundColor: (theme) => theme.palette.background.neutral,
        }}
      >
        <Stack
          sx={{
            height: MAIN_HEADER_MOBILE,
            px: 3,
            backgroundColor: (theme) => theme.palette.primary.darker,
            color: (theme) => theme.palette.primary.contrastText,
          }}
          alignItems="center"
          direction="row"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              sx={{
                backgroundColor: (theme) => theme.palette.common.white,
                ':hover': {
                  backgroundColor: (theme) => theme.palette.common.white,
                },
                color: (theme) => theme.palette.common.black,
              }}
              size="small"
              onClick={onClose}
            >
              <Iconify icon="eva:arrow-back-fill" />
            </IconButton>
            <Typography variant="h5">Create Form</Typography>
          </Stack>
        </Stack>
        <Container maxWidth="sm">
          <Card
            sx={{
              mt: 10,
              p: 3,
            }}
          >
            <Stack>
              <Typography variant="subtitle1">Template Name</Typography>
              <TextField
                sx={{
                  mt: 1,
                }}
                fullWidth
                placeholder="Client Profile Form"
              />
              <Typography
                sx={{
                  mt: 2,
                }}
                variant="subtitle1"
              >
                How do you want to create your form?
              </Typography>
              <Stack
                mt={1}
                direction="row"
                justifyContent="space-between"
                spacing={2}
                alignItems="center"
              >
                <Button
                  fullWidth
                  onClick={() => setCurrentTab('describe')}
                  variant={currentTab === 'describe' ? 'contained' : 'outlined'}
                >
                  Describe form
                </Button>
                <Button
                  fullWidth
                  onClick={() => setCurrentTab('question')}
                  variant={currentTab === 'question' ? 'contained' : 'outlined'}
                >
                  Write questions
                </Button>
                <Button
                  fullWidth
                  onClick={() => setCurrentTab('pdf')}
                  variant={currentTab === 'pdf' ? 'contained' : 'outlined'}
                >
                  From PDF
                </Button>
              </Stack>
              <Stack mt={2}>
                {currentTab === 'describe' && <GenerateFormFromDescription />}

                {currentTab === 'question' && <GenerateFormFromQuestions />}

                {currentTab === 'pdf' && <GenerateFormFromPDF />}
              </Stack>
            </Stack>
          </Card>
        </Container>
      </Stack>
    </Dialog>
  );
}
