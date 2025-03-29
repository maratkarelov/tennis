import {StyleSheet} from 'react-native';
import {baseColor} from '../../theme/appTheme';

export default StyleSheet.create({
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
