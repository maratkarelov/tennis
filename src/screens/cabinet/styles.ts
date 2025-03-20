import {StyleSheet} from 'react-native';
import {baseColor} from '../../theme/appTheme';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent:'space-between',
    backgroundColor:baseColor.yellow_10
  },
  sign_out_text: {
    fontSize: 13,
    marginRight: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: baseColor.black,
    paddingVertical: 4,
    paddingHorizontal: 10,
    color: baseColor.darkBlue,
  },
  phoneContainer: {
    alignItems:'center',
    flexDirection:'row',
    paddingHorizontal: 20,
    marginVertical: 20,
    borderTopColor: baseColor.gray_10,
    borderTopWidth: 1,
    paddingVertical: 10,
    borderBottomColor: baseColor.gray_10,
    borderBottomWidth: 1,
  },
  row:{
    alignItems:'center',
    flexDirection:'row'
  },
  monthChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    textAlign: 'center',
    color: baseColor.gray_hint,
    marginBottom: 10,
  },
  taskStatChartContainer: {
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendItem: {
    marginVertical:5,
    flexDirection: 'row',
    alignItems: 'center',
    color:baseColor.gray_hint,
    fontSize:16
  },
  legendItemText: {
    color:baseColor.black,
    fontSize:16,
  },
  occupancyText:{
    marginTop:20,
    color:baseColor.sky,
    fontSize:16,

  },
  monthItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: baseColor.light_gray_2,
  },
  monthSelectorContainer: {
    paddingHorizontal: 10,
    backgroundColor: baseColor.white,
    borderRadius: 8,
    flexGrow: 0,
    elevation: 10,
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  monthItemText: {
    fontSize: 16,
    color: baseColor.sky,
  },
  monthText: {
    fontSize: 16,
    paddingHorizontal: 20,
    color: baseColor.sky,
  },
  open_support_chat:{
    color:baseColor.sky,
    textAlign:'center',
    marginLeft:20
  }
});
