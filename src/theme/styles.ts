import {StyleSheet} from 'react-native';
import {baseColor} from "./appTheme";

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor:baseColor.yellow_10,
    },
    whiteBordered: {
        padding: 10,
        backgroundColor: baseColor.white,
        borderRadius: 10,
        borderColor: baseColor.light_gray_2,
        borderWidth: 1,
    },
    flex_between: {
        flex:1,
    },
    row: {
        flexDirection: 'row',
    },
    rowSpace: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    avatar: {
        width: 65,
        height: 65,
        borderRadius: 20,
    },
    text: {color: baseColor.black, fontSize: 16},
    textHint: {color: baseColor.gray_hint, fontSize: 16},
    textGray: {color: baseColor.gray_middle, fontSize: 16},
    textSecondary: {color: baseColor.secondary, fontSize: 16},
    addTask: {
        alignContent: 'center',
        width: 40,
        height: 40,
        position: 'absolute',
        bottom: 20,
        right: 20,
        borderRadius: 20,
        backgroundColor: baseColor.sky,
        shadowColor: baseColor.black,
        shadowOpacity: 0.8,
        shadowRadius: 5,
        shadowOffset: {
            height: 1,
            width: 0,
        },
    },
    input: {
        backgroundColor: baseColor.white,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: baseColor.light_gray_2,
        paddingVertical: 5,
        borderRadius: 10,
    },
    inputText: {
        fontSize: 16,
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
        marginTop: 0,
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
    shadowProp: {
        shadowColor: '#e8d5b7',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 8,

    },
    selector: {
        borderColor:baseColor.primary,
        borderWidth:1,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    selectorText: {
        color: baseColor.primary,
        fontSize: 18,
        fontWeight: '600',
    },

});
