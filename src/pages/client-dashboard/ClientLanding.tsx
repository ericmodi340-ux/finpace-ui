// @mui
import {
  Grid,
  Container,
  Typography,
  Card,
  Stack,
  IconButton,
  Popover,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Checkbox,
} from '@mui/material';
// @types
import { UserRole } from '../../@types/user';
// redux
import { useDispatch, useSelector } from 'redux/store';
// hooks
import useUser from 'hooks/useUser';
// components
import Page from 'components/Page';
// sections
import { Contacts, Firm } from 'sections/@dashboard/general/widgets';
import * as Yup from 'yup';
import { AdvisorContact } from 'sections/@dashboard/general/widgets/Contacts';
// constants
import { roles } from 'constants/users';
import { cloneDeep, isEmpty, isEqual, omitBy } from 'lodash';
import clientInitialFormValues from 'sections/@dashboard/client/profile/utils/clientFormInitialValues';
import { ClientInvestorFields, ClientManager } from '../../@types/client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InvestorSchema } from 'sections/@dashboard/client/profile/utils/clientSchema';
import { useEffect, useMemo, useState } from 'react';
import { mapFieldsToClient } from 'sections/@dashboard/client/profile/utils';
import { updateClient } from 'redux/slices/client';
import { getSigningStatus } from 'utils/envelopes';
import { getSigningStatus as getFormSigningStatus } from 'utils/forms';
import { useSnackbar } from 'notistack';
import ClientInfoFormCard from 'sections/@dashboard/client/profile/ClientInfoFormCard';
import FormProvider from 'components/hook-form/FormProvider';
import { LoadingButton } from '@mui/lab';
import arrayFromObj from 'utils/arrayFromObj';
import SvgIconStyle from 'components/SvgIconStyle';
import { usePopover } from 'components/custom-popover';
import useSettings from 'hooks/useSettings';
import PendingActionsClients from 'components/PendingActionsClient';
import { EnvelopeSigningStatus } from '../../@types/envelope';
import { getForms } from 'redux/slices/forms';
import { getTemplates } from 'redux/slices/templates';
import { getEnvelopes } from 'redux/slices/envelopes';
import { getCustomFieldFormScheme } from 'utils/custom-fields';

// ----------------------------------------------------------------------

