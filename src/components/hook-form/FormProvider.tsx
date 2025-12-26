// form
import { KeyboardEvent } from 'react';
import { FormProvider as Form, UseFormReturn } from 'react-hook-form';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  methods: UseFormReturn<any>;
  onSubmit?: VoidFunction;
};

export default function FormProvider({ children, onSubmit, methods }: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    const { key, target } = e;

    if (key !== 'Enter' || target instanceof HTMLTextAreaElement) {
      return;
    }

    e.preventDefault();
  };

  return (
    <Form {...methods}>
      <form onSubmit={onSubmit} onKeyDown={handleKeyDown}>
        {children}
      </form>
    </Form>
  );
}
