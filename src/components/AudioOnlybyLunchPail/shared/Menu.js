import React, {useRef} from 'react';
import {StyleSheet, Pressable, Text} from 'react-native';
import {Menu, MenuItem} from 'react-native-material-menu';
import theme from './theme';
import {participantStyles} from './participantStyles';
import MoreIcon from "../icons/MoreIcon";

const ActionMenu = ({options, setIsVisble}) => {
  const menuRef = useRef(null);

  return (
    <Menu
      animationDuration={0}
      visible={true}
     >
      {options.map((o, i) => (
        <MenuItem
          key={i}
          onPress={() => {
            o.action();
          }}>
          <Text
            style={[styles.text, o.warning && {color: theme.colors.redDark}]}>
            {o.text}
          </Text>
        </MenuItem>
      ))}
    </Menu>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: theme.fontSize.large,
    color: theme.colors.blueDark,
    paddingVertical: 6,
    paddingHorizontal: 16,
    flexWrap: 'nowrap',
  },
});

export default ActionMenu;