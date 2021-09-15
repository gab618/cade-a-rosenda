import BaseLayout from "../components/BaseLayout";
import Calendar from "../components/Calendar";

export default function Schedule({ daysOff }) {
  return (
    <BaseLayout>
      <Calendar />
    </BaseLayout>
  );
}
