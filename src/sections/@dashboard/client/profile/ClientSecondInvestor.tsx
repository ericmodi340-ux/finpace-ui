import { useSnackbar } from 'notistack';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  Tooltip,
  Typography,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
} from '@mui/material';
// @types
import { ClientInvestorFields, ClientManager } from '../../../../@types/client';
// redux
import { updateClient } from 'redux/slices/clients';
import clientInitialFormValues from './utils/clientFormInitialValues';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InvestorSchema } from './utils/clientSchema';
import FormProvider from 'components/hook-form/FormProvider';
import ClientInfoFormCard from './ClientInfoFormCard';
import { useMemo, useState } from 'react';
import * as Yup from 'yup';
import { sentenceCase } from 'change-case';
import { mapFieldsToClient } from './utils';
import { useSelector } from 'redux/store';
import { getCustomFieldFormScheme } from 'utils/custom-fields';
import { roles } from 'constants/users';
import useUser from 'hooks/useUser';

// ----------------------------------------------------------------------

type ClientSecondInvestorProps = {
  currentClient?: ClientManager;
  clientId: string;
};

export default function ClientSecondInvestor({
  currentClient,
  clientId,
}: ClientSecondInvestorProps) {
  const [includeSecondInvestor, setIncludeSecondInvestor] = useState(
    currentClient?.includeSecondInvestor
  );
  const { enqueueSnackbar } = useSnackbar();

  const { authUser } = useUser();

  const { firm } = useSelector((state) => state.firm);

  const clientType = currentClient?.isProspect ? 'prospect' : 'client';

  const NewSchema = useMemo(() => {
    const fieldsArray = Object.values(firm?.clientFields?.fields || {});
    const onlyVisibleFieldsArray = [
      ...firm?.clientFields?.groups?.flatMap((group) =>
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

  const initialValues = {
    ...clientInitialFormValues,
    ...currentClient?.secondInvestor,
  };

  const methods = useForm<Partial<ClientInvestorFields>>({
    resolver: yupResolver(NewSchema) as any,
    // @ts-ignore
    defaultValues: {
      ...NewSchema.cast(initialValues, {
        stripUnknown: true,
        assert: false,
      }),
      // @ts-ignore
      custom: NewSchema.fields.custom.cast(initialValues?.custom || {}),
      // custom: currentClient?.custom || {},
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (values: Partial<ClientManager>) => {
    try {
      const newClient = {
        secondInvestor: {
          ...(mapFieldsToClient(values) as ClientManager),
          custom: values?.custom || {},
        },
      };
      const response = await updateClient(clientId, newClient);
      reset(response?.secondInvestor);
      enqueueSnackbar(`${sentenceCase(clientType)} was updated!`, { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const updateIncludeSecondInvestor = async (event: SelectChangeEvent) => {
    const { checked } = event.target as any;
    setIncludeSecondInvestor(checked);
    await updateClient(clientId, {
      includeSecondInvestor: checked,
    });
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ py: 2, px: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  labelPlacement="start"
                  control={
                    <Switch
                      onChange={updateIncludeSecondInvestor}
                      checked={Boolean(includeSecondInvestor)}
                    />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Include Joint Investor?
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Toggling this on will add a joint investor to the {clientType}'s account
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {Boolean(includeSecondInvestor) && (
          <>
            <Grid item xs={12}>
              <Tooltip
                title={
                  !includeSecondInvestor
                    ? 'Toggle on the Include Joint Investor switch in order to add joint investor details.'
                    : ''
                }
              >
                <ClientInfoFormCard
                  clientId={`${clientId}/secondInvestor`}
                  // @ts-ignore
                  customFields={currentClient?.secondInvestor?.custom || {}}
                />
              </Tooltip>
            </Grid>
            <Grid xs={12}>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  Save Changes
                </LoadingButton>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </FormProvider>
  );
}
