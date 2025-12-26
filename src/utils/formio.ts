import { Components } from '@formio/react';
import bitsyCustomComponents from '../components/form/custom/bitsy';

// ----------------------------------------------------------------------

export function setCustomComponents() {
  Components.setComponents(bitsyCustomComponents);
}
