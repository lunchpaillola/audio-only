import React from "react";
import styled from "styled-components";

const MoreIcon = () => {
  return (
    <IconWrapper>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 12C8 10.8954 7.10457 10 6 10C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14C7.10457 14 8 13.1046 8 12ZM14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12ZM18 10C19.1046 10 20 10.8954 20 12C20 13.1046 19.1046 14 18 14C16.8954 14 16 13.1046 16 12C16 10.8954 16.8954 10 18 10Z"
          fill="#fff"
        />
      </svg>
    </IconWrapper>
  );
};

const IconWrapper = styled.div`
  padding: 4px;
  border-radius: 24px;
  display: inline-block; /* To properly size the wrapper around the SVG */

  svg {
    display: block; /* To prevent extra space below the SVG */
  }
`;

export default MoreIcon;
