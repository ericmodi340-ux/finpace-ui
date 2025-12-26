// redux
import { useSelector } from 'redux/store';
// hooks
import useAuth from 'hooks/useAuth';

// ----------------------------------------------------------------------

const useUser = () => {
  const { user: authUser } = useAuth();
  const { user } = useSelector((state) => state.user);

  return { authUser, user };
};

export default useUser;
