import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Stack, Container, Card, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormProvider, { RHFAutocomplete } from 'components/hook-form';
import { useSelector } from 'redux/store';
import { statuses } from 'constants/users';
import { FormManager } from '../../../../../@types/form';

const AdvisorSelectSchema = Yup.object().shape({
  advisorId: Yup.string()?.nullable().required('Advisor is required'),
});

type Props = {
  currentForm: FormManager;
  handleSetForm: (v: any) => void;
};

export default function AdvisorSelect({ currentForm, handleSetForm }: Props) {
  const advisors = useSelector((state) => state.advisors);
  const clients = useSelector((state) => state.clients);

  const advisorsArray = useMemo(
    () =>
      advisors.allIds
        .map((id) => advisors.byId[id])
        .filter(
          (advisor) => advisor.isVerified && advisor.status && advisor.status !== statuses.INACTIVE
        ),
    [advisors.allIds, advisors.byId]
  );

  const formAdvisorId = useMemo(() => {
    const formAdvisor = advisors.byId[currentForm?.advisorId];
    const formAdvisorName = formAdvisor?.name;
    const formClient = clients.byId[currentForm?.clientId];
    const advisorFromClient = advisors.byId[formClient?.advisorId];
    return formAdvisorName ? currentForm?.advisorId : advisorFromClient?.id;
  }, [advisors.byId, clients.byId, currentForm]);

  const methods = useForm({
    // @ts-ignore
    resolver: yupResolver(AdvisorSelectSchema),
    defaultValues: {
      advisorId: formAdvisorId,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { advisorId } = data;
      const updateForm = { advisorId };
      handleSetForm(updateForm);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 600 },
        mx: 'auto',
        my: {
          xs: 'auto',
          md: 10,
        },
        minHeight: '210px',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 5 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
            }}
          >
            Who is the client working with?
          </Typography>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack
              sx={{
                mt: 3,
              }}
            >
              <RHFAutocomplete
                name="advisorId"
                label="Advisor"
                options={advisorsArray.map((option) => option?.id)}
                getOptionLabel={(option) =>
                  `${advisors.byId[option]?.name} (${advisors.byId[option]?.email})`
                }
                data-test="form-select-advisorId-input"
              />

              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                loading={isSubmitting}
                loadingIndicator="Loading..."
                sx={{ mt: 3 }}
                data-test="form-advisor-submit-button"
              >
                Continue
              </LoadingButton>
            </Stack>
          </FormProvider>
        </Card>
      </Container>
    </Box>
  );
}
