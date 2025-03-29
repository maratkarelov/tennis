import {StyleSheet} from 'react-native';
import {baseColor} from "./appTheme";

export default StyleSheet.create({
    whiteBordered: {
        padding: 10,
        backgroundColor: baseColor.white,
        borderRadius: 10,
        borderColor: baseColor.light_gray_2,
        borderWidth: 1,
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    rowSpace: {
        alignItems: 'center',
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
});
