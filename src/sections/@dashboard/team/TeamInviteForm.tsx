import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useFormik, Form, FormikProvider, FieldArray } from 'formik';
// @mui
import {
  Box,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  CardContent,
  Card,
  Stack,
  styled,
  CardActions,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import FormFieldArrayField from 'components/FormFieldArrayField';
import Iconify from 'components/Iconify';
import Tip from 'components/Tip';
// @types
import { TeamMemberManager } from '../../../@types/team';
import { FirmAdminManager } from '../../../@types/firmAdmin';
import { AdvisorManager } from '../../../@types/advisor';
import { FormFieldManager } from '../../../@types/field';
// redux
import { useSelector } from 'redux/store';
import { createFirmAdmin } from 'redux/slices/firmAdmins';
import { createAdvisor } from 'redux/slices/advisors';
// hooks
import useIsMountedRef from 'hooks/useIsMountedRef';
// constants
import { roles } from 'constants/users';
import { useState } from 'react';
import { getAltLogo, getFullLogo } from 'utils/getLogo';

// ----------------------------------------------------------------------

const initialTeamMember = {
  email: '',
  role: '',
  name: '',
};

// ----------------------------------------------------------------------

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(4, 0),
}));

// ----------------------------------------------------------------------

const FIELDS: FormFieldManager[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'TextField',
    defaultValue: '',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'TextField',
    defaultValue: '',
  },
  {
    name: 'role',
    label: 'Role',
    type: 'Select',
    options: [
      { value: roles.FIRM_ADMIN, label: 'Admin' },
      { value: roles.ADVISOR, label: 'Advisor' },
    ],
    defaultValue: '',
  },
];

// ----------------------------------------------------------------------

const getInitialValues = () => {
  const initialTeamMembers = [...Array(1)].map(
    (_, index) => initialTeamMember as TeamMemberManager
  );

  const initialValues: {
    team: TeamMemberManager[];
  } = {
    team: initialTeamMembers,
  };

  return initialValues;
};

// ----------------------------------------------------------------------

