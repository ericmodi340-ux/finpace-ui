import { useSelector } from 'redux/store';

// ----------------------------------------------------------------------

const useTemplate = (templateId: string | undefined) => {
  const templates = useSelector((state) => state.templates);

  if (!templateId) {
    return;
  }

  return templates.byId[templateId];
};

export default useTemplate;
