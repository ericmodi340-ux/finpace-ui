import PropTypes from 'prop-types';
import { FormBuilder } from '@formio/react';
import './scoped-styles.scss';
import { useEffect, useState } from 'react';

export default function PdfFormBuilder({
  onChange,
  pdfFormSchema,
}: {
  onChange: Function;
  pdfFormSchema: any;
}) {
  const [formBuilder, setFormBuilder] = useState(pdfFormSchema);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const submitButton = document.querySelector('button[name="data[submit]"]');

          if (submitButton) {
            submitButton.remove();
          }
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="use-bootstrap use-formio">
      <FormBuilder
        options={{
          noDefaultSubmitButton: false,
          builder: {
            pdf: false,
            customPdf: {
              title: 'Basic Components',
              default: true,
              weight: 0,
              components: {
                textfield: true,
                checkbox: true,
              },
            },
            custom: {
              title: 'Signature',
              weight: 10,
              components: {
                client1Signature: {
                  title: 'Client 1 Signature',
                  key: 'client1Signature',
                  icon: 'pencil',
                  schema: {
                    label: 'Client 1 Signautre',
                    type: 'signature',
                    key: 'signature',
                    input: true,
                    tags: ['client_1'],
                    overlay: {
                      height: 62,
                      width: 241,
                    },
                  },
                },
                client2Signature: {
                  title: 'Client 2 Signature',
                  key: 'client2Signature',
                  icon: 'pencil',
                  schema: {
                    label: 'Client 2 Signautre',
                    type: 'signature',
                    key: 'signature',
                    input: true,
                    tags: ['client_2'],
                  },
                },
                advisorSignature: {
                  title: 'Advisor Signature',
                  key: 'advisorSignature',
                  icon: 'pencil',
                  schema: {
                    label: 'Advisor Signature',
                    type: 'signature',
                    key: 'signature',
                    input: true,
                    tags: ['advisor'],
                  },
                },
                client1Initials: {
                  title: 'Client 1 Initials',
                  key: 'client1Initials',
                  icon: 'pencil',
                  schema: {
                    label: 'Client 1 Initials',
                    type: 'signature',
                    key: 'signature',
                    input: true,
                    properties: {
                      isInitials: 'true',
                    },
                    tags: ['client_1'],
                    overlay: {
                      height: 62,
                      width: 241,
                    },
                  },
                },
                client2Initials: {
                  title: 'Client 2 Initials',
                  key: 'client2Initials',
                  icon: 'pencil',
                  schema: {
                    label: 'Client 2 Initials',
                    type: 'signature',
                    key: 'signature',
                    input: true,
                    properties: {
                      isInitials: 'true',
                    },
                    tags: ['client_2'],
                    overlay: {
                      height: 62,
                      width: 241,
                    },
                  },
                },
                advisorInitials: {
                  title: 'Advisor Initials',
                  key: 'advisorInitials',
                  icon: 'pencil',
                  schema: {
                    label: 'Advisor Initials',
                    type: 'signature',
                    key: 'signature',
                    input: true,
                    properties: {
                      isInitials: 'true',
                    },
                    tags: ['advisor'],
                    overlay: {
                      height: 62,
                      width: 241,
                    },
                  },
                },
                client1DateSigned: {
                  title: 'Client 1 Date Signed',
                  key: 'client1DateSigned',
                  icon: 'calendar',
                  schema: {
                    label: 'Client 1 Date Signed',
                    type: 'datetime',
                    key: 'datetime',
                    input: true,
                    tags: ['client_1'],
                    properties: {
                      format: 'MM/dd/yyyy',
                    },
                    overlay: {
                      height: 62,
                      width: 241,
                    },
                  },
                },
                client2DateSigned: {
                  title: 'Client 2 Date Signed',
                  key: 'client2DateSigned',
                  icon: 'calendar',
                  schema: {
                    label: 'Client 2 Date Signed',
                    type: 'datetime',
                    key: 'datetime',
                    input: true,
                    tags: ['client_2'],
                    properties: {
                      format: 'MM/dd/yyyy',
                    },
                    overlay: {
                      height: 62,
                      width: 241,
                    },
                  },
                },
                advisorDateSigned: {
                  title: 'Advisor Date Signed',
                  key: 'advisorDateSigned',
                  icon: 'calendar',
                  schema: {
                    label: 'Advisor Date Signed',
                    type: 'datetime',
                    key: 'datetime',
                    input: true,
                    tags: ['advisor'],
                    properties: {
                      format: 'MM/dd/yyyy',
                    },
                    overlay: {
                      height: 62,
                      width: 241,
                    },
                  },
                },
                firmSignature: {
                  title: 'Firm Signature',
                  key: 'firmSignature',
                  icon: 'pencil',
                  schema: {
                    label: 'Firm Signature',
                    type: 'signature',
                    key: 'signature',
                    input: true,
                    tags: ['firm'],
                    overlay: {
                      height: 62,
                      width: 241,
                    },
                  },
                },
                firmInitials: {
                  title: 'Firm Initials',
                  key: 'firmInitials',
                  icon: 'pencil',
                  schema: {
                    label: 'Firm Initials',
                    type: 'signature',
                    key: 'signature',
                    input: true,
                    properties: {
                      isInitials: 'true',
                    },
                    tags: ['firm'],
                    overlay: {
                      height: 62,
                      width: 241,
                    },
                  },
                },
                firmDateSigned: {
                  title: 'Firm Date Signed',
                  key: 'firmDateSigned',
                  icon: 'calendar',
                  schema: {
                    label: 'Firm Date Signed',
                    type: 'datetime',
                    key: 'datetime',
                    input: true,
                    tags: ['firm'],
                    properties: {
                      format: 'MM/dd/yyyy',
                    },
                    overlay: {
                      height: 62,
                      width: 241,
                    },
                  },
                },
              },
            },
          },
          noNewEdit: true,
        }}
        form={{ ...formBuilder }}
        onChange={(schema: any) => {
          onChange(schema);
          setFormBuilder(schema);
        }}
      />
    </div>
  );
}

PdfFormBuilder.propTypes = {
  onChange: PropTypes.func.isRequired,
};

// {
//   "label": "Signature",
//   "height": "auto",
//   "tableView": false,
//   "validateWhenHidden": false,
//   "key": "signature",
//   "overlay": {
//     "page": 1,
//     "left": 217.125,
//     "top": 988.8125,
//     "width": 100,
//     "height": 20
//   },
//   "type": "signature",
//   "input": true
// }
