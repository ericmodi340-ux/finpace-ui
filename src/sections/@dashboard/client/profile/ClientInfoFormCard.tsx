import {
  MenuItem,
  Box,
  Card,
  Divider,
  Tab,
  Tabs,
  styled,
  Stack,
  Typography,
  IconButton,
  Button,
  Grid,
  InputAdornment,
  Chip,
  Alert,
} from '@mui/material';
import {
  RHFTextField,
  RHFAutocomplete,
  RHFSelect,
  RHFCheckbox,
  RHFUploadFileField,
} from 'components/hook-form';
import usStates from '_mock/_usStates';
import { useCallback, useEffect, useMemo, useState } from 'react';
import RHFDatePicker from 'components/hook-form/RHFDatePicker';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Iconify from 'components/Iconify';
import clientInitialFormValues, {
  clientEmploymentFieldsInitialValues,
  clientFinancialFieldsInitialValues,
  clientPersonalFieldsInitialValues,
  clientSuitabilityFieldsInitialValues,
  clientTeamFieldsInitialValues,
} from './utils/clientFormInitialValues';
import { cloneDeep, startCase } from 'lodash';
import useUser from 'hooks/useUser';
import { roles } from 'constants/users';
import useClientTags from 'hooks/useClientTags';
import { useSnackbar } from 'notistack';
import { currencyMask, phoneMask, ssnMask } from 'utils/masks';
import { useSelector } from 'redux/store';
import DynamicCustomField from 'sections/@dashboard/settings/crm/dynamic-custom-field';
// import { ClientPersonalFields } from '@types/client';

export const TabsWrapperStyle = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  marginTop: 5,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'center',
  },
  [theme.breakpoints.up('md')]: {
    justifyContent: 'flex-start',
    // paddingRight: theme.spacing(4),
    // paddingLeft: theme.spacing(4),
  },
}));

type StateMap = {
  [key: string]: string;
};

function getComponent(name: string, clientId: string, customFields?: any) {
  if (name === 'Personal') {
    return <PersonalFields />;
  }

  if (name === 'Address') {
    return <AddressFields />;
  }

  if (name === 'Dependents') {
    return <DependentsFields />;
  }

  if (name === 'Beneficiaries') {
    return <BeneficiariesFields />;
  }

  if (name === 'IDs') {
    return <IDsFields clientId={clientId} />;
  }

  if (name === 'Employment') {
    return <EmploymentFields />;
  }

  if (name === 'Team') {
    return <TeamFields />;
  }

  if (name === 'Financials') {
    return <FinancialFields />;
  }

  if (name === 'Financials') {
    return <FinancialFields />;
  }

  if (name === 'Suitability') {
    return <SuitabilityFields />;
  }

  if (name === 'Social Links') {
    return <SocialLinks />;
  }

  if (name === 'Others') {
    return <CustomFields customFields={customFields} />;
  }

  return null;
}

export default function ClientInfoFormCard({
  clientId,
  customFields,
}: {
  clientId: string;
  customFields?: any;
}) {
  const [currentTab, setCurrentTab] = useState('Personal');

  const { authUser } = useUser();

  const { firm } = useSelector((state) => state.firm);

  const {
    formState: { errors },
  } = useFormContext();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (errors) {
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        const key = keys[0];
        if (key in clientPersonalFieldsInitialValues) {
          setCurrentTab('Personal');
        } else if (key === 'addresses') {
          setCurrentTab('Address');
        } else if (key === 'dependents') {
          setCurrentTab('Dependents');
        } else if (key === 'beneficiaries') {
          setCurrentTab('Beneficiaries');
        } else if (key === 'ids') {
          setCurrentTab('IDs');
        } else if (key in clientEmploymentFieldsInitialValues) {
          setCurrentTab('employment');
        } else if (key in clientTeamFieldsInitialValues) {
          setCurrentTab('team');
        } else if (key in clientFinancialFieldsInitialValues) {
          setCurrentTab('financials');
        } else if (key in clientSuitabilityFieldsInitialValues) {
          setCurrentTab('suitability');
        } else if (key === 'custom') {
          const newKey = Object.keys(errors?.[key] as any)?.[0];

          (firm?.clientFields?.groups || []).forEach((group) => {
            if (group?.fields?.includes(newKey)) {
              setCurrentTab(group.name);
            }
          });
        }
        // else if (firm?.clientFields?.groups?.find((item) => item.fields?.includes(key))) {
        //   const group = firm?.clientFields?.groups?.find((item) => item.fields?.includes(key));
        //   if (group) {
        //     setCurrentTab(group.name);
        //   }
        // }
        else {
          enqueueSnackbar('Something is wrong with fields', { variant: 'error' });
          console.log(errors);
        }
      }
    }
  }, [enqueueSnackbar, errors, firm?.clientFields?.groups]);

  const PROFILE_TABS = [
    ...(firm?.clientFields?.groups || []).flatMap((group) =>
      group.isHidden || (authUser?.role === roles.CLIENT && group.hideFromClient)
        ? []
        : {
            value: group.name,
            component:
              getComponent(group.name, clientId, customFields) === null ? (
                <FirmCustomFields selectedTab={currentTab} />
              ) : (
                getComponent(group.name, clientId, customFields)
              ),
          }
    ),
  ];

  return (
    <Card>
      <TabsWrapperStyle>
        <Tabs
          value={currentTab}
          scrollButtons
          variant="scrollable"
          allowScrollButtonsMobile
          onChange={(_e, value) => setCurrentTab(value)}
        >
          {PROFILE_TABS.map((tab) => (
            <Tab disableRipple key={tab.value} label={tab.value} value={tab.value} />
          ))}
        </Tabs>
      </TabsWrapperStyle>

      <Divider />

      {PROFILE_TABS.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </Card>
  );
}

