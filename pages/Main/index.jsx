import Link from "next/link";
import dynamic from "next/dynamic";
import styled from "styled-components";
import nurse from "../../lotties/super-nurse-animation.json";
import restingGirl from "../../lotties/resting.json";

const Lottie = dynamic(
  () => import("lottie-react").then((module) => module.Lottie),
  { ssr: false }
);

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
  return (
    <Content>
      <h2>Hoje Rosenda está no</h2>
      <h1>{dayOff ? "conforto do lar" : hospital}</h1>
      <Lottie
        src={dayOff ? restingGirl : nurse}
        loop
        autoplay
        speed={0.6}
        rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
        style={{ height: 300, width: 300 }}
      />
      <Link href="/schedule">📅</Link>
    </Content>
  );
}
