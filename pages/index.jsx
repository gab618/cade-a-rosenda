import { differenceInDays, format } from "date-fns";
import BaseLayout from "../components/BaseLayout";
import Main from "./Main";
import api from "../services/api";

export async function getServerSideProps() {
  const currentDateTime = new Date();
  const cachoeirinhaFirstDay = new Date(2021, 7, 14);
  const days = differenceInDays(currentDateTime, cachoeirinhaFirstDay);
  let hospital = "";

  if (days % 2 === 0) {
    hospital = "Cachoeirinha";
  } else {
    hospital = "Pirituba";
  }

  const response = await api.get("schedule");
  let schedule = [];

  response.data.forEach((month) => {
    const { daysOff } = month;
    schedule = [...schedule, ...daysOff];
  });

  const formattedDate = format(currentDateTime, "yyyy-MM-dd");
  const dayOff = schedule.includes(formattedDate);

  console.log(schedule);
  console.log(formattedDate);
  console.log(dayOff);

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
