import {StyleSheet} from 'react-native';
import {baseColor} from "../../../theme/appTheme";

export default StyleSheet.create({
    tripContainer: {
        padding:10,
    },
    input:{
        marginHorizontal:20,
        marginTop:30,
        backgroundColor:baseColor.white,
        paddingHorizontal:10,
        borderWidth:1,
        borderColor:baseColor.light_gray_2,
        paddingVertical:5,
        borderRadius:10,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    inputText:{
        fontSize:18,
        paddingVertical: 0,
        color:baseColor.blue
    },

});
