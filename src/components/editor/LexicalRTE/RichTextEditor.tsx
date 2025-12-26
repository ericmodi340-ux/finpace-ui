import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  Fab,
  Typography,
  Stack,
  IconButton,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { FormFieldManager } from '../../../@types/field';
import FormField from 'components/FormField';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { getTemplate, updateTemplate } from 'redux/slices/templates';
import { TemplateWithFieldsManager } from '../../../@types/template';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { RootState, useSelector } from 'redux/store';
import Iconify from 'components/Iconify';
import { EditorCore } from '';
import mjml2html from 'mjml-browser';
import Scrollbar from 'components/Scrollbar';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'routes/paths';
import { UploadSingleFile } from 'components/upload';
import { useSearchParams } from 'react-router-dom';
import PdfFormBuilder from 'sections/@dashboard/pdf-form-builder/PdfFormBuilder';
import { createStorageItem, storagePaths } from 'redux/slices/storage';
import { useBoolean } from 'hooks/useBoolean';
import ConfirmDialog from 'components/ConfirmDialog';
import { LoadingButton } from '@mui/lab';

const DEFAULT_FIELDS = [
  {
    name: 'client_1',
    label: 'Client 1',
    type: 'Select',
    options: [
      { value: 'signer', label: 'Signer' },
      { value: 'cc', label: 'CC' },
    ],
  },
  {
    name: 'client_2',
    label: 'Client 2',
    type: 'Select',
    options: [
      { value: 'signer', label: 'Signer' },
      { value: 'cc', label: 'CC' },
    ],
  },
  {
    name: 'advisor',
    label: 'Advisor',
    type: 'Select',
    options: [
      { value: 'signer', label: 'Signer' },
      { value: 'cc', label: 'CC' },
    ],
  },
  {
    name: 'firm',
    label: 'Firm Admin',
    type: 'Select',
    options: [
      { value: 'signer', label: 'Signer' },
      { value: 'cc', label: 'CC' },
    ],
  },
];

