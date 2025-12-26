import { Box, Grid, Skeleton, TablePagination, Typography } from '@mui/material';
import { FormManager } from '../../../../@types/form';
import { FormCard } from './ClientFormsDocuments';
import { useState } from 'react';
import useUserForms from 'hooks/useUserForms';
import { roles } from 'constants/users';
import { UserRole } from '../../../../@types/user';

interface FormCardsProps {
  forms: FormManager[];
}

interface ClientPendingFormCardsProps {
  clientId: string;
  isClient: boolean | undefined;
  isProspect: boolean | undefined;
}

interface MessageProps {
  isClient: boolean | undefined;
  clientType: string;
}

const LoadingSkeletons = () => (
  <Grid container spacing={3}>
    {[...Array(3)].map((_, idx) => (
      <Grid key={idx} item xs={12} md={6}>
        <Skeleton variant="rectangular" />
      </Grid>
    ))}
  </Grid>
);

const FormCards = ({ forms }: FormCardsProps) => {
  const [cardsPerPage, setCardsPerPage] = useState(6);
  const [page, setPage] = useState(0);

  const indexOfLastRow = (page + 1) * cardsPerPage;
  const indexOfFirstRow = indexOfLastRow - cardsPerPage;
  const formsList = forms?.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <>
      <Grid container spacing={3} sx={{ pt: 4 }}>
        {formsList.map((form) => (
          <Grid key={form.id} item xs={12} md={6}>
            <FormCard form={form} />
          </Grid>
        ))}
      </Grid>
      <Grid item xs={12} justifyContent="flex-end" sx={{ paddingLeft: '0 !important' }}>
        <TablePagination
          rowsPerPage={cardsPerPage}
          rowsPerPageOptions={[6, 10, 20]}
          component="div"
          count={forms?.length}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setCardsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Grid>
    </>
  );
};

const Message = ({ isClient, clientType }: MessageProps) => {
  const message = isClient
    ? "You're all caught up!"
    : `No pending forms found for this ${clientType}`;

  return (
    <Box sx={{ my: 3 }}>
      <Typography variant="caption" noWrap>
        {message}
      </Typography>
    </Box>
  );
};

const ClientPendingFormCards = ({
  clientId,
  isClient,
  isProspect,
}: ClientPendingFormCardsProps) => {
  const { forms, pendingForms, loading } = useUserForms(clientId, roles.CLIENT as UserRole.CLIENT);
  const clientType = isProspect ? 'prospect' : 'client';

  if (loading || !forms) {
    return <LoadingSkeletons />;
  }

  if (forms && pendingForms?.length) {
    return <FormCards forms={pendingForms} />;
  }

  return <Message isClient={isClient} clientType={clientType} />;
};

export default ClientPendingFormCards;
