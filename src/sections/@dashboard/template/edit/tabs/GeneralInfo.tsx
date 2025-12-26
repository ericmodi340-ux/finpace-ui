import * as Yup from 'yup';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFormik, Form, FormikProvider } from 'formik';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { QRCodeSVG } from 'qrcode.react';
// @mui
import {
  TextField,
  FormControlLabel,
  Stack,
  Switch,
  Card,
  Typography,
  Select,
  InputLabel,
  MenuItem,
  Grid,
  Tooltip,
  InputAdornment,
  IconButton,
  Fab,
  Button,
  Dialog,
  Container,
  FormHelperText,
  useTheme,
} from '@mui/material';
import { TemplateManager, TemplateWithFieldsManager } from '../../../../../@types/template';
// components
import Iconify from 'components/Iconify';
import Label from 'components/Label';
// redux
import { useSelector, RootState, useDispatch } from 'redux/store';
import { updateTemplate } from 'redux/slices/templates';
import useCopyToClipboard from 'hooks/useCopyToClipboard';
import useUser from 'hooks/useUser';
import { FirmAdminManager } from '../../../../../@types/firmAdmin';
import FormBuilder from './FormBuilder';
import { useSearchParams } from 'react-router-dom';
import { getEmailTemplates } from 'redux/slices/engagement-hub';
import { isGWN } from 'utils/firm';
import ConfirmDialog from 'components/ConfirmDialog';
import { useBoolean } from 'hooks/useBoolean';
import SurveyjsBuilder from './SurveyJsBuilder';
import { MAIN_HEADER_MOBILE } from 'config';

// ----------------------------------------------------------------------

export let initialValues = (template: Partial<TemplateManager>) => ({
  title: template?.title || '',
  useForOutreachDate: template?.useForOutreachDate || false,
  useForOnboardingDate: template?.useForOnboardingDate || false,
  inactive: template?.inactive || false,
  emailToClientOnFormCompletion: template?.emailToClientOnFormCompletion || 'none',
  authenticationMode: template?.authenticationMode || 'noAuth',
  signingEvent: template?.signingEvent || false,
  orion: template?.orion || false,
  clientCanCompleteForm: template?.clientCanCompleteForm || false,
  signingEventType: template?.signingEventType || 'finpaceSign',
  useDocusign: template?.useDocusign ?? false,
  isDataSecureInPublicForms: template?.isDataSecureInPublicForms || false,
  addFirmLogoOnForm: template?.addFirmLogoOnForm || false,
  disclosures: template?.disclosures || {
    firm: false,
    advisor: false,
  },
  showFundAllocator: template?.showFundAllocator || false,
  redirectOnComplete: template?.redirectOnComplete || false,
  completeButtonText: template?.completeButtonText || 'Complete Form',
  redirectUrl: template?.redirectUrl || '',
  onCompleteHeading: template?.onCompleteHeading || '',
  onCompleteSubHeading: template?.onCompleteSubHeading || '',
  publicFormFirstHeading: template?.publicFormFirstHeading || 'Give us the basics',
  publicFormFirstSubHeading:
    template?.publicFormFirstSubHeading || 'Please fill in the information below',
  surveyJsEnabled: template?.surveyJsEnabled ?? false,
});

// TODO: [DEV-215] General tab validation
export const FormSchema = Yup.object().shape({
  title: Yup.string().required('Form title is required'),
  useForOutreachDate: Yup.boolean(),
  useForOnboardingDate: Yup.boolean(),
  inactive: Yup.boolean(),
  emailToClientOnFormCompletion: Yup.string(),
  authenticationMode: Yup.string(),
  signingEvent: Yup.boolean(),
  signingEventType: Yup.string(),
  orion: Yup.boolean(),
  clientCanCompleteForm: Yup.boolean(),
  isDataSecureInPublicForms: Yup.boolean(),
  useDocusign: Yup.boolean(),
  addFirmLogoOnForm: Yup.boolean(),
  showFundAllocator: Yup.boolean(),
  disclosures: Yup.object().shape({
    firm: Yup.boolean(),
    advisor: Yup.boolean(),
  }),
  redirectOnComplete: Yup.boolean(),
  completeButtonText: Yup.string(),
  redirectUrl: Yup.string().when('redirectOnComplete', {
    is: true,
    then: (schema) =>
      schema.required('Redirect URL is required when enabled').url('Must be a valid URL'),
  }),
  onCompleteHeading: Yup.string(),
  onCompleteSubHeading: Yup.string(),
  publicFormFirstHeading: Yup.string(),
  publicFormFirstSubHeading: Yup.string(),
  surveyJsEnabled: Yup.boolean(),
});

