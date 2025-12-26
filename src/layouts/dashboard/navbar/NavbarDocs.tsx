// @mui
import { Stack, Button, Typography } from '@mui/material';
// hooks
import useUser from 'hooks/useUser';
// routes
import { PATH_DOCS, PATH_DOCS_CLIENT } from 'routes/paths';
// assets
import { DocIllustration } from '../../../assets';
// utils
import { firstWord } from 'utils/strings';
// constants
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

export default function NavbarDocs() {
  const { authUser, user } = useUser();

  return (
    <Stack
      spacing={3}
      alignItems="center"
      sx={{ px: 5, pb: 5, mt: 10, width: 1, textAlign: 'center' }}
    >
      <DocIllustration sx={{ width: 1, height: 180 }} />

      <div>
        <Typography gutterBottom variant="subtitle1">
          Hi, {user?.name ? firstWord(user?.name) : authUser?.name ? authUser.name : 'friend'}!
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Need help?
          <br /> Please check our docs
        </Typography>
      </div>

      <Button
        href={authUser?.role === roles.CLIENT ? PATH_DOCS_CLIENT : PATH_DOCS}
        target="_blank"
        rel="noopener"
        variant="contained"
      >
        {authUser?.role === roles.CLIENT ? 'University' : 'Documentation'}
      </Button>
    </Stack>
  );
}
