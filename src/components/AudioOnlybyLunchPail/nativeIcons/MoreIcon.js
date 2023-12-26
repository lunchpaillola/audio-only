import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

const MoreIcon = () => {
  return (
    <View style={{ padding: 4, borderRadius: 24 }}>
      <Svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 12C8 10.8954 7.10457 10 6 10C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14C7.10457 14 8 13.1046 8 12ZM14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12ZM18 10C19.1046 10 20 10.8954 20 12C20 13.1046 19.1046 14 18 14C16.8954 14 16 13.1046 16 12C16 10.8954 16.8954 10 18 10Z"
          fill="#fff"
        />
      </Svg>
    </View>
  );
};

export default MoreIcon;