export const PersonalFields = () => {
  const { authUser } = useUser();
  const { getValues, setValue } = useFormContext();

  const CLIENT_TAGS = useClientTags();

  function updateDriversLicenseNumberInId(value: string) {
    const idsList = getValues('ids');
    const driversLicenseFieldIndex = idsList?.findIndex(
      (item: any) => item.type === 'driversLicense'
    );
    if (driversLicenseFieldIndex > -1) {
      setValue(`ids[${driversLicenseFieldIndex}].number`, value);
      return;
    }
    if (value) {
      const emptyFieldIndex = idsList?.findIndex(
        (item: any) => item.type === '' && item.number === ''
      );
      if (emptyFieldIndex > -1) {
        setValue(`ids[${emptyFieldIndex}].type`, 'driversLicense');
        setValue(`ids[${emptyFieldIndex}].number`, value);
        return;
      }
      setValue(`ids`, [
        ...idsList,
        {
          ...clientInitialFormValues.ids?.[0],
          type: 'driversLicense',
          number: value,
        },
      ]);
    }
  }

  return (
    <Box p={3}>
      <Typography variant="subtitle2">Personal Details</Typography>
      <Box
        mt={2.5}
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        <RHFTextField name="firstName" label="First Name*" />
        <RHFTextField name="middleInitial" label="Middle Name" />
        <RHFTextField name="lastName" label="Last Name*" />
        <RHFSelect name="sex" defaultValue="" label="Gender">
          <MenuItem value="">None</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="unknown">Unknown</MenuItem>
        </RHFSelect>
        <RHFTextField
          name="email"
          disabled={authUser?.role === roles.CLIENT}
          label="Email Address*"
        />
        <RHFTextField mask={phoneMask} name="phoneNumber" label="Phone Number" />

        <RHFDatePicker name="dateOfBirth" label="Date of Birth" />
        <RHFTextField name="preferredName" label="Preferred Name" />
        <RHFSelect name="maritalStatus" label="Marital Status">
          <MenuItem value="">None</MenuItem>
          <MenuItem value="single">Single</MenuItem>
          <MenuItem value="married">Married</MenuItem>
          <MenuItem value="divorced">Divorced</MenuItem>
          <MenuItem value="widowed">Widowed</MenuItem>
          <MenuItem value="separated">Separated</MenuItem>
        </RHFSelect>
        <RHFTextField mask={ssnMask} name="ssn" label="SSN" />
        <RHFTextField
          name="driversLicenseNumber"
          label="Drivers License Number"
          {...{
            onChange: (e: any) => {
              const { value } = e.target;
              setValue('driversLicenseNumber', value);
              updateDriversLicenseNumberInId(value);
            },
          }}
        />
        <RHFSelect name="type" label="Investor Type">
          <MenuItem value="individual">Individual</MenuItem>
          <MenuItem value="accreditedInvestor">Accredited Investor</MenuItem>
          <MenuItem value="qualifiedInstitutionalBuyer">
            Qualified Institutional Buyer (QIB)
          </MenuItem>
          <MenuItem value="corporation">Corporation</MenuItem>
          <MenuItem value="trust">Trust</MenuItem>
          <MenuItem value="lender">Lender</MenuItem>
          <MenuItem value="institutional">Institutional</MenuItem>
          <MenuItem value="bank">Bank</MenuItem>
          <MenuItem value="ventureCapitalist">Venture Capitalist</MenuItem>
        </RHFSelect>
      </Box>
      {/* <LabelStyle mt={3}>Spouse/Partner Details</LabelStyle>
      <Box
        rowGap={3}
        columnGap={2}
        mt={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        <RHFTextField name="spouseName" label="Spouse/Partner Name" />
        <RHFTextField name="spouseEmail" label="Spouse/Partner Email" />
        <RHFTextField mask={phoneMask} name="spousePhone" label="Spouse/Partner Phone" />
      </Box> */}
      {authUser?.role !== roles.CLIENT && (
        <>
          <Typography variant="subtitle2" mt={3}>
            Tags
          </Typography>
          <RHFAutocomplete
            name="tags"
            label="Investor Tags"
            multiple
            freeSolo
            sx={{ mt: 2 }}
            options={CLIENT_TAGS}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={`${option}firstInvestor`}
                  size="small"
                  label={option}
                />
              ))
            }
          />
        </>
      )}
    </Box>
  );
};

