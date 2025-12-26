// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '';
const ROOTS_DASHBOARD_CLIENT = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  register: path(ROOTS_AUTH, '/register'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  verify: path(ROOTS_AUTH, '/verify'),
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page404: '/404',
  page500: '/500',
  components: '/sales/components',
};

export const PATH_DASHBOARD = {
  root: '/',
  auth: {
    login: path(ROOTS_AUTH, '/login'),
  },
  esign: {
    accessDocuments: path(ROOTS_DASHBOARD, '/access-documents'),
    envelope: (envelopeId: string, signerId: string) =>
      path(ROOTS_DASHBOARD, `/envelopes/${envelopeId}/${signerId}`),
  },
  sms: {
    root: path(ROOTS_DASHBOARD, '/sms'),
  },
  clientDashboard: {
    chat: path(ROOTS_DASHBOARD_CLIENT, '/chat'),
    forms: path(ROOTS_DASHBOARD_CLIENT, '/forms'),
    docuvault: path(ROOTS_DASHBOARD_CLIENT, '/docuvault'),
  },
  general: {
    signingStatus: path(ROOTS_DASHBOARD, '/signing-status'),
    webForms: path(ROOTS_DASHBOARD, '/web-forms'),
    kanban: path(ROOTS_DASHBOARD, '/kanban'),
    // Minimals
    app: path(ROOTS_DASHBOARD, '/app'),
    ecommerce: path(ROOTS_DASHBOARD, '/ecommerce'),
    booking: path(ROOTS_DASHBOARD, '/booking'),
    tasks: path(ROOTS_DASHBOARD, '/tasks'),
    integrations: path(ROOTS_DASHBOARD, '/integrations'),
    // export: path(ROOTS_DASHBOARD, '/export'),
  },
  dataCollection: {
    root: path(ROOTS_DASHBOARD, '/data-collection'),
    forms: path(ROOTS_DASHBOARD, '/data-collection/forms'),
    formBuilder: (formId: string) =>
      path(ROOTS_DASHBOARD, `/data-collection/forms/${formId}/form-builder`),
    formPreview: (formId: string) =>
      path(ROOTS_DASHBOARD, `/data-collection/forms/${formId}/form-builder/preview`),
  },
  automation: {
    root: path(ROOTS_DASHBOARD, '/automations'),
    new: path(ROOTS_DASHBOARD, '/automations/new'),
    importClient: path(ROOTS_DASHBOARD, '/automations/import-client'),
    pmq: path(ROOTS_DASHBOARD, '/automations/pmq'),
  },
  calendar: {
    root: path(ROOTS_DASHBOARD, '/calendar'),
  },
  forms: {
    root: path(ROOTS_DASHBOARD, '/forms'),
    new: path(ROOTS_DASHBOARD, '/forms/new'),
  },
  templates: {
    root: path(ROOTS_DASHBOARD, '/templates'),
    docubuilder: (templateId: string) =>
      path(ROOTS_DASHBOARD, `/templates/${templateId}/docubuild`),
  },
  library: {
    root: path(ROOTS_DASHBOARD, '/library'),
  },
  mail: {
    root: path(ROOTS_DASHBOARD, '/mail'),
    all: path(ROOTS_DASHBOARD, '/mail/all'),
  },
  chat: {
    root: path(ROOTS_DASHBOARD_CLIENT, '/chat'),
    new: path(ROOTS_DASHBOARD_CLIENT, '/chat/new'),
    conversation: path(ROOTS_DASHBOARD_CLIENT, '/chat/:conversationKey'),
  },

  kanban: path(ROOTS_DASHBOARD, '/kanban'),
  ledger: {
    root: path(ROOTS_DASHBOARD, '/ledger'),
  },
  advisors: {
    root: path(ROOTS_DASHBOARD, '/advisors'),
    new: path(ROOTS_DASHBOARD, '/advisors/new'),
  },
  clients: {
    root: path(ROOTS_DASHBOARD, '/customers'),
    new: path(ROOTS_DASHBOARD, '/customers/new'),
    import: path(ROOTS_DASHBOARD, '/customers/import'),
  },
  prospects: {
    root: path(ROOTS_DASHBOARD, '/prospects'),
    new: path(ROOTS_DASHBOARD, '/prospects/new'),
    import: path(ROOTS_DASHBOARD, '/prospects/import'),
  },
  engagementHub: {
    root: path(ROOTS_DASHBOARD, '/blog/new'),
    emailTemplates: path(ROOTS_DASHBOARD, '/engagement-hub/email-templates'),
    emailTemplateEdit: (id: string) =>
      path(ROOTS_DASHBOARD, `/engagement-hub/email-templates/edit/${id}`),
    emailTemplateSend: path(ROOTS_DASHBOARD, `/engagement-hub/email-templates/send`),
  },
  'firm-admins': {
    root: path(ROOTS_DASHBOARD, '/firm-admins'),
    new: path(ROOTS_DASHBOARD, '/firm-admins/new'),
  },
  settings: {
    root: path(ROOTS_DASHBOARD, '/settings'),
    account: path(ROOTS_DASHBOARD, '/settings/account'),
    firm: path(ROOTS_DASHBOARD, '/settings/firm'),
    disclosures: path(ROOTS_DASHBOARD, '/settings/account?t=disclosures'),
  },
  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    profile: path(ROOTS_DASHBOARD, '/user/profile'),
    cards: path(ROOTS_DASHBOARD, '/user/cards'),
    list: path(ROOTS_DASHBOARD, '/user/list'),
    newUser: path(ROOTS_DASHBOARD, '/user/new'),
    editById: path(ROOTS_DASHBOARD, `/user/reece-chung/edit`),
    account: path(ROOTS_DASHBOARD, '/user/account'),
  },
  eCommerce: {
    root: path(ROOTS_DASHBOARD, '/e-commerce'),
    shop: path(ROOTS_DASHBOARD, '/e-commerce/shop'),
    product: path(ROOTS_DASHBOARD, '/e-commerce/product/:name'),
    productById: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-air-force-1-ndestrukt'),
    list: path(ROOTS_DASHBOARD, '/e-commerce/list'),
    newProduct: path(ROOTS_DASHBOARD, '/e-commerce/product/new'),
    editById: path(ROOTS_DASHBOARD, '/e-commerce/product/nike-blazer-low-77-vintage/edit'),
    checkout: path(ROOTS_DASHBOARD, '/e-commerce/checkout'),
  },
  blog: {
    root: path(ROOTS_DASHBOARD, '/blog'),
    posts: path(ROOTS_DASHBOARD, '/blog/posts'),
    post: path(ROOTS_DASHBOARD, '/blog/post/:title'),
    postById: path(ROOTS_DASHBOARD, '/blog/post/apply-these-7-secret-techniques-to-improve-event'),
    newPost: path(ROOTS_DASHBOARD, '/blog/new'),
  },
};

export const PATH_DOCS = 'https://finpace.com/university';
export const PATH_DOCS_CLIENT = 'https://finpace.com/university';
