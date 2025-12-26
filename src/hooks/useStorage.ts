import { useState, useEffect } from 'react';
import { getStorageItem, setUrl } from 'redux/slices/storage';
import { useDispatch, useSelector } from 'redux/store';

const useStorage = ({
  path,
  isPublic = true,
}: {
  path: string | undefined;
  isPublic?: boolean;
}) => {
  const urlPath = path ? path : '';

  // get the url from the redux store using useSelector
  const url = useSelector((state) => state.storage.cache[urlPath]);

  // get the dispatch function from redux
  const dispatch = useDispatch();

  // create a local state to store the loading status
  const [loading, setLoading] = useState(true);

  // create a side effect to fetch the url if it is not already in the redux store
  useEffect(() => {
    // check if the url is already in the redux store
    if (url) {
      // do nothing if the url is already present
      setLoading(false);
      return;
    }

    if (!urlPath || urlPath?.includes('undefined')) {
      setLoading(false);
      return;
    }

    // set the loading state to true
    setLoading(true);

    // call the getStorageItem function with the path
    getStorageItem({
      path: urlPath,
      isPublic: isPublic,
    })
      .then((url) => {
        // dispatch the action to set the url in the redux store
        dispatch(setUrl({ path: urlPath, url }));
      })
      .catch((error) => {
        // handle the error
        console.error(error);
      })
      .finally(() => {
        // set the loading state to false
        setLoading(false);
      });
  }, [url, dispatch, isPublic, urlPath]); // add the dependencies to the effect

  // return the url and the loading status from the hook
  return { url, loading };
};

export default useStorage;
