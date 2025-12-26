import { useEffect, useState } from 'react';
// @types
import { IntegrationServiceId } from '../@types/integration';
import { RedtailFields, SalesforceFields, WealthboxFields } from '../@types/integrationField';
import { UserRole } from '../@types/user';
// redux
import { useSelector } from 'redux/store';
import { getAdvisorIntegrationFields } from 'redux/slices/integrationsAdvisor';
import { getFirmIntegrationFields } from 'redux/slices/integrationsFirm';
// hooks
import useUser from 'hooks/useUser';
// constants
import { roles } from 'constants/users';

const useIntegrationFields = ({
  integrationType,
  integrationOwner,
}: {
  integrationType: IntegrationServiceId;
  integrationOwner: UserRole.ADVISOR | 'firm';
}) => {
  const { user } = useUser();
  const { firm } = useSelector((state) => state.firm);

  const [integrationFields, setIntegrationFields] = useState<
    RedtailFields | SalesforceFields | WealthboxFields
  >({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (integrationType && integrationOwner) {
      const getIntegrationFields = async () => {
        setLoading(true);
        try {
          let newIntegrationFields;
          if (integrationOwner === 'firm') {
            newIntegrationFields = await getFirmIntegrationFields(firm.id || '', integrationType);
          }
          if (integrationOwner === roles.ADVISOR) {
            newIntegrationFields = await getAdvisorIntegrationFields(
              user?.id || '',
              integrationType
            );
          }
          setIntegrationFields(newIntegrationFields);
        } catch (err) {
          setError(err.message || 'Unexpected Error!');
        } finally {
          setLoading(false);
        }
      };

      getIntegrationFields();
    }
  }, [firm.id, integrationOwner, integrationType, user?.id]);

  return {
    integrationFields,
    error,
    loading,
  };
};

export default useIntegrationFields;
