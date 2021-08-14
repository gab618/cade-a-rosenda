import { Container, Footer } from "./styles";
import { MdFavorite } from "react-icons/md";

function BaseLayout({ children }) {
  return (
    <Container>
      {children}
      <Footer>
        <p>
          Made with
          <a href="/">
            <MdFavorite />
          </a>{" "}
          by <a href="https://github.com/gab618">Gabriel Rocha</a>
        </p>
      </Footer>
    </Container>
  );
}

export default BaseLayout;
