import UploadBox from 'components/upload/UploadBox';
import { UploadProps } from 'components/upload/type';
import { Controller, useFormContext } from 'react-hook-form';

interface Props extends Omit<UploadProps, 'file'> {
  name: string;
  multiple?: boolean;
}

export function RHFUploadBox({ name, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <UploadBox files={field.value} error={!!error} {...other} />
      )}
    />
  );
}
