import BaseLayout from "../components/BaseLayout";
import Calendar from "../components/Calendar";

export default function Admin() {
  return (
    <BaseLayout>
      <Calendar mode="brasilia" />
    </BaseLayout>
  );
}
