import { useParams } from 'react-router-dom';
import { useSelector } from 'redux/store';
import { useEffect, useState } from 'react';
import { getEmailTemplate } from 'redux/slices/engagement-hub';
import EmailTemplateBuilder from 'sections/@dashboard/engagement-hub/email-templates/email-template-builder';
import LoadingScreen from 'components/LoadingScreen';
import { Helmet } from 'react-helmet-async';
import { EmailTemplateWithAllFields } from '../../@types/engagementHub';

// ----------------------------------------------------------------------

export default function EmailTemplateEdit() {
  const { emailTemplateId = '' } = useParams();
  const { user } = useSelector((state) => state.user);
  const [currentTemplate, setCurrentTemplate] = useState<null | EmailTemplateWithAllFields>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getFullTemplate() {
      try {
        if (!user?.id || !emailTemplateId) return;
        setLoading(true);
        const resp: EmailTemplateWithAllFields = await getEmailTemplate(user?.id, emailTemplateId);
        setCurrentTemplate(resp);
        setLoading(false);
      } catch {
        setCurrentTemplate(null);
        setLoading(false);
      }
    }
    getFullTemplate();
  }, [emailTemplateId, user?.id]);

  if (loading) return <LoadingScreen />;

  if (!currentTemplate) return null;

  return (
    <>
      <Helmet>
        <title>{currentTemplate?.name} - Builder</title>
      </Helmet>
      <EmailTemplateBuilder emailTemplate={currentTemplate} />;
    </>
  );
}
