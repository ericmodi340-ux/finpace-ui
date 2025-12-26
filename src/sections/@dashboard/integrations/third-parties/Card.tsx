import { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardMedia,
  Link,
  Typography,
  SxProps,
  // Tooltip,
  // Badge,
  // AvatarGroup,
} from '@mui/material';
// @types
import { IntegrationService } from '../../../../@types/integration';
import { AdvisorManager } from '../../../../@types/advisor';
// redux
import { useSelector } from 'redux/store';
// components
// import Iconify from 'components/Iconify';
import Label from 'components/Label';
// import LogoIcon from 'components/LogoIcon';
// sections
import IntegrationModal from './Modal';
// hooks
import useEditingIntegrations from 'hooks/useEditingIntegrations';
import useSettings from 'hooks/useSettings';
import useUser from 'hooks/useUser';
// utils
// constants
import { serviceIds, statuses } from 'constants/integrations';
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

type Props = {
  service:
    | IntegrationService
    | {
        id: 'request-integration';
        image: string;
        imageWhite: string;
        name: string;
        isAvailable: boolean;
      };
  isAdvisorTab?: boolean;
};

// ----------------------------------------------------------------------

const labelStyles: SxProps = {
  top: 16,
  right: 16,
  zIndex: 9,
  position: 'absolute',
  textTransform: 'uppercase',
};

// ----------------------------------------------------------------------

export default function IntegrationCard({ service, isAdvisorTab = false }: Props) {
  const theme = useTheme();
  const { themeMode } = useSettings();
  const { user } = useUser();
  const { type, integrations } = useEditingIntegrations();
  const { firm } = useSelector((state) => state.firm);

  const { id, name, image, imageWhite, isAvailable } = service;

  const [openModal, setOpenModal] = useState(false);

  const integration = integrations.find((integration) => integration.id === id);
  const hasService = integration || false;

  let isActive;
  switch (id) {
    case serviceIds.CALENDAR:
      let settingsToCheck = type === roles.ADVISOR ? (user as AdvisorManager) : firm;
      isActive = settingsToCheck?.settings?.calendar?.url;
      break;
    case serviceIds.DOCUSIGN:
      isActive = hasService && integration?.useBitsyDocusignAccount;
      break;
    case serviceIds.SALESFORCE:
      isActive = hasService && integration?.status === statuses.ACTIVE;
      break;
    case serviceIds.SCHWAB:
      isActive = hasService && integration?.status === statuses.ACTIVE;
      break;
    default:
      isActive = hasService;
      break;
  }

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Card
        onClick={isAvailable ? handleOpenModal : undefined}
        sx={
          isAvailable
            ? {
                cursor: 'pointer',
                transition: '0.2s all',
                '&:hover': { marginTop: '-10px', marginBottom: '10px', transition: '0.2s all' },
              }
            : {}
        }
      >
        <Box sx={{ position: 'relative', height: '100%' }}>
          {!isAvailable ? (
            <Label variant="ghost" color="info" sx={labelStyles}>
              Coming soon
            </Label>
          ) : (
            <>
              {/* <AvatarGroup
                max={2}
                sx={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  '& > .MuiAvatarGroup-avatar:first-of-type': {
                    background: 'transparent',
                    color: 'inherit',
                  },
                }}
              >
                {firmHasService && (
                  <Tooltip title={`${firm?.name || 'The firm'} has activated this service`}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      color="success"
                      sx={{ '& > .MuiBadge-badge': { p: '0', minWidth: 12, height: 12 } }}
                      badgeContent={
                        <Iconify
                          icon={'eva:checkmark-fill'}
                          width={12}
                          height={12}
                          sx={{
                            '& > path': { fill: '#fff' },
                          }}
                        />
                      }
                    >
                      <LogoIcon
                        disabledLink
                        variant="circular"
                        brand={{ name: firm?.name, icon: firm?.icon }}
                        width={24}
                        height={24}
                      />
                    </Badge>
                  </Tooltip>
                )}
              </AvatarGroup> */}

              {isActive && (
                <Label variant="filled" color="info" sx={labelStyles}>
                  Active
                </Label>
              )}
            </>
          )}

          <div style={{ height: 0, paddingBottom: '100%' }} />
          {id === 'request-integration' ? (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignContent: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
                padding: theme.spacing(2),
              }}
            >
              <Typography variant="subtitle2" component="p">
                Not seeing your service?
                <br />
                <Link
                  href="mailto:tech@finpace.com?subject=Integration%20Request"
                  title="Email Finpace"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Let us know
                </Link>
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyItems: 'center',
              }}
            >
              <CardMedia
                component="img"
                alt={name}
                height="100%"
                image={themeMode === 'dark' ? imageWhite : image}
                sx={{
                  margin: 'auto',
                  maxHeight: name === 'Schwab' ? '250px' : '180px',
                  objectFit: 'contain',
                  padding: theme.spacing(3),
                }}
              />
            </Box>
          )}
        </Box>
      </Card>

      {id !== 'request-integration' && (
        <IntegrationModal
          openModal={openModal}
          handleClose={handleCloseModal}
          service={service}
          isAdvisorTab={isAdvisorTab}
        />
      )}
    </>
  );
}
