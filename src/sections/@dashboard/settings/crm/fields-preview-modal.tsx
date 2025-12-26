import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import * as Yup from 'yup';
import { CustomField, Group } from '../../../../@types/custom-fields';
import { useMemo, useState } from 'react';
import Iconify from 'components/Iconify';
import { getCustomFieldDefaultValue, getCustomFieldFormScheme } from 'utils/custom-fields';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DynamicCustomField from './dynamic-custom-field';
import FormProvider from 'components/hook-form';
import {
  AddressFields,
  BeneficiariesFields,
  DependentsFields,
  EmploymentFields,
  FinancialFields,
  IDsFields,
  PersonalFields,
  SocialLinks,
  SuitabilityFields,
  TeamFields,
} from 'sections/@dashboard/client/profile/ClientInfoFormCard';
import clientInitialFormValues from 'sections/@dashboard/client/profile/utils/clientFormInitialValues';

type Props = DialogProps & {
  onClose: () => void;
  fields: Record<string, CustomField>;
  groups: Group[];
};

export default function FieldsPreviewModal({ onClose, groups, fields, ...props }: Props) {
  const [selectedTab, setSelectedTab] = useState<string>(groups[0].name);

  const selectedGroup = groups?.find((group) => group.name === selectedTab);

  const fieldsArray = Object.values(fields);

  const Schema = Yup.object().shape({
    ...fieldsArray?.reduce((acc, field) => ({ ...acc, ...getCustomFieldFormScheme(field) }), {}),
  });

  const defaultValues = useMemo(
    () => ({
      ...clientInitialFormValues,
      custom: fieldsArray?.reduce(
        (acc, field) => ({
          ...acc,
          ...getCustomFieldDefaultValue(field, {}),
        }),
        {}
      ),
    }),
    [fieldsArray]
  );

  const methods = useForm({
    // @ts-ignore
    resolver: yupResolver(Schema),
    defaultValues,
  });

  return (
    <Dialog {...props} fullWidth maxWidth="lg" onClose={onClose}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Fields Preview</Typography>
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <FormProvider methods={methods}>
          <Tabs
            sx={{
              mt: 2,
              mx: -3,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
            value={selectedTab}
            variant="scrollable"
            scrollButtons
            onChange={(_, newValue) => setSelectedTab(newValue)}
          >
            {groups.flatMap((group) =>
              !group.isHidden ? (
                <Tab
                  key={group.name}
                  value={group.name}
                  label={group.name}
                  icon={group.isNonEditable ? <Iconify icon="mdi:lock-outline" /> : undefined}
                  iconPosition="end"
                />
              ) : (
                []
              )
            )}
          </Tabs>

          <Stack>
            {selectedGroup?.name === 'Personal' && <PersonalFields />}
            {selectedGroup?.name === 'Address' && <AddressFields />}
            {selectedGroup?.name === 'Dependents' && <DependentsFields />}
            {selectedGroup?.name === 'Beneficiaries' && <BeneficiariesFields />}
            {selectedGroup?.name === 'IDs' && <IDsFields clientId="123" />}
            {selectedGroup?.name === 'Employment' && <EmploymentFields />}
            {selectedGroup?.name === 'Team' && <TeamFields />}
            {selectedGroup?.name === 'Financials' && <FinancialFields />}
            {selectedGroup?.name === 'Suitability' && <SuitabilityFields />}
            {selectedGroup?.name === 'Social Links' && <SocialLinks />}

            <Grid mt={2} ml={0} container spacing={2}>
              {selectedGroup?.fields.map((fieldKey) => {
                const field = fields[fieldKey];
                if (!field) return null;

                return (
                  <Grid item key={fieldKey} xs={12} md={field.column || 12}>
                    <DynamicCustomField data={field} keyPrefix={fieldKey} />
                  </Grid>
                );
              })}
            </Grid>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
