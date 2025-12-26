import { useCallback, useEffect, useState } from 'react';
import { Tabs, Tab, Button, Card, Stack, Typography, Alert } from '@mui/material';
import { useBoolean } from 'hooks/useBoolean';
import ManageGroupModal from '../crm/manage-group-modal';
import Iconify from 'components/Iconify';
import { Group, CustomField } from '../../../../@types/custom-fields';
import { updateFirm } from 'redux/slices/firm';
import { FirmManager } from '../../../../@types/firm';
import { useSelector } from 'redux/store';
import { LoadingButton } from '@mui/lab';
import FieldsPreviewModal from '../crm/fields-preview-modal';
import FieldsCreator from '../crm/fields-creator';
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
import { useForm } from 'react-hook-form';
import FormProvider from 'components/hook-form';
import clientInitialFormValues from 'sections/@dashboard/client/profile/utils/clientFormInitialValues';
import { useSnackbar } from 'notistack';

function FirmCrm() {
  const { firm } = useSelector((state) => state.firm);

  const [isSaving, setIsSaving] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  // const [groups, setGroups] = useState<Group[]>(firm?.clientFields?.groups || []);
  const [groups, setGroups] = useState<Group[]>(firm?.clientFields?.groups || []);

  const [fields, setFields] = useState<Record<string, CustomField>>(
    firm?.clientFields?.fields || {}
  );

  useEffect(() => {
    setGroups(firm?.clientFields?.groups || []);
    setFields(firm?.clientFields?.fields || {});
  }, [firm?.clientFields?.fields, firm?.clientFields?.groups]);

  const openPreview = useBoolean();
  const openManageGroups = useBoolean();
  const [selectedTab, setSelectedTab] = useState<string>(groups?.[0]?.name || 'Personal');

  const methods = useForm({
    defaultValues: {
      ...clientInitialFormValues,
    },
  });

  const selectedGroup = groups?.find((group) => group.name === selectedTab);

  const onSave = useCallback(async () => {
    setIsSaving(true);
    const newFirmSettings: Partial<FirmManager> = {
      clientFields: {
        groups,
        fields,
      },
    };
    await updateFirm(firm.id, newFirmSettings);
    enqueueSnackbar('Settings saved', { variant: 'success' });
    setIsSaving(false);
  }, [enqueueSnackbar, fields, firm.id, groups]);

  return (
    <Stack>
      <Card>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 3, mb: 1, px: 3 }}
        >
          <Typography variant="subtitle1" gutterBottom>
            CRM Layout
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button size="small" onClick={openPreview.onTrue} variant="outlined">
              Preview
            </Button>
            <Button size="small" onClick={openManageGroups.onTrue} variant="outlined">
              Manage Groups
            </Button>

            <ManageGroupModal
              initialGroups={groups}
              onSave={setGroups}
              open={openManageGroups.value}
              handleClose={openManageGroups.onFalse}
            />

            <LoadingButton loading={isSaving} onClick={onSave} size="small" variant="contained">
              Save Changes
            </LoadingButton>
          </Stack>
        </Stack>

        <Tabs
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
          value={selectedTab}
          scrollButtons
          variant="scrollable"
          allowScrollButtonsMobile
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

        <FormProvider methods={methods}>
          {selectedGroup?.isNonEditable && (
            <Alert
              sx={{
                my: 2,
                mx: 3,
              }}
              severity="info"
            >
              Fields in this group are non-editable. You can only view the fields
            </Alert>
          )}

          <Stack
            sx={{
              pointerEvents: 'none',
              opacity: 0.5,
            }}
          >
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
          </Stack>
        </FormProvider>

        {!selectedGroup?.isNonEditable && (
          <FieldsCreator
            fields={fields}
            selectedGroup={selectedGroup}
            selectedTab={selectedTab}
            setFields={setFields}
            setGroups={setGroups}
          />
        )}
      </Card>
      {openPreview.value && (
        <FieldsPreviewModal
          open={openPreview.value}
          onClose={openPreview.onFalse}
          fields={fields}
          groups={groups}
        />
      )}
    </Stack>
  );
}

export default FirmCrm;
