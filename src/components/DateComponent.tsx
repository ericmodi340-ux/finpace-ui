// utils
import { fDate } from 'utils/formatTime';

// ----------------------------------------------------------------------

type Props = {
  date: string;
  format?: string;
};

export default function DateComponent({ date, format = 'MMMM d, yyyy' }: Props) {
  return <>{date ? fDate(new Date(date), format) : 'No Date Yet'}</>;
}
