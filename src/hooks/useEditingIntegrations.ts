import { useContext } from 'react';
import { EditingIntegrationsContext } from 'contexts/EditingIntegrationsContext';

// ----------------------------------------------------------------------

const useEditingIntegrations = () => useContext(EditingIntegrationsContext);

export default useEditingIntegrations;
