import { Form as FormioForm } from '@formio/react';
import { FormProps } from '@formio/react/lib/components/Form';

import './scoped-styles.scss';

export default function Form(props: FormProps) {
  // const theme = useTheme();

  return (
    <div className="use-bootstrap use-formio">
      <FormioForm {...props} />
    </div>
  );
}
