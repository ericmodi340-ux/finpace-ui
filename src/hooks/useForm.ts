import { useSelector } from 'redux/store';

// ----------------------------------------------------------------------

const useForm = (formId: string | undefined) => {
  const forms = useSelector((state) => state.forms);

  if (!formId) {
    return;
  }

  return forms.byId[formId];
};

export default useForm;
