import Page from 'components/Page';
import {
  Button,
  Card,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
  Switch,
  Autocomplete,
  TextField,
  IconButton,
  Dialog,
  DialogContent,
  Box,
} from '@mui/material';
import useSettings from 'hooks/useSettings';
import HeaderBreadcrumbs from 'components/HeaderBreadcrumbs';
import { PATH_DASHBOARD } from 'routes/paths';
import { useSelector } from 'redux/store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useGetFullEmailTemplate from './hooks/useGetFullEmailTemplate';
import { EditorCore } from '';
import mjml2html from 'mjml-browser';
import arrayFromObj from 'utils/arrayFromObj';
import { useRouter } from 'routes/use-router';
// import { FixedSizeList as List } from 'react-window';
// import Iconify from 'components/Iconify';
import { Liquid } from 'liquidjs';
import { useClientTagsFromStore } from 'hooks/useClientTags';
import { useSnackbar } from 'notistack';
import useUser from 'hooks/useUser';
import { sendBulkEmail } from 'redux/slices/engagement-hub';
import UploadBox from 'components/upload/UploadBox';
import Iconify from 'components/Iconify';
import { createStorageItem, storagePaths } from 'redux/slices/storage';
import { LoadingButton } from '@mui/lab';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailSendView() {
  const { back } = useRouter();

  const { themeStretch } = useSettings();
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('selectedId');
  const { currentEmailTemplate, loading } = useGetFullEmailTemplate(selectedId || '');
  const { byId } = useSelector((state) => state.clients);
  const clientsArray: any[] = arrayFromObj(byId);
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [finalHtmlData, setFinalHtmlData] = useState<string | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const clientTags = useClientTagsFromStore();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const onEmailsChange = (newEmails: string[]) => {
    const validEmails = newEmails.filter((email) => emailRegex.test(email));
    if (validEmails.length !== newEmails.length) {
      enqueueSnackbar('Some emails are invalid.', {
        variant: 'error',
      });
    } else {
      setEmails(validEmails);
    }
  };

  const htmlData = useMemo(() => {
    if (!currentEmailTemplate) return;
    const mjmlString = EditorCore.toMJML({
      element: currentEmailTemplate.json?.content,
      mode: 'production',
      beautify: true,
    });
    const { html } = mjml2html(mjmlString, {});
    return html;
  }, [currentEmailTemplate]);

  const getFinalHtmlData = useCallback(async () => {
    if (!htmlData) return;
    if (!isLivePreview) {
      setFinalHtmlData(htmlData);
      return;
    }
    const liquid = new Liquid();
    const newData = await liquid.parseAndRender(htmlData, {
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-555-5555',
    });
    setFinalHtmlData(newData);
  }, [htmlData, isLivePreview]);

  useEffect(() => {
    getFinalHtmlData();
  }, [getFinalHtmlData, htmlData]);

  const onSend = useCallback(async () => {
    if (!user?.id || !currentEmailTemplate?.emailTemplateId) return;
    const isAllSelected = selectedTypes?.includes('All Clients');
    if (!isAllSelected && !selectedClients.length && !tags.length && !file && !emails.length) {
      enqueueSnackbar('Please select at least one recipient', {
        variant: 'error',
      });
      return;
    }

    setIsLoading(true);
    let path;

    if (file) {
      path = await createStorageItem({
        file: file,
        path:
          storagePaths.emailTemplateBulkEmailsCSV(user?.id, currentEmailTemplate?.emailTemplateId) +
          '/' +
          new Date().getTime(),
      });
    }

    await sendBulkEmail({
      advisorId: user?.id || '',
      templateId: currentEmailTemplate?.emailTemplateId || '',
      data: {
        tags: isAllSelected ? ['ALL'] : tags,
        clients: selectedClients,
        csvPath: path?.key ? path.key : undefined,
        emails,
      },
    });
    setIsLoading(false);
    setShowSuccessModal(true);
  }, [
    currentEmailTemplate?.emailTemplateId,
    emails,
    enqueueSnackbar,
    file,
    selectedClients,
    selectedTypes,
    tags,
    user?.id,
  ]);

  const onBack = () => {
    back();
  };

  // const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  //   const item = clientsArray[index];
  //   return (
  //     <ListItem
  //       style={style}
  //       sx={{
  //         overflow: 'hidden',
  //       }}
  //       disableGutters
  //       key={item?.id}
  //     >
  //       <ListItemAvatar>
  //         <Tooltip title="In Draft">
  //           <Avatar
  //             sx={{
  //               bgcolor: (theme) => theme.palette.divider,
  //               color: (theme) => theme.palette.primary.main,
  //             }}
  //           >
  //             <Iconify icon="mdi:email-edit-outline" />
  //           </Avatar>
  //         </Tooltip>
  //       </ListItemAvatar>
  //       <ListItemText primary={item?.name} secondary={item?.email} />
  //     </ListItem>
  //   );
  // };

  const clientsOptions = useMemo(() => {
    const array = clientsArray?.map((item) => item?.id);
    return Array.from(new Set(array));
  }, [clientsArray]);

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    back();
  };

  return (
    <Page title="Email Templates">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Engagement Hub"
          links={[
            { name: 'Engagement Hub', href: PATH_DASHBOARD.engagementHub.emailTemplates },
            {
              name: 'Email Templates',
              href: PATH_DASHBOARD.engagementHub.emailTemplates,
            },
            {
              name: 'Send Email',
            },
          ]}
          action={
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={onBack} variant="outlined" color="primary">
                Exit
              </Button>
              <LoadingButton
                loading={isLoading}
                onClick={onSend}
                variant="contained"
                color="primary"
              >
                Send Email
              </LoadingButton>
            </Stack>
          }
        />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <Stack
                sx={{
                  px: 3,
                  py: 2,
                }}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle1">{currentEmailTemplate?.name} (Preview)</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Switch
                    checked={isLivePreview}
                    onChange={() => setIsLivePreview((pre) => !pre)}
                  />
                  <Typography variant="caption">
                    {isLivePreview ? 'Live Preview' : 'Dev Preview'}
                  </Typography>
                </Stack>
              </Stack>
              {loading ? (
                <Stack>
                  <CircularProgress
                    sx={{
                      m: 'auto',
                      mb: 2,
                    }}
                  />
                </Stack>
              ) : (
                <>{finalHtmlData && <div dangerouslySetInnerHTML={{ __html: finalHtmlData }} />}</>
              )}
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Typography
                sx={{
                  mb: 2,
                }}
                variant="subtitle1"
              >
                Who will receive this email?
              </Typography>
              <Autocomplete
                sx={{
                  mt: 2,
                }}
                multiple
                renderInput={(params) => <TextField {...params} label="Select Recipients" />}
                value={selectedTypes}
                onChange={(_, newValue) => {
                  // @ts-ignore
                  setSelectedTypes(newValue);
                }}
                options={
                  selectedTypes?.includes('All Clients')
                    ? ['All Clients', 'Upload CSV', 'Email']
                    : [
                        'All Clients',
                        'Clients with Tags',
                        'Specific Clients',
                        'Upload CSV',
                        'Email',
                      ]
                }
              />
              {!selectedTypes?.includes('All Clients') && (
                <>
                  {selectedTypes?.includes('Specific Clients') && (
                    <Autocomplete
                      sx={{
                        mt: 2,
                      }}
                      multiple
                      options={clientsOptions}
                      disableCloseOnSelect
                      getOptionLabel={(option) => byId[option]?.name || ''}
                      getOptionKey={(option) => option}
                      renderInput={(params) => <TextField {...params} label="Select Clients" />}
                      value={selectedClients}
                      onChange={(_, newValue) => {
                        // @ts-ignore
                        setSelectedClients(newValue);
                      }}
                    />
                  )}

                  {selectedTypes?.includes('Clients with Tags') && (
                    <Autocomplete
                      multiple
                      sx={{
                        mt: 2,
                      }}
                      options={clientTags}
                      getOptionLabel={(option) => option}
                      renderInput={(params) => <TextField {...params} label="Clients By Tags" />}
                      value={tags}
                      onChange={(_, newValue) => {
                        setTags(newValue);
                      }}
                    />
                  )}
                </>
              )}
              {selectedTypes?.includes('Upload CSV') && (
                <>
                  {!file && (
                    <Stack mt={2} direction="row" alignItems="center" spacing={2}>
                      <UploadBox
                        file={file}
                        sx={{
                          mt: 2,
                        }}
                        accept={{
                          // csv
                          'text/csv': ['.csv'],
                        }}
                        onDrop={(file) => {
                          setFile(file[0]);
                        }}
                      />
                      <Typography>Select a CSV file to upload</Typography>
                    </Stack>
                  )}
                  {file && (
                    <Stack
                      p={1}
                      sx={{
                        border: (theme) => `dashed 1px ${theme.palette.grey[500_16]}`,
                      }}
                      mt={2}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography>File Name: {file.name}</Typography>
                      <IconButton onClick={() => setFile(null)}>
                        <Iconify icon="eva:close-fill" />
                      </IconButton>
                    </Stack>
                  )}
                </>
              )}
              {selectedTypes?.includes('Email') && (
                <Autocomplete
                  sx={{
                    mt: 2,
                  }}
                  multiple
                  autoSelect
                  options={emails}
                  getOptionLabel={(option) => option}
                  renderInput={(params) => <TextField {...params} label="Emails" />}
                  freeSolo
                  value={emails}
                  onChange={(_, newValue) => {
                    onEmailsChange(newValue);
                  }}
                />
              )}
              {/* <List
                height={400}
                itemCount={clientsArray.length}
                itemSize={55}
                width="100%"
                overscanCount={5}
              >
                {Row}
              </List> */}
            </Card>
          </Grid>
        </Grid>

        {/* Success Modal */}
        <Dialog
          open={showSuccessModal}
          onClose={handleCloseSuccessModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              textAlign: 'center',
              py: 4,
            },
          }}
        >
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              {/* Engagement Icon */}
              <Box
                component="img"
                src="/icons/Engagement Sent.svg"
                alt="Engagement Sent"
                sx={{
                  width: 80,
                  height: 80,
                }}
              />

              {/* Success Message */}
              <Stack spacing={2} alignItems="center">
                <Typography variant="h4" fontWeight="bold">
                  You just engaged!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                  You've successfully sent your campaign to your intended customers. Go to your
                  dashboard to track your progress.
                </Typography>
              </Stack>

              {/* Close Button */}
              <Button
                variant="contained"
                onClick={handleCloseSuccessModal}
                sx={{ mt: 2, minWidth: 120 }}
              >
                Got it!
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Page>
  );
}
