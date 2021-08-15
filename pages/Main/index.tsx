import { useEffect, useState } from "react";
import { differenceInDays } from "date-fns";
import useWindowSize from "react-use/lib/useWindowSize";
import Lottie from "react-lottie";
import nurse from "../../lotties/super-nurse-animation.json";
import { Content } from "./styles";

export default function Main() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [cachoeirinhaFirstDay] = useState(new Date(2021, 7, 14));
  const [days, setDays] = useState(0);
  const [hospital, setHospital] = useState("");

  const { height } = useWindowSize();

  function lottieOptions(data) {
    return {
      loop: true,
      autoplay: true,
      animationData: data,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };
  }

  useEffect(() => {
    setDays(differenceInDays(currentDateTime, cachoeirinhaFirstDay));
  }, [currentDateTime, cachoeirinhaFirstDay]);

  useEffect(() => {
    if (days % 2 === 0) {
      setHospital("Cachoeirinha");
    } else {
      setHospital("Pirituba");
    }
  }, [days]);

  return (
    <Content>
      <h2>Hoje Rosenda está no</h2>
      <h1>{hospital}</h1>
      <Lottie
        options={lottieOptions(nurse)}
        height={height / 2.5}
        width={height / 2.5}
        isStopped={false}
        isPaused={false}
        speed={0.6}
      />
    </Content>
  );
}
