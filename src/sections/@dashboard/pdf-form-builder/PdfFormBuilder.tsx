import { useCallback, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { updateTemplate } from 'redux/slices/templates';
import { Dialog, DialogProps, Stack } from '@mui/material';
import { TemplateWithFieldsManager } from '../../../@types/template';
import { DASHBOARD_HEADER_DESKTOP } from 'config';
import PdfBuilderHeader from './components/PdfBuilderHeader';
import FormFieldToolbox from './components/FormFieldToolbox';
import PdfCanvas from './components/PdfCanvas';
import Scrollbar from 'components/Scrollbar';
import PdfFieldProperty from './components/PdfFieldProperty';
import { Utils } from '@formio/react';
import { cloneDeep } from 'lodash';
import { useDispatch, useSelector } from 'redux/store';
import { resetValues, setFields } from 'redux/slices/formBuilder';

type Props = DialogProps & {
  template: TemplateWithFieldsManager | undefined;
  onClose: () => void;
  setTemplate: (template: any) => void;
};

function isObject(obj: any) {
  return obj != null && obj.constructor.name === 'Object';
}

function getFormApiKeys(template: TemplateWithFieldsManager | undefined) {
  const components = cloneDeep(template?.fields) || [];
  const apiKeys: string[] = [];
  Utils.eachComponent(components, (component: any) => {
    if (component.key) {
      apiKeys.push(component.key);
    }
  });
  return apiKeys;
}

export default function PdfFormBuilder({ template, onClose, setTemplate, ...other }: Props) {
  const { templateId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { fields } = useSelector((state) => state.formBuilder);

  const dispatch = useDispatch();

  const apiKeys = useMemo(() => getFormApiKeys(template), [template]);

  useEffect(() => {
    if (template?.pdfFormSchema?.components) {
      dispatch(
        setFields(
          isObject(template.pdfFormSchema.components) ? template.pdfFormSchema.components : {}
        )
      );
    }
  }, [dispatch, template?.pdfFormSchema?.components]);

  const onSave = useCallback(async () => {
    if (templateId) {
      try {
        const updatedTemplate = {
          pdfFormSchema: {
            ...template?.pdfFormSchema,
            components: fields,
          },
        };
        const resp = await updateTemplate(templateId, updatedTemplate);
        setTemplate(resp);
        enqueueSnackbar('Template saved successfully!', {
          variant: 'success',
          anchorOrigin: {
            horizontal: 'center',
            vertical: 'top',
          },
        });
      } catch (e) {
        console.log(e);
        enqueueSnackbar('Oops, an error occured!', { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, fields, setTemplate, template?.pdfFormSchema, templateId]);

  const onCloseHandler = useCallback(() => {
    dispatch(resetValues());
    onClose();
  }, [dispatch, onClose]);

  if (!template) return null;

  return (
    <Dialog disableEnforceFocus fullScreen onClose={onCloseHandler} {...other}>
      <Stack
        sx={{
          flex: 1,
          background: (theme) => theme.palette.background.neutral,
        }}
      >
        <PdfBuilderHeader onClose={onCloseHandler} onSave={onSave} template={template} />
        <Stack
          direction="row"
          sx={{
            flexGrow: 1,
          }}
        >
          <FormFieldToolbox />
          <Stack
            sx={{
              flexGrow: 1,
              height: `calc(100vh - ${DASHBOARD_HEADER_DESKTOP}px)`,
              overflowY: 'auto',
              py: 3,
            }}
          >
            <Scrollbar>
              <PdfCanvas template={template} />
            </Scrollbar>
          </Stack>
          <PdfFieldProperty apiKeys={apiKeys} />
        </Stack>
      </Stack>
    </Dialog>
  );
}
