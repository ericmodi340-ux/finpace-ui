export const initialTemplate = {
  subject: 'New Email',
  content: {
    attributes: {
      'background-color': '#ffffff',
      'content-background-color': '#ffffff',
      width: '850px',
    },
    type: 'page',
    data: {
      breakpoint: '480px',
      globalAttributes: {
        'font-family': 'Arial, sans-serif',
      },
      blockAttributes: {
        'standard-paragraph': {
          'padding-left': '3px',
        },
      },
      categoryAttributes: {
        button: {
          'padding-left': '20px',
        },
      },
    },
    children: [
      {
        type: 'standard-section',
        data: {},
        attributes: {},
        children: [
          {
            type: 'standard-column',
            data: {},
            attributes: {
              width: '100%',
            },
            children: [
              {
                type: 'placeholder',
                data: {},
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
    ],
  },
};
