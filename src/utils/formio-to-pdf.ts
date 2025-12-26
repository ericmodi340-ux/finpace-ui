// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake.min';
// @ts-ignore
import pdfFonts from './vfs_fonts';

import { FormBuilderFieldsMapping } from '../@types/template';
import { get, startCase } from 'lodash';

pdfMake.vfs = pdfFonts;
interface SubmissionData {
  [key: string]: string | number | undefined;
}

interface DocumentDefinition {
  content: any[];
  styles: {
    [key: string]: {
      [key: string]: any;
    };
  };
  defaultStyle: {
    columnGap: number;
  };
  footer?: any;
  header?: any;
}

// Component renderers
const renderTextField = (component: FormBuilderFieldsMapping, data: SubmissionData) => ({
  alignment: 'justify',
  columns: [
    {
      text: component.label,
      bold: true,
    },
    {
      text: get(data, component.key) || '- - -',
    },
  ],
  margin: [0, 5],
});

const renderSelect = (component: FormBuilderFieldsMapping, data: SubmissionData) => ({
  alignment: 'justify',
  columns: [
    {
      text: component.label,
      bold: true,
    },
    {
      text: startCase(String(get(data, component.key) || '')) || '- - -',
    },
  ],
  margin: [0, 5],
});

const renderCurrency = (component: FormBuilderFieldsMapping, data: SubmissionData) => ({
  alignment: 'justify',
  columns: [
    {
      text: component.label,
      bold: true,
    },
    {
      text: String(get(data, component.key) || '').includes('$')
        ? get(data, component.key)
        : `${get(data, component.key) ? `$${get(data, component.key)}` : '- - -'}`,
    },
  ],
  margin: [0, 5],
});

const renderSignature = (component: FormBuilderFieldsMapping, data: SubmissionData) => [
  {
    text: component.label,
    bold: true,
    margin: [0, 5],
  },
  get(data, component.key)
    ? {
        image: get(data, component.key),
        width: 200,
        margin: [0, 5],
      }
    : {
        text: '- - -',
        margin: [0, 20, 0, 5],
      },
];

const renderColumns = (component: FormBuilderFieldsMapping, data: SubmissionData) => [
  ...component.columns.flatMap((column: any) =>
    column.components.flatMap((nestedComponent: any) =>
      // @ts-ignore
      renderComponent(nestedComponent, data)
    )
  ),
];

const renderTable = (component: FormBuilderFieldsMapping, data: SubmissionData) =>
  component.rows.flatMap((row: any[]) =>
    row.map((cell: any) => [
      ...cell.components.flatMap((nestedComponent: any) =>
        // @ts-ignore
        renderComponent(nestedComponent, data)
      ),
    ])
  );

const renderSelectBoxes = (component: FormBuilderFieldsMapping, data: SubmissionData) => ({
  alignment: 'justify',
  columns: [
    {
      text: component.label,
      bold: true,
    },
    {
      text: component.values.map((option: any) =>
        get(data, `${component.key}.${option.value}`)
          ? { text: `${option.label} * \n`, bold: true }
          : `${option.label} \n`
      ),
    },
  ],
  margin: [0, 5],
});

const componentRenderers: {
  [key: string]: (component: FormBuilderFieldsMapping, data: SubmissionData) => any;
} = {
  selectboxes: renderSelectBoxes,
  table: renderTable,
  textfield: renderTextField,
  email: renderTextField,
  textarea: renderTextField,
  password: renderTextField,
  phoneNumber: renderTextField,
  number: renderTextField,
  currency: renderCurrency,
  currencyCustomComp: renderCurrency,
  datetime: renderTextField,
  day: renderTextField,
  time: renderTextField,
  select: renderSelect,
  signature: renderSignature,
  columns: renderColumns,
};

