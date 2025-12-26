import { IconFont } from '';
import { ElementType } from '';

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
        type: ElementType.STANDARD_IMAGE,
        icon: <IconFont className="block-list-grid-item-icon" iconName="icon-img" />,
      },
      {
        type: ElementType.STANDARD_BUTTON,
        icon: <IconFont className="block-list-grid-item-icon" iconName="icon-button" />,
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
        type: ElementType.STANDARD_NAVBAR,
        icon: <IconFont className="block-list-grid-item-icon" iconName="icon-navbar" />,
      },
      {
        type: ElementType.STANDARD_SOCIAL,
        icon: <IconFont className="block-list-grid-item-icon" iconName="icon-social" />,
        payload: {
          type: 'standard-social',
          data: {},
          attributes: {
            spacing: '12px',
            'icon-size': '28px',
          },
          children: [
            {
              data: {},
              type: 'standard-social-element',
              children: [
                {
                  text: '',
                },
              ],
              attributes: {
                src: 'https://dev-cdn.finpace.com/public/advisors/23a4d076-2f38-42e0-9971-dce5a1970f2c/email-templates/1725807744256/images/1727357420464',
                href: '{{ advisor.socialMedia.facebook }}',
                'padding-left': '0px',
                'padding-right': '0px',
                'padding-top': '0px',
                'padding-bottom': '0px',
              },
            },
            {
              data: {},
              type: 'standard-social-element',
              children: [
                {
                  text: '',
                },
              ],
              attributes: {
                src: 'https://dev-cdn.finpace.com/public/advisors/23a4d076-2f38-42e0-9971-dce5a1970f2c/email-templates/1725807744256/images/1727357456719',
                href: '{{ advisor.socialMedia.instagram }}',
                'padding-left': '12px',
                'padding-right': '0px',
                'padding-top': '0px',
                'padding-bottom': '0px',
              },
            },
            {
              data: {},
              type: 'standard-social-element',
              children: [
                {
                  text: '',
                },
              ],
              attributes: {
                src: 'https://dev-cdn.finpace.com/public/advisors/23a4d076-2f38-42e0-9971-dce5a1970f2c/email-templates/1725807744256/images/1727357481826',
                href: '{{ advisor.socialMedia.linkedin }}',
                'padding-left': '12px',
                'padding-right': '0px',
                'padding-top': '0px',
                'padding-bottom': '0px',
              },
            },
            {
              data: {},
              type: 'standard-social-element',
              children: [
                {
                  text: '',
                },
              ],
              attributes: {
                src: 'https://dev-cdn.finpace.com/public/advisors/23a4d076-2f38-42e0-9971-dce5a1970f2c/email-templates/1725807744256/images/1727357512576',
                href: '{{ advisor.socialMedia.twitter }}',
                'padding-left': '12px',
                'padding-right': '0px',
                'padding-top': '0px',
                'padding-bottom': '0px',
              },
            },
            {
              data: {},
              type: 'standard-social-element',
              children: [
                {
                  text: '',
                },
              ],
              attributes: {
                src: 'https://dev-cdn.finpace.com/public/advisors/23a4d076-2f38-42e0-9971-dce5a1970f2c/email-templates/1725807744256/images/1727357529380',
                href: '{{ advisor.socialMedia.youtube }}',
                'padding-left': '12px',
                'padding-right': '0px',
                'padding-top': '0px',
                'padding-bottom': '0px',
              },
            },
          ],
        },
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
