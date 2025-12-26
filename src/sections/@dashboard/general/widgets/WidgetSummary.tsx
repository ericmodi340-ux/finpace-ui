import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, Card, Container, Typography, Stack } from '@mui/material';
// components
import SvgIconStyle from 'components/SvgIconStyle';
import { memo } from 'react';

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------

type MaybeWrapWithLinkProps = {
  link?: string;
  children: React.ReactNode;
};

function MaybeWrapWithLink({ link, children }: MaybeWrapWithLinkProps) {
  if (!link) {
    return <>{children}</>;
  }

  return (
    <Container
      component={RouterLink}
      to={link}
      disableGutters
      sx={{
        textDecoration: 'none',
        transition: '0.2s all',
        '&:hover': { marginTop: '-10px', transition: '0.2s all' },
      }}
    >
      {children}
    </Container>
  );
}

type Props = {
  title: string;
  total: string;
  link?: string;
  imgSrc?: string;
};

function WidgetSummary({ title, total, link, imgSrc }: Props) {
  return (
    <MaybeWrapWithLink link={link}>
      <Card sx={{ display: 'flex', alignItems: 'center', px: 3, py: 2, height: 100 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', gap: '8px' }}>
            <Typography noWrap variant="subtitle1">
              {title}
            </Typography>
          </Box>

          <Stack>
            <Typography variant="h4">{total}</Typography>
          </Stack>
        </Box>
        {imgSrc && (
          <SvgIconStyle
            sx={{
              flexShrink: 0,
              height: 30,
              width: 30,
              color: (theme) => theme.palette.primary.main,
            }}
            src={imgSrc}
          />
        )}
      </Card>
    </MaybeWrapWithLink>
  );
}

export default memo(WidgetSummary);
