import { useEffect, useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
// @types
import { FormManager } from '../@types/form';
import { UserRole } from '../@types/user';
// redux
import { dispatch, useSelector } from 'redux/store';
import { getClientForms, getForms } from 'redux/slices/forms';
// hooks
import useUser from 'hooks/useUser';
// utils
import arrayFromObj from 'utils/arrayFromObj';
// constants
import { formStatuses } from 'constants/forms';
import { roles } from 'constants/users';

const useUserForms = (userId: string, role: UserRole) => {
  const { enqueueSnackbar } = useSnackbar();
  const { authUser } = useUser();
  const isClient = authUser?.role === roles.CLIENT;

  const formsFromStore = useSelector((state) => state.forms);

  const [forms, setForms] = useState<FormManager[]>([]);
  const [pendingForms, setPendingForms] = useState<FormManager[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (forms) {
      let newPendingForms = forms.filter(
        (form) => ![formStatuses.COMPLETED, formStatuses.CANCELLED].includes(form.status)
      );

      // Don't show draft forms on client dashboard
      if (isClient) {
        newPendingForms = newPendingForms.filter(
          (form) => ![formStatuses.DRAFT].includes(form.status)
        );
      }

      setPendingForms(newPendingForms);
      setLoading(false);
    } else {
      dispatch(getForms());
    }
  }, [forms, isClient]);

  const handleUseUserForms = useCallback(async () => {
    try {
      const storeFormsArray = arrayFromObj(
        formsFromStore.byId,
        formsFromStore.allIds
      ) as FormManager[];
      setForms(storeFormsArray);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error loading forms', { variant: 'error' });
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [enqueueSnackbar, formsFromStore.allIds, formsFromStore.byId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const handleGetClientForms = async (clientId: string) => {
      try {
        const response = await getClientForms(clientId);
        setForms(response);
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Error loading forms', { variant: 'error' });
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    if (authUser?.sub === userId && authUser?.role === role) {
      // Logged in user is the client for which forms are being queried, use forms from state
      handleUseUserForms();
    } else if (role === roles.CLIENT && isClient) {
      // Logged in user is an advisor or firm admin, make a call to get the client forms
      handleGetClientForms(userId);
    }
  }, [enqueueSnackbar, handleUseUserForms, authUser?.sub, authUser?.role, userId, role, isClient]);

  return {
    forms,
    pendingForms,
    error,
    loading,
  };
};

export default useUserForms;
