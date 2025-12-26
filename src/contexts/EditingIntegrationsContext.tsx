import { useState, ReactNode, createContext, useEffect } from 'react';
// @types
import { FirmAdminManager } from '../@types/firmAdmin';
import { IntegrationsState, IntegrationConfig } from '../@types/integration';
import { IntegrationFields } from '../@types/integrationField';
import { UserRole } from '../@types/user';
// redux
import { useDispatch, useSelector } from 'redux/store';
import {
  getAdvisorIntegrations,
  getAdvisorIntegrationsFields,
} from 'redux/slices/integrationsAdvisor';
import { getFirmIntegrations, getFirmIntegrationsFields } from 'redux/slices/integrationsFirm';
// hooks
import useUser from 'hooks/useUser';
// constants
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

export const defaultEditingIntegrations = {
  type: roles.ADVISOR as UserRole.ADVISOR,
  integrations: [],
  integrationsFields: {},
};

// ----------------------------------------------------------------------

type EditingIntegrationsContextProps = {
  type: UserRole.ADVISOR | 'firm';
  integrations: IntegrationConfig[];
  integrationsFields: IntegrationFields;
  onChangeType: (value: UserRole.ADVISOR | 'firm') => void;
  isLoading: boolean;
};

// ----------------------------------------------------------------------

const initialState: EditingIntegrationsContextProps = {
  ...defaultEditingIntegrations,
  onChangeType: () => {},
  isLoading: false,
};

const EditingIntegrationsContext = createContext(initialState);

type EditingIntegrationsProviderProps = {
  children: ReactNode;
};

function EditingIntegrationsProvider({ children }: EditingIntegrationsProviderProps) {
  const dispatch = useDispatch();
  const { authUser, user } = useUser();
  const firmAdminUser = authUser?.role === roles.FIRM_ADMIN ? (user as FirmAdminManager) : null;
  const defaultToFirmIntegrations =
    authUser?.role === roles.FIRM_ADMIN && !firmAdminUser?.isAdvisor;

  const [type, setType] = useState<UserRole.ADVISOR | 'firm'>(
    defaultToFirmIntegrations ? 'firm' : (roles.ADVISOR as UserRole.ADVISOR)
  );

  useEffect(() => {
    if (defaultToFirmIntegrations) {
      setType('firm');
    } else {
      setType(roles.ADVISOR as UserRole.ADVISOR);
    }
  }, [defaultToFirmIntegrations]);

  const {
    integrations: firmIntegrations,
    integrationsFields: firmIntegrationsFields,
    isLoading: firmIsLoading,
  } = useSelector((state) => state.integrationsFirm) as IntegrationsState;
  const {
    integrations: advisorIntegrations,
    integrationsFields: advisorIntegrationsFields,
    isLoading: advisorIsLoading,
  } = useSelector((state) => state.integrationsAdvisor) as IntegrationsState;

  const [editingIntegrations, setEditingIntegrations] = useState({
    type: initialState.type,
    integrations: initialState.integrations,
    integrationsFields: initialState.integrationsFields,
  });

  useEffect(() => {
    let newDefaultToFirmIntegrations =
      authUser?.role === roles.FIRM_ADMIN && !firmAdminUser?.isAdvisor;
    if (newDefaultToFirmIntegrations) {
      setType('firm');
    }
  }, [authUser?.role, firmAdminUser?.isAdvisor]);

  useEffect(() => {
    if (user?.firmId && authUser?.role === roles.FIRM_ADMIN) {
      dispatch(getFirmIntegrations(user.firmId));
    }
  }, [authUser?.role, dispatch, user?.firmId]);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAdvisorIntegrations(user.id));
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (user) {
      if ([roles.FIRM_ADMIN, roles.ADVISOR].includes(authUser?.role)) {
        dispatch(getFirmIntegrations(user.firmId || ''));
        if (authUser?.role === roles.FIRM_ADMIN) {
          dispatch(getFirmIntegrationsFields(user.firmId || ''));
        }
      }

      if (
        authUser?.role === roles.ADVISOR ||
        (authUser?.role === roles.FIRM_ADMIN && firmAdminUser?.isAdvisor)
      ) {
        dispatch(getAdvisorIntegrations(user.id || ''));
        dispatch(getAdvisorIntegrationsFields(user.id || ''));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.role, dispatch, firmAdminUser?.isAdvisor]);

  useEffect(() => {
    if (type) {
      const newIntegrations = type === 'firm' ? firmIntegrations : advisorIntegrations;
      const newIntegrationsFields =
        type === 'firm' ? firmIntegrationsFields : advisorIntegrationsFields;
      setEditingIntegrations({
        type,
        integrations: newIntegrations,
        integrationsFields: newIntegrationsFields,
      });
    } else {
      setEditingIntegrations({
        type: initialState.type,
        integrations: initialState.integrations,
        integrationsFields: initialState.integrationsFields,
      });
    }
  }, [
    advisorIntegrations,
    advisorIntegrationsFields,
    firmIntegrations,
    firmIntegrationsFields,
    type,
  ]);

  const onChangeType = (newType: UserRole.ADVISOR | 'firm') => {
    setType(newType);
  };

  return (
    <EditingIntegrationsContext.Provider
      value={{
        ...editingIntegrations,
        onChangeType,
        isLoading: firmIsLoading || advisorIsLoading,
      }}
    >
      {children}
    </EditingIntegrationsContext.Provider>
  );
}

export { EditingIntegrationsProvider, EditingIntegrationsContext };
