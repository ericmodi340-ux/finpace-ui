import { Suspense, lazy, ElementType } from 'react';
import { Navigate, useRoutes, useLocation, Outlet } from 'react-router-dom';
// @types
import { UserRole } from '../@types/user';
// layouts
import DashboardLayout from '../layouts/dashboard';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout';
// guards
import AuthGuard from 'guards/AuthGuard';
import RoleBasedGuard from 'guards/RoleBasedGuard';
import SsoClientsAddGuard from 'guards/SsoClientsAddGuard';
// components
import LoadingScreen from '../components/LoadingScreen';
// constants
import { roles } from 'constants/users';
// paths
import { PATH_DASHBOARD } from './paths';
// hooks
import useUser from 'hooks/useUser';
import AuthClassicLayout from 'layouts/auth/classic';

// ----------------------------------------------------------------------

const Loadable: any = (Component: ElementType) => (props: any) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  return (
    <Suspense fallback={<LoadingScreen isDashboard={pathname.includes('/dashboard')} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  const { authUser } = useUser();

  return useRoutes([
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <AuthClassicLayout>
              <Login />
            </AuthClassicLayout>
          ),
        },
        {
          path: 'register',
          element: (
            <AuthClassicLayout>
              <Register />
            </AuthClassicLayout>
          ),
        },
        {
          path: 'verify',
          element: (
            <AuthClassicLayout>
              <VerifyCode />
            </AuthClassicLayout>
          ),
        },
      ],
    },
    // Esign Access Documents - used in DocuSign email links
    {
      path: 'access-documents',
      element: <EsignAccessDocuments />,
    },

    // Esign Callback - used as redirect url after a signer signs a DocuSign document
    {
      path: 'esign-callback',
      element: <EsignCallback />,
    },

    // Dashboard Routes
    {
      path: '/',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        {
          element: authUser?.role === roles.CLIENT ? <ClientLanding /> : <Dashboard />,
          index: true,
        },
        {
          path: 'dashboard/chat',
          element: (
            <RoleBasedGuard accessibleRoles={[roles.CLIENT]}>
              <ClientLandingSMS />
            </RoleBasedGuard>
          ),
        },
        {
          path: 'dashboard/forms',
          element: (
            <RoleBasedGuard accessibleRoles={[roles.CLIENT]}>
              <ClientFormsDocuments />
            </RoleBasedGuard>
          ),
        },
        {
          path: 'dashboard/docuvault',
          element: (
            <RoleBasedGuard accessibleRoles={[roles.CLIENT]}>
              <ClientDocuvault />
            </RoleBasedGuard>
          ),
        },
        { path: 'signing-status', element: <SigningStatus /> },
        { path: 'envelopes/:envelopeId/:signerId', element: <EnvelopeDocumentView /> },
        { path: 'web-forms', element: <Webforms /> },
        { path: 'kanban', element: <Kanban /> },
        { path: 'integrations', element: <Integrations /> },
        { path: 'ledger', element: <Ledger /> },
        {
          path: 'automations',
          children: [
            { element: <AutomationListPage />, index: true },
            // { path: 'import-client', element: <ImportClientAutomationFlowPage /> },
            // { path: 'pmq', element: <PMQAutomation /> },
            // { path: 'new', element: <CreateAutomations /> },
          ],
        },
        {
          path: 'calendar',
          children: [{ element: <Calendar />, index: true }],
        },
        {
          path: 'templates',
          element: (
            <RoleBasedGuard accessibleRoles={[roles.FIRM_ADMIN, roles.ADVISOR]}>
              <Outlet />
            </RoleBasedGuard>
          ),
          children: [
            {
              element:
                authUser?.role === roles.FIRM_ADMIN ? <TemplateList /> : <AdvisorTemplateList />,
              index: true,
            },
            { path: ':templateId', element: <TemplateEdit /> },
          ],
        },
        {
          path: 'library',
          element: (
            <RoleBasedGuard accessibleRoles={[roles.FIRM_ADMIN]}>
              <Outlet />
            </RoleBasedGuard>
          ),
          children: [
            { element: <TemplateLibrary />, index: true },
            { path: ':templateId', element: <TemplateEdit /> },
          ],
        },
        {
          path: 'data-collection',
          element: (
            <RoleBasedGuard accessibleRoles={[roles.FIRM_ADMIN]}>
              <Outlet />
            </RoleBasedGuard>
          ),
          children: [
            { element: <TemplateLibrary />, index: true },
            { path: 'forms', element: <FormsList /> },
          ],
        },
        {
          path: 'engagement-hub',
          element: (
            <RoleBasedGuard accessibleRoles={[roles.FIRM_ADMIN, roles.ADVISOR]}>
              <Outlet />
            </RoleBasedGuard>
          ),
          children: [
            { element: <EmailTemplates />, path: 'email-templates' },
            { element: <EmailSendView />, path: 'email-templates/send' },
          ],
        },
        {
          path: 'advisors',
          element: (
            <RoleBasedGuard accessibleRoles={[roles.FIRM_ADMIN]}>
              <Outlet />
            </RoleBasedGuard>
          ),
          children: [
            { element: <AdvisorsList />, index: true },
            { path: ':advisorId', element: <AdvisorProfile /> },
            { path: 'new', element: <AdvisorProfile /> },
          ],
        },
        {
          path: 'customers',
          element: (
            <RoleBasedGuard accessibleRoles={[roles.FIRM_ADMIN, roles.ADVISOR]}>
              <Outlet />
            </RoleBasedGuard>
          ),
          children: [
            { element: <ClientsList />, index: true },
            { path: ':clientId', element: <ClientProfile /> },
            {
              path: 'new',
              element: (
                <SsoClientsAddGuard>
                  <ClientCreate />
                </SsoClientsAddGuard>
              ),
            },
            {
              path: 'import',
              element: (
                <SsoClientsAddGuard>
                  <ClientImport />
                </SsoClientsAddGuard>
              ),
            },
          ],
        },
        // remove after migration is verifieds
        {
          path: 'clients',
          element: (
            <RoleBasedGuard accessibleRoles={[roles.FIRM_ADMIN, roles.ADVISOR]}>
              <Outlet />
            </RoleBasedGuard>
          ),
          children: [
            { element: <ClientsList />, index: true },
            { path: ':clientId', element: <ClientProfile /> },
            {
              path: 'new',
              element: (
                <SsoClientsAddGuard>
                  <ClientCreate />
                </SsoClientsAddGuard>
              ),
            },
            {
              path: 'import',
              element: (
                <SsoClientsAddGuard>
                  <ClientImport />
                </SsoClientsAddGuard>
              ),
            },
          ],
        },

        {
          path: 'prospects',
          element: (
            <RoleBasedGuard accessibleRoles={[roles.FIRM_ADMIN, roles.ADVISOR]}>
              <Outlet />
            </RoleBasedGuard>
          ),
          children: [
            { element: <ClientsList />, index: true },
            { path: ':clientId', element: <ClientProfile isProspect /> },
            {
              path: 'new',
              element: (
                <SsoClientsAddGuard isProspect>
                  <ClientCreate isProspect />
                </SsoClientsAddGuard>
              ),
            },
            {
              path: 'import',
              element: (
                <SsoClientsAddGuard>
                  <ClientImport isProspect />
                </SsoClientsAddGuard>
              ),
            },
          ],
        },
        {
          path: 'firm-admins',
          element: (
            <RoleBasedGuard accessibleRoles={[roles.FIRM_ADMIN]}>
              <Outlet />
            </RoleBasedGuard>
          ),
          children: [
            { element: <UserList type={roles.FIRM_ADMIN as UserRole.FIRM_ADMIN} />, index: true },
            { path: ':firmAdminId', element: <FirmAdminProfile /> },
            { path: 'new', element: <FirmAdminProfile /> },
          ],
        },
        {
          path: 'settings',
          children: [
            { element: <Navigate to="/settings/account" replace />, index: true },
            { path: 'account', element: <AccountSettings /> },
            {
              path: 'firm',
              element: (
                <RoleBasedGuard accessibleRoles={[roles.FIRM_ADMIN]}>
                  <FirmSettings />
                </RoleBasedGuard>
              ),
            },
          ],
        },
        {
          path: 'user',
          children: [
            { element: <Navigate to="/dashboard/user/profile" replace />, index: true },
            { path: 'list', element: <UserList /> },
          ],
        },
        {
          path: 'chat',
          children: [{ element: <ClientLandingSMS />, index: true }],
        },
      ],
    },

    // Fullscreen routes
    {
      path: '/',
      element: (
        <AuthGuard>
          <Outlet />
        </AuthGuard>
      ),
      children: [
        {
          element: <EmailTemplateEdit />,
          path: 'engagement-hub/email-templates/edit/:emailTemplateId',
        },
        {
          path: 'templates/:templateId/docubuild',
          element: <DocumentBuilder />,
        },
        {
          path: 'data-collection/forms/:formId/form-builder',
          element: <FormsBuilder />,
        },
        {
          path: 'data-collection/forms/:formId/form-builder/preview',
          element: <FormPreview />,
        },
        {
          path: 'forms',
          children: [
            { element: <Navigate to={PATH_DASHBOARD.general.webForms} replace />, index: true },
            { path: 'new', element: <FormEdit /> },
            {
              path: ':formId',
              children: [
                { element: <FormEdit />, index: true },
                { path: 'view', element: <FormEdit /> },
              ],
            },
          ],
        },
      ],
    },

    // Public routes
    {
      path: '/public/forms/new',
      element: <PublicForms />,
    },

    {
      path: '/public/notes/:noteId',
      element: <PublicNote />,
    },

    // Main Routes
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// IMPORT COMPONENTS

