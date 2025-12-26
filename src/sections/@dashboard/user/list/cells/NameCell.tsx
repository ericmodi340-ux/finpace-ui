import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { Badge, Link, Box, Tooltip } from '@mui/material';
// @types
import { AdvisorManager } from '../../../../../@types/advisor';
import { ClientManager } from '../../../../../@types/client';
import { FirmAdminManager } from '../../../../../@types/firmAdmin';
import { FormReviewer } from '../../../../../@types/form';
import { UserRole } from '../../../../../@types/user';
// components
import UserAvatar from 'components/UserAvatar';
// hooks
import useUser from 'hooks/useUser';
import useUserForms from 'hooks/useUserForms';
// utils
import { getAdvisorName } from 'utils/advisors';
import { getClientCompositeName } from 'utils/clients';
import { getFirmAdminName } from 'utils/firmAdmins';
// constants
import { roles } from 'constants/users';
import Iconify from 'components/Iconify';
import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------

export const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 'calc(14% + 16px)',
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

// ----------------------------------------------------------------------

type Props = {
  user: AdvisorManager | ClientManager | FirmAdminManager;
  type: UserRole.ADVISOR | UserRole.CLIENT | UserRole.FIRM_ADMIN;
  isProspect?: boolean;
  status?: string;
};

export default function NameCell({ user, type, isProspect, status }: Props) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { authUser } = useUser();
  const { id } = user;
  const [tooltipName, setTooltipName] = useState<string>('');

  const { pendingForms } = useUserForms(user.id, type);

  const typeName = isProspect ? 'prospect' : type;
  const profileLink = `/${typeName}s/${id}`;

  let name: string | undefined;
  let inProgressText;
  let hasActions = false;
  if (type === roles.ADVISOR) {
    name = getAdvisorName(user as AdvisorManager);

    if (!name && !user.isVerified) {
      inProgressText = 'Invite sent';
    }
  }
  if (type === roles.CLIENT) {
    name = getClientCompositeName(user as ClientManager);

    const getRole = (role: UserRole) =>
      role === roles.FIRM_ADMIN || role === roles.ADVISOR ? roles.ADVISOR : role;

    if (!name) {
      if (pendingForms?.length) {
        const hasFormsAwaiting: Array<FormReviewer['type'] | 'self'> = pendingForms.map((form) => {
          if (form.currentReviewerRole === getRole(authUser?.role)) {
            return 'self';
          } else {
            return form?.currentReviewerRole;
          }
        });

        if (hasFormsAwaiting.includes('self')) {
          // Form is actionable by the logged-in user
          inProgressText = 'Needs review';
          hasActions = true;
        } else {
          // Form is currently being reviewed by someone else
          inProgressText = 'Form in progress';
        }
      } else {
        // There are no pending forms yet
        if (!user.isVerified) {
          inProgressText = 'Invite sent';
        } else {
          inProgressText = 'Needs additional details';
          hasActions = true;
        }
      }
    }
  }

  if (type === roles.FIRM_ADMIN) {
    name = getFirmAdminName(user as FirmAdminManager);
  }

  useEffect(() => {
    if (name) setTooltipName(name);
  }, [name, setTooltipName]);

  return (
    <Link
      to={status ? `${profileLink}?t=forms_documents` : profileLink}
      color="inherit"
      variant="subtitle2"
      component={RouterLink}
      sx={{
        display: 'flex',
        alignItems: 'center',
        '&:hover': {
          textDecoration: 'none !important',
        },
        '&:hover > .name': { textDecoration: 'underline' },
        overflow: 'visible',
      }}
      noWrap
    >
      <StyledBadge
        color="error"
        overlap="circular"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        variant="dot"
        invisible={!hasActions}
        onClick={
          hasActions
            ? (e) => {
                e.preventDefault();
                navigate(`${profileLink}?t=forms_documents`);
              }
            : undefined
        }
      >
        <UserAvatar
          user={{
            type:
              type === roles.ADVISOR && (user as AdvisorManager)?.isFirmAdmin
                ? (roles.FIRM_ADMIN as UserRole.FIRM_ADMIN)
                : type,
            id,
            name,
          }}
          sx={{ mr: 2 }}
        />
        {status !== 'Draft' && (
          <Box
            sx={{
              right: 12,
              bottom: 0,
              width: 18,
              height: 18,
              display: 'flex',
              borderRadius: '50%',
              position: 'absolute',
              alignItems: 'center',
              color: 'common.white',
              justifyContent: 'center',
              ...(status === 'Sent to Client' || status === 'Awaiting Client Signature'
                ? { bgcolor: 'orange.main' }
                : { bgcolor: 'success.main' }),
            }}
          >
            <Iconify
              icon={
                status === 'Sent to Client' || status === 'Awaiting Client Signature'
                  ? 'eva:diagonal-arrow-left-down-fill'
                  : 'eva:diagonal-arrow-right-up-fill'
              }
              width={16}
              height={16}
            />
          </Box>
        )}
      </StyledBadge>

      <Tooltip title={tooltipName}>
        <span
          className="name"
          style={{
            display: 'block',
            paddingRight: '3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '8rem',
            ...(inProgressText ? { color: theme.palette.text.secondary, fontStyle: 'italic' } : {}),
          }}
        >
          {name || inProgressText}
        </span>
      </Tooltip>
      {user?.isFirmAdmin && (
        <Tooltip title="User is also a Firm Admin">
          <span>
            <Iconify icon="mdi:crown" />
          </span>
        </Tooltip>
      )}
    </Link>
  );
}