export default function ClientLanding() {
  const { user } = useUser();
  const { firm } = useSelector((state) => state.firm);
  const { advisor } = useSelector((state) => state.advisor);
  const forms = useSelector((state) => state.forms);
  const { envelopes, loaded: envelopeLoaded } = useSelector((state) => state.envelopes);
  const { authUser } = useUser();
  const dispatch = useDispatch();

  const [selectedOptions, setSelectedOptions] = useState<string | null>(null);
  const { loaded: templatedLoaded } = useSelector((state) => state.templates);

  useEffect(() => {
    if (!forms.loaded) {
      dispatch(getForms());
    }
    if (!templatedLoaded) {
      dispatch(getTemplates());
    }
    if (!envelopeLoaded) {
      dispatch(getEnvelopes());
    }
  }, [dispatch, envelopeLoaded, forms.loaded, templatedLoaded]);

  const [showAll, setShowAll] = useState(false);

  const formsArray = useMemo(
    () => arrayFromObj(forms.byId, forms.allIds),
    [forms.byId, forms.allIds]
  );

  const formsData = useMemo(
    () =>
      formsArray.reduce(
        (acc, form: any) => {
          const status = getFormSigningStatus(form);
          if (!acc[status]) acc[status] = [];
          acc[status].push(form);
          return acc;
        },
        {} as { [id: string]: any[] }
      ),
    [formsArray]
  );

  const envelopesData = useMemo(
    () =>
      envelopes.reduce(
        (acc, envelope) => {
          const status = getSigningStatus(envelope);
          if (!acc[status]) acc[status] = [];
          acc[status].push(envelope);
          return acc;
        },
        {} as { [key in EnvelopeSigningStatus]: any[] }
      ),
    [envelopes]
  );

  const pendingFormsArray = useMemo(() => {
    const formsAwaitingClient = formsData['Awaiting Client']?.map((item: any) => ({
      type: 'form',
      data: item,
      date: item?.dateSent || new Date(),
    }));

    const formDraftOnClient = formsData?.draft
      ?.filter((item: any) => item?.currentReviewerRole === UserRole?.CLIENT)
      ?.map((item: any) => ({
        type: 'draft',
        data: item,
        date: item?.createdAt || new Date(),
      }));

    return [...(formsAwaitingClient || []), ...(formDraftOnClient || [])];
  }, [formsData]);

  const pendingEnvelopesArray = useMemo(
    () =>
      envelopesData['Awaiting Client']?.map((item) => ({
        type: 'envelope',
        data: item,
        date: item?.sentAt || new Date(),
      })),
    [envelopesData]
  );

  const pendingActionsArray = [
    ...(pendingEnvelopesArray || []),
    ...(pendingFormsArray || []),
  ]?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const popover = usePopover();

  const { enqueueSnackbar } = useSnackbar();

  const initialValues = {
    ...cloneDeep(clientInitialFormValues),
    ...user,
  };

  const NewSchema = useMemo(() => {
    const fieldsArray = Object.values(firm?.clientFields?.fields || {});
    const onlyVisibleFieldsArray = [
      ...(firm?.clientFields?.groups?.flatMap((group) =>
        group.isHidden || (authUser?.role === roles.CLIENT && group?.hideFromClient)
          ? []
          : group?.fields || []
      ) || []),
    ];

    const filteredFieldsArray = fieldsArray?.filter((field) =>
      onlyVisibleFieldsArray?.includes(field.key)
    );

    return InvestorSchema.concat(
      Yup.object().shape({
        custom: Yup.object().shape({
          ...filteredFieldsArray?.reduce(
            (acc, field) => ({ ...acc, ...getCustomFieldFormScheme(field, true) }),
            {}
          ),
        }),
      })
    );
  }, [authUser?.role, firm?.clientFields?.fields, firm?.clientFields?.groups]);

  const methods = useForm<Partial<ClientInvestorFields>>({
    resolver: yupResolver(NewSchema) as any,
    // @ts-ignore
    defaultValues: {
      ...NewSchema?.cast(initialValues, {
        stripUnknown: true,
        assert: false,
      }),
      // @ts-ignore
      custom: NewSchema?.fields?.custom?.cast(initialValues?.custom || {}),
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  useEffect(() => {
    if (user) {
      reset({
        ...cloneDeep(clientInitialFormValues),
        ...user,
      });
    }
  }, [user, reset]);

  const onSave = async (values: Partial<ClientManager>) => {
    try {
      const userUpdated = mapFieldsToClient(values);

      // @ts-ignore
      const changedFields = omitBy(userUpdated, (v, k) => isEqual(v, user?.[k]));

      if (!isEmpty(values?.custom)) {
        changedFields.custom = {
          // @ts-ignore
          ...user?.custom,
          ...values.custom,
        };
      }

      const response = await updateClient(user?.id || '', {
        ...changedFields,
      });
      reset(response);
      enqueueSnackbar('Account Information updated', { variant: 'success' });
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const { themeMode } = useSettings();

  if (!firm?.clientFields?.groups?.length) return null;

  return (
    <Page title="Dashboard">
      <Container>
        {/* <Typography variant="h4" sx={{ mb: 5 }} data-test="dashboard-welcome-heading">
          Welcome back,{' '}
          {user?.name ? firstWord(user?.name) : authUser?.name ? authUser.name : 'friend'}!
        </Typography> */}

        <Grid container spacing={5}>
          {!!pendingActionsArray?.length && (
            <Grid item container spacing={2}>
              <Grid item xs={12}>
                <Stack
                  flexDirection={{ sm: 'row' }}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    mt: 3,
                  }}
                >
                  <Typography variant="h5">Unfinished Tasks</Typography>
                  <Stack direction="row" spacing={2}>
                    <IconButton onClick={popover.onOpen}>
                      <SvgIconStyle
                        src={
                          selectedOptions
                            ? `/icons/task-filter-active-${themeMode}-mode.svg`
                            : `/icons/task-filter-${themeMode}-mode.svg`
                        }
                      />
                      {/* <Iconify
                            icon={selectedOptions ? 'mdi:filter-cog' : `mdi:filter-outline`}
                          /> */}
                    </IconButton>
                    <Popover
                      open={!!popover.open}
                      anchorEl={popover.open}
                      onClose={popover.onClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                    >
                      <Stack>
                        {[
                          {
                            label: 'Forms',
                            value: 'form',
                          },
                          {
                            label: 'Envelopes',
                            value: 'envelope',
                          },
                        ].map((option) => (
                          <MenuItem
                            key={option.value}
                            onClick={() => {
                              if (selectedOptions === option.value) {
                                setSelectedOptions(null);
                              } else {
                                setSelectedOptions(option.value);
                              }
                            }}
                            value={option.value}
                          >
                            <ListItemIcon>
                              <Checkbox checked={selectedOptions === option.value} />
                            </ListItemIcon>
                            <ListItemText primary={option.label} />
                          </MenuItem>
                        ))}
                      </Stack>
                    </Popover>
                    <Button variant="outlined" color="primary" onClick={() => setShowAll(!showAll)}>
                      {showAll ? 'View Less' : 'View All'}
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <PendingActionsClients
                  showAll={showAll}
                  selectedOptions={selectedOptions}
                  pendingActionsArray={pendingActionsArray}
                />
              </Grid>
            </Grid>
          )}

          <Grid item xs={12}>
            <FormProvider methods={methods} onSubmit={handleSubmit(onSave)}>
              <Card>
                <Stack p={3} direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" data-test="dashboard-welcome-heading">
                    Account Information
                  </Typography>
                  <LoadingButton
                    loading={isSubmitting}
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Save Changes
                  </LoadingButton>
                </Stack>
                {firm && (
                  <ClientInfoFormCard
                    clientId={user?.id || ''}
                    // @ts-ignore
                    customFields={user?.custom}
                  />
                )}
              </Card>
            </FormProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <Contacts
              title="Your Advisor"
              contacts={[
                {
                  ...advisor,
                  type: advisor?.isFirmAdmin
                    ? (roles.FIRM_ADMIN as UserRole.FIRM_ADMIN)
                    : (roles.ADVISOR as UserRole.ADVISOR),
                } as AdvisorContact,
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Firm title="Your Firm" firm={firm} />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
