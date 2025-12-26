import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, Link, Card, CardHeader, Typography, Stack } from '@mui/material';
// components
import Image from './Image';
import Scrollbar from './Scrollbar';
import { dispatch, useSelector } from 'redux/store';
import { TemplateManager } from '../@types/template';
import { useEffect } from 'react';
import { getTemplates as getLibraryTemplates } from 'redux/slices/library';

interface TemplateLibraryItemProps extends TemplateManager {
  createdAt: string;
  image: string;
}

// ----------------------------------------------------------------------

export default function TemplateLibrayDashboardList() {
  const templateLibraries = useSelector((state) => state.libraryTemplates);
  const templateLibrariesArr = Object.values(templateLibraries.byId) as TemplateLibraryItemProps[];

  useEffect(() => {
    dispatch(getLibraryTemplates());
  }, []);

  return (
    <Card>
      <CardHeader
        title="Template Library"
        component={RouterLink}
        to="/library"
        sx={{ color: 'text.primary', textDecoration: 'none' }}
      />
      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3 }}>
          {templateLibrariesArr
            .sort((a, b) => {
              const dateA = new Date(a.createdAt);
              const dateB = new Date(b.createdAt);
              return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 5)
            .map((templateLibrary, index) => (
              <TemplateLibraryItem key={index} templateLibrary={templateLibrary} />
            ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

// ----------------------------------------------------------------------

function TemplateLibraryItem({ templateLibrary }: { templateLibrary: TemplateLibraryItemProps }) {
  const { title, description, image, id } = templateLibrary;
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Image
        alt={title}
        src={image}
        sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0 }}
      />

      <Box sx={{ flexGrow: 1, minWidth: 200 }}>
        <Link
          component={RouterLink}
          to={`library?id=${id}`}
          sx={{ color: 'text.primary', typography: 'subtitle2' }}
        >
          {title}
        </Link>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </Box>
      <Link
        component={RouterLink}
        to={`library?id=${id}`}
        sx={{ color: 'text.primary', typography: 'subtitle2' }}
      >
        {arrowIcon}
      </Link>
    </Stack>
  );
}

const arrowIcon = (
  <svg
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: 'rotate(180deg)' }}
  >
    <g fill="none" fillRule="evenodd">
      <path d="M0 0h24v24H0z" />
      <g fill="currentColor" fillRule="nonzero">
        <path
          d="M14.3283 11.4343 18.5126 7.25c.4142-.4142.4142-1.0858 0-1.5-.4142-.4142-1.0858-.4142-1.5 0l-5.543 5.5429c-.3904.3905-.3904 1.0237 0 1.4142l5.543 5.5429c.4142.4142 1.0858.4142 1.5 0 .4142-.4142.4142-1.0858 0-1.5l-4.1843-4.1843a.8.8 0 0 1 0-1.1314Z"
          opacity=".48"
        />
        <path d="M8.3283 11.4343 12.5126 7.25c.4142-.4142.4142-1.0858 0-1.5-.4142-.4142-1.0858-.4142-1.5 0l-5.543 5.5429c-.3904.3905-.3904 1.0237 0 1.4142l5.543 5.5429c.4142.4142 1.0858.4142 1.5 0 .4142-.4142.4142-1.0858 0-1.5l-4.1843-4.1843a.8.8 0 0 1 0-1.1314Z" />
      </g>
    </g>
  </svg>
);
