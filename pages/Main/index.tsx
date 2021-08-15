import { useEffect, useState } from "react";
import { differenceInDays } from "date-fns";
import styled from "styled-components";
import Lottie from "react-lottie";
import nurse from "../../lotties/super-nurse-animation.json";

const Content = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  h2 {
    font-size: 56px;
    font-weight: 400;
  }
  h1 {
    font-size: 80px;
    font-weight: 700;
    white-space: nowrap;
    margin-bottom: 16px;
  }

  @media (max-width: 600px) {
    h2 {
      font-size: 32px;
    }
    h1 {
      font-size: 64px;
    }
  }
`;

export default function Main() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [cachoeirinhaFirstDay] = useState(new Date(2021, 7, 14));
  const [days, setDays] = useState(0);
  const [hospital, setHospital] = useState("");

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
        height={300}
        width={300}
        isStopped={false}
        isPaused={false}
        speed={0.6}
      />
    </Content>
  );
}