const FirmCustomFields = ({ selectedTab }: { selectedTab: string }) => {
  const { firm } = useSelector((state) => state.firm);

  const { authUser } = useUser();

  const selectedGroup = firm?.clientFields?.groups?.find((group) => group.name === selectedTab);

  return (
    <Box p={3}>
      <Grid container spacing={2}>
        {selectedGroup?.fields.map((fieldKey) => {
          const field = firm?.clientFields?.fields?.[fieldKey];
          if (!field) return null;

          if (field.isHidden && authUser?.role === roles.CLIENT) return null;

          return (
            <Grid item key={fieldKey} xs={12} md={field.column || 12}>
              <DynamicCustomField data={field} keyPrefix="custom" />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export const TeamFields = () => (
  <Box
    rowGap={3}
    columnGap={2}
    p={3}
    display="grid"
    gridTemplateColumns={{
      xs: 'repeat(1, 1fr)',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(3, 1fr)',
    }}
  >
    <RHFTextField name="attorneyName" label="Attorney Name" />
    <RHFTextField name="attorneyEmail" label="Attorney Email Address" />
    <RHFTextField mask={phoneMask} name="attorneyPhone" label="Attorney Phone Number" />
    <RHFTextField name="cpaName" label="CPA Name" />
    <RHFTextField name="cpaEmail" label="CPA Email Address" />
    <RHFTextField mask={phoneMask} name="cpaPhone" label="CPA Phone Number" />
    <RHFTextField name="familyOfficerName" label="Family Officer Name" />
    <RHFTextField name="familyOfficerEmail" label="Family Officer Email Address" />
    <RHFTextField mask={phoneMask} name="familyOfficerPhone" label="Family Officer Phone Number" />
    <RHFTextField name="insuranceBrokerName" label="Insurance Broker Name" />
    <RHFTextField name="insuranceBrokerEmail" label="Insurance Broker Email Address" />
    <RHFTextField
      mask={phoneMask}
      name="insuranceBrokerPhone"
      label="Insurance Broker Phone Number"
    />
    <RHFTextField name="trustedContactName" label="Trusted Contact Name" />
    <RHFTextField name="trustedContactEmail" label="Trusted Contact Email Address" />
    <RHFTextField
      mask={phoneMask}
      name="trustedContactPhone"
      label="Trusted Contact Phone Number"
    />
    <RHFTextField name="executorName" label="Executor Name" />
    <RHFTextField name="executorEmail" label="Executor Email Address" />
    <RHFTextField mask={phoneMask} name="executorPhone" label="Executor Phone Number" />
  </Box>
);

export const FinancialFields = () => {
  const { watch } = useFormContext();

  const totalInvestmentsValue = watch('totalInvestments');
  const aumValue = watch('aum');

  const totalInvestments = totalInvestmentsValue
    ? parseFloat(totalInvestmentsValue.replace(/[^0-9.-]+/g, '')) || 0
    : 0;
  const aum = aumValue ? parseFloat(aumValue.replace(/[^0-9.-]+/g, '')) || 0 : 0;
  const opportunity = totalInvestments - aum;

  return (
    <Stack spacing={2.5} p={3}>
      <Typography variant="subtitle2">Financials</Typography>
      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        <RHFTextField
          name="federalTaxBracket"
          label="Federal Tax Bracket"
          type="number"
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assets'))}
          name="assets"
          label="Total Assets"
        />

        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('investableAssets'))}
          name="investableAssets"
          label="Investable Assets"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('liabilities'))}
          name="liabilities"
          label="Liabilities"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('liquidNetWorth'))}
          name="liquidNetWorth"
          label="Liquid Net Worth"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('netWorth'))}
          name="netWorth"
          label="Net Worth"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('residenceValue'))}
          name="residenceValue"
          label="Residence Value"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('totalInvestments'))}
          name="totalInvestments"
          label="Total Investments"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('aum'))}
          name="aum"
          label="Total AUM"
        />
      </Box>
      {!!totalInvestments && !!aum && (
        <Alert variant="standard" icon={false}>
          Opportunity: ${opportunity}
        </Alert>
      )}
      <Typography variant="subtitle2">Assets</Typography>
      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.cash'))}
          name="assetsList.cash"
          label="Cash Value"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.brokerageAccountS'))}
          name="assetsList.brokerageAccountS"
          label="Brokerage Value"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.iraS'))}
          name="assetsList.iraS"
          label="IRAs Work Value"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.401K'))}
          name="assetsList.401K"
          label="401K Value"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.realEstate'))}
          name="assetsList.realEstate"
          label="Real Estate Value"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.crypto'))}
          name="assetsList.crypto"
          label="Crypto Value"
        />

        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.cbusinessEsrypto'))}
          name="assetsList.businessEs"
          label="Business Value"
        />

        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.other'))}
          name="assetsList.other"
          label="Other Value"
        />

        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.cashValueLifeInsurance'))}
          name="assetsList.cashValueLifeInsurance"
          label="Cash Value Life Insurance"
        />

        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.cashValueLifeInsuranceEquity'))}
          name="assetsList.cashValueLifeInsuranceEquity"
          label="Cash Value Life Insurance Equity"
        />
      </Box>
      <Typography variant="subtitle2">Liabilities</Typography>
      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.realEstate'))}
          name="assetsList.realEstate"
          label="Real Estate Debt"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.heloc'))}
          name="assetsList.heloc"
          label="Heloc Debt"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.personalLoanS'))}
          name="assetsList.personalLoanS"
          label="Personal Loan Debt"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.businessLoanS'))}
          name="assetsList.businessLoanS"
          label="Business Loan Debt"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.autoLoanS'))}
          name="assetsList.autoLoanS"
          label="Auto Loan Debt"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.studentLoanS'))}
          name="assetsList.studentLoanS"
          label="Student Loan Debt"
        />

        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.taxDebt'))}
          name="assetsList.taxDebt"
          label="Tax Debt Value"
        />

        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.creditCardS'))}
          name="assetsList.creditCardS"
          label="Credit Card Debt"
        />

        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.medicalDebt'))}
          name="assetsList.medicalDebt"
          label="Medical Debt Value"
        />

        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('assetsList.other'))}
          name="assetsList.other"
          label="Other Debt"
        />
      </Box>
    </Stack>
  );
};

