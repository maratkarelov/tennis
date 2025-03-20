import {StyleSheet} from 'react-native';
import {baseColor} from '../../theme/appTheme';

export default StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    backgroundColor: baseColor.white,
    padding: 12,
  },
  item_row: {
    flexDirection: 'row',
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
    borderBottomColor: baseColor.light_gray_1,
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 8,
  },
  refresh: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: 20,
    backgroundColor: baseColor.white,
    borderRadius: 16,
    alignItems: 'center',
  },
  showed: {
    backgroundColor: baseColor.white,
    borderRadius: 16,
    textAlign: 'center',
    color: baseColor.blue,
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,

  }
});
