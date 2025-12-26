import {
  Button,
  Card,
  Grid,
  IconButton,
  MenuItem,
  Popover,
  Portal,
  Stack,
  Typography,
} from '@mui/material';
import { EnvelopeManager, EnvelopeRecipient } from '../@types/envelope';
import { useSelector } from 'redux/store';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { EnvelopeMoreMenu } from 'sections/@dashboard/envelope/list';
import { FormManager } from '../@types/form';
import Scrollbar from './Scrollbar';
import Label from './Label';
import { PATH_DASHBOARD } from 'routes/paths';
import { formStatuses } from 'constants/forms';
import { sortEnvelopeRecipients } from 'utils/envelopes';
import useUser from 'hooks/useUser';
import { useState } from 'react';
import { usePopover } from './custom-popover';
import useSigningWindow from 'hooks/useSigningWindow';
import { LoadingButton } from '@mui/lab';

export default function PendingActionsClients({
  pendingActionsArray,
  showAll = false,
  selectedOptions,
}: {
  selectedOptions: string | null;
  pendingActionsArray: any[];
  showAll?: boolean;
}) {
  const filteredArray = pendingActionsArray.filter((item) =>
    !selectedOptions
      ? true
      : selectedOptions === 'form'
        ? item.type === 'form' || item.type === 'draft'
        : item.type === 'envelope'
  );

  return (
    <Scrollbar>
      <Grid sx={{ maxHeight: showAll ? 400 : 'auto' }} overflow="auto" container spacing={3}>
        {(showAll ? filteredArray : filteredArray?.slice(0, 3))?.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={Math.random()}>
            {item?.type === 'envelope' && <EnvelopeCard envelope={item.data as EnvelopeManager} />}
            {(item?.type === 'form' || item?.type === 'draft') && (
              <FormsCard isDraft={item?.type === 'draft'} form={item.data as FormManager} />
            )}
          </Grid>
        ))}
      </Grid>
    </Scrollbar>
  );
}

const EnvelopeCard = ({ envelope }: { envelope: EnvelopeManager }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const popover = usePopover();

  const { recipients, signingEventType = 'docusign' } = envelope;

  const getCurrentSignerIndex = (recipients: any): number =>
    recipients.findIndex((recipient: any) => recipient.status === formStatuses.SENT);
  const sortedRecipients = sortEnvelopeRecipients(recipients);
  const currentSignerIndex = getCurrentSignerIndex(sortedRecipients);

  const { openSigningWindow } = useSigningWindow(envelope);

  const handleSigning = async (recipient: EnvelopeRecipient) => {
    const { roleName, recipientId } = recipient;

    if (signingEventType === 'docusign') {
      setLoading(true);
      try {
        // @ts-ignore
        await openSigningWindow(roleName, recipientId);
        setLoading(false);
        popover.onClose();
      } catch {
        setLoading(false);
        popover.onClose();
      }
    }
    if (signingEventType === 'finpaceDynamicSign' || signingEventType === 'finpaceSign') {
      navigate(PATH_DASHBOARD.esign.envelope(envelope.id, recipient?.roleName));
    }
  };

  return (
    <>
      <Card
        key={envelope.id}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          padding: 2,
          borderRadius: 1,
        }}
      >
        <Stack width="80%" overflow="hidden">
          <Typography variant="subtitle1" noWrap>
            {envelope?.formTitle || '----'}
          </Typography>
          <Typography
            variant="body2"
            textOverflow="ellipsis"
            noWrap
            width={{ xs: 'auto', sm: 300 }}
          >
            Type: <span style={{ fontWeight: 'bold' }}>Envelope</span>
          </Typography>
          <Label
            sx={{
              maxWidth: 'fit-content',
              mt: 1,
            }}
            color="primary"
          >
            Awaiting Your Signatures
          </Label>
        </Stack>
        {sortedRecipients?.[currentSignerIndex]?.email === user?.email && (
          <LoadingButton
            // @ts-ignore
            onClick={() => handleSigning(sortedRecipients[currentSignerIndex])}
            variant="contained"
            size="small"
            sx={{
              width: 90,
            }}
            loading={loading}
          >
            Sign Now
          </LoadingButton>
        )}
      </Card>
    </>
  );
};

const FormsCard = ({ form, isDraft }: { form: FormManager; isDraft: boolean }) => (
  <Card
    sx={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: (theme) => `1px solid ${theme.palette.divider}`,
      padding: 2,
      borderRadius: 1,
    }}
  >
    <Stack width="80%" overflow="hidden">
      <Typography noWrap variant="subtitle1">
        {form?.formTitle || '----'}
      </Typography>

      <Typography variant="body2" textOverflow="ellipsis" noWrap width={{ xs: 'auto', sm: 300 }}>
        Type: <span style={{ fontWeight: 'bold' }}>Form</span>
      </Typography>
      <Label
        sx={{
          maxWidth: 'fit-content',
          mt: 1,
        }}
        color="secondary"
      >
        {isDraft ? 'Draft' : 'Awaiting Your Review'}
      </Label>
    </Stack>
    <Button
      variant="contained"
      component={RouterLink}
      to={`${PATH_DASHBOARD.forms.root}/${form.id}`}
      sx={{
        width: 90,
      }}
      size="small"
    >
      {isDraft ? 'Continue' : 'Review'}
    </Button>
  </Card>
);
