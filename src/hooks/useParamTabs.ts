import { useEffect, useState } from 'react';
// utils
import { getParams, updateParams } from 'utils/params';

const useParamTabs = (defaultInitialTab: string) => {
  const params = getParams();
  const [currentTab, setCurrentTab] = useState(params.t || defaultInitialTab);

  useEffect(() => {
    updateParams('t', currentTab);
  }, [currentTab]);

  return {
    currentTab,
    setCurrentTab,
  };
};

export default useParamTabs;
