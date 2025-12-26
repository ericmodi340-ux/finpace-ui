import { useEffect, useState } from 'react';
import { TemplateWithFieldsManager } from '../@types/template';
import { getTemplate, getTemplates } from 'redux/slices/templates';
import {
  getTemplate as getLibraryTemplate,
  getTemplates as getLibrayTemplates,
} from 'redux/slices/library';
import { useSelector, useDispatch } from 'redux/store';

const useFullTemplate = (templateId: string | undefined, isTemplateLibrary: boolean = false) => {
  const dispatch = useDispatch();
  const { fullTemplate: fullTemplateFromStore, allIds: allIdsFromStore } = isTemplateLibrary
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useSelector((state) => state.libraryTemplates)
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useSelector((state) => state.templates);
  const [template, setTemplate] = useState<TemplateWithFieldsManager | null | undefined>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!allIdsFromStore.length) {
      if (isTemplateLibrary) {
        dispatch(getLibrayTemplates);
      } else {
        dispatch(getTemplates);
      }
    }
  }, [dispatch, isTemplateLibrary, allIdsFromStore]);

  useEffect(() => {
    const getFullTemplate = async (templateId: string) => {
      setLoading(true);
      try {
        const fullTemplate = isTemplateLibrary
          ? await getLibraryTemplate(templateId)
          : await getTemplate(templateId, true);
        setTemplate(fullTemplate);
        setLoaded(true);
      } catch (err: any) {
        setError(err.message || 'Unexpected Error!');
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      getFullTemplate(templateId);
    }
  }, [templateId, isTemplateLibrary]);

  // Catch full template updates from TEMPLATE_UPDATED pubsub
  useEffect(() => {
    if (fullTemplateFromStore && fullTemplateFromStore?.id === templateId) {
      setLoading(true);
      setTemplate(fullTemplateFromStore);
      setLoaded(true);
      setLoading(false);
    }
  }, [fullTemplateFromStore, templateId]);

  return {
    template,
    error,
    loading,
    loaded,
    setTemplate,
  };
};

export default useFullTemplate;
