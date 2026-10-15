import BaseLayout from "../components/BaseLayout";
import Main from "./Main";
import { readSchedule } from "../lib/gist";
import {
  getDayStatus,
  sanitizeSchedule,
  todayKeyInSaoPaulo,
} from "../lib/schedule";

export async function getServerSideProps() {
  const hospital = "Pirituba";
  const today = todayKeyInSaoPaulo();

  let schedule = sanitizeSchedule({});
  try {
    schedule = await readSchedule();
  } catch (err) {
    // Se o gist falhar, segue só com a escala 12x36.
    console.error(err);
  }

  return {
    props: {
      status: getDayStatus(today, schedule),
      hospital,
    },
  };
}

export default function Home({ status, hospital }) {
  return (
    <BaseLayout>
      <Main status={status} hospital={hospital} />
    </BaseLayout>
  );
}
