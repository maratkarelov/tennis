import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    width: '100%',
    height: '100%',
    borderWidth: 4,
    opacity: 0.25,
  },
  progress: {
    width: '100%',
    height: '100%',
    borderLeftColor: 'rgba(255, 255, 255, 1)',
    borderRightColor: 'rgba(255, 255, 255, 1)',
    borderBottomColor: 'rgba(255, 255, 255, 1)',
    borderWidth: 4,
    position: 'absolute',
  },
});
