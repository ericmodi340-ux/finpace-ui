import { Helmet } from 'react-helmet-async';
// sections
import AmplifyRegisterView from 'sections/auth/amplify-register-view';

// ----------------------------------------------------------------------

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title>Register</title>
      </Helmet>

      <AmplifyRegisterView />
    </>
  );
}