// Recursive component rendering
const renderComponent = (
  component: FormBuilderFieldsMapping,
  submission: SubmissionData
): any[] => {
  // Check for nested components first
  if (component.components) {
    if (component.type === 'well') {
      return [
        ...component.components.flatMap((nestedComponent) =>
          // @ts-ignore
          renderComponent(nestedComponent, submission)
        ),
      ];
    }

    if (component.type === 'datagrid') {
      if (get(submission, component.key) && Array.isArray(get(submission, component.key))) {
        return [
          {
            margin: [0, 10],
            ol: (get(submission, component.key, []) as any[])?.map((obj: any) =>
              Object.keys(obj).map((key: string) => ({
                alignment: 'justify',
                columns: [
                  {
                    text: startCase(key),
                  },
                  {
                    text: obj[key],
                  },
                ],
                margin: [0, 5],
              }))
            ),
          },
        ];
      }

      return [];
    }

    if (component.type === 'fieldset') {
      return [
        {
          text: component.legend,
          bold: true,
          fontSize: 14,
          margin: [0, 8],
        },
        ...component.components.flatMap((nestedComponent) =>
          // @ts-ignore
          renderComponent(nestedComponent, submission)
        ),
      ];
    }

    if (
      component.title &&
      String(component.label || '')
        .toLowerCase()
        .includes('page') &&
      !String(component.key || '')
        .toLowerCase()
        .endsWith('-hidefrompdf')
    ) {
      return [
        {
          text: component.title,
          style: 'subheader',
        },
        ...component.components.flatMap((nestedComponent) =>
          // @ts-ignore
          renderComponent(nestedComponent, submission)
        ),
      ];
    }

    return [
      ...component?.components?.flatMap((nestedComponent) =>
        // @ts-ignore
        renderComponent(nestedComponent, submission)
      ),
    ];
  }

  if (
    component?.hidden ||
    String(component?.key || '')
      .toLowerCase()
      .endsWith('-hidefrompdf') ||
    component?.properties?.hidefrompdf === 'true'
  ) {
    return [];
  }

  // Render the current component
  const renderer = componentRenderers[component.type];
  if (renderer) {
    return [renderer(component, submission)];
  }

  if (
    typeof get(submission, component.key) === 'string' ||
    typeof get(submission, component.key) === 'number'
  ) {
    return [renderTextField(component, submission)];
  }

  return [];
};

// Document definition generator
export const generateDocumentDefinition = (
  components: FormBuilderFieldsMapping[],
  submission: SubmissionData,
  data: {
    title: string;
    advisorName: string;
    firmName: string;
    clientName: string;
    createdAt: string;
    firmLogoBase64: string;
  }
): DocumentDefinition => ({
  content: [
    {
      text: data.title,
      style: 'header',
    },
    {
      columns: [
        [
          {
            columns: [
              {
                width: 100,
                text: 'Advisor Name',
                bold: true,
              },
              {
                text: data.advisorName,
              },
            ],
            margin: [0, 3],
          },
          {
            columns: [
              {
                width: 100,
                text: 'Firm Name',
                bold: true,
              },
              {
                text: data.firmName,
              },
            ],
            margin: [0, 3],
          },
          {
            columns: [
              {
                width: 100,
                text: 'Client Name',
                bold: true,
              },
              {
                text: data.clientName,
              },
            ],
            margin: [0, 3],
          },
          {
            columns: [
              {
                width: 100,
                text: 'Date',
                bold: true,
              },
              {
                text: data.createdAt,
              },
            ],
            margin: [0, 3],
          },
        ],
        data.firmLogoBase64
          ? {
              image: data.firmLogoBase64,
              width: 50,
            }
          : {
              text: '',
            },
      ],
      margin: [0, 3, 0, 20],
    },

    ...components.flatMap((component) => renderComponent(component, submission)),
  ],
  styles: {
    header: {
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 15],
    },
    subheader: {
      fontSize: 16,
      bold: true,
      margin: [0, 15, 0, 5],
    },
    tableExample: {
      margin: [0, 5, 0, 15],
    },
    tableHeader: {
      bold: true,
      fontSize: 13,
      color: 'black',
    },
  },
  defaultStyle: {
    columnGap: 40,
  },
});

export const exportToPdf = async (
  template: FormBuilderFieldsMapping[],
  initialSubmission: SubmissionData,
  data: {
    title: string;
    advisorName: string;
    firmName: string;
    clientName: string;
    createdAt: string;
    firmLogoBase64: string;
  }
) => {
  const docDefinition = generateDocumentDefinition(template, initialSubmission, data);
  pdfMake.createPdf(docDefinition).open();
};
