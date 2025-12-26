// @mui
import { Box, Card, Stack, Skeleton, Button, Link } from '@mui/material';
// routes
import TemplateCard from './TemplateCard';
import { Typography } from '@mui/material';
// ----------------------------------------------------------------------
function TemplateCardSkeleton() {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', paddingX: 2, paddingY: 4 }}>
      <Stack spacing={1} mb={4}>
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Skeleton variant="rectangular" sx={{ width: 0.5, textAlign: 'center', mx: 'auto' }} />
        </Stack>
        <Skeleton variant="text" sx={{ width: 1, textAlign: 'center' }} />
        <Skeleton variant="text" sx={{ width: 1, textAlign: 'center' }} />
      </Stack>
      <Stack mt="auto" direction="row" spacing={2} justifyContent="center" alignItems="center">
        <Skeleton variant="rectangular" sx={{ width: 80, height: 35 }} />
        <Skeleton variant="rectangular" sx={{ width: 120, height: 35 }} />
      </Stack>
    </Card>
  );
}

type Template = {
  id: string;
  title: string;
  description: string;
  image: string;
};

type templatesListTypes = {
  templates: { [key: string]: Template }[];
  handleOpenPreviewModal: (id: string) => void;
};

export default function TemplatesList({ templates, handleOpenPreviewModal }: templatesListTypes) {
  const loading = !templates.length;

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
      }}
    >
      {(loading ? [...Array(12)] : templates).map((template: Template, index: number) =>
        template ? (
          <TemplateCard
            key={template.id}
            template={template}
            onClickName={handleOpenPreviewModal}
          />
        ) : (
          <TemplateCardSkeleton key={index} />
        )
      )}
      <Stack
        sx={{
          display: 'flex',
          textAlign: 'center',
          minHeight: 250,
          flexDirection: 'column',
          paddingX: 2,
          paddingY: 4,
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <Typography variant="h5">Need something unique?</Typography>
        <Typography sx={{ mt: 2 }} variant="body2">
          Hire our expert team to design a custom template that perfectly fits your specific
          requirements and workflow.
        </Typography>

        <Button
          sx={{
            mt: 'auto',
            width: '100%',
            maxWidth: 300,
            mx: 'auto',
          }}
          color="primary"
          variant="contained"
          LinkComponent={Link}
          href="mailto:f@finpace.com"
        >
          Request a quote
        </Button>
      </Stack>
    </Box>
  );
}
