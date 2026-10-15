import BaseLayout from "../components/BaseLayout";
import Main from "./Main";
import { readDaysOff } from "../lib/gist";
import { isDayOff, todayKeyInSaoPaulo } from "../lib/schedule";

export async function getServerSideProps() {
  const hospital = "Pirituba";
  const today = todayKeyInSaoPaulo();

  let extraDaysOff = [];
  try {
    extraDaysOff = await readDaysOff();
  } catch (err) {
    // Se o gist falhar, segue só com a escala 12x36.
    console.error(err);
  }

  return {
    props: {
      dayOff: isDayOff(today, extraDaysOff),
      hospital,
    },
  };
}

export default function Home({ dayOff, hospital }) {
  return (
    <BaseLayout>
      <Main dayOff={dayOff} hospital={hospital} />
    </BaseLayout>
  );
}
