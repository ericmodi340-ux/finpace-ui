import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
// @types
import { IntegrationConfig } from '../@types/integration';
import { UserRole } from '../@types/user';
// redux
import { useSelector } from 'redux/store';
// hooks
import useUser from 'hooks/useUser';
// constants
import { roles } from 'constants/users';
import { FirmAdminManager } from '../@types/firmAdmin';

const useIntegrations = () => {
  const { authUser, user } = useUser();

  const [integrations, setIntegrations] = useState<
    (IntegrationConfig & { integrationOwner: string })[]
  >([]);
  const showBothIntegrationOwners =
    authUser?.role === roles.ADVISOR || (user as FirmAdminManager)?.isAdvisor;

  const { integrations: firmIntegrationConfigs, isLoading: firmIsLoading } = useSelector(
    (state) => state.integrationsFirm
  );
  const firmIntegrations = firmIntegrationConfigs.map((integration) => ({
    ...integration,
    integrationOwner: 'firm',
  }));
  const { integrations: advisorIntegrationConfigs, isLoading: advisorIsLoading } = useSelector(
    (state) => state.integrationsAdvisor
  ); // ? Should this actually be based on the client.advisor?
  const advisorIntegrations = advisorIntegrationConfigs.map((integration) => ({
    ...integration,
    integrationOwner: roles.ADVISOR as UserRole.ADVISOR,
  }));

  useEffect(() => {
    let newIntegrations: (IntegrationConfig & { integrationOwner: string })[] = [];
    switch (authUser?.role) {
      case roles.ADVISOR:
        newIntegrations = advisorIntegrations;
        break;
      case roles.FIRM_ADMIN:
        if (showBothIntegrationOwners) {
          // The user is a firm admin, and the passed condition for showing integrations for both owners (e.g. the firm admin is also an advisor and is the client's advisor) has been met
          newIntegrations = [...firmIntegrations, ...advisorIntegrations];
        } else {
          newIntegrations = firmIntegrations;
        }
        break;
      default:
        newIntegrations = [];
        break;
    }

    if (!isEqual(newIntegrations, integrations)) {
      setIntegrations(newIntegrations);
    }
  }, [
    advisorIntegrations,
    authUser?.role,
    firmIntegrations,
    integrations,
    showBothIntegrationOwners,
  ]);

  return {
    integrations,
    showBothIntegrationOwners,
    loading: firmIsLoading || advisorIsLoading,
  };
};

export default useIntegrations;