// ----------------------------------------------------------------------

export default function GeneralInfo({
  template,
  onFormUpdate,
  setFormUpdates,
  setSave,
  formUpdates,
}: {
  template: TemplateWithFieldsManager | undefined;
  onFormUpdate: Function;
  setFormUpdates: Function;
  setSave: Dispatch<SetStateAction<boolean>>;
  formUpdates: any;
}) {
  const { templateId } = useParams();
  const {
    emailTemplates,
    loaded,
    isLoading: isLoadingEmailTemplate,
  } = useSelector((state: RootState) => state.engagementHub);
  const [searchParams] = useSearchParams();
  const [openBuilder, setOpenBuilder] = useState(searchParams.get('builder') === 'true');

  const openQRCode = useBoolean();

  // Update openBuilder state when URL parameters change
  useEffect(() => {
    setOpenBuilder(searchParams.get('builder') === 'true');
  }, [searchParams]);

  const theme = useTheme();

  const { firm } = useSelector((state: RootState) => state.firm);
  const { enqueueSnackbar } = useSnackbar();
  const { copy } = useCopyToClipboard();
  const { user } = useUser();
  const dispatch = useDispatch();
  const firmAdmin = user as FirmAdminManager;
  const publicUrl: string = `${window.location.origin}/public/forms/new?firmId=${firm.id}&templateId=${templateId}&advisorId=${firmAdmin.id}`;

  useEffect(() => {
    if (!loaded && !isLoadingEmailTemplate && user?.id) {
      dispatch(getEmailTemplates(user?.id));
    }
  }, [loaded, isLoadingEmailTemplate, user?.id, dispatch]);

  const [valuesUpdated, setValuesUpdated] = useState(false);

  const templateInitialData = { ...template };

  // Removing unnecessary data from full template
  if (templateInitialData) {
    delete templateInitialData.dsFieldMapping;
    delete templateInitialData.jsonEditorOutput;
    delete templateInitialData.richTextHtml;
    delete templateInitialData.fields;
    delete templateInitialData.signers;
  }

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: initialValues(templateInitialData || {}),
    validationSchema: FormSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        if (templateId) {
          const payload = {
            ...values,
            fields: template?.fields,
            dsFieldMapping: template?.dsFieldMapping,
            useDocusign: values?.useDocusign,
            signingEventType: values.useDocusign
              ? 'docusign'
              : !template?.signingEventType || template?.signingEventType === 'docusign'
                ? 'finpaceSign'
                : template?.signingEventType,
          };
          await updateTemplate(templateId, payload as any);
          setSave(true);
          enqueueSnackbar('Update success', { variant: 'success' });
          setSubmitting(false);
          setFormUpdates(null);
        } else {
          enqueueSnackbar('Something went wrong', { variant: 'error' });
        }
      } catch (error: any) {
        console.error(error);
        setSubmitting(false);
        setErrors(error.message);
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
    },
  });

  const {
    dirty,
    errors,
    values,
    touched,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    setFieldValue,
  } = formik;

  const onCopy = (text: string) => {
    if (text) {
      enqueueSnackbar('Public Form URL Copied', { variant: 'success' });
      copy(text);
    }
  };

  useEffect(() => {
    if (valuesUpdated && Object.keys(touched).length > 0) {
      onFormUpdate(values);
    }
  }, [values, valuesUpdated, onFormUpdate, touched]);

  const onCloseBuilder = () => {
    window.history.replaceState({}, '', `${window.location.pathname}`);
    setOpenBuilder(false);
  };

  useEffect(() => {
    setSave(false);
  }, [setSave]);

  return (
    <>
      <FormikProvider value={formik}>
        <Form
          autoComplete="off"
          noValidate
          onSubmit={handleSubmit}
          onChange={() => {
            setValuesUpdated(true);
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column' }} spacing={{ xs: 3, sm: 2 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                      General Information
                    </Typography>
                    <InputLabel htmlFor="title">What will this template be called?</InputLabel>
                    <TextField
                      fullWidth
                      {...getFieldProps('title')}
                      error={Boolean(touched.title && errors.title)}
                      helperText={touched.title && errors.title}
                      sx={{ mb: 3 }}
                    />

                    <InputLabel htmlFor="routing">
                      Public URL to collect responses from Prospects/Clients
                    </InputLabel>
                    <TextField
                      fullWidth
                      disabled
                      value={publicUrl}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Copy">
                              <IconButton onClick={() => onCopy(publicUrl)}>
                                <Iconify icon="eva:copy-fill" width={24} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Show QR Code">
                              <IconButton onClick={openQRCode.onTrue}>
                                <Iconify icon="mdi:qrcode" width={24} />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <InputLabel htmlFor="publicFormFirstHeading">
                      What will be the Title on the Public form?
                    </InputLabel>
                    <TextField
                      fullWidth
                      {...getFieldProps('publicFormFirstHeading')}
                      error={Boolean(
                        touched.publicFormFirstHeading && errors.publicFormFirstHeading
                      )}
                      helperText={touched.publicFormFirstHeading && errors.publicFormFirstHeading}
                      sx={{ mb: 3 }}
                    />

                    <InputLabel htmlFor="publicFormFirstSubHeading">
                      What will be the Sub-Title on the Public form?
                    </InputLabel>
                    <TextField
                      fullWidth
                      {...getFieldProps('publicFormFirstSubHeading')}
                      error={Boolean(
                        touched.publicFormFirstSubHeading && errors.publicFormFirstSubHeading
                      )}
                      helperText={
                        touched.publicFormFirstSubHeading && errors.publicFormFirstSubHeading
                      }
                      sx={{ mb: 3 }}
                    />
                  </Stack>
                  {values.signingEvent && (
                    <Stack spacing={3} alignItems="flex-end">
                      <Stack spacing={2} sx={{ width: 1 }}>
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                          Signing Event
                        </Typography>
                        <InputLabel htmlFor="useDocusign">Signing Event Type</InputLabel>
                        <Select
                          {...getFieldProps('useDocusign')}
                          value={values?.useDocusign}
                          error={Boolean(touched?.useDocusign && errors?.useDocusign)}
                          onChange={(item) => {
                            setFieldValue('useDocusign', item.target.value);
                          }}
                        >
                          {/* @ts-ignore */}
                          <MenuItem value={true}>Docusign</MenuItem>
                          {/* <MenuItem value="finpaceDynamicSign">
                            Finpace Dynamic Document Sign
                          </MenuItem> */}
                          {/* @ts-ignore */}
                          <MenuItem value={false}>Finpace Sign</MenuItem>
                        </Select>
                      </Stack>
                      {values.useDocusign && (
                        <Stack spacing={2} sx={{ width: 1 }}>
                          <InputLabel htmlFor="routing">
                            Authentication mode for signing documents
                          </InputLabel>
                          <Select
                            {...getFieldProps('authenticationMode')}
                            value={values?.authenticationMode}
                            error={Boolean(
                              touched?.authenticationMode && errors?.authenticationMode
                            )}
                            onChange={(item) => {
                              setFieldValue('authenticationMode', item.target.value);
                            }}
                          >
                            <MenuItem value="noAuth">No Authentication</MenuItem>
                            <MenuItem value="accessCode">
                              Access Code (Last 4 digits of SSN)
                            </MenuItem>
                            <MenuItem value="sms">Via SMS</MenuItem>
                          </Select>
                        </Stack>
                      )}
                    </Stack>
                  )}

                  <Stack spacing={3} alignItems="flex-end">
                    <Stack spacing={2} sx={{ width: 1 }}>
                      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                        Automations
                      </Typography>
                      {/* <>
                        <InputLabel htmlFor="sendDisclosuresWhen">
                          What disclosures should be sent?
                        </InputLabel>
                        <Stack direction="row" spacing={2}>
                          <FormControlLabel
                            labelPlacement="end"
                            control={
                              <Checkbox
                                {...getFieldProps('disclosures.firm')}
                                checked={values.disclosures.firm}
                              />
                            }
                            label={
                              <>
                                <Typography variant="body2">Firm Disclosures</Typography>
                              </>
                            }
                          />
                          <FormControlLabel
                            labelPlacement="end"
                            control={
                              <Checkbox
                                {...getFieldProps('disclosures.advisor')}
                                checked={values.disclosures.advisor}
                              />
                            }
                            label={
                              <>
                                <Typography variant="body2">Advisor Disclosures</Typography>
                              </>
                            }
                          />
                        </Stack>
                      </> */}
                      <>
                        <InputLabel htmlFor="sendDisclosuresWhen">
                          What email template should be sent to the client on form completion?
                        </InputLabel>
                        <Select
                          {...getFieldProps('emailToClientOnFormCompletion')}
                          error={Boolean(
                            touched.emailToClientOnFormCompletion &&
                              errors.emailToClientOnFormCompletion
                          )}
                          placeholder="Select Email Template"
                          value={values.emailToClientOnFormCompletion}
                          onChange={(item) => {
                            setFieldValue('emailToClientOnFormCompletion', item.target.value);
                            setValuesUpdated(true);
                          }}
                          inputProps={{
                            name: 'emailToClientOnFormCompletion',
                            id: 'emailToClientOnFormCompletion',
                          }}
                        >
                          <MenuItem value="none">None</MenuItem>
                          {emailTemplates?.map((item) => (
                            <MenuItem key={item.emailTemplateId} value={item.emailTemplateId}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {Boolean(
                          touched.emailToClientOnFormCompletion &&
                            errors.emailToClientOnFormCompletion
                        ) && (
                          <FormHelperText
                            error={Boolean(
                              touched.emailToClientOnFormCompletion &&
                                errors.emailToClientOnFormCompletion
                            )}
                          >
                            {touched.emailToClientOnFormCompletion &&
                              errors.emailToClientOnFormCompletion}
                          </FormHelperText>
                        )}
                      </>
                    </Stack>
                  </Stack>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          {...getFieldProps('redirectOnComplete')}
                          checked={values.redirectOnComplete}
                        />
                      }
                      label="Redirect user after completion"
                    />
                  </Grid>
                  {values.redirectOnComplete && (
                    <Grid item xs={12}>
                      <TextField
                        label="Complete Button Text"
                        fullWidth
                        {...getFieldProps('completeButtonText')}
                        error={Boolean(touched.completeButtonText && errors.completeButtonText)}
                        helperText={touched.completeButtonText && errors.completeButtonText}
                      />
                    </Grid>
                  )}
                  {values.redirectOnComplete && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Redirect URL"
                        {...getFieldProps('redirectUrl')}
                        error={Boolean(touched.redirectUrl && errors.redirectUrl)}
                        helperText={touched.redirectUrl && errors.redirectUrl}
                      />
                    </Grid>
                  )}
                  {values.redirectOnComplete && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Heading"
                        {...getFieldProps('onCompleteHeading')}
                        error={Boolean(touched.onCompleteHeading && errors.onCompleteHeading)}
                        helperText={
                          (touched.onCompleteHeading && errors.onCompleteHeading) ||
                          'This will be the heading shown on the redirect page'
                        }
                      />
                    </Grid>
                  )}
                  {values.redirectOnComplete && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Sub Heading"
                        {...getFieldProps('onCompleteSubHeading')}
                        error={Boolean(touched.onCompleteSubHeading && errors.onCompleteSubHeading)}
                        helperText={
                          (touched.onCompleteSubHeading && errors.onCompleteSubHeading) ||
                          'This will be the sub heading shown on the redirect page'
                        }
                      />
                    </Grid>
                  )}
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ py: 3, px: 3 }}>
                <Stack
                  sx={{
                    mb: 4,
                  }}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Button
                    onClick={() => {
                      window.history.replaceState(
                        {},
                        '',
                        `${window.location.pathname}?builder=true`
                      );
                      setOpenBuilder(true);
                    }}
                    startIcon={<Iconify icon="mdi:design" />}
                    variant="outlined"
                  >
                    Template Builder
                  </Button>

                  <Label
                    color={values.inactive ? 'error' : 'success'}
                    sx={{ textTransform: 'uppercase' }}
                  >
                    {values.inactive ? 'Inactive' : 'Active'}
                  </Label>
                </Stack>

                <FormControlLabel
                  labelPlacement="start"
                  key="surveyJsEnabled"
                  control={
                    <Switch
                      {...getFieldProps('surveyJsEnabled')}
                      checked={values.surveyJsEnabled}
                    />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Use FormBuilder V2?
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Use the new FormBuilder V2 to create and manage this template.
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
                />

                <FormControlLabel
                  labelPlacement="start"
                  key="useForOutreachDate"
                  control={
                    <Switch
                      {...getFieldProps('useForOutreachDate')}
                      checked={values.useForOutreachDate}
                    />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Use for outreach date?
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        The date this form is first sent out for prospect review and completion{' '}
                        {values.useForOutreachDate ? 'will' : 'will not'} be used for setting the
                        client's first outreach date.
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
                />

                <FormControlLabel
                  labelPlacement="start"
                  key="useForOnboardingDate"
                  control={
                    <Switch
                      {...getFieldProps('useForOnboardingDate')}
                      checked={values.useForOnboardingDate}
                    />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Use for onboarding date?
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        The date this form is first completed{' '}
                        {values.useForOnboardingDate ? 'will' : 'will not'} be used for setting the
                        client's onboarding date.
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
                />

                <FormControlLabel
                  labelPlacement="start"
                  control={
                    <Switch {...getFieldProps('inactive')} checked={Boolean(values.inactive)} />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Inactive
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        The template is {values.inactive ? 'inactive' : 'active'}
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
                />

                <FormControlLabel
                  labelPlacement="start"
                  key="signingEvent"
                  control={
                    <Switch {...getFieldProps('signingEvent')} checked={values.signingEvent} />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Is this a signing event?
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <FormControlLabel
                  labelPlacement="start"
                  key="orion"
                  control={<Switch {...getFieldProps('orion')} checked={values.orion} />}
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Include Orion?
                      </Typography>
                    </>
                  }
                  sx={{ mt: 1.5, mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <FormControlLabel
                  labelPlacement="start"
                  key="clientCanCompleteForm"
                  control={
                    <Switch
                      {...getFieldProps('clientCanCompleteForm')}
                      checked={values.clientCanCompleteForm}
                    />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Client can complete the form on their own?
                      </Typography>
                    </>
                  }
                  sx={{ mt: 1.5, mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <FormControlLabel
                  labelPlacement="start"
                  key="isDataSecureInPublicForms"
                  control={
                    <Switch
                      {...getFieldProps('isDataSecureInPublicForms')}
                      checked={values.isDataSecureInPublicForms}
                    />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Sensitive Data?
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <FormControlLabel
                  labelPlacement="start"
                  key="addFirmLogoOnForm"
                  control={
                    <Switch
                      {...getFieldProps('addFirmLogoOnForm')}
                      checked={values.addFirmLogoOnForm}
                    />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Add Firm Logo on Form?
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                {isGWN(firm.id) && (
                  <FormControlLabel
                    labelPlacement="start"
                    key="showFundAllocator"
                    control={
                      <Switch
                        {...getFieldProps('showFundAllocator')}
                        checked={values.showFundAllocator}
                      />
                    }
                    label={
                      <>
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                          Add Fund Allocator?
                        </Typography>
                      </>
                    }
                    sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                  />
                )}
              </Card>
            </Grid>
          </Grid>
          <Fab
            type="submit"
            size="medium"
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              width: 150,
              borderRadius: 1.5,
              zIndex: 999,
            }}
            variant="extended"
            disabled={!dirty || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Fab>
        </Form>
      </FormikProvider>
      <Dialog disableEnforceFocus fullScreen open={openBuilder} onClose={onCloseBuilder}>
        {values?.surveyJsEnabled ? (
          <SurveyjsBuilder onCloseBuilder={onCloseBuilder} template={template} />
        ) : (
          <Stack
            sx={{
              flex: 1,
              background: (theme) => theme.palette.background.neutral,
            }}
          >
            <Stack
              sx={{
                py: 3,
                px: 5,
                position: 'sticky',
                top: 0,
                zIndex: 11,
                background: (theme) => theme.palette.background.paper,
              }}
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h5">{template?.title}</Typography>
              <IconButton onClick={onCloseBuilder}>
                <Iconify icon="mdi:close" />
              </IconButton>
            </Stack>

            <Container
              sx={{
                flex: 1,
                paddingY: 5,
              }}
              maxWidth="xl"
            >
              <FormBuilder
                template={template as any}
                onFormUpdate={(data: any) => {
                  setFormUpdates(data);
                }}
                formUpdates={formUpdates}
                setSave={setSave}
              />
            </Container>
          </Stack>
        )}
      </Dialog>
      <ConfirmDialog
        open={openQRCode.value}
        onClose={openQRCode.onFalse}
        title="QR Code"
        content={
          <Stack>
            <Label
              sx={{
                mb: 2,
                mx: 'auto',
                px: 2,
                textTransform: 'uppercase',
              }}
              color="default"
            >
              Scan this QR code to open form
            </Label>
            <QRCodeSVG
              width="100%"
              height="100%"
              level="L"
              fgColor={theme?.palette.primary.main}
              bgColor={theme?.palette.background.paper}
              value={publicUrl}
            />
            <Typography
              sx={{
                mt: 2,
                textAlign: 'center',
              }}
              variant="h5"
            >
              {values.title}
            </Typography>
          </Stack>
        }
      />
    </>
  );
}
