import { ApexOptions } from 'apexcharts';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Card, { CardProps } from '@mui/material/Card';

import Chart, { useChart } from './chart';
import { memo, useState } from 'react';
import { Stack, Tab, Tabs, Typography } from '@mui/material';
import Image from './Image';
import useSettings from 'hooks/useSettings';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  chart: {
    categories: string[];
    colors?: string[][];
    series: {
      name: string;
      data: number[];
    }[];
    options?: ApexOptions;
  };
}

function ClientGrowthChartWidget({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const { themeMode } = useSettings();

  const [selected, setSelected] = useState('Clients');

  const {
    colors = [
      [theme.palette.primary.light, theme.palette.primary.main],
      [theme.palette.info.light, theme.palette.info.main],
    ],
    categories,
    series,
    options,
  } = chart;

  const chartOptions = useChart({
    colors: colors.map((colr) => colr[1]),
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: colors.map((colr) => [
          { offset: 0, color: colr[0], opacity: 1 },
          { offset: 100, color: colr[1], opacity: 1 },
        ]),
      },
    },
    xaxis: {
      categories,
      tickAmount: 12,
      tickPlacement: 'between',
      labels: {
        rotate: 0,
      },
    },
    ...options,
  });

  const clientsSeries = series.find((serie) => serie.name === 'Clients')?.data;
  const prospectsSeries = series.find((serie) => serie.name === 'Prospects')?.data;

  const totalClients = clientsSeries?.[clientsSeries.length - 1] || 0;
  const totalProspects = prospectsSeries?.[prospectsSeries.length - 1] || 0;

  return (
    <Card {...other}>
      <Tabs
        value={selected}
        variant="fullWidth"
        onChange={(e, value) => (value ? setSelected(value) : setSelected('all'))}
        sx={{
          p: 1,
          backgroundColor: (theme) => theme.palette.divider,
        }}
        TabIndicatorProps={{
          hidden: true,
        }}
      >
        <Tab
          sx={{
            height: 98,
            borderRadius: 2,
            backgroundColor: (theme) =>
              selected === 'Clients' ? theme.palette.background.paper : 'transparent',
          }}
          value="Clients"
          icon={
            <Stack
              width="100%"
              direction="row"
              alignItems="center"
              spacing={3}
              ml={{ xs: 0, md: 4 }}
            >
              <Stack sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Image
                  sx={{
                    height: 50,
                    width: 50,
                  }}
                  src={
                    themeMode === 'dark'
                      ? `/icons/clients-dark-mode.svg`
                      : `/icons/clients-light-mode.svg`
                  }
                />
              </Stack>
              <Stack sx={{ textAlign: 'start' }}>
                <Typography variant="subtitle1">Clients</Typography>
                <Typography variant="h4">{totalClients}</Typography>
              </Stack>
            </Stack>
          }
        />
        <Tab
          sx={{
            height: 98,
            borderRadius: 2,
            backgroundColor: (theme) =>
              selected === 'Prospects' ? theme.palette.background.paper : 'transparent',
          }}
          value="Prospects"
          icon={
            <Stack
              width="100%"
              direction="row"
              alignItems="center"
              spacing={3}
              ml={{ xs: 0, md: 4 }}
            >
              <Stack sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Image
                  sx={{
                    height: 50,
                    width: 50,
                  }}
                  src={
                    themeMode === 'dark'
                      ? `/icons/prospects-dark-mode.svg`
                      : `/icons/prospects-light-mode.svg`
                  }
                />
              </Stack>
              <Stack sx={{ textAlign: 'start' }}>
                <Typography variant="subtitle1">Prospects</Typography>
                <Typography variant="h4">{totalProspects}</Typography>
              </Stack>
            </Stack>
          }
        />
      </Tabs>
      {/* <CardHeader
        title={title}
        subheader={subheader}
        action={
          <ToggleButtonGroup
            value={selected}
            size="small"
            exclusive
            onChange={(e, value) => (value ? setSelected(value) : setSelected('all'))}
          >
            <ToggleButton sx={{ minWidth: 80 }} value="Clients">
              Clients
            </ToggleButton>
            <ToggleButton sx={{ minWidth: 80 }} value="Prospects">
              Prospects
            </ToggleButton>
          </ToggleButtonGroup>
        }
      /> */}

      <Box sx={{ mt: 3, mx: 3 }}>
        {selected === 'all' ? (
          <Chart
            series={series}
            dir="ltr"
            type="line"
            options={chartOptions}
            width="100%"
            height={364}
          />
        ) : null}
        {selected !== 'all' ? (
          <Chart
            series={series.filter((serie) => serie.name === selected)}
            dir="ltr"
            type="line"
            options={chartOptions}
            width="100%"
            height={364}
          />
        ) : null}
      </Box>
    </Card>
  );
}

export default memo(ClientGrowthChartWidget);