export const DependentsFields = () => {
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dependents',
  });

  return (
    <Box p={3}>
      {fields?.map((field, index) => (
        <Box key={field.id}>
          {index > 0 && <Divider sx={{ my: 3 }} />}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center">
              <Typography variant="subtitle2">Dependent #{index + 1}</Typography>
              {fields.length > 1 && (
                <IconButton color="error" onClick={() => remove(index)}>
                  <Iconify icon={'eva:trash-2-outline'} width={18} height={18} />
                </IconButton>
              )}
            </Stack>
            <Button
              onClick={() => {
                const beneficiaries = watch('beneficiaries') || [];

                if (beneficiaries.length === 1 && beneficiaries?.[0]?.relationship === '') {
                  setValue('beneficiaries', [watch('dependents')[index]]);
                  return;
                }
                setValue('beneficiaries', [
                  ...(watch('beneficiaries') || []),
                  watch('dependents')[index],
                ]);
              }}
              size="small"
            >
              Set as a Beneficiary
            </Button>
          </Stack>
          <Box
            mt={2.5}
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
          >
            <RHFSelect name={`dependents[${index}].relationship`} label="Relationship">
              <MenuItem value="">None</MenuItem>
              <MenuItem value="spouse">Spouse</MenuItem>
              <MenuItem value="child">Child</MenuItem>
              <MenuItem value="grandchild">Grand Child</MenuItem>
              <MenuItem value="parent">Parent</MenuItem>
              <MenuItem value="sibling">Sibling</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </RHFSelect>
            <RHFTextField
              inputProps={{ maxLength: 3 }}
              value={currencyMask(watch(`dependents[${index}].sharePercentage`))}
              name={`dependents[${index}].sharePercentage`}
              label="Share Percentage"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
            <RHFSelect name={`dependents[${index}].type`} label="Type">
              <MenuItem value="">None</MenuItem>
              <MenuItem value="primary">Primary</MenuItem>
              <MenuItem value="contingent">Contingent</MenuItem>
            </RHFSelect>
            <RHFTextField name={`dependents[${index}].firstName`} label="First Name" />
            <RHFTextField name={`dependents[${index}].middleInitial`} label="Middle Initial" />
            <RHFTextField name={`dependents[${index}].lastName`} label="Last Name" />
            <RHFTextField name={`dependents[${index}].address`} label="Address" />
            <RHFTextField name={`dependents[${index}].city`} label="City" />
            <RHFAutocomplete
              name={`dependents[${index}].state`}
              label="State"
              options={Object.keys(usStates)}
              getOptionLabel={(option) => {
                const state: StateMap = usStates as StateMap;
                if (option && state[option]) {
                  return state[option];
                }
                return '';
              }}
            />
            <RHFTextField
              inputProps={{ maxLength: 5 }}
              name={`dependents[${index}].zipCode`}
              label="Zip Code"
            />
            <RHFDatePicker name={`dependents[${index}].dateOfBirth`} label="Date of Birth" />
            <RHFTextField
              mask={phoneMask}
              name={`dependents[${index}].phoneNumber`}
              label="Phone Number"
            />
            <RHFTextField name={`dependents[${index}].email`} label="Email Address" />
            <RHFTextField mask={ssnMask} name={`dependents[${index}].ssn`} label="SSN" />
          </Box>
        </Box>
      ))}
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          startIcon={<Iconify icon={'eva:plus-outline'} width={18} height={18} />}
          color="primary"
          variant="outlined"
          onClick={() => append(cloneDeep({ ...clientInitialFormValues.dependents?.[0] }))}
        >
          Add Dependent
        </Button>
      </Box>
    </Box>
  );
};

