import React from 'react';
import { Typography, List, OutlinedInput, Divider, Grid } from '@mui/material';
import { Model, SummaryAllocation } from '../_@types';

const SummaryListItem = ({ fund }: { fund: Model }) => (
  <Grid key={fund.id} container xs={12} px={2} alignItems="center">
    <Grid
      item
      xs={8}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column' },
      }}
    >
      <Typography fontWeight="bold">{fund.name}</Typography>
      <Typography variant="body2"> - {fund.id}</Typography>
    </Grid>
    <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <OutlinedInput
        value={`${fund.percentage} %`}
        inputProps={{
          inputMode: 'numeric',
          pattern: '[0-9]*',
          sx: { textAlign: 'center', p: 1 },
        }}
        sx={{ ml: 2, width: '100px' }}
        disabled
      />
    </Grid>
  </Grid>
);

function SummaryCard({ summary }: { summary: SummaryAllocation }) {
  return (
    <>
      {Object.keys(summary).map((platformName) => {
        const funds = summary[platformName];
        return (
          <>
            <Typography variant="h6">{platformName}</Typography>
            <Divider sx={{ my: 2 }} />
            <List>
              {Object.keys(funds).map((fundName) => (
                <SummaryListItem fund={funds[fundName]} key={platformName} />
              ))}
            </List>
          </>
        );
      })}
    </>
  );
}

export default React.memo(SummaryCard);
