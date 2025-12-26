import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
// slices
import firmReducer from './slices/firm';
import advisorReducer from './slices/advisor';
import automationsReducer from './slices/automations';
import activityLogsReducer from './slices/activityLogs';
import clientReducer from './slices/client';
import firmAdminsReducer from './slices/firmAdmins';
import formBuilderReducer from './slices/formBuilder';
import advisorsReducer from './slices/advisors';
import clientsReducer from './slices/clients';
import { api } from './api/api';
import formsReducer from './slices/forms';
import envelopeReducer from './slices/envelopes';
import pubsubReducer from './slices/pubsub';
import templatesReducer from './slices/templates';
import libraryTemplatesReducer from './slices/library';
import notificationsReducer from './slices/notifications';
import disclosuresReducer from './slices/disclosures';
import integrationsAdvisorReducer from './slices/integrationsAdvisor';
import integrationsFirmReducer from './slices/integrationsFirm';
import userReducer from './slices/user';
import storageReducer from './slices/storage';
import engagementHubReducer from './slices/engagement-hub';
import blogReducer from './slices/blog';
import calendarEvents from './slices/calendarEvents';

// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: [],
};

const rootReducer = combineReducers({
  disclosures: disclosuresReducer,
  templates: templatesReducer,
  libraryTemplates: libraryTemplatesReducer,
  firm: firmReducer,
  advisor: advisorReducer,
  automations: automationsReducer,
  client: clientReducer,
  firmAdmins: firmAdminsReducer,
  formBuilder: formBuilderReducer,
  advisors: advisorsReducer,
  clients: clientsReducer,
  forms: formsReducer,
  envelopes: envelopeReducer,
  calendarEvents: calendarEvents,
  pubsub: pubsubReducer,
  integrationsAdvisor: integrationsAdvisorReducer,
  integrationsFirm: integrationsFirmReducer,
  notifications: notificationsReducer,
  user: userReducer,
  storage: storageReducer,
  blog: blogReducer,
  activityLogs: activityLogsReducer,
  engagementHub: engagementHubReducer,
  [api.reducerPath]: api.reducer,
});

export { rootPersistConfig, rootReducer };
