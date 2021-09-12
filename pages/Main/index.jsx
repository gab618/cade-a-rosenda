import Link from "next/link";
import styled from "styled-components";
import Lottie from "react-lottie";
import nurse from "../../lotties/super-nurse-animation.json";
import restingGirl from "../../lotties/resting.json";

const Content = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  h2 {
    font-size: 56px;
    font-weight: 400;
  }

  h1 {
    font-size: 80px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  a {
    position: fixed;
    bottom: 0;
    right: 0;
    padding: 16px;
    font-size: 24px;
    cursor: pointer;
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

export default function Main({ hospital, dayOff }) {
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

  return (
    <Content>
      <h2>Hoje Rosenda está no</h2>
      <h1>{dayOff ? "conforto do lar" : hospital}</h1>
      <Lottie
        options={lottieOptions(dayOff ? restingGirl : nurse)}
        height={300}
        width={300}
        isStopped={false}
        isPaused={false}
        speed={0.6}
      />
      <Link href="/schedule">📅</Link>
    </Content>
  );
}
