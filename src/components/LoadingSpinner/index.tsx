import React, {useRef, useEffect} from 'react';
import {View, Animated, Easing} from 'react-native';
import Styles from './styles';
import type {IProps} from './types';

const startRotationAnimation = (
  durationMs: number,
  rotationDegree: Animated.Value,
): void => {
  Animated.loop(
    Animated.timing(rotationDegree, {
      toValue: 360,
      duration: durationMs,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  ).start();
};

const LoadingSpinner = ({color, durationMs = 1000, size = 24}: IProps) => {
  const rotationDegree = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startRotationAnimation(durationMs, rotationDegree);
  }, [durationMs, rotationDegree]);

  return (
    <View style={[Styles.container, {width: size, height: size}]}>
      <View
        style={[Styles.background, {borderColor: color, borderRadius: size}]}
      />
      <Animated.View
        style={[
          Styles.progress,
          {borderTopColor: color, borderRadius: size},
          {
            transform: [
              {
                rotateZ: rotationDegree.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

export default LoadingSpinner;
