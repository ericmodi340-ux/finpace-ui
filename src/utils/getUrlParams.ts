import { useLocation } from 'react-router';

const getUrlParams = (searchParam: string) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const url = useLocation();
  const hasParams = url.search.includes(searchParam);
  let user;
  if (hasParams) {
    const encodedURL = url.search.slice(searchParam.length + 2);
    const decodedURL = atob(encodedURL);
    user = JSON.parse(decodedURL);
    return user;
  }
};

export default getUrlParams;
