import BaseLayout from "../components/BaseLayout";
import Calendar from "../components/Calendar";
import api from "../services/api";

export async function getServerSideProps() {
  const year = new Date().getFullYear();
  const response = await api.get(`schedule/${year}`);
  const { daysOff } = response.data;

  return {
    props: {
      daysOff,
    },
  };
}

export default function Schedule({ daysOff }) {
  return (
    <BaseLayout>
      <Calendar daysOff={daysOff} />
    </BaseLayout>
  );
}
