import { useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { sentenceCase } from 'change-case';
// @mui
import { LoadingButton } from '@mui/lab';
import { Grid, Typography, Stack, Button } from '@mui/material';
// @types
import { ClientInvestorFields, ClientManager } from '../../../../@types/client';
// components
// redux
import { updateClient } from 'redux/slices/clients';
// config
import FormProvider from '../../../../components/hook-form';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ClientInfoFormCard from './ClientInfoFormCard';
import { InvestorSchema } from './utils/clientSchema';
import clientInitialFormValues from './utils/clientFormInitialValues';
import { mapFieldsToClient } from './utils';
import { Link } from 'react-router-dom';
import { PATH_DASHBOARD } from 'routes/paths';
import { useSelector } from 'redux/store';
import { getCustomFieldFormScheme } from 'utils/custom-fields';
import { isEmpty, isEqual, omitBy } from 'lodash';
import useUser from 'hooks/useUser';
import { roles } from 'constants/users';

// ----------------------------------------------------------------

type ClientFirstInvestorProps = {
  currentClient?: ClientManager;
  clientId: string;
};

export default function ClientFirstInvestor({ currentClient, clientId }: ClientFirstInvestorProps) {
  const { enqueueSnackbar } = useSnackbar();

  const { firm } = useSelector((state) => state.firm);
  const { authUser } = useUser();

  const clientType = currentClient?.isProspect ? 'prospect' : 'client';
  const clientSince = useMemo(
    () => currentClient && new Date(currentClient.createdAt).toLocaleDateString(),
    [currentClient]
  );

  const initialValues = {
    ...clientInitialFormValues,
    ...currentClient,
  };

  const NewSchema = useMemo(() => {
    const fieldsArray = Object.values(firm?.clientFields?.fields || {});
    const onlyVisibleFieldsArray = [
      ...(firm?.clientFields?.groups || []).flatMap((group) =>
        group.isHidden || (authUser?.role === roles.CLIENT && group.hideFromClient)
          ? []
          : group?.fields || []
      ),
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
      ...NewSchema.cast(initialValues, {
        stripUnknown: true,
        assert: false,
      }),
      // @ts-ignore
      custom: NewSchema.fields.custom.cast(initialValues.custom || {}),
      // custom: currentClient?.custom || {},
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    getValues,
  } = methods;

  const onSubmit = async (values: Partial<ClientManager>) => {
    try {
      const newClient = mapFieldsToClient(values);
      // @ts-ignore
      const changedFields = omitBy(newClient, (v, k) => isEqual(v, currentClient?.[k]));

      if (!isEmpty(values.custom)) {
        changedFields.custom = {
          ...currentClient?.custom,
          ...values.custom,
        };
      }

      if (!isEmpty(changedFields)) {
        await updateClient(clientId, changedFields);
      }
      enqueueSnackbar(`${sentenceCase(clientType)} was updated!`, { variant: 'success' });
    } catch (error: any) {
      if (error?.response?.data?.error) {
        enqueueSnackbar(error?.response?.data?.error, { variant: 'error' });
        return;
      }
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ClientInfoFormCard clientId={clientId} customFields={currentClient?.custom} />
          <Stack
            flexShrink={0}
            justifyContent="space-between"
            mt={3}
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={2}
          >
            <Typography variant="subtitle2">Client Since: {clientSince}</Typography>
            <Stack
              mt={3}
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={2}
            >
              {/* {currentClient && (
                <PrefillButton resetValues={resetValues} currentClient={currentClient} />
              )} */}
              <Button
                variant="outlined"
                component={Link}
                sx={{
                  width: 150,
                }}
                to={`${PATH_DASHBOARD.forms.new}?clientId=${currentClient?.id}`}
              >
                New Form
              </Button>
              <LoadingButton size="medium" type="submit" variant="contained" loading={isSubmitting}>
                Save Changes
              </LoadingButton>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
