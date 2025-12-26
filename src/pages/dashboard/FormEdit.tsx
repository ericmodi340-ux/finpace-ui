import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Container, Dialog } from '@mui/material';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// hooks
import useForm from 'hooks/useForm';
import useSettings from 'hooks/useSettings';
import useUser from 'hooks/useUser';
// components
import Page from 'components/Page';
import HeaderBreadcrumbs from 'components/HeaderBreadcrumbs';
// sections
import { FormStepper } from 'sections/@dashboard/form/FormStepper';
// utils
import { getParams } from 'utils/params';
// constants
import { roles } from 'constants/users';
import { useSelector } from 'redux/store';
import { getForm } from 'redux/slices/forms';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  backgroundColor: theme.palette.background.neutral,
}));

// ----------------------------------------------------------------------

export default function FormEdit() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { formId = '' } = useParams();
  const params = getParams();
  const isEdit = !pathname.includes('/forms/new');
  const isReadOnly = pathname.includes(`/forms/${formId}/view`);
  const { loaded: formsLoaded } = useSelector((state) => state.forms);
  const { authUser } = useUser();

  const [currentFormId, setCurrentFormId] = useState(formId);

  const currentForm = useForm(currentFormId);
  const listPage = PATH_DASHBOARD.clients.root;

  const handleClose = () => {
    if (authUser?.role === roles.CLIENT) {
      navigate(PATH_DASHBOARD.root);
    } else {
      navigate(`${listPage}/${currentForm?.clientId || params.clientId || ''}`);
    }
  };

  const title = isEdit ? 'Edit form' : 'Create a new form';

  useEffect(() => {
    let request = false;
    if (formId && !request && formsLoaded) {
      void getForm(formId);
    }
    return () => {
      request = true;
    };
  }, [formId, formsLoaded]);

  return (
    <Page title={title}>
      <FormStepper
        isEdit={isEdit}
        isReadOnly={isReadOnly}
        formId={currentFormId}
        handleClose={handleClose}
        setCurrentFormId={setCurrentFormId}
      />
    </Page>
  );
}
