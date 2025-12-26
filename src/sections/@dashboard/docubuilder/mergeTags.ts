import { MergetagItem } from '';

export const MergeTags: MergetagItem[] = [
  {
    label: 'Signature',
    value: '',
    children: [
      {
        label: 'Client 1 Signature',
        value: 'client_1__**signHere**',
      },
      {
        label: 'Client 2 Signature',
        value: 'client_2__**signHere**',
      },
      {
        label: 'Advisor Signature',
        value: 'advisor__**signHere**',
      },
      {
        label: 'Firm Signature',
        value: 'firm__**signHere**',
      },
    ],
  },
  {
    label: 'Initials',
    value: '',
    children: [
      {
        label: 'Client 1 Initials',
        value: 'client_1__**initialHere**',
      },
      {
        label: 'Client 2 Initials',
        value: 'client_2__**initialHere**',
      },
      {
        label: 'Advisor Initials',
        value: 'advisor__**initialHere**',
      },
      {
        label: 'Firm Initials',
        value: 'firm__**initialHere**',
      },
    ],
  },
  {
    label: 'Date Signed',
    value: '',
    children: [
      {
        label: 'Client 1 Date Signed',
        value: 'client_1__**dateSigned**',
      },
      {
        label: 'Client 2 Date Signed',
        value: 'client_2__**dateSigned**',
      },
      {
        label: 'Advisor Date Signed',
        value: 'advisor__**dateSigned**',
      },
      {
        label: 'Firm Date Signed',
        value: 'firm__**dateSigned**',
      },
    ],
  },
];