export const BeneficiariesFields = () => {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'beneficiaries',
  });

  return (
    <Box p={3}>
      {fields?.map((field, index) => (
        <Box key={field.id}>
          {index > 0 && <Divider sx={{ my: 3 }} />}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" alignItems="center">
              <Typography variant="subtitle2">Beneficiary #{index + 1}</Typography>
              {fields.length > 1 && (
                <IconButton color="error" onClick={() => remove(index)}>
                  <Iconify icon={'eva:trash-2-outline'} width={18} height={18} />
                </IconButton>
              )}
            </Stack>
            <Button
              onClick={() => {
                const dependents = watch('dependents') || [];

                if (dependents.length === 1 && dependents?.[0]?.relationship === '') {
                  setValue('dependents', [watch('beneficiaries')[index]]);
                  return;
                }
                setValue('dependents', [
                  ...(watch('dependents') || []),
                  watch('beneficiaries')[index],
                ]);
              }}
              size="small"
            >
              Set as a Dependent
            </Button>
          </Stack>
          <Box
            mt={2.5}
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
          >
            <RHFSelect name={`beneficiaries[${index}].relationship`} label="Relationship">
              <MenuItem value="">None</MenuItem>
              <MenuItem value="spouse">Spouse</MenuItem>
              <MenuItem value="child">Child</MenuItem>
              <MenuItem value="grandchild">Grand Child</MenuItem>
              <MenuItem value="parent">Parent</MenuItem>
              <MenuItem value="sibling">Sibling</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </RHFSelect>
            <RHFTextField
              inputProps={{
                maxLength: 3,
              }}
              value={currencyMask(watch(`beneficiaries[${index}].sharePercentage`))}
              name={`beneficiaries[${index}].sharePercentage`}
              label="Share Percentage"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
            <RHFSelect name={`beneficiaries[${index}].type`} label="Type">
              <MenuItem value="">None</MenuItem>
              <MenuItem value="primary">Primary</MenuItem>
              <MenuItem value="contingent">Contingent</MenuItem>
            </RHFSelect>
            <RHFTextField name={`beneficiaries[${index}].firstName`} label="First Name" />
            <RHFTextField name={`beneficiaries[${index}].middleInitial`} label="Middle Initial" />
            <RHFTextField name={`beneficiaries[${index}].lastName`} label="Last Name" />
            <RHFTextField name={`beneficiaries[${index}].address`} label="Address" />
            <RHFTextField name={`beneficiaries[${index}].city`} label="City" />
            <RHFAutocomplete
              name={`beneficiaries[${index}].state`}
              label="State"
              options={Object.keys(usStates)}
              getOptionLabel={(option) => {
                const state: StateMap = usStates as StateMap;
                if (option && state[option]) {
                  return state[option];
                }
                return '';
              }}
            />
            <RHFTextField
              inputProps={{ maxLength: 5 }}
              name={`beneficiaries[${index}].zipCode`}
              label="Zip Code"
            />
            <RHFDatePicker name={`beneficiaries[${index}].dateOfBirth`} label="Date of Birth" />
            <RHFTextField
              mask={phoneMask}
              name={`beneficiaries[${index}].phoneNumber`}
              label="Phone Number"
            />
            <RHFTextField name={`beneficiaries[${index}].email`} label="Email Address" />
            <RHFTextField mask={ssnMask} name={`beneficiaries[${index}].ssn`} label="SSN" />
          </Box>
        </Box>
      ))}
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          startIcon={<Iconify icon={'eva:plus-outline'} width={18} height={18} />}
          color="primary"
          variant="outlined"
          onClick={() => append(cloneDeep({ ...clientInitialFormValues.dependents?.[0] }))}
        >
          Add Beneficiary
        </Button>
      </Box>
    </Box>
  );
};

