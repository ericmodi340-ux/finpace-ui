import { useCallback, useState } from 'react';

import '/lib/style.css';
import { Retro, ThemeConfigProps ,
  TextFormat,
  BasicEmailTemplate,
  EmailEditorProvider,
} from '';

import { MergeTags } from './mergeTags';
import { categories } from './categories';
import '../engagement-hub/email-templates/builder.css';

// import '@arco-themes/react-easy-email-theme/css/arco.css';
import DocubuildHeader from './docubuilder-header';
import { TemplateWithFieldsManager } from '../../../@types/template';
import { initialTemplate } from './initial-template';
import { createStorageItem, storagePaths } from 'redux/slices/storage';
import { CDN_PATH } from 'config';

const hoveringToolbar: ThemeConfigProps['hoveringToolbar'] = {
  follow: 'container',
  iconSize: 14,
  list({ isCollapsed, selection, isFocus }) {
    if (isFocus || selection)
      return [
        TextFormat.BOLD,
        TextFormat.ITALIC,
        TextFormat.UNDERLINE,
        TextFormat.STRIKETHROUGH,
        TextFormat.LINK,
        TextFormat.MERGETAG,
        TextFormat.TEXT_COLOR,
        TextFormat.BACKGROUND_COLOR,
        TextFormat.FONT_SIZE,
        TextFormat.ALIGN,
        TextFormat.TURN_INTO,
        TextFormat.LIST,
      ];

    if (isCollapsed) return [];

    return [];
  },
};

type Props = {
  json: any;
  updateTemplate: any;
  onClose: any;
  template: TemplateWithFieldsManager;
  mergeTags: any[];
};

export default function DocuBuilder({ json, updateTemplate, onClose, template, mergeTags }: Props) {
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(
    async (values: BasicEmailTemplate) => {
      setLoading(true);
      await updateTemplate(values);
      setLoading(false);
    },
    [updateTemplate]
  );

  const onUploadImage = useCallback(
    async (blob: Blob) => {
      const path = await createStorageItem({
        file: blob,
        path: `${storagePaths.templateDocubuildImages(template.id)}/${new Date().getTime()}`,
      });

      return CDN_PATH + path.key;
    },
    [template.id]
  );

  const config = Retro.useCreateConfig({
    // Paid clients fill in the Client ID here. After subscribing to the paid plan, support will send you the client ID
    clientId: 'test',
    // @ts-ignore
    height: 'calc(100vh - 60px)',
    // @ts-ignore
    categories,
    onUpload: onUploadImage,
    // @ts-ignore
    initialValues: json || initialTemplate,
    onSubmit,
    showEditTestVariableButton: true,
    // onChange,
    showSourceCode: true,
    showLayer: true,
    showPreview: false,
    showSidebar: true,
    compact: true,
    showDragMoveIcon: true,
    showInsertTips: true,
    hoveringToolbar,
    mergetags: [
      ...MergeTags,
      {
        label: 'Form Fields',
        value: '',
        children: mergeTags,
      },
    ],
  });

  return (
    <EmailEditorProvider {...config}>
      <DocubuildHeader
        loading={loading}
        content={json}
        title={`${template?.title} - Docubuild`}
        onClose={onClose}
      />
      <Retro.Layout />
    </EmailEditorProvider>
  );
}
