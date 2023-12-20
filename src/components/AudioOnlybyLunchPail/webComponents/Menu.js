/* eslint-disable react/prop-types */
import styled from "styled-components";
import theme from "../theme";
import React from "react";

const Menu = ({ options, setIsVisible }) => {
  return (
    <Container>
      {(options || []).map((o, i) => (
        <Option
          key={i}
          warning={o.warning}
          onClick={() => {
            o.action();
            setIsVisible(false);
          }}
        >
          {o.text}
        </Option>
      ))}
    </Container>
  );
};

const Container = styled.ul`
  display: flex;
  flex-direction: column;
  background-color: #1F2D3D ;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.04), 0px 0px 4px rgba(0, 0, 0, 0.08);
  margin: 0;
  padding: 8px 0;
  width: 128px;
  height: 104px;
`;
const Option = styled.li`
  list-style: none;
  font-size: 12px;
  text-align: center;
  color: ${(props) =>
    props.warning ? theme.colors.redDark : theme.colors.white};
  line-height: 16px;
  padding: 8px;

  &:hover {
    background-color: ${theme.colors.greyLight};
    color: ${(props) =>
    props.warning ? theme.colors.redDark : "#1F2D3D"};
    cursor: pointer;
  }
`;

export default Menu;