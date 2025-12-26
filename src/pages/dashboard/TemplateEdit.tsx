import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import { Container, Alert, AlertTitle, Typography, IconButton, Stack, Card } from '@mui/material';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// hooks
import useFullTemplate from 'hooks/useFullTemplate';
import useSettings from 'hooks/useSettings';
// components
import Page from 'components/Page';
import HeaderBreadcrumbs from 'components/HeaderBreadcrumbs';
import Iconify from 'components/Iconify';
import { DialogAnimate } from 'components/animate';
import BitsyFormRenderer from 'components/form/FormRenderer';
import LoadingScreen from 'components/LoadingScreen';
// sections
import { TemplateEdit } from 'sections/@dashboard/template/edit';
// utils
import { downloadTextFile } from 'utils/files';
import { FormSubmission } from '../../@types/form';

export default function TemplateEditPage() {
  const { themeStretch } = useSettings();
  const { templateId = '' } = useParams();
  const [isOpenShowPreview, setIsOpenShowPreview] = useState<boolean>(false);

  const { template: currentTemplate, loading: currentTemplateLoading } =
    useFullTemplate(templateId);

  const [showRTE, setShowRTE] = useState(!!currentTemplate?.showRTE);

  useEffect(() => {
    setShowRTE(!!currentTemplate?.showRTE);
  }, [currentTemplate]);

  const handleClosePreview = () => {
    setIsOpenShowPreview(false);
  };

  const handleDownloadTemplate = () => {
    const downloadDate = new Date();
    downloadTextFile(
      JSON.stringify(currentTemplate),
      `${currentTemplate?.title || 'Unknown Template'} - Backup ${Math.round(
        downloadDate.getTime() / 1000
      )}.json`
    );
  };

  return (
    <>
      <Page title={currentTemplate?.title || 'Edit template'}>
        <Container maxWidth={themeStretch ? false : 'lg'}>
          <HeaderBreadcrumbs
            heading={currentTemplate?.title || 'Edit template'}
            links={[
              { name: 'Dashboard', href: PATH_DASHBOARD.root },
              { name: 'Templates', href: PATH_DASHBOARD.templates.root },
              { name: currentTemplate?.title || 'Edit template' },
            ]}
            sx={{ mb: 3 }}
          />

          {currentTemplate ? (
            <TemplateEdit
              showRTE={showRTE}
              setShowRTE={setShowRTE}
              downloadTemplate={handleDownloadTemplate}
              previewTemplate={() => setIsOpenShowPreview(true)}
            />
          ) : currentTemplateLoading ? (
            <LoadingScreen isDashboard />
          ) : (
            <Alert severity="warning">
              <AlertTitle>Template not found</AlertTitle>
              We could not find a template with this ID. Please try again.
            </Alert>
          )}
        </Container>
      </Page>

      {isOpenShowPreview && (
        <DialogAnimate
          fullScreen
          sx={{
            background: (theme) => theme.palette.background.neutral,
          }}
          open={isOpenShowPreview}
          onClose={handleClosePreview}
        >
          <Stack
            flexDirection="row"
            sx={{
              backgroundColor: (theme) => theme.palette.background.paper,
              px: 3,
              py: 2,
              position: 'sticky',
              width: '100%',
              top: 0,
              zIndex: 1111,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" sx={{ textAlign: 'center' }}>
              {currentTemplate?.title || 'template'} (Preview)
            </Typography>
            <IconButton onClick={handleClosePreview}>
              <Iconify icon={'ic:round-close'} />
            </IconButton>
          </Stack>
          <Container
            sx={{
              flex: 1,
            }}
            maxWidth="md"
          >
            <Card
              sx={{
                my: { xs: 10, md: 8 },
                display: 'flex',
                padding: 3,
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: (theme) => theme.palette.background.paper,
              }}
            >
              <Stack
                width="100%"
                sx={{
                  maxWidth: 500,
                }}
              >
                <BitsyFormRenderer
                  setUserCompletedForms={() => {}}
                  templateId=""
                  templateName=""
                  components={[...(currentTemplate?.fields ? currentTemplate?.fields : [])]}
                  onSubmit={() => {}}
                  options={{
                    readOnly: true,
                  }}
                  isLibraryTemplate={false}
                  handleSave={() => {}}
                  initialCompletedPages={{}}
                  onNextPage={() => {}}
                  submission={{} as FormSubmission}
                  isComplete={false}
                />
              </Stack>
            </Card>
          </Container>
        </DialogAnimate>
      )}
    </>
  );
}