function AddSignersModal({
  open,
  setOpen,
  signers,
  setFields,
  formik,
}: {
  open: boolean;
  setOpen: any;
  setFields: any;
  signers: any[];
  formik: any;
}) {
  const [selectedField, setSelectedField] = useState<{ value: string; label: string } | null>({
    value: '',
    label: '',
  });

  const defaultOptions = [
    { value: 'client_1', label: 'Client 1' },
    { value: 'client_2', label: 'Client 2' },
    { value: 'advisor', label: 'Advisor' },
    { value: 'firm', label: 'Firm Admin' },
  ];

  const signersOptions = defaultOptions.filter(
    (defaultOption) => !signers.some((currentSigner) => defaultOption.value === currentSigner.type)
  );

  const handleSelection = (value: string, label: string) => {
    if (selectedField?.value === value) {
      setSelectedField({ value: '', label: '' });
    } else {
      setSelectedField({ value, label });
    }
  };

  const handleAddSigner = () => {
    if (selectedField) {
      const newField = {
        name: selectedField?.value,
        label: selectedField?.label,
        type: 'Select',
        options: [
          { value: 'signer', label: 'Signer' },
          { value: 'cc', label: 'CC' },
        ],
      };
      setFields((prev: any) => [...prev, newField]);
      let newInitialValues;
      newInitialValues = { ...formik.values, [selectedField?.value]: 'cc' };
      formik.setValues(newInitialValues);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open}>
      <Box
        sx={{
          position: 'relative',
          minWidth: '500px',
          textAlign: 'center',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <Iconify
          width={32}
          height={32}
          icon="eva:close-fill"
          onClick={() => setOpen(false)}
          sx={{ position: 'absolute', right: '8px', top: '8px', cursor: 'pointer' }}
        />
        <DialogTitle id="add-signer-dialog-title">Select Signer</DialogTitle>
        <Select sx={{ width: '100%' }} value={selectedField?.value || ''}>
          {signersOptions?.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              onClick={() => handleSelection(option.value, option.label)}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <Button variant="contained" onClick={handleAddSigner} disabled={!selectedField?.value}>
          Add Signer
        </Button>
      </Box>
    </Dialog>
  );
}

// Move each component to its own file
function ExportHTML({
  template: currTemplate,
  setSave,
}: {
  template: TemplateWithFieldsManager;
  setSave: Dispatch<SetStateAction<boolean>>;
}) {
  const [template, setTemplate] = useState<TemplateWithFieldsManager>(currTemplate);

  const isNewTemplate = !template.signers?.length;

  const [searchParams] = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const { firm } = useSelector((state: RootState) => state.firm);

  const [openPdfBuilder, setOpenPdfBuilder] = useState(searchParams.get('pdfBuilder') === 'true');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const openDeleteConfirm = useBoolean();
  const [signingType, setSigningType] = useState(
    template?.signingEventType || currTemplate?.signingEventType || 'finpaceSign'
  );

  const navigate = useNavigate();

  const FIELDS = template.signers?.map((signer) => {
    const signerLabel = signer.type.replace('_', ' ');
    const formattedLabel = signerLabel[0].toUpperCase() + signerLabel.slice(1);
    return {
      name: signer.type,
      label: formattedLabel,
      type: 'Select',
      options: [
        { value: 'signer', label: 'Signer' },
        { value: 'cc', label: 'CC' },
      ],
    };
  });

  const { enqueueSnackbar } = useSnackbar();
  const [fields, setFields] = useState(FIELDS || DEFAULT_FIELDS);
  const [isSignerModalOpen, setOpenSignerModal] = useState(false);
  const { isLoading } = useSelector((state: RootState) => state.templates);

  const formikInitialValues: any = {};

  if (!isNewTemplate) {
    template.signers?.forEach((signer) => {
      formikInitialValues[signer.type] = signer.role;
    });
  } else {
    fields.forEach((field) => {
      formikInitialValues[field.name] = 'cc';
    });
  }

  const formik = useFormik({
    initialValues: formikInitialValues,

    onSubmit: async (values) => {
      // Build roles payload for docusign
      const signers: any[] = [];
      for (const [key, value] of Object.entries(values)) {
        signers.push({
          type: key,
          role: value,
        });
      }

      const resp = await updateTemplate(template.id, {
        ...template,
        dsTemplateId: '',
        signers,
        showRTE: true,
        signingEventType: signingType,
      });
      setTemplate(resp);
      setSave(true);
      enqueueSnackbar('Document saved', { variant: 'success' });
    },
  });

  const handleRemoveField = (field: any) => {
    setFields(fields?.filter((item) => item.name !== field.name));
    const newValues = { ...formik.values };
    delete newValues[field.name];
    formik.setValues(newValues);
  };
  const { errors, touched, handleSubmit, getFieldProps, values } = formik;

  const signers: any[] = [];
  for (const [key, value] of Object.entries(values)) {
    signers.push({
      type: key,
      role: value,
    });
  }

  const htmlData = useMemo(() => {
    if (!template?.projectJson) return '';
    const mjmlString = EditorCore.toMJML({
      element: template?.projectJson?.content,
      mode: 'production',
      beautify: true,
    });
    const { html } = mjml2html(mjmlString, {});
    return html;
  }, [template?.projectJson]);

  const onCloseBuilder = () => {
    window.history.replaceState({}, '', `${window.location.pathname}`);
    setOpenPdfBuilder(false);
  };

  const onDrop = (files: File[]) => {
    setFile(files[0]);
  };

  const onUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    const path = storagePaths.templatePdf(
      firm.id,
      template.id,
      // @ts-ignore
      `${file?.name?.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.pdf`
    );

    await createStorageItem({
      file,
      path,
    });

    await updateTemplate(template.id, {
      pdfFormSchema: {
        settings: {
          src: path,
          filename: file.name,
        },
        components: null,
      },
    });
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchTemplate = async () => {
      const resp = await getTemplate(template.id);
      if (resp.pdfFormSchema?.components) {
        setTemplate(resp);
        setIsUploading(false);
        setOpenPdfBuilder(true);
        setFile(null);
        clearInterval(intervalId);
      }
    };

    if (isUploading) {
      intervalId = setInterval(fetchTemplate, 5000);
    }

    return () => clearInterval(intervalId);
  }, [isUploading, template.id]);

  const onDeletePdf = async () => {
    setIsDeleting(true);
    const resp = await updateTemplate(template.id, {
      pdfFormSchema: null,
    });
    setTemplate(resp);
    setIsDeleting(false);
  };

  const pdfSrc = template?.pdfFormSchema?.settings?.src;

  return (
    <>
      <FormikProvider value={formik}>
        <Stack
          mb={2}
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1">Signers</Typography>
        </Stack>

        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {fields?.map((field) => (
              <Grid
                item
                xs={6}
                key={field.name}
                sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}
              >
                <FormField
                  field={field as FormFieldManager}
                  touched={touched}
                  errors={errors}
                  value={(values as any)[field.name]}
                  getFieldProps={getFieldProps}
                />
                <Iconify
                  icon={'eva:close-fill'}
                  width={24}
                  height={24}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveField(field)}
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ marginTop: 2, flex: 1, display: 'flex', gap: '20px' }}>
            {signers.length < 4 && (
              <Button
                sx={{
                  ml: 'auto',
                }}
                variant="outlined"
                disabled={isLoading}
                onClick={() => setOpenSignerModal(true)}
              >
                Add Signers
              </Button>
            )}
            {signers.length > 0 && (
              <Fab
                type="submit"
                size="medium"
                sx={{
                  position: 'fixed',
                  bottom: 20,
                  right: 20,
                  width: 150,
                  borderRadius: 1.5,
                }}
                variant="extended"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Fab>
            )}
          </Box>
        </Form>

        {!template?.useDocusign && (
          <Stack mb={2}>
            <ToggleButtonGroup
              sx={{
                width: 'fit-content',
              }}
            >
              <ToggleButton
                value="finpaceSign"
                selected={signingType === 'finpaceSign'}
                onClick={() => setSigningType('finpaceSign')}
              >
                Upload a PDF
              </ToggleButton>
              <ToggleButton
                value="finpaceDynamicSign"
                selected={signingType === 'finpaceDynamicSign'}
                onClick={() => setSigningType('finpaceDynamicSign')}
              >
                Build from scratch
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        )}

        {(signingType === 'finpaceDynamicSign' || signingType === 'docusign') && (
          <>
            <Stack
              mb={2}
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="subtitle1">Document Builder</Typography>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  navigate(PATH_DASHBOARD.templates.docubuilder(template?.id || ''));
                }}
              >
                Document Builder
              </Button>
            </Stack>
            <Scrollbar>
              <Stack
                height={800}
                sx={{
                  overflowY: 'auto',
                }}
              >
                {htmlData && <div dangerouslySetInnerHTML={{ __html: htmlData }} />}
              </Stack>
            </Scrollbar>
          </>
        )}

        {signingType === 'finpaceSign' && (
          <Stack mb={2} spacing={2}>
            <Typography variant="subtitle1">Drop your PDF</Typography>
            {file || pdfSrc ? (
              <Stack
                sx={{
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  p: 2,
                }}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">
                  {file?.name || String(template?.pdfFormSchema?.settings?.filename)}
                </Typography>
                <Stack direction="row" spacing={2}>
                  {file && (
                    <LoadingButton loading={isUploading} variant="contained" onClick={onUpload}>
                      Upload
                    </LoadingButton>
                  )}

                  {pdfSrc && (
                    <Button
                      onClick={() => {
                        setOpenPdfBuilder(true);
                      }}
                      startIcon={<Iconify icon="mdi:design" />}
                      variant="outlined"
                    >
                      Map Fields
                    </Button>
                  )}

                  {file && (
                    <IconButton
                      onClick={() => {
                        if (file) {
                          setFile(null);
                        }
                      }}
                    >
                      <Iconify icon="mdi:delete-outline" />
                    </IconButton>
                  )}
                  {pdfSrc && (
                    <IconButton onClick={openDeleteConfirm.onTrue}>
                      <Iconify icon="mdi:delete-outline" />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
            ) : (
              <UploadSingleFile
                isAvatar={false}
                accept={{ 'application/pdf': ['.pdf'] }}
                file={file}
                onDrop={onDrop}
              />
            )}
          </Stack>
        )}
      </FormikProvider>
      <AddSignersModal
        formik={formik}
        setFields={setFields}
        open={isSignerModalOpen}
        setOpen={setOpenSignerModal}
        signers={signers}
      />
      {openPdfBuilder && (
        <PdfFormBuilder
          open={openPdfBuilder}
          template={template as any}
          setTemplate={setTemplate}
          onClose={onCloseBuilder}
        />
      )}
      <Dialog fullScreen open={isUploading}>
        <Stack
          spacing={2}
          sx={{
            height: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6">Please wait while we process your pdf</Typography>
        </Stack>
      </Dialog>
      {openDeleteConfirm.value && (
        <ConfirmDialog
          open={openDeleteConfirm.value}
          onClose={openDeleteConfirm.onFalse}
          title="Delete PDF"
          content="Are you sure you want to delete this PDF?"
          action={
            <LoadingButton
              loading={isDeleting}
              onClick={async () => {
                await onDeletePdf();
                openDeleteConfirm.onFalse();
              }}
              variant="contained"
              color="error"
            >
              Delete
            </LoadingButton>
          }
        />
      )}
    </>
  );
}

export default function RichTextEditor({
  template,
  setSave,
}: {
  template: TemplateWithFieldsManager;
  setSave: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Box padding={2}>
      <ExportHTML setSave={setSave} template={template} />
    </Box>
  );
}
