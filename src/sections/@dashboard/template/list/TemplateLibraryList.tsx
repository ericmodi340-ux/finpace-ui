import { Dispatch, SetStateAction, useEffect, useState } from 'react';
// components
import arrayFromObj from 'utils/arrayFromObj';
// hooks
import { useSelector, dispatch } from 'redux/store';
// routes
import TemplatesList from './TemplateList';
import PreviewTemplate from './PreviewTemplate';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTemplates as getLibraryTemplates } from 'redux/slices/library';
// ----------------------------------------------------------------------
function TemplateLibraryList() {
  const { search } = useLocation();
  const [, id] = search.split('id=');
  const navigate = useNavigate();
  const [templateId, setTemplateId]: [string, Dispatch<SetStateAction<string>>] =
    useState<string>('');

  const [isPreviewTemplateOpen, setIsPreviewTemplateOpen]: [
    boolean,
    Dispatch<SetStateAction<boolean>>,
  ] = useState<boolean>(false);

  const templatesLibrary = useSelector((state) => state.libraryTemplates);
  const templatesArray = arrayFromObj(templatesLibrary.byId, templatesLibrary.allIds);

  const handleOpenPreviewModal = (id: string): void => {
    setIsPreviewTemplateOpen(true);
    setTemplateId(id);
  };

  useEffect(() => {
    dispatch(getLibraryTemplates());
  }, []);

  useEffect(() => {
    if (id) {
      setTemplateId(id);
      setIsPreviewTemplateOpen(true);
    }
  }, [id]);

  return (
    <>
      <>
        <TemplatesList templates={templatesArray} handleOpenPreviewModal={handleOpenPreviewModal} />
      </>
      {isPreviewTemplateOpen && (
        <PreviewTemplate
          isOpen={isPreviewTemplateOpen}
          onClose={() => {
            setIsPreviewTemplateOpen(false);
            id && navigate('/library');
          }}
          templateId={templateId}
        />
      )}
    </>
  );
}

export default TemplateLibraryList;
