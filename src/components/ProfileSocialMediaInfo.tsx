// @mui
import { styled } from '@mui/material/styles';
import { Link, Card, CardHeader, Stack } from '@mui/material';
import Image from './Image';
// @types
import { FirmAdminManager } from '../@types/firmAdmin';
import { ClientManager } from '../@types/client';
import { AdvisorManager } from '../@types/advisor';

// ----------------------------------------------------------------------

const IconStyle = styled(Image)(({ theme }) => ({
  width: 30,
  height: 30,
  marginTop: 1,
  flexShrink: 0,
  marginRight: theme.spacing(2),
}));

// ----------------------------------------------------------------------

type ProfileSocialMediaInfoType = {
  user:
    | Partial<FirmAdminManager>
    | Partial<ClientManager>
    | Partial<AdvisorManager>
    | null
    | undefined;
};

const defaultSocialMedia = {
  linkedin: 'No linkedin link provided yet',
  twitter: 'No twitter link provided yet',
  instagram: 'No instagram link provided yet',
  facebook: 'No facebook link provided yet',
  youtube: 'No youtube link provided yet',
};

export default function ProfileSocialMediaInfo({ user }: ProfileSocialMediaInfoType) {
  const SOCIALS = [
    {
      name: 'Linkedin',
      icon: <IconStyle src={'/icons/Linkedin_Icon_Dark_Blue.png'} />,
      href: user?.socialMedia?.linkedin || defaultSocialMedia.linkedin,
    },
    {
      name: 'Twitter',
      icon: <IconStyle src={'/icons/Twitter_Icon_Dark_Blue.png'} />,
      href: user?.socialMedia?.twitter || defaultSocialMedia.twitter,
    },
    {
      name: 'Instagram',
      icon: <IconStyle src={'/icons/Instagram_Icon_Dark_Blue.png'} />,
      href: user?.socialMedia?.instagram || defaultSocialMedia.instagram,
    },
    {
      name: 'Facebook',
      icon: <IconStyle src={'/icons/Facebook_Icon_Dark_Blue.png'} />,
      href: user?.socialMedia?.facebook || defaultSocialMedia.facebook,
    },
    {
      name: 'Youtube',
      icon: <IconStyle src={'/icons/Youtube_Icon_Dark_Blue.png'} />,
      href: user?.socialMedia?.youtube || defaultSocialMedia.youtube,
    },
  ];

  return (
    <Card>
      <CardHeader title="Social" />
      <Stack spacing={2} sx={{ p: 3 }}>
        {SOCIALS.map((link) => (
          <Stack key={link.name} direction="row" alignItems="center">
            {link.icon}
            <Link marginLeft={'.5rem'} component="span" variant="body2" color="text.primary" noWrap>
              {link.href}
            </Link>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
