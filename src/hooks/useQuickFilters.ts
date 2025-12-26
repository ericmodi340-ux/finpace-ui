// redux
import { useSelector } from 'redux/store';

const useQuickFilters = () => {
  const clients = useSelector((state) => state.clients);
  const advisors = useSelector((state) => state.advisors);
  const templates = useSelector((state) => state.templates);

  function getApplyFilterByName(value: string) {
    return (params: any) => {
      const name = clients.byId[params.value]?.name || '';
      return name.toLowerCase().includes(value.toLowerCase());
    };
  }

  function getApplyFilterByAdvisor(value: string) {
    return (params: any) => {
      const advisor = params.row?.advisorId || '';
      const { name: advisorName = '' } = advisors.byId[advisor] || {};

      return advisorName.toLowerCase().includes(value.toLowerCase());
    };
  }

  function getApplyFilterByTemplate(value: string) {
    return (params: any) => {
      const template = params.row?.templateId || '';
      const { title: templateName = '' } = templates.byId[template] || {};

      return templateName.toLowerCase().includes(value.toLowerCase());
    };
  }

  return {
    applyFilterByName: getApplyFilterByName,
    applyFilterByAdvisor: getApplyFilterByAdvisor,
    applyFilterByTemplate: getApplyFilterByTemplate,
  };
};

export default useQuickFilters;
