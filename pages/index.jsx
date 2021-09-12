import BaseLayout from "../components/BaseLayout";
import Main from "./Main";
import api from "../services/api";

export async function getServerSideProps() {
  const response = await api.get("schedule");
  let schedule = [];

  response.data.forEach((month) => {
    const { daysOff } = month;
    schedule = [...schedule, ...daysOff];
  });

  return {
    props: {
      schedule,
    },
  };
}

export default function Home({ schedule }) {
  return (
    <BaseLayout>
      <Main schedule={schedule} />
    </BaseLayout>
  );
}
