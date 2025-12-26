import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
// sections
import AmplifyLoginView from 'sections/auth/amplify-login-view';

type userInfo = {
  email?: string;
  name?: string;
};

// ----------------------------------------------------------------------

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const userInfoBase64 = searchParams.get('userInfo');
  let userInfo: userInfo = { email: '', name: '' };

  if (userInfoBase64) {
    try {
      userInfo = JSON.parse(atob(userInfoBase64));
    } catch (error) {
      console.error('Error parsing user info:', error);
    }
  }

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>

      <AmplifyLoginView email={userInfo?.email || ''} />
    </>
  );
}
