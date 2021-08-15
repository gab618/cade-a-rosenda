import { Content } from "./styles";
import useWindowSize from "react-use/lib/useWindowSize";
import Lottie from "react-lottie";
import nurse from "../../lotties/super-nurse-animation.json";

export default function Main() {
  const { height } = useWindowSize();

  function options(data) {
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
      <h1>Cachoeirinha</h1>
      <Lottie
        options={options(nurse)}
        height={height / 2.5}
        width={height / 2.5}
        isStopped={false}
        isPaused={false}
        speed={0.6}
      />
    </Content>
  );
}
