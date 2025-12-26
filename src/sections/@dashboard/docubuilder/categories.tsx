import { IconFont, ElementType } from '';

export const categories = [
  {
    get label() {
      return 'Content';
    },
    active: true,
    displayType: 'grid',
    blocks: [
      {
        type: ElementType.STANDARD_PARAGRAPH,
        icon: <IconFont className="block-list-grid-item-icon" iconName="icon-text" />,
      },
      {
        type: ElementType.STANDARD_DIVIDER,
        icon: <IconFont className="block-list-grid-item-icon" iconName="icon-divider" />,
      },
      {
        type: ElementType.STANDARD_SPACER,
        icon: <IconFont className="block-list-grid-item-icon" iconName="icon-spacing" />,
      },
      {
        type: ElementType.STANDARD_TABLE2,
        icon: <IconFont className={'block-list-grid-item-icon'} iconName="icon-table" />,
        payload: {
          type: 'standard-table2',
          data: {},
          attributes: {
            cellpadding: '20px',
            'container-background-color': '#FFFFFF',
          },
          children: [
            {
              type: 'standard-table2-tr',
              data: {},
              attributes: {},
              children: [
                {
                  type: 'standard-table2-td',
                  data: {
                    rowspan: 1,
                    colspan: 1,
                  },
                  attributes: {},
                  children: [
                    {
                      text: '',
                    },
                  ],
                },
                {
                  type: 'standard-table2-td',
                  data: {
                    rowspan: 1,
                    colspan: 1,
                  },
                  attributes: {},
                  children: [
                    {
                      text: '',
                    },
                  ],
                },
                {
                  type: 'standard-table2-td',
                  data: {
                    rowspan: 1,
                    colspan: 1,
                  },
                  attributes: {},
                  children: [
                    {
                      text: '',
                    },
                  ],
                },
              ],
            },
            {
              type: 'standard-table2-tr',
              data: {},
              attributes: {},
              children: [
                {
                  type: 'standard-table2-td',
                  data: {
                    rowspan: 1,
                    colspan: 1,
                  },
                  attributes: {},
                  children: [
                    {
                      text: '',
                    },
                  ],
                },
                {
                  type: 'standard-table2-td',
                  data: {
                    rowspan: 1,
                    colspan: 1,
                  },
                  attributes: {},
                  children: [
                    {
                      text: '',
                    },
                  ],
                },
                {
                  type: 'standard-table2-td',
                  data: {
                    rowspan: 1,
                    colspan: 1,
                  },
                  attributes: {},
                  children: [
                    {
                      text: '',
                    },
                  ],
                },
              ],
            },
            {
              type: 'standard-table2-tr',
              data: {},
              attributes: {},
              children: [
                {
                  type: 'standard-table2-td',
                  data: {
                    rowspan: 1,
                    colspan: 1,
                  },
                  attributes: {},
                  children: [
                    {
                      text: '',
                    },
                  ],
                },
                {
                  type: 'standard-table2-td',
                  data: {
                    rowspan: 1,
                    colspan: 1,
                  },
                  attributes: {},
                  children: [
                    {
                      text: '',
                    },
                  ],
                },
                {
                  type: 'standard-table2-td',
                  data: {
                    rowspan: 1,
                    colspan: 1,
                  },
                  attributes: {},
                  children: [
                    {
                      text: '',
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        type: ElementType.STANDARD_IMAGE,
        icon: <IconFont className="block-list-grid-item-icon" iconName="icon-img" />,
      },
    ],
  },
  {
    get label() {
      return 'Layout';
    },
    active: true,
    displayType: 'column',
    blocks: [
      {
        get title() {
          return '1 column';
        },
        payload: [['100%']],
      },
      {
        get title() {
          return '2 column';
        },
        payload: [
          ['50%', '50%'],
          ['33%', '67%'],
          ['67%', '33%'],
          ['25%', '75%'],
          ['75%', '25%'],
        ],
      },
      {
        get title() {
          return '3 column';
        },
        payload: [
          ['33.33%', '33.33%', '33.33%'],
          ['25%', '50%', '25%'],
          ['25%', '25%', '50%'],
          ['50%', '25%', '25%'],
        ],
      },
      {
        get title() {
          return '4 column';
        },
        payload: [['25%', '25%', '25%', '25%']],
      },
    ],
  },
];
