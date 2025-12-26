import { MergetagItem } from '';

export const MergeTags: MergetagItem[] = [
  {
    label: 'Client',
    value: '',
    children: [
      {
        label: 'FirstName',
        value: 'firstName',
      },
      {
        label: 'LastName',
        value: 'lastName',
      },
      {
        label: 'Email',
        value: 'email',
      },
    ],
  },
  {
    label: 'Advisor',
    value: '',
    children: [
      {
        label: 'Advisor Name',
        value: 'advisor.name',
      },
      {
        label: 'Advisor Email',
        value: 'advisor.email',
      },
      {
        label: 'Advisor Facebook',
        value: 'advisor.socialMedia.facebook',
        type: 'link',
      },
      {
        label: 'Advisor Instagram',
        value: 'advisor.socialMedia.instagram',
        type: 'link',
      },
      {
        label: 'Advisor Linkedin',
        value: 'advisor.socialMedia.linkedin',
        type: 'link',
      },
      {
        label: 'Advisor Twitter',
        value: 'advisor.socialMedia.twitter',
        type: 'link',
      },
      {
        label: 'Advisor Youtube',
        value: 'advisor.socialMedia.youtube',
        type: 'link',
      },
    ],
  },
  {
    label: 'Firm',
    value: '',
    children: [
      {
        label: 'Firm Name',
        value: 'firm.name',
      },
      // {
      //   label: 'Firm Logo',
      //   value: 'firm.logo',
      //   type: 'image',
      // },
      // {
      //   label: 'Firm Icon',
      //   value: 'firm.icon',
      //   type: 'image',
      // },
    ],
  },
  {
    label: 'System',
    value: '',
    children: [
      {
        label: 'Unsubscribe',
        value: 'unsubscribe',
        type: 'link',
      },
    ],
  },
];
