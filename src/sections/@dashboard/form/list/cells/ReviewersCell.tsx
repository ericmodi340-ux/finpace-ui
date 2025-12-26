import { Link as RouterLink } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Tooltip, Link } from '@mui/material';
// @types
import { FormManager } from '../../../../../@types/form';
// routes
import { PATH_DASHBOARD } from 'routes/paths';
// components
import Iconify from 'components/Iconify';
// utils
import { fDateTime } from 'utils/formatTime';
// constants
import { reviewerStatuses } from 'constants/forms';
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

type Props = {
  form: FormManager;
};

export default function ReviewersCell({ form }: Props) {
  const theme = useTheme();

  const { reviewers, clientId, advisorId } = form;

  return (
    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      {reviewers.map((reviewer, idx) => {
        const reviewerReviewed = reviewer.status === reviewerStatuses.REVIEWED;

        let profileLink;
        if ([roles.CLIENT].includes(reviewer.type)) {
          profileLink = `${PATH_DASHBOARD.clients.root}/${reviewer?.id || clientId}`;
        } else if ([roles.ADVISOR].includes(reviewer.type)) {
          profileLink = `${PATH_DASHBOARD.advisors.root}/${reviewer?.id || advisorId}`;
        }

        const reviewerName = reviewer?.name || reviewer?.email || 'This reviewer';

        let tooltip = '';
        switch (reviewer.status) {
          case reviewerStatuses.PENDING:
            if (idx === 0) {
              // Reviewer is the initial reviewer/initiator of the form
              tooltip = `${reviewerName} has not completed their initial review of this form`;
            } else {
              tooltip = `${reviewerName} has not been sent this form`;
            }
            break;
          case reviewerStatuses.SENT:
            tooltip = `${reviewerName} was sent this form`;
            if (reviewer.dateSent) {
              tooltip += ` on ${fDateTime(reviewer.dateSent)}`;
            }
            break;
          case reviewerStatuses.REVIEWED:
            tooltip = `${reviewerName} reviewed this form`;
            if (reviewer.dateReviewed) {
              tooltip += ` on ${fDateTime(reviewer.dateReviewed)}`;
            }
            break;
          case reviewerStatuses.DECLINED:
            tooltip = `${reviewerName} declined this form`;
            if (reviewer.dateDeclined) {
              tooltip += ` on ${fDateTime(reviewer.dateDeclined)}`;
            }
            break;
          default:
            tooltip = '';
            break;
        }

        return (
          <Tooltip key={`${idx}-${reviewer.id}`} title={tooltip}>
            <Link to={profileLink || ''} component={RouterLink}>
              <Iconify
                icon={'eva:person-fill'}
                width={24}
                height={24}
                color={reviewerReviewed ? theme.palette.primary.main : theme.palette.divider}
              />
            </Link>
          </Tooltip>
        );
      })}
    </Box>
  );
}
