import { EmailTemplateWithAllFields } from '../../../../../@types/engagementHub';
import { useEffect, useState } from 'react';
import { getEmailTemplate } from 'redux/slices/engagement-hub';
import { useSelector } from 'redux/store';

export default function useGetFullEmailTemplate(emailTemplateId: string) {
  const { user } = useSelector((state) => state.user);
  const [currentEmailTemplate, setCurrentEmailTemplate] =
    useState<EmailTemplateWithAllFields | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getFullTemplate() {
      if (!user?.id || !emailTemplateId) return;
      setLoading(true);
      const resp = await getEmailTemplate(user?.id, emailTemplateId);
      setLoading(false);
      setCurrentEmailTemplate(resp);
    }
    getFullTemplate();
  }, [emailTemplateId, user?.id]);

  return {
    currentEmailTemplate,
    loading,
  };
}
