import { Helmet } from 'react-helmet-async';
// sections
import AmplifyVerifyView from 'sections/auth/amplify-verify-view';

// ----------------------------------------------------------------------

export default function VerifyPage() {
  return (
    <>
      <Helmet>
        <title>Verify</title>
      </Helmet>

      <AmplifyVerifyView />
    </>
  );
}
