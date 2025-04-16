import {StyleSheet} from 'react-native';
import {baseColor} from '../../../theme/appTheme';

export default StyleSheet.create({
  container: {
    padding: 10,
    justifyContent:'space-between',
    backgroundColor:baseColor.yellow_10
  },

  row:{
    backgroundColor: baseColor.white,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius:10,
  },
  hint: {
    fontWeight:'600',
    color: baseColor.gray_middle,
    fontSize: 16,
    marginTop: 20,
  },
  text: {
    color: baseColor.black,
    backgroundColor: baseColor.white,
    borderColor: baseColor.light_gray_1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 4,
    fontSize: 16,
  },

});
