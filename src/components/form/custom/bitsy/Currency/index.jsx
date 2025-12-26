import CurrencyComponent from 'formiojs/components/currency/Currency';

// ----------------------------------------------------------------------

/**
 * The Currency component
 *
 * Custom components for form.io need to have two things.
 * 1. The value should be stored in state as "value"
 * 2. When the value changes, call props.onChange(null, newValue);
 *
 * This component will save values in formatted number strings, as opposed to the number values saved by the default form.io Currency component
 */

export default class Currency extends CurrencyComponent {
  static schema(...extend) {
    return CurrencyComponent.schema(
      {
        type: 'currencyCustomComp',
        label: 'Currency',
        key: 'currency',
      },
      ...extend
    );
  }

  // Removes parseNumber from form.io number component default value setting
  getValueAt(index) {
    if (!this.refs.input.length || !this.refs.input[index]) {
      return null;
    }

    const val = this.refs.input[index].value;
    return val && val !== '-_' ? val : null;
  }
}
