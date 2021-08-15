import styled from "styled-components";

export const Content = styled.header`
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