// Authentication
const Login = Loadable(lazy(() => import('../pages/auth/Login')));
const Register = Loadable(lazy(() => import('../pages/auth/Register')));
const VerifyCode = Loadable(lazy(() => import('../pages/auth/Verify')));
// Esign
const EsignAccessDocuments = Loadable(lazy(() => import('../pages/EsignAccessDocuments')));
const EsignCallback = Loadable(lazy(() => import('../pages/EsignCallback')));
// Dashboard
const ClientLanding = Loadable(lazy(() => import('../pages/client-dashboard/ClientLanding')));
const ClientLandingSMS = Loadable(lazy(() => import('../pages/client-dashboard/ClientLandingSMS')));
const ClientFormsDocuments = Loadable(
  lazy(() => import('../pages/client-dashboard/ClientFormsDocuments'))
);
const ClientDocuvault = Loadable(lazy(() => import('../pages/client-dashboard/ClientDocuvault')));
const Dashboard = Loadable(lazy(() => import('../pages/dashboard/Dashboard')));
const SigningStatus = Loadable(lazy(() => import('../pages/dashboard/SigningStatus')));
const EnvelopeDocumentView = Loadable(
  lazy(() => import('../pages/dashboard/EnvelopeDocumentView'))
);
const Webforms = Loadable(lazy(() => import('../pages/dashboard/Webforms')));
const Kanban = Loadable(lazy(() => import('../pages/dashboard/Kanban')));
// const CreateAutomations = Loadable(lazy(() => import('../pages/dashboard/CreateAutomations')));
const AutomationListPage = Loadable(lazy(() => import('../pages/dashboard/AutomationListPage')));
const Calendar = Loadable(lazy(() => import('../pages/dashboard/Calendar')));
// const PMQAutomation = Loadable(lazy(() => import('../pages/dashboard/PMQAutomation')));
// const ImportClientAutomationFlowPage = Loadable(
//   lazy(() => import('../pages/dashboard/ImportClientAutomationFlowPage'))
// );
const TemplateList = Loadable(lazy(() => import('../pages/dashboard/TemplateList')));
const AdvisorTemplateList = Loadable(lazy(() => import('../pages/dashboard/AdvisorTemplateList')));
const TemplateLibrary = Loadable(lazy(() => import('../pages/dashboard/TemplateLibrary')));
const TemplateEdit = Loadable(lazy(() => import('../pages/dashboard/TemplateEdit')));
const Integrations = Loadable(lazy(() => import('../pages/dashboard/Integrations')));
const Ledger = Loadable(lazy(() => import('../pages/dashboard/Ledger')));
const AccountSettings = Loadable(lazy(() => import('../pages/dashboard/AccountSettings')));
const FirmSettings = Loadable(lazy(() => import('../pages/dashboard/FirmSettings')));
const EmailTemplates = Loadable(lazy(() => import('../pages/dashboard/EmailTemplates')));
const EmailTemplateEdit = Loadable(lazy(() => import('../pages/dashboard/EmailTemplateEdit')));
const EmailSendView = Loadable(lazy(() => import('../pages/dashboard/EmailSendView')));
const ClientsList = Loadable(lazy(() => import('../pages/dashboard/ClientsList')));
const AdvisorsList = Loadable(lazy(() => import('../pages/dashboard/AdvisorsList')));
const DocumentBuilder = Loadable(
  lazy(() => import('../sections/@dashboard/docubuilder/docubuild-view'))
);
const UserList = Loadable(lazy(() => import('../pages/dashboard/UserList')));
const FirmAdminProfile = Loadable(lazy(() => import('../pages/dashboard/FirmAdminProfile')));
const AdvisorProfile = Loadable(lazy(() => import('../pages/dashboard/AdvisorProfile')));
const ClientProfile = Loadable(lazy(() => import('../pages/dashboard/ClientProfile')));
const ClientCreate = Loadable(lazy(() => import('../pages/dashboard/ClientCreate')));
const ClientImport = Loadable(lazy(() => import('../pages/dashboard/ClientImport')));
const FormEdit = Loadable(lazy(() => import('../pages/dashboard/FormEdit')));
const FormsList = Loadable(lazy(() => import('../pages/dashboard/data-collection/forms')));
const FormsBuilder = Loadable(
  lazy(() => import('../pages/dashboard/data-collection/forms-builder'))
);
const FormPreview = Loadable(
  lazy(() => import('../pages/dashboard/data-collection/forms-preview'))
);
// Main
const NotFound = Loadable(lazy(() => import('../pages/Page404')));
// Public
const PublicForms = Loadable(lazy(() => import('../pages/public/PublicForms')));
const PublicNote = Loadable(lazy(() => import('../pages/public/PublicNote')));
