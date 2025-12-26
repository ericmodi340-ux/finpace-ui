import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';

import Iconify from 'components/Iconify';

import { format } from 'date-fns';
import { IClientsTableFilterValue, IClientsTableFilters } from '../../../@types/client';

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: IClientsTableFilters;
  onFilters: (name: string, value: IClientsTableFilterValue) => void;
  //
  onResetFilters: VoidFunction;
  //
  results: number;
};

export default function ClientsTableFiltersResult({
  filters,
  onFilters,
  //
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

  const handleRemoveKeyword = useCallback(() => {
    onFilters('name', '');
  }, [onFilters]);

  const handleRemoveType = useCallback(() => {
    onFilters('type', 'all');
  }, [onFilters]);

  // Updated to handle removing a specific tag
  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const currentTags = Array.isArray(filters.tag) ? filters.tag : [];
      const newTags = currentTags.filter((tag) => tag !== tagToRemove);
      onFilters('tag', newTags);
    },
    [filters.tag, onFilters]
  );

  // Clear all tags
  const handleRemoveAllTags = useCallback(() => {
    onFilters('tag', []);
  }, [onFilters]);

  const handleRemoveDate = useCallback(() => {
    onFilters('startDate', null);
    onFilters('endDate', null);
  }, [onFilters]);

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {filters.type !== 'all' && (
          <Block label="Type:">
            <Chip size="small" label={filters.type} onDelete={handleRemoveType} />
          </Block>
        )}

        {filters.startDate && filters.endDate && (
          <Block label="Date:">
            <Chip size="small" label={shortLabel} onDelete={handleRemoveDate} />
          </Block>
        )}

        {!!filters.name && (
          <Block label="Keyword:">
            <Chip label={filters.name} size="small" onDelete={handleRemoveKeyword} />
          </Block>
        )}

        {Array.isArray(filters.tag) && filters.tag.length > 0 && (
          <Block label="Tags:">
            <Stack direction="row" flexWrap="wrap" spacing={0.5}>
              {filters.tag.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ m: 0.25 }}
                />
              ))}
            </Stack>
          </Block>
        )}

        <Button color="error" onClick={onResetFilters} startIcon={<Iconify icon="mdi:close" />}>
          Clear Filters
        </Button>
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
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 2,
        overflow: 'hidden',
        border: (theme) => `solid 1px ${theme.palette.divider}`,
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