export const EmploymentFields = () => {
  const { watch } = useFormContext();

  return (
    <Stack spacing={2.5} p={3}>
      <Typography variant="subtitle2">Employment</Typography>

      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        <RHFSelect name="employmentStatus" label="Employment Status">
          <MenuItem value="">None</MenuItem>
          <MenuItem value="employed">Employed</MenuItem>
          <MenuItem value="unemployed">Unemployed</MenuItem>
          <MenuItem value="retired">Retired</MenuItem>
          <MenuItem value="selfEmployed">Self-Employed</MenuItem>
        </RHFSelect>
        <RHFTextField name="employerName" label="Employer Name" />
        <RHFTextField name="occupation" label="Occupation" />
        <RHFTextField mask={phoneMask} name="employerPhone" label="Employer Phone" />
        <RHFTextField name="employerAddress" label="Employer Address" />
        <RHFTextField name="employerCity" label="Employer City" />
        <RHFAutocomplete
          name="employerState"
          label="Employer State"
          options={Object.keys(usStates)}
          getOptionLabel={(option) => {
            const state: StateMap = usStates as StateMap;
            if (option && state[option]) {
              return state[option];
            }
            return '';
          }}
        />
        <RHFTextField
          inputProps={{ maxLength: 5 }}
          name="employerZipCode"
          label="Employer Zip Code"
        />
        <RHFTextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:dollar" />
              </InputAdornment>
            ),
          }}
          value={currencyMask(watch('annualIncome'))}
          name="annualIncome"
          label="Annual Income"
        />
      </Box>
    </Stack>
  );
};

