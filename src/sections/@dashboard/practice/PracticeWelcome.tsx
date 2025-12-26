// @mui
import { styled } from '@mui/material/styles';
import { Typography, Card, CardContent } from '@mui/material';
//
import { MotivationIllustration } from '../../../assets';
import useUser from '../../../hooks/useUser';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  backgroundColor: theme.palette.primary.lighter,
  [theme.breakpoints.up('md')]: {
    height: '100%',
    display: 'flex',
    textAlign: 'left',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

// ----------------------------------------------------------------------

export default function EcommerceWelcome() {
  const { user = '' } = useUser();
  //@ts-ignore
  const displayName = ` ${user?.name}` || '';
  return (
    <RootStyle>
      <CardContent
        sx={{
          color: 'grey.800',
          p: { md: 0 },
          pl: { md: 5 },
        }}
      >
        <Typography gutterBottom variant="h4">
          Hi{displayName},
          <br /> Welcome to the new Finpace Dashboard!
        </Typography>

        <Typography variant="body2" sx={{ pb: { xs: 3, xl: 5 }, maxWidth: 480, mx: 'auto' }}>
          Make every client journey a success.
        </Typography>
      </CardContent>

      <MotivationIllustration
        sx={{
          p: 3,
          width: 360,
          margin: { xs: 'auto', md: 'inherit' },
        }}
      />
    </RootStyle>
  );
}
