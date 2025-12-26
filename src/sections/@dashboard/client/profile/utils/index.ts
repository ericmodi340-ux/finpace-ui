import { format } from 'date-fns';
import { ClientManager } from '../../../../../@types/client';

export const mapFieldsToClient = (values: Partial<ClientManager>) => ({
  ...values,
  name:
    !values.firstName && !values.lastName
      ? ''
      : `${values.firstName} ${values.middleInitial || ''} ${values.lastName}`.replace(/\s+/g, ' '),
  //   advisorId: newAdvisorId,
  dateOfBirth: values.dateOfBirth
    ? format(new Date(values.dateOfBirth), 'MM/dd/yyyy')
    : values.dateOfBirth,
  dependents: values.dependents?.map((item) => ({
    ...item,
    name: `${item.firstName || ''} ${item.middleInitial || ''} ${item.lastName || ''}`.replace(
      /\s+/g,
      ' '
    ),
    dateOfBirth: item.dateOfBirth
      ? format(new Date(item.dateOfBirth), 'MM/dd/yyyy')
      : item.dateOfBirth,
  })),
  beneficiaries: values.beneficiaries?.map((item) => ({
    ...item,
    name: `${item.firstName || ''} ${item.middleInitial || ''} ${item.lastName || ''}`.replace(
      /\s+/g,
      ' '
    ),
    dateOfBirth: item.dateOfBirth
      ? format(new Date(item.dateOfBirth), 'MM/dd/yyyy')
      : item.dateOfBirth,
  })),
  ids: values.ids?.map((item) => ({
    ...item,
    issueDate: item.issueDate ? format(new Date(item.issueDate), 'MM/dd/yyyy') : item.issueDate,
    expirationDate: item.expirationDate
      ? format(new Date(item.expirationDate), 'MM/dd/yyyy')
      : item.expirationDate,
  })),
  assets: String(values.assets || '').replace(/,/g, ''),
  investableAssets: String(values.investableAssets || '').replace(/,/g, ''),
  liabilities: String(values.liabilities || '').replace(/,/g, ''),
  liquidNetWorth: String(values.liquidNetWorth || '').replace(/,/g, ''),
  netWorth: String(values.netWorth || '').replace(/,/g, ''),
  residenceValue: String(values.residenceValue || '').replace(/,/g, ''),
  totalInvestments: String(values.totalInvestments || '').replace(/,/g, ''),
  aum: String(values.aum || '').replace(/,/g, ''),
  annualIncome: String(values.annualIncome || '').replace(/,/g, ''),
});
