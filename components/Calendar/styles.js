import styled, { css, keyframes } from "styled-components";

export const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  padding: 16px 0;
  width: 100%;
  max-width: 440px;
  margin: 0 auto;

  h1 {
    font-size: 28px;
    margin-bottom: 4px;
  }
`;

export const Hint = styled.p`
  font-size: 14px;
  opacity: 0.85;
  margin-bottom: 16px;
`;

export const MonthHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 12px;

  h2 {
    font-size: 22px;
    font-weight: 600;
    text-transform: capitalize;
  }

  button {
    color: #fff;
    font-size: 28px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  width: 100%;
`;

export const WeekDay = styled.span`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.8;
  padding-bottom: 4px;
`;

export const Day = styled.button`
  aspect-ratio: 1;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: transform 0.1s, background 0.2s;
  -webkit-tap-highlight-color: transparent;

  small {
    font-size: 11px;
    line-height: 1;
  }

  ${({ $kind }) =>
    $kind === "work" &&
    css`
      background: #fff;
      color: #8a2387;
      cursor: pointer;
      &:active {
        transform: scale(0.92);
      }
    `}

  ${({ $kind }) =>
    $kind === "extra" &&
    css`
      background: #2ecc71;
      color: #fff;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      &:active {
        transform: scale(0.92);
      }
    `}

  ${({ $kind }) =>
    $kind === "scheduled" &&
    css`
      background: rgba(255, 255, 255, 0.12);
      border: 1px dashed rgba(255, 255, 255, 0.5);
      color: rgba(255, 255, 255, 0.75);
      cursor: default;
    `}

  ${({ $brasilia }) =>
    $brasilia &&
    css`
      border: 3px solid #1e90ff;
    `}

  &:disabled {
    cursor: default;
  }

  ${({ $past }) =>
    $past &&
    css`
      opacity: 0.45;
    `}

  ${({ $today }) =>
    $today &&
    css`
      outline: 3px solid #ffd166;
      outline-offset: 1px;
    `}
`;

export const Empty = styled.span``;

export const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  font-size: 13px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  i {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    display: inline-block;
  }
`;

export const Swatch = styled.i`
  ${({ $kind }) =>
    $kind === "work" &&
    css`
      background: #fff;
    `}
  ${({ $kind }) =>
    $kind === "extra" &&
    css`
      background: #2ecc71;
    `}
  ${({ $kind }) =>
    $kind === "scheduled" &&
    css`
      background: rgba(255, 255, 255, 0.12);
      border: 1px dashed rgba(255, 255, 255, 0.6);
    `}
  ${({ $kind }) =>
    $kind === "brasilia" &&
    css`
      border: 3px solid #1e90ff;
    `}
`;

export const Warning = styled.p`
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.2);
`;

export const CornerLink = styled.span`
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 16px;
  font-size: 24px;
  cursor: pointer;
  color: #fff;
  opacity: ${({ $faded }) => ($faded ? 0.35 : 1)};
`;

export const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 16px;
`;

export const Status = styled.p`
  font-size: 13px;
  min-height: 18px;
  opacity: 0.9;
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const RefreshButton = styled.button`
  color: #fff;
  font-size: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }

  svg {
    ${({ $spinning }) =>
      $spinning &&
      css`
        animation: ${spin} 0.8s linear infinite;
      `}
  }
`;

export const PinForm = styled.form`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  align-items: center;
`;

export const Button = styled.button`
  height: 40px;
  padding: 0 1.2em;
  border-radius: 2em;
  font-weight: 600;
  color: #ffffff;
  background-color: #4eb5f1;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4095c6;
  }
`;

export const Input = styled.input`
  height: 40px;
  width: 140px;
  padding: 0 1em;
  border-radius: 2em;
  color: #333;
  background-color: #fff;
  text-align: center;
  font-size: 16px;
`;

export const ArrowWrapper = styled.span`
  position: fixed;
  bottom: 0;
  right: 0;
  padding: 16px;
  font-size: 24px;
  cursor: pointer;
  color: #fff;
`;
