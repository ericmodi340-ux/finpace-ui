import { useParams } from 'react-router';
import LoadingScreen from 'components/LoadingScreen';
import DocuBuilder from './docubuilder';
import useFullTemplate from 'hooks/useFullTemplate';
import { getTemplateFieldsById, getTemplates, updateTemplate } from 'redux/slices/templates';
import { useRouter } from 'routes/use-router';
import { useEffect, useState } from 'react';

export default function DocubuildView() {
  const { templateId = '' } = useParams();

  const { back } = useRouter();

  const { template: currentTemplate, loading: currentTemplateLoading } =
    useFullTemplate(templateId);

  const [loadingMergeTags, setLoadingMergeTags] = useState(false);
  const [mergeTags, setMergeTags] = useState<any>([]);

  // Get template tabs
  useEffect(() => {
    const handleGetDsTemplates = async () => {
      try {
        setLoadingMergeTags(true);
        await getTemplates();
        // get template fields and add them to mentionValues
        const templateFieldsData = await getTemplateFieldsById(String(templateId));

        setMergeTags(
          templateFieldsData?.map((item: any) => ({
            label: item?.label,
            value: item?.id,
          })) || []
        );

        setLoadingMergeTags(false);
      } catch (err) {
        console.error(err);
        setLoadingMergeTags(false);
      }
    };

    handleGetDsTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  if (currentTemplateLoading || loadingMergeTags) return <LoadingScreen />;

  if (!currentTemplate) return;

  return (
    <DocuBuilder
      onClose={back}
      json={currentTemplate?.projectJson}
      template={currentTemplate}
      updateTemplate={async (data: any) => {
        await updateTemplate(currentTemplate?.id, {
          dsTemplateId: '',
          projectJson: data,
          showRTE: true,
        });
      }}
      mergeTags={mergeTags}
    />
  );
}
