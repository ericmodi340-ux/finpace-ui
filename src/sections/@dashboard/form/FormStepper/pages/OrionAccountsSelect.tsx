import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Container, Card, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormProvider, { RHFAutocomplete } from 'components/hook-form';
import { useSelector } from 'redux/store';
import { FormManager } from '../../../../../@types/form';
import { getOrionAccounts } from 'redux/slices/integrationsFirm';
import { ClientManager } from '../../../../../@types/client';
import objFromArray from 'utils/objFromArray';
import { isArray } from 'lodash';

const AccountSelectSchema = Yup.object().shape({
  accountId: Yup.array().of(Yup.string()),
});

type Props = {
  currentForm: FormManager;
  onContinue: VoidFunction;
  handleSetForm: (v: any) => void;
  selectedClient: ClientManager;
};

export default function OrionAccountSelect({
  currentForm,
  onContinue,
  handleSetForm,
  selectedClient,
}: Props) {
  const { orionAccounts, isLoading } = useSelector((state) => state.integrationsFirm);

  useEffect(() => {
    if (selectedClient?.firmId && selectedClient?.email && selectedClient?.secondInvestor?.email) {
      getOrionAccounts(
        selectedClient?.firmId,
        selectedClient.email,
        selectedClient.secondInvestor.email
      );
    } else {
      if (selectedClient?.firmId && selectedClient?.email) {
        getOrionAccounts(selectedClient?.firmId, selectedClient?.email);
      }
    }
  }, [selectedClient?.firmId, selectedClient?.email, selectedClient?.secondInvestor?.email]);

  const methods = useForm({
    // @ts-ignore
    resolver: yupResolver(AccountSelectSchema),
    defaultValues: {
      accountId:
        currentForm?.submission?.[`${currentForm?.templateId}::0`]?.orionAccountNumber?.split(
          ','
        ) || [],
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { accountId } = data;
      if (!isArray(accountId)) return;
      const updateForm = { orionAccountNumber: accountId?.join(', ') ?? '' };
      handleSetForm(updateForm);
      onContinue();
    } catch (error) {
      console.error(error);
    }
  });

  const orionAccountObj = useMemo(
    () => objFromArray(orionAccounts || [], 'number'),
    [orionAccounts]
  );

  const getOptionLabel = (option: string) => {
    if (orionAccountObj[option]?.name || orionAccountObj[option]?.number) {
      return `${orionAccountObj[option]?.name} - ${orionAccountObj[option]?.accountType} - ${orionAccountObj[option]?.number} (${orionAccountObj[option]?.currentValue})`;
    }
    return option;
  };

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 600 },
        mx: 'auto',
        my: {
          xs: 'auto',
          md: 10,
        },
        minHeight: '170px',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: 5,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
            }}
          >
            Select Custodial Accounts
          </Typography>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <RHFAutocomplete
              name="accountId"
              label="Custodial Accounts"
              freeSolo
              multiple
              options={orionAccounts?.map((account) => account.number) || []}
              getOptionLabel={getOptionLabel}
              sx={{
                mt: 3,
              }}
              loading={isLoading}
            />

            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              loadingIndicator="Loading..."
              sx={{ flex: 1, mt: 3 }}
            >
              Continue
            </LoadingButton>
          </FormProvider>
        </Card>
      </Container>
    </Box>
  );
}
