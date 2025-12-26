import { useEffect, useState } from 'react';
import { getStorageItem, setUrl } from 'redux/slices/storage';
import { useDispatch, useSelector } from 'redux/store';

const useStorage = ({
  path,
  isPublic = true,
}: {
  path: string | undefined;
  isPublic?: boolean;
}) => {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const urlCache = useSelector((state) => state.storage.cache);

  useEffect(() => {
    if (path && !avatarUrl) {
      if (urlCache[path] !== undefined) {
        setAvatarUrl(urlCache[path]);
        return;
      }
      const getFileUrl = async () => {
        setLoading(true);
        try {
          const url = await getStorageItem({ path, isPublic });
          setAvatarUrl(url);
          dispatch(setUrl({ path, url }));
        } catch (err) {
          setError(err.message || 'Unexpected Error!');
        } finally {
          setLoading(false);
        }
      };

      getFileUrl();
    } else if (!path && avatarUrl) {
      // Reset after deletion
      setAvatarUrl('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPublic, path]);

  // Listen updates on urlCache[path]
  useEffect(() => {
    if (path && urlCache[path] !== undefined) {
      setAvatarUrl(urlCache[path]);
    }
  }, [urlCache, path]);

  const getAvatarUrl = async (path: string) => {
    try {
      const url = await getStorageItem({ path, isPublic });
      setAvatarUrl(url);
      dispatch(setUrl({ path, url }));
    } catch (err) {
      setError(err.message || 'Unexpected Error!');
    } finally {
      setLoading(false);
    }
  };

  return {
    avatarUrl,
    error,
    loading,
    getAvatarUrl,
  };
};

export default useStorage;
