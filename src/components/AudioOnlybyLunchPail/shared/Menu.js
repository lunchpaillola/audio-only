/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import theme from './theme'; // Ensure you have a similar theme setup for React Native

const Menu = ({options, setIsVisible}) => {
  return (
    <View style={styles.container}>
      {(options || []).map((o, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.option, o.warning && styles.warning]}
          onPress={() => {
            o.action();
            setIsVisible(false);
          }}>
          <Text
            style={{
              textAlign: 'center',
              color: o.warning ? theme.colors.redDark : theme.colors.white,
            }}>
            {o.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: '#1F2D3D',
    paddingVertical: 8,
    width: 128,
    height: 104,
  },
  option: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    padding: 8,
  },
  warning: {
    // Define specific styles for warning state if needed
  },
});

export default Menu;
