import StatsCards from '../components/StatsCards';
import Reminders from '../components/Reminders';
import type { GuRecord } from '../types';

interface Props {
  records: GuRecord[];
}

export default function DashboardPage({ records }: Props) {
  return (
    <>
      <StatsCards records={records} />
      <Reminders records={records} />
    </>
  );
}
