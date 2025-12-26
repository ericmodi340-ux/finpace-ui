import { ApexOptions } from 'apexcharts';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Card, { CardProps } from '@mui/material/Card';

import Chart, { useChart } from './chart';
import { fCurrency } from 'utils/formatNumber';
import { memo } from 'react';

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

function AumChartWidget({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

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
      labels: {
        rotateAlways: true,
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => fCurrency(value),
      },
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader
        titleTypographyProps={{
          variant: 'h5',
        }}
        subheaderTypographyProps={{
          variant: 'body2',
        }}
        title={title}
        subheader={subheader}
      />

      <Box sx={{ mt: 3, mx: 3 }}>
        <Chart
          series={series}
          dir="ltr"
          type="line"
          options={chartOptions}
          width="100%"
          height={364}
        />
      </Box>
    </Card>
  );
}

export default memo(AumChartWidget);
