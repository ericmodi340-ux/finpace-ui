import { EmailTemplateWithAllFields } from '../../../../@types/engagementHub';
import { useCallback, useState } from 'react';

import { useSelector } from 'redux/store';

import mjml from 'mjml-browser';

import '/lib/style.css';
import { EditorCore } from '';
import { Retro, ThemeConfigProps } from '';
import { TextFormat, BasicEmailTemplate, EmailEditorProvider } from '';

import { updateEmailTemplate } from 'redux/slices/engagement-hub';
import { MergeTags } from './mergeTags';
import { initialTemplate } from './initial-template';
import './builder.css';

// import '@arco-themes/react-easy-email-theme/css/arco.css';
import { htmlToThumbnail } from 'utils/htmlToImage';
import { createStorageItem, storagePaths } from 'redux/slices/storage';
import { useSnackbar } from 'notistack';
import { CDN_PATH } from 'config';
import EmailTemplateHeader from './email-template-header';
import { categories } from './categories';

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

export default function EmailTemplateBuilder({
  emailTemplate,
}: {
  emailTemplate: EmailTemplateWithAllFields;
}) {
  const { user } = useSelector((state) => state.user);
  const { enqueueSnackbar } = useSnackbar();
  const { firm } = useSelector((state) => state.firm);
  const [loading, setLoading] = useState(false);

  const onUploadImage = useCallback(
    async (blob: Blob) => {
      if (!user?.id) return '';
      const path = await createStorageItem({
        file: blob,
        path: `${storagePaths.emailTemplateTemplateImages(user?.id, emailTemplate?.emailTemplateId)}/${new Date().getTime()}`,
      });

      return CDN_PATH + path.key;
    },
    [emailTemplate?.emailTemplateId, user?.id]
  );

  const onSubmit = useCallback(
    async (values: BasicEmailTemplate) => {
      if (!user?.id) return;
      const mjmlString = EditorCore.toMJML({
        element: values.content,
        mode: 'production',
        beautify: true,
      });

      const { html } = mjml(mjmlString, {});
      htmlToThumbnail(html).then((dataUrl: any) => {
        createStorageItem({
          path: storagePaths.emailTemplateThumbnails(user.id, emailTemplate.emailTemplateId),
          file: dataUrl,
          isPublic: true,
        });
      });

      setLoading(true);

      await updateEmailTemplate(user?.id, emailTemplate?.emailTemplateId, {
        ...emailTemplate,
        json: values,
      });
      setLoading(false);
    },
    [user?.id, emailTemplate]
  );

  const initialContent = emailTemplate?.json?.content
    ? emailTemplate?.json?.content
    : initialTemplate.content;

  const config = Retro.useCreateConfig({
    // Paid clients fill in the Client ID here. After subscribing to the paid plan, support will send you the client ID
    clientId: 'test',
    // @ts-ignore
    height: 'calc(100vh - 60px)',
    onUpload: onUploadImage,
    initialValues: {
      // @ts-ignore
      content: initialContent,
      subject: emailTemplate?.subject || '',
    },

    onSubmit,
    showEditTestVariableButton: true,
    // onChange,
    showSourceCode: true,
    showLayer: true,
    showPreview: true,
    showSidebar: true,
    // @ts-ignore
    categories,
    compact: true,
    showDragMoveIcon: true,
    showInsertTips: true,
    hoveringToolbar,
    mergetags: MergeTags,
    mergetagsData: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'client@email.com',
      firm: {
        name: firm?.name,
        logo: CDN_PATH + storagePaths.firmLogo(firm?.id),
        icon: CDN_PATH + storagePaths.firmIcon(firm?.id),
      },
      advisor: {
        name: user?.name,
        email: user?.email,
        socialMedia: {
          facebook: user?.socialMedia?.facebook || '',
          instagram: user?.socialMedia?.instagram || '',
          linkedin: user?.socialMedia?.linkedin || '',
          twitter: user?.socialMedia?.twitter || '',
          youtube: user?.socialMedia?.youtube || '',
        },
      },
    },
  });

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <EmailEditorProvider {...config}>
        <EmailTemplateHeader loading={loading} emailTemplate={emailTemplate} onSave={onSubmit} />
        <Retro.Layout />
      </EmailEditorProvider>
    </div>
  );
}
