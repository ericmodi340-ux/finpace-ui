import { Grid, Typography, TablePagination } from '@mui/material';
import { FormCard } from './ClientFormsDocuments';
import useAdvisorTasks from 'hooks/useAdvisorTasks';
import { useSelector } from 'redux/store';

const AdvisorPendingFormCards = ({ clientId }: { clientId: string }) => {
  const { byId: formsById } = useSelector((state) => state.forms);
  const {
    formsList,
    formsAwaitingAdvisorReview,
    page,
    cardsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
  } = useAdvisorTasks(formsById, 6, clientId);

  return (
    <>
      <Grid item xs={12} sx={{ paddingLeft: '0 !important', mb: 2 }}>
        <Typography sx={{ py: 2 }} variant="h5">
          Advisor Pending Forms
        </Typography>
      </Grid>
      <Grid container spacing={3} minHeight={150}>
        {!formsList.length && (
          <Typography
            sx={{
              mt: 8,
              width: '100%',
              textAlign: 'center',
            }}
          >
            No pending forms found.
          </Typography>
        )}

        {formsList.map((form) => (
          <Grid key={form.id} item xs={12} md={6}>
            <FormCard form={form} />
          </Grid>
        ))}
      </Grid>

      {/* <Grid item xs={12} justifyContent="flex-end" sx={{ paddingLeft: '0 !important' }}>
        <TablePagination
          rowsPerPage={cardsPerPage}
          rowsPerPageOptions={[6, 10, 20]}
          component="div"
          count={formsAwaitingAdvisorReview?.length}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Grid> */}
    </>
  );
};

export default AdvisorPendingFormCards;