export const IDsFields = ({ clientId }: { clientId: string }) => {
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ids',
  });

  const TypeOptions = [
    {
      label: 'None',
      value: '',
    },
    {
      label: 'Drivers License',
      value: 'driversLicense',
    },
    {
      label: 'Permanent Resident Card',
      value: 'permanentResidentCard',
    },
    {
      label: 'Passport',
      value: 'passport',
    },
    {
      label: 'State ID',
      value: 'stateId',
    },
    {
      label: 'Military',
      value: 'military',
    },
    {
      label: 'Other',
      value: 'other',
    },
  ];

  return (
    <Box p={3}>
      {fields?.map((field, index) => (
        <Box key={field.id}>
          {index > 0 && <Divider sx={{ my: 3 }} />}
          <Stack direction="row" alignItems="center">
            <Typography variant="subtitle2">ID #{index + 1}</Typography>
            {fields.length > 1 && watch(`ids[${index}].type`) !== 'driversLicense' && (
              <IconButton
                color="error"
                onClick={() => {
                  remove(index);
                }}
              >
                <Iconify icon={'eva:trash-2-outline'} width={18} height={18} />
              </IconButton>
            )}
          </Stack>
          <Box
            mt={2}
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
          >
            <RHFSelect name={`ids[${index}].type`} label="Type">
              {TypeOptions.map((option) => (
                <MenuItem value={option.value} key={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFTextField
              name={`ids[${index}].number`}
              label="Number"
              {...(watch(`ids[${index}].type`) === 'driversLicense'
                ? {
                    onChange: (e: any) => {
                      const { value } = e.target;
                      setValue(`ids[${index}].number`, value);
                      setValue('driversLicenseNumber', value);
                    },
                  }
                : {})}
            />
            <RHFTextField name={`ids[${index}].issuer`} label="Issuer" />
            <RHFDatePicker name={`ids[${index}].issueDate`} label="Issue Date" />
            <RHFDatePicker name={`ids[${index}].expirationDate`} label="Expiration Date" />
            {watch(`ids[${index}].type`) && (
              <RHFUploadFileField
                fieldId={watch(`ids[${index}].type`)}
                clientId={clientId}
                accept=".pdf,image/*"
              />
            )}
          </Box>
        </Box>
      ))}
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          startIcon={<Iconify icon={'eva:plus-outline'} width={18} height={18} />}
          color="primary"
          onClick={() => append(cloneDeep({ ...clientInitialFormValues.ids?.[0] }))}
        >
          Add ID
        </Button>
      </Box>
    </Box>
  );
};

export const AddressFields = () => {
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses',
  });

  const watchedMailingAddresses = watch(
    fields.map((field, index) => `addresses${index}].isMailingAddress`)
  );

  useEffect(() => {
    const mailingAddressCount = watchedMailingAddresses.filter(Boolean).length;
    if (mailingAddressCount > 1) {
      const lastTrueIndex = watchedMailingAddresses.lastIndexOf(true);
      watchedMailingAddresses.forEach((_, index) => {
        if (index !== lastTrueIndex) {
          setValue(`addresses[${index}].isMailingAddress`, false);
        }
      });
    }
  }, [watchedMailingAddresses, setValue]);

  const handleMailingAddressChange = (index: number, value: boolean) => {
    if (value) {
      fields.forEach((_, i) => {
        if (i !== index) {
          setValue(`addresses[${i}].isMailingAddress`, false);
        }
      });
    }
    setValue(`addresses[${index}].isMailingAddress`, value);
  };

  return (
    <Box p={3}>
      {fields?.map((field, index) => (
        <Stack key={field.id}>
          {index > 0 && <Divider sx={{ my: 3 }} />}
          <Stack direction="row" alignItems="center">
            <Typography variant="subtitle2">Address #{index + 1}</Typography>
            {fields.length > 1 && (
              <IconButton
                color="error"
                onClick={() => {
                  remove(index);
                }}
              >
                <Iconify icon={'eva:trash-2-outline'} width={18} height={18} />
              </IconButton>
            )}
          </Stack>
          <Grid
            sx={{
              mt: 0,
            }}
            container
            spacing={2}
          >
            <Grid item xs={12}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', md: 'center' }}
              >
                <RHFAutocomplete
                  name={`addresses[${index}].type`}
                  label="Type"
                  size="small"
                  sx={{
                    width: { xs: '100%', md: 200 },
                  }}
                  options={['home', 'work', 'mobile', 'vacation', 'fax', 'other']}
                  getOptionLabel={(option) => startCase(option)}
                />
                <RHFCheckbox
                  name={`addresses[${index}].isMailingAddress`}
                  label="Is Mailing Address"
                  disabled={watchedMailingAddresses.some(
                    (isMailingAddress, i) => isMailingAddress && i !== index
                  )}
                  onChange={(e, checked) => handleMailingAddressChange(index, checked)}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFTextField name={`addresses[${index}].address1`} label="Address Line 1" />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFTextField name={`addresses[${index}].address2`} label="Address Line 2" />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFTextField name={`addresses[${index}].city`} label="City" />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFAutocomplete
                name={`addresses[${index}].state`}
                label="State"
                options={Object.keys(usStates)}
                getOptionLabel={(option) => {
                  const state: StateMap = usStates as StateMap;
                  if (option && state[option]) {
                    return state[option];
                  }
                  return '';
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFTextField
                inputProps={{ maxLength: 5 }}
                name={`addresses[${index}].zipCode`}
                label="Zip Code"
              />
            </Grid>
          </Grid>
        </Stack>
      ))}
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          startIcon={<Iconify icon={'eva:plus-outline'} width={18} height={18} />}
          color="primary"
          onClick={() => append(cloneDeep({ ...clientInitialFormValues.addresses?.[0] }))}
        >
          Add Address
        </Button>
      </Box>
    </Box>
  );
};

// @types
const IconStyle = styled(Iconify)(({ theme }) => ({
  width: 30,
  height: 30,
  marginTop: 1,
  flexShrink: 0,
  marginRight: theme.spacing(2),
}));

// ----------------------------------------------------------------------

const SOCIAL_LINKS = [
  {
    value: 'socialMedia.facebook',
    icon: <IconStyle icon="ic:baseline-facebook" />,
    placeholder: 'https://facebook.com/finpace',
    label: 'Facebook',
  },
  {
    value: 'socialMedia.instagram',
    icon: <IconStyle icon="ri:instagram-fill" />,
    placeholder: 'https://instagram.com/finpace',
    label: 'Instagram',
  },
  {
    value: 'socialMedia.linkedin',
    icon: <IconStyle icon="mdi:linkedin" />,
    placeholder: 'https://linkedin.com/finpace',
    label: 'Linkedin',
  },
  {
    value: 'socialMedia.twitter',
    icon: <IconStyle icon="mdi:twitter" />,
    placeholder: 'https://twitter.com/finpace',
    label: 'Twitter',
  },
  {
    value: 'socialMedia.youtube',
    icon: <IconStyle icon="mdi:youtube" />,
    placeholder: 'https://youtube.com/finpace',
    label: 'Youtube',
  },
  {
    value: 'socialMedia.homeWebsite',
    icon: <IconStyle icon="ic:baseline-home" />,
    placeholder: 'https://finpace.app/',
    label: 'Home Website',
  },
  {
    value: 'socialMedia.workWebsite',
    icon: <IconStyle icon="ic:baseline-work" />,
    placeholder: 'https://myworkplace.com/',
    label: 'Work website',
  },
  {
    value: 'socialMedia.otherWebsite',
    icon: <IconStyle icon="ion:globe-sharp" />,
    placeholder: 'https://myotherwebsite.io/',
    label: 'Other Website',
  },
] as const;

export function SocialLinks() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography mb={2.5} variant="subtitle2">
        Social Links
      </Typography>
      <Stack spacing={3} alignItems="flex-end">
        {SOCIAL_LINKS.map((link) => (
          <RHFTextField
            name={link.value}
            key={link.value}
            placeholder={link.placeholder}
            label={link.label}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">{link.icon}</InputAdornment>,
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

export const SuitabilityFields = () => {
  const { watch, setValue } = useFormContext();

  // get currentAge
  const getCurrentAge = useCallback(() => {
    const dateOfBirth = watch('dateOfBirth');
    if (!dateOfBirth) return '';

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    return age;
  }, [watch]);

  useEffect(() => {
    if (watch('currentAge') === '') {
      setValue('currentAge', getCurrentAge());
    }
  }, [getCurrentAge, setValue, watch]);

  return (
    <Stack px={3} pb={3}>
      <Typography py={3} variant="subtitle2">
        Suitability
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <RHFTextField name="currentAge" label="Current Age" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RHFTextField name="riskScore" label="Risk Score" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RHFAutocomplete
            name="currentUnderstandingOfInvestments"
            label="Current Understanding Of Investments"
            options={['None', 'Poor', 'Average', 'Good', 'Excellent']}
            getOptionLabel={(option) => option}
            freeSolo
            disableClearable
            freeSoloCreate
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RHFAutocomplete
            name="retirementAge"
            label="Desired Retirement Age"
            options={['40-50', '50-55', '55-60', '60-65', '65-70', '70-75', '80 +']}
            getOptionLabel={(option) => option}
            freeSolo
            disableClearable
            freeSoloCreate
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RHFAutocomplete
            name="investingKnowledge"
            label="Investing Knowledge"
            options={['None', 'Limited', 'Average', 'Above Average', 'Extensive Experience']}
            getOptionLabel={(option) => option}
            freeSolo
            disableClearable
            freeSoloCreate
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RHFAutocomplete
            name="timeHorizon"
            label="Time Horizon"
            options={[
              'O Under 1 year',
              '1-2 years',
              '3-5 years',
              '6-10 years',
              '11-20 years',
              'Over 20 years',
            ]}
            getOptionLabel={(option) => option}
            freeSolo
            disableClearable
            freeSoloCreate
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RHFAutocomplete
            name="needMoneyFromInvestmentsIn"
            label="Need money from investments In"
            options={['Less than 3 years', '3-5 years', '6-10 years', '11+ years from now']}
            getOptionLabel={(option) => option}
            freeSolo
            disableClearable
            freeSoloCreate
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RHFAutocomplete
            name="riskTolerance"
            label="Risk Tolerance"
            options={[
              'Very Conservative',
              'Conservative',
              'Moderately Conservative',
              'Moderate',
              'Moderately Aggressive',
              'Aggressive',
              'Very Aggressive',
            ]}
            getOptionLabel={(option) => option}
            freeSolo
            disableClearable
            freeSoloCreate
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <RHFAutocomplete
            name="needMoneyToLastFor"
            label="Needs money to last for"
            options={['Less than 2 years', '2-5 years', '6-10 years', '11+ years']}
            getOptionLabel={(option) => option}
            freeSolo
            disableClearable
            freeSoloCreate
          />
        </Grid>
        <Grid item xs={12}>
          <RHFAutocomplete
            name="investorObjective"
            label="Investor Objective"
            options={[
              'Tax Planning',
              'Estate Planning',
              'Wealth Management',
              'Income Planning',
              'Education Planning',
              'Debt Reduction',
              'Inherited Monies',
              '401(k) Rollover',
              'Wealth Creation',
              'Business',
              'Other',
            ]}
            getOptionLabel={(option) => option}
            freeSolo
            disableClearable
            multiple
          />
        </Grid>
        <Grid item xs={12}>
          <RHFAutocomplete
            name="investorHasExperienceWith"
            label="Investor Has Experience With"
            options={[
              'ETFs',
              'Bonds',
              'Stocks',
              'Mutual Funds',
              'Commodities',
              'Annuities',
              'Derivatives',
              'Cryptocurrency',
              'Real Estate | Reits',
              'Other',
            ]}
            getOptionLabel={(option) => option}
            freeSolo
            disableClearable
            multiple
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2">Portfolio Details</Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <RHFTextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="mdi:dollar" />
                </InputAdornment>
              ),
            }}
            value={currencyMask(watch('currentPortfolioValue'))}
            name="currentPortfolioValue"
            label="Current Portfolio Value"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <RHFAutocomplete
            name="answersToRiskToleranceQuestions"
            label="Answers to Risk Tolerance Questions"
            options={[]}
            getOptionLabel={(option) => option}
            disableClearable
            multiple
            disabled
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

const CustomFields = ({ customFields }: { customFields?: any }) => {
  const { firm } = useSelector((state) => state.firm);

  const fields = firm?.clientFields?.fields;

  const filteredFieldsKeys = Object.keys(customFields || {})?.filter((fieldKey: string) => {
    if (fields[fieldKey]) {
      return null;
    }
    return fieldKey;
  });

  if (!filteredFieldsKeys || filteredFieldsKeys.length === 0) {
    return (
      <Box p={3} height={200}>
        <Typography mt={3} textAlign="center" variant="body2">
          No other records found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          // md: 'repeat(3, 1fr)',
        }}
      >
        {filteredFieldsKeys?.flatMap((key) => {
          if (typeof customFields[key] === 'string' || typeof customFields[key] === 'number') {
            return <RHFTextField key={key} name={`custom.${key}`} label={key} />;
          }

          if (typeof customFields[key] === 'boolean') {
            return <RHFCheckbox key={key} name={`custom.${key}`} label={key} />;
          }

          return [];
        })}
      </Box>
    </Box>
  );
};
