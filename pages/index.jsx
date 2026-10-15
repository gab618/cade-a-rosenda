import { differenceInDays, format } from "date-fns";
import BaseLayout from "../components/BaseLayout";
import Main from "./Main";
import api from "../services/api";

export async function getServerSideProps() {
  process.env.TZ = "America/Sao_Paulo";
  const currentDateTime = new Date();
  const piritubaDay = new Date(2021, 7, 15);
  const days = differenceInDays(currentDateTime, piritubaDay);
  const hospital = "Pirituba";
  const isPiritubaDay = days % 2 === 1;

  const response = await api.get(`schedule/${currentDateTime.getFullYear()}`);
  let schedule = response.data.daysOff || [];

  const formattedDate = format(currentDateTime, "yyyy-MM-dd");
  const dayOff = isPiritubaDay || schedule.includes(formattedDate);

  return {
    props: {
      schedule,
      dayOff,
      hospital,
    },
  };
}

export default function Home({ schedule, dayOff, hospital }) {
  return (
    <BaseLayout>
      <Main dayOff={dayOff} hospital={hospital} />
    </BaseLayout>
  );
}
