import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { m } from 'framer-motion';
import * as Yup from 'yup';
import { useFormik, FormikProvider, Form } from 'formik';
// @mui
import { styled } from '@mui/material/styles';
import {
  Autocomplete,
  Chip,
  Container,
  Dialog,
  Typography,
  TextField,
  Box,
  Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import { varBounce } from 'components/animate';
import LoadingScreen from 'components/LoadingScreen';
import Logo from 'components/Logo';
import LogoIcon from 'components/LogoIcon';
// redux
import { useSelector } from 'redux/store';
import { updateClient } from 'redux/slices/client';
// hooks
import useAuth from 'hooks/useAuth';
import useIsMountedRef from 'hooks/useIsMountedRef';
import useUser from 'hooks/useUser';
import useClientTags from 'hooks/useClientTags';
// constants
import { roles } from 'constants/users';
import { ClientManager } from '../../@types/client';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',
}));

// ----------------------------------------------------------------------

export default function ClientWelcomeModal() {
  const [open, setOpen] = useState(false);

  const { firm } = useSelector((state) => state.firm);

  const { isAuthenticated } = useAuth();
  const { authUser, user } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();

  const CLIENT_TAGS = useClientTags();

  const initialValues: Pick<ClientManager, 'tags'> = {
    tags: [],
  };

  const tagsSchema = Yup.object({
    tags: Yup.array(),
  });

  const handleFinish = async (tags: string[]) => {
    try {
      const newClient = {
        isVerified: true,
        tags,
      };
      await updateClient(authUser?.sub, newClient);
      enqueueSnackbar("You're ready to go!", { variant: 'success' });
      if (isMountedRef.current) {
        setOpen(false);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const handleClose = async () => {
    setOpen(false);
    const newClient = {
      isVerified: true,
    };
    updateClient(authUser?.sub, newClient);
  };

  const formik = useFormik({
    initialValues,
    validationSchema: tagsSchema,
    onSubmit: ({ tags }) => handleFinish(tags),
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue } = formik;

  useEffect(() => {
    let openOnboarding = false;

    if (user?.id && !user?.isVerified && authUser?.role === roles.CLIENT) {
      openOnboarding = true;
    }

    setOpen(openOnboarding);
  }, [user, authUser]);

  if (!isAuthenticated) {
    return <></>;
  }

  if (!firm.id) {
    return <LoadingScreen />;
  }

  return (
    <Dialog open={open} data-test="client-welcome-modal" onClose={handleClose}>
      <RootStyle>
        <Container
          sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <RootStyle>
            <Box
              sx={{
                flex: 1,
                maxWidth: 480,
                margin: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '30px 0',
              }}
            >
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <LogoIcon />
              </Box>

              <m.div variants={varBounce().in}>
                <Typography variant={'h3'} paragraph data-test="client-welcome-modal-page-heading">
                  Welcome to {firm.name || 'your forms wizard'}
                </Typography>
              </m.div>

              <Typography sx={{ color: 'text.secondary' }}>
                Your financial professional would like to collaborate with you regarding the
                information necessary to help open your account. All information is private and only
                utilized for the purpose of establishing your account using this secure system
                powered by Finpace. If you have any questions please contact your financial
                professional.
              </Typography>
              <FormikProvider value={formik}>
                <Form onSubmit={handleSubmit}>
                  <Box sx={{ marginTop: '1rem' }}>
                    <Typography sx={{ color: 'text.secondary', marginBottom: '1rem' }}>
                      Before starting please select three topics of your interest.
                    </Typography>
                    <Autocomplete
                      multiple
                      freeSolo
                      onChange={(event, newValue) => {
                        setFieldValue('tags', newValue);
                      }}
                      value={values.tags}
                      options={CLIENT_TAGS}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option}
                            size="small"
                            label={option}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tags"
                          error={Boolean(touched.tags && errors.tags)}
                          helperText={touched.tags && errors.tags}
                        />
                      )}
                    />
                  </Box>
                  <Box sx={{ py: 3, display: 'flex' }}>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isSubmitting}
                      loading={isSubmitting}
                      sx={{ flex: 1 }}
                      data-test="client-welcome-modal-continue-button"
                    >
                      Let's Go!
                    </LoadingButton>
                  </Box>
                </Form>
              </FormikProvider>
              <Box sx={{ pt: 3 }}>
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
                  <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                    Powered by{' '}
                  </Typography>
                  <Logo branded={false} sx={{ width: '60px', height: 'auto' }} />
                </Stack>
              </Box>
            </Box>
          </RootStyle>
        </Container>
      </RootStyle>
    </Dialog>
  );
}
