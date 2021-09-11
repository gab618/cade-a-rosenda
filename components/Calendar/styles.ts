import styled from "styled-components";

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  padding: 0 16px;

  h1 {
    margin-bottom: 8px;
  }
`;

export const ArrowWrapper = styled.span`
  position: fixed;
  bottom: 0;
  right: 0;
  padding: 16px;
  font-size: 24px;
  cursor: pointer;
`;

export const Button = styled.button`
  height: 40px;
  display: inline-block;
  padding: 0.3em 1.2em;
  margin: 0 0.3em 0.3em 0;
  border-radius: 2em;
  box-sizing: border-box;
  text-decoration: none;
  font-family: "Roboto", sans-serif;
  font-weight: 300;
  color: #ffffff;
  background-color: #4eb5f1;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    background-color: #4095c6;
  }
`;

export const Input = styled.input`
  height: 25px;
  /* width: fit-content; */
  display: inline-block;
  padding: 0.3em 1.2em;
  margin: 1.2em 0 1.2em 0;
  border-radius: 2em;
  box-sizing: border-box;

  font-family: "Roboto", sans-serif;
  font-weight: 300;
  color: #333;
  background-color: #fff;
  text-align: center;
  transition: all 0.2s;
`;
