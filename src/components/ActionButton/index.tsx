import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {baseColor} from '../../theme/appTheme';
import LoadingSpinner from '../LoadingSpinner';
import Styles from '../ActionButton/styles';
import {disableColor} from '../../tools/common';

export default function ActionButton(props: {
  styles?;
  onPress: any;
  title: string;
  backgroundColor?: string;
  textColor?: string;
  disable?: boolean;
  isLoading?: boolean;
}) {
  const {onPress, title} = props;

  const renderContent = () => {
    if (props.isLoading) {
      return <LoadingSpinner color={baseColor.gray_30} />;
    }

    return (
      <Text
        adjustsFontSizeToFit={true}
        style={[Styles.text, {color: props.textColor ?? baseColor.white}]}>
        {title}
      </Text>
    );
  };
  return (
    <TouchableOpacity
      style={[
        props.styles,
        Styles.button,
        {
          backgroundColor: props.disable
            ? disableColor(props.backgroundColor ?? baseColor.sky)
            : props.backgroundColor ?? baseColor.sky,
        },
      ]}
      onPress={onPress}
      disabled={props.disable || props.isLoading}>
      {renderContent()}
    </TouchableOpacity>
  );
}
