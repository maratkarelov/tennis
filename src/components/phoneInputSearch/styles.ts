import {StyleSheet} from 'react-native';
import {baseColor} from '../../theme/appTheme';

export default StyleSheet.create({
    rowStart: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    foundPhone: {
        alignItems:'center',
        backgroundColor: baseColor.white,
        paddingVertical: 5,
        marginTop:10,
        paddingHorizontal:10,
        flexDirection: 'row',
        justifyContent:'space-between',
        borderRadius:10,
        borderWidth:2,
        borderColor:baseColor.white
    },
    text_hint: {
        fontSize:14,
        color: baseColor.gray_hint,
    },
    text: {
        fontSize:14,
        color: baseColor.black,
    },
    avatar: {
        margin: 4,
        top: 1,
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    commentInput: {
        width:'80%',
        fontStyle:'italic',
        color:baseColor.gray,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: baseColor.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: baseColor.light_gray_1,
    },

});
