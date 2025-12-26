// @mui
import { styled, useTheme } from '@mui/material/styles';
import {
  Card,
  Button,
  Typography,
  Box,
  Stack,
  Switch,
  CircularProgress,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Select,
} from '@mui/material';
// @types
import { FirmPlan } from '../../@types/firm';
// components
import Label from 'components/Label';
import Iconify from 'components/Iconify';
// utils
import { fCurrency } from 'utils/formatNumber';
import getEnv from 'utils/getEnv';
// libs
import { useState } from 'react';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  padding: theme.spacing(3),
  [theme.breakpoints.up(414)]: {
    padding: theme.spacing(5),
  },
}));

// ----------------------------------------------------------------------

type Props = {
  card: {
    priceId?: string;
    subscription: string;
    priceMonthly: number | string;
    priceYearly: number | string;
    pricePer?: string;
    pricingNote?: string;
    caption: string;
    icon: string;
    labelAction: string;
    emailAction?: {
      to: string;
      subject: string;
    };
    lists: {
      text: string;
      isAvailable: boolean;
    }[];
  };
  currentPlan?: FirmPlan | undefined;
  handleSelect: (priceId: string, planType: string, paymentFreq: string) => void;
  actionDisabled?: boolean;
  advisors: number;
  viewYearly: boolean;
  setViewYearly: (state: boolean) => void;
  setAdvisorQuantity: (state: number) => void;
  advisorQuantity: number;
};

export default function PricingPlanCard({
  card,
  currentPlan,
  handleSelect,
  actionDisabled = false,
  advisors,
  viewYearly,
  setViewYearly,
  setAdvisorQuantity,
  advisorQuantity,
}: Props) {
  const theme = useTheme();
  const [showLoader, setShowLoader] = useState(false);

  const {
    priceId,
    subscription,
    icon,
    priceMonthly,
    priceYearly,
    pricePer,
    pricingNote,
    caption,
    lists,
    labelAction,
  } = card;

  // priceString used for enterprise, price == CALL
  const priceString = viewYearly ? priceYearly : priceMonthly;
  // Get total price
  const price = viewYearly ? Number(priceYearly) * advisors : Number(priceMonthly) * advisors;

  const paymentFreq = viewYearly ? 'yearly' : 'monthly';
  // planType should be one of ['sell', 'prospect', 'protect'];
  const planType = subscription.toLowerCase();

  const isEnterprisePlan = !priceId;
  const priceIdInterval = `${priceId}__${viewYearly ? 'yearly' : 'monthly'}__${getEnv(true)}`;
  const isSubscribed = Boolean(
    currentPlan?.priceId && (currentPlan?.priceId === priceIdInterval || isEnterprisePlan)
  );
  const disableButton = !isEnterprisePlan && (isSubscribed || actionDisabled || !advisors);

  const onClickHandler = (e: any) => {
    if (isEnterprisePlan) {
      // do nothing
    } else {
      if (e.target.id === priceId) {
        // Check if the clicked button has priceId to set loader
        setShowLoader(true);
        handleSelect(priceIdInterval, planType, paymentFreq);
      }
    }
  };

  // Function to build select options
  const selectOptions = () => {
    const indexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const response: any[] = [];

    indexes.forEach((index) => {
      if (index === 0) {
        response.push(
          <MenuItem value={0} key={0}>
            Need more?
          </MenuItem>
        );
      } else {
        response.push(
          <MenuItem value={index} key={index}>
            {`${index} advisor${index > 1 ? 's' : ''}`}
          </MenuItem>
        );
      }
    });
    // Move index 0 to last position
    const indexZero = response.splice(0, 1)[0];
    response.splice(10, 0, indexZero);
    return response;
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setAdvisorQuantity(Number(event.target.value));
  };

  return (
    <RootStyle
      style={
        isEnterprisePlan
          ? {
              background: isEnterprisePlan
                ? `radial-gradient(circle farthest-corner at 0% 0%, ${theme.palette.info.darker}, ${theme.palette.primary.darker} 68%)`
                : '',
            }
          : {}
      }
    >
      {isSubscribed && (
        <Label
          color="info"
          sx={{
            top: 16,
            right: 16,
            position: 'absolute',
            backgroundColor: isEnterprisePlan ? theme.palette.secondary.main : '',
            color: isEnterprisePlan ? '#fff' : '',
          }}
        >
          CURRENT PLAN
        </Label>
      )}

      <Typography
        variant="overline"
        sx={{ color: isEnterprisePlan ? 'text.disabled' : 'text.secondary', mb: 2 }}
      >
        {subscription}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {isEnterprisePlan ? (
          <Typography variant="h2" sx={{ mx: 1, color: isEnterprisePlan ? '#fff' : '' }}>
            {priceString}
          </Typography>
        ) : (
          <>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              $
            </Typography>
            <Typography variant="h2" sx={{ mx: 1 }}>
              {price === 0 ? 'Call' : fCurrency(price).replace('$', '')}
            </Typography>
          </>
        )}
      </Box>

      <Typography
        gutterBottom
        component="div"
        variant="subtitle2"
        sx={{
          alignSelf: 'center',
          color: isEnterprisePlan ? 'text.disabled' : 'text.secondary',
          mb: 2,
        }}
      >
        {pricingNote ? (
          <>{pricingNote}</>
        ) : (
          <>
            /{viewYearly ? 'year' : 'month'}
            {pricePer || ''}
          </>
        )}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        visibility={isEnterprisePlan ? 'hidden' : 'visible'}
      >
        <Typography variant="subtitle2">Monthly</Typography>
        <Switch defaultChecked checked={viewYearly} onClick={() => setViewYearly(!viewYearly)} />
        <Typography variant="subtitle2">Yearly</Typography>
      </Stack>

      <Typography
        variant="caption"
        sx={{
          color: isEnterprisePlan ? 'primary.light' : 'primary.dark',
        }}
      >
        {caption}
      </Typography>

      <Box sx={{ width: 80, height: 80, mt: 3 }}>
        <Iconify
          icon={icon}
          width={80}
          height={80}
          color={isEnterprisePlan ? '#fff' : theme.palette.primary.darker}
        />
      </Box>
      <Stack component="ul" spacing={2} sx={{ my: 5, width: 1 }}>
        {lists.map((item) => (
          <Stack
            key={item.text}
            component="li"
            direction="row"
            justifyContent="flex-start"
            spacing={1.5}
            sx={{
              typography: 'body2',
              color: item.isAvailable
                ? isEnterprisePlan
                  ? '#fff'
                  : 'text.primary'
                : 'text.disabled',
              textAlign: 'left',
            }}
          >
            <Iconify icon={'eva:checkmark-fill'} sx={{ width: 20, height: 20, flexShrink: 0 }} />
            <Typography variant="body2">{item.text}</Typography>
          </Stack>
        ))}
      </Stack>

      {/* Select */}
      <Box sx={{ mb: 3, width: '100%' }} visibility={isEnterprisePlan ? 'hidden' : 'visible'}>
        <InputLabel>Select advisors</InputLabel>
        <Select
          label="Select Advisors"
          onChange={handleSelectChange}
          defaultValue="1"
          sx={{ width: '100%' }}
          value={String(advisorQuantity)}
        >
          {selectOptions()}
        </Select>
      </Box>
      <Button
        onClick={onClickHandler}
        fullWidth
        size="large"
        variant="contained"
        disabled={disableButton}
        data-test={`select-${priceIdInterval}-plan-button`}
        endIcon={showLoader && <CircularProgress size={20} />}
        id={priceId}
      >
        {labelAction}
      </Button>
    </RootStyle>
  );
}
