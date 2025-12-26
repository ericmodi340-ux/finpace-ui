// @mui
import { GlobalStyles } from '@mui/material';
// redux
import { useSelector } from 'redux/store';
// constants
import { firmIds } from 'constants/firms';

// ----------------------------------------------------------------------

export default function FirmStyles() {
  const { firm } = useSelector((state) => state.firm);

  let firmStyles;
  switch (firm?.id) {
    case firmIds.GWN:
      firmStyles = {
        '.form-stepper .stepper-tab': {
          // maxWidth: 600,
          '.stepper-heading-Template': { display: 'none' },
        },
        '.use-formio': {
          'input.form-control, .formio-component-day select, .selection.form-control': {
            padding: '0.5rem 0.75rem !important',
          },
          '.has-feedback .form-control': {
            paddingRight: '0.75rem !important',
          },
        },
      };
      break;
    default:
      firmStyles = {};
      break;
  }

  return <GlobalStyles styles={firmStyles} />;
}