export default function TeamInviteForm({ onComplete }: { onComplete?: VoidFunction }) {
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();
  const { firm } = useSelector((state) => state.firm);

  const [previewEmail, setPreviewEmail] = useState(false);

  const TeamSchema = Yup.object().shape({
    team: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required('Name is required'),
        email: Yup.string()
          .email('Email must be a valid email address')
          .required('Email is required'),
        role: Yup.string()
          .max(255)
          .required('Role is required')
          .matches(/(firm-admin|advisor)/),
      })
    ),
  });

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: TeamSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);
        const newTeamMembers = values.team;

        const promises = newTeamMembers.map((newTeamMember) => {
          switch (newTeamMember.role) {
            case roles.FIRM_ADMIN:
              return createFirmAdmin(newTeamMember as Partial<FirmAdminManager>);
            case roles.ADVISOR:
              return createAdvisor(newTeamMember as Partial<AdvisorManager>);
            default:
              return Promise.resolve();
          }
        });

        await Promise.all(promises);

        enqueueSnackbar('Invite team success', { variant: 'success' });
        onComplete && onComplete();
        if (isMountedRef.current) {
          resetForm();
          setSubmitting(false);
        }
      } catch (error: any) {
        // Get error message from backend
        const errorMessage = error?.response?.data?.error;

        enqueueSnackbar(
          <Typography>{'Something went wrong \n' + (errorMessage || '')}</Typography>,
          { variant: 'error', style: { whiteSpace: 'pre-line' } }
        );
        if (isMountedRef.current) {
          setSubmitting(false);
        }
      }
    },
  });

  const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogContent sx={{ pb: 0, overflowY: 'unset' }}>
            <FieldArray
              name="team"
              render={(arrayHelpers) => (
                <TableContainer sx={{ mb: 2 }}>
                  <Table aria-label="simple table">
                    <TableBody>
                      {values.team.map((member: TeamMemberManager, index: number) => (
                        <TableRow
                          key={index}
                          sx={{
                            alignItems: 'center',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                          }}
                        >
                          <TableCell sx={{ padding: '1rem !important', flex: '1' }}>
                            <FormFieldArrayField
                              name="name"
                              index={index}
                              parent="team"
                              fields={FIELDS}
                              touched={touched}
                              errors={errors}
                              getFieldProps={getFieldProps}
                            />
                          </TableCell>
                          <TableCell sx={{ padding: '1rem !important', flex: '1' }}>
                            <FormFieldArrayField
                              name="email"
                              index={index}
                              parent="team"
                              fields={FIELDS}
                              touched={touched}
                              errors={errors}
                              getFieldProps={getFieldProps}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              minWidth: '200px',
                              flex: '1',
                            }}
                          >
                            <FormFieldArrayField
                              name="role"
                              index={index}
                              parent="team"
                              fields={FIELDS}
                              touched={touched}
                              errors={errors}
                              getFieldProps={getFieldProps}
                            />
                            <Tip
                              title={
                                <>
                                  <Typography color="inherit">What do these mean?</Typography>
                                  <u>Admins</u> can update firm-wide settings and add clients on
                                  behalf of others.
                                  <br />
                                  <u>Advisors</u> show up in advisor select lists and can create
                                  their own clients.
                                  <br />
                                  <br />
                                  You can edit permissions to get even more specific with what this
                                  user can do.
                                </>
                              }
                              sx={{ ml: 1 }}
                            />
                          </TableCell>
                          <TableCell sx={{ padding: '0px 16px !important' }}>
                            <Tooltip title="Remove row">
                              <IconButton
                                aria-label="delete"
                                type="button"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                <Iconify icon="eva:trash-2-outline" sx={{}} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                            <Button
                              type="button"
                              variant="outlined"
                              startIcon={<Iconify icon={'eva:plus-fill'} />}
                              onClick={() => arrayHelpers.push(initialTeamMember)}
                            >
                              Add Team Member
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </TableContainer>
              )}
            />
          </DialogContent>
          <DialogActions sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <LoadingButton
              color="inherit"
              variant="text"
              size="large"
              onClick={() => setPreviewEmail(true)}
              sx={{ flex: 1, fontStyle: 'italic', textDecoration: 'underline', color: 'grey.500' }}
            >
              Preview Invite Email
            </LoadingButton>
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              loadingIndicator="Loading..."
              sx={{ flex: 1 }}
            >
              Invite Team Members
            </LoadingButton>
          </DialogActions>
        </Form>
      </FormikProvider>

      {/* Modal with email preview */}
      <Dialog open={previewEmail} maxWidth="md" onClose={() => setPreviewEmail(false)}>
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 2 }}
        >
          <Typography variant="h3">Preview your invitation</Typography>
          <IconButton onClick={() => setPreviewEmail(false)}>
            <Iconify icon={'eva:close-fill'} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              <TableRow sx={{ backgroundColor: '#C4C5C5' }}>
                <Typography
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignContent: 'center',
                    my: 2,
                    fontWeight: 'bold',
                  }}
                >
                  <Iconify icon={'eva:email-outline'} width={22} height={22} sx={{ mx: 1 }} />
                  You're invited to join Finpace - Inbox
                </Typography>
              </TableRow>

              {/* Email inbox */}
              <TableRow>
                <Typography sx={{ mx: 5, my: 3 }} component="div">
                  <Typography sx={{ fontWeight: 'bold' }}>
                    From: Finpace {'<'}no-reply@finpace.com{'>'}
                  </Typography>
                  <Typography>Subject: You're invited to join Finpace</Typography>
                </Typography>
              </TableRow>

              {/* Email preview */}
              <TableRow sx={{ backgroundColor: '#EAEAEA' }}>
                <Card sx={{ mx: 10, my: 5 }}>
                  <CardContent>
                    <ContentStyle>
                      <Stack direction="row" alignItems="center" justifyContent="center">
                        <Box sx={{ width: 174, height: 76 }}>
                          <img
                            src={getFullLogo()}
                            alt={getAltLogo()}
                            width="100%"
                            height="100%"
                            style={{ objectFit: 'contain', objectPosition: 'center center' }}
                          />
                        </Box>
                      </Stack>
                    </ContentStyle>
                    <Typography variant="h3" gutterBottom>
                      You're invited to join Finpace
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {firm.name} is inviting you to join Finpace. Please{' '}
                      <Typography component="span" sx={{ color: 'primary.main' }}>
                        accept this invitation
                      </Typography>{' '}
                      and join in.
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1.5, ml: 5 }} color="text.secondary">
                      <ul>
                        <li>Automate what slows you down</li>
                        <li>Enhance customer experience</li>
                        <li>Expedite client onboarding</li>
                        <li>Improve engagement</li>
                      </ul>
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ margin: 3, mt: 0 }}>
                    <Button variant="contained" sx={{ textTransform: 'none' }}>
                      Accept & Join
                    </Button>
                  </CardActions>
                </Card>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </>
  );
}
