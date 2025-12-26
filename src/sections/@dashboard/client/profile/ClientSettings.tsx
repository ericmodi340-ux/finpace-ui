import { LoadingButton } from '@mui/lab';
import {
  DialogProps,
  Switch,
  Stack,
  FormControlLabel,
  Typography,
  Dialog,
  DialogTitle,
  MenuItem,
  Button,
} from '@mui/material';
import { UserStatus } from '../../../../@types/user';
import { RHFSelect, RHFSwitch } from 'components/hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ClientInvestorFields, ClientManager } from '../../../../@types/client';
import { useForm } from 'react-hook-form';
import { updateClient } from 'redux/slices/client';
import { useSnackbar } from 'notistack';
import { sentenceCase } from 'change-case';
import FormProvider from 'components/hook-form/FormProvider';
import { useSelector } from 'redux/store';
import { toArray } from 'lodash';
import useUser from 'hooks/useUser';
import { roles } from 'constants/users';

const ClientSettingsSchema = Yup.object().shape({
  isProspect: Yup.boolean(),
  isVerified: Yup.boolean(),
  status: Yup.string().nullable(),
  advisorId: Yup.string().nullable(),
});

type Props = DialogProps & {
  onClose: () => void;
  currentClient?: ClientManager;
};

export default function ClientSettings({ onClose, currentClient, ...props }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const advisors = useSelector((state) => state.advisors);
  const advisorsArray = toArray(advisors.byId);
  const { authUser } = useUser();

  const isAdmin = authUser?.role === roles.FIRM_ADMIN;

  const clientType = currentClient?.isProspect ? 'prospect' : 'client';

  const methods = useForm<Partial<ClientInvestorFields>>({
    resolver: yupResolver(ClientSettingsSchema) as any,
    defaultValues: {
      isProspect: currentClient?.isProspect || false,
      isVerified: currentClient?.isVerified || false,
      status: currentClient?.status || UserStatus.ACTIVE,
      advisorId: currentClient?.advisorId || '',
    },
  });

  const {
    setValue,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateClient(currentClient?.id || '', values);
      enqueueSnackbar(`${sentenceCase(clientType)} was updated!`, { variant: 'success' });
    } catch (error: any) {
      if (error?.response?.data?.error) {
        enqueueSnackbar(error?.response?.data?.error, { variant: 'error' });
        return;
      }
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  });

  return (
    <Dialog {...props} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{sentenceCase(clientType)} Settings</DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack
          spacing={3}
          sx={{
            p: 3,
          }}
        >
          {isAdmin && (
            <RHFSelect id="new-advisor" name="advisorId" label="Advisor">
              {advisorsArray?.map(
                (option) =>
                  option?.name && (
                    <MenuItem key={option.id} value={option?.id}>
                      {option?.name} {`(${option?.email})`}
                    </MenuItem>
                  )
              )}
            </RHFSelect>
          )}
          <RHFSwitch
            name="isProspect"
            labelPlacement="start"
            label={
              <>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Is a Prospect
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {watch('isProspect')
                    ? 'Toggling this off will move them to the client list.'
                    : 'Toggling this on will move them to the prospect list.'}
                </Typography>
              </>
            }
            sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
          />
          <FormControlLabel
            labelPlacement="start"
            control={
              <Switch
                onChange={(event) => {
                  const checked = event.target.checked ? UserStatus.ACTIVE : UserStatus.INACTIVE;
                  setValue('status', checked as never);
                }}
                checked={watch('status') === UserStatus.ACTIVE}
              />
            }
            label={
              <>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Active
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Toggling this off will disable the {clientType}'s account
                </Typography>
              </>
            }
            sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
          />

          <Stack
            mt={3}
            direction="row"
            spacing={2}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <Button onClick={onClose}>Cancel</Button>
            <LoadingButton
              type="submit"
              onClick={onSubmit}
              variant="contained"
              loading={isSubmitting}
            >
              Save Changes
            </LoadingButton>
          </Stack>
        </Stack>
      </FormProvider>
    </Dialog>
  );
}
