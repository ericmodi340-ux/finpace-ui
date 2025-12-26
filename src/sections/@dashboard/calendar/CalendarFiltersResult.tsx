import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Stack, { StackProps } from '@mui/material/Stack';

import Iconify from 'components/Iconify';

import { ICalendarFilters, ICalendarFilterValue } from '../../../@types/calendar';
import { format } from 'date-fns';
import { startCase } from 'lodash';
import { useSelector } from 'redux/store';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: ICalendarFilters;
  onFilters: (name: string, value: ICalendarFilterValue) => void;
  //
  canReset: boolean;
  onResetFilters: VoidFunction;
  //
  results: number;
};

export default function CalendarFiltersResult({
  filters,
  onFilters,
  //
  canReset,
  onResetFilters,
  //
  results,
  ...other
}: Props) {
  const shortLabel =
    filters.startDate &&
    filters.endDate &&
    `${format(new Date(filters.startDate), 'dd MMM yy')} - ${format(
      new Date(filters.endDate),
      'dd MMM yy'
    )}`;

  const handleRemoveColor = (inputValue: string) => {
    const newValue = filters.colors.filter((item) => item !== inputValue);
    onFilters('colors', newValue);
  };

  const advisors = useSelector((state) => state.advisors);

  const handleRemoveCategory = (inputValue: string) => {
    const newValue = filters.category.filter((item) => item !== inputValue);
    onFilters('category', newValue);
  };

  const handleRemoveType = (inputValue: string) => {
    const newValue = filters.type.filter((item) => item !== inputValue);
    onFilters('type', newValue);
  };

  const handleRemoveAdditionalAdvisors = (inputValue: string) => {
    const newValue = filters.additionalAdvisors.filter((item) => item !== inputValue);
    onFilters('additionalAdvisors', newValue);
  };

  const handleRemoveDate = () => {
    onFilters('startDate', null);
    onFilters('endDate', null);
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {!!filters.colors.length && (
          <Block label="Colors:">
            {filters.colors.map((item) => (
              <Chip
                key={item}
                size="small"
                label={
                  <Box
                    sx={{
                      ml: -0.5,
                      width: 18,
                      height: 18,
                      bgcolor: item,
                      borderRadius: '50%',
                      border: (theme) => `solid 1px ${alpha(theme.palette.common.white, 0.24)}`,
                    }}
                  />
                }
                onDelete={() => handleRemoveColor(item)}
              />
            ))}
          </Block>
        )}

        {!!filters.category.length && (
          <Block label="Category:">
            {filters.category.map((item) => (
              <Chip
                key={item}
                size="small"
                label={startCase(item)}
                onDelete={() => handleRemoveCategory(item)}
              />
            ))}
          </Block>
        )}

        {!!filters.type.length && (
          <Block label="Type:">
            {filters.type.map((item) => (
              <Chip
                key={item}
                size="small"
                label={startCase(item)}
                onDelete={() => handleRemoveType(item)}
              />
            ))}
          </Block>
        )}

        {!!filters.additionalAdvisors.length && (
          <Block label="Advisors:">
            <Chip size="small" label="You" />
            {filters.additionalAdvisors.map((item) => (
              <Chip
                key={item}
                size="small"
                label={advisors.byId[item].name}
                onDelete={() => handleRemoveAdditionalAdvisors(item)}
              />
            ))}
          </Block>
        )}

        {filters.startDate && filters.endDate && (
          <Block label="Date:">
            <Chip size="small" label={shortLabel} onDelete={handleRemoveDate} />
          </Block>
        )}

        {canReset && (
          <Button
            color="error"
            onClick={onResetFilters}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          >
            Clear
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type BlockProps = StackProps & {
  label: string;
};

function Block({ label, children, sx, ...other }: BlockProps) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}
