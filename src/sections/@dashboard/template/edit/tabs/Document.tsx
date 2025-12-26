import * as Yup from 'yup';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useFormik, Form, FormikProvider } from 'formik';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
// @mui
import {
  Stack,
  InputLabel,
  Grid,
  Box,
  Skeleton,
  Card,
  Select,
  MenuItem,
  ListSubheader,
  Typography,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
// @types
import {
  TemplateWithFieldsManager,
  DsTemplates,
  DsTemplateType,
} from '../../../../../@types/template';
// redux
import { getTemplates, getTemplateTabs } from 'redux/slices/docusign';
import { getTemplateFieldsById, updateTemplate } from 'redux/slices/templates';
// sections
import FieldMappingTable from './FieldMappingTable';
// components
import LoadingScreen from 'components/LoadingScreen';
import RichTextEditor from 'components/editor/LexicalRTE/RichTextEditor';
import Iconify from 'components/Iconify';
import { useSelector } from 'redux/store';

// ----------------------------------------------------------------------

export type FormValuesProps = {
  selectedDocument: string;
};

export let initialValues = () => ({});

export const FormSchema = Yup.object().shape({
  selectedDocument: Yup.string().required('Document is required'),
});

// ----------------------------------------------------------------------

export default function Document({
  template,
  showRTE,
  setShowRTE,
  setSave,
}: {
  template: TemplateWithFieldsManager | undefined;
  showRTE: boolean;
  setShowRTE: (value: boolean) => void;
  setSave: Dispatch<SetStateAction<boolean>>;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { templateId } = useParams();
  const { dsTemplateType, dsTemplateId } = template || {};
  const { isLoading } = useSelector((state) => state.templates);

  const [dsTemplates, setDsTemplates] = useState<DsTemplates>();
  const [templateFields, setTemplateFields] = useState([]);
  const [dsTemplatesLoading, setDsTemplatesLoading] = useState(false);

  const [dsTemplateTabs, setDsTemplateTabs] = useState();
  const [dsTemplateTabsLoading, setDsTemplateTabsLoading] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    initialValues: {
      selectedDocument:
        template?.dsTemplateType && template?.dsTemplateId
          ? `${template?.dsTemplateType}/${template?.dsTemplateId}`
          : '',
    },
    validationSchema: FormSchema,
    onSubmit: () => {},
  });

  useEffect(() => {
    setSave(false);
  }, [setSave]);

  const { values, errors, touched, handleSubmit, getFieldProps, setFieldValue } = formik;

  const { signingEventType = 'docusign' } = template || {};

  // Get template tabs
  useEffect(() => {
    const handleGetDsTemplates = async () => {
      try {
        setDsTemplatesLoading(true);
        const templates = await getTemplates();
        // get template fields and add them to mentionValues
        const templateFieldsData = await getTemplateFieldsById(String(templateId));
        setTemplateFields(templateFieldsData);
        setDsTemplates(templates);
        setDsTemplatesLoading(false);
      } catch (err) {
        console.error(err);
        enqueueSnackbar('Something went wrong getting templates', { variant: 'error' });
        setDsTemplatesLoading(false);
      }
    };
    if (signingEventType === 'docusign') {
      handleGetDsTemplates();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const handleGetDsTemplateTabs = async (dsTemplateType: DsTemplateType, dsTemplateId: string) => {
    try {
      setDsTemplateTabsLoading(true);
      const tabs = await getTemplateTabs({ dsTemplateType, dsTemplateId });
      setDsTemplateTabs(tabs);
      setDsTemplateTabsLoading(false);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Something went wrong getting template tabs', { variant: 'error' });
      setDsTemplateTabsLoading(false);
    }
  };

  const handleUpdateTemplateDocument = async (dsTemplatePath: string) => {
    try {
      const [newTemplateType, newTemplateId] = dsTemplatePath.split('/');

      if (templateId) {
        await updateTemplate(templateId, {
          ...template,
          dsTemplateId: newTemplateId,
          dsTemplateType: newTemplateType as DsTemplateType,
          richTextHtml: '',
          jsonEditorOutput: '',
          showRTE: false,
        });
        await handleGetDsTemplateTabs(newTemplateType as DsTemplateType, newTemplateId);
        // window.location.reload();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
    }
  };

  // Get template tabs
  useEffect(() => {
    if (dsTemplateType && dsTemplateId && signingEventType === 'docusign') {
      handleGetDsTemplateTabs(dsTemplateType, dsTemplateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dsTemplateId, dsTemplateType]);

  useEffect(() => {
    if (
      !showRTE &&
      values.selectedDocument &&
      values.selectedDocument !== `${dsTemplateType}/${dsTemplateId}`
    ) {
      handleUpdateTemplateDocument(values.selectedDocument);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dsTemplateId, dsTemplateType, showRTE, templateId, values, values.selectedDocument]);

  if (!template) {
    return <LoadingScreen isDashboard />;
  }

  const Loader = () => {
    if (dsTemplatesLoading) {
      return (
        <>
          {[...Array(2)].map((_, index) => (
            <Box key={index}>
              <Skeleton
                variant="rectangular"
                width="100%"
                sx={{ height: 50, borderRadius: 2, margin: '1rem 0 0 0' }}
              />
            </Box>
          ))}
        </>
      );
    }
    return <></>;
  };

  const NoTabsFound = () => {
    // Show error when template has no tabs
    if (
      dsTemplateTabs &&
      !dsTemplateTabsLoading &&
      templateId &&
      Object.keys(dsTemplateTabs).length === 0
    ) {
      return (
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            No tabs were found for this document. Please contact Bitsy if this is unexpected.
          </Typography>
        </Box>
      );
    }
    return <></>;
  };

  const renderTextEditor = (
    <Card sx={{ overflow: 'initial' }}>
      <RichTextEditor template={template} setSave={setSave} />
    </Card>
  );

  return (
    <Stack spacing={3}>
      {signingEventType === 'docusign' ? (
        <>
          <Card>
            <Stack spacing={2} sx={{ p: 2, width: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  Document Builder
                </Typography>
                <Tooltip title="Build your own document from an editor" placement="right">
                  <Box sx={{ ml: 1, display: 'flex' }}>
                    <Iconify
                      color="primary.main"
                      icon={'ion:information-circle-sharp'}
                      width={21}
                      height={21}
                    />
                  </Box>
                </Tooltip>
              </Box>
              <Stack spacing={1} alignItems="flex-start">
                <FormControlLabel
                  control={
                    <Switch defaultChecked checked={showRTE} onClick={() => setShowRTE(!showRTE)} />
                  }
                  label="Show Document Builder"
                  sx={{ mx: 0 }}
                />
              </Stack>
            </Stack>
          </Card>
          {showRTE ? (
            renderTextEditor
          ) : (
            <FormikProvider value={formik}>
              <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card sx={{ p: 3, overflow: 'initial' }}>
                      <Loader />
                      <Stack spacing={3}>
                        <InputLabel>Please select the document for this form:</InputLabel>
                        <Select
                          {...getFieldProps('selectedDocument')}
                          value={values.selectedDocument}
                          error={Boolean(touched.selectedDocument && errors.selectedDocument)}
                          onChange={(item) => {
                            setFieldValue('selectedDocument', item.target.value);
                          }}
                        >
                          <MenuItem value="" disabled>
                            <em>Select one</em>
                          </MenuItem>
                          {dsTemplates &&
                            Object.keys(dsTemplates).length > 0 &&
                            Object.keys(dsTemplates).map((key: string) => {
                              const templateType = key as DsTemplateType;
                              if (!dsTemplates?.[templateType].length) {
                                return [];
                              }
                              const items = dsTemplates?.[templateType].map((doc: any) => (
                                <MenuItem
                                  value={`${templateType}/${doc.templateId}`}
                                  key={doc.templateId}
                                >
                                  {doc.name}
                                </MenuItem>
                              ));
                              return [
                                <ListSubheader key={templateType}>
                                  {templateType.toUpperCase()}
                                </ListSubheader>,
                                items,
                              ];
                            })}
                        </Select>
                        {/* <ShowFieldMappingTable /> */}
                        {dsTemplateTabs &&
                          !dsTemplateTabsLoading &&
                          templateId &&
                          Object.keys(dsTemplateTabs).length > 0 && (
                            <FieldMappingTable
                              dsFieldMapping={template?.dsFieldMapping}
                              dsTemplateTabs={dsTemplateTabs}
                              templateFields={templateFields}
                              // templateId={templateId}
                              template={template}
                            />
                          )}
                        <NoTabsFound />
                        {(dsTemplateTabsLoading || isLoading) && (
                          <Box>
                            <Skeleton
                              variant="rectangular"
                              width="100%"
                              sx={{ height: 50, borderRadius: 2, margin: '1rem 0 0 0' }}
                            />
                          </Box>
                        )}
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>
              </Form>
            </FormikProvider>
          )}
        </>
      ) : (
        renderTextEditor
      )}
    </Stack>
  );
}
