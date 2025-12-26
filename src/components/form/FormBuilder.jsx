import PropTypes from 'prop-types';
import { FormBuilder } from '@formio/react';
import './scoped-styles.scss';
import { useState } from 'react';

export default function BitsyFormBuilder({ onChange, components = [], onComponentUpdate }) {
  const [formBuilder, setFormBuilder] = useState(JSON.parse(JSON.stringify(components)));
  return (
    <div className="use-bootstrap use-formio">
      <FormBuilder
        options={{
          builder: {
            advanced: {
              components: {
                currency: false,
              },
            },
          },
        }}
        form={{
          display: 'wizard',
          ...(formBuilder &&
            formBuilder.length > 0 && {
              components: formBuilder,
            }),
        }}
        onChange={(schema) => {
          onChange(schema.components);
          setFormBuilder(schema.components);
        }}
        onSaveComponent={(e) => onComponentUpdate(e)}
        onDeleteComponent={(e) => onComponentUpdate(e)}
        onUpdateComponent={(e) => onComponentUpdate(e)}
      />
    </div>
  );
}

BitsyFormBuilder.propTypes = {
  onChange: PropTypes.func.isRequired,
};
