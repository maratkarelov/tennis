import {StyleSheet} from 'react-native';
import {baseColor} from '../../../theme/appTheme';

export default StyleSheet.create({
  container: {
    flex:1,
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
    textAlign: 'center',
    color: baseColor.gray_middle,
    fontSize: 16,
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color:baseColor.gray_middle,
  },

  textBlue: {
    marginTop:5,
    fontSize: 16,
    fontWeight: '400',
    color:baseColor.blue,
  },

});
