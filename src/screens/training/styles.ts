import {StyleSheet} from 'react-native';
import {baseColor} from "../../theme/appTheme";

export default StyleSheet.create({
    input: {
        backgroundColor: baseColor.white,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: baseColor.light_gray_2,
        paddingVertical: 5,
        borderRadius: 10,
    },
    inputText: {
        fontSize: 18,
        textAlign: 'center',
        paddingVertical: 0,
        color: baseColor.blue
    },
    hint: {
        textAlign: 'center',
        color: baseColor.gray_hint
    },
    commentInput: {
        fontStyle: 'italic',
        color: baseColor.gray,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginTop: 10,
        backgroundColor: baseColor.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: baseColor.light_gray_1,
    },
    dropdownButtonStyle: {
        width: '50%',
        height: 50,
        backgroundColor: '#E9ECEF',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
    },
    dropdownButtonArrowStyle: {
        fontSize: 28,
    },
    dropdownButtonIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
    dropdownMenuStyle: {
        backgroundColor: '#E9ECEF',
        borderRadius: 8,
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dropdownItemTxtStyle: {
        textAlign: 'center',
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
    },

});
