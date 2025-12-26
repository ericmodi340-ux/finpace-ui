import { Card, Grid, Stack, Typography } from '@mui/material';
import { EnvelopeManager } from '../@types/envelope';
import { useSelector } from 'redux/store';
import { EnvelopeMoreMenu } from 'sections/@dashboard/envelope/list';
import { FormManager } from '../@types/form';
import { FormMoreMenu } from 'sections/@dashboard/form/list';
import Scrollbar from './Scrollbar';
import Label from './Label';

export default function PendingActions({
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
      <Grid sx={{ maxHeight: showAll ? 400 : 'auto' }} pb={3} overflow="auto" container spacing={3}>
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
  const template = useSelector((state) => state.templates.byId);

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 2,
      }}
    >
      <Stack width="80%" overflow="hidden">
        <Typography variant="subtitle1">{envelope.client?.name || '----'}</Typography>
        <Typography variant="body2" textOverflow="ellipsis" noWrap width={{ xs: 'auto', sm: 300 }}>
          <span style={{ fontWeight: 'bold' }}>Envelope</span>:{' '}
          {template[envelope?.templateId || '']?.title || '----'}
        </Typography>
        <Label
          sx={{
            maxWidth: 'fit-content',
            mt: 1,
          }}
          color="primary"
        >
          Awaiting Advisor Signature
        </Label>
      </Stack>
      <EnvelopeMoreMenu envelope={envelope} isLoading={false} />
    </Card>
  );
};

const FormsCard = ({ form, isDraft }: { form: FormManager; isDraft: boolean }) => {
  const clients = useSelector((state) => state.clients.byId);

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 2,
      }}
    >
      <Stack width="80%" overflow="hidden">
        <Typography variant="subtitle1">{clients[form?.clientId]?.name || '----'}</Typography>

        <Typography variant="body2" textOverflow="ellipsis" noWrap width={{ xs: 'auto', sm: 300 }}>
          <span style={{ fontWeight: 'bold' }}>Form</span>: {form?.formTitle || '----'}
        </Typography>
        <Label
          sx={{
            maxWidth: 'fit-content',
            mt: 1,
          }}
          color="secondary"
        >
          {isDraft ? 'Draft' : 'Awaiting Advisor Review'}
        </Label>
      </Stack>
      <FormMoreMenu form={form} isLoading={false} onFormCancel={() => {}} />
    </Card>
  );
};
